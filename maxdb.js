var mysql = require('mysql');

var cnn = mysql.createConnection({
  //host: 'maxbuk.mysql.ukraine.com.ua',
  //user: 'maxbuk_db',
  host: '192.168.0.103',
  port : 3306,
  user: 'maxim',
  password: 'bukshovan2009',
  database: 'maxbuk_db'
});

cnn.connect();

function json_result() {
  return { result: true, msg: null , text:null};
}


function exec(sql,prms,cb) {

  var x = json_result();
  try {
    cnn.query(sql,prms, function (err, results) {
      if (err) {
        x.msg = err;
        x.text = sql + " prms:" + JSON.stringify(prms);
        x.result = false;
      }
      else {
        x.msg = results[0];
      }
      cb(JSON.stringify(x));
    });
  } catch (err) {
    x.msg = err;
    x.text = sql + " prms:" + JSON.stringify(prms);
    x.result = false;
    cb(JSON.stringify(x));
  }
}

exports.get_servers = function (cb) {

  var x = json_result();
  try {
    cnn.query("select * , DATE_FORMAT( regtime,  '%d-%M-%Y %h:%m:%s' ) AS dt from mb_servers", function (err, results) {
      if (err) {
        x.msg = err;
        x.text = "Error select from mb_servers . table not exists";
        x.result = false;
      }
      else {
        x.msg = results;
        x.result = false;
      }
      cb(JSON.stringify(x));
    });
  } catch (err) {
    console.log(err);
    x.msg = err;
    x.text = "Error select from mb_servers . table not exists";
    x.result = false;
    cb(JSON.stringify(x));
  }
}

exports.links_get = function (offset, count, cb) {
  offset = parseInt(offset);
  count = parseInt(count);
  exec("call youtube_get_page(?,?)", [offset, count], cb);
}
exports.notes_get = function (offset, count, cb) {
  offset = parseInt(offset);
  count = parseInt(count);
  exec("call diary_get_page(?,?)", [offset, count], cb);
  //exec("select id,txt , DATE_FORMAT( ldt,  '%d-%M-%Y %h:%m:%s' ) AS data  from diary order by ldt desc  limit ?,?", [offset, count], cb);
}
exports.notes_note = function (id,cb) {
  cnn.query("select id,txt , DATE_FORMAT( ldt,  '%d-%M-%Y %h:%m:%s' ) AS data  from diary where id=?",[id], function (err, results) {
    var x = { result: true, msg: null };
    if (err) {
      x.msg = JSON.stringify(err);
      x.result = false;
    }
    else {
      x.msg = results;
    }
    cb(JSON.stringify(x));
  });
}

exports.notes_delete = function (id, success) {
  cnn.query("delete from diary where id=?", [id], function (err, results) {
    var x = {result: true, msg:null};
    if (err) {
      x.msg = JSON.stringify(err);
      x.result = false;
    }
    else {
      x.msg = "affected " + results.affectedRows;
    }
    success(JSON.stringify(x));
 });
}
exports.notes_add = function (txt, cb) {
  cnn.query("insert into diary (txt,ldt) values(?,now())", [txt], function (err, results) {
    var x = { result: true, msg: null };
    if (err) {
      x.msg = JSON.stringify(err);
      x.result = false;
    }
    else {
      x.msg = "affected " + results.affectedRows;
    }
    cb(JSON.stringify(x));
  });
}
exports.notes_update = function (id, txt, cb) {
  cnn.query("update diary set txt=? ,ldt=now() where id=?", [txt,id], function (err, results) {
    var x = { result: true, msg: null };
    if (err) {
      x.msg = JSON.stringify(err);
      x.result = false;
    }
    else {
      x.msg = "affected " + results.affectedRows;
    }
    cb(JSON.stringify(x));
  });
}