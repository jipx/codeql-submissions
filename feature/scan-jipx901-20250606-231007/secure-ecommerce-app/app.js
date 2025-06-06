// Secure Node.js Express E-commerce Application Template with PostgreSQL
// Hardened with OWASP Top 10 enhancements and extended protections

import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import csurf from 'csurf';
import pg from 'pg';
import connectPgSimple from 'connect-pg-simple';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import xss from 'xss-clean';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const pgSession = connectPgSimple(session);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Middleware
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    objectSrc: ["'none'"]
  }
}));
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(xss());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
}));

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again later.'
});

app.use(session({
  store: new pgSession({ pool }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production' }
}));

app.use(csurf());

function isAdmin(decoded) {
  return decoded.role === 'admin';
}

// Secure logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Register
app.post('/api/register', [
  body('email').isEmail(),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must include upper, lower, number, and special character')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 12);
    await pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, hashed]);
    res.status(201).json({ message: 'User registered securely' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, role: user.role || 'user' }, JWT_SECRET, { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  res.json({ message: 'Login successful' });
});

// Profile
app.get('/api/profile', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT email FROM users WHERE id = $1', [decoded.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(401).json({ error: 'Invalid session' });
  }
});

// Product listing
app.get('/api/products', async (req, res) => {
  const result = await pool.query('SELECT * FROM products');
  res.json(result.rows);
});

// Admin product upload
app.post('/api/products', [
  body('name').notEmpty(),
  body('description').isString(),
  body('price').isFloat({ gt: 0 })
], async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const decoded = jwt.verify(token, JWT_SECRET);
  if (!isAdmin(decoded)) return res.status(403).json({ error: 'Forbidden' });
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { name, description, price } = req.body;
  const result = await pool.query(
    'INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING *',
    [name, description, price]
  );
  res.status(201).json(result.rows[0]);
});

app.delete('/api/products/:id', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const decoded = jwt.verify(token, JWT_SECRET);
  if (!isAdmin(decoded)) return res.status(403).json({ error: 'Forbidden' });
  await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
  res.json({ message: 'Product deleted' });
});

// Shopping cart
app.post('/api/cart', [
  body('productId').isInt({ gt: 0 }),
  body('quantity').isInt({ gt: 0 })
], async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const decoded = jwt.verify(token, JWT_SECRET);
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { productId, quantity } = req.body;
  await pool.query(
    'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)',
    [decoded.id, productId, quantity]
  );
  res.json({ message: 'Added to cart' });
});

// Checkout
app.post('/api/checkout', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const decoded = jwt.verify(token, JWT_SECRET);
  const cart = await pool.query('SELECT * FROM cart WHERE user_id = $1', [decoded.id]);
  if (cart.rows.length === 0) return res.status(400).json({ error: 'Cart is empty' });
  const total = cart.rows.reduce((sum, item) => sum + item.quantity * 10, 0);
  await pool.query('INSERT INTO orders (user_id, total, paid) VALUES ($1, $2, $3)', [decoded.id, total, true]);
  await pool.query('DELETE FROM cart WHERE user_id = $1', [decoded.id]);
  res.json({ message: 'Checkout successful' });
});

// Reviews
app.post('/api/products/:id/review', [
  body('comment').notEmpty(),
  body('rating').isInt({ min: 1, max: 5 })
], async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const decoded = jwt.verify(token, JWT_SECRET);
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { comment, rating } = req.body;
  await pool.query(
    'INSERT INTO reviews (user_id, product_id, comment, rating) VALUES ($1, $2, $3, $4)',
    [decoded.id, req.params.id, comment, rating]
  );
  res.json({ message: 'Review submitted' });
});

app.listen(PORT, () => {
  console.log(`Secure e-commerce API running on port ${PORT}`);
});
