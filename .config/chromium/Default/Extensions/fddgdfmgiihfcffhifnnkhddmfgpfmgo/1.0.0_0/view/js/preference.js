var presenter = presenter || {};
var preference = preference || {};

$(function(){
  var preferenceWindow = chrome.app.window.get('preference');
  var windowSize = {
    width: 570,
    height: 400
  };
  $(window).load(function(){
    _localizeHtmlPage();
  });
  
  $(document).ready(function() {
    // Use this to get a file path appropriate for displaying
    // chrome.fileSystem.getDisplayPath(fileEntry, function(path) {
    //   console.log('Exporting to ' + path);
    // });
    chrome.app.window.current().onClosed.addListener(function (){
      chrome.runtime.sendMessage({action:'closePreference'});
    });
    presenter.Settings = new presenter.Settings();
    preference = presenter.Settings;
    loadPreference();
    
    var manifest = chrome.runtime.getManifest();
    $('.option_page.about .content_block.name').text(manifest.name);
    $('.option_page.about .content_block.version').text(manifest.version);
    $('.option_btn.general').trigger('click');
  });
  
  function _localizeHtmlPage(){
    var msg_general   = localizedString("General");
    var msg_name      = localizedString("Name");
    var msg_functions = localizedString("Functions");
    var msg_webSlide  = localizedString("Allow_webslide");
    var msg_on_top    = localizedString("Always_on_top");
    var msg_favorite  = localizedString("Favorite");
    var msg_default_ls = localizedString("Default_list");
    var msg_discovery = localizedString("Discovery");
    // var msg_favorite_ls   = localizedString("Favorite");
    var msg_favorite_ls = localizedString("Favorite_list");
    var msg_import    = localizedString("Import");
    var msg_export    = localizedString("Export");
    var msg_advance   = localizedString("Advance");
    var msg_quality   = localizedString("Quality");
    var msg_best      = localizedString("Best");
    var msg_normal    = localizedString("Normal");
    var msg_ratio     = localizedString("Aspect_ratio");
    var msg_fill      = localizedString("Fill_screen");
    var msg_keep      = localizedString("Keep_aspect_ratio");
    var msg_about     = localizedString("About");
    var msg_copyright = localizedString("Copyright");
    
    $('#option_btn_container .option_btn_label.general').text(msg_general);
    $('#option_btn_container .option_btn_label.favorite').text(msg_favorite);
    $('#option_btn_container .option_btn_label.advance').text(msg_advance);
    $('#option_btn_container .option_btn_label.about').text(msg_about);
    
    /** General Page **/
    $('.option_page.general .title_label.name').text(msg_name + ":");
    $('.option_page.general .title_label.functions').text(msg_functions + ":");
    $('.option_page.general .content_label.slide_show').text(msg_webSlide);
    $('.option_page.general .content_label.always_on_top').text(msg_on_top);
    
    /** Favorite Page **/
    $('.option_page.favorite .title_label.default_list').text(msg_default_ls + ":");
    $('.option_page.favorite .content_label.discovery').text(msg_discovery);
    $('.option_page.favorite .content_label.favorite').text(msg_favorite);
    $('.option_page.favorite .title_label.favorite_list').text(msg_favorite_ls + ":");
    $('.option_page.favorite .content_btn.import').text(msg_import);
    $('.option_page.favorite .content_btn.export').text(msg_export);
    
    /** Advance Page **/
    $('.option_page.advanced .title_label.quality').text(msg_quality + ":");
    $('.option_page.advanced .content_label.best').text(msg_best);
    $('.option_page.advanced .content_label.normal').text(msg_normal);
    $('.option_page.advanced .title_label.aspect_ratio').text(msg_ratio + ":");
    $('.option_page.advanced .content_label.fill').text(msg_fill);
    $('.option_page.advanced .content_label.keep').text(msg_keep);
    
    /** About Page **/
    $('.option_page.about .content_block.copyright').text(msg_copyright);
    
    // var msg_connect = localizedString("Connect");
    // $('#manual_connection .manual_label.connect').text(msg_connect);
    // var msg_manual_connection = localizedString("Manual_Connection");
    // $("#manual_connection .manual_input").attr("placeholder", msg_manual_connection);
    // var msg_passcode = localizedString("Passcode");
    // $("#passwordContainer .password_label.title_box").text(msg_passcode);
    // var msg_find_by_name = localizedString("Find_Device_By_Name");
    // $("#device_list_panel .device_search_input.search").attr("placeholder", msg_find_by_name);
    // var msg_no_device = localizedString("No_Device");
    // $("#device_list_message .message_box").text(msg_no_device);
  }
  
  // Handle all pages btn
  $('.option_btn').click(function() {
    $('.option_btn').not(this).removeClass('selected');
    if (!$(this).hasClass('selected')) {
      $(this).addClass('selected');
    }
    var page = null;
    var newHeight = windowSize.height;
    if ($(this).hasClass('general')) {
      page = $('.option_page.general');
      newHeight = 200;
    }
    else if ($(this).hasClass('favorite')) {
      page = $('.option_page.favorite');
      newHeight = 270;
    }
    else if ($(this).hasClass('advanced')) {
      page = $('.option_page.advanced');
      newHeight = 210;
    }
    else if ($(this).hasClass('about')) {
      page = $('.option_page.about');
      newHeight = 350;
    }
    else if ($(this).hasClass('license')) {
      page = $('.option_page.license');
      newHeight = 300;
    }
    if (page) {
      $('.option_page').not(page).hide();
      $(page).fadeIn(300);
      resizeWindowHeight(newHeight);
    }
  });
  
  // $('.option_page.general .content_input.name').blur(function(){
  //   var newName = $(this).val();
  //   updateUserName(newName);
  // });
  
  $('.option_page.general .content_input.name').keyup(function (e){
    var newName = $(this).val();
    updateUserName(newName);
  });
  
  $('.option_page.general .content_input.slide_show').off().click(function() {
    var checked = $(this).is(':checked');
    toggleSlideShow(checked);
    present.client.setWebSlide(checked);
  });
  $('.option_page.general .content_input.always_on_top').off().click(function() {
    var checked = $(this).is(':checked');
    toggleAlwaysOnTop(checked);
    var windows = chrome.app.window.getAll();
    var i = 0;
    for (i = 0; i < windows.length; i++)
    {
      windows[i].setAlwaysOnTop(checked);
    }
  });
  
  $('.option_page.favorite .content_input.list').click(function() {
    var isDiscovery = $(this).hasClass('discovery');
    var checked = $(this).is(':checked');
    var list = (isDiscovery && checked) ? 'discovery' : 'favorite';
    toggleDefaultList(list);
  });
  
  $('.option_page.favorite .content_btn.import').click(function() {
    var deviceList = [];
    chrome.fileSystem.chooseEntry(
      {
        type: 'openFile', accepts:[{ extensions: ['xml'] }] ,
      }, 
      function(fileEntry) {
        if (chrome.runtime.lastError || !fileEntry || typeof fileEntry === 'undefined') {
          var error = "Preference Error: " + chrome.runtime.lastError.message;
          chrome.runtime.sendMessage({action:'onError', value: error}); 
        }
        else {
          chrome.fileSystem.getDisplayPath(fileEntry, function(path) {
            console.log('Importing from ' + path + '...');
            $('.content_label.file_path').text(path);
            updateFavoriteListPath(path);
          });
            
          fileEntry.file(function(file){
            var reader = new FileReader();
            reader.onload = function(e) {
              var xml = e.target.result;
              var xmlContent = $.parseXML( xml );
              var moDeviceList = $(xmlContent).find('MirrorOp');
              $(moDeviceList).each(function() {
                var device = $(this).find('Device');
                var deviceInfo = {
                  deviceName: $(device).find('Device_name')[0].innerHTML,
                  ipAddress: $(device).find('IP')[0].innerHTML
                };
                deviceList.push(deviceInfo);
              });
              chrome.runtime.sendMessage({action:'importFavoriteList', value: deviceList}); 
            };
            reader.readAsText(file);
          });
        }
      }
    );
  });
  
  $('.option_page.favorite .content_btn.export').click(function() {
    chrome.fileSystem.chooseEntry(
      {
        type: 'saveFile', 
        suggestedName: 'favoriteList.xml', 
        accepts:[{ extensions: ['xml'] }],
      },
      function(fileEntry) {
        if (chrome.runtime.lastError || !fileEntry || typeof fileEntry === 'undefined') {
          var error = "Preference Error: " + chrome.runtime.lastError.message;
          chrome.runtime.sendMessage({action:'onError', value: error}); 
        }
        else {
          chrome.fileSystem.getDisplayPath(fileEntry, function(path) {
            console.log('Exporting to ' + path + '...');
            $('.content_label.file_path').text(path);
            updateFavoriteListPath(path);
          });
          var fileID = chrome.fileSystem.retainEntry(fileEntry);
          exportingFavoriteToFileId(fileID);
        }
      }
    );
  });
    
     
  $('.option_page.advanced .content_input.quality').click(function() {
    var checked = $(this).is(':checked');
    var isBest = $(this).hasClass('best');
    var quality = (checked && isBest) ? 'best' : 'normal';
    toggleQuality(quality);
  });
  
  $('.option_page.advanced .content_input.aspect_ratio').click(function() {
    var checked = $(this).is(':checked');
    var isFill = $(this).hasClass('fill');
    var ratio = (checked && isFill) ? 'fill' : 'keepAspectRatio';
    toggleRatio(ratio);
  });
  
  // $('.option_page.license .license_footer_btn.buy').click(function() {
  //   console.log('buying');

  //   chrome.identity.onSignInChanged.addListener(function(accountInfo, isSignedIn) {
  //     console.log(isSignedIn, accountInfo);
  //   });
  
  function resizeWindowHeight(height) {
    // actual height is always 22 less than desired height
    preferenceWindow.outerBounds.height = height + 22;
  }
  
  function toggleSlideShow(enable) {
    var enabled = (enable) ? 'enable' : 'disable';
    preference.slideShow(enabled); 
    
  }
  function toggleAlwaysOnTop(onTop) {
    var always = (onTop) ? 'enable' : 'disable';
    preference.alwaysOnTop(always); 
  }
  
  function toggleDefaultList(discoveryList) {
    preference.defaultList(discoveryList);
  }
  
  function toggleRatio(fill) {
    preference.mirrorRatio(fill);
  }
  
  function toggleQuality(quality) {
    preference.mirrorQuality(quality);
  }
  
  function updateUserName(newName) {
    preference.userName(newName);
  }
  function updateFavoriteListPath(path) {
    preference.favoriteListPath(path);
  }
  
  function exportingFavoriteToFileId(fileId) {
    chrome.runtime.sendMessage({action:'exportingFavoriteAsXml', value: fileId}); 
  }
  
  function loadPreference() {
    // var input = null;
    // console.log(presenter.settings);
    // var name = preference.userName(null);
    // var slideshow = preference.slideShow(null);
    // var alwaysOnTop = preference.alwaysOnTop(null);
    // var defaultList = preference.defaultList(null); 
    // var path = preference.favoriteListPath(null);
    // var quality = preference.mirrorQuality(null);
    // var mirrorRatio = preference.mirrorRatio(null);
    
    // chrome.app.window.current().setAlwaysOnTop(alwaysOnTop === 'enable');
    // $('.option_page.general .content_input.name').val(name);
    // $('.option_page.general .content_input.slide_show').prop('checked', slideshow === 'enable');
    // $('.option_page.general .content_input.always_on_top').prop('checked', alwaysOnTop === 'enable');
    // input = (defaultList === 'discovery') ? $('.option_page.favorite .content_input.discovery') : $('.option_page.favorite .content_input.favorite');
    // $(input).prop('checked', true);
    // if (!path) path = '<None>';
    // $('.option_page.favorite .content_label.file_path').text(path);
    // input = (quality === 'best') ? $('.option_page.advanced .content_input.best') : $('.option_page.advanced .content_input.normal');
    // $(input).prop('checked', true);
    
    // input = (mirrorRatio === 'keepAspectRatio') ? $('.option_page.advanced .content_input.keep') : $('.option_page.advanced .content_input.fill');
    // $(input).prop('checked', true);
      
    preference.userName(null, function(value) {
      $('.option_page.general .content_input.name').val(value);
    });
    
    preference.slideShow(null, function(enabled) {
      $('.option_page.general .content_input.slide_show').prop('checked', enabled === 'enable');
    });
    
    preference.alwaysOnTop(null, function(enabled) {
      $('.option_page.general .content_input.always_on_top').prop('checked', enabled === 'enable');
      chrome.app.window.current().setAlwaysOnTop(enabled === 'enable');
    });
    
    preference.defaultList(null, function(list) {
      var input = (list === 'discovery') ? $('.option_page.favorite .content_input.discovery') : $('.option_page.favorite .content_input.favorite');
      $(input).prop('checked', true);
    });
    
    preference.favoriteListPath(null, function(path) {
      if (!path)
        path = '<None>';
      $('.option_page.favorite .content_label.file_path').text(path);
    });
    
    preference.mirrorQuality(null, function(quality) {
      var input = (quality === 'best') ? $('.option_page.advanced .content_input.best') : $('.option_page.advanced .content_input.normal');
      $(input).prop('checked', true);
    });
    
    preference.mirrorRatio(null, function(mirrorRatio) {
      var input = (mirrorRatio === 'keepAspectRatio') ? $('.option_page.advanced .content_input.keep') : $('.option_page.advanced .content_input.fill');
      $(input).prop('checked', true);
    });
  }
  
  function preferenceUpdatedWithInfo(info) {
    var page = $('.option_page.general');
    var targetStr = null;
    if (info.key === 'alwaysOnTop') {
      if (info.value === 'enable')
        $(page).find('.content_input.always_on_top').prop('checked', true);
    }
    else if (info.key === 'slideShow') {
      if (info.value === 'enable')
        $(page).find('.content_input.slide_show').prop('checked', true);
    }
    else if (info.key === 'mirrorQuality') {
      page = $('.option_page.advanced');
      var isBest = (info.value === 'best');
      targetStr = (isBest) ? '.content_input.best' : '.content_input.normal';
      $(page).find(targetStr).prop('checked', true);
    }
    else if (info.key === 'mirrorRatio') {
      page = $('.option_page.advanced');
      var aspectToFit = (info.value === 'keepAspectRatio');
      targetStr = (aspectToFit) ? '.content_input.keep' : '.content_input.fill';
      $(page).find(targetStr).prop('checked', true);
    }
    else if (info.key === 'defaultList') {
      page = $('.option_page.favorite');
      targetStr = (info.value === 'discovery') ? '.content_input.discovery' : '.content_input.favorite';
      $(page).find(targetStr).prop('checked', true);
    }
    else if (info.key === 'favoriteListPath') {
      page = $('.option_page.favorite');
      targetStr = '.content_label.file_path';
      $(page).find('.content_label.file_path').text(inf.value);
    }
    else if (info.key === 'userName') {
      $(page).find('.content_input.name').val(info.value);
    }
  }

  chrome.runtime.onMessage.addListener(function(message, sender, callback){
    if (message.action === 'preferenceUpdated') {
      preferenceUpdatedWithInfo(message.value);
    }
  });

});