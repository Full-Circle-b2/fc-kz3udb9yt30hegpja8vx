const http = require("http");
const { URL } = require("url");
const { createRequestContext } = require("./context");
const { sendJson, readJsonBody } = require("./runtime/http");
const { createRouter } = require("./runtime/router");
const { routes } = require("./generated/routes");

const port = Number(process.env.PORT || 3000);
const router = createRouter(routes);

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const match = router.match(req.method || "GET", requestUrl.pathname);

  if (!match) {
    sendJson(res, 404, {
      error: "not_found",
      message: "No generated route matched this request.",
      backendVersion: process.env.BACKEND_VERSION || "dev",
    });
    return;
  }

  try {
    const body = req.method === "POST" || req.method === "PUT" || req.method === "PATCH"
      ? await readJsonBody(req)
      : undefined;
    const context = createRequestContext({
      headers: req.headers,
      method: req.method || "GET",
      path: requestUrl.pathname,
    });

    const result = await match.route.handler({
      request: req,
      params: match.params,
      context,
      body,
      query: Object.fromEntries(requestUrl.searchParams.entries()),
    });

    sendJson(res, result.status || 200, result.body, result.headers);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = /must be|required|valid json|one of/i.test(message) ? 400 : 500;
    sendJson(res, status, {
      error: status === 400 ? "invalid_request" : "internal_error",
      message,
      backendVersion: process.env.BACKEND_VERSION || "dev",
    });
  }
});

server.listen(port, () => {
  console.log("generated-backend listening on", port);
});
