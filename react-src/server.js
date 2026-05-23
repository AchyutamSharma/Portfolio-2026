import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const maskSecret = (value) => {
  if (!value) return '';
  if (value.length <= 2) return '*'.repeat(value.length);
  return `${value[0]}${'*'.repeat(value.length - 2)}${value.slice(-1)}`;
};

let currentAdminPassword = process.env.ADMIN_PASSWORD || 'AKS';
const messages = [];

app.use(express.json());

app.post('/api/admin/auth', async (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }

  const isValid = password === currentAdminPassword;
  console.log(`Admin authentication attempt details: Success=${isValid}, Time=${new Date().toISOString()}, IP=${req.ip}`);

  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }

  return res.json({ success: true, message: 'Authenticated successfully' });
});

app.post('/api/admin/change-password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Old password and new password are required' });
  }

  if (oldPassword !== currentAdminPassword) {
    console.log(`Failed password change attempt: Incorrect current password, Time=${new Date().toISOString()}, IP=${req.ip}`);

    return res.status(401).json({ success: false, message: 'Old password is incorrect' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
  }

  currentAdminPassword = newPassword;
  console.log(`Admin password changed successfully: Time=${new Date().toISOString()}, IP=${req.ip}`);

  return res.json({ success: true, message: 'Password updated successfully' });
});

app.get('/api/admin/messages', (req, res) => {
  return res.json({ success: true, messages });
});

app.delete('/api/admin/messages/:id', (req, res) => {
  const { id } = req.params;
  const index = messages.findIndex((msg) => msg.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Message not found' });
  }
  messages.splice(index, 1);
  return res.json({ success: true, message: 'Message deleted successfully' });
});

const sanitizeText = (value) => {
  if (typeof value !== 'string') return '';
  return value.replace(/<[^>]*>/g, '').replace(/[\u0000-\u001F\u007F]/g, '').trim();
};

const sanitizeEmail = (value) => {
  if (typeof value !== 'string') return '';
  return value.replace(/[\s<>"'\\]/g, '').trim();
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

app.post('/api/contact', async (req, res) => {
  const name = sanitizeText(req.body.name);
  const email = sanitizeEmail(req.body.email);
  const subject = sanitizeText(req.body.subject);
  const message = sanitizeText(req.body.message);

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: 'Provide a valid email address' });
  }

  if (name.length > 100 || subject.length > 120 || message.length > 1000) {
    return res.status(400).json({ success: false, message: 'One or more fields exceed supported length' });
  }

  const contactMessage = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    email,
    subject,
    message,
    receivedAt: new Date().toISOString(),
  };

  messages.unshift(contactMessage);

  console.log(`Received contact message:\n  Name: ${name}\n  Email: ${email}\n  Subject: ${subject}\n  Message: ${message}`);

  return res.json({ success: true, message: 'Message received successfully!' });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Portfolio Express Server running on port ${PORT}`);
});
