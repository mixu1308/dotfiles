let CAPTURE_STOPPED = 0;
let CAPTURE_REQUESTING = 1;
let CAPTURE_DENIED = 2;
let CAPTURE_STARTED = 3;

var requestingId = null;
var presenter = presenter || {};
var CaptureModule = CaptureModule || {};

CaptuerModuleDelegate = function() {};
CaptuerModuleDelegate.prototype.onCaptureStateChangeEvent = null;
CaptuerModuleDelegate.prototype.onCaptureError = null;

presenter.capturer = null;

if (!navigator.getUserMedia)
  navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.mediaDevice.getUserMedia;

function initializeCaptureModule ()
{
  
}

/** @constructor */
function SreenCapture() {
  // createVideoWindow();
  initializeCaptureModule();
}

SreenCapture.prototype.delegate = new CaptuerModuleDelegate();
SreenCapture.prototype.currentStream = null;
SreenCapture.prototype.audioTrack = null;
SreenCapture.prototype.videoTrack = null;
SreenCapture.prototype.isCapturing = null;
SreenCapture.prototype.startCapturing = function() {
  if (CaptureModule.isCapturing){
    if (this.delegate.onCaptureStateChangeEvent)
      this.delegate.onCaptureStateChangeEvent(CAPTURE_STARTED);
  }
  else {
    if (this.delegate.onCaptureStateChangeEvent)
      this.delegate.onCaptureStateChangeEvent(CAPTURE_REQUESTING);
    if (requestingId)
      chrome.desktopCapture.cancelChooseDesktopMedia(requestingId);
    requestingId = chrome.desktopCapture.chooseDesktopMedia(["screen", "window"], _onAccessProved.bind(this));
  }
};
SreenCapture.prototype.stopCapturing = function() {
  // MediaStream.stop() is deprecated; use MediaStreamTrack.stop
  if (this.currentStream) {
    var tracks = this.currentStream.getTracks();
    for (var i = 0; i < tracks.length; i++) {
      tracks[i].stop();
    }
  }
};

function _onAccessProved(id) {
  if (!id) {
    if (this.delegate.onCaptureStateChangeEvent) {
      this.delegate.onCaptureStateChangeEvent(CAPTURE_DENIED);
      this.delegate.onCaptureStateChangeEvent(CAPTURE_STOPPED);
    }
  }
  else {
    navigator.getUserMedia({
      video: {
        mandatory: {  chromeMediaSource: "desktop",
                      chromeMediaSourceId: id,
                      maxWidth: 1920,
                      maxHeight: 1080}
      }
    }, _gotVideoStream.bind(this), _onStreamError.bind(this));
  }
}

function _gotVideoStream(stream) {
  this.currentStream = stream;
  this.videoTrack = stream.getVideoTracks()[0];
  navigator.getUserMedia({
    audio: true 
  }, _gotAudioStream.bind(this), _onStreamError.bind(this));
}

function _gotAudioStream(stream) {
  if (stream.getAudioTracks)
    this.audioTrack = stream.getAudioTracks()[0];
    
  this.currentStream.addTrack(this.audioTrack);
  moLog(this.currentStream.getTracks(), logInform);
  
  if (this.currentStream.oninactive === null)
    this.currentStream.oninactive = _onEndStream.bind(this);
  else
    this.currentStream.onended = _onEndStream.bind(this);   // onended is deprecated in v52
  
  if (this.delegate.onCaptureStateChangeEvent)
    this.delegate.onCaptureStateChangeEvent(CAPTURE_STARTED);
}

function _gotStream(stream) {
  console.log(stream.getAudioTracks(), stream.getVideoTracks());
  this.isCapturing = true;
  this.currentStream = stream;
  if (stream.oninactive === null)
    stream.oninactive = _onEndStream.bind(this);
  else
    stream.onended = _onEndStream.bind(this);   // onended is deprecated in v52
  if (this.delegate.onCaptureStateChangeEvent)
    this.delegate.onCaptureStateChangeEvent(CAPTURE_STARTED);
}

function _onEndStream() {
  if (this.delegate.onCaptureStateChangeEvent)
    presenter.capturer.delegate.onCaptureStateChangeEvent(CAPTURE_STOPPED);
  requestingId = null;
  this.currentStream = null;
  this.isCapturing = false;
}

function _onStreamError(error) 
{
  console.log(error);
  if (this.delegate.onError)
  {
    this.delegate.onError(error);
  }
}
