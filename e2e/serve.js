// Tiny static server for the browser test.
const http = require("http"), fs = require("fs"), path = require("path");
const root = process.argv[2], port = +process.argv[3] || 8089;
const types = { ".html": "text/html", ".js": "application/javascript", ".ico": "image/x-icon", ".json": "application/json", ".ttf": "font/ttf", ".png": "image/png" };
http.createServer((req, res) => {
  let p = path.join(root, decodeURIComponent(req.url.split("?")[0]));
  if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) p = path.join(root, "index.html");
  res.writeHead(200, { "Content-Type": types[path.extname(p)] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
}).listen(port, () => console.log("serving on " + port));
