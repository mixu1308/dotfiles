function TcpClientCallbacks(){}
TcpClientCallbacks.prototype.onCreate = null;

function TcpClientDelegate(){}
TcpClientDelegate.prototype.didConnect = null;
TcpClientDelegate.prototype.didDisconnect = null;
TcpClientDelegate.prototype.didRecv = null;
TcpClientDelegate.prototype.didSend = null;
TcpClientDelegate.prototype.onConnectionRefused = null;
TcpClientDelegate.prototype.onError = null; 
TcpClientDelegate.prototype.onErrorCode = null; 

function TcpClient(name) {
  this.name = name;
  this.delegate = new TcpClientDelegate();
  this.callbacks = new TcpClientCallbacks();
}

TcpClient.prototype.m_tcp = chrome.sockets.tcp;
TcpClient.prototype.name = null;
TcpClient.prototype.host = null;
TcpClient.prototype.port = null;
TcpClient.prototype.socketId = null;
TcpClient.prototype.isConnected = false;
TcpClient.prototype.create = function(callback) {
  this.callbacks.onCreate = callback;
  this.m_tcp.create({}, callback); 
};

TcpClient.prototype.connect = function(address, port) {
  if (!this.socketId || this.socketId < 0) {
    this.create(function(createInfo){
      this.socketId = createInfo.socketId;
      if (this.socketId) {
        _connectToAddress.bind(this)(address, port);
      }
      else {
        var errorMsg = "Unable to create socket: ";
        if (chrome.runtime.lastError) errorMsg += chrome.runtime.lastError.message;
        this.checkErrorMsg(errorMsg);
      }
    }.bind(this));
  }
  else {
    if (this.isConnected) {
      this.reconnect(address, port);
    }
    else {
      _connectToAddress.bind(this)(address, port);
    }
  }
};

TcpClient.prototype.reconnect = function(address, port) {
  this.m_tcp.disconnect(this.socketId, function() {
    _connectToAddress.bind(this)(address, port);
  }.bind(this));
};
    
TcpClient.prototype.onConnectComplete = function(resultCode) {
  var errorMsg = null;
  if (resultCode === -102) {// ERR_CONNECTION_REFUSED 
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message + ' for ' + this.host + ":" + this.port);
    }
    if (this.delegate.onConnectionRefused) {
      this.delegate.onConnectionRefused(this.host, this.port);
      return;
    }
  }
  var success = resultCode >= 0;
  if (!success) {
    errorMsg = ('Unable to connect to ' + this.address + ":" + this.port);
    this.checkErrorMsg(errorMsg);
    this.disconnect();
  }
  else {
    if (!this.isConnected) {
      this.isConnected = true;
      /** start keep alive **/
      this.m_tcp.setKeepAlive(this.socketId, true, 10, function(){});
      this.m_tcp.setNoDelay(this.socketId, true, function() {});
      this.m_tcp.setPaused(this.socketId, false, function() {});
      
      /** Start listening events **/
      this.m_tcp.onReceive.addListener(this._onReceive.bind(this));
      this.m_tcp.onReceiveError.addListener(this._onReceiveError.bind(this));
    }
    this.m_tcp.getInfo(this.socketId, this.onGetInfo.bind(this));
  }
};

TcpClient.prototype.onGetInfo = function(result) {
    if (this.delegate.didConnect)
      this.delegate.didConnect(result.peerAddress, this.port);
};

    
TcpClient.prototype.sendMessage = function(msg) {
  _stringToArrayBuffer.bind(this)(msg, function(arratBuffer) {
    this.sendBuffer(arrayBuffer, callback);
  }.bind(this));
};
    
TcpClient.prototype.sendBuffer = function(buffer) {
  // try{
    this.m_tcp.send(this.socketId, buffer, this.onSendComplete.bind(this));
  // }catch(err){
  //   var errorMsg = null;
  //   if (chrome.runtime.lastError) {
  //     errorMsg = chrome.runtime.lastError.message;
  //     console.log(errorMsg);
  //   }
  // }
};
    
TcpClient.prototype.onSendComplete = function(sendInfo) {
  var errorMsg = null;
  if (chrome.runtime.lastError) {
    errorMsg = chrome.runtime.lastError.message;
    console.log(errorMsg);
  }
  if (this.delegate.didSend) {
    this.delegate.didSend(sendInfo);
  }
};
    
TcpClient.prototype.disconnect = function() {
  this.isConnected = false;
  this.m_tcp.onReceive.removeListener(this._onReceive.bind(this));
  this.m_tcp.onReceiveError.removeListener(this._onReceiveError.bind(this));
  if (this.socketId) {
    this.m_tcp.disconnect(this.socketId, function() {
      this.socketId = null;
      if (chrome.runtime.lastError) {
        // console.log(chrome.runtime.lastError.message); //ignore
      }
      if (this.delegate.didDisconnect) {
        this.delegate.didDisconnect();
      }
    }.bind(this));
  }
  else {
    if (this.delegate.didDisconnect) {
      this.delegate.didDisconnect();
    }
  }
};
    
TcpClient.prototype.closeSocket = function(){
  if (this.socketId) {
    try{
      this.m_tcp.close(this.socketId, function(){
        if (chrome.runtime.lastError) {
          // console.log(chrome.runtime.lastError.message); //ignore;
        }
      });
    }catch(err){
      if (chrome.runtime.lastError) {
        // console.log(chrome.runtime.lastError.message); ignore
      }
    }
  }
  this.socketId = null;
};
    
TcpClient.prototype._onReceive = function(receiveInfo) {
  // filter out any other socket's info
  if (receiveInfo.socketId === this.socketId) {
    if (this.delegate.didRecv) {
      this.delegate.didRecv(receiveInfo);
    }
  }
};
    
TcpClient.prototype._onReceiveError = function(error) {
  if (error.socketId === this.socketId) {
    if ((error.resultCode === -100) ) { // CONNECTION_CLOSED Closed by peer.
      console.log(error);
      if (this.delegate.didDisconnect) {
        this.delegate.didDisconnect();
      }
    }
    else {
      var msg = error.socketId + "-onReceiveError (" + error.resultCode + ")";
      this.checkErrorMsg(msg);
    }
  }
};
    
TcpClient.prototype.checkErrorMsg = function(errorMsg) {
  if (chrome.runtime.lastError) {
    errorMsg = chrome.runtime.lastError.message;
  }
  
  if (errorMsg) {
    if (this.delegate.onError) {
      this.delegate.onError(errorMsg.replace("net::", ""));
    }
  }
};
function _connectToAddress(address, port) {
  this.host = address;
  this.port = port;
  try{
    this.m_tcp.connect(this.socketId, address, port, this.onConnectComplete.bind(this));
  }catch(err){
    var errorMsg = "Failed to connect: " + address + ":" + port;
    if (chrome.runtime.lastError) {
      if (chrome.runtime.lastError) errorMsg += chrome.runtime.lastError.message;
    }
    this.checkErrorMsg(errorMsg);
  }
}

function _arrayBufferToString(buf, callback) {
  var str = String.fromCharCode.apply(null, new Uint8Array(buf));
  if (callback) {
    callback(str);
  }
  return str;
}

function  _stringToArrayBuffer(str, callback) {
  var buffer = new ArrayBuffer(str.length);
  var view = new Uint8Array(buffer);
  for(var i = 0; i < str.length; i++) {
    view[i] = str.charCodeAt(i);
  }
  if (callback) {
    callback(buffer);
  }
  return buffer;
}
