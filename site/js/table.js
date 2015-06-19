function fm_table(name) {

  this.name = name;
  this.offset = 0;

  this.show = function () {
  var count = 10;

  
  var self = this;
  var url = "/" + this.name + ".get?offset=" + this.offset + "&count=" + count + "&tm="+ new Date().getTime();
  load_async_json(url, function (data) {

    var info = id("#info");
    if (data.length == 0) {
      if (info) {
        info.innerHTML = "last records";
      }
      return;// self.show_add_note();
    }
    fm_set_main_content(generator.gen(data, name));
    if (info) {
      info.innerHTML = "records:" + self.offset;
    }
  });
}
}