const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendWhatsAppMessage } = require('../services/whatsappService');

// Punch In
router.post('/punch-in', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already punched in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingRecord = await Attendance.findOne({
      userId: req.userId,
      date: { $gte: today }
    });

    if (existingRecord && existingRecord.status === 'punched-in') {
      return res.status(400).json({ message: 'Already punched in today' });
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

    res.status(201).json({
      message: 'Punched in successfully',
      attendance: {
        punchInTime: attendance.punchInTime,
        status: attendance.status
      }
    });
  } catch (error) {
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
    if (user && user.parentPhone && process.env.TWILIO_ACCOUNT_SID) {
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
