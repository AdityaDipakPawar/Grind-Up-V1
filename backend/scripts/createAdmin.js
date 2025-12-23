require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB, User } = require('../config/database');

(async () => {
  try {
    await connectDB();
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
      process.exit(1);
    }

    let user = await User.findOne({ email });
    if (user) {
      user.type = 'admin';
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }
      await user.save();
      console.log('Updated existing user to admin:', email);
    } else {
      const hashed = await bcrypt.hash(password, 10);
      user = new User({ email, password: hashed, type: 'admin' });
      await user.save();
      console.log('Created admin user:', email);
    }
    process.exit(0);
  } catch (e) {
    console.error('Failed to create admin:', e.message);
    process.exit(1);
  }
})();
