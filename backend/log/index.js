// logger.js
const fs = require("fs");
const path = require("path");
const { db } = require("../db");

function log(req, res, next) {
  const guia = req?.body?.guia;
  if (!guia) {
    next();
    return;
  }
  const logData = {
    time: new Date().toISOString(),
    guia,
    body: JSON.stringify(req.body),
  };
  db.onCreateTable("ave_guia_send_message", {
    id: "INTEGER PRIMARY KEY AUTOINCREMENT",
    time: "TEXT",
    guia: "TEXT",
    body: "TEXT",
  }).then(() => {
    db.onCreateRow("ave_guia_send_message", logData);
  });

  next();
}
function logCustom(url, data) {
  const logFile = path.join(__dirname + url, "logs.log");
  fs.mkdirSync(path.dirname(logFile), { recursive: true });

  const logData = {
    time: new Date().toISOString(),
    data,
  };
  const line = JSON.stringify(logData) + "\n";
  // console.log(line);

  // Log en consola
  //   console.log(`[${logData.time}] ${logData.method} ${logData.path}`);

  // Log en archivo
  fs.appendFile(logFile, line, (err) => {
    if (err) console.error("Error al escribir log:", err);
  });
}

module.exports = { log, logCustom };
