const crypto = require('crypto');

const getTicketSecret = () => {
  return process.env.TICKET_SECRET || process.env.JWT_SECRET || 'viticket_secret_key_prod_2026';
};

/**
 * Generate a unique readable Ticket ID (e.g. TKT-9F3B2A1E)
 */
const generateTicketId = () => {
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TKT-${randomHex}`;
};

/**
 * Generate a cryptographically signed ticket token using HMAC-SHA256
 * Format: base64(payload).signature
 */
const generateSignedToken = ({ ticketId, eventId, studentId }) => {
  const payload = {
    ticketId,
    eventId: eventId.toString(),
    studentId: studentId.toString(),
    issuedAt: Date.now(),
  };

  const payloadString = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadString).toString('base64url');

  const signature = crypto
    .createHmac('sha256', getTicketSecret())
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
};

/**
 * Verify cryptographic signature of a ticket token
 * Returns { valid: boolean, payload: object, error: string }
 */
const verifySignedToken = (token) => {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token is missing or not a string' };
  }

  const parts = token.trim().split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Malformed token structure' };
  }

  const [payloadBase64, signature] = parts;

  // Compute expected HMAC signature
  const expectedSignature = crypto
    .createHmac('sha256', getTicketSecret())
    .update(payloadBase64)
    .digest('base64url');

  // Constant-time comparison to prevent timing attacks
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return { valid: false, error: 'Cryptographic signature verification failed' };
  }

  try {
    const payloadString = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadString);

    if (!payload.ticketId || !payload.eventId || !payload.studentId) {
      return { valid: false, error: 'Invalid token payload parameters' };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: 'Failed to decode token payload JSON' };
  }
};

module.exports = {
  generateTicketId,
  generateSignedToken,
  verifySignedToken,
};
