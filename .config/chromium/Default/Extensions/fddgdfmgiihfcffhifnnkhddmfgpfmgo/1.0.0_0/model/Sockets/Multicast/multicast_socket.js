
(function(exports) {
  function MulticastClient(name) {
    this.name = name;
    this.socketId = null;
    this.groupAddress = null;
    this.groupPort = 3038;
    this.address = '0.0.0.0';
    this.port = 0;
    // var kIP = "237.132.123.123";
    // var kPort = 3038;
    this.delegate = {
      
    };
    
    this.callbacks = {
      
    };
  }
  // multicast addresses is from 224.0.0.0 to 239.255.255.255
  MulticastClient.prototype = {
    connect: function(ipAddress, callback) {
      var me = this;
      chrome.sockets.udp.create({bufferSize: 1024 * 1024}, function (createInfo) {
        var socketId = createInfo.socketId;
        var ttl = 12;
        chrome.sockets.udp.setMulticastTimeToLive(socketId, ttl, function (result) {
          if (result !== 0) {
            console.log("Set TTL Error: ", "Unknown error");
          }
          chrome.sockets.udp.bind(socketId, "0.0.0.0", me.port, function (result) {
            if (result !== 0) {
              chrome.sockets.udp.close(socketId, function () {
                console.log("Error on bind(): ", result);
              });
            } else {
              chrome.sockets.udp.joinGroup(socketId, me.address, function (result) {
                if (result !== 0) {
                  chrome.sockets.udp.close(socketId, function () {
                    console.log("Error on joinGroup(): ", result);
                  });
                } else {
                  me.socketId = socketId;
                  chrome.sockets.udp.onReceive.addListener(me.onReceive.bind(me));
                  chrome.sockets.udp.onReceiveError.addListener(me.onReceiveError.bind(me));
                  me.onConnected();
                  if (callback) {
                    callback.call(me);
                  }
                }
              });
            }
          });
        });
      });
    },
    
    disconnect: function() {
      chrome.sockets.udp.close(this.socketId);
      this.socketId = null;
    },
    
    sendMessage: function(message, callback) {
      this._stringToArrayBuffer(message, function(buffer){
        this.sendBuffer(buffer);
      }.bind(this));
    },
    
    sendBuffer: function(buffer, callback) {
      chrome.sockets.udp.send(this.socketId, buffer, this.groupAddress,
          this.groupPort, function(sendInfo) {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError);
        } 
        else {
          console.log('sent');
        }
      }.bind(this));
    },
    
    _arrayBufferToString: function(buf, callback) {
      var str = String.fromCharCode.apply(null, new Uint8Array(buf));
      if (callback) {
        callback(str);
      }
      return str;
    },

    _stringToArrayBuffer: function(str, callback) {
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
  };
  

  exports.MulticastClient = MulticastClient;

})(window);
