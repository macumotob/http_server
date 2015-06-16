
var hl = {
  lines: null,
  on_line_begin: null,
  on_line_end: null,
  on_token : null,
  tokens: {
    unknown: 0,
    term: 1,
    word: 2,
    comment:3
  },
  foreach : function (items,callback){
    for (var i = 0, count = items.length; i < count; i++) {
      callback(items[i], i);
    }
  },
  format: function (id, text) {
    this.lines = text.split('\n');
    var self = this;
    this.foreach(this.lines, function (item, i) {
      self.on_line_begin(i);
      var words = self.parse(item, i);
      self.on_line_end(i);
    });
  },
  parse: function (s, lineno) {
    var word = "", words = [];
    var i = 0, count = s.length;
    while (i < count) {
      var c = s[i];
      if (this.isterm(c)) {
        if (word.length > 0) {
          this.on_token({ token: this.tokens.word, value: word });
          word = "";
        }
        if (c === '/' && (i + 1  < count ) && s[i+1] == '/' ) {
          this.on_token({ token: this.tokens.comment, value: s.substr(i) });
          i = count;
        }
        else if (c === "\'") {

        }
        else {
          this.on_token({ token: this.tokens.term, value: c });
        }
      }
      else {
        word += c;
      }
      i++;
    }
  },
  isterm: function (c) {
    return " \r\t~!#$%^&*()_+=-[]{};:\"\',.<>?\\/".indexOf(c) >= 0;
  }
};
function it(ident) {
    return document.getElementById(ident);
}
function hl_format() {
  var s = it("demo").value;

 // alert(s);

  var html = "<table style='width:100%;'>";
  hl.on_line_begin = function (i) {
    html += "<tr><td>" + (i + 1) + "</td><td>"
  };
  hl.on_line_end = function (i) {
    html += "</td></tr>";
  }
  hl.on_token = function (data) {
    switch(data.token)
    {
      case hl.tokens.comment:
        html += "<span style='color:lightgray;'>" + (data.value === " " ? "&nbsp;" : data.value) + "</span>";
        break;
      case hl.tokens.term:
        html += "<span style='color:blue;'>" + (data.value === " " ? "&nbsp;" : data.value)  + "</span>";
        break;
      case hl.tokens.unknown:
        html += data.value;
        break;
      case hl.tokens.word:
        html += "<span style='color:green;'>" + data.value + "</span>";
        break;
      default:
        html += data.value;
        break;
    }
  }
  hl.format(null, s);
  html += "</table>";
  it("test").innerHTML = html;
}