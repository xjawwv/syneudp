import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  port: parseInt(process.env.MYSQL_PORT || "3306"),
  user: "root",
  password: process.env.MYSQL_ROOT_PASSWORD || "mysql_root_secret",
  waitForConnections: true,
  connectionLimit: 10,
});

export async function createDatabaseAndUser(
  dbName: string,
  dbUser: string,
  password: string
): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(
      `CREATE USER IF NOT EXISTS '${dbUser}'@'%' IDENTIFIED BY '${password}'`
    );
    await connection.query(
      `GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${dbUser}'@'%'`
    );
    await connection.query("FLUSH PRIVILEGES");
  } finally {
    connection.release();
  }
}

export async function suspendUser(dbName: string, dbUser: string): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      `REVOKE ALL PRIVILEGES ON \`${dbName}\`.* FROM '${dbUser}'@'%'`
    );
    await connection.query("FLUSH PRIVILEGES");
  } finally {
    connection.release();
  }
}

export async function resumeUser(dbName: string, dbUser: string): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      `GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${dbUser}'@'%'`
    );
    await connection.query("FLUSH PRIVILEGES");
  } finally {
    connection.release();
  }
}

export async function terminateDatabase(
  dbName: string,
  dbUser: string
): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.query(`DROP USER IF EXISTS '${dbUser}'@'%'`);
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    await connection.query("FLUSH PRIVILEGES");
  } finally {
    connection.release();
  }
}

export async function rotatePassword(
  dbUser: string,
  newPassword: string
): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      `ALTER USER '${dbUser}'@'%' IDENTIFIED BY '${newPassword}'`
    );
    await connection.query("FLUSH PRIVILEGES");
  } finally {
    connection.release();
  }
}
