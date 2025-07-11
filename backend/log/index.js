// logger.js
const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "logs", "requests.log");

// Asegura que la carpeta de logs exista
fs.mkdirSync(path.dirname(logFile), { recursive: true });

function logRequest(req, res, next) {
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

module.exports = logRequest;
