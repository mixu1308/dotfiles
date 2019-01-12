(function(exports) {
  
  function UdpClient(name) {
    this.m_udp = chrome.sockets.udp;
    this.name = name;
    this.host = '0.0.0.0';
    this.port = 0;
    this.token = null;
    this.duration = 0;
    // Socket.
    this.socketId = null;
    this.isConnected = false;
    
    this._onReceive = this._onReceive.bind(this);
    this._onReceiveError = this._onReceiveError.bind(this);

    // Callback functions.
    this.delegate = {
      onBindCompleted: null,
      discovered: null,    // Called when socket is connected.
      didClose: null,      // Called when socket is disconnected.
      didRecv: null,       // Called when client receives data from server.
      didSend: null,        // Called when client sends data to server.
      onLog: null,
      onError: null
    };
    
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
  
  UdpClient.prototype = {
    create: function(address, port) {
      this.host = (address) ? address : this.host;
      this.port = (port) ? port : this.port;
      this.m_udp.create({}, this.onCreateComplete.bind(this));   
    },
    onCreateComplete: function(createInfo) {
      var errorMsg = null;
      if (chrome.runtime.lastError) {
        errorMsg = ('Unable to create socket: ' + chrome.runtime.lastError.message);
        this.checkErrorMsg(errorMsg);
        return;
      }
      else {
        this.socketId = createInfo.socketId;
      }
      this.m_udp.bind(this.socketId, this.host, this.port, this.onBindComplete.bind(this));
    },
    onBindComplete: function(){
      // chrome.sockets.udp.setBroadcast
      // Start listening to message events.
      chrome.sockets.udp.setBroadcast(this.socketId, true, this.onSetBroadcast.bind(this));
      chrome.sockets.udp.onReceive.addListener(this._onReceive);
      chrome.sockets.udp.onReceiveError.addListener(this._onReceiveError);
      if (this.delegate.onBindCompleted) {
        this.delegate.onBindCompleted();
      }
    },
    onSetBroadcast: function (result) {
      if (result < 0)
      {
        if (this.delegate.onError)
          this.delegate.onError(result);
        else
          console.log(result);
      } 
    },
    
    supportsBraodCast: function (callback) {
      if (!this.socketId) return;
      _stringToArrayBuffer('YOYO MirrorOp', function(arrayBuffer) {
        chrome.sockets.udp.send(this.socketId, arrayBuffer, '255.255.255.255', 1047, function(sendInfo)
        {
          var supported = (chrome.runtime.lastError) ? false : true;
          if (callback)
            callback(supported);
        });
      }.bind(this));
    },
    
    broadcastMessageAtPort: function (msg, port) {
      this.sendMessage(msg, '255.255.255.255', port);
    },
    
    sendMessage: function(msg, address, port) {
      _stringToArrayBuffer(msg, function(arrayBuffer) {
        this.sendBuffer(address, port, arrayBuffer);
      }.bind(this));
    },
    
    sendBuffer: function(address, port, buffer) {
      if (!this.socketId) return;
      try{
        this.m_udp.send(this.socketId, buffer, address, port, this.onSendComplete.bind(this));
      }catch(err){
        var errorMsg = err;
        if (chrome.runtime.lastError) {
          errorMsg = chrome.runtime.lastError.message;
        }
        console.log(errorMsg);
      }
    },
    
    onSendComplete: function(sendInfo) {
      var errorMsg = null;
      if (chrome.runtime.lastError) 
      {
        console.log(chrome.runtime.lastError.message);
      }
    },
    
    
    close: function() {
      chrome.sockets.udp.onReceive.removeListener(this._onReceive);
      chrome.sockets.udp.onReceiveError.removeListener(this._onReceiveError);
      chrome.sockets.udp.close(this.socketId);
      this.socketId = null;
      this.isConnected = false;
  
      if (this.delegate.didClose) {
        this.delegate.didClose();
      }
    },
    
    _onReceive: function(receiveInfo) {
      if (receiveInfo.socketId != this.socketId)
        return;
      else {
        if (this.delegate.didRecv) {
          this.delegate.didRecv(receiveInfo);
        }
      }
    },
    _onReceiveError: function(error) {
      if (error.socketId === this.socketId) {
        if ((error.resultCode === -101) ) {  // CONNECTION_RESET
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
    },
    
    checkErrorMsg: function(errorMsg) {
      if (chrome.runtime.lastError) {
        errorMsg = chrome.runtime.lastError.message;
        console.log(errorMsg);
      }
      
      if (errorMsg) {
        if (this.delegate.onError) {
          this.delegate.onError(errorMsg.replace("net::", ""));
        }
      }
    }
  };
  

  exports.UdpClient = UdpClient;

})(window);
