const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Send WhatsApp message to parent
const sendWhatsAppMessage = async (parentPhoneNumber, studentName, punchInTime, punchOutTime, workingHours) => {
  try {
    // Format phone number with country code (example: +91 for India)
    // Make sure phone number is in format: whatsapp:+country_code_number
    const formattedPhone = `whatsapp:+91${parentPhoneNumber.slice(-10)}`;

    // Create message content
    const message = `Hello! 👋

Your ward *${studentName}* has completed attendance for today.

📍 *Attendance Details:*
• Punch In: ${new Date(punchInTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
• Punch Out: ${new Date(punchOutTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
• Working Hours: ${workingHours} hours

Thank you!`;

    // Send WhatsApp message
    const response = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: formattedPhone,
      body: message
    });

    console.log(`✅ WhatsApp message sent to ${parentPhoneNumber}. Message SID: ${response.sid}`);
    return {
      success: true,
      messageSid: response.sid,
      message: 'Message sent successfully to parent'
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

module.exports = {
  sendWhatsAppMessage
};
