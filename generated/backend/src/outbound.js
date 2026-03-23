function normalizeHost(value) {
  return String(value || "").trim().toLowerCase();
}

function assertAllowedOutboundUrl(rawUrl, context) {
  const url = new URL(rawUrl);
  const host = normalizeHost(url.hostname);
  const allowedHosts = (context.env.ALLOWED_OUTBOUND_HOSTS || []).map(normalizeHost);
  if (!allowedHosts.includes(host)) {
    throw new Error(`Outbound host not allowed: ${host}`);
  }
  return url.toString();
}

async function fetchWithPolicy(rawUrl, init, context) {
  const safeUrl = assertAllowedOutboundUrl(rawUrl, context);
  return fetch(safeUrl, init);
}

module.exports = { assertAllowedOutboundUrl, fetchWithPolicy };
