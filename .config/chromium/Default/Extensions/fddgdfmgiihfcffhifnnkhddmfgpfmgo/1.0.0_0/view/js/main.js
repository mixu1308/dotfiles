var presenter = presenter || {};
var client = client || {};
var capturer = capturer || {};
var preference = preference || {};
var mainView = mainView || {};
var scrollableDeviceTable = scrollableDeviceTable || {};
var deviceList = deviceList || {};
var defaultWidth = 400;
var defaultHeight = 160;
var expandedHeight = 660;
var defaultBarHeight = 50;
var options = {
  item: "<li class='device_cell'>" +
            "<div class='device_attrs'>" +
              "<div id='device_icon' class='device_btn icon wireless_device'></div>" +
                "<div id='device_favorite' class='device_btn favorite'></div>" +
                "<div id='device_control' class='device_btn control'></div>" +
                "<div id='device_connect' class='device_btn connect'>" +
                  "<div class='device_label connect'>Connect</div>" +
                "</div>" +
                "<div id='device_name' class='device_label name'>" +
                "</div>" +
                "<div class='isFavorite' style='display:none'>false</div>" +
                "<div class='ipAddress' style='display:none'></div>" +
                "<div class='requiresPassword' style='display:none'>false</div>" +
                // "<div class='deviceIndex' style='visibility:hidden'>-1</div>" +
              "</div>" +
            "</div>" +
        "</li>"
};

MainView = null;

/** @constructor */
MainView = function() {
  // initialize IScrol
  scrollableDeviceTable = new IScroll('#device_list_table', {
      scrollbars: true,
      mouseWheel: true,
      interactiveScrollbars: true,
      shrinkScrollbars: 'scale',
      fadeScrollbars: true
  });
  // initialize deviceList
  deviceList = new List('scroll-content', options);
};
MainView.prototype.resizeWindow = function(width, height, forced) {
  var mainWindow = chrome.app.window.get('main');
  if (forced || (mainWindow.outerBounds.height != height || mainWindow.outerBounds.width != width))
    mainWindow.resizeTo(width, height);
};

MainView.prototype.localizeHtmlPage = function() {
  var msg_connect = localizedString("Connect");
  $('#manual_connection .manual_label.connect').text(msg_connect);
  var msg_manual_connection = localizedString("Manual_Connection");
  $("#manual_connection .manual_input").attr("placeholder", msg_manual_connection);
  var msg_passcode = localizedString("Passcode");
  $("#passwordContainer .password_label.title_box").text(msg_passcode);
  var msg_find_by_name = localizedString("Find_Device_By_Name");
  $("#device_list_panel .device_search_input.search").attr("placeholder", msg_find_by_name);
  var msg_no_device = localizedString("No_Device");
  $("#device_list_message .message_box").text(msg_no_device);
};

MainView.prototype.setToDefaultAppearence = function() {
  var mainWindow = chrome.app.window.get('main');
  mainWindow.outerBounds.width = defaultWidth;
  mainWindow.outerBounds.height = defaultHeight;
  this.updateDeviceList();
  this.statusDidUpdate();
  this.expandControlPanel(true);
};

MainView.prototype.expandControlPanel = function(onShow) {
  var mainWindow = chrome.app.window.get('main');
  var expandBtn = $('#control_panel .btn_expand');
  $(expandBtn).removeClass('selected');
  if (onShow) {
    $('#device_list_panel').show();
    $(expandBtn).addClass('selected');
    this.updateDeviceList();
    this.resizeWindow(defaultWidth, expandedHeight, true);
  }
  else {
    this.resizeWindow(defaultWidth, defaultHeight);
  }
  _updateControlBar();
};
  
MainView.prototype.setWaitingWithReason = function(reason)
{
  _resetErrorContainer();
  var msg = (!msg) ? 'Please wait' : msg;
  $('#errorContainer .dialogBox').addClass('onWait');
  $('#errorContainer .message_box').text(localizedString(msg) + "...");
  $('#errorContainer').hide().fadeIn(200);
};

MainView.prototype.setBusyWithReason = function(reason)
{
  _resetErrorContainer();
  $('#errorContainer .dialogBox').addClass('busy');
  $('#errorContainer .message_box').text(localizedString(reason) + "...");
  $('#errorContainer').hide().fadeIn(200);
};

MainView.prototype.exitingWhileProjecting = function () {
  _resetErrorContainer();
  $('#errorContainer .dialogBox').addClass('onExit');
  $('#errorContainer .message_box').text(localizedString("Projecting_Exit"));
  $('#errorContainer').hide().fadeIn(200);
};

MainView.prototype.showError = function(errorMsg) {
  console.log(errorMsg);
  _resetErrorContainer();
  $('#errorContainer .message_box').text(localizedString(errorMsg));
  $('#errorContainer').hide().fadeIn(200);
};

MainView.prototype.hidePopupMessage = function() {
  $('#errorContainer').hide().fadeOut(100);
};

MainView.prototype.showPasswordPanel = function (address) {
  $('#errorContainer').fadeOut(200, function(){
    var pwdContainer = $("#passwordContainer .password_label.message_box");
    if ($(pwdContainer).is(":visible")) {
      $(pwdContainer).empty();
      var msg_invalid_passcode = localizedString("Invalid_Passcode");
      $(pwdContainer).append("<p>" + msg_invalid_passcode + "</p>" + "<p>" + "</p>");
    }
    else {
      mainView.showPasswordPanelForAddress(address);
    }
  });
};

MainView.prototype.showPasswordPanelForAddress = function (address) {
  var device = _deviceAtAddress(address);
  if (!device) {
    //TODO manual input to rquire passcode device will fail
    return;
  }
  $('#errorContainer').fadeOut(200, function(){
    var pwdContainer = $("#passwordContainer .password_label.message_box");
    if ($(pwdContainer).is(":visible")) {
      $(pwdContainer).empty();
      var msg_invalid_passcode = localizedString("Invalid_Passcode");
      $(pwdContainer).append("<p>" + msg_invalid_passcode + "</p>" + "<p>" + "</p>");
    }
    else
    {
      var name = device.ssidName;
      if (!name) name = device.values().name;
        $(pwdContainer).empty();
        
      var msg_enter_passcode = localizedString("Enter_Passcode");
      $(pwdContainer).append("<p>" + msg_enter_passcode + " </p>" +
                              "<p>" + name + "</p>");
      $('#passwordContainer').fadeIn(300, function() {
        $("#passwordContainer .password_input").get(0).focus();
      });
    }
  });
};
  
MainView.prototype.updateDeviceListMessage = function (onShow) {
  var list = (deviceList.items.length === 0) ? null : deviceList.matchingItems;
  var item_count = (list) ? list.length : 0;
  if (onShow || item_count === 0) {
    $('#device_list_message .message_box').hide().fadeIn(200);
  }
  else {
    $('#device_list_message .message_box').fadeOut(100);
  }
};

MainView.prototype.updateDeviceList = function () {
  var btn_list = $('#device_bar .btn_list');
  var btn_favo = $('#device_bar .btn_favorite');
  var btn_sear = $('#device_bar .btn_search');
  var deviceCellList = $('.device_cell');
  deviceList.filter();
  if ($(btn_list).hasClass('selected')) {
  }
  else if ($(btn_favo).hasClass('selected')) {
    deviceList.filter(function(item) {
      return item.values().isFavorite;
    });
  }
  else if ($(btn_sear).hasClass('selected')) {
    $('#device_search_bar').show();
  }
  else {
    $(btn_list).addClass('selected');
  }
  setTimeout(function () {
    scrollableDeviceTable.scrollTo(0, 0);
    scrollableDeviceTable.refresh();
  }, 0);
  this.updateDeviceListMessage();
};
  
MainView.prototype.displayDevice = function (device, isConnected) {
  var deviceRow = null;
  var index = indexOfDevice(device);
  // displaying a new device
  if (index < 0)  {
    deviceRow = _insertNewDeviceCell(device);
    // // needs to update the table's contentsize by calling refresh after adding new rows;
    // scrollableDeviceTable.refresh();
  }
  // update or searched an existed device
  else {
    var items = deviceList.items;
    var item = items[index];
    item.values({
      isReachable: device.isReachable,
      ipAddress: device.ipAddress,
      requiresPassword: (device.disableLoginCode === 0)
    });
  
    deviceRow = $("#device_list .device_cell")[index];
    if (deviceRow) {
      scrollableDeviceTable.scrollToElement(deviceRow);
      $(deviceRow).trigger('click');
    }
  }
  if (deviceRow) {
    $(deviceRow).removeClass('isNotReachable');
      if (!device.isReachable) {
        $(deviceRow).addClass('isNotReachable');
    }
  }
  this.updateDeviceList();
  // this.updateDeviceListMessage();
  if (isConnected)
    this.updateConnectionStatusAtAddress(device.ipAddress, true);
};

MainView.prototype.statusDidUpdate = function() {
  var statusBar = $("#header_panel .status_bar");
  var isConnected = client.isConnected;
  var didStart = client.isMirroring;
  if (isConnected)
    $(statusBar).show();
  else
    $(statusBar).hide();
  if (didStart) {
    if (!$(statusBar).hasClass('did_start'))
      $(statusBar).addClass('did_start');
  }
  else
  {
    $(statusBar).removeClass('did_start');
  }
  if (isConnected && (client.currentDevice !== null))
  {
    this.updateConnectionStatusAtAddress(client.currentDevice.ipAddress, isConnected);
  }
};
MainView.prototype.updateConnectionStatusAtAddress = function(address, connected) {
  $('.device_cell').removeClass('connected');
  if (connected) {
    var index = indexOfAddress(address);
    var row = $('.device_cell').get(index);
    $(row).removeClass('isNotReachable');
    $(row).toggleClass('connected');
  }
};

MainView.prototype.updateCGIButton = function (supported) {
  var connectedRow = $('.device_cell.connected').get(0);
  if (connectedRow) {
    var controlBtn = $(connectedRow).find('.device_btn.control');
    if (supported)
      controlBtn.hide();
    else
      controlBtn.show();
  }    
};

MainView.prototype.updatePlayButton = function (onPlay) {
  var isPlaying = ($("#control_panel .btn_play").is(".isPlaying"));
  var play_btn = $("#control_panel .btn_play");
  var pause_btn = $("#control_panel .btn_pause");
  var stop_btn = $("#control_panel .btn_stop");
  if (onPlay) {
    $(pause_btn).removeClass('selected');
  }
  if ((isPlaying && !onPlay) || (!isPlaying && onPlay)) {
    $(play_btn).hide();
    $(pause_btn).show();
    $(stop_btn).show();
  }
  else {
    $(play_btn).show();
    $(pause_btn).hide();
    $(stop_btn).hide();
  }
};
MainView.prototype.toggleSplitBtn = function(fromSplit, toSplit) {
  toSplit = (toSplit < 1 || toSplit > 4) ? 0 : toSplit;
  if (fromSplit !== toSplit) {
    fromSplit = (!fromSplit) ? 0 : fromSplit;
    toSplit = (!toSplit) ? 0 : toSplit;
    var fromClass = _classFromSplit(fromSplit);
    var toClass = _classFromSplit(toSplit);
    $("#control_bar .control.btn_split").removeClass(fromClass);
    $("#control_bar .control.btn_split").addClass(toClass);
  }
  mainView.currentSelectSplit = toSplit;
  mainView.setMessagePanel();
};
  
MainView.prototype.setMessagePanel = function() {
  var msg = $('#message_panel');
  var connected = client.isConnected;
  if (!connected) {
    $(msg).fadeOut(300);
    return;
  }
  else {
    var type = 'Ready';
    var didStart = client.isMirroring;
    var didPause = client.isPaused;
    
    var connectedDevice = $('.device_cell.connected').get(0);
    if (!connectedDevice){ return; }
    var deviceName = $(connectedDevice).find('.device_label.name').text();
    
    if (didPause) {
      type = 'Paused';
    }
    else if (didStart) {
      type = _stringFromSplit(mainView.currentSelectSplit);
    }
    
    var msg_type = localizedString(type);
    $(msg).find('.message_label.device_ssid').text(deviceName);
	  $(msg).find('.message_label.status').text(msg_type);
    $(msg).fadeIn(300);
  }
};

$(function(){
  // UI Control
  $("#header_panel .option").off().click(function(){
    createPreferenceWindow();
  });
  
  $("#header_panel .close").off().click(function(){
    var didStart = client.isMirroring;
    if (didStart) {
      mainView.exitingWhileProjecting();
    }
    else {
      client.disconnect();
      client.destroy();
      // Close all window
      for(var i=0, wins=chrome.app.window.getAll() ; i<wins.length; i++) {
        wins[i].close();
      }
    }
  });
  
  $("#header_panel .minimize").off().click(function(){
    var mainWindow = chrome.app.window.get('main');
    mainWindow.minimize();
  });
  
  $('#errorContainer .btn_cancel').click(function(){
    var box = $('#errorContainer .dialogBox');
    if ($(box).hasClass('busy')) {
      client.disconnect();
      mainView.setMessagePanel();
    }
    else if ($(this).hasClass('onExit')) {
    }
    else {
      // shouln't be clickable
    }
    var readyToStart = client.canStart;
    $('#errorContainer').fadeOut(300, function(){
      mainView.expandControlPanel(!readyToStart);
    });
  });
  
  $('#errorContainer .btn_confirm').click(function(){
    var box = $('#errorContainer .dialogBox');
    if ($(box).hasClass('onExit')) {
      client.disconnect();
      client.destroy();
      // Close all window
      for(var i=0, wins=chrome.app.window.getAll() ; i<wins.length; i++) {
        wins[i].close();
      }
      return;
    }
    else if ($(box).hasClass('busy')) {
  
    }
    var isConnected = client.isConnected;
    $('#errorContainer').fadeOut(300, function(){
      mainView.expandControlPanel(!isConnected);
    });
  });
  
  /** Control Panel **/
  $("#control_panel .btn_play").click(function(){
    var isDisabled = ($("#control_panel .btn_play").is(".disabled"));
    if (isDisabled) {
      return;
    }
    $("#control_panel .btn_pause").removeClass('selected');
    mainView.setWaitingWithReason();
    client.startMirroring(mainView.currentSelectSplit);
    // capturer.startCapturing();
  });
  
  $("#control_panel .btn_pause").click(function(){
    if ($(this).hasClass('selected')) {
      client.pauseMirroring(false);
    }
    else {
      client.pauseMirroring(true);
    }
    mainView.setMessagePanel();
    $(this).toggleClass('selected');
  });
  
  $("#control_panel .btn_stop").click(function(){
    mainView.updatePlayButton(false);
    capturer.stopCapturing();
  });
  
  /** Device Bar Actions **/
  $("#control_panel .btn_expand").click(function(){
    //btn_expand will toggle selected class in corresponding to app's window size
    // mainView.updateDeviceList.bind(this)();
    var isExpanded = $(this).hasClass('selected');
    mainView.expandControlPanel(!isExpanded);
    $('#device_list_panel').show();
  });
  
  $("#control_panel .btn_list").click(function(){
    if (!$(this).hasClass('selected')) {
      $('#device_bar .bar_btn').not(this).not('.btn_search').not('.btn_expand').removeClass('selected');
      $(this).toggleClass('selected');
      mainView.updateDeviceList();
    }
  });
  
  $("#control_panel .btn_favorite").click(function(){
    if (!$(this).hasClass('selected')) {
      $('#device_bar .bar_btn').not(this).not('.btn_search').not('.btn_expand').removeClass('selected');
      $(this).toggleClass('selected');
      mainView.updateDeviceList();
    }
  });
  
  $("#control_panel .btn_refresh").click(function(){
    $('.device_search_input').val('').trigger('input');
    deviceList.clear();
    deviceList.filter();
    scrollableDeviceTable.refresh();
    mainView.updateDeviceListMessage();
    client.discoverDevices();
  });
  
  $("#control_panel .btn_search").click(function(){
    if (!$(this).hasClass('selected')) {
      $(this).toggleClass('selected');
      $('#device_search_bar').fadeIn(300);
      mainView.updateDeviceList();
      if (!$('#device_list_table').hasClass('inSearch'));
        $('#device_list_table').addClass('inSearch');
    }
    else {
      $('.device_search_input').val('').trigger('input');
      $(this).removeClass('selected');
      $('#device_list_table').removeClass('inSearch');
      $('#device_search_bar').fadeOut(300);
    }
    scrollableDeviceTable.refresh();
  });
  
  $('.device_search_input').on('input',function(e){
    var token = $(this).val();
    var visibleCells = deviceList.visibleItems;
    var hasValue = (token.length > 0);
    var i = 0;
    var item = null;
    var currentName = null;
    var newName = null;
  
    // replace back to original name first
    for (i = 0; i < visibleCells.length; i++) {
      item = visibleCells[i];
      currentName = item.values().name;
      newName = currentName.replace('<span style="color:blue">', "");
      newName = newName.replace("</span>", "");
      item.values({name:newName});
    }
  
    if (hasValue) {
      $('#device_search_bar .search_bar_btn.clear').show();
      deviceList.search(token, ['name']);
      visibleCells = deviceList.visibleItems;
      var reg = null;
      var replacement = null;
  
      for (i = 0; i < visibleCells.length; i++) {
        item = visibleCells[i];
        currentName = item.values().name;
  
        // ignore cases since search is case insensitive
        var foundIndex = currentName.toLowerCase().indexOf(token);
        // replace with the original nameToken in case of modifying the case
        var nameToken = currentName.substring(foundIndex, foundIndex + token.length);
  
        // make sure nameToken is doesn't contain invalid character
        nameToken = nameToken.replace(/[\/\\^$*+?.()|[\]{}]/, '\\$&');
        replacement = '<span style="color:blue">' + nameToken + "</span>";
        reg = new RegExp(nameToken, 'i');
        newName = currentName.replace(reg,replacement);
        item.values({name:newName});
      }
    }
    else {
      $('#device_search_bar .search_bar_btn.clear').hide();
      if (deviceList.items.length > 0)
        deviceList.search();
    }
    mainView.updateDeviceListMessage();
  });
  $('#device_search_bar .search_bar_btn.clear').click(function (){
    $('.device_search_input').val('').trigger('input');
  });
  
  /** Control Bar Actions **/
  $("#control_bar .control.btn_split").click(function(){
    if ($('#control_bar .btn_split').hasClass("disabled")) {
      return;
    }
  
    $('#control_bar .bar_btn').not(this).removeClass('selected');
    $(this).toggleClass('selected');
  
    var splitBar = $('#split_bar');
    if ($(this).hasClass('selected'))
      $(splitBar).fadeIn(300);
    else
      $(splitBar).fadeOut(300);
  });
  
  /** Device Table Delegates**/
  $('#device_list').delegate('.device_cell','mouseenter mouseleave', function(event) {
    var row = $(this).closest('.device_cell');
    var fav_btn = $(row).find('.favorite');
    if (event.type === 'mouseenter'){
      $(fav_btn).css('visibility', 'visible');
    }
    else {
      if (!$(fav_btn).hasClass('selected'))
        if (!$(this).hasClass('selected'))
          $(fav_btn).css('visibility', 'hidden');
    }
  });
  
  $("#device_list").delegate(".device_cell", "click", function() {
    $('.device_cell').removeClass('selected');
    $(this).addClass('selected');
    $(this).find('.favorite').css('visibility', 'visible');
    var fav_btn_list = $('.device_cell').not(this).find('.favorite');
    $.each( fav_btn_list, function( index, fav_btn ) {
      if (!$(fav_btn).hasClass('selected')) {
        $(fav_btn).css('visibility', 'hidden');
      }
    });
  });
  
  $("#device_list").delegate(".device_cell .device_btn.connect", "click", function() {
    var row = $(this).closest('.device_cell');
    $(row).trigger('click');
    var rowIndex = $(".device_cell").index(row);
    var device = deviceList.items[rowIndex];
    var targetAddress = device.values().ipAddress;

    client.connectToHost(targetAddress, presenter.settings.userName);
    mainView.setBusyWithReason('Connecting');
  });
  
  $("#device_list").delegate(".device_cell .device_btn.control", "click", function() {
    var row = $(this).closest('.device_cell');
    var rowIndex = $(".device_cell").index(row);
  
    var device = deviceList.items[rowIndex];
    var a = document.createElement('a');
    a.href = 'http://' + device.values().ipAddress ;//+ '/cgi-bin/web_index.cgi?lang=en&src=AwLoginDownload.html';
    a.target='_blank';
    a.click();
  });
  
  $("#device_list").delegate(".device_cell .favorite", "click", function() {
    var row = $(this).closest('.device_cell');
    var rowIndex = $(".device_cell").index(row);
    $(this).toggleClass("selected");
    var deviceItem = deviceList.items[rowIndex];
    var item = deviceList.items[rowIndex];
    var simpleDevice = {
        ssidName: item.values().name,
        ipAddress: item.values().ipAddress
    };
  
    if ($(this).hasClass("selected")){
      preference.addToFavorite(simpleDevice);
      item.values({isFavorite: 'true'});
    }
    else {
      preference.removeFromFavorite(simpleDevice);
      item.values({isFavorite: 'false'});
      if (!item.values().isReachable) {
        deviceList.remove('ipAddress', item.values().ipAddress);
      }
    }
    _reorderDeviceList();
  });
  
  $("#device_list").delegate(".device_cell .icon", "click", function() {
    var row = $(this).closest('.device_cell');
    if ($(row).hasClass('connected'))
      client.disconnect();
      // presenter.logOut();
  });
  
  $('#manual_connection .manual_input').keydown(function (e){
    if(e.which == 13) { // enter key code
      $('#manual_connection .manual_btn.connect').trigger( "click" );
      $(this).blur();
    }
  });
  
  $('#manual_connection .manual_btn.connect').off().click(function(){
    var manualIp = $('#manual_input').val().trim();
    client.connectToHost(manualIp, presenter.settings.userName);
    mainView.setBusyWithReason('Connecting');
  });
  
  $('.password_input').keydown(function (e){
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)
    // allows backspace
        && e.keyCode !== 8
    // allows enter
        && e.keyCode !== 13
    // allows esc
        && e.keyCode !== 27) {
        e.preventDefault();
        return;
    }
    var digit = 'digit_';
    // backspace
    if (e.keyCode === 8) {
      // go to previous digit only if current one is empty
      if (!($(this).val())) {
        e.preventDefault();
        $(this).val('');
        var class_name = "";
        for (var i = 0; i < 4; i++) {
          class_name = digit + (i+1);
          if ($(this).hasClass(class_name) && (i !== 0)) {
            $("#passwordContainer .password_input").get(i-1).focus();
          }
        }
      }
    }
    else if (e.keyCode === 13) {
      $('.password_btn.confirm').trigger('click');
      $(this).blur();
    }
    else if (e.keyCode === 27) {
      $('.password_btn.cancel').trigger('click');
    }
    else {
      if (e.keyCode >= 48 && e.keyCode <= 57) {
        if ($(this).val().length > 0) {
          $(this).val('');
        }
      }
    }
  });
  
  $('.password_input').on('input',function(e){
    if ($(this).hasClass('digit_1')) {
      if ($(this).val().length > 0)
        $("#passwordContainer .password_input").get(1).focus();
    }
    else if ($(this).hasClass('digit_2')) {
      if ($(this).val().length > 0)
        $("#passwordContainer .password_input").get(2).focus();
    }
    else if ($(this).hasClass('digit_3')) {
      if ($(this).val().length > 0)
        $("#passwordContainer .password_input").get(3).focus();
    }
    else if ($(this).hasClass('digit_4')) {
    }
    _checkLogInCodeLength();
  });
  
  $(".password_input").click(function(){
    $(this).val('');
    _checkLogInCodeLength();
  });
  
  $('.password_btn.cancel').off().click(function() {
    $('.password_input').val('');
    $('#passwordContainer').hide();
    $('.device_cell.connected').removeClass('connected');
    client.disconnect();
    mainView.setMessagePanel();
  });
  
  $('.password_btn.confirm').off().click(function() {
    if ($(this).hasClass('enabled')) {
      var pwd = _retrievePassword();
      if (pwd.length === 4) {
        var rows = $('.device_cell.connected');
        if (!rows) {
          console.log("No device is connected");
          return;
        }
        var rowIndex = $(".device_cell").index(rows[0]);
  
        client.login(presenter.settings.userName, pwd);
        // _connectWithRowIndex(rowIndex, pwd);
      }
    }
  });
  
  $('#split_bar .btn_split').click(function() {
    var splitIndex = $("#split_bar .btn_split").index($(this));
    if (mainView.currentSelectSplit !== splitIndex) {
      mainView.toggleSplitBtn(mainView.currentSelectSplit, splitIndex);
      $("#control_bar .control.btn_split").trigger('click');
      if (client.isMirroring) {
        client.startMirroring(mainView.currentSelectSplit);
      }
    }
  });
});

  function _resetErrorContainer()
  {
    var errBox = $('#errorContainer .dialogBox');
    errBox.removeClass('busy');
    errBox.removeClass('onWait');
    errBox.removeClass('onExit');
  }

  function _updateControlBar() {
    var expanded = $('#control_panel .btn_expand').hasClass('selected');
    var isConnected = client.isConnected;
    var didStart = client.isMirroring;
    var supports4in1 = client.supports4in1;
    if (isConnected && !expanded) {
      $('#device_bar').hide();
      $('#control_bar').show();
    }
    else {
      $('#control_bar').hide();
      $('#device_bar').show();
    }
    $('#control_bar .btn_split').removeClass("disabled");
    if (!supports4in1)
      $('#control_bar .btn_split').addClass("disabled");
  }
  
  function _retrievePassword() {
    var pwdInputs = $('.password_input');
    var pwdLength = pwdInputs.length;
    var pwd = '';
    for (var p = 0; p<pwdLength; p++) {
      pwd += $($(pwdInputs).get(p)).val();
    }
    return pwd;
  }
  
  function _checkLogInCodeLength() {
    var pwd = _retrievePassword();
    $('.password_btn.confirm').removeClass('enabled');
    if (pwd.length === 4) {
      $('.password_btn.confirm').addClass('enabled');
    }
  }
  
  function _deviceAtAddress(address) {
    var index = indexOfAddress(address);
    device = (index > -1) ? deviceList.items[index] : null;
    return device;
  }
  
  function _classFromSplit(split) {
    if (split > 4) {
      split = 0;
    }
    // var splitOption = $(".split_container .btn_split").get(split);
    var splitOption = $("#split_bar .btn_split").get(split);
    var splitClass = $(splitOption).attr('class').split(' ')[1];
    return splitClass;
  }
  	
	function _stringFromSplit(split) {
	  var strSplit = 'Display_FS';
	  if (split === 1) {
	      strSplit = 'Display_TF';
	  }
	  else if (split === 2) {
	    strSplit = 'Display_TR';
	  }
	  else if (split === 3) {
	    strSplit = 'Display_BF';
	  }
	  else if (split === 4) {
	    strSplit = 'Display_BR';
	  }
	  return strSplit;
	}
	
  function _insertNewDeviceCell(device) {
    deviceList.add( { name: device.ssidName,
                      isReachable: device.isReachable,
                      isFavorite: device.isFavorite,
                      ipAddress: device.ipAddress,
                      requiresPassword: (device.disableLoginCode === 0),
    } );
    var items = deviceList.items;
    var newDeviceRow = items[items.length - 1].elm;

    // TODO: change wireless_device to correct class base on device info
    // $(newDeviceRow).find(".device_attrs .icon" ).toggleClass("wireless_device");
    
    var favoriteIcon = $(newDeviceRow).find(".device_attrs .favorite");
    if (device.isFavorite) {
      if (!$(favoriteIcon).hasClass("selected"))
        $(favoriteIcon).addClass("selected");
      $(favoriteIcon).css('display', 'block');
      $(favoriteIcon).css('visibility', 'visible');
    }

    var msg_connect = localizedString("Connect");
    $('.device_cell .device_label.connect').text(msg_connect);

    _reorderDeviceList();
    return newDeviceRow;
  }
  
  function _reorderDeviceList() {
    deviceList.sort('isFavorite', { order: "desc" });
  }

  function indexOfDevice(device) {
    var index = -1;
    if (device.ipAddress){
      index = indexOfAddress(device.ipAddress);
    }
    return index;
  }

  function indexOfAddressOrName(address, name) {
    var index = -1;
    if (!address && !name) {
      return index;
    }
    else {
      $.each(deviceList.items, function(i, deviceB) {
        if (address === deviceB.values().ipAddress
            || name === deviceB.values().name) {
          index = i;
        }
      });
      return index;
    }
  }

  function indexOfAddress(address) {
    var index = -1;
    if (!address) {
      return index;
    }
    else {
      $.each(deviceList.items, function(i, deviceB) {
        if (address === deviceB.values().ipAddress) {
          index = i;
        }
      });
      return index;
    }
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
    },
    function(pWindow) {
      pWindow.drawAttention();
    }
  );
}

function createPerformanceWindow() {
  chrome.app.window.create('view/performance.html',
    {
      id: 'performance',
      // frame: 'none',
    	outerBounds: {
    	  left: 0,
    	  top: 0,
    	  width: 320,
    	  height: 700,
    	},
    	resizable: false,
    	focused: true,
    // 	hidden: true
    },
    function(pWindow) {
      pWindow.drawAttention();
    }
  );
}