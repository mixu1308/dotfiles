
$(function(){
  var preferenceWindow = chrome.app.window.get('preference');
  
  $(document).ready(function() {
    
    preferenceWindow.onClosed.addListener(function (){
      chrome.runtime.sendMessage({action:'closePerformance'});
    });
  });
  
  function updatePerformance(performance){
    var str = '<p>imageCount: ' + performance.imageCount + '</p>' +
                  '<p>imageSize (px): ' + performance.imageSize.width + " * " + performance.imageSize.height + '</p>' +
                  '<p>bufferSize (bytes): {' + '</p>' + 
                  '<p class="layer1">all: ' + performance.bufferSize.all + '</p>' + 
                  '<p class="layer1">max: ' + performance.bufferSize.max + '</p>' +
                  '<p class="layer1">min: ' + performance.bufferSize.min + '</p>' + 
                  '<p class="layer1">ave: ' + performance.bufferSize.ave + '</p><p>}</p>' + 
                  '<p>imageProcessingTime (ms): {' + '</p>' + 
                  '<p class="layer1">all: ' + performance.imageProcessingTime.all + '</p>' + 
                  '<p class="layer1">max: ' + performance.imageProcessingTime.max + '</p>' + 
                  '<p class="layer1">min: ' + performance.imageProcessingTime.min + '</p>' + 
                  '<p class="layer1">ave: ' + performance.imageProcessingTime.ave + '</p><p>}</p>' + 
                  '<p>socketCommandTime (ms): {' + '</p>' + 
                  '<p class="layer1">all: ' + performance.socketCommandTime.all + '</p>' + 
                  '<p class="layer1">max: ' + performance.socketCommandTime.max + '</p>' + 
                  '<p class="layer1">min: ' + performance.socketCommandTime.min + '</p>' + 
                  '<p class="layer1">ave: ' + performance.socketCommandTime.ave + '</p><p>}</p>';
    		$("#logContainer").html(str);
  }
  
  chrome.runtime.onMessage.addListener(function(message, sender, callback){
    if (message.action === 'showPerformance') {
      var performance = message.value;
      updatePerformance(performance);
    }
  });

});