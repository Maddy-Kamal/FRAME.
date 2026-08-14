/**
 * Minimal HTTP Basic Auth gate. When AUTH_USER/AUTH_PASS are set, every
 * request (API and the app itself) must present them — the browser's
 * native login prompt handles this, no login page to build. If either env
 * var is missing, auth is skipped entirely (fine for local-only dev).
 */
export function basicAuth(req, res, next) {
  const user = process.env.AUTH_USER;
  const pass = process.env.AUTH_PASS;
  if (!user || !pass) return next();

  const header = req.headers.authorization || "";
  const [scheme, encoded] = header.split(" ");

  if (scheme === "Basic" && encoded) {
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    const separatorIndex = decoded.indexOf(":");
    const suppliedUser = decoded.slice(0, separatorIndex);
    const suppliedPass = decoded.slice(separatorIndex + 1);
    if (timingSafeEqual(suppliedUser, user) && timingSafeEqual(suppliedPass, pass)) {
      return next();
    }
  }

  res.setHeader("WWW-Authenticate", 'Basic realm="FRAME", charset="UTF-8"');
  res.status(401).send("Authentication required.");
}

// Avoids leaking timing info about how much of the password matched.
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
