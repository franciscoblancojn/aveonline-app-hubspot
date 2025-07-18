// logger.js
const fs = require("fs");
const path = require("path");

function log(req, res, next) {
  const date  = new Date()
  const day = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  const logFile = path.join(
    __dirname + req.originalUrl ,
    day,
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
function logCustom(url,data) {
  const logFile = path.join(
    __dirname + url,
    "logs.log"
  );
  fs.mkdirSync(path.dirname(logFile), { recursive: true });

  const logData = {
    time: new Date().toISOString(),
    data
  };
  const line = JSON.stringify(logData) + "\n";
  console.log(line);
  
  // Log en consola
  //   console.log(`[${logData.time}] ${logData.method} ${logData.path}`);

  // Log en archivo
  fs.appendFile(logFile, line, (err) => {
    if (err) console.error("Error al escribir log:", err);
  });

}

module.exports = { log ,logCustom};
