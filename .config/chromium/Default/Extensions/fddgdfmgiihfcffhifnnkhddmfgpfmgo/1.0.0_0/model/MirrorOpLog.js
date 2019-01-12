let logError    = 1 << 0;
let logWarning  = 1 << 1;
let logInform   = 1 << 2;
let logCmd      = 1 << 3;
let logIB       = 1 << 4;
let logOther    = 1 << 5;
let logObject   = 1 << 6;
let logAll      = logError | logWarning | logInform | logCmd | logOther;
let logDebug    = logError | logWarning | logCmd;
let logDebugIb  = logDebug | logIB;
let logRelease  = logError | logWarning;

moPerformance = {
        imageCount: 0,
        imageSize: {
          width: 0,
          height: 0,
        },
        bufferSize: {
          all: 0,
          max: 0,
          min: 0,
          ave: 0,
        },
        imageProcessingTime: {
          all: 0,
          max: 0,
          min: 0,
          ave: 0,
        },
        socketCommandTime: {
          all: 0,
          max: 0,
          min: 0,
          ave: 0,
        }
};

logLevel = logInform;
// logLevel = logDebug;
// logLevel = logDebugIb;
// logLevel = logRelease;
// logLevel = logAll;

function moLog(msg, level) {
  level = (typeof level == 'undefined') ? logOther : level;
  var prefix = null;
  var resultLV = level & logLevel;
  if (resultLV == logError) {
    prefix = "[E] >>> ";
  }
  else if (resultLV == logWarning) {
    prefix = "[W] >>> ";
  }
  else if (resultLV == logInform) {
    prefix = "[I] >>>";
  }
  else if (resultLV == logIB) {
    prefix = "[IB] >>> ";
  }
  else if (resultLV == logCmd){
    prefix = "[CMD] >>> ";
  }
  else if (resultLV == logOther){
    prefix = "[O] >>> ";
  }
  if (prefix) {
    console.log(prefix, msg);
  }
  
  // var resultMsg = null;
  // var resultLV = level & logLevel;
  // if (resultLV == logError) {
  //   resultMsg = "[E]  : " + msg;
  // }
  // else if (resultLV == logWarning) {
  //   resultMsg = "[W]: " + msg;
  // }
  // else if (resultLV == logInform) {
  //   resultMsg = "[I] : " + msg;
  // }
  // else if (resultLV == logIB) {
  //   resultMsg = "[IB] : " + msg;
  // }
  // else if (resultLV == logCmd){
  //   resultMsg = "[CMD] : " + msg;
  // }
  // else if (resultLV == logOther){
  //   resultMsg = "[Other]  : " + msg;
  // }
  
  // if (resultLV === logObject) {
  //   console.log(msg);
  // }
  // else {
  //   if (resultMsg)
  //     console.log(resultMsg);
  // }
}

function moLogTime(display) {
  var time = new Date().getTime();
  if (display)  {
    console.log(time);
  }
  return time;
}

function logImageBufferSize(bfSize) {
  moPerformance.bufferSize.all += bfSize;
  moPerformance.bufferSize.max = (moPerformance.bufferSize.max < bfSize) ? bfSize : moPerformance.bufferSize.max;
  moPerformance.bufferSize.min = (moPerformance.bufferSize.min > bfSize || moPerformance.bufferSize.min === 0) ? bfSize : moPerformance.bufferSize.min;
}

function logImageProcessingTime(timeSpent) {
  moPerformance.imageCount++;    
  moPerformance.imageProcessingTime.all += timeSpent;
  moPerformance.imageProcessingTime.max = (moPerformance.imageProcessingTime.max < timeSpent) ? timeSpent : moPerformance.imageProcessingTime.max;
  moPerformance.imageProcessingTime.min = (moPerformance.imageProcessingTime.min > timeSpent || moPerformance.imageProcessingTime.min === 0) ? timeSpent : moPerformance.imageProcessingTime.min;
}

function logImageRequestTime(timeSpent) {
  moPerformance.socketCommandTime.all += timeSpent;
  moPerformance.socketCommandTime.max = (moPerformance.socketCommandTime.max < timeSpent) ? timeSpent : moPerformance.socketCommandTime.max;
  moPerformance.socketCommandTime.min = (moPerformance.socketCommandTime.min > timeSpent || moPerformance.socketCommandTime.min === 0) ? timeSpent : moPerformance.socketCommandTime.min;
}

function logPerformance(callback) {
  if (callback)
    callback(moPerformance);
  else
    console.log(moPerformance.imageCount);
}

function resetPerformance() {
  moPerformance = {
        imageCount: 0,
        imageSize: moPerformance.imageSize,
        bufferSize: {
          all: 0,
          max: 0,
          min: 0,
          ave: 0,
        },
        imageProcessingTime: {
          all: 0,
          max: 0,
          min: 0,
          ave: 0,
        },
        socketCommandTime: {
          all: 0,
          max: 0,
          min: 0,
          ave: 0,
        }
      };
}
