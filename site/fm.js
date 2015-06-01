
var fm = {
  stack: [],
  is_popup_visible: false,
  images: [],
  img_index : 0,
  image : null,

  set_folder: function (folder) {
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
, img_find: function () {
  if (this.image == null) {
    this.image = id("#img-view");
  }
}
, img_reset: function () {
  this.img_index = 0;
  this.images = [];
  this.image = null;
}
, img_show_first: function () {
  this.img_find();
  this.img_index = 0;
  this.img_refresh();
}
, img_show_last: function () {
  this.img_find();
  this.img_index = this.images.length -1;
  this.img_refresh();
}
, img_show_next: function () {
  this.img_find();
  this.img_index++;
  if (this.img_index > this.images.length-1) {
    this.img_index = 0;
  }
  this.img_refresh();
}
, img_show_prev: function () {
  this.img_find();
  this.img_index--;
  if (this.img_index < 0) {
    this.img_index = this.images.length -1;
  }
  this.img_refresh();
}
, img_refresh: function () {
  var path = "get.file?file=" + fm.join_path() + this.images[this.img_index];
  this.image.src = path;
  id("#img-info").innerHTML = " " + (this.img_index+1) + " / " + this.images.length;
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
    var img = id("#img-view");
    var left = 2,
       // w = (screen.availWidth  - (left * 4));
w = document.body.clientWidth -(left*2);
    parent.style.left = left +"px";
    parent.style.width = w + "px";
    img.style.width = (w -15) + "px";
    //img.src = filename;
    fm.img_find();
    fm.img_refresh();
});
  //var image = document.createElement('img');
  //image.setAttribute('src', filename);
  //parent.appendChild(image);
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


  var elem = id("#left-menu");
  elem.innerHTML = "";

  if (fm.stack.length == 0) {
    elem.style.color = "white";
    elem.innerHTML = "select folder ";
  }
  else {
    load_async("upload_form.html", function (data) {
      elem.innerHTML = data;
      elem.style.color = "white";

      var div = id("#target-folder");
      //div.innerHTML = join_path(true);
    });
  }

}
function show_create_folder() {

  var elem = id("#left-menu");
  elem.innerHTML = "";

  if (fm.stack.length == 0) {
    elem.style.color = "white";
    elem.innerHTML = "select folder ";
  }
  else {
    load_async("create_folder.html", function (data) {
      elem.innerHTML = data;
      elem.style.color = "white";

      var div = id("#folder-location");
      div.innerHTML = fm.join_path(true);
    });
  }
}
function get_file(file) {
 // alert("todo get.file " + file);
  var elem = id("#left-menu");
  elem.innerHTML = "";
  var ext = get_file_ext(file);

  var command = "get.file?file=" + fm.join_path() + file;
  var x = decodeURI(command);
  // alert(x);
  ext = ext.toLowerCase();
  switch (ext)
  {
    case "pdf":
      create_pdf_view(elem, command);
      break;
    case "mp3":
      create_mp3_player(elem, command);
      break;
    case "mp4":
    case "mov":
    case "3gp":
      create_vidio_view(elem, command);
      break;
    case "jpg":
    case "png":

      create_image_view(elem, command);
      break;
    default:
      elem.innerHTML = "unsupported file extention " + ext;
      break;
  }
  
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
function fm_create_folder() {

  var elem = id("#new-folder-name");
 // alert(elem.value);
// return;
  var folder_name = encodeURI(elem.value);//decodeURIComponent(new_folder_name);
  load_async_json("/mkdir?folder=" + fm.join_path() + "&name=" + folder_name, function (data) {
    if (data.result) {
      fm_refresh();
    }
    else {
      alert(data.name + "\n" + data.msg);
    }
    
  });
}
function on_resize() {
  var w = document.body.clientWidth;
  var h = document.body.clientHeight;
  alert(w + ":" + h);
}
function get_folder_content(e) {
  e = e || window.event;
  var target = e.target || e.srcElement;

  if (target.nodeName !== 'TD') {
    return;
  }
  var max = parseInt(target.getAttribute("index"));
  var folder = fm_recreate_stack(max);
  init_document(folder);
  fm_prevent_events(e);
}
//var div_popup_menu;


function make_popup() {

  if (fm.is_popup_visible) {
    fm.is_popup_visible = false;
    fm_refresh();
    return;
  }
  fm.is_popup_visible = true;
  var elem = id("#left-menu");
  elem.innerHTML = "";
  var div = document.createElement('div');
  div.id = "viewer";
  div.className = 'breadcrumb';

  var tb = document.createElement('table');

  tb.id = "table-in-popup";
  for (var i = 0, max = fm.stack.length; i < max; i++) {
    var tr = document.createElement('tr');
    tb.appendChild(tr);
    var td = document.createElement('td');
    var text = decodeURI(fm.stack[i]);
    text = text[text.length - 1] == '/' ? text : text + '/';//text.substr(0, text.length - 2) : text;
    td.appendChild(document.createTextNode(text));
    td.setAttribute("index", i);
    tr.appendChild(td);
  }
  tb.onclick = function () {
    get_folder_content();
  };

  div.appendChild(tb);
  elem.appendChild(div);

}
function make_breadcrumbs() {

  var elem = id("#td-path");
  elem.innerHTML = "";
  var tb = document.createElement('table');
  var tr = document.createElement('tr');
  tb.appendChild(tr);

  for (var i = 0, max = fm.stack.length; i < max; i++) {
    var td = document.createElement('td');
    var text = decodeURI(fm.stack[i]);
    text = text[text.length - 1] == '/' ? text : text + '/';//text.substr(0, text.length - 2) : text;
    td.appendChild(document.createTextNode(text));
    td.setAttribute("index", i);
    tr.appendChild(td);
  }
  tb.onclick = function () {
    get_folder_content();
  };

  elem.appendChild(tb);
 // return decodeURI(stack.join('/'));
}
function init_document(folder) {

  try {
    folder = fm.set_folder(folder);
    make_breadcrumbs();

   var elem = id("#left-menu");
    elem.innerHTML = "";

    load_async_json("get.folder?folder=" + folder, function (data) {
      //   alert(data.length);
      var tb = document.createElement('table');
      tb.className = 'table-as-menu';
      var tr, td;
      data.sort(function (a, b) { return b.d - a.d; });

      fm.img_reset();

      for (var i=0, max = data.length; i < max; i++) {
        var item = data[i];

        var filename = encodeURI(item.name);
        var ext = get_file_ext(filename);
        if (ext == "jpg") {
          fm.images.push(filename);
        }
        tr = document.createElement('tr');
        tb.appendChild(tr);
        td = document.createElement('td');
        td.setAttribute("command", encodeURI(item.name));
        td.setAttribute("isdir", item.d);
        if (item.d === 0) {
          td.style.color = 'yellow';
        }
        td.appendChild(document.createTextNode(item.name));
        tr.appendChild(td);
      }
      
      tb.onclick = function (e) {

        e = e || window.event;
        var target = e.target || e.srcElement;

        if (target.nodeName !== 'TD') {
          return;
        }
        var is_dir = parseInt(target.getAttribute("isdir"));

        if (is_dir ===1) {
          init_document(target.getAttribute("command"));
        }
        else {
          get_file(target.getAttribute("command"));
        }
        fm_prevent_events(e);
      };
      elem.appendChild(tb);
    });
  }
  catch (err) {
    alert(err);
  }
}

//
