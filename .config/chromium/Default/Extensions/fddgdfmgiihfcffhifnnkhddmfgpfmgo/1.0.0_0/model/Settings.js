// 'use strict';

var presenter = presenter || {};
var properties = properties || {};
presenter.settings = presenter.settings || {};

/** @constructor */
presenter.Settings = function() {};
presenter.Settings.prototype.loadPreference = function ()
{
  this.userName(null, function(value) {
    presenter.settings.userName = value;
  });
  
  this.slideShow(null, function(enabled) {
    presenter.settings.slideShow = enabled;
  });
  
  this.alwaysOnTop(null, function(enabled) {
    presenter.settings.alwaysOnTop = enabled;
  });
  
  this.defaultList(null, function(list) {
    presenter.settings.defaultList = list;
  });
  
  this.favoriteListPath(null, function(path) {
    presenter.settings.favoriteListPath = path;
  });
  
  this.mirrorQuality(null, function(quality) {
    presenter.settings.mirrorQuality = quality;
  });
  
  this.mirrorRatio(null, function(mirrorRatio) {
    presenter.settings.mirrorRatio = mirrorRatio;
  });
};

presenter.Settings.prototype.userName = function (name, callback){
  tryKeyWithValue('userName', name, function(value) {
    if (!value || value.length === 0) {
      getChromeProfileName(function(profileName){
        saveToKeyWithValue('userName', profileName);
        if (callback)
          callback(profileName);
      });
    }
    else {
      if (callback)
        callback(value);
    }
  });
};
presenter.Settings.prototype.slideShow = function (enable, callback){
  tryKeyWithValue('slideShow', enable, callback);
};
presenter.Settings.prototype.alwaysOnTop = function (enable, callback){
  tryKeyWithValue('alwaysOnTop', enable, callback);
};
presenter.Settings.prototype.mirrorQuality = function (quality, callback){
  tryKeyWithValue('mirrorQuality', quality, callback);
};
presenter.Settings.prototype.mirrorRatio = function (ratio, callback){
  tryKeyWithValue('mirrorRatio', ratio, callback);
};
presenter.Settings.prototype.defaultList = function (list, callback){
  tryKeyWithValue('defaultList', list, callback);
};
presenter.Settings.prototype.favoriteListPath = function (path, callback){
  tryKeyWithValue('favoriteListPath', path, callback);
};

presenter.Settings.prototype.addToFavorite = function (device){
  if (!this.favoriteList) {
    this.favoriteList = [];
  }
  var index = indexOfDeviceInList(this.favoriteList, device);
  if (index < 0) {
    var simpleDevice = {        ssidName: device.ssidName, 
                               ipAddress: device.ipAddress, 
                        // disableLoginCode: device.disableLoginCode
    };
    this.favoriteList.push(simpleDevice);
    saveFavoriteList(this.favoriteList);
  }
};

presenter.Settings.prototype.removeFromFavorite = function (device){
  if (!this.favoriteList) return;
  var index = indexOfDeviceInList(this.favoriteList, device);
  if (index >= 0) {
    this.favoriteList.splice(index, 1);
    saveFavoriteList(this.favoriteList);
  }
};

presenter.Settings.prototype.getFavoriteDeviceList = function (callback) {
  chrome.storage.sync.get('favoriteList', function(list) {
    if (!chrome.runtime.error) {
      var favoriteList = list.favoriteList;
      if (favoriteList)
        this.favoriteList = JSON.parse(list.favoriteList);
      if (callback)
        callback(this.favoriteList);
    }
  }.bind(this));
};
    
presenter.Settings.prototype.exportListAsXml = function(callback) {
  var xml = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n';
  xml += '<Devices>\n';
  xml += '\t<mainver>1</mainver>\n';
  xml += '\t<subver>1</subver>\n';
  $.each(this.favoriteList, function (index, device){
    xml += '\t<MirrorOp>\n';
    xml += '\t\t<Device>\n';
    xml += '\t\t\t<Device_name>' + device.ssidName + '</Device_name>\n';
    xml += '\t\t\t<IP>' + device.ipAddress + '</IP>\n' ;
    xml += '\t\t</Device>\n';
    xml += '\t</MirrorOp>\n';
  });
  xml += '</Devices>';
  if (callback)
    callback(xml);
};
    
presenter.Settings.prototype.clearFavoriteList = function(callback) {
  this.favoriteList = [];
  chrome.storage.sync.remove('favoriteList', callback);
  // chrome.storage.sync.clear();
};
    
var keyList = [
  'alwaysOnTop',
  'slideShow',
  'mirrorQuality',
  'mirrorRatio',
  'defaultList',
  'favoriteListPath',
  'userName'
];

var defaultPreference = {
  userName: '',
  alwaysOnTop: 'enable',
  slideShow: 'enable',
  mirrorQuality: 'normal',
  mirrorRatio: 'fill',
  defaultList: 'discovery',
  favoriteListPath: '/favoriteList.xml',
};

function indexOfDeviceInList(list, aDevice) {
  for (var i = 0; i < list.length; i++) {
    if(list[i].ipAddress === aDevice.ipAddress) return i;
  }
  return -1;
}
    
function saveFavoriteList(list) {
  var str = JSON.stringify(list);
  saveToKeyWithValue('favoriteList', str, function() {
  	if (chrome.runtime.error) {
  	  console.log(chrome.runtime.error);
  	}
  });
}


function tryKeyWithValue(key, value, callback) {
  if (value !== null) {
    console.log(presenter.settings);
    presenter.settings[key] = value;
    console.log(presenter.settings);
    saveToKeyWithValue(key, value);
  }
  else {
    retrieveValueByKey(key, callback);
  }
}

function retrieveValueByKey(key, callback) {
  chrome.storage.sync.get(key, function(result) {
    if (!chrome.runtime.error) {
      var value = result[key];
      if (!value) {
        value = defaultPreference[key];
        saveToKeyWithValue(key, value);
      }
      if (callback)
        callback(value);
   	}
  	else {
  	  console.log(chrome.runtime.error);
  	}
  });
}

function saveToKeyWithValue(key, value, callback) {
  if (typeof value !== 'string') {
    console.log('[Error] Preference: Unable to save value ' + value + ' (must be a string type)');
    return;
  }
  var val = {};
  val[key] = value;
  callback = callback || function() {
    if (chrome.runtime.error) {
      console.log(chrome.runtime.error);
    }
    else {
      chrome.runtime.sendMessage({action:'preferenceUpdated', value: {'key': key, 'value': value}});
    }
  };
  presenter.settings[key] = value;
  chrome.storage.sync.set(val, callback);
}

function getChromeProfileName(callback) {
  chrome.identity.getProfileUserInfo(function(profile){
    var userName = 'Chrome@' + getOSType();
    if (isChromebook()) {
      userName = profile.email.split("@")[0];
      userName = (userName.length === 0) ? "Chromebook User" : userName;
    }
    console.log(userName);
    callback(userName);
  });
}

function getOSType(){
  var OSName="Unknown OS";
  if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
  else if (navigator.appVersion.indexOf("Mac")!=-1) OSName="Mac";
  else if (navigator.appVersion.indexOf("CrOS")!=-1) OSName="Chromebook";
  else if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
  else if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";
  return OSName;
}
    
function isChromebook() {
  return (navigator.appVersion.indexOf("CrOS")!=-1);
}
