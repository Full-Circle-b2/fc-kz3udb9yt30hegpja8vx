function compilePath(path) {
  const parts = path.split("/").filter(Boolean);
  return {
    parts,
    match(pathname) {
      const input = pathname.split("/").filter(Boolean);
      if (input.length !== parts.length) return null;
      const params = {};
      for (let i = 0; i < parts.length; i += 1) {
        const routePart = parts[i];
        const inputPart = input[i];
        if (routePart.startsWith(":")) {
          params[routePart.slice(1)] = decodeURIComponent(inputPart);
        } else if (routePart !== inputPart) {
          return null;
        }
      }
      return params;
    },
  };
}

function createRouter(routes) {
  const compiled = routes.map((route) => ({
    ...route,
    matcher: compilePath(route.path),
  }));

  return {
    match(method, pathname) {
      for (const route of compiled) {
        if (route.method !== method) continue;
        const params = route.matcher.match(pathname);
        if (params) return { route, params };
      }
      return null;
    },
  };
}

module.exports = { createRouter };
