const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const os = require('os');

const app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.get('/api/news', (req, res) => {
  fs.readFile('news.json', 'utf8', (err, data) => {
    if (err) return res.json([]);
    try {
      res.json(JSON.parse(data));
    } catch {
      res.json([]);
    }
  });
});

app.post('/api/news', (req, res) => {
  const news = req.body.news || [];
  fs.writeFile('news.json', JSON.stringify(news, null, 2), err => {
    if (err) return res.status(500).send('Lưu thất bại');
    res.send('Đã lưu tin tức!');
  });
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

const PORT = process.env.PORT || 3000;

// Lấy IPv4 LAN
function getIPv4() {
  const interfaces = os.networkInterfaces();
  for (let name in interfaces) {
    for (let iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

// Lấy IPv6 public
function getIPv6() {
  const interfaces = os.networkInterfaces();
  for (let name in interfaces) {
    for (let iface of interfaces[name]) {
      if (iface.family === "IPv6" && !iface.internal && !iface.address.startsWith("fe80")) {
        return iface.address;
      }
    }
  }
  return null;
}

app.listen(PORT, "::", () => {
  console.log(`✅ Server chạy tại http://[::]:${PORT} (IPv6)`);

  const ipv4 = getIPv4();
  if (ipv4) {
    console.log(`👉 Truy cập trong LAN: http://${ipv4}:${PORT}`);
  }

  const ipv6 = getIPv6();
  if (ipv6) {
    console.log(`🌍 Truy cập ngoài mạng (IPv6 public): http://[${ipv6}]:${PORT}`);
  } else {
    console.log("⚠️ Không tìm thấy IPv6 public.");
  }
});
