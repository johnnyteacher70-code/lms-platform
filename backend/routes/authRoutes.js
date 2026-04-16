const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAllUsers, deleteUser, updateUser } = require('../controllers/authController');

// Xavfsizlik middleware lari (qo'riqchilar) ham qo'shilishi mumkin
// Ammo hozir oson ishlashi uchun to'g'ridan to'g'ri router ulangan

router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id', updateUser);

module.exports = router;
