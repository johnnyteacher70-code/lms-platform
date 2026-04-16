const Notification = require('../models/Notification');

// Foydalanuvchining barcha bildirishnomalarini olish
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50); // So'nggi 50 ta xabar
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Bildirishnomalarni olishda xatolik", error: error.message });
  }
};

// Bildirishnomani o'qilgan deb belgilash
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Bildirishnoma topilmadi" });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
};

// Barcha bildirishnomalarni o'qilgan deb belgilash
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.params.userId;
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
    res.json({ message: "Barchasi o'qilgan deb belgilandi" });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
};
