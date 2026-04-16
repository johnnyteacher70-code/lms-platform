const express = require('express');
const router = express.Router();
const { saveAttendance, getAttendance } = require('../controllers/attendanceController');

router.post('/attendance', saveAttendance);
router.get('/attendance', getAttendance);

module.exports = router;
