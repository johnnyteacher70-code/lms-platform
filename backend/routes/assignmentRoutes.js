const express = require('express');
const router = express.Router();
const { getAssignments, createAssignment } = require('../controllers/assignmentController');

router.get('/assignments', getAssignments);
router.post('/assignments', createAssignment);

module.exports = router;
