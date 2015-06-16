function getPosition(element) {

  var rect = element.getBoundingClientRect();
  
  var docElement = document.documentElement;
  var body = document.body;
  var scrollTop = docElement.scrollTop ? docElement.scrollTop : body.scrollTop;
  var scrollLeft = docElement.scrollLeft ? docElement.scrollLeft : body.scrollLeft;
  
  return { x: Math.floor(rect.left + scrollLeft), y: Math.floor(rect.top + scrollTop) };
}
function drawLine(ident, x, y, w, h) {
  var c = id(ident);
  var xy = getPosition(c);
  x -= xy.x;
  y -= xy.y;

  var ctx = c.getContext("2d");
  ctx.clearRect(0, 0, 500, 400);
  
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x+w, y+h);
  ctx.stroke();

  ctx.fillStyle = "blue";
  ctx.font = "10px Tahoma";
  ctx.fillText("x:" + x + " y:" + y, x+15, y+15);
}
function createCanvas(ident,canvasId,width,height) {
  var canvas = document.createElement('canvas');
  div = document.getElementById(ident);
  canvas.id = canvasId;
  canvas.width = width;
  canvas.height = height;
  canvas.style.zIndex = 8;
  canvas.style.position = "absolute";
  canvas.style.border = "1px solid";
  div.appendChild(canvas)
}

function create_menu(root, data) {
  var a, li;

  for (var i = 0, max = data.length; i < max; i++) {
    var item = data[i];

    li = document.createElement('li');
    root.appendChild(li);

    if (item.url.length === 0) {
      li.appendChild(document.createTextNode(item.name));
      var ul = document.createElement('ul');
      li.appendChild(ul);
      create_menu(ul, item.submenu);
    }
    else {
      a = document.createElement('a');
      a.href = item.url;
      a.target = "_blank";
      a.appendChild(document.createTextNode(item.name));
      li.appendChild(a);
    }
  }
};
function init_document() {
  var cnv = id('#canvas2');
  cnv.onmousemove = function (e) {
    drawLine('#canvas2', e.clientX, e.clientY,50,50);
  }
}

//
//createCanvas("d2", "canvas2", 500, 400);

load_async_json("data/menu_left.json", function (data) {
  var ul = id("#menu-list");
  ul.style.display = 'none';

  var list = document.createDocumentFragment();
  create_menu(list, data);
  ul.appendChild(list);
  ul.style.display = 'block';

});