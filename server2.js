var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),

    port = 3030,
    host= "localhost",
    wdir = "site",
    wfolder;


process.argv.forEach(function (val, index, array) {
 
  switch(index)  {
    case 2:
      host = process.argv[2];
      break;
    case 3:
      port = parseInt(process.argv[3], 10);
      break;
    case 4:
      wdir = process.argv[4];
      break;
  }
});

console.log("host : " + host + " port:" + port + " wd:" + wdir);


function error_handler(response,err) {
  response.writeHead(404, { "Content-Type": "text/plain" });
  response.write("404 Not Found\n");
  if (typeof err === 'object') {
    if (err.message) {
      response.write('Error Message: ' + err.message + "\n");
      console.log(err.message);
    }
    if (err.stack) {
      response.write('Stacktrace:\n');
      response.write('====================\n');
      response.write(err.stack);
      console.log(err.stack);
    }
  } else {
    response.write('dumpError :: argument is not an object');
  }
  response.end();
  console.log("...>");
}
function show_404(req, res, text) {
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.write(text);
  res.end();
}

function convert_path(arr,folder) {
  var arr_path = folder.split('/');
  var xpath;
  for (var i = 0, max = arr.length; i < max ; i++) {
    item = arr[i];
    if (('~' + item.name) === arr_path[0]) {
      arr_path.shift();

      xpath = item.path + arr_path.join('/');
      break;
    }
  }
  return xpath;
}
function redirect(callback) {
  fs.readFile('mobile/data/folders.json', { encoding: 'utf-8' }, function (err, data) {
    if (err)
      throw err;

    if (data) {
      var arr = eval("arr=" + data);
      callback(arr);
      return;
    }
  });
}
function send_registered_folders(response,folders) {

  var s = "x=[";

  for (var i = 0, max = folders.length; i < max ; i++) {
    var item = folders[i];
    s += (i > 0 ? "," : "") + "{name:'~" + item.name + "',d:1}";
  }
  s += "]";
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.write(s);
  response.end();
}
function send_folder_content(response, folder) {
  redirect( function (folders) {

    if (folder === "root") {
      send_registered_folders(response,folders);
    }
    else {
      var s = "x=[";

      var arr_path = folder.split('/');
      var xpath = convert_path(folders, folder);

      if (xpath) {
        var fs2 = require('fs');
        var files = fs2.readdirSync(xpath);

        for (var i in files) {
          var currentFile = xpath + files[i];
          var stats = fs2.statSync(currentFile);
          if (i > 0) s += ",";
          if (stats.isFile()) {
            s += "{name:'" + files[i] + "',d:0}";
          }
          else if (stats.isDirectory()) {
            s += "{name:'" + files[i] + "/',d:1}"; //traverseFileSystem(currentFile);
          }
        }
      }
      else {
        s += "{name:'Error read " + folder + "',d:1}";
      }
      s += "]";

      response.writeHead(200, { "Content-Type": "text/plain" });
      response.write(s);
      response.end();
    }
      
  });
}

function send_file_content(response, filename) {

  redirect(function (folders) {
    var file = convert_path(folders,filename);
    send_file(response, file, false);
  });
}
function process_command(x,i,req, res) {
  try {

    var cmd = x.substr(i + 1, x.length - i);
    var func = x.substr(1, i - 1);

    var qs = require("querystring");
    var prms = qs.parse(cmd);
  //  console.log(cmd  + '  ' + func);
    if(func === "get.folder"){
      send_folder_content(res,prms.folder);
      return;
    }

    if (func === "get.file") {
      var f = prms.file;
      console.log(req.headers);
      var range = req.headers['range'];
      if (range) {
        console.log('range unsopported....');
        show_404(req, res, "range unsupported");
      }
      else {
        send_file_content(res, f);
      }
      return;
    }

    eval(fs.readFileSync(func) + '');
    func = func.substr(func, func.indexOf('.'));
    var s = func + "(response,prms);";
    eval(s);
  }
  catch (err) {
    console.log("ERROR !!!!!!!");
    error_handler(response, err);
  }
}

function send_file(response,filename,is_mobile) {

  var contentTypesByExtension = {
    '.html': "text/html",
    '.css':  "text/css",
    '.js': "text/javascript",
    '.json':"application/json"
  };


  fs.exists(filename, function (exists) {
    if (!exists) {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.write("404 Not Found\n");
      response.write(" File : " + filename);
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) {
      filename += (is_mobile ? '/mobile/index.html': '/index.html');
    }

    fs.readFile(filename, "binary", function (err, file) {
      if (err) {
        response.writeHead(500, { "Content-Type": "text/plain" });
        response.write(err + "\n");
        response.end();
        return;
      }

      var headers = {};
      var ext = path.extname(filename);
      var contentType = contentTypesByExtension[ext];
      if (contentType) {
        headers["Content-Type"] = contentType;
      }
      else {
      }
      response.writeHead(200, headers);
      response.write(file, "binary");
      response.end();
    });
  });
}
function upload_file(req, res, info) {

  var filename = decodeURIComponent(info.name);

  redirect(function (folders) {
    var file = convert_path(folders, filename);


    if (req.method == 'POST') {

      if(info.action == "close"){
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.write("{result:'ok', msg:'" + info.action + "', offset:" + info.end + "}");
            res.end();
            return;
      }
      var flag = (info.action === "open" ? "w" : "a");
      var stream = fs.createWriteStream(file, { 'flags': flag });

      var post_data = "", len = 0;
      req.on('data', function (data) {
        stream.write(data);
        len += data.length;
      });

      req.on('end', function () {
        stream.end();
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.write("{result:'ok', msg:'" + info.action + "', offset:" + info.end + "}");
            res.end();
      });

    } else {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end();
    }
  });
}
http.createServer(function(request, response) {

  try {

    var uri = decodeURIComponent(url.parse(request.url).pathname)
      , filename = decodeURIComponent(path.join(process.cwd(), uri));
  
    var query= decodeURIComponent(request.url);
    var ua = request.headers['user-agent'];
    var is_mobile = /phone|iphone/i.test(ua);

    var i = query.indexOf("?");
    if (i > -1) {
      process_command(query, i, request, response);
      return;
    }

    if (query === '/open' || query === '/continue' || query === '/close') {
      console.log('command : ' + query);
      var action = request.headers['baybak-action'];
      var info = request.headers['coba-file-info'];
      var ctype = request.headers['content-type'];
      if (ctype) {
        console.log('type   :'+ctype);
      }
      if (action) {
        console.log("action : " + action);
      }
      if (info) {
        var qs = require("querystring");
        var prms = qs.parse(info);
        upload_file(request, response, prms);

      }
    }
    else if (query === '/upload') {
      console.log(request.url);
    }
    else {
      send_file(response, filename, is_mobile);
    }
  }
  catch (err) {
    error_handler(response, err);
  }
}).listen(port,host);


function register_server() {

  var http = require('http');

  //http://maxbuk.com/regsrv.php?name=waswas_lenovo&port=3030
  var options = {
    host: 'www.maxbuk.com',
    path: '/regsrv.php?name=waswas_lenovo&port=3030'// + port
  };

  callback = function(response) {
    var str = '';

    response.on('data', function (chunk) {
      str += chunk;
    });

    response.on('end', function () {
      console.log(str);
      console.log(".........................................");
    });
  }

  http.request(options, callback).end();
}

//register_server();

process.chdir(wdir);
var os = require("os");
wfolder =  process.cwd();
console.log(os.hostname() + "  cwd:" + wfolder);


console.log("Static file server running at\n  => http://"
    + host + ":" + port + "/\nCTRL + C to shutdown");