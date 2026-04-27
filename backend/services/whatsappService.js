const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

// Initialize WhatsApp client with persistent session
let client = null;
let isClientReady = false;

const initializeWhatsApp = () => {
  if (client) return client;

  client = new Client({
    authStrategy: new LocalAuth({
      clientId: 'attendance-system',
      dataPath: path.join(__dirname, '../.wwebjs_auth')
    }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  // QR Code event
  client.on('qr', (qr) => {
    console.log('\n\n📱 SCAN THIS QR CODE WITH YOUR WHATSAPP:');
    qrcode.generate(qr, { small: true });
    console.log('\n');
  });

  // Ready event
  client.on('ready', () => {
    isClientReady = true;
    console.log('✅ WhatsApp Client is ready and connected!');
  });

  // Authenticated event
  client.on('authenticated', () => {
    console.log('✅ WhatsApp authenticated successfully!');
  });

  // Disconnected event
  client.on('disconnected', (reason) => {
    isClientReady = false;
    console.log('⚠️ WhatsApp disconnected:', reason);
  });

  // Initialize the client
  client.initialize();

  return client;
};

// Send WhatsApp message to parent
const sendWhatsAppMessage = async (parentPhoneNumber, studentName, punchInTime, punchOutTime, workingHours) => {
  try {
    // Initialize client if not already done
    if (!client) {
      initializeWhatsApp();
    }

    // Wait for client to be ready (max 30 seconds)
    let retries = 0;
    while (!isClientReady && retries < 30) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      retries++;
    }

    if (!isClientReady) {
      return {
        success: false,
        error: 'WhatsApp client not connected. Please scan QR code.',
        message: 'WhatsApp not ready - scan QR code in terminal'
      };
    }

    // Format phone number with country code (example: +91 for India)
    const formattedPhone = `91${parentPhoneNumber.slice(-10)}@c.us`;

    // Create message content
    const message = `Hello! 👋

Your ward *${studentName}* has completed attendance for today.

📍 *Attendance Details:*
• Punch In: ${new Date(punchInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
• Punch Out: ${new Date(punchOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
• Working Hours: ${workingHours} hours

Thank you!`;

    // Send WhatsApp message
    const response = await client.sendMessage(formattedPhone, message);

    console.log(`✅ WhatsApp message sent to ${parentPhoneNumber}. Message ID: ${response.id}`);
    return {
      success: true,
      messageId: response.id,
      message: 'WhatsApp message sent successfully to parent'
    };
  } catch (error) {
    console.error(`❌ Failed to send WhatsApp message: ${error.message}`);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send message, but attendance recorded'
    };
  }
};

// Get WhatsApp connection status
const getWhatsAppStatus = () => {
  return {
    isReady: isClientReady,
    status: isClientReady ? 'Connected' : 'Not Connected'
  };
};

module.exports = {
  initializeWhatsApp,
  sendWhatsAppMessage,
  getWhatsAppStatus
};
