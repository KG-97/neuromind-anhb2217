import http from "http";

const data = JSON.stringify({
  prompt: "Hello",
  systemInstruction: "Be polite"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/generate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let chunks = '';
  res.on('data', d => {
    chunks += d;
  });
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    console.log("Body:", chunks);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
