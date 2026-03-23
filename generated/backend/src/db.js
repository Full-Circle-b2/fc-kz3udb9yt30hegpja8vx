const { PrismaClient } = require("@prisma/client");

let prisma;

function getDbClient() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

module.exports = { getDbClient };
