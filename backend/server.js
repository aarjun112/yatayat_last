require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./User');

const formData = require('form-data');      // <-- new
const Mailgun = require('mailgun.js');      // <-- new

const app = express();
const PORT = process.env.PORT || 5000;

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
  url: 'https://api.mailgun.net',  // default API URL
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.post('/signup', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  try {
    let user = await User.findOne({ email });

    if (user) {
      user.verificationCode = otp;
      user.codeExpires = expires;
      user.verified = false;
      await user.save();
    } else {
      user = new User({
        email,
        verificationCode: otp,
        codeExpires: expires,
        verified: false,
        password: "dummy"
      });
      await user.save();
    }

    const messageData = {
      from: "Verification <no-reply@" + process.env.MAILGUN_DOMAIN + ">",
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is ${otp}. It expires in 5 minutes.`,
    };

    await mg.messages.create(process.env.MAILGUN_DOMAIN, messageData);

    res.status(200).json({ message: 'Verification code sent to email' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/verify-email', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ message: 'Email and code required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (user.verificationCode !== code)
      return res.status(400).json({ message: 'Invalid verification code' });

    if (user.codeExpires < new Date())
      return res.status(400).json({ message: 'Verification code expired' });

    user.verified = true;
    user.verificationCode = null;
    user.codeExpires = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });

  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/signup-complete', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'User not found' });
  if (!user.verified) return res.status(400).json({ message: 'Email not verified' });

  user.password = password;
  await user.save();

  res.status(200).json({ message: 'Signup complete' });
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
