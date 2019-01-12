$(function(){
  var videoWidth = 0;
  var videoHeight = 0;
  chrome.runtime.onMessage.addListener(function(message, sender, callback){
    if (message.action === 'getStreamURL') {
      var streamURL = message.value;
          
    // this.videoElement = document.createElement('video');
    // this.videoElement.src = URL.createObjectURL(stream);
    // this.videoElement.onloadedmetadata = function(event) {
    //   this.callbacks.onStartCapturing();
    //   this._initializeVideoCanvas();
    // }.bind(this);
    // this.videoElement.play();
    
    
      $('#local_video').attr('src', streamURL);
      $('#local_video')[0].onloadedmetadata = function(event) {
        videoWidth = this.videoWidth;
        videoHeight = this.videoHeight;
        
      };
    
      $('#local_video')[0].play();
    }
    else if (message.action === 'preferenceUpdated') {
      var info = message.value;
      if (info.key === 'mirrorRatio') {
        var aspectToFit = (info.value === 'keepAspectRatio');
        console.log(info);
        if (aspectToFit) {
          $('#local_video').width(1024);
          $('#local_video').height(768);
        }
        else {
          $('#local_video').width(videoWidth);
          $('#local_video').height(videoHeight);
        }
      }
    }
  });
  
});