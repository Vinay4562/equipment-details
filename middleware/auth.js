import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET || 'please-change-secret';

// Create a compact signed token without external deps
function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function sign(data, secret) {
  return base64url(crypto.createHmac('sha256', secret).update(data).digest());
}

export function createToken(username, expiresInSeconds = 60 * 60 * 8) { // 8h default
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { sub: username, iat: now, exp: now + expiresInSeconds };
  const h = base64url(JSON.stringify(header));
  const p = base64url(JSON.stringify(payload));
  const s = sign(`${h}.${p}`, SECRET);
  return `${h}.${p}.${s}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const expected = sign(`${h}.${p}`, SECRET);
  if (s !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
    if (!payload || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Unauthorized' });
  req.user = { username: payload.sub };
  next();
}