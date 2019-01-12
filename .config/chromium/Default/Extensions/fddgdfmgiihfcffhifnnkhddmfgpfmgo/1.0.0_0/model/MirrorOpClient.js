let PLANE_CLOSED      = 0;
let PLANE_REJECTED    = 1;
let PLANE_OPENED      = 2;
let PLANE_HANDSHAKED  = 3;
let PLANE_READY       = 4;

let ASPECT_TO_FIT     = 0;
let SCALE_TO_FILL     = 1;
let HiddenVideoElement = null;

let EventTimeOut      = 'EventTimeOut';

let EventDisconnect = 'Disconnect';
let EventConnect = 'Connect';
let EventLogin = 'Login';
let EventStartPlay = 'StartPlay';
let EventStopPlay = 'StopPlay';
let EventPausePlay = 'PausePlay';
let EventSetWebSlide = 'SetWebSlide';
let EventChangeQuality = 'ChangeQuality';
let EventChangeContentMode = 'ChangeContentMode';
let EventAddStream = 'AddStream';

var lastEvent = 0;

// 'use strict';
var presenter = presenter || {};
var client = client || {};
var MirrorOpHandler = MirrorOpHandler || {};
var preference = preference || {};
presenter.capturer = null;
presenter.eventTimer = null;

/** event callbacks **/
MirrorOpClientDelegate = function() {};
MirrorOpClientDelegate.prototype.onStatusEvent = null;
MirrorOpClientDelegate.prototype.onDiscoverDeviceEvent = null;
MirrorOpClientDelegate.prototype.onConnectionStatusChangeEvent = null;
MirrorOpClientDelegate.prototype.onMirroringStatusChangeEvent = null;
MirrorOpClientDelegate.prototype.onMirroringParamsChangeEvent = null;
MirrorOpClientDelegate.prototype.onFeatureUpdateEvent = null;
MirrorOpClientDelegate.prototype.onError = null;

// property constructor
MirrorOpDeviceDevice = function() {};
MirrorOpCompositionParams = function() {};

presenter.MirrorOpClient = null;

/** @constructor */
presenter.MirrorOpClient = function() {
  initializMirrorOpHandler();
  presenter.DiscoveryHandler = new presenter.DiscoveryHandler();
};

presenter.MirrorOpClient.prototype.delegate = new MirrorOpClientDelegate();
presenter.MirrorOpClient.prototype.supports4In1 = false;
presenter.MirrorOpClient.prototype.supportsWebSlide = false;
presenter.MirrorOpClient.prototype.supportsCGI = false;
presenter.MirrorOpClient.prototype.isLicensed = false;
presenter.MirrorOpClient.prototype.currentDevice = null;
presenter.MirrorOpClient.prototype.startEventTimer = function(shouldStart, second, callback)
{
  if (presenter.eventTimer) clearTimeout(presenter.eventTimer);
  if (shouldStart)
  {
    second = (typeof(second) === typeof(1)) ? second : 3000;
    callback = (typeof(callback) === typeof(eventTimeout)) ? callback : eventTimeout;
    presenter.eventTimer = setTimeout(callback, second);
  }
};

presenter.MirrorOpClient.prototype.clearTimerEvent = function()
{
  if (presenter.eventTimer) clearTimeout(presenter.eventTimer);
};
presenter.MirrorOpClient.prototype.destroy = function() {
  presenter.DiscoveryHandler.startDiscovery(false);
  presenter.DiscoveryHandler.destroy();
};

presenter.MirrorOpClient.prototype.discoverDevices = function(shouldStart) {
  preference.getFavoriteDeviceList(function(list){
    if (!list || list.length === 0) return;
    var device = null;
    for (var i = 0; i < list.length; i++) {
      device = list[i];
      device.isFavorite = true;
      device.isReachable = false;
      var isConnected = (!client.currentDevice) ? false : (device.ipAddress === client.currentDevice.ipAddress);
      client.delegate.onDiscoverDeviceEvent(device, isConnected);
    }
  });
  presenter.DiscoveryHandler.startDiscovery(true);
};

presenter.MirrorOpClient.prototype.connectToHost = function(address, username) {
  if (!MirrorOpHandler.isReady) console.log("MirrorOpHandler not ready");
  else  {
    lastEvent = EventConnect;
    if (this.isConnected)
      postDisconnect();
    postConnect(address, username);
  }
};

presenter.MirrorOpClient.prototype.login = function(username, passcode) {
  if (!MirrorOpHandler.isReady) console.log("MirrorOpHandler not ready");
  else {
    lastEvent = EventLogin;
    postLogin(username, passcode);
  }
};

presenter.MirrorOpClient.prototype.disconnect = function() {
  lastEvent = EventDisconnect;
  if (!MirrorOpHandler.isReady) console.log("MirrorOpHandler not ready");
  else postDisconnect();
};

presenter.MirrorOpClient.prototype.updateCompositionParams = function(key, value) {
  if (!MirrorOpHandler.isReady) console.log("MirrorOpHandler not ready");
  else {
    console.log('updateCompositionParams??');
  }
};

presenter.MirrorOpClient.prototype.startMirroring = function(split) {
  if (!MirrorOpHandler.isReady) console.log("MirrorOpHandler not ready");
  else {
    lastEvent = EventStartPlay;
    presenter.preferedSplit = split;
    postStartMirroring(split);
  }
};

presenter.MirrorOpClient.prototype.addStream = function(stream) {
  if (!MirrorOpHandler.isReady) console.log("MirrorOpHandler not ready");
  else {
    lastEvent = EventAddStream;
    var streamAlive = (stream.active) ? true : !stream.ended;
    if (stream && streamAlive)
    {
      presenter.preferedStream = stream;
      prepareVideoStream(stream);
    }
    else
    {
      console.log("invalid stream: ", stream);
    }
  }
};

presenter.MirrorOpClient.prototype.stopMirroring = function(split) {
  if (!MirrorOpHandler.isReady) console.log("MirrorOpHandler not ready");
  else {
    lastEvent = EventStopPlay;
    presenter.capturer.stopCapturing();
    postStopMirroring(split);
  }
};

presenter.MirrorOpClient.prototype.sendImage = function(data) {
  console.log("sendImage ??");
};

presenter.MirrorOpClient.prototype.pauseMirroring = function(pausing) {
  if (!MirrorOpHandler.isReady) console.log("MirrorOpHandler not ready");
  else
  {
    lastEvent = EventPausePlay;
    postPauseMirroring(pausing);
  }
};

presenter.MirrorOpClient.prototype.setWebSlide = function(shouldEnable) {
  if (!MirrorOpHandler.isReady) console.log("MirrorOpHandler not ready");
  else if (!client.currentDevice) console.log("No device is connected yet");
  else
  {
    lastEvent = EventSetWebSlide;
    postWebSlide(shouldEnable);
  }
};

presenter.MirrorOpClient.prototype.changeQuality = function(quality) {
  if (!MirrorOpHandler.isReady) console.log("MirrorOpHandler not ready");
  else if (typeof(quality) !== typeof('normal')) console.log("mode is not a string: ", quality);
  else {
    lastEvent = EventChangeQuality;
    quality = (quality === 'normal') ? 0 : 90;
    postMirrorOption(quality, null);
  }
};

presenter.MirrorOpClient.prototype.changeContentMode = function(mode) {
  if (!MirrorOpHandler.isReady) console.log("MirrorOpHandler not ready");
  else if (typeof(mode) !== typeof('fill')) console.log("mode is not a string: ", mode);
  else {
    lastEvent = EventChangeContentMode;
    mode = (mode === 'fill') ? SCALE_TO_FILL : ASPECT_TO_FIT;
    postMirrorOption(null, mode);
  }
};

function initializMirrorOpHandler ()
{
  MirrorOpHandler.isReady = false;
  MirrorOpHandler.nacl = createPluginElement();
  var container = document.getElementById('nacl-container');
  container.appendChild(MirrorOpHandler.nacl);
  MirrorOpHandler.nacl.addEventListener('load', moduleDidLoad, true);
  MirrorOpHandler.nacl.addEventListener('message', handleMessage, true);
}

function createPluginElement() {
  var plugin = (document.createElement('embed')); /** @type {HTMLEmbedElement} */
  plugin.src = '../nacl/mirror_op_client.nmf';
  // plugin.src = 'hello_tutorial.nmf';
  plugin.type = 'application/x-pnacl';
  plugin.width = '0';
  plugin.height = '0';
  return plugin;
}

function moduleDidLoad() {
  MirrorOpHandler.isReady = true;
  if (client.delegate.onStatusEvent)
    client.delegate.onStatusEvent(false);
    
  moLog("NACL module is loaded!!!!!", logInform);
}

function handleMessage(message_event) {
  // console.log(message_event.data);
  var evt = message_event.data.event;
  if (evt)
    moLog(message_event.data, logInform);
  //   console.log(message_event.data);
    
  if (evt === 'channelstatus') {
    HandleChannelStatusEvent(message_event.data.arguments);
  }
  else if (evt === 'mediastatus') {
    HandleMediaStatusEvent(message_event.data.arguments);
  }
  else if (evt === 'mediaparams') {
    HandleMediaParamsEvent(message_event.data.arguments);
  }
  else if (evt === 'error'){
    HandleErrorEvent(message_event.data.arguments);
  }
  else {
    console.log(message_event.data);
  }

}

function HandleChannelStatusEvent(args)
{
  var isCloseed = (args.status === PLANE_CLOSED);
  var isRejected = (args.status === PLANE_REJECTED);
  var isConnected = (args.status === PLANE_OPENED);
  var isHandshaked = (args.status === PLANE_HANDSHAKED);
  var isReady = (args.status === PLANE_READY);
  client.canStart = (isReady);
  if (isConnected)
  {
    client.isConnected = true;
  }
  else if (isCloseed)
  {
    resetClientInstance();
  }
  else if (isHandshaked) {
    if (!client.currentDevice)
      client.currentDevice = new MirrorOpDeviceDevice();

    client.currentDevice.isReachable = true;
    client.currentDevice.requiresPassword = (args.code_length > 0);
    client.currentDevice.codeLength = args.code_length;
    client.currentDevice.codeType = args.code_type;
    client.currentDevice.ssidName = args.wifi_ssid;
    client.currentDevice.ipAddress = args.ip_address;
    client.currentDevice.status = args.status;
    var caps = args.capabilities;
    if (caps)
    {
      client.supportsOneToMany  = caps.onetomany;
      client.supports4in1       = caps.fourinone;
      client.supportsCGI        = caps.cgi;
      client.isLicensed         = caps.licensed;
    }
  }
  
  if (client.delegate.onConnectionStatusChangeEvent)
    client.delegate.onConnectionStatusChangeEvent(args.status);
}
function HandleMediaStatusEvent(args)
{
  client.isMirroring = (args.status === 1);
  if (client.delegate.onMirroringStatusChangeEvent)
    client.delegate.onMirroringStatusChangeEvent(args.status);
}
function HandleMediaParamsEvent(args)
{
  if (!client.compositionParams)
    client.compositionParams  = new MirrorOpCompositionParams();

  client.compositionParams.isPaused = args.pause;
  client.compositionParams.outputCodec = args.codec;
  client.compositionParams.outputLayout = args.layoutpos;
  client.compositionParams.outputWidth = args.width;
  client.compositionParams.outputHeight = args.height;

  if (client.delegate.onMirroringParamsChangeEvent)
    client.delegate.onMirroringParamsChangeEvent(args.status);
}

function HandleErrorEvent(args)
{
  var errorCode = args.errorcode;
  if (errorCode === -9997) {
    resetClientInstance();
    if (client.delegate.onMirroringStatusChangeEvent)
      client.delegate.onMirroringStatusChangeEvent(0);
    if (client.delegate.onConnectionStatusChangeEvent)
      client.delegate.onConnectionStatusChangeEvent(0);
  }
  if (errorCode === -9987) { // Not Support Audio
    console.log("Audio not Supported");
    return; 
  }
  if (client.delegate.onError)
    client.delegate.onError(errorCode);
}

function resetClientInstance()
{
  client.isConnected        = false;
  client.isMirroring        = false;
  client.supportsOneToMany  = false;
  client.supports4in1       = false;
  client.supportsCGI        = false;
  client.isLicensed         = false;
  client.currentDevice      = null;
}

function postConnect(address, username, pincode) {
  username = username || "Unkonwn User";
  pincode = pincode || "";
  MirrorOpHandler.nacl.postMessage({
    request: 'connect',
    arguments: {
      ip_address: address,
      user_name: username,
      login_code: pincode
    }
  });
}
function postDisconnect() {
  MirrorOpHandler.nacl.postMessage({
    request: 'disconnect'
  });
}

function postLogin(username, pincode) {
  MirrorOpHandler.nacl.postMessage({
    request: 'login',
    arguments: {
      user_name: username,
      login_code: pincode
    }
  });
}

function postStartMirroring(pos) {
  if (typeof(pos) !== typeof(0)) pos = 0;
  var codec = presenter.Settings.preferedCodec;
  if (typeof(codec) !== typeof(0)) codec = 0;
  var width = presenter.Settings.preferedWidth;
  var height = presenter.Settings.preferedHeight;
  if (typeof(width) !== typeof(0)) width = 0;
  if (typeof(height) !== typeof(0)) height = 0;
  
  MirrorOpHandler.nacl.postMessage({
    request: 'startplay',
    arguments: {
      codec: 1,
      layoutpos: pos,
      width: width,
      height: height
    }
  });
}

function postAddStream(stream, videoWidth, videoHeight) {
  if (!stream) return;
  if (typeof(videoWidth) !== typeof(0)) videoWidth = 0;
  if (typeof(videoHeight) !== typeof(0)) videoHeight = 0;
  
  MirrorOpHandler.nacl.postMessage({
    request: 'addstream',
    arguments: {
      video_width: videoWidth,
      video_height: videoHeight,
      vtrack: stream.getVideoTracks()[0],
      atrack: stream.getAudioTracks()[0]
    }
  });
}

function postStopMirroring() {
  client.isPaused = false;
  MirrorOpHandler.nacl.postMessage({
    request: 'stopplay'
  });
}

function postPauseMirroring(pausing) {
  client.isPaused = pausing;
  MirrorOpHandler.nacl.postMessage({
    request: 'pauseplay',
    arguments: {
      pause: pausing
    }
  });
}

function postWebSlide(enabled) {
  MirrorOpHandler.nacl.postMessage({
    request: 'webslide',
    arguments: {
      enable: enabled
    }
  });
}

function postMirrorOption(quality, mode) {
  MirrorOpHandler.nacl.postMessage({
    request: 'mirroroption',
    arguments: {
      quality: quality,
      content_mode: mode
    }
  });
}

function busyWithMessage(msg) {
  if (client.delegate.onStatusEvent)
    client.delegate.onStatusEvent(true, msg);
}

function prepareVideoStream(stream) {
  if (!HiddenVideoElement) {
    HiddenVideoElement = document.createElement('video');
    HiddenVideoElement.addEventListener( "loadedmetadata", function (e) {
      var stream = presenter.preferedStream;
      postAddStream(stream, HiddenVideoElement.videoWidth, HiddenVideoElement.videoHeight);
    }, false );
  }
  HiddenVideoElement.src = URL.createObjectURL(stream);
}

function eventTimeout()
{
  if (client.delegate.onError)
    client.delegate.onError(lastEvent + " timed out");
}

/** static **/
presenter.stringFromSplit = function (split) {
  var strSplit = 'Display_FS';
  if (split === 1) {
    strSplit = 'Display_TF';
  }
  else if (split === 2) {
    strSplit = 'Display_TR';
  }
  else if (split === 3) {
    strSplit = 'Display_BF';
  }
  else if (split === 4) {
    strSplit = 'Display_BR';
  }
  return strSplit;
};
