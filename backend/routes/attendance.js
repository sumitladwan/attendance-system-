const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendWhatsAppMessage } = require('../services/whatsappService');

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

    // Check if already punched in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log(`📅 Checking for punch-in records for date: ${today.toISOString()}`);
    
    const existingRecord = await Attendance.findOne({
      userId: req.userId,
      date: { $gte: today }
    });

    if (existingRecord) {
      console.log(`⚠️ Existing record found - Status: ${existingRecord.status}`);
      if (existingRecord.status === 'punched-in') {
        console.log(`❌ User already punched in at: ${existingRecord.punchInTime}`);
        return res.status(400).json({ 
          message: 'Already punched in today',
          punchInTime: existingRecord.punchInTime 
        });
      }
    }

    // Create new attendance record
    const attendance = new Attendance({
      userId: req.userId,
      studentName: user.name,
      date: today,
      punchInTime: new Date(),
      status: 'punched-in'
    });

    await attendance.save();
    console.log(`✅ Punch-In successful - Record ID: ${attendance._id}`);

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

// Punch Out
router.post('/punch-out', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance record
    const attendance = await Attendance.findOne({
      userId: req.userId,
      date: { $gte: today }
    });

    if (!attendance) {
      return res.status(404).json({ message: 'No punch in record found for today' });
    }

    if (attendance.status === 'punched-out') {
      return res.status(400).json({ message: 'Already punched out today' });
    }

    // Update punch out time
    attendance.punchOutTime = new Date();
    attendance.status = 'punched-out';

    // Calculate working hours
    const diffMs = attendance.punchOutTime - attendance.punchInTime;
    attendance.workingHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

    await attendance.save();

    // Get user details for WhatsApp message
    const user = await User.findById(req.userId);
    
    // Send WhatsApp message to parent
    let messageResult = { success: false, message: 'Message not sent' };
    if (user && user.parentPhone && process.env.WHATSAPP_ENABLED === 'true') {
      messageResult = await sendWhatsAppMessage(
        user.parentPhone,
        user.name,
        attendance.punchInTime,
        attendance.punchOutTime,
        attendance.workingHours
      );
    }

    res.json({
      message: 'Punched out successfully',
      attendance: {
        punchInTime: attendance.punchInTime,
        punchOutTime: attendance.punchOutTime,
        workingHours: attendance.workingHours,
        status: attendance.status
      },
      parentNotification: {
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
    });

    res.json({ attendance: attendance || null });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all attendance records for student
router.get('/history', auth, async (req, res) => {
  try {
    const attendance = await Attendance.find({ userId: req.userId }).sort({ date: -1 });
    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
