printInfoLog("Attemping to connect...");

var socket = io.connect("http://localhost:3000");
var currentDevice = ''
var currentiOS = ''
var currentSDK = ''


/*
================================
Socket.io handlers
=================================
*/

socket.on('connect', () =>{
	printInfoLog("Connected successfully...");
});

socket.on('updateDeviceAndiOSList', (item)=>{
  printInfoLog("Updating device and OS list...");
  addListToDropdown('#device-dropdown', item.device);
  addListToDropdown('#ios-dropdown', item.ios);
  printInfoLog("We are good to go!");
});

socket.on('updateSdkList', (list)=>{
  printInfoLog("Updating SDK list...");
  addListToDropdown('#sdk-dropdown', list);
});

socket.on('updateLog', (item)=>{
  logToScreen(item);
});

socket.on('gitUpdate', (item)=>{
  $('#git-status').text(item.log);
  $('#git-status').prop('class', getFontType(item));
});

socket.on('invalidField', (message)=>{
  removeAlert();  
  $('#alert-container').html('<div class="alert alert-danger fade in" role="alert">\
                                        <button class="close alert-dismissible" type="button" data-dismiss="alert" aria-label="Close">\
                                        <span aria-hidden="true">&times;</span>\
                                        </button>\
                                        <span>' + message + '</span></div>');
  printErrorLog("Your request won't be processed, there was an invalid field...");
});

/*
================================
Button actions
=================================
*/

$('#build-button').click((e)=>{
  var config = {
    filename: $('#filename-field').prop('value'),
    configuration: $('#config-field').prop('value'),
    scheme: $('#scheme-field').prop('value'),
    sdk: currentSDK,
    device: currentDevice,
    ios: currentiOS
  }
  printInfoLog("Sending build command to server and waiting for response...");
  removeAlert();
  socket.emit('build', config);
  e.preventDefault();
});

$('#clean-button').click((e)=>{
  var config = {
    filename: $('#filename-field').prop('value'),
    configuration: $('#config-field').prop('value'),
    scheme: $('#scheme-field').prop('value'),
    sdk: currentSDK,
    device: currentDevice,
    ios: currentiOS
  }
  printInfoLog("Sending clean command to server and waiting for response...");
  removeAlert();
  socket.emit('clean', config);
  e.preventDefault();
});

$('#run-button').click((e)=>{
  var config = {
    filename: $('#filename-field').prop('value'),
    configuration: $('#config-field').prop('value'),
    scheme: $('#scheme-field').prop('value'),
    sdk: currentSDK,
    device: currentDevice,
    ios: currentiOS
  }
  printInfoLog("Sending run command to server and waiting for response...");
  removeAlert();
  socket.emit('run', config);
  e.preventDefault();
});


$('#clean-folder-button').click((e)=>{
  printInfoLog("Sending clean command to server and waiting for response...");
  removeAlert();
  socket.emit('cleanFolder');
  e.preventDefault();
});

$('#update-git-button').click(()=>{
  socket.emit('cloneRequest', {url:$('#git-field').prop('value'), token:$('#token-field').prop('value')});
});

$(".dropdown-menu").on('click', 'li a', function(e){
  $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
  $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
  
  var id = $(this).parents('.dropdown').eq(0).prop('id')
  
  if(id == 'device-dropdown'){
    currentDevice = $(this).text();
  }else if(id == 'ios-dropdown'){
    currentiOS = $(this).text();
  }else{
    currentSDK = $(this).text();                      
  }
  e.preventDefault();
});


/*
================================
Utils
=================================
*/

function addListToDropdown(id, list){
  list.forEach((device)=>{
    $(id).children('ul').eq(0).append(
    $('<li>').append(
    $('<a>').prop({'text':device, 'href': '#'})));
  });
}

function removeAlert(){
  $('#alert-container').empty();
}

function logToScreen(item){
  var logClass = getFontType(item);
  var $li = $('<li>').prop('class', 'list-group-item');
  var $span = $('<span>').prop('class', logClass);
  
  $span.text('[' + item.time + '] - ' + item.log);
  
  $('#log-area:last-child').append(
  $li.append(
  $span));

  //Scroll to bottom
  var element = $("#log-area").get(0);
  element.scrollTop = element.scrollHeight;
}

    
function getFontType(item){
    switch(item.type){
    case "success":
      return "text-success";
    case "error":
      return "text-danger";
    case "warning":
      return "text-warning";
    case "info":
      return "text-info";
    default:
      return "white-font";
  }
}

function printInfoLog(message){
  var item = {
    type: "info",
    time: getCurrentTime(),
    log: message
  }
  logToScreen(item);
}

function printErrorLog(message){
    var item = {
    type: "error",
    time: getCurrentTime(),
    log: message
  }
  logToScreen(item);
}

function addPaddingZero(numberString){
  if(numberString.length < 2){
    return '0' + numberString;
  }else{
    return numberString;
  }
}

function getCurrentTime(){
  var date = new Date();
  var h = addPaddingZero(date.getHours().toString());
  var m = addPaddingZero(date.getMinutes().toString());
  var s = addPaddingZero(date.getSeconds().toString());

  return `${h}:${m}:${s}`
}