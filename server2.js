var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
mk = require("./maketor"),
    port = 3030,
    host= "localhost",
    wdir = "site",
    wfolder;


process.argv.forEach(function (val, index, array) {
 
  wfolder = process.cwd() + "/" + wdir + "/";
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
/*
function send_json(res, text) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.write(text);
  res.end();
}
*/
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
function path_convert(folder) {
  var arr_path = folder.split('/');
  var xpath;
  for (var i = 0, max = public_folders.length; i < max ; i++) {
    item = public_folders[i];
    if (('~' + item.name) === arr_path[0]) {
      arr_path.shift();
      xpath = item.path + arr_path.join('/');
      return xpath;
    }
  }
  return folder;
}

var public_folders;

function load_public_folders() {
  var fileName = "site/mobile/data/folders.json";
  fs.readFile(fileName, { encoding: 'utf-8' }, function (err, data) {
    if (err) {
      console.log("error in load_public_folders" + err);
      return;
    }

    if (data) {
      public_folders = eval("public_folders=" + data);
     // console.log(public_folders);
    }
  });
}

function redirect(callback) {
  var fileName = "/mobile/data/folders.json";
  fs.readFile(fileName, { encoding: 'utf-8' }, function (err, data) {
    if (err) {
      console.log("error in redirect" + err);
      return;
    }
  //    throw err;

    if (data) {
      var arr = eval("arr=" + data);
      callback(arr);
      return;
    }
  });
}
/*
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
}*/
function send_text(res,s) {
  res.writeHead(200,
  {"Content-Type": "text/plain" },
  {"Cache-Control" : "no-cache, no-store, must-revalidate"},
  {"Pragma" : "no-cache"},
  {"Expires": 0 });
  res.write(s);
  res.end();
}
function send_json(res, data) {
  res.writeHead(200,
 { "Content-Type": "application/json" },
 { "Cache-Control": "no-cache, no-store, must-revalidate" },
 { "Pragma": "no-cache" },
 { "Expires": -1 }
);
  res.write(JSON.stringify(data));
  res.end();
}
function send_folder_content(response, folder) {
 // console.log("send_folder_content :" + folder);
  var f = mk.get_folder_content(folder,public_folders);
  send_json(response,f);
}


function fm_create_folder(res, folder, name) {
  var xpath = folder + name;
 // console.log("fm_create_folder : " + xpath);
  try {
    fs.mkdirSync(xpath, { encoding: 'utf8' });
    send_json(res, { result: 1, msg: "created" });
 //   load_public_folders();
  } catch (e) {
    console.log(e.toString());
    send_json(res, {result: 0, msg: e.toString() });
  }
}
function send_file_part(req, res, file, x) {

  var maxchunk = 64 * 1024;

  var stats = fs.statSync(file);
  var total = stats["size"];
  var start = 0, end = total - 1;

  if (x.range) {
    var positions = x.range.replace(/bytes=/, "").split("-");
    start = parseInt(positions[0], 10);
    end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    if (end === 1) {
      end = total - 1;
    }
  }
  var chunksize = (end - start) + 1

 // console.log("start:" + start + " end:" + end + " chunk:" + chunksize);
//  console.log("total: " + total + " " + file);

  var options = {
    'flags': 'r'
  , 'encoding': null
  , 'mode': 0666
  , 'bufferSize': maxchunk
  , 'start': start
  , 'end': end
  };

  res.writeHead(206, {
    //if(x.winphone){
    "Access-Control-Allow-Origin": "*",
    "TransferMode.DLNA.ORG": "Streaming",
    "File-Size": chunksize,

    "Content-Range": "bytes " + start + "-" + end + "/" + total,
    "Accept-Ranges": "bytes",
    "Content-Length": chunksize
 //   "Content-Type": "video/mp4"
  });

  var stream = fs.createReadStream(file, options)
  .on('data', function (chunk) {
    res.write(chunk);
  })
  .on('error', function (err) {
    console.log("error :" + err);
    res.end();
  })
  .on('end', function () {
    res.end();
   // console.log("end...:" + file);
  }).read();

}
function send_file_quicktime(req, res, file, x) {

  console.log("QT :" + file);
  var maxchunk = 64 * 1024;

  var stats = fs.statSync(file);
  var total = stats["size"];
  var start = 0, end = total - 1;

  if (x.range) {
    var positions = x.range.replace(/bytes=/, "").split("-");
    start = parseInt(positions[0], 10);
    end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    if (end === 1) {
      end = total - 1;
    }
  }
  else
  {
    start = 0; end = total - 1;
  }
  var chunksize = (end - start) + 1

  console.log("QT start:" + start + " end:" + end + " chunk:" + chunksize);
  //  console.log("total: " + total + " " + file);

  var options = {
    'flags': 'r'
  , 'encoding': null
  , 'mode': 0666
  , 'bufferSize': maxchunk
  , 'start': start
  , 'end': end
  };

  res.writeHead((x.range? 206 :200), {
    //if(x.winphone){
    //"Access-Control-Allow-Origin": "*",
    //"File-Size": chunksize,

    "Content-Range": "bytes " + start + "-" + end + "/" + total,
    "Accept-Ranges": "bytes",
    "Content-Length": chunksize,
    "Content-Type": "video/mp4"
  });
  //if (chunksize === 2) {
  //  res.write("\0\0");
  //  res.end();
  //  return;
  //}
  var stream = fs.createReadStream(file, options)
  .on('data', function (chunk) {
    res.write(chunk);
  })
  .on('error', function (err) {
    console.log("error :" + err);
    res.end();
  })
  .on('end', function () {
    res.end();
    // console.log("end...:" + file);
  }).read();

}

function send_file(response,filename,is_mobile) {

 // console.log("send_file : " + filename);
  is_mobile = true;
  var contentTypesByExtension = {
    '.html': "text/html",
    '.css':  "text/css",
    '.js': "text/javascript",
    '.json': "application/json",
'.txt':"text/plain"
  };


  fs.exists(filename, function (exists) {
    if (!exists) {
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.write("404 Not Found\n");
      response.write(" File : " + filename);
      response.end();
      console.log('error 404 not exists:' + filename);
      return false;
    }

    if (fs.statSync(filename).isDirectory()) {
      filename += (is_mobile ? '/mobile/index.html': '/index.html');
    }
   
    var stats = fs.statSync(filename);
    var total = stats["size"];

//    console.log("send size :" + total + " file" + filename);

    var headers = {};
    var ext = path.extname(filename);
    var contentType = contentTypesByExtension[ext];
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    else {
    }

  //  206 Partial Content
  //  Content-Type: video/mp4
    headers["Content-Length"] = total;
    headers["Accept-Ranges"] = "bytes";
    headers["Content-Range"] = "bytes 0-" + total + "/" + total;
    
    response.writeHead(206, headers);

    var stream = fs.createReadStream(filename, "binary")
    .on('data', function (data) { response.write(data); })
    .on('error', function (error) { response.end(); console.log(error); })
    .on('end', function () { response.end(); }).read();
  });
  return true;
}
function upload_file(req, res, info) {

  var filename = decodeURIComponent(info.name);

//  redirect(function (folders) {
    var file = convert_path(public_folders, filename);


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
  //});
}


function check_redirect(req) {

  var query = decodeURIComponent(req.url);
  var uri = query;
  
  var p = decodeURIComponent(url.parse(req.url).pathname)
    , filename = decodeURIComponent(path.join(process.cwd(), p));


  var ua = req.headers['user-agent'];
  var is_mobile = ua && /phone|iphone/i.test(ua);

  var x = {
    func: "/",
    file:filename,
    prms: null,
    mobile: (ua && /phone|iphone/i.test(ua)),
    query: query,
    range: req.headers['range'],
    winphone: req.headers['getcontentfeatures.dlna.org'],
    useragent : req.headers['user-agent']
  };

  var i = query.indexOf("?");

  if (i > -1) {
    var strprms = query.substr(i + 1, query.length - i);
    x.func = query.substr(1, i - 1);

    var qs = require("querystring");
    x.prms = qs.parse(strprms);
    for (var prop in x.prms) {
      x.prms[prop] = path_convert(x.prms[prop]);
    }
  }
  if (query.indexOf("/~") === 0) {
    uri = query.substr(1);
    //x.query = path.join(process.cwd(),path_convert(uri));
    x.file= path_convert(uri);
  }
  if (false) {
    console.log("------- x <<<---------------------");
    console.log("  x.file:" + x.file);
    console.log("  x.query:" + x.query);
    console.log("  x.func:" + x.func);
    console.log("  x.mobile:" + x.mobile);
    console.log("  x.range:" + x.range);
    console.log("  x.winphone:" + x.winphone);
    console.log("  x.useragent:" + x.useragent);
    if (x.prms) {
      console.log("-------prms <<<---------------------");
      for (var prop in x.prms) {
        console.log("   " + prop + "=" + x.prms[prop]);
      }
      console.log("------->>>---------------------");
    }
    console.log(" .. headers:");
    for (var prop in req.headers) {
      console.log("   " + prop + "=" + req.headers[prop]);
    }

    console.log("-------x >>>---------------------");
  }
  return x;
}

http.createServer(function(req, res) {

  try {
   var x = check_redirect(req);

//    console.log("url:" +decodeURIComponent(req.url));
  //  var uri = decodeURIComponent(url.parse(request.url).pathname)
 //     , filename = decodeURIComponent(path.join(process.cwd(), uri));
  
    var query= decodeURIComponent(req.url);
    var ua = req.headers['user-agent'];
    var quicktime = ua.indexOf("QuickTime") >= 0;
    console.log("agent:" + ua);
    console.log("range:" + x.range + " quick:" + quicktime);
    console.log(req.headers);
  //  var is_mobile = /phone|iphone/i.test(ua);

    switch (x.func) {
      case "get.folder":
        return send_folder_content(res, x.prms.folder);

      case "get.file":
        if (quicktime) {
          return send_file_quicktime(req, res, x.prms.file, x);
        }
        if (x.range || x.winphone) {
         //  console.log(x.prms.file);
           return send_file_part(req, res, x.prms.file,x);
          }
         return send_file(res, x.prms.file, x.mobile);
      case "get.maket":
       // console.log(wfolder + x.prms.name);
        mk.parse(wfolder + x.prms.name, function (data) { send_json(res,data);});
        return;
      case "mkdir":
        return fm_create_folder(res, x.prms.folder, x.prms.name);
       
      default:
        break;
    }

    if (x.func === "/") {

      if (x.query === '/open' || x.query === '/continue' || x.query === '/close') {
        var action = req.headers['baybak-action'];
        var info = req.headers['coba-file-info'];
        var ctype = req.headers['content-type'];
        if (ctype) {
          //console.log('type   :' + ctype);
        }
        if (action) {
          //console.log("action : " + action);
        }
        if (info) {
         // console.log("upload info:" + info);
          var qs = require("querystring");
          var prms = qs.parse(info);
          upload_file(req, res,prms);
        }
        return;
      }
    //  send_file(res, x.file, x.mobile);
      //  return;
      if (quicktime) {
        send_file_quicktime(req, res, x.file, x);
      }
      else if (x.range || x.winphone === "1") {
          send_file_part(req, res, x.file, x);
          }
          else {
           send_file(res, x.file,x.mobile);
         }
        return;
    }
  }
  catch (err) {
    error_handler(res, err);
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
load_public_folders();

process.chdir(wdir);
var os = require("os");
wfolder =  process.cwd();
console.log("host : " + os.hostname() + "\nfolder:" + wfolder);


console.log("Static file server running at http://"
    + host + ":" + port + "/\nCTRL + C to shutdown");