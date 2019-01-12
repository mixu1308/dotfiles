function localizedString(key) {
  var str = chrome.i18n.getMessage(key); 
  if (!str || str.length===0) {
    console.log("Un-localized string: " + key);
    str = key;
    // str = key.toUpperCase();
  }
  return str;
}

function bigEndianBufferFromLittleEndianInteger(intValue, size) {
  var result = new Int8Array(size);
  var i = 0;
  while (size > 0) {
    result[--size] = 0xff & (intValue >> (i * 8));
    i++;
  }
	return result;
}

function int8FromBuffer(buffer) {
  return new DataView(buffer).getInt8(0);
}

function int16FromBuffer(buffer) {
  return new DataView(buffer).getInt16(0);
}

function int32FromBuffer(buffer) {
  return new DataView(buffer).getInt32(0);
}

function stringToUint8Array(string, callback) {
  // var stringToUint8Array = function(string) {
  var buffer = new ArrayBuffer(string.length);
  var view = new Uint8Array(buffer);
  for(var i = 0; i < string.length; i++) {
    view[i] = string.charCodeAt(i);
  }
  if (callback) {
    callback(buffer);
  }
  return buffer;
}
  
function arrayBufferToString(buffer, callback){
  var str = String.fromCharCode.apply(null, new Uint8Array(buffer));
  if (callback) {
    callback(str);
  }
  return str;
  // return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

function ipAddressFromBufferArray(bufferArray, seperator) {
  var result = [], i=0, length=bufferArray.length;
  for(i = 0; i < length; i++){
    result.push(bufferArray[i]);
  }
  return result.join(seperator);
}

function blobFromDataURI(dataURI) {
  //decodes a string of data which has been encoded using base-64 encoding
  var atobResult= atob(dataURI.split(',')[1]);
  var buffer= new ArrayBuffer(atobResult.length);
  var bufferView= new Uint8Array(buffer);
  for(var i=0; i<atobResult.length;i++){
    bufferView[i]=atobResult.charCodeAt(i);
  }
  return bufferView;
}

function removeVP8(sdp) {
  console.log("SDP before manipulation: " + sdp);
  //updated_sdp = sdp.replace("m=video 1 RTP/SAVPF 100 116 117 96 120 121\r\n","m=video 1 RTP/SAVPF 120 121\r\n");
  //updated_sdp = sdp.replace("m=video 1 RTP/SAVPF 100 116 117 96 120 121\r\n","m=video 1 RTP/SAVPF 120\r\n");
  updated_sdp = sdp.replace("m=video 9 RTP/SAVPF 100 116 117 120 96\r\n","m=video 9 RTP/SAVPF 120\r\n");
  updated_sdp = updated_sdp.replace("","");
  updated_sdp = updated_sdp.replace("a=rtpmap:100 VP8/90000\r\n","");
  updated_sdp = updated_sdp.replace("a=rtpmap:120 H264/90000\r\n","a=rtpmap:120 H264/90000\r\na=fmtp:120 profile-level-id=42e01f;packetization-mode=1\r\n");

  updated_sdp = updated_sdp.replace("a=rtcp-fb:100 nack\r\n","");
  updated_sdp = updated_sdp.replace("a=rtcp-fb:100 nack pli\r\n","");
  updated_sdp = updated_sdp.replace("a=rtcp-fb:100 ccm fir\r\n","");
  updated_sdp = updated_sdp.replace("a=rtcp-fb:100 goog-remb\r\n","");
  updated_sdp = updated_sdp.replace("a=rtpmap:116 red/90000\r\n","");
  updated_sdp = updated_sdp.replace("a=rtpmap:117 ulpfec/90000\r\n","");
  updated_sdp = updated_sdp.replace("a=rtpmap:96 rtx/90000\r\n","");
  updated_sdp = updated_sdp.replace("a=fmtp:96 apt=100\r\n","");

  updated_sdp = updated_sdp.replace("a=rtpmap:121 CAST1/90000\r\n","");
  updated_sdp = updated_sdp.replace("a=rtcp-fb:121 ccm fir\r\n","");
  updated_sdp = updated_sdp.replace("a=rtcp-fb:121 nack\r\n","");
  updated_sdp = updated_sdp.replace("a=rtcp-fb:121 nack pli\r\n","");
  updated_sdp = updated_sdp.replace("a=rtcp-fb:121 goog-remb\r\n","");
  
  console.log("SDP after manipulation: " + updated_sdp);

  return updated_sdp;
}
