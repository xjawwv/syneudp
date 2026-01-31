import pg from "pg";

const pool = new pg.Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: parseInt(process.env.POSTGRES_PORT || "5433"),
  user: "postgres",
  password: process.env.POSTGRES_PASSWORD || "postgres_root_secret",
  database: "postgres",
});

export async function createDatabaseAndUser(
  dbName: string,
  dbUser: string,
  password: string
): Promise<void> {
  const client = await pool.connect();
  try {
    const userExists = await client.query(
      "SELECT 1 FROM pg_roles WHERE rolname = $1",
      [dbUser]
    );
    if (userExists.rows.length === 0) {
      await client.query(
        `CREATE USER "${dbUser}" WITH PASSWORD '${password}'`
      );
    }
    const dbExists = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );
    if (dbExists.rows.length === 0) {
      await client.query(`CREATE DATABASE "${dbName}" OWNER "${dbUser}"`);
    }
    await client.query(
      `GRANT ALL PRIVILEGES ON DATABASE "${dbName}" TO "${dbUser}"`
    );
  } finally {
    client.release();
  }
}

export async function suspendUser(dbName: string, dbUser: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`ALTER USER "${dbUser}" NOLOGIN`);
    await client.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE usename = $1`,
      [dbUser]
    );
  } finally {
    client.release();
  }
}

export async function resumeUser(dbName: string, dbUser: string): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`ALTER USER "${dbUser}" LOGIN`);
  } finally {
    client.release();
  }
}

export async function terminateDatabase(
  dbName: string,
  dbUser: string
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1`,
      [dbName]
    );
    await client.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    await client.query(`DROP USER IF EXISTS "${dbUser}"`);
  } finally {
    client.release();
  }
}

export async function rotatePassword(
  dbUser: string,
  newPassword: string
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(
      `ALTER USER "${dbUser}" WITH PASSWORD '${newPassword}'`
    );
  } finally {
    client.release();
  }
}
