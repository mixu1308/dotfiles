
var presenter = presenter || {};
var client = client || {};
var capturer = capturer || {};
var preference = preference || {};
var mainView = mainView || {};

  $(window).load(function(){
    
  });

  $(document).ready(function() {
    presenter.MainView = new MainView();
    mainView = presenter.MainView;
    mainView.localizeHtmlPage();
    mainView.setToDefaultAppearence();
    
    presenter.Settings = new presenter.Settings();
    preference = presenter.Settings;
    preference.loadPreference();
    
    presenter.capturer = new SreenCapture();
    capturer = presenter.capturer;
    capturer.delegate.onCaptureStateChangeEvent = _onCaptureStateChangeEvent;
    capturer.delegate.onCaptureError = _onCaptureError;
    
    presenter.MirrorOpClient = new presenter.MirrorOpClient();
    client = presenter.MirrorOpClient;
    client.delegate.onStatusEvent = _onClientStatusChangeEvent;
    client.delegate.onDiscoverDeviceEvent = _onDiscoverDeviceEvent;
    client.delegate.onConnectionStatusChangeEvent = _onConnectionStatusChangeEvent;
    client.delegate.onMirroringStatusChangeEvent = _onMirroringStatusChangeEvent;
    client.delegate.onMirroringParamsChangeEvent = _onMirroringParamsChangeEvent;
    client.delegate.onFeatureUpdateEvent = _onFeatureUpdateEvent;
    client.delegate.onError = _onError;
    
    _updateWithPreference();
    _onClientStatusChangeEvent(true);
    client.discoverDevices(true);
  });

  function _updateWithPreference()
  {
    preference.defaultList(null, function(list) {
      if (list === 'favorite')
      {
        $('#control_panel .btn_favorite').trigger( "click" );
        $("#control_panel .btn_expand").trigger('click');
      }
    });
    
    preference.alwaysOnTop(null, function(enabled) {
      if (enabled === 'enable') {
        chrome.app.window.current().setAlwaysOnTop(true);
      }
    });
  }

  function log(msg, level) {
    var resultMsg = "Presenter: " + msg;
    moLog(resultMsg, level);
  }
  
  /** Captuerer Delegate APIs **/
  function _onCaptureStateChangeEvent(state)
  {
    if (state === CAPTURE_REQUESTING)
    {
      $('.dropdown').hide();
      mainView.resizeWindow(740,645);
    }
    else if (state === CAPTURE_DENIED || state === CAPTURE_STARTED)
    {
      mainView.statusDidUpdate();
      mainView.resizeWindow(defaultWidth,defaultHeight);
    }
    if (state === CAPTURE_STARTED)
    {
      if (!client.isMirroring)
        mainView.setWaitingWithReason();
      client.addStream(capturer.currentStream);
    }
    else if (state === CAPTURE_STOPPED)
    {
      client.stopMirroring(mainView.currentSelectSplit);
    }
  }
  function _onCaptureError(error)
  {
    console.log(error);
  }
  
  /** Client Delegate APIs **/
  function _onClientStatusChangeEvent(isBusy, msg)
  {
    if (isBusy)
      mainView.setWaitingWithReason(msg);
    else
      $('#errorContainer').fadeOut(100);
  }
  
  function _onDiscoverDeviceEvent(device, isConnected)
  {
    mainView.displayDevice(device, isConnected);
    // _checkDeviceListType();
  }

  function _onConnectionStatusChangeEvent(status) {
    var isClosed = (status === PLANE_CLOSED);
    var isRejected = (status === PLANE_REJECTED);
    var isConnected = (status === PLANE_OPENED);
    var isHandshaked = (status === PLANE_HANDSHAKED);
    var isReady = (status === PLANE_READY);
    client.clearTimerEvent();
    if (isConnected)
    {
    }
    else if (isHandshaked)
    {
      client.login(presenter.settings.userName, "");
      client.currentDevice.isReachable = true;
      mainView.displayDevice(client.currentDevice);
      mainView.updateConnectionStatusAtAddress(client.currentDevice.ipAddress, true);
    }
    else if (isReady){
      _didLogIn();
    }
    else if (isRejected)
    {
      client.startEventTimer(true, 30000, function()
      {
        if (client.currentDevice.status !== PLANE_READY)
          client.disconnect();
      });
      _onRequiresLoginCode();
    }
    else if (isClosed) {
      _didLogOut();
    }
  }
  function _onMirroringStatusChangeEvent(status) {
    var didStart = (status === 1) ;
    var didStop = (status === 0) ;
    mainView.statusDidUpdate();
    mainView.updatePlayButton(didStart);
    mainView.setMessagePanel();
    mainView.hidePopupMessage();
    
    if (didStart)
    {
      if (!capturer.isCapturing)
        capturer.startCapturing();
      else
        mainView.resizeWindow(defaultWidth,defaultHeight);
    }
    else if (didStop)
    {
      capturer.stopCapturing();
    }
  }
  function _onMirroringParamsChangeEvent() {
    mainView.toggleSplitBtn(mainView.currentSelectSplit, client.compositionParams.outputLayout);
    mainView.setMessagePanel();
  }
  
  function _onFeatureUpdateEvent(feature, enabled) {
    console.log('onFeatureUpdateEvent', feature, enabled);
  }
  
  function _onError(code) {
    console.log('onError', code);
    var error = _errorStringFromCode(code);
    if (code === -9990  // NACL module not initialized
      || code == -9989  // Unkonwn request event 
      || code === -966  // LibB timeout errorCode
      ) 
      console.log(error);
    else
      mainView.showError(error);
  }
  
  function _errorStringFromCode(code) 
  {
    var str = 'Unknown Error';
    switch(code)
    {
      case -9998: 
        str = 'Event failed';
        break;
      case -9997:
        str = 'Connection Failed';
        break;
      case -9996:
        str = 'Connection Lost';
        break;
      case -9995:
        str = 'Connection rejected by receiver';
        break;
      case -9994:
        str = 'Under conference control';
        break;
      case -9993:
        str = 'Composition is occupied';
        break;
      case -9992:
        str = 'No valid protocol detected';
        break;
      case -9990:
        str = 'NACL module not initialized yet';
        break;
      default:
    }
    return str;
  }

  /** Client Delegate Helper **/
  function _didLogIn()
  {
    preference.slideShow(null, function(enabled) {
      client.setWebSlide(enabled === 'enable');
    });
    
    preference.mirrorQuality(null, function(quality) {
      client.changeQuality(quality);
      presenter.settings.quality = quality;
    });
    
    preference.mirrorRatio(null, function(mirrorRatio) {
      client.changeContentMode(mirrorRatio);
      presenter.settings.mirrorRatio = mirrorRatio;
    });
    
    log("_didLogIn", logInform);
    mainView.hidePopupMessage();
    mainView.statusDidUpdate();
    mainView.expandControlPanel(false);
    mainView.setMessagePanel();
    mainView.updateCGIButton(!client.supportsCGI);
    $(".password_input").val('');
    $('#passwordContainer').hide();
  }
  function _didLogOut(address) {
    log("_didLogOut", logInform);
    mainView.updateConnectionStatusAtAddress(address, false);
    mainView.expandControlPanel(true);
    mainView.setMessagePanel();
    mainView.statusDidUpdate();
    mainView.updatePlayButton(false);
    $(".password_input").val('');
    $('#passwordContainer').fadeOut(200);
  }
  function _onRequiresLoginCode() {
    // log("_onRequiresLoginCode", logInform);
    var address = client.currentDevice.ipAddress;
    var index = indexOfAddress(address);
    var row = $('.device_cell').get(index);
    if (!$(row).hasClass('selected')) {
      $(row).addClass('selected');
    }
    mainView.showPasswordPanelForAddress(client.currentDevice.ipAddress);
  }
  
  function _preferenceUpdatedWithInfo(info) {
    if (info.key === 'alwaysOnTop') {
      var onTop = (info.value === 'enable');
      var windows = chrome.app.window.getAll();
      var i = 0;
      for (i = 0; i < windows.length; i++)
      {
        windows[i].setAlwaysOnTop(onTop);
      }
    }
    else if (info.key === 'slideShow') {
      var enabled = (info.value === 'enable');
      client.setWebSlide(enabled);
    }
    else if (info.key === 'mirrorQuality') {
      client.changeQuality(info.value);
    }
    else if (info.key === 'mirrorRatio') {
      client.changeContentMode(info.value);
    }
    else if (info.key === 'defaultList') {
      // var isFavoriteList = (info.value === 'favorite');
      // var target = (isFavoriteList) ? $('#control_panel .btn_favorite') : $('#control_panel .btn_list');
      // $(target).trigger( "click" );
      // $("#control_panel .btn_expand").trigger('click');
    }
    else if (info.key === 'favoriteListPath') {
    }
    else if (info.key === 'userName') {
      presenter.settings.userName = info.value;
      // preference.userName(info.value);
    }
  }
  
  chrome.runtime.onMessage.addListener(function(message, sender, callback){
    if (!presenter)
      return;

    if (message.action === 'closePreference') {
      console.log(message);
    }
    else if (message.action === 'preferenceUpdated') {
      _preferenceUpdatedWithInfo(message.value);
    }
    // else if (message.action === 'updateFavoriteListPath') {
    //   preference.favoriteListPath(message.value);
    // }
    else if (message.action === 'exportingFavoriteAsXml') {
      var fileID = message.value;
      chrome.fileSystem.restoreEntry(fileID, function(fileEntry){
        preference.exportListAsXml(function (xml){
            fileEntry.createWriter(function(fileWriter) {
              var truncated = false;
              var blob = new Blob([xml]);

              fileWriter.onwriteend = function(e) {
                if (!truncated) {
                  truncated = true;
                  // You need to explicitly set the file size to truncate
                  // any content that might have been there before
                  this.truncate(blob.size);
                  return;
                }
                console.log('Exporting completed');
              };

              fileWriter.onerror = function(e) {
                console.log('Export failed: '+e.toString());
              };

              fileWriter.write(blob);
            });
        });
      });
    }
    else if (message.action === 'importFavoriteList') {
      var list = message.value;
      preference.clearFavoriteList(function (){
        $(list).each(function(i, device){
          var index = indexOfDevice(device);
          var deviceInfo= null;
          if (index < 0) {
            deviceInfo = {
              ssidName: device.deviceName,
              ipAddress: device.ipAddress,
              isFavorite: true,
              isReachable: false,
            };
            _insertNewDeviceCell(deviceInfo);
          }
          else {
            // update CurrentDevcie;
            var deviceA = deviceList.items[index];
            deviceInfo = {
              ssidName: deviceA.values().name,
              isFavorite: true,
              isReachable: deviceA.values().isReachable,
              ipAddress: deviceA.values().ipAddress,
              disableLoginCode: (deviceA.values().requiresPassword) ? 0 : 1
            };
            mainView.displayDevice(deviceInfo, false);
            // _updateDeviceIfExist(deviceInfo);
          }
          preference.addToFavorite(deviceInfo);
        });
        _reorderDeviceList();
      });
    }
    else if (message.action === 'closePerformance') {
      if (performanceInterval) {
        window.clearInterval(performanceInterval);
      }
      resetPerformance();
    }
    else {
      console.log(message);
    }
  });
