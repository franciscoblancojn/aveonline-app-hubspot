require("dotenv").config();
const sqlite3 = require("sqlite3").verbose();

class DB {
  db;
  constructor() {
    this.db = new sqlite3.Database(`./sqlite/${process.env.DB_NAME}.sqlite`);
  }
  onCreateTable(tableName, columns) {
    return new Promise((resolve, reject) => {
      const columnDefs = Object.entries(columns)
        .map(([name, type]) => `${name} ${type}`)
        .join(", ");
      const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefs})`;
      this.db.run(sql, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  onCreateRow(tableName, row) {
    return new Promise((resolve, reject) => {
      const columns = Object.keys(row).join(", ");
      const placeholders = Object.keys(row)
        .map(() => "?")
        .join(", ");
      const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
      this.db.run(sql, Object.values(row), function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }
  onGetRows(tableName, where = {}) {
    return new Promise((resolve, reject) => {
      const whereClause = Object.keys(where)
        .map((key) => `${key} = ?`)
        .join(" AND ");
      const sql = `SELECT * FROM ${tableName}${
        whereClause ? " WHERE " + whereClause : ""
      }`;
      this.db.all(sql, Object.values(where), (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
  onUpdateRow(tableName, updates, where) {
    return new Promise((resolve, reject) => {
      const setClause = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(", ");
      const whereClause = Object.keys(where)
        .map((key) => `${key} = ?`)
        .join(" AND ");

      const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`;
      const values = [...Object.values(updates), ...Object.values(where)];

      this.db.run(sql, values, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes); // número de filas afectadas
        }
      });
    });
  }
}

module.exports = {
  db: new DB(),
};
