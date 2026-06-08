const express = require('express');
const { createOrder, listOrders } = require('../services/orderService');

const orderRouter = express.Router();

orderRouter.get('/', async (req, res, next) => {
  try {
    res.json({ data: await listOrders(req.query.customerId) });
  } catch (error) {
    next(error);
  }
});

orderRouter.post('/', async (req, res, next) => {
  try {
    res.status(201).json({ data: await createOrder(req.body) });
  } catch (error) {
    next(error);
  }
});

module.exports = { orderRouter };
