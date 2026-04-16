const express = require('express');
const router = express.Router();
const { createGroup, getGroups, getTeacherGroups } = require('../controllers/groupController');

router.post('/groups', createGroup);
router.get('/groups', getGroups);
router.get('/groups/teacher/:teacherId', getTeacherGroups);

module.exports = router;
