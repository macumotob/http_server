var mk = require('./maketor');
/*
mk.generate("./site/data/folders_maket.html",
  [
    { "name": "THIS 1" },
    { "name": "THIS 2" }
  ], function (html) {
  console.log(html);
  });
var x = mk.get_folder_content("E:\\_Archives\\");
console.log(x);
*/
mk.load_makets("E:\\github\\http_server\\site\\data\\bread.html",
  function (err) { console.log(err);},
  function (data) {
  console.log(data);
});