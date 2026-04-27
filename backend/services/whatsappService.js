const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

// Initialize WhatsApp client with persistent session
let client = null;
let isClientReady = false;

const initializeWhatsApp = () => {
  if (client) {
    console.log('📱 WhatsApp client already initialized');
    return client;
  }

  console.log('🚀 Creating new WhatsApp client...');

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
    console.log('\n⏰ QR Code will expire in 60 seconds. Scan quickly!\n');
  });

  // Ready event
  client.on('ready', () => {
    isClientReady = true;
    console.log('✅ WhatsApp Client is ready and connected!');
    console.log('📱 You can now send messages to parents!');
  });

  // Authenticated event
  client.on('authenticated', () => {
    console.log('✅ WhatsApp authenticated successfully!');
  });

  // Disconnected event
  client.on('disconnected', (reason) => {
    isClientReady = false;
    console.log('⚠️ WhatsApp disconnected:', reason);
    console.log('🔄 Will attempt to reconnect...');
  });

  // Error event
  client.on('error', (error) => {
    console.error('❌ WhatsApp client error:', error);
  });

  console.log('🔌 Initializing WhatsApp client connection...');
  // Initialize the client
  client.initialize();

  return client;
};

// Send WhatsApp message to parent
const sendWhatsAppMessage = async (parentPhoneNumber, studentName, punchInTime, punchOutTime, workingHours) => {
  try {
    // Initialize client if not already done
    if (!client) {
      console.log('📱 Client not initialized, initializing now...');
      initializeWhatsApp();
    }

    console.log(`⏳ Waiting for WhatsApp client to be ready (current status: ${isClientReady})`);

    // Wait for client to be ready (max 30 seconds)
    let retries = 0;
    while (!isClientReady && retries < 30) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      retries++;
    }

    if (!isClientReady) {
      console.error('❌ WhatsApp client not ready after 30 seconds');
      return {
        success: false,
        error: 'WhatsApp client not connected. Please scan QR code.',
        message: 'WhatsApp not ready - scan QR code in terminal'
      };
    }

    console.log(`✅ WhatsApp client is ready. Preparing to send message to ${parentPhoneNumber}`);

    // Format phone number with country code (example: +91 for India)
    const formattedPhone = `91${parentPhoneNumber.slice(-10)}@c.us`;
    console.log(`📱 Formatted phone: ${formattedPhone}`);

    // Create message content
    const message = `Hello! 👋

Your ward *${studentName}* has completed attendance for today.

📍 *Attendance Details:*
• Punch In: ${new Date(punchInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
• Punch Out: ${new Date(punchOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
• Working Hours: ${workingHours} hours

Thank you!`;

    console.log('📨 Sending WhatsApp message...');

    // Send WhatsApp message with error handling
    const response = await client.sendMessage(formattedPhone, message);

    console.log(`✅ WhatsApp message sent to ${parentPhoneNumber}. Message ID: ${response.id}`);
    return {
      success: true,
      messageId: response.id,
      message: 'WhatsApp message sent successfully to parent'
    };
  } catch (error) {
    console.error(`❌ Failed to send WhatsApp message: ${error.message}`);
    console.error('Error details:', error);
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
