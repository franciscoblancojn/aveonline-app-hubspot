// logger.js
const fs = require("fs");
const path = require("path");

function log(req, res, next) {
  const guia = req?.body?.guia 
  const logFile = path.join(
    __dirname + req.originalUrl ,
    (guia ? `/${guia}` : ""),
    "logs.log"
  );
  fs.mkdirSync(path.dirname(logFile), { recursive: true });

  const logData = {
    time: new Date().toISOString(),
    ip: req.ip,
    method: req.method,
    path: req.originalUrl,
    query: req.query,
    body: req.body,
  };
  const line = JSON.stringify(logData) + "\n";

  // Log en consola
  //   console.log(`[${logData.time}] ${logData.method} ${logData.path}`);

  // Log en archivo
  fs.appendFile(logFile, line, (err) => {
    if (err) console.error("Error al escribir log:", err);
  });

  next();
}

module.exports = { log };
