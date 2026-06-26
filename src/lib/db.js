import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Van300159",
  database: "ora_wim_motor",
});

export default db;