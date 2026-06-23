import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    default: ''
  },
  middleInitial: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  gradeLevel: {
    type: String,
    default: ''
  },
  section: {
    type: String,
    default: ''
  },
  lrn: {
    type: String,
    default: ''
  },
  sex: {
    type: String,
    default: 'Male'
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: 'Angeles City, PH'
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  token: {
    type: String,
    required: true
  },
  pushSubscription: {
    type: Object,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

export default User;
