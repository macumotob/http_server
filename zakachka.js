function get_extention(url) {
  var i = url.length-1;
  var ext = "";
  while (i >= 0) {
    if (url[i] === '.') {
      return "." + ext;
    }
    ext = url[i] + ext;
    i--;
  }
  return null;
}
function process_links(links) {
  for (var i = 0, count = links.length; i < count;i++){
    var link = links[i];
    var ext = get_extention(link);
    if (ext) {
      console.log("ext:" + ext);
    }
    console.log(link);
  }
  console.log("count:" + links.length);
}

function begin(url) {

 // var http = require('http');
  var request = require('request');

  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var x = body.split("href=");
      var hrefs = [];
      var len = site.length;
      for (var i = 0, count = x.length; i < count; i++) {
        var s = x[i];
        var n = 0;
        while (n < s.length) {
          if (s[n] === '\"') {
            n++;
            var hr = "";
            while (n < s.length) {
              if (s[n] === '\"') {
                if (hr.indexOf(site) == 0) {
                  hrefs.push(hr.substr(len));
                }
                else {
                  console.log("extern: " + hr.indexOf(site) + " "+ hr);
                }
                break;
              }
              hr += s[n];
              n++;
            }
            break;
          }
          n++;
        }
      }
      process_links(hrefs);

    }
  });
}
//begin("http://kot-knigovod.ru/");
//begin("http://tululu.org/");
var site = "http://kot-knigovod.ru/";
begin("http://kot-knigovod.ru/stuff/psikhologija_nlp/");