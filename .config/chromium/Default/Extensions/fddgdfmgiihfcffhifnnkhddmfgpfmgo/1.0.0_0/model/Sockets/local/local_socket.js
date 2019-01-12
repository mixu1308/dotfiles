(function(exports) {
  
  function LocalClient(port) {
    this.host = '127.0.0.1';
    this.port = port;
    this.localServerId = 0;
    this.localSocketId = 0;
    this._onReceive = this._onReceive.bind(this);
    this._onReceiveError = this._onReceiveError.bind(this);

    // Callback functions.
    this.callbacks = {
      connect: null,    // Called when socket is connected.
      disconnect: null, // Called when socket is disconnected.
      recv: null,       // Called when client receives data from server.
      sent: null        // Called when client sends data to server.
    };

    // Socket.
    this.socketId = null;
    this.isConnected = false;
    log('initializing local client...');
    chrome.sockets.tcpServer.create({name:"chrome-local-tcp-server", persistent:true}, 
        this._onCreate.bind(this));
  }
  
  LocalClient.prototype.sendMessage = function(msg, callback) {
    // Register sent callback.
    this.callbacks.sent = callback;
    this._stringToArrayBuffer(msg + '\n', function(arrayBuffer) {
      chrome.sockets.tcp.send(this.localSocketId, arrayBuffer, this._onSendComplete.bind(this));
    }.bind(this));
  };

  LocalClient.prototype.addLocalMessageListener = function(callback) {
    // Register received callback.
    this.callbacks.recv = callback;
  };

  LocalClient.prototype.disconnect = function() {
    chrome.sockets.tcp.onReceive.removeListener(this._onReceive);
    chrome.sockets.tcp.onReceiveError.removeListener(this._onReceiveError);
    chrome.sockets.tcp.disconnect(this.socketId);
    chrome.sockets.tcp.close(this.socketId);
    this.socketId = null;
    this.isConnected = false;
  };

  LocalClient.prototype._onCreate = function(createInfo) {
    this.localServerId = createInfo.socketId;
    chrome.sockets.tcpServer.listen(this.localServerId, this.host, this.port, function(resultCode) {
      console.log('onListenCallback ' + resultCode);
      if (resultCode < 0) {
        console.log("Error listening:" +
          chrome.runtime.lastError.message);
        return;
      }
      chrome.sockets.tcpServer.onAccept.addListener(this._onAccept.bind(this));
    }.bind(this));
    
    chrome.sockets.tcp.create({}, function(createInfo) {
        this.localSocketId = createInfo.socketId;
        chrome.sockets.tcp.connect(this.localSocketId, "127.0.0.1", 1045, function(resultCode) {
            chrome.sockets.tcp.onReceiveError.addListener(function(info){
                console.log('Unable to receive data from socket: ' + info.resultCode);
            });
            console.log('initialized local client...');
        }.bind(this));
    }.bind(this));
  };

  LocalClient.prototype._onAccept = function(info) {
    console.log('onAccept ' + info.clientSocketId);
    if (info.socketId != this.localServerId)
      return;
      
    // Start receiving data.
    chrome.sockets.tcp.onReceive.addListener(function(recvInfo) {
      if (recvInfo.socketId != info.clientSocketId)
        return;
      // recvInfo.data is an arrayBuffer.
      this._arrayBufferToString(recvInfo.data, function(str){
        console.log("rcvInfo str: " + str);
      }.bind(this));
    }.bind(this));
    chrome.sockets.tcp.setPaused(info.clientSocketId, false, function(resultCode){});
  };
  
  LocalClient.prototype._onReceive = function(receiveInfo) {
    if (receiveInfo.socketId != this.socketId)
      return;

    if (this.callbacks.recv) {
      log('onDataRead');
      // Convert ArrayBuffer to string.
      this._arrayBufferToString(receiveInfo.data, function(str) {
        this.callbacks.recv(str);
      }.bind(this));
    }
  };

  LocalClient.prototype._onReceiveError = function(info) {
    if (info.socketId != this.socketId)
      return;

    error('Unable to receive data from socket: ' + info.resultCode);
  };

  LocalClient.prototype._onSendComplete = function(sendInfo) {
    log('onSendComplete');
    // Call sent callback.
    if (this.callbacks.sent) {
      this.callbacks.sent(sendInfo);
    }
  };

  LocalClient.prototype._arrayBufferToString = function(buf, callback) {
    var reader = new FileReader();
    reader.onload = function(e) {
      callback(e.target.result);
    };
    var blob=new Blob([ buf ], { type: 'application/octet-stream' });
    reader.readAsText(blob);
  };

  LocalClient.prototype._stringToArrayBuffer = function(str, callback) {
    var bb = new Blob([str]);
    var f = new FileReader();
    f.onload = function(e) {
       callback(e.target.result);
    };
    f.readAsArrayBuffer(bb);
  };


  /**
   * Wrapper function for logging
   */
  function log(msg) {
    console.log(msg);
  }

  /**
   * Wrapper function for error logging
   */
  function error(msg) {
    console.error(msg);
  }

  exports.LocalClient = LocalClient;

})(window);
