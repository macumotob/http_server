var mysql = require('mysql');

var cnn = mysql.createConnection({
  host: 'maxbuk.mysql.ukraine.com.ua',
  user: 'maxbuk_db',
  password: 'bukshovan2009',
  database: 'maxbuk_db'
});

cnn.connect();

//var query = cnn.query("create table diary (\
//id INT NOT NULL AUTO_INCREMENT,\
//dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\
//txt text, \
//PRIMARY KEY (id))");

var query = cnn.query("insert into diary (txt) values(?)",["Третья записть " + new Date().getUTCFullYear()]);



query.on('error', function (err) {
  console.log('error:' + err);
});

query.on('fields', function (fields) {
  console.log('fields:' + fields);
});

query.on('result', function (row) {
  console.log('result:' + row);
});

var txt = "Это вторая запись.",
    rowid = 1;

cnn.query('update diary set txt=?  WHERE id=? ', [txt, rowid], function (err, results) {
  if (err) {
    console.log('err2:' + err);
  }
  console.log("results :" + JSON.stringify(results));
});
var queryString = 'select * from diary';

cnn.query(queryString, function (err, rows, fields) {
  if (err) throw err;
  //    for (var i in result) {
  //    }

  for (var i in rows) {
    var r = rows[i];
    console.log(r.id + ' : ' + r.dt + " ; " + r.txt);
  }
});


cnn.end();