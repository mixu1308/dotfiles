// var presenter = presenter || {};

// function createMainWindow() {
//   chrome.app.window.create('view/main.html', 
//     {
//       id: 'main',
//       frame: 'none',
//     	outerBounds: {
//     	  left: 0,
//     	  top: 0,
//     	  width: 375,
//     	  height: 500,
//     	},
//     	resizable: false,
//     	focused: true,
//     }
//   );
// }

// (function(){

// 'use strict';

// var BackgroundPage = function() {
//   // this.preInit_();
// };

// BackgroundPage.prototype.preInit_ = function() {
//   // presenter.settings = new presenter.Settings();
//   // presenter.mirrorOpClient = new presenter.MirrorOpClient();
// };

// window.addEventListener('load', function() {
//   // presenter.backgroundPage = new BackgroundPage();
//   createMainWindow();
// }, false);

// }());


function createMainWindow() {
  chrome.app.window.create('view/main.html', 
    {
      id: 'main',
      frame: 'none',
    	outerBounds: {
    	  left: 0,
    	  top: 0,
    	  width: 375,
    	  height: 500,
    	},
    	resizable: false,
    	focused: true,
    }
  );
}
function createPreferenceWindow() {
  chrome.app.window.create('view/preference.html', 
    {
      id: 'preference',
      // frame: 'none',
    	outerBounds: {
    	  left: 0,
    	  top: 0,
    	  width: 570,
    	  height: 400,
    	},
    	resizable: false,
    	focused: true,
    // 	hidden: true
    }
  );
}


chrome.app.runtime.onLaunched.addListener(function() {
  createMainWindow();
  // initializeMirrorOpComponents();
});

/**
 * Clean-up before app closes
 */
chrome.runtime.onSuspend.addListener(function() {

}); 

chrome.runtime.onMessage.addListener(function(message, sender, callback){

});