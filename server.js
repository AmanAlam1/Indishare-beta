/**
 * IndiShare - Deployable Beta Backend (Express + MongoDB)
 * Demo purpose: simulates operator-level data transfer. NOT production-ready.
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/indishare_db';
const PORT = process.env.PORT || 8000;

mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  phone: { type: String, unique: true },
  name: String,
  createdAt: { type: Date, default: Date.now }
});
const transferSchema = new mongoose.Schema({
  requestId: { type: String, unique: true },
  fromMsisdn: String,
  toMsisdn: String,
  bytesRequested: Number,
  bytesConfirmed: { type: Number, default: 0 },
  status: { type: String, default: 'PROCESSING' },
  operatorTxnId: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Transfer = mongoose.model('Transfer', transferSchema);

// Demo OTP store (in-memory)
const demoOtps = {};

// Routes
app.post('/auth/request-otp', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'phone required' });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  demoOtps[phone] = otp;
  await User.updateOne({ phone }, { $setOnInsert: { phone } }, { upsert: true });
  return res.json({ phone, otp, message: 'DEMO OTP returned. Replace with Twilio in production.' });
});

app.post('/auth/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'phone and otp required' });
  const stored = demoOtps[phone];
  if (!stored || stored !== otp) return res.status(400).json({ error: 'Invalid OTP (demo).' });
  // return a simple token (not JWT for demo)
  const token = Buffer.from(phone).toString('base64');
  return res.json({ access_token: token, token_type: 'demo' });
});

// middleware to demo-auth
function demoAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Authorization required (Bearer token)' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Invalid auth header' });
  const token = parts[1];
  const phone = Buffer.from(token, 'base64').toString('ascii');
  req.demoPhone = phone;
  next();
}

app.post('/transfers', demoAuth, async (req, res) => {
  const { fromMsisdn, toMsisdn, bytes } = req.body;
  if (!fromMsisdn || !toMsisdn || !bytes) return res.status(400).json({ error: 'fromMsisdn, toMsisdn and bytes required' });
  const requestId = uuidv4();
  const tr = new Transfer({
    requestId,
    fromMsisdn,
    toMsisdn,
    bytesRequested: bytes,
    status: 'PROCESSING'
  });
  await tr.save();
  // simulate operator async callback after delay
  setTimeout(async () => {
    tr.status = 'SUCCESS';
    tr.bytesConfirmed = bytes;
    tr.operatorTxnId = 'INDOP' + Date.now();
    await tr.save();
  }, 3000);
  return res.json({ transferId: requestId, status: tr.status });
});

app.get('/transfers/:requestId', demoAuth, async (req, res) => {
  const { requestId } = req.params;
  const tr = await Transfer.findOne({ requestId });
  if (!tr) return res.status(404).json({ error: 'Transfer not found' });
  return res.json(tr);
});

// admin metrics (simple)
app.get('/admin/metrics', async (req, res) => {
  const users = await User.countDocuments();
  const transfers = await Transfer.countDocuments();
  const success = await Transfer.countDocuments({ status: 'SUCCESS' });
  return res.json({ total_users: users, total_transfers: transfers, success_count: success });
});

// static frontend serve
app.use('/', express.static('public'));
app.use('/admin', express.static('admin'));

app.listen(PORT, () => console.log(`IndiShare demo server listening on port ${PORT}`));
