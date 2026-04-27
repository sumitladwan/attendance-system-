const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendWhatsAppMessage, sendWhatsAppChannelMessage } = require('../services/whatsappService');

// Punch In
router.post('/punch-in', auth, async (req, res) => {
  try {
    console.log(`⏰ Punch-In Request - User ID: ${req.userId}`);
    
    const user = await User.findById(req.userId);
    if (!user) {
      console.log(`❌ User not found: ${req.userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(`👤 User found: ${user.name}`);

    // Check if currently punched in (can't punch in twice without punching out first)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log(`📅 Checking for active punch-in for date: ${today.toISOString()}`);
    
    // Find the LAST record for today (most recent punch)
    const lastRecord = await Attendance.findOne({
      userId: req.userId,
      date: { $gte: today }
    }).sort({ createdAt: -1 });

    if (lastRecord && lastRecord.status === 'punched-in') {
      console.log(`⚠️ Currently punched-in - Status: ${lastRecord.status}`);
      console.log(`❌ Already punched in at: ${lastRecord.punchInTime}`);
      return res.status(400).json({ 
        message: 'You are already punched in. Please punch out first.',
        punchInTime: lastRecord.punchInTime,
        recordId: lastRecord._id
      });
    }

    console.log(`✅ Can punch in - Either no record or already punched out`);

    // Create new attendance record (allows multiple punch-in/out cycles per day)
    const attendance = new Attendance({
      userId: req.userId,
      studentName: user.name,
      date: today,
      punchInTime: new Date(),
      status: 'punched-in'
    });

    await attendance.save();
    const cycleCount = await Attendance.countDocuments({ userId: req.userId, date: { $gte: today } });
    console.log(`✅ Punch-In successful - Record ID: ${attendance._id} (Cycle ${cycleCount} today)`);

    res.status(201).json({
      message: 'Punched in successfully',
      attendance: {
        id: attendance._id,
        punchInTime: attendance.punchInTime,
        status: attendance.status,
        studentName: attendance.studentName
      }
    });
  } catch (error) {
    console.error(`❌ Punch-In Error: ${error.message}`);
    console.error('Stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Punch Out - Allow multiple punch-out cycles per day
router.post('/punch-out', auth, async (req, res) => {
  try {
    console.log(`⏰ Punch-Out Request - User ID: ${req.userId}`);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the LAST punched-in record (most recent one that's currently punched-in)
    const attendance = await Attendance.findOne({
      userId: req.userId,
      date: { $gte: today },
      status: 'punched-in'
    }).sort({ createdAt: -1 });

    if (!attendance) {
      console.log(`❌ No active punch-in record found for today`);
      return res.status(404).json({ message: 'You are not currently punched in' });
    }

    console.log(`👤 Found punch-in record - Punch-In time: ${attendance.punchInTime}`);

    // Update punch out time
    attendance.punchOutTime = new Date();
    attendance.status = 'punched-out';

    // Calculate working hours for this cycle
    const diffMs = attendance.punchOutTime - attendance.punchInTime;
    attendance.workingHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

    await attendance.save();
    console.log(`✅ Punch-Out successful - Working hours for this cycle: ${attendance.workingHours}`);

    // Get user details for WhatsApp channel message
    const user = await User.findById(req.userId);
    
    // Send WhatsApp message to channel (NOT individual parents)
    let messageResult = { success: false, message: 'Message not posted' };
    if (user && process.env.WHATSAPP_ENABLED === 'true' && process.env.WHATSAPP_CHANNEL_ID) {
      console.log(`📱 Posting attendance to WhatsApp channel...`);
      messageResult = await sendWhatsAppChannelMessage(
        user.name,
        user.enrollmentNumber,
        attendance.punchInTime,
        attendance.punchOutTime,
        attendance.workingHours
      );
    } else {
      console.log(`⚠️ WhatsApp channel not enabled or not configured`);
    }

    res.json({
      message: 'Punched out successfully',
      attendance: {
        punchInTime: attendance.punchInTime,
        punchOutTime: attendance.punchOutTime,
        workingHours: attendance.workingHours,
        status: attendance.status
      },
      channelNotification: {
        sent: messageResult.success,
        message: messageResult.message || messageResult.error
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get today's attendance
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      userId: req.userId,
      date: { $gte: today }
    }).sort({ createdAt: -1 }); // Get the LAST (most recent) record for today

    res.json({ attendance: attendance || null });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all attendance records for student
router.get('/history', auth, async (req, res) => {
  try {
    // Get all records sorted by date (newest first), then by creation time within same day
    const attendance = await Attendance.find({ userId: req.userId }).sort({ date: -1, createdAt: -1 });
    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
