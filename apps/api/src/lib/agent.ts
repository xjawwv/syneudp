const AGENT_URL = process.env.AGENT_URL || "http://localhost:4001";
const AGENT_TOKEN = process.env.AGENT_TOKEN || "";

interface AgentResponse {
  success: boolean;
  password?: string;
  newPassword?: string;
  error?: string;
}

async function callAgent(endpoint: string, body: object): Promise<AgentResponse> {
  const response = await fetch(`${AGENT_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Agent-Token": AGENT_TOKEN,
    },
    body: JSON.stringify(body),
  });
  return response.json();
}

export async function provisionDatabase(
  engine: string,
  dbName: string,
  dbUser: string
): Promise<AgentResponse> {
  return callAgent("/provision", { engine, dbName, dbUser });
}

export async function suspendDatabase(
  engine: string,
  dbName: string,
  dbUser: string
): Promise<AgentResponse> {
  return callAgent("/suspend", { engine, dbName, dbUser });
}

export async function resumeDatabase(
  engine: string,
  dbName: string,
  dbUser: string
): Promise<AgentResponse> {
  return callAgent("/resume", { engine, dbName, dbUser });
}

export async function terminateDatabase(
  engine: string,
  dbName: string,
  dbUser: string
): Promise<AgentResponse> {
  return callAgent("/terminate", { engine, dbName, dbUser });
}

export async function rotatePassword(
  engine: string,
  dbName: string,
  dbUser: string
): Promise<AgentResponse> {
  return callAgent("/rotate-password", { engine, dbName, dbUser });
}
