var presenter = presenter || {};
var client = client || null;
var DiscoveryModule = DiscoveryModule || {};
var discoveryToken = 'WPPS';
var startOnReady = false;

DiscoveredDevice = function (buffer){
  this.isDevice = false;
  this.resBuffer = buffer;
  this.announceId = arrayBufferToString(this.consumeBuffer(4).buffer);
  if (this.announceId !== 'AWPP') return;
  this.isDevice = true;
  this.ipAddress = this.consumeBuffer(4);
  // this.ipAddress = ipAddressFromBufferArray(this.consumeBuffer(4), '.');
  this.cmdPort = int16FromBuffer(this.consumeBuffer(2).buffer);    // default: 3268
  this.dataPort = int16FromBuffer(this.consumeBuffer(2).buffer);    // default: 8080
  this.videoPort = int16FromBuffer(this.consumeBuffer(2).buffer);  // default: 1041  
  this.remotePort = int16FromBuffer(this.consumeBuffer(2).buffer);  // eg.    : 9996
  this.ssidName = arrayBufferToString(this.consumeBuffer(40).buffer);  // terminated by null
  this.model = this.consumeBuffer(32);
  this.protocolVersion = this.consumeBuffer(2); // 0x01, 0x1AdeviceFromBuffer
  this.transport = this.consumeBuffer(1)[0]; // 1 = TCP, 2 = UDP, 3 = Raw Sockets
  this.macAddress = this.consumeBuffer(6);
  this.disableLoginCode = this.consumeBuffer(1)[0]; // 1 = disable, 0 = enable;
  this.customDeviceName = arrayBufferToString(this.consumeBuffer(16).buffer); // terminated by null;
  this.customDeviceName = this.customDeviceName.replace(/[^\x20-\x7E]+/g, '');
  this.deviceVersion = arrayBufferToString(this.consumeBuffer(4).buffer);
  this.modelFilter = this.consumeBuffer(2);
  this.modelConfig = this.consumeBuffer(1)[0];
  this.reserved = this.consumeBuffer(7);
  this.isReachable = false;
  this.isFavorite = false;
  
  this.ssidName = this.ssidName.split("\0").shift().replace(/[^\x20-\x7E]+/g, '');
  if (!this.ssidName || this.ssidName.length === 0)
  {
    this.ssidName = this.customDeviceName;
  }
};

DiscoveredDevice.prototype.consumeBuffer = function(size)
{
  var consumedBuffer = new Uint8Array(this.resBuffer.slice(0, size));
  this.resBuffer = this.resBuffer.slice(size);
  return consumedBuffer;
};

DiscoveryModule = function (){};
DiscoveryModule.prototype.initialize = function(){
  this.addressList = [];
  this.socket = new UdpClient('DiscoverSocket');
  this.socket.delegate.onError = function(error, errorCode) {
    // console.log(error);
    if (Number(errorCode) === -109) {
      // this._log('NET::ADDRESS_UNREACHABLE' + '(' + errorCode +')', logInform);
    }
    else if (Number(errorCode) === -1) {
      // this._log('NET::IO_PENDING' + '(' + errorCode +')', logWarning);
    }
    else if (Number(errorCode) === -105) {
      // this._log('NET::NAME_NOT_RESOLVED' + '(' + errorCode +')', logWarning);
    }
    else if (Number(errorCode) === -10) {
      // this._log('NET::ACCESS_DENIED' + '(' + errorCode +')', logWarning);
    }
    else {
      console.log(error);
      // this._error(error);
    }
  }.bind(this);
  
  this.socket.delegate.onBindCompleted = onDiscoverySocketReady;
  this.socket.create('0.0.0.0', 1047);
};

presenter.DiscoveryHandler = function (){
  DiscoveryModule = new DiscoveryModule();
  DiscoveryModule.initialize();
  DiscoveryModule.isReady = false;
};

presenter.DiscoveryHandler.prototype.destroy = function (){
  DiscoveryModule.isReady = false;
  DiscoveryModule.socket.close();
};

presenter.DiscoveryHandler.prototype.startDiscovery = function(shouldStart){
  // chrome.sockets.udp.create({}, function(s){
  //   chrome.sockets.udp.bind(s.socketId, '0.0.0.0', 1049, function(ret){
  //     chrome.sockets.udp.setBroadcast(s.socketId, true, function(ret){
  //     chrome.sockets.udp.onReceive.addListener(onUDPReceive);
  //       console.log(ret, s.socketId, discoveryToken);
  //       _stringToArrayBuffer(discoveryToken, function(arrayBuffer) {
  //         chrome.sockets.udp.send(s.socketId, arrayBuffer, "255.255.255.255", 1049, function(sendinfo){
  //           console.log(sendinfo);
  //         });
  //       });  
  //     });
  //   });
  // });
  DiscoveryModule.addressList = [];
  if (shouldStart) 
  {
    if (!DiscoveryModule.isReady) {
      startOnReady = true;
      return;
    }
    
    DiscoveryModule.socket.supportsBraodCast(function (supports)
    {
      if (supports) 
      {
        console.log("Not supports UDP broadcast");
        var portList = [1047, 1048, 1049];
        var i = 0;
        do 
        {
          DiscoveryModule.socket.broadcastMessageAtPort(discoveryToken, portList[i]);
          if (chrome.runtime.lastError) {
            var errorMsg = chrome.runtime.lastError.message;
            console.log("[E] >>> ", errorMsg);
            chrome.system.network.getNetworkInterfaces(_gotNetworkInterfaces);
            break;
          }
          i++;
        } while (i < 3);
      }
      else
      {
        moLog("Not supports UDP broadcast", logWarning);
        chrome.system.network.getNetworkInterfaces(_gotNetworkInterfaces);
      }
    });
  }
};

function onUDPReceive(recvInfo)
{
  console.log(recvInfo);
}

function checkClient()
{
  if (!client) {
    client = presenter.MirrorOpClient;
  }
}

function onDiscoverySocketReady()
{
  DiscoveryModule.isReady = true;
  DiscoveryModule.socket.delegate.didRecv = onDiscoverDeviceInfo;
  if (startOnReady)
  {
    startOnReady = false;
    presenter.DiscoveryHandler.startDiscovery(true);
  }
}

function onDiscoverDeviceInfo(rcvInfo)
{
  checkClient();
  if (rcvInfo.remoteAddress === '0.0.0.0') { //HTTLauncher??
    console.log("Unexpected Address: " + rcvInfo.remoteAddress, logInform);
  }
  else {
    if (_isNewDeviceAtAddress(rcvInfo.remoteAddress)){
      var device = new DiscoveredDevice(rcvInfo.data);
      if (!device.isDevice) return;
      device.ipAddress = rcvInfo.remoteAddress;
      device.isReachable = true;
      client.delegate.onDiscoverDeviceEvent(device);
    }
  }
}

function _isNewDeviceAtAddress(address) {
  var found = $.inArray(address, DiscoveryModule.addressList) > -1;
  return !found;
}

function _gotNetworkInterfaces(networkInterfaces) {
  var candidates = [];
  var uniqueDomain = [];
  
  for(idx = 0; idx < networkInterfaces.length; idx++){
    if(_validateIpAddress(networkInterfaces[idx].address)){
      // chromebook packaged app denies broadcast access...
      var split = networkInterfaces[idx].address.split( '.', 3 ).join('.');
      if($.inArray(split, uniqueDomain) === -1) uniqueDomain.push(split);
    }
  }
  
  // var ipAddress = uniqueDomain[0] + '.' + 255;
  // var ipAddress = '10.102.255.255';
  // var ipAddress = '255.255.255.255';
  var ipAddress = '127.255.255.255';
  // console.log(ipAddress);
  // DiscoveryModule.socket.sendMessage(discoveryToken, ipAddress, 1047);
  for(idx = 0; idx < uniqueDomain.length; idx++) {
    for (var i = 1; i < 255; i++) { // loop through 1 ~ 254
      ipAddress = uniqueDomain[idx] + '.' + i;
      DiscoveryModule.socket.sendMessage(discoveryToken, ipAddress, 1048);
      candidates.push(ipAddress);
    }
  }
}

function _validateIpAddress(address) {
  if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(address))  
  {  
    return (true);
  } 
  return (false);
}
