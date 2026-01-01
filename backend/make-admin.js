import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Find user by username and update to admin
    const username = process.argv[2] || 'admin';
    
    const user = await User.findOne({ username: username });
    
    if (!user) {
      console.log(`❌ User '${username}' not found`);
      console.log('\nAvailable users:');
      const allUsers = await User.find({}).select('username role');
      allUsers.forEach(u => console.log(`  - ${u.username} (${u.role})`));
    } else {
      user.role = 'admin';
      await user.save();
      console.log(`✅ User '${username}' is now an admin!`);
    }
    
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });
