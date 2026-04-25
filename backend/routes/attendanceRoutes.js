const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.post('/attendance', attendanceController.saveAttendance);
router.get('/attendance', attendanceController.getAttendance);
router.get('/attendance/matrix/:groupId', attendanceController.getAttendanceMatrix);

module.exports = router;
