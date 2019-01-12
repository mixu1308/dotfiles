(function(exports) {
  Array.prototype.stringCompare = function (string1, string2) {
    return string1.localeCompare(string2,'en', { sensitivity: 'base', numeric : 'true' });
  };
  Array.prototype.binaryInsert = function(object, property) {
    if (isNaN(Number(object))) {
      if (typeof object === 'string')
        this.stringBinaryInsert(object);
      else
        this.objectBinaryInsert(object, property);
    }
    else {
      this.numericBinaryInsert(object);
    }
  };
  
  // TODO string bineray Inser is missing objects
  Array.prototype.stringBinaryInsert = function(targetObject, startVal, endVal) {
    var length = this.length;
  	var start = typeof(startVal) != 'undefined' ? startVal : 0;
  	var end = typeof(endVal) != 'undefined' ? endVal : length - 1;//!! endVal could be 0 don't use || syntax
  	var m = start + Math.floor((end - start)/2);
  	
  	if(length === 0){
  		this.push(targetObject);
  		return;
  	}
  	
  	if (this.stringCompare(targetObject, this[end]) > 0) {
  		this.splice(end + 1, 0, targetObject);
  		return;
  	}
  	
  	if(this.stringCompare(targetObject, this[start]) < 0){
  		this.splice(start, 0, targetObject);
  		return;
  	}
  	
  	if(start >= end){
  		return;
  	}
  	
  	if (this.stringCompare(targetObject, this[m]) < 0){
  	  this.objectBinaryInsert(targetObject, start, m - 1);
  		return;
  	}
  	
  	if (this.stringCompare(targetObject, this[m]) > 0){
  	  this.objectBinaryInsert(targetObject, m + 1, end);
  		return;
  	}
  };
  
  Array.prototype.numericBinaryInsert = function(value, startVal, endVal) {
    var length = this.length;
  	var start = typeof(startVal) != 'undefined' ? startVal : 0;
  	var end = typeof(endVal) != 'undefined' ? endVal : length - 1;//!! endVal could be 0 don't use || syntax
  	var m = start + Math.floor((end - start)/2);
  	
  	if(length === 0){
  		this.push(value);
  		return;
  	}
   
  	if(value > this[end]){
  		this.splice(end + 1, 0, value);
  		return;
  	}
   
  	if(value < this[start]){
  		this.splice(start, 0, value);
  		return;
  	}
   
  	if(start >= end){
  		return;
  	}
   
  	if(value < this[m]){
  		this.numericBinaryInsert(value, start, m - 1);
  		return;
  	}
   
  	if(value > this[m]){
  		this.numericBinaryInsert(value, m + 1, end);
  		return;
  	}
  };
  
  Array.prototype.objectBinaryInsert = function(targetObject, property, startVal, endVal) {
    var length = this.length;
  	var start = typeof(startVal) != 'undefined' ? startVal : 0;
  	var end = typeof(endVal) != 'undefined' ? endVal : length - 1;//!! endVal could be 0 don't use || syntax
  	var m = start + Math.floor((end - start)/2);
  	
  	if(length === 0){
  		this.push(targetObject);
  		return;
  	}
  	
  	if (this.stringCompare(targetObject[property], this[end][property]) > 0) {
  		this.splice(end + 1, 0, targetObject);
  		return;
  	}
  	
  	if(this.stringCompare(targetObject[property], this[start][property]) < 0){
  		this.splice(start, 0, targetObject);
  		return;
  	}
  	
  	if(start >= end){
  		return;
  	}
  	
  	if (this.stringCompare(targetObject[property], this[m][property]) < 0){
  	  this.objectBinaryInsert(targetObject, property, start, m - 1);
  		return;
  	}
  	
  	if (this.stringCompare(targetObject[property], this[m][property]) > 0){
  	  this.objectBinaryInsert(targetObject, property, m + 1, end);
  		return;
  	}
  };
  
  Array.prototype.numericBinaryInsert = function(value, startVal, endVal) {
    var length = this.length;
  	var start = typeof(startVal) != 'undefined' ? startVal : 0;
  	var end = typeof(endVal) != 'undefined' ? endVal : length - 1;//!! endVal could be 0 don't use || syntax
  	var m = start + Math.floor((end - start)/2);
  	
  	if(length === 0){
  		this.push(value);
  		return;
  	}
   
  	if(value > this[end]){
  		this.splice(end + 1, 0, value);
  		return;
  	}
   
  	if(value < this[start]){//!!
  		this.splice(start, 0, value);
  		return;
  	}
   
  	if(start >= end){
  		return;
  	}
   
  	if(value < this[m]){
  		this.numericBinaryInsert(value, start, m - 1);
  		return;
  	}
   
  	if(value > this[m]){
  		this.numericBinaryInsert(value, m + 1, end);
  		return;
  	}
  };
  
  
  Array.prototype.binarySearch = function(object, property) {
    if (isNaN(Number(object))) {
      return this.objectBinarySearch(object, property);
    }
    else {
      return this.numericBinarySearch(object);
    }
  };
  
  Array.prototype.objectBinarySearch = function(targetObject, property) {
    var minIndex = 0;
    var maxIndex = this.length - 1;
    var currentIndex;
    var currentObject;
 
    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentObject = this[currentIndex];
        return currentObject[property].localeCompare(targetObject[property], 'en', { sensitivity: 'base', numeric : 'true' });
        // if (currentObject[property] < stargetObject[property]) {
        //     minIndex = currentIndex + 1;
        // }
        // else if (currentElement > searchElement) {
        //     maxIndex = currentIndex - 1;
        // }
        // else {
        //     return currentIndex;
        // }
    }
 
    return -1;
  };
  Array.prototype.numericBinarySearch = function(searchElement) {
    var minIndex = 0;
    var maxIndex = this.length - 1;
    var currentIndex;
    var currentElement;
 
    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentElement = this[currentIndex];
        if (currentElement < searchElement) {
            minIndex = currentIndex + 1;
        }
        else if (currentElement > searchElement) {
            maxIndex = currentIndex - 1;
        }
        else {
            return currentIndex;
        }
    }
 
    return -1;
  };
})(Array);