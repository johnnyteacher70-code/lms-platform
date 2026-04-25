const express = require('express');
const router = express.Router();
const groupStatsController = require('../controllers/groupStatsController');

router.get('/groups/:groupId/stats', groupStatsController.getGroupStats);

module.exports = router;
