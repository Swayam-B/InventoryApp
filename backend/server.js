import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import auth from './middleware/auth.js';
import authRouter from './routes/auth.js';
import uploadRouter from './routes/upload.js';
import locationsRouter from './routes/locations.js';
import containersRouter from './routes/containers.js';
import itemsRouter from './routes/items.js';
import searchRouter from './routes/search.js';

const app = express();

// --- UPDATED CORS CONFIGURATION ---
const allowedOrigins = [
    'http://localhost:5173', 
    'https://swayambatra.com', 
    'https://inventory-app-phi-ruby.vercel.app'
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true 
}));
// ----------------------------------

app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => { console.error('MongoDB connection error:', err); process.exit(1); });

// Public auth route (rate-limited PIN login).
app.use('/api/auth', authRouter);

// Everything below requires a valid JWT cookie.
app.use('/api/upload', auth, uploadRouter);
app.use('/api/locations', auth, locationsRouter);
app.use('/api/containers', auth, containersRouter);
app.use('/api/items', auth, itemsRouter);
app.use('/api/search', auth, searchRouter);

// Session check used by the frontend on boot.
app.get('/api/me', auth, (req, res) => res.json({ authenticated: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
