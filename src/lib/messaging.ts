import nodemailer from 'nodemailer';
import { Performance, Ticket } from '@/types';

export async function sendTicketEmail(
  ticket: Ticket,
  performance: Performance,
  qrCodeDataUrl: string
): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@tickets.com',
    to: ticket.customerPhoneNumber, // Assuming this can be an email
    subject: `Your Ticket - ${performance.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Your Ticket</h1>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">${performance.name}</h2>
          <p><strong>Date:</strong> ${new Date(performance.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${new Date(performance.date).toLocaleTimeString()}</p>
          <p><strong>Customer:</strong> ${ticket.customerName}</p>
          <p><strong>Seat:</strong> Row ${ticket.placeRow}, Seat ${ticket.placeNumber}</p>
          <p><strong>Reference:</strong> ${ticket.referenceName}</p>
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <img src="${qrCodeDataUrl}" alt="QR Code" style="max-width: 200px; height: auto;" />
          <p style="color: #666; font-size: 14px;">Please present this QR code at the venue</p>
        </div>

        <div style="background-color: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Performance Details</h3>
          <p>${performance.description}</p>
        </div>

        <p style="color: #666; font-size: 12px; text-align: center;">
          This is an automated email. Please do not reply.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Ticket email sent successfully');
  } catch (error) {
    console.error('Error sending ticket email:', error);
    throw new Error('Failed to send ticket email');
  }
}

export async function sendTicketViaTelegram(
  ticket: Ticket,
  performance: Performance,
  qrCodeDataUrl: string
): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = ticket.customerPhoneNumber; // Assuming this is the Telegram chat ID

  if (!botToken) {
    throw new Error('Telegram bot token not configured');
  }

  const message = `
🎭 *Your Ticket*

*Performance:* ${performance.name}
*Date:* ${new Date(performance.date).toLocaleDateString()}
*Time:* ${new Date(performance.date).toLocaleTimeString()}
*Customer:* ${ticket.customerName}
*Seat:* Row ${ticket.placeRow}, Seat ${ticket.placeNumber}
*Reference:* ${ticket.referenceName}

Please present the QR code below at the venue.
  `;

  try {
    // Send text message
    const messageUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    await fetch(messageUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    // Send QR code as photo
    const photoUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
    
    await fetch(photoUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        photo: qrCodeDataUrl,
        caption: 'QR Code for venue entry',
      }),
    });

    console.log('Ticket sent via Telegram successfully');
  } catch (error) {
    console.error('Error sending ticket via Telegram:', error);
    throw new Error('Failed to send ticket via Telegram');
  }
}

export async function sendTicketViaViber(
  ticket: Ticket,
  performance: Performance,
  qrCodeDataUrl: string
): Promise<void> {
  const authToken = process.env.VIBER_BOT_TOKEN;
  const receiverId = ticket.customerPhoneNumber; // Assuming this is the Viber user ID

  if (!authToken) {
    throw new Error('Viber bot token not configured');
  }

  const message = {
    auth_token: authToken,
    receiver: receiverId,
    type: 'text',
    text: `🎭 Your Ticket

Performance: ${performance.name}
Date: ${new Date(performance.date).toLocaleDateString()}
Time: ${new Date(performance.date).toLocaleTimeString()}
Customer: ${ticket.customerName}
Seat: Row ${ticket.placeRow}, Seat ${ticket.placeNumber}
Reference: ${ticket.referenceName}

Please present the QR code at the venue.`,
  };

  try {
    // Send text message
    await fetch('https://chatapi.viber.com/pa/send_message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    // Send QR code as picture
    const pictureMessage = {
      auth_token: authToken,
      receiver: receiverId,
      type: 'picture',
      media: qrCodeDataUrl,
      text: 'QR Code for venue entry',
    };

    await fetch('https://chatapi.viber.com/pa/send_message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pictureMessage),
    });

    console.log('Ticket sent via Viber successfully');
  } catch (error) {
    console.error('Error sending ticket via Viber:', error);
    throw new Error('Failed to send ticket via Viber');
  }
}
