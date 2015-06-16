
function calc(x) {
  return x / 90 + 9.78;
}
function test_nodejs(response, data) {

  response.writeHead(200, { "Content-Type": "text/html" });
  response.write("data.name is " + data.name + "<br/>");
  response.write("data.y    is " + data.y + "<br/>");
  response.write("data.y    is " + calc(data.n) + "<br/>");
  response.end();
}