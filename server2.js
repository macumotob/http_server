var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    mk = require("./maketor"),
    db = require("./maxdb"),
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
  var fileName = "site/data/folders.json";
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

//function redirect(callback) {
//  var fileName = "/data/folders.json";
//  fs.readFile(fileName, { encoding: 'utf-8' }, function (err, data) {
//    if (err) {
//      console.log("error in redirect" + err);
//      return;
//    }
//  //    throw err;

//    if (data) {
//      var arr = eval("arr=" + data);
//      callback(arr);
//      return;
//    }
//  });
//}
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
  {"Content-Type": "text/plain;" },
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

function fm_send(res,file,options) {
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
  }).read();

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
  if (end < start) {
    res.writeHead(416, {
      "Content-Range": "bytes */"+ total
    });
    res.end();
    console.log("Invalide range :" + (end - start));
    return;
  }

  var chunksize = (end - start) + 1
  //if (chunksize > maxchunk) {
  //  //chunksize = maxchunk;
  //}
  //console.log("start:" + start + " end:" + end + " chunk:" + chunksize);
  //console.log("total: " + total + " " + file);

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
    "File-Size": total,
    "Connection" : "keep-alive",
    "Content-Range": "bytes " + start + "-" + end + "/" + total,
    "Accept-Ranges": "bytes",
    "Content-Length": chunksize
   // "Content-Type": "video/mp4"
  });

  fm_send(res,file, options);

}
function send_file_quicktime(req, res, file, x) {

  console.log("QT :" + file);
  console.log(req.headers);

  var maxchunk = 1024 * 64;

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
  console.log("total: " + total + " range:" + x.range);
  console.log("QT start:" + start + " end:" + end + " chunk:" + chunksize);
  

  var options = {
    'flags': 'r'
  , 'encoding': null
  , 'mode': 0666
  , 'bufferSize': maxchunk
  , 'start': start
  , 'end': end
  };

  res.writeHead(206 , {
    //if(x.winphone){
    "Access-Control-Allow-Origin": "*",
    "Etag": "a404b-c3f-47c3a14937c80",
    //"File-Size": chunksize,
    "Content-Encoding": 'gzip' ,
    "Content-Range": "bytes " + start + "-" + end + "/" + total,
    "Accept-Ranges": "bytes",
    "Content-Length": chunksize,
    "Content-Type": "video/mp4"
  });
  
  
   fm_send(res, file, options);
  //var zlib = require("zlib");
  //var stream = fs.createReadStream(file, options);
  //stream.pipe(zlib.createGzip()).pipe(res)
  //.on("error", function (e) {
  //  console.log("QT ERROR : " + e);
  //});

  //res.pipe(zlib.createGunzip()).pipe(stream);

  //var gunzip = zlib.createGunzip();
  //stream.pipe(gunzip);
  //res.pipe(gunzip);

  //gunzip.on('data', function (data) {
  //  res.write(data);
  //}).on("end", function () {
  //  res.end();
  //}).on("error", function (e) {
  //  res.end();
  //});

  //zlib.deflate(streem, function (err, buffer) {
  //  if (err) throw err;

  //  res.writeHead(200, {
  //    'Content-Encoding': 'deflate',
  //    'Content-Type': 'text/javascript'
  //  });

  //  res.end(buffer);
  //});
  //var gunzip = zlib.createGunzip();
  //response.pipe(gunzip);
  //gunzip.on('data', function (data) {

  //  buffer.push(data);
  //}).on("end", function () {
  //  res.writeHead(200, { "Content-Type": "application/json;  charset=windows-1251;" });
  //  res.write(s);
  //  res.end();

  //}).on("error", function (e) {
  //  //callback(e);
  //});




}
function fm_send_zip(filename, res) {

  //console.log("ZIP:" + filename);
  var zlib = require('zlib');
  //var http = require('http');
  var fs = require('fs');

  var raw = fs.createReadStream(filename);

  var headers = {};
  headers["Content-Type"] = "text/plain; charset=windows-1251;";
  headers["Content-Encoding"] = "gzip";
  //headers["Content-Encoding"] = "deflate";

  res.writeHead(200, headers);
  
  raw.pipe(zlib.createGzip())
    .on('error', function (e) {
      console.log(e)
    })
    .pipe(res)
    .on('error', function (e) {
      console.log(e)
    })
    .on('finish', function () {  // finished
     // console.log('done send commpress');
      raw.close();
  });
  return;
  
  raw.pipe(zlib.createDeflate()).pipe(res);
  return;
  //var acceptEncoding = request.headers['accept-encoding'];
  //if (!acceptEncoding) {
  //  acceptEncoding = '';
  //}

  //if (acceptEncoding.match(/\bdeflate\b/)) {
  //  response.writeHead(200, { 'content-encoding': 'deflate' });
  //  raw.pipe(zlib.createDeflate()).pipe(response);
  //} else if (acceptEncoding.match(/\bgzip\b/)) {
  //  response.writeHead(200, { 'content-encoding': 'gzip' });
  //  raw.pipe(zlib.createGzip()).pipe(response);
  //} else {
  //  response.writeHead(200, {});
  //  raw.pipe(response);
  //}

}
function send_file(response,filename,is_mobile) {

 // console.log("send_file : " + filename);
  is_mobile = true;
  var contentTypesByExtension = {
    '.html': "text/html",
    '.css':  "text/css",
    '.js': "text/javascript",
    '.json': "application/json",
    '.txt': "text/plain; charset=windows-1251;"
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
        filename += (is_mobile ? '/mobile/index.html' : '/index.html');
    }
   
    var stats = fs.statSync(filename);
    var total = stats["size"];

//    console.log("send size :" + total + " file" + filename);

    var headers = {};
    var ext = path.extname(filename);
  //  console.log("EXT:" + ext);

    if (ext === ".txt") {
      return fm_send_zip(filename, response);
    }
    var contentType = contentTypesByExtension[ext];
    if (contentType) {
      headers["Content-Type"] = contentType;
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
function fm_process_get(x, req, res) {


 // console.log(req.headers['accept-encoding']);
  var query = decodeURIComponent(req.url);
  var ua = req.headers['user-agent'];
  var quicktime = ua.indexOf("QuickTime") >= 0;
  //  console.log("agent:" + ua);
  //  console.log("range:" + x.range + " quick:" + quicktime);
  //  console.log(req.headers);
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
        return send_file_part(req, res, x.prms.file, x);
      }
      return send_file(res, x.prms.file, x.mobile);
    case "get.maket":
      // console.log(wfolder + x.prms.name);
      mk.parse(wfolder + x.prms.name, function (data) { send_json(res, data); });
      return;
    case "mkdir":
      return fm_create_folder(res, x.prms.folder, x.prms.name);
    case "get.servers":
      db.get_servers(function (data) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(data);
        res.end();
      });
      return;

    case "links.page":
      db.links_get_page(x.prms.offset, x.prms.count, function (data) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(data);
        res.end();
      });
      return;
    case "links.edit":
      db.links_edit(x.prms.id, function (data) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(data);
        res.end();
      });
      return;
    case "links.delete":
      db.links_delete(x.prms.id, function (data) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(data);
        res.end();
      });
      return;

    case "notes.get":
      db.notes_get_page(x.prms.offset, x.prms.count, function (data) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(data);
        res.end();
      });
      return;
    case "notes.delete":
      db.notes_delete(x.prms.id, function (data) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(data);
        res.end();
      });
      return;
    case "notes.note":
      db.notes_note(x.prms.id, function (data) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(data);
        res.end();
      });
      return;
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
        upload_file(req, res, prms);
      }
      return;
    }
    //  send_file(res, x.file, x.mobile);
    //  return;
    //if (quicktime) {
    //  return send_file_quicktime(req, res, x.file, x);
    //}
    if (x.range || x.winphone === "1") {
      return send_file_part(req, res, x.file, x);
    }

    return send_file(res, x.file, x.mobile);
  }

}
function fm_process_post(x,req,res) {

    var method = x.func;
    var body = '';

    if (x.query === '/open' || x.query === '/continue' || x.query === '/close') {
      var action = req.headers['baybak-action'];
      var info = req.headers['coba-file-info'];
      var ctype = req.headers['content-type'];
      if (info) {
        
        var qs = require("querystring");
        var prms = qs.parse(info);
     //   console.log("upload params:" + prms);
        upload_file(req, res, prms);
      }
      return;
    }
    //  send_file(res, x.file, x.mobile);
    //  return;
    //if (quicktime) {
    //  return send_file_quicktime(req, res, x.file, x);
    //}
    if (x.range || x.winphone === "1") {
      return send_file_part(req, res, x.file, x);
    }

    //return send_file(res, x.file, x.mobile);
    /////////////////
    req.on('data', function (data) {
      body += data;

    });
    req.on('end', function () {

      var qs = require("querystring");
      var prms = qs.parse(body);
      if (method === "note.add") {
        db.notes_add(prms.txt, function (data) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.write(data);
          res.end();
        });
      }
      else if (method === "note.update") {
        db.notes_update(prms.id, prms.txt, function (data) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.write(data);
          res.end();
        });
      }
      else if (method === "links.update") {
        db.links_update(prms.id, prms, function (data) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.write(data);
          res.end();
        });
      }
      else if (method === "links.add") {
        db.links_add(prms, function (data) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.write(data);
          res.end();
        });
      }
    });
    return;
}

http.createServer(function(req, res) {

  //    console.log("url:" +decodeURIComponent(req.url));
  //  var uri = decodeURIComponent(url.parse(request.url).pathname)
  //     , filename = decodeURIComponent(path.join(process.cwd(), uri));
  //   console.log(req.connection.remoteAddress);
      var x = check_redirect(req);
      switch (req.method) {
        case "POST":
          fm_process_post(x,req,res);
          break;
        case "GET":
          fm_process_get(x, req, res);
          break;
        default:
          console.log("ERROR METHOD :" + req.method);
          break;
      }
}).listen(port,host);


function register_server() {

  var http = require('http');

    //http://maxbuk.com/regsrv.php?name=waswas_lenovo&port=3030
    //Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.124 Safari/537.36
  var options = {
    host: 'www.maxbuk.com',
    path: '/regsrv.php?name=WASWAS HOME&port=3035', // + port
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.124 Safari/537.36',
      'Accept': '*/*',
      "Host": "xyz.com:8000",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate",
      "DNT": "1",
      "Referer": "http://localhost:8000/test/",
      "Origin": "http://localhost:8000",
      "Connection": "keep-alive",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
      "Content-Length": 0
    }
  };

  callback = function(response) {
    var str = '';
    response.header("Content-Type", "application/json; charset=utf-8");
    response.on('data', function (chunk) {
       // str += encodeURI(chunk);
    });

    response.on('end', function () {
      console.log(str);
      console.log(".........................................");
      console.log(response.headers);
    });
  }

  http.request(options, callback).end();
}
function load_registered_servers123(res) {

  var http = require('http');
  var zlib = require("zlib");

  //http://maxbuk.com/regsrv.php?name=waswas_lenovo&port=3030
  //Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.124 Safari/537.36
  var options = {
    host: 'www.maxbuk.com',
    path: '/srvlist2.php', // + port
    encoding: 'binary',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.124 Safari/537.36',
      'Accept': '*/*',
      "Host": "xyz.com:8000",
      "Accept": "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate",
      "DNT": "1",
      "Referer": "http://localhost:8000/test/",
      "Origin": "http://localhost:8000",
      "Connection": "keep-alive",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
      "Content-Length": 0
    }
  };
  

  var buffer = [];
  var s = "";

  callback = function (response) {

    var gunzip = zlib.createGunzip();
    response.pipe(gunzip);
    gunzip.on('data', function (data) {

      buffer.push(data);
    }).on("end", function () {

      //var StringDecoder = require('string_decoder').StringDecoder;
      //var decoder = new StringDecoder('utf-8');

      //var s = buffer.join("");
      //console.log(decoder.write(s));

      res.writeHead(200, { "Content-Type": "application/json;  charset=windows-1251;" });
      res.write(s);
      res.end();

    }).on("error", function (e) {
      //callback(e);
    });

  //  var str = '';
  //  response.setEncoding('utf-8');
  //  response.on('data', function (chunk) {
  //    str += chunk;
  //  });

  //  response.on('end', function () {
  //    //{ "Content-Type": "text/plain; charset=windows-1251;" }

  //    //var body = new Buffer(str, 'binary');
  //    //conv = new iconv.Iconv('windows-1251', 'utf8');
  //    //body = conv.convert(body).toString();
  //    //console.log(body);

  //    console.log(str);
  //    console.log(response.headers);
  //    res.writeHead(200,{ "Content-Type": "text/plain;charset=windows-1251;" });
  //    res.write(str);
  //    res.end();
  //  });
  }

 http.request(options, callback).end();
}



var mysql = require('mysql');

load_public_folders();

process.chdir(wdir);
var os = require("os");
wfolder =  process.cwd();
console.log("host : " + os.hostname() + "\nfolder:" + wfolder);


console.log("Static file server running at http://"
    + host + ":" + port + "/\nCTRL + C to shutdown");


var os = require('os');

var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

console.log(addresses);
//load_registered_servers();
//register_server();

