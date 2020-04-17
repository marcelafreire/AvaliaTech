require('dotenv').config();
const passport = require("passport");
const mongoClient = require("mongodb").MongoClient;
mongoClient.connect(process.env.MONGODB_URI, function(err, conn){
  if(err) { return console.log(err); }
  console.log("conectou no banco de dados!");
  global.db = conn.db(process.env.MONGO_DB);
  //coloque todo o código antigo do www aqui dentro

const http = require('http');
let app = require('./app');

// catch 404 and render a not-found.hbs template
app.use((req, res, next) => {
  res.status(404);
  res.render('not-found');
});

app.use((err, req, res, next) => {
  // always log the error
  console.error('ERROR', req.method, req.path, err);

  // only render if the error ocurred before sending the response
  if (!res.headersSent) {
    res.status(500);
    res.render('error');
  }
});

let server = http.createServer(app);

server.on('error', error => {
  if (error.syscall !== 'listen') { throw error }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${process.env.PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`Port ${process.env.PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

server.listen(process.env.PORT, () => {
  console.log(`Listening on http://localhost:${process.env.PORT}`);
});
})