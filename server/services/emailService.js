const nodemailer = require('nodemailer');
const { generateQRCodeBuffer } = require('./qrService');

let transporter = null;
let lastSentEmail = null; // Stored in memory for testing/debugging inspection

/**
 * Initialize or retrieve the Nodemailer Transporter
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    console.log(`[Email] Configured custom SMTP transporter for ${process.env.EMAIL_HOST}`);
  } else {
    // Ethereal test account fallback for instant zero-configuration testing
    console.log(`[Email] No SMTP credentials provided. Creating ephemeral Ethereal test account...`);
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Email] Ethereal test account ready: ${testAccount.user}`);
  }

  return transporter;
};

/**
 * Generate responsive HTML email template
 */
const generateTicketEmailHTML = ({ studentName, eventName, date, time, venue, registrationId, ticketId }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Event Ticket - ${eventName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0 0 8px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .badge { display: inline-block; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(4px); padding: 4px 14px; border-radius: 9999px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 17px; margin-bottom: 20px; line-height: 1.5; color: #334155; }
    .event-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .event-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
    .meta-row { display: flex; margin-bottom: 10px; font-size: 14px; }
    .meta-label { font-weight: 600; color: #64748b; width: 90px; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
    .meta-val { color: #0f172a; font-weight: 500; }
    .qr-section { text-align: center; background: #ffffff; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 24px; margin-bottom: 24px; }
    .qr-title { font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin-bottom: 12px; }
    .qr-img { width: 220px; height: 220px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .ticket-badge { margin-top: 14px; display: inline-block; font-family: monospace; font-size: 16px; font-weight: 700; background: #eff6ff; color: #1d4ed8; padding: 6px 16px; border-radius: 8px; border: 1px solid #bfdbfe; }
    .notice { background: #fefce8; border-left: 4px solid #eab308; padding: 14px 18px; border-radius: 6px; font-size: 14px; color: #713f12; line-height: 1.5; margin-bottom: 20px; }
    .footer { text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">REGISTRATION CONFIRMED</div>
      <h1>VITicket Campus Pass</h1>
      <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Official Digital Entry Ticket</p>
    </div>
    <div class="content">
      <div class="greeting">
        Hello <strong>${studentName}</strong>,<br>
        Your registration for <strong>${eventName}</strong> has been successfully confirmed!
      </div>

      <div class="event-box">
        <div class="event-title">${eventName}</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 100px;">DATE:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">TIME:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${time}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">VENUE:</td>
            <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${venue}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-weight: 600;">REG ID:</td>
            <td style="padding: 6px 0; color: #0f172a; font-family: monospace;">${registrationId}</td>
          </tr>
        </table>
      </div>

      <div class="qr-section">
        <div class="qr-title">YOUR OFFICIAL QR ENTRY PASS</div>
        <img src="cid:ticket_qr_code" alt="QR Ticket Code" class="qr-img" />
        <br>
        <div class="ticket-badge">Ticket ID: ${ticketId}</div>
      </div>

      <div class="notice">
        <strong>Important Entry Instructions:</strong><br>
        • Please present this QR code on your mobile phone or as a printout at the event entrance.<br>
        • Each ticket is cryptographically signed and valid for a <strong>single check-in only</strong>.<br>
        • Tampered or duplicate QR codes will be rejected by the organizer check-in scanner.
      </div>

      <div class="footer">
        VITicket • Automated Event Ticketing & QR Check-In System<br>
        VIT Campus, Vellore / Chennai • Keep this email secure.
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Send ticket confirmation email
 */
const sendTicketEmail = async ({ to, studentName, eventName, date, time, venue, registrationId, ticketId, ticketToken }) => {
  try {
    const activeTransporter = await getTransporter();
    const qrBuffer = await generateQRCodeBuffer(ticketToken);

    const fromAddress = process.env.EMAIL_FROM || '"VITicket System" <no-reply@viticket.vit.ac.in>';
    const subject = `Your Event Ticket - ${eventName}`;

    const mailOptions = {
      from: fromAddress,
      to,
      subject,
      text: `Hello ${studentName},\n\nYour registration for ${eventName} is confirmed!\nDate: ${date}\nTime: ${time}\nVenue: ${venue}\nTicket ID: ${ticketId}\nRegistration ID: ${registrationId}\n\nPlease present your QR pass at the entrance.\n\n- VITicket Campus Team`,
      html: generateTicketEmailHTML({
        studentName,
        eventName,
        date,
        time,
        venue,
        registrationId,
        ticketId,
      }),
      attachments: [
        {
          filename: `ticket-${ticketId}.png`,
          content: qrBuffer,
          cid: 'ticket_qr_code', // Referenced as cid:ticket_qr_code in HTML
        },
      ],
    };

    const info = await activeTransporter.sendMail(mailOptions);
    console.log(`[Email] Ticket email sent to ${to}. MessageId: ${info.messageId}`);

    // If using Ethereal, log the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Email] View preview at: ${previewUrl}`);
    }

    lastSentEmail = {
      to,
      subject,
      ticketId,
      previewUrl,
      sentAt: new Date(),
    };

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error(`[Email] Failed to send ticket email to ${to}:`, error.message);
    // Don't crash registration if email server times out; return failure flag
    return { success: false, error: error.message };
  }
};

const getLastSentEmail = () => lastSentEmail;

module.exports = {
  sendTicketEmail,
  getLastSentEmail,
};
