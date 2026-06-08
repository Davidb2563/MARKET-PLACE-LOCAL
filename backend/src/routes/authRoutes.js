const express = require('express');
const { login, register } = require('../services/authService');

const authRouter = express.Router();

authRouter.post('/login', async (req, res, next) => {
  try {
    res.json({
      message: 'Login exitoso',
      ...await login(req.body),
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/register', async (req, res, next) => {
  try {
    res.status(201).json({
      message: 'Registro exitoso',
      ...await register(req.body),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = { authRouter };
