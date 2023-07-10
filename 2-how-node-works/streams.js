const fs = require('fs');
const server = require('http').createServer();

server.on('request', (req, res) => {
  // solution 1: waiting for the data to be fully loaded and send it back. this will block the app from loading.
  // fs.readFile('test-file.txt', (err, data) => {
  //   if (err) console.error(err);
  //   res.end(data);
  // });
  
  // solution 2: streaming. sending data as stream => meaning data will be continuously served to client piece by piece. so nothing will block the app. however, if receiving data is much more fast than serving the data, it will cause back pressure.
  // const data = fs.createReadStream('test-file.txt');
  // data.on('data', chunk => {
  //   res.write(chunk);
  // })
  // data.on('end', () => {
  //   res.end();
  // });
  // data.on('error', err => {
  //   res.statusCode = 500;
  //   console.error(err);
  //   res.end('File not found.');
  // })
  
  // solution 3: using pipe() to fix back pressure
  // readableSource.pipe(writeableDest)
  const data = fs.createReadStream('test-file.txt');
  data.pipe(res);
});

server.listen(8000, '127.0.0.1', () => {
  console.log('listening on port 8000...');
});
