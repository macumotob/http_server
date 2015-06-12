var lng = {
  ef: {
    worning: "Предупреждение",
    folder: "Папка",
    is_empty: "пустая.",
    can: "Вы можете ",
    create: "Создать подпапку",
    upload: "Выгрузить файла на сервер",
    or: "или",
    goback:"Выйти из папки"
  }
};

var img = {
  images: [],
  index : 0,
  image: null,
  elem_index: null,
  elem_count: null,
  path : null
, reg: function (file) {
  this.images.push(file);
}
, find: function () {
  if (this.image == null) {
    this.image = id("#img-view");
    this.elem_index = id("#img-index");
    this.elem_count = id("#img-count");
  }
}
, reset: function (path) {
  this.path = path;
  this.index = 0;
  this.images = [];
  this.image = null;
}
, first: function () {
  this.find();
  this.index = 0;
  this.refresh();
}
, last: function () {
  this.find();
  this.index = this.images.length - 1;
  this.refresh();
}
, next: function () {
  this.find();
  this.index++;
  if (this.index > this.images.length - 1) {
    this.index = 0;
  }
  this.refresh();
}
, prev: function () {
  this.find();
  this.index--;
  if (this.index < 0) {
    this.index = this.images.length - 1;
  }
  this.refresh();
}
, refresh: function () {
  var path = "get.file?file=" + this.path+ this.images[this.index];
  this.image.src = path;
  this.elem_index.innerHTML = (this.index + 1);
  this.elem_count.innerHTML = this.images.length;
}
};

var fm = {
  stack: [],
  is_popup_visible: false,
  consts: {
    main_content: "#fm-main-content"
  },
  state: {
    current: 0,
    upload: 1,
    create_folder: 2,
    navigator:3
  },
  errors :{
    create_folder: "specify the folder in which you want to create a subfolder",
    upload_select_folder : "specify the folder to which you want to upload files"
  },
  foreach : function(obj , callback){
    for (var i = 0, max = obj.length; i < max; i++) {
      var item = obj[i];
      callback(item, i);
    }
  }
, can_goback: function () {
  return (this.stack.length > 0);
}
  ,get_main_content : function () { return id(this.consts.main_content);}
  ,set_folder: function (folder) {
    if (folder !== "root") {
      if (folder === "..") {
        this.stack.pop();
      }
      else {
        this.stack.push(folder);
      }
      folder = this.stack.join('/');
      if (folder.length === 0) {
        folder = "root";
      }
    }
    else {
      this.stack = [];
    }
    this.is_popup_visible = false;
    return folder;
  }
,  join_path: function (decode) {
    var s = "";
    for (var i = 0, max = this.stack.length ; i < max; i++) {
      var x = this.stack[i];
      x = (x[x.length - 1] == '/') ? x.substr(0, x.length - 1) : x;
      s += (decode ? decodeURIComponent(x) : x) + '/';
    }
    return s;
}
//, generate: function (data, maket) {

//  var html = "";
//  var n = 0, max = data.length;

//  while (n < max) {
//    var item = data[n];
//    html += this.generate_one(item, maket, n);
//    n++;
//  }
//  return html;
//}
//, generate_one: function (item, maket, index) {

//  var html = "";
//  var i = 0, count = maket.length;
//  while (i < count) {
//    var line = maket[i];
//    if (line.text) {
//      html += line.value;
//      i++;
//      continue;
//    }

//      if (line.value === "foreach") {
//        i++;
//        while (i < count) {
//          line = maket[i];
//          if (line.text) {
//            html += line.value;
//            i++;
//            continue;
//          }
//            if (line.value === "endfor") {
//              i++;
//              break;
//            }
//            html += eval(line.value);
//            i++;
//          }
//      }
//      else {
//        html += eval(line.value);
//        i++;
//      }
//  }

//  return html;
  //}
, open_file: function (file) {
  var link = document.createElement("a");
  link.href = decodeURI(fm.join_path() + file);
  link.target = "_blank";
  link.click();
}
, refresh_current: function () {

  switch (this.state.current) {
    case this.state.upload:
      if (this.stack.length === 0) {
        fm_refresh();
      }
      else {
        create_upload_form();
      }
      break;
    case this.state.create_folder:
      create_folder_form();
      break;
    case this.state.navigator:
      fm_refresh();
      break;
    default:
      break;
  }
}
};

function getPosition(element) {

  var rect = element.getBoundingClientRect();
  
  var docElement = document.documentElement;
  var body = document.body;
  var scrollTop = docElement.scrollTop ? docElement.scrollTop : body.scrollTop;
  var scrollLeft = docElement.scrollLeft ? docElement.scrollLeft : body.scrollLeft;
  
  return { x: Math.floor(rect.left + scrollLeft), y: Math.floor(rect.top + scrollTop) };
}
function create_pdf_view(parent, filename) {
  fm.open_file(filename);
  return;
  var obj = document.createElement('object');
  obj.style.width = "100%";
  obj.style.height = "99%";
  //obj.setAttribute('width', w);
  //obj.setAttribute('height', h);
  var param = document.createElement('param');
  param.setAttribute('name', 'Src');
  param.setAttribute('value', filename);
  obj.appendChild(param);

  var embed = document.createElement('embed');
  //embed.setAttribute('width', w);
  //embed.setAttribute('height', h);

  embed.style.width = "100%";
  embed.style.height = "99%";

  embed.setAttribute('src', filename);
  embed.setAttribute('href', filename);
  obj.appendChild(embed);
  // here is where you need to know where you're inserting it

  // at the end of the body
  //  document.body.appendChild(obj);

  // OR, into a particular div
  parent.appendChild(obj);

}
function get_file_ext(file) {
  var ext = "";
  for (var i = file.length - 1; i > -1; i--) {
    if (file[i] === '.') break;
    ext = file[i] + ext;
  }
  return ext.toLowerCase();
}
function fm_format(bytes) {
  var s = "" + bytes, t="";
  var i = s.length - 1, count = 1;

  while (i >= 0) {
    t = s[i] + t;
    if (i > 0 && (t.length == 3 || t.length == 7 || t.length == 11)) {
      t = '.' + t;
    }
    i--;
  }
  return t;
}
function create_mp3_player(parent, filename) {
 // alert(filename);
  var audio = document.createElement('audio');
  audio.setAttribute('src', filename);
  audio.setAttribute('controls', 'controls');
  audio.play();
  parent.appendChild(audio);
}
function create_image_view(parent, filename) {

  load_async("/img_view.html", function (text) {
    parent.innerHTML = text;
    var elem = id("#img-view");
    elem.onload = function () {
      var k = this.height / this.width;
    }
    img.find();
    img.refresh();
});
}
function create_vidio_view(parent, filename) {
  var e = document.createElement('video');
  e.style.width = "100%";
  e.style.height = "100%";
  e.autoplay = true;
  e.src = filename;
  e.controls = true;
 // e.setAttribute('src', filename);
  parent.appendChild(e);
}
function create_upload_form() {

  fm.state.current = fm.state.upload;

  var elem = id(fm.consts.main_content);
  elem.innerHTML = "";

  if (fm.stack.length == 0) {
    fm_show_error(fm.errors.upload_select_folder);
  }
  else {
    return fm_set_main_content(generator.generate_one(null, "fm-upload-form"));
    load_async("upload_form.html", function (data) {
      elem.innerHTML = data;
      var div = id("#target-folder");
      //div.innerHTML = join_path(true);
    });
  }

}
function create_folder_form() {

  if (fm.stack.length == 0) {
    fm_show_error(fm.errors.create_folder);
    return;
  }
  var html = generator.generate_one(null, "fm-create-folder");
  fm.get_main_content().innerHTML = html;
}
function fm_get_file(file) {
 // alert("todo get.file " + file);
  var elem = fm.get_main_content();
  elem.innerHTML = "";
  var ext = get_file_ext(decodeURI(file));
  var command = "get.file?file=" + fm.join_path() + file;
  var x = decodeURI(command);
  // alert(x);
  ext = ext.toLowerCase();
  if ("pdf;doc;mobi;fb2;txt;epub;rtf;doc;".indexOf(ext + ';') >= 0) {
    return fm.open_file(file);
  }
  switch (ext)
  {
    case "pdf":
      //create_pdf_view(elem, command);
      fm.open_file(file);
      break;
    case "mp3":
      create_mp3_player(elem, command);
      break;
    case "mp4":
    case "mov":
    case "3gp":
    case "avi":
    case "mkv":
    case "vob":
      create_vidio_view(elem, command);
      break;
    case "jpg":
    case "png":

      create_image_view(elem, command);
      break;
    default:
      elem.innerHTML = "unsupported file extention " + ext;
      //fm_set_main_content("unsupported file extention " + ext);
      break;
  }
  
}
function fm_downlod_file(file){
  var link = document.createElement("a");
  link.download = decodeURI(file);
  link.href = decodeURIComponent(fm.join_path() + file);
  link.target = "_blank";
// alert(link.href);
  link.click();
  fm_refresh();
}
function fm_recreate_stack(max) {
  var new_stack = [];
  for (var i = 0; i < max; i++) {
    new_stack.push(fm.stack[i]);
  }
  var folder = fm.stack[max];
  fm.stack = new_stack;
  return folder;
}
function fm_refresh() {
  fm.state.current = fm.state.navigator;
  var folder =  (fm.stack.length > 0) ?fm_recreate_stack(fm.stack.length - 1) : "root";
  init_document(folder);
}
function fm_prevent_events(e) {
  if (typeof e.preventDefault === 'function') {
    e.preventDefault();
    e.stopPropagation();
  } else {
    e.returnValue = false;
    e.cancelBubble = true;
  }
}
function fm_set_main_content(html) {
  var elem = fm.get_main_content();
  elem.innerHTML = html;
}
function fm_show_error(text) {
  load_async("/error.html", function (data) {
    fm_set_main_content(data);
    id("#error-text").innerHTML = text;
  });
}
function fm_create_folder() {

  var elem = id("#input-folder-name");
  fm.state.current = fm.state.create_folder;

  if (elem.value.length < 1) {
    fm_show_error("folder name is empty!");
    return;
  }
  var folder_name = encodeURI(elem.value);
  load_async_json("/mkdir?folder=" + fm.join_path() + "&name=" + folder_name, function (data) {
    if (data.result) {
      fm_refresh();
    }
    else {
      alert(data.name + "\n" + data.msg);
    }
  });
  fm.get_main_content().innerHTML = "working...";
}
function fm_refresh_by_index(index) {
  var folder = fm_recreate_stack( parseInt(index));
  init_document(folder);
}

function make_popup() {

  if (fm.is_popup_visible) {
    fm.is_popup_visible = false;
    fm_refresh();
    return;
  }
  fm.is_popup_visible = true;
  var elem = fm.get_main_content();

  var html = generator.generate_one(fm.stack, "fm-popup-header", 0);
  html += generator.generate(fm.stack, "fm-popup-body");
  html += generator.generate_one(fm.stack, "fm-popup-footer",0);
  elem.innerHTML =html;
}
function make_breadcrumbs() {

  var html = generator.generate_one(fm.stack, "fm-bread-header")
   + generator.generate(fm.stack, "fm-bread-body")
   + generator.generate_one(fm.stack, "fm-bread-footer");

  id("#td-path").innerHTML = html;

}
function fm_delete_file(file) {
  confirm("delete " + file);
}

function fm_find_data_method(elem) {
  var method = null;

  while(!method){
    method = elem.getAttribute("data-method");
    if (method) {
      return { elem:elem , method: method, args: elem.getAttribute("data-args") };
    }
    elem = elem.parentElement;
    if (elem == null) return method;
  }
}
function fm_on_click(e) {

  e = e || window.event;
  var target = e.target || e.srcElement;

  var x = fm_find_data_method(target);

  if (x.method) {
    if (x.args) {
      x.args = x.args.split(',');
    }
    x.method = x.method.split('.');
    if (x.method.length === 1) {
      window[x.method[0]].apply(this, x.args);
    }
    else {
      var obj = eval(x.method[0]);
      window[x.method[0]][x.method[1]].apply(obj, x.args);
    }
    fm_prevent_events(e);
  }
}

function init_document(folder) {

  try {

    fm.state.current = fm.state.navigator;
    folder = fm.set_folder(folder);
    make_breadcrumbs();

    load_async_json("get.folder?folder=" + folder, function (data) {

      if (data.length === 0) {
        return fm_set_main_content(generator.generate_one(decodeURIComponent(folder), "fm-empty-folder", null));
      }
      data.sort(function (a, b) { return b.d - a.d; });

      img.reset(fm.join_path());
      var html = generator.generate_one(null, "fm-list-header");

      fm.foreach(data, function (item, i) {

        html += generator.generate_one(item,(item.d ? "fm-list-folder-body" : "fm-list-file-body"), i);
        var filename = encodeURI(item.name);
        var ext = get_file_ext(filename);
        if (ext == "jpg") {
          img.reg(filename);
        }
      });
      html += generator.generate_one(null, "fm-list-footer");
      fm.get_main_content().innerHTML = html;
   });
  }
  catch (err) {
    alert(err);
  }
}


function init_document__org(folder) {

  try {

    fm.state.current = fm.state.navigator;
    folder = fm.set_folder(folder);
    make_breadcrumbs();

    load_async_json("get.folder?folder=" + folder, function (data) {

      if (data.length === 0) {
        fm_show_error("This folder is empty<br>" + decodeURIComponent(folder));
        return;
      }
      data.sort(function (a, b) { return b.d - a.d; });

      img.reset(fm.join_path());
      var html = "";

      fm.foreach(data, function (item, i) {

        html += generator.generate_one(item, (item.d ? "fm-folder-row" : "fm-file-row"), i);
        var filename = encodeURI(item.name);
        var ext = get_file_ext(filename);
        if (ext == "jpg") {
          img.reg(filename);
        }
      });
      fm.get_main_content().innerHTML = html;
    });
  }
  catch (err) {
    alert(err);
  }
}


