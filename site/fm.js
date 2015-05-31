

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
  return ext;
}

function join_path(decode) {
  var s = "";
  for (var i = 0, max = stack.length ; i < max; i++) {
    var x = stack[i];
    x =( x[x.length-1] == '/') ? x.substr(0,x.length-1) : x;
    s += (decode ? decodeURIComponent(x) : x) + '/';
  }
    return s;
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
  var image = document.createElement('img');
  image.setAttribute('src', filename);
  parent.appendChild(image);
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

  if (stack.length == 0) {
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

  if (stack.length == 0) {
    elem.style.color = "white";
    elem.innerHTML = "select folder ";
  }
  else {
    load_async("create_folder.html", function (data) {
      elem.innerHTML = data;
      elem.style.color = "white";

      var div = id("#folder-location");
      div.innerHTML = join_path(true);
    });
  }
}
function get_file(file) {
 // alert("todo get.file " + file);
  var elem = id("#left-menu");
  elem.innerHTML = "";
  var ext = get_file_ext(file);

  var command = "get.file?file=" + join_path() + file;
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
      create_image_view(elem, command);
      break;
    default:
      elem.innerHTML = "unsupported file extention " + ext;
      break;
  }
  
}
var stack = [];
function get_folder_content(e) {
  e = e || window.event;
  var target = e.target || e.srcElement;
  var pageid, hrefparts;

  // only interesed in hrefs
  // exit the function on non-link clicks

  if (target.nodeName !== 'TD') {
    return;
  }
  var max = parseInt(target.getAttribute("index"));
  var new_stack = [];
  for (var i = 0; i < max; i++) {
    new_stack.push(stack[i]);
  }
  var folder = stack[max];
  stack = new_stack;
//  alert(decodeURI(folder));
  init_document(folder);

  if (typeof e.preventDefault === 'function') {
    e.preventDefault();
    e.stopPropagation();
  } else {
    e.returnValue = false;
    e.cancelBubble = true;
  }


}
var div_popup_menu;

function make_popup() {

  if (div_popup_menu && div_popup_menu.style.display === 'block') {
    div_popup_menu.style.display = 'none';
    return;
  }
  var elem = id("#breadcrumb");
 // elem.innerHTML = "";
  div_popup_menu = document.createElement('div');
  div_popup_menu.className = 'breadcrumb';

  var tb = document.createElement('table');
  tb.style = "width:100%;";
  for (var i = 0, max = stack.length; i < max; i++) {
    var tr = document.createElement('tr');
    tb.appendChild(tr);
    var td = document.createElement('td');
    var text = decodeURI(stack[i]);
    text = text[text.length - 1] == '/' ? text : text + '/';//text.substr(0, text.length - 2) : text;
    td.appendChild(document.createTextNode(text));
    td.setAttribute("index", i);
    tr.appendChild(td);
  }
  div_popup_menu.onclick = function () {
    div_popup_menu.style.display = 'none';
    get_folder_content();

  };
  div_popup_menu.appendChild(tb);
  div_popup_menu.style.display = 'block';

  elem.appendChild(div_popup_menu);

}
function make_breadcrumbs() {

  var elem = id("#td-path");
  elem.innerHTML = "";
  var tb = document.createElement('table');
  var tr = document.createElement('tr');
  tb.appendChild(tr);

  for (var i = 0, max = stack.length; i < max; i++) {
    var td = document.createElement('td');
    var text = decodeURI(stack[i]);
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
    // alert(folder);
    if (folder !== "root") {
      if (folder === "..") {
        stack.pop();
      }
      else {
        stack.push(folder);
      }
      folder = stack.join('/');
      if (folder.length === 0) {
        folder = "root";
      }
    }
    else {
      stack = [];
    }
   // var elem = id("#td-path");
 //   elem.innerHTML = get_decoded_path();
    make_breadcrumbs();
   var elem = id("#left-menu");
    elem.innerHTML = "";

    load_async_json("get.folder?folder=" + folder, function (data) {
      //   alert(data.length);
      var tb = document.createElement('table');
      tb.className = 'table-as-menu';
      var tr, td;
      data.sort(function (a, b) { return b.d - a.d; });

      for (var i=0, max = data.length; i < max; i++) {
        var item = data[i];
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

        // x-browser target
        e = e || window.event;
        var target = e.target || e.srcElement;
        var pageid, hrefparts;

        // only interesed in hrefs
        // exit the function on non-link clicks

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
        // x-browser prevent default action and cancel bubbling
        if (typeof e.preventDefault === 'function') {
          e.preventDefault();
          e.stopPropagation();
        } else {
          e.returnValue = false;
          e.cancelBubble = true;
        }
      };
      // id("#left-menu").appendChild(tb);
      elem.appendChild(tb);
    });
  }
  catch (err) {
    alert(err);
  }
}

//
