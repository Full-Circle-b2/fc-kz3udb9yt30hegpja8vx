function string(value, field, options = {}) {
  if (typeof value !== "string") {
    throw new Error(`${field} must be a string.`);
  }
  const trimmed = value.trim();
  if (!trimmed && options.required !== false) {
    throw new Error(`${field} is required.`);
  }
  if (options.max && trimmed.length > options.max) {
    throw new Error(`${field} must be at most ${options.max} characters.`);
  }
  return trimmed;
}

function optionalString(value, field, options = {}) {
  if (value == null || value === "") return undefined;
  return string(value, field, { ...options, required: false });
}

function enumValue(value, field, allowed) {
  if (!allowed.includes(value)) {
    throw new Error(`${field} must be one of: ${allowed.join(", ")}.`);
  }
  return value;
}

module.exports = { string, optionalString, enumValue };
