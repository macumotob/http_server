var fs = require("fs");
var url = require("url");
var path = require("path");
var mk = require("./maketor");
var zlib = require('zlib');

function fmclient() {
  this.func = "/";
  this.method = null;
  this.file = null;
  this.prms = null;
  this.mobile = null;
  this.query = null;
  this.range = null;
  this.winphone = null;
  this.useragent = null;

  this.parse = function (req) {

    var query = decodeURIComponent(req.url);
    var uri = query;
    var p = decodeURIComponent(url.parse(req.url).pathname);
    this.file = decodeURIComponent(path.join(process.cwd(), p));

    var ua = req.headers['user-agent'];
    var is_mobile = ua && /phone|iphone/i.test(ua);

    this.method = req.method;
    this.mobile = (ua && /phone|iphone/i.test(ua));
    this.query = query;
    this.range = req.headers['range'];
    this.winphone = req.headers['getcontentfeatures.dlna.org'];
    this.useragent = req.headers['user-agent'];
    this.fm_command = this.parse_command();
    this.folders = null;
    return this;
  };
  this.parse_command = function () {
    var i = this.query.indexOf("?");
    if (i > -1) {
      var strprms = this.query.substr(i + 1, this.query.length - i);
      this.func = this.query.substr(1, i - 1);

      var qs = require("querystring");
      this.prms = qs.parse(strprms);
      return true;
    }
    return false;
  };
  this.is_command = function () {
    return this.fm_command;
  };

  this.send_folder_content = function (res, folder) {
    
    var f = mk.get_folder_content(folder, this.folders);
    exports.send_json(res, f);
  };

 this.send_get_response = function (req, res) {

      switch (this.func) {
        case "get.folder":
          return this.send_folder_content(res, this.prms.folder);

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

      if (this.func === "/") {

        if (this.query === '/open' || this.query === '/continue' || this.query === '/close') {
          var action = req.headers['baybak-action'];
          var info = req.headers['coba-file-info'];
          var ctype = req.headers['content-type'];
          if (info) {
            var qs = require("querystring");
            var prms = qs.parse(info);
            upload_file(req, res, prms);
          }
          return;
        }
        //  send_file(res, x.file, x.mobile);
  //      //  return;
  //      //if (quicktime) {
  //      //  return send_file_quicktime(req, res, x.file, x);
  //      //}
        if (this.range || this.winphone === "1") {
          return send_file_part(req, res, this.file, this);
        }

        return this.send_file(res, this.file, this.mobile);
        //this.send_zip(this.file, res);
     }
 };

 this.send_file = function (response, filename, is_mobile) {

   // console.log("send_file : " + filename);
   is_mobile = true;
   var contentTypesByExtension = {
     '.html': "text/html",
     '.css': "text/css",
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
       console.log("file name :" + filename);
     }

     var stats = fs.statSync(filename);
     var total = stats["size"];

     //    console.log("send size :" + total + " file" + filename);

     var headers = {};
     var ext = path.extname(filename);
     //  console.log("EXT:" + ext);

     if (ext === ".txt") {
       return exports.send_zip(filename, response);
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
 };

}; // end of
function fmconfig() {
  this.config = null;
  this.redirect = function (req) {
    var x = new fmclient().parse(req);
    x.folders = this.config.folders;
    if (x.fm_command) {
      for (var prop in x.prms) {
        x.prms[prop] = this.convert_path(x.prms[prop]);
      }
    }
    if (x.query.indexOf("/~") === 0) {
      uri = x.query.substr(1);
      x.file = this.convert_path(uri);
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

  };
  this.convert_path = function (folder) {
    var arr_path = folder.split('/');
    var xpath;
    for (var i = 0, max = this.config.folders.length; i < max ; i++) {
      item = this.config.folders[i];
      if (('~' + item.name) === arr_path[0]) {
        arr_path.shift();
        xpath = item.path + arr_path.join('/');
        return xpath;
      }
    }
    return folder;
  }

}

exports.load_config = function (name, cb) {

  console.log("load config: " + name);
  var fileName = "./config.json";
 

  //fs2.readFileSync(fileName, { encoding: 'utf-8' ,flag:'r'}, function (err, data) {
  fs.readFile(fileName,null, function (err, data) {
    if (err) {
      console.log("error in load_confing" + err);
      cb(null);
      return;
    }
    if (data) {
      
      var config = eval("config=(" + data +")");
      if (config[name]) {
        var result = config[name];
        var conf = new fmconfig();
        conf.config = result;
        cb(conf);
      }
      else {
        console.log("invalide name :" + name);
        console.log(config);
        cb(null);
      }
    }
  });
};

exports.send_json = function (res, data) {
  res.writeHead(200,
 { "Content-Type": "application/json" },
 { "Cache-Control": "no-cache, no-store, must-revalidate" },
 { "Pragma": "no-cache" },
// { "Content-Encoding" : "gzip"},
 { "Expires": -1 }
);
 res.write(JSON.stringify(data));
 res.end();
 // exports.send_zip_data(JSON.stringify(data), res);
}
exports.send_zip_data = function (data, res) {

  console.log("zip : " + data);
  var zlib = require('zlib');
  //var http = require('http');

  //var headers = {};
  //headers["Content-Type"] = "text/plain; charset=windows-1251;";
  //headers["Content-Encoding"] = "gzip";
  ////headers["Content-Encoding"] = "deflate";
  var input = new Buffer(data,'utf-8');
  //res.writeHead(200, headers);
  zlib.gzip(input, function (_, result) {  // The callback will give you the 
    res.end(result);
    
  });

  //input.pipe(zlib.createGzip())
  //  .on('error', function (e) {
  //    console.log(e)
  //  })
  //  .pipe(res)
  //  .on('error', function (e) {
  //    console.log(e)
  //  })
  //  .on('finish', function () {  // finished
  //    // console.log('done send commpress');
  //    input.close();
  //  });
  return;

  //raw.pipe(zlib.createDeflate()).pipe(res);
 // return;
};
exports.send_zip = function (filename, res) {


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
};



