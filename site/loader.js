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