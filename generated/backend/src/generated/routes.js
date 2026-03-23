const routes = [
  {
    method: "GET",
    path: "/healthz",
    handler: async ({ context }) => ({
      status: 200,
      body: {
        ok: true,
        projectId: context.projectId,
        version: process.env.BACKEND_VERSION || "dev",
      },
    }),
  },
  {
    method: "GET",
    path: "/api/version",
    handler: async ({ context }) => ({
      status: 200,
      body: {
        backendVersion: process.env.BACKEND_VERSION || "dev",
        projectId: context.projectId,
        databaseConfigured: context.db.urlConfigured,
        allowedOutboundHosts: context.env.ALLOWED_OUTBOUND_HOSTS,
      },
    }),
  },
  {
    method: "GET",
    path: "/api/items",
    handler: async ({ context }) => {
      const items = await context.db.appItem.findMany({
        orderBy: { createdAt: "desc" },
      });
      return {
        status: 200,
        body: { items },
      };
    },
  },
  {
    method: "POST",
    path: "/api/items",
    handler: async ({ body, context }) => {
      const { string, optionalString } = require("../runtime/validation");
      const item = await context.db.appItem.create({
        data: {
          title: string(body?.title, "title", { max: 120 }),
          details: optionalString(body?.details, "details", { max: 2000 }),
          status: "todo",
        },
      });
      return {
        status: 201,
        body: { item },
      };
    },
  },
  {
    method: "PATCH",
    path: "/api/items/:id",
    handler: async ({ body, params, context }) => {
      const { optionalString, enumValue } = require("../runtime/validation");
      const update = {
        ...(body?.title != null ? { title: optionalString(body.title, "title", { max: 120 }) || "Untitled item" } : {}),
        ...(body?.details !== undefined ? { details: optionalString(body.details, "details", { max: 2000 }) ?? null } : {}),
        ...(body?.status ? { status: enumValue(body.status, "status", ["todo", "done"]) } : {}),
      };
      const item = await context.db.appItem.update({
        where: { id: params.id },
        data: update,
      });
      return {
        status: 200,
        body: { item },
      };
    },
  },
  {
    method: "DELETE",
    path: "/api/items/:id",
    handler: async ({ params, context }) => {
      await context.db.appItem.delete({ where: { id: params.id } });
      return {
        status: 200,
        body: { ok: true },
      };
    },
  },
  {
    method: "GET",
    path: "/api/session",
    handler: async ({ query, context }) => ({
      status: 200,
      body: {
        query,
        session: context.session || null,
      },
    }),
  },
];

module.exports = { routes };
