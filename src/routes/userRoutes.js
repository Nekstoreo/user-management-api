import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import database from '../utils/database.js';
import { auth } from '../middleware/auth.js';
import { VALIDATION_POLICIES, ERROR_MESSAGES } from '../utils/validationPolicies.js';

const router = express.Router();

router.post('/register',
  [
    body('name')
      .trim()
      .isLength({ min: VALIDATION_POLICIES.NAME.MIN_LENGTH, max: VALIDATION_POLICIES.NAME.MAX_LENGTH })
      .matches(VALIDATION_POLICIES.NAME.PATTERN)
      .withMessage(ERROR_MESSAGES.NAME),
    
    body('email')
      .trim()
      .isEmail()
      .matches(VALIDATION_POLICIES.EMAIL.PATTERN)
      .isLength({ max: VALIDATION_POLICIES.EMAIL.MAX_LENGTH })
      .withMessage(ERROR_MESSAGES.EMAIL),
    
    body('password')
      .isLength({ 
        min: VALIDATION_POLICIES.PASSWORD.MIN_LENGTH, 
        max: VALIDATION_POLICIES.PASSWORD.MAX_LENGTH 
      })
      .matches(VALIDATION_POLICIES.PASSWORD.PATTERN)
      .withMessage(ERROR_MESSAGES.PASSWORD),
    
    body('phone')
      .matches(VALIDATION_POLICIES.PHONE.PATTERN)
      .withMessage(ERROR_MESSAGES.PHONE)
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password, phone } = req.body;
      
      if (database.getUser(email)) {
        return res.status(400).send({ error: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 8);
      const user = {
        name,
        email,
        password: hashedPassword,
        phone
      };

      const userId = await database.addUser(user);
      res.status(201).send({ 
        message: 'User registered successfully',
        userId 
      });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).send({ error: 'Server error' });
    }
  }
);

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = database.getUser(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET);
    user.token = token;
    
    res.send({ token });
  } catch (error) {
    res.status(500).send({ error: 'Server error' });
  }
});

router.get('/profile', auth, (req, res) => {
  const { password, token, ...userProfile } = req.user;
  res.send(userProfile);
});

router.post('/validate-token', async (req, res) => {
  try {
    const token = req.body.token || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(400).send({ 
        valid: false, 
        error: 'Token no proporcionado' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = database.getUser(decoded.email);

    if (!user) {
      return res.status(401).send({ 
        valid: false, 
        error: 'Token inválido' 
      });
    }

    res.send({ 
      valid: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(401).send({ 
      valid: false, 
      error: 'Token inválido o expirado' 
    });
  }
});

export default router;
