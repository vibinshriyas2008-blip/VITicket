const QRCode = require('qrcode');

/**
 * Generate a high-resolution QR Code Data URL from a signed token string
 */
const generateQRCodeDataURL = async (token) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(token, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 2,
      width: 400,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
    return qrDataUrl;
  } catch (error) {
    console.error('[QR Service] Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate a PNG Buffer for email attachment CID or filesystem output
 */
const generateQRCodeBuffer = async (token) => {
  try {
    const buffer = await QRCode.toBuffer(token, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
    return buffer;
  } catch (error) {
    console.error('[QR Service] Error generating QR buffer:', error);
    throw new Error('Failed to generate QR buffer');
  }
};

module.exports = {
  generateQRCodeDataURL,
  generateQRCodeBuffer,
};
