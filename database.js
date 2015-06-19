Error.stackTraceLimit = Infinity;

//var cps = require('cps.js');

var db = require('node-mysql');

var DB = db.DB;

var cb = function() {
    var handleError = function(e) {
        if (e.stack) {
            console.log(e.stack);
        } else {
            console.log(e);
        }
    };

    var start = new Date();
    return function(err, res) {
        try {
            var end = new Date();
            console.log('time spent: ', end-start);
            if (err) {
                handleError(err);
            } else {
                console.log(res);
            }
            box.end();
        } catch(e) {
            handleError(e);
            box.end();
        }
    };
}();

var box = new DB({
    host     : 'maxbuk.mysql.ukraine.com.ua',
    user     : 'maxbuk_db',
    password : 'bukshovan2009',
    database : 'maxbuk_db',
    connectionLimit: 50,
    useTransaction: {
        connectionLimit: 1
    },
    useCursor: {
        connectionLimit: 1
    }
});

var basicTest = function(cb) {
    box.transaction(null, function(conn, cb) {
        cps.seq([
            function(_, cb) {
                conn.query('select * from user_profiles limit 1', cb);
            },
            function(res, cb) {
                console.log(res);
                cb();
            }
        ], cb);
    }, cb);
};

var scehmaTest = function(cb) {
    box._prepare(cb);
};

var cursorTest = function(cb) {
    box.connect(function(boxConn, cb) {
        var q = 'select * from user_profiles';

        box.cursor(q, function(row, cb) {
            // boxConn.query(q, cb);
            // throw new Error('foobar');
            console.log(row);
            cb();
        }, function(err, res) {
            if (err) {
                console.log(err);
            }
            cb(err, res);
        });
    }, cb);
};

function execute(cnn, sql) {
  cnn.query(sql, function (err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log("Table Ter_Stops Created");
  }
});

}

var createDB = function(cb) {
  box.connect(function (cnn, cb) {

    var stms = [
      "DROP TABLE TerStops",
      'CREATE TABLE TerStops (Stop_id int, Stop_name VARCHAR(100),Stop_lat VARCHAR(100),Stop_lon VARCHAR(100), PRIMARY KEY(Stop_id))'
    ];

    var i = 0;
    cnn.query(stms[i],
    function (err, result) {

      if (err) {
        console.log(err);
      } else {
        console.log("Table Ter_Stops Created");
      }
    });
  }, cb);
};

//cursorTest(cb);

var createTest = function (cb) {
  box.connect(function (conn, cb) {
    cps.seq([
        function (_, cb) {
          User.Table.create(conn, {
            first_name: 'Hannah',
            last_name: 'Mckay',
            gender: 'female'
            // .... 
          }, cb);
        },
        function (user, cb) {  // user is an object of the class User.Row 
          console.log(user.get('first_name')); // print out 'Hannah' 
          cb();
        }
    ], cb);
  }, cb);
};
createTest(cb);
//var modelTest = function(cb) {
//    box.add({
//        name: 'coupons',
//        idFieldName: 'coupon_id'
//    })
//    ;

//    box.add({
//        name: 'products',
//        idFieldName: 'product_id'
//    })
//    ;

//    var oldBox = box;

//    box = box.clone();

//    box.extend({
//        name: 'coupons',
//        Row: {
//            getDiscountType: function() {
//                return this._data['discount_type'];
//            }
//        }
//    })
//        .linksTo({
//            name: 'product',
//            table: 'products',
//            key: 'product_id'
//        })
//    ;

//    var Coupon = box.get('coupons').Table;

//    box.connect(function(conn, cb) {
//        cps.seq([
//            function(_, cb) {
//                var q = Coupon.baseQuery('where product_id is not null limit 1');
//                Coupon.find(conn, q, cb);
//            },
//            function(coupons, cb) {
//                cps.pmap(coupons, function(coupon, cb) {
//                    // coupon.linksTo(conn, 'product', cb);
//                    cb(null, coupon.getDiscountType());
//                }, cb);
//            }
//        ], cb);
//    }, cb);
//};

//cps.rescue({
//    'try': function(cb) {
//        cursorTest(cb);
//    },
//    'catch': function(err, cb) {
//        console.log('cps exception caught');
//        throw err;
//    }
//}, cb);
