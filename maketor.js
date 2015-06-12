
function show_error(err, msg) {

  if (msg) {
    console.log(msg);
  }
  if (typeof err === 'object') {
    if (err.message) {
      console.log(err.message);
    }
    if (err.stack) {
      console.log(err.stack);
    }
  } else {
    console.log(err);
  }
  return false;
}
function parse_text(text) {
  var s, data = [];

  do {
    var i = text.indexOf("{{");

    if (i !== -1) {
      s = text.substr(0, i);
      text = text.substr(i + 2);
      data.push({"text":true,"value": s});

      i = text.indexOf("}}");
      if (i !== -1) {
        s = text.substr(0, i);
        data.push({ "text": false, "value": s });
        text = text.substr(i + 2);
      }
    }
  } while (i !== -1);

  if (text.length > 0) {
    data.push({ "text": true, "value": text });
  }
  return data;
  // trace
}

exports.get_folder_content = function(folder,public_folders) {

  var data = [];

  if (folder === "root") {
    for (var i = 0, max = public_folders.length; i < max ; i++) {
      var item = public_folders[i];
      data.push({ "name" : "~" + item.name , d: 1 });
    }
  }
  else {
    var fs2 = require('fs');
    var files = fs2.readdirSync(folder);

    for (var i in files) {
      var currentFile = folder + files[i];
      var stats = fs2.statSync(currentFile);
      
      if (stats.isFile()) {
        data.push({"name" :   files[i] ,d:0 , size : stats["size"]});
      }
      else if (stats.isDirectory()) {
        data.push({"name" :  files[i] + "/",d:1 , size : 0});
      }
    }
  }
  return data;
}
exports.read_file = function (fileName,onerror, ondata) {
//  console.log(fileName);
  var fs = require('fs');

  fs.exists(fileName, function (exists) {
    if (exists) {
      fs.stat(fileName, function (error, stats) {

        if (error) {
          return onerror(error, "error in maketor.parse" + error);
        }
        fs.open(fileName, "r", function (error, fd) {
          if (error) {
            return onerror(error);
          }
          var buffer = new Buffer(stats.size);

          fs.read(fd, buffer, 0, buffer.length, null, function (error, bytesRead, buffer) {
            if (error) {
              onerror(error);
            }
            else {
              var data = buffer.toString("utf8", 0, buffer.length);
              ondata(data);
            }
            fs.close(fd);
          });
        });
      });
    }
    else {
      onerror("file not found" + fileName);
    }
  });
}
exports.parse = function (fileName,ondata) {
  console.log(fileName);
  var fs = require('fs');

  fs.exists(fileName, function (exists) {
    if (exists) {
      fs.stat(fileName, function (error, stats) {

        if (error) {
          return show_error(error,"error in maketor.parse" + error);
        }
        fs.open(fileName, "r", function (error, fd) {
          if (error) {
            return show_error(error);
          }
          var buffer = new Buffer(stats.size);

          fs.read(fd, buffer, 0, buffer.length, null, function (error, bytesRead, buffer) {
            if (error) {
              show_error(error);
            }
            else {
              var data = buffer.toString("utf8", 0, buffer.length);
              var arr = parse_text(data);
              ondata(arr);
            }
            fs.close(fd);
          });
        });
      });
    }
    else {
      show_error("file not found" + fileName);
    }
  });

}
exports.generate = function (fileName, data, onsuccess) {
  this.parse(fileName, function (maket) {

    var html = "";
    for (var n = 0, max = data.length; n < max; n++) {
      var item = data[n];
      for (var i = 0, count = maket.length; i < count; i++) {
        var line = maket[i];
        if (line.text) {

        }
        else {
          console.log("expr:" + line);
          var s = eval(line.value);
          console.log(s);
        }
  //      console.log(line);
      }
    }
    onsuccess(html);
  });
}
exports.load_makets = function (fileName,onerror,onsuccess) {
  this.read_file(fileName, onerror, function (text) {
    var BEGIN = "<!--#", END = "-->";
    var data = [];
    var arr = text.split(BEGIN);
    for (var i = 0, count = arr.length; i < count; i++) {
      var item = arr[i];
      var n = item.indexOf(END);
      if (n !== -1) {
        var name = item.substr(0, n);
        var body = item.substr(n + END.length);
        data[name] = body;
      }
    }
    onsuccess(data);
  });
}