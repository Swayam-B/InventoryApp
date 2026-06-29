import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, (req, res) => {
  const { pin } = req.body;
  if (pin !== process.env.SECRET_APP_PIN) {
    return res.status(401).json({ message: 'Invalid PIN' });
  }

  const token = jwt.sign({ auth: true }, process.env.JWT_SECRET, { expiresIn: '30d' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({ message: 'Authenticated' });
});

export default router;
