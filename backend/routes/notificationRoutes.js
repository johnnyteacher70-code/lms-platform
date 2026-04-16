const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// For simplicity, we pass userId in the URL or body since there is no strict protect middleware in this project's current structure for all routes
router.get('/notifications/:userId', notificationController.getUserNotifications);
router.put('/notifications/:id/read', notificationController.markAsRead);
router.put('/notifications/read-all/:userId', notificationController.markAllAsRead);

module.exports = router;
