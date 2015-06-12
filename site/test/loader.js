function id(name) {
  var items = document.querySelectorAll(name);
  return items[0];
}
function load_async(file,onsuccess) {
  var xhr = new XMLHttpRequest();
  xhr.open("get", file, true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
        var text = xhr.responseText;
        onsuccess(text);
      }
    }
  };
  xhr.send(null);
}
function load_async_json(file, onsuccess) {
  load_async(file, function (text) {
    var x = eval(text);
    onsuccess(x);
  });
}
function load_async_script(file) {
  load_async(file, function (text) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.text = text;
    document.body.appendChild(script);
  });
}
function load_script(url,callback) {

  var script = document.createElement("script")
  script.type = "text/javascript";
  if (script.readyState) { //IE
    script.onreadystatechange = function () {
      if (script.readyState == "loaded" || script.readyState == "complete") {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else { //Others
    script.onload = function () {
      callback();
    };
  }
  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
}
function load_style(url, callback) {

  var style = document.createElement("link")
  style.type = "text/css";
  style.rel = 'stylesheet';

  if (style.readyState) { //IE
    style.onreadystatechange = function () {
      if (style.readyState == "loaded" || style.readyState == "complete") {
        style.onreadystatechange = null;
        callback();
      }
    };
  } else { //Others
    style.onload = function () {
      callback();
    };
  }
  style.href = url;
  document.getElementsByTagName("head")[0].appendChild(style);
}
//--------------------------------------------------------------------------


//XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
//  alert(header + ": " + value);
//  this.xhr.setRequestHeader(header, value);

//};

//var open = XMLHttpRequest.prototype.open;

//XMLHttpRequest.prototype.open = function (method, uri, async, user, pass) {

// // this.setRequestHeader('range', 'bytes 0-');
//  this.addEventListener("readystatechange", function (event) {
//    if (this.readyState == 4) {
//      var self = this;
//      var response = {
//        method: method,
//        uri: uri,
//        responseText: self.responseText
//      };
//      console.log(response);
//    } else if (this.readyState === 2) {
//      var self = this;
//    //  self.setRequestHeader("accept-range", "bytes");
//      this.onloadstart = function () {
//        self.setRequestHeader("accept-range", "bytes");
//      };
//    } else {
//      console.log(this.readyState);
//    }
//  }, false);
//  var self = this;
//  this.onloadstart = function () {
//    self.setRequestHeader("accept-range", "bytes");
//  };

//  return open.apply(this, arguments);
////  open.call(this, method, uri, async, user, pass);
//};
  //XMLHttpRequest.prototype.open = function (method, url, async, user, password)
  //{
  //  alert(url);
  //  if (this.__proto__ && this.__proto__.open) {
  //    return this.__proto__.open(method, url, async, user, password); //send it on
  //  }
  //  if (this.open) {
  ////    return this.open(method, url, async, user, password); 
  //  }
//}
//var send = XMLHttpRequest.prototype.send;

//XMLHttpRequest.prototype.send = function (data) {
//  this.setRequestHeader('range','bytes 0-');

//  console.log('send');

//  // send.call(this, data);

// return send.apply(this, arguments);
//}