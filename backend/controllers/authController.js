const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'maxfiy_kalit', { expiresIn: '30d' });
};

exports.registerUser = async (req, res) => {
  const { name, email, password, role, groupId } = req.body;

  try {
    // Borligini tekshiramiz
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Ushbu email allaqachon band!' });
    }

    // Parolni shifrlash (hash)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name, 
      email, 
      password: hashedPassword, 
      role: role || 'student'
    };

    // Agar o'quvchi guruh tanlagan bo'lsa bazaga yoziymiz
    if (groupId && userData.role === 'student') {
        userData.groupId = groupId;
    }

    // Yangi User yaratish
    const user = await User.create(userData);

    res.status(201).json({
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        createdAt: user.createdAt 
      },
      token: generateToken(user._id)
    });

  } catch (error) {
    res.status(500).json({ message: 'Server xatoligi yuz berdi' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    // Shifrlangan parolni solishtirish
    if (user && (await bcrypt.compare(password, user.password))) {
      
      // Oxirgi kirgan vaqtini yangilash
      user.lastLogin = new Date();
      await user.save();

      res.json({
        user: { 
          _id: user._id, 
          name: user.name, 
          email: user.email, 
          role: user.role, 
          groupId: user.groupId,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        },
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Email yoki parol xato!' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server xatoligi yuz berdi' });
  }
};

// Barcha userlarni chaqirish (Admin Panel uchun)
exports.getAllUsers = async (req, res) => {
  try {
    // Userlarning parollaridan tashqari barcha ma'lumotini yuboramiz
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch(err) {
    res.status(500).json({ message: 'Server xatoligi' });
  }
};

const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;
  console.log(`[DELETE USER REQUEST] ${userId}`);
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found in DB!');
      return res.status(404).json({ message: 'Topilmadi' });
    }

    if (user.role === 'teacher') {
       console.log('Deleting teacher dependencies...');
       const teacherAssignments = await Assignment.find({ teacherId: userId });
       const ids = teacherAssignments.map(a => a._id);
       await Submission.deleteMany({ assignmentId: { $in: ids } });
       await Assignment.deleteMany({ teacherId: userId });
    } else if (user.role === 'student') {
       console.log('Deleting student dependencies...');
       await Submission.deleteMany({ studentId: userId });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'Foydalanuvchi to\'liq yo\'q qilindi.' });
  } catch(err) {
    console.error('[DELETE USER ERROR]', err);
    res.status(500).json({ message: 'Server xatoligi yuz berdi', error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const { name, email, role } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Topilmadi' });

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (err) {
    res.status(500).json({ message: 'Tahrirlashda xatolik', error: err.message });
  }
};
