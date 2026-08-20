export function redactSecrets(text: string): string {
  return text
    .replace(/sk-or-v1-[A-Za-z0-9_-]+/g, "[redacted-key]")
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, "Bearer [redacted]")
    .replace(/"api[_-]?key"\s*:\s*"[^"]*"/gi, '"api_key":"[redacted]"');
}
