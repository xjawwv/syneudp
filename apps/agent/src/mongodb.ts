import { MongoClient } from "mongodb";

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://root:mongodb_root_secret@localhost:27017/?authSource=admin";
const client = new MongoClient(MONGODB_URL);

export async function createDatabaseAndUser(
  dbName: string,
  dbUser: string,
  password: string
): Promise<void> {
  await client.connect();
  const adminDb = client.db("admin");
  
  // Create User
  await adminDb.command({
    createUser: dbUser,
    pwd: password,
    roles: [
      { role: "readWrite", db: dbName }
    ]
  });

  // Accessing the db creates it in MongoDB when the first collection/data is added
  // but for provisioning we just ensure the user is there.
  console.log(`Created MongoDB user ${dbUser} for database ${dbName}`);
}

export async function suspendUser(dbName: string, dbUser: string): Promise<void> {
  await client.connect();
  const adminDb = client.db("admin");
  
  // In MongoDB, "suspending" usually means revoking roles or changing password
  // For simplicity, we'll revoke roles.
  await adminDb.command({
    revokeRolesFromUser: dbUser,
    roles: [{ role: "readWrite", db: dbName }]
  });
}

export async function resumeUser(dbName: string, dbUser: string): Promise<void> {
  await client.connect();
  const adminDb = client.db("admin");
  
  await adminDb.command({
    grantRolesToUser: dbUser,
    roles: [{ role: "readWrite", db: dbName }]
  });
}

export async function terminateDatabase(
  dbName: string,
  dbUser: string
): Promise<void> {
  await client.connect();
  const adminDb = client.db("admin");
  
  // Drop user
  await adminDb.command({ dropUser: dbUser });
  
  // Drop database
  const db = client.db(dbName);
  await db.dropDatabase();
}

export async function rotatePassword(
  dbUser: string,
  newPassword: string
): Promise<void> {
  await client.connect();
  const adminDb = client.db("admin");
  
  await adminDb.command({
    updateUser: dbUser,
    pwd: newPassword
  });
}
