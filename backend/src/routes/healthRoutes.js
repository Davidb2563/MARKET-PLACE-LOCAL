const express = require('express');

const healthRouter = express.Router();

healthRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'LocalMarket API',
  });
});

module.exports = { healthRouter };
