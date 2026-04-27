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

// Send WhatsApp message to Channel with Retry Logic
const sendWhatsAppChannelMessage = async (studentName, enrollmentNumber, punchInTime, punchOutTime, workingHours) => {
  const MAX_RETRIES = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Initialize client if not already done
      if (!client) {
        console.log('📱 Client not initialized, initializing now...');
        initializeWhatsApp();
      }

      console.log(`⏳ Waiting for WhatsApp client to be ready (attempt ${attempt}/${MAX_RETRIES}, status: ${isClientReady})`);

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

      const channelId = process.env.WHATSAPP_CHANNEL_ID;
      if (!channelId) {
        console.error('❌ WHATSAPP_CHANNEL_ID not configured in .env');
        return {
          success: false,
          error: 'Channel not configured',
          message: 'WhatsApp channel not configured'
        };
      }

      console.log(`📱 Sending message to Channel: ${channelId} (Attempt ${attempt}/${MAX_RETRIES})`);

      // Create message for channel
      const message = `📌 *ATTENDANCE UPDATE*

👤 *Student:* ${studentName}
🎓 *Enrollment:* ${enrollmentNumber}

⏱️ *Punch In:* ${new Date(punchInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
⏱️ *Punch Out:* ${new Date(punchOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
⏱️ *Working Hours:* ${workingHours} hours

✅ Attendance recorded successfully`;

      console.log('📨 Sending message to WhatsApp Channel...');

      // Send message to channel with timeout protection
      const sendPromise = client.sendMessage(channelId, message);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Message send timeout after 10 seconds')), 10000)
      );

      const response = await Promise.race([sendPromise, timeoutPromise]);

      console.log(`✅ WhatsApp channel message sent successfully! Message ID: ${response.id}`);
      return {
        success: true,
        messageId: response.id,
        message: 'Attendance posted to WhatsApp channel',
        channel: channelId
      };

    } catch (error) {
      lastError = error;
      console.error(`⚠️ Attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`);
      
      // Check if this is a detached frame or connection error
      const isFrameError = error.message && (
        error.message.includes('detached Frame') || 
        error.message.includes('disconnected') ||
        error.message.includes('timeout') ||
        error.message.includes('ECONNREFUSED')
      );

      if (isFrameError && attempt < MAX_RETRIES) {
        console.log(`🔄 Browser frame error detected. Reconnecting... (${attempt}/${MAX_RETRIES})`);
        
        // Reset client and reconnect
        if (client) {
          try {
            await client.destroy();
          } catch (e) {
            console.log('Note: Client destroy threw error (expected):', e.message);
          }
        }
        client = null;
        isClientReady = false;
        
        // Wait before retrying with exponential backoff
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        // Reinitialize
        initializeWhatsApp();
        continue;
      }

      // If not a retryable error or last attempt, break
      if (attempt === MAX_RETRIES) {
        console.error(`❌ Failed after ${MAX_RETRIES} attempts: ${error.message}`);
        break;
      }
    }
  }

  // All retries exhausted
  console.error(`❌ Could not send message after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`);
  return {
    success: false,
    error: lastError?.message || 'Unknown error',
    message: 'Failed to post to channel, but attendance recorded'
  };
};

module.exports = {
  initializeWhatsApp,
  sendWhatsAppMessage,
  sendWhatsAppChannelMessage,
  getWhatsAppStatus
};
