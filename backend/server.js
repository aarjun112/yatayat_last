require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./User');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));


app.post('/signup', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const dummyCode = "123456";

  try {

    let user = await User.findOne({ email });

    if (user) {
      user.verificationCode = dummyCode;
      user.verified = false;
      await user.save();
    } else {
      user = new User({ email, verificationCode: dummyCode, verified: false, password: "dummy" });
      await user.save();
    }


    console.log(`Dummy verification code for ${email} is ${dummyCode}`);

    res.status(200).json({ message: 'Verification code sent (dummy)', code: dummyCode });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/verify-email', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ message: 'Email and code required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (user.verificationCode === code) {
      user.verified = true;
      await user.save();
      return res.status(200).json({ message: 'Email verified successfully' });
    } else {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/signup-complete', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (!user.verified) return res.status(400).json({ message: 'Email not verified' });

    user.password = password; 
    await user.save();

    res.status(200).json({ message: 'Signup complete' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    if (user.password !== password) return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.verified) return res.status(401).json({ message: 'Email not verified' });

    res.status(200).json({ message: 'Login successful' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
