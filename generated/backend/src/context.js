const { getDbClient } = require("./db");

function createRequestContext(request) {
  const authHeader = request.headers.authorization || "";
  const roleHeader = request.headers["x-app-role"];
  const userId = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  const allowedOutboundHosts = (process.env.ALLOWED_OUTBOUND_HOSTS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    projectId: process.env.PROJECT_ID || "unknown-project",
    session: userId ? { userId, role: roleHeader || "user" } : undefined,
    db: getDbClient(),
    env: {
      APP_BASE_URL: process.env.APP_BASE_URL || "",
      API_BASE_URL: process.env.APP_BASE_URL || "",
      NODE_ENV: process.env.NODE_ENV || "production",
      ALLOWED_OUTBOUND_HOSTS: allowedOutboundHosts,
    },
  };
}

module.exports = { createRequestContext };
