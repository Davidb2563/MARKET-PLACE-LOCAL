const express = require('express');
const {
  createProduct,
  deleteProduct,
  getProductById,
  listCategories,
  listProducts,
  updateProduct,
} = require('../services/productService');

const productRouter = express.Router();

productRouter.get('/categories', async (req, res, next) => {
  try {
    res.json({ data: await listCategories() });
  } catch (error) {
    next(error);
  }
});

productRouter.get('/', async (req, res, next) => {
  try {
    res.json({ data: await listProducts(req.query) });
  } catch (error) {
    next(error);
  }
});

productRouter.get('/:id', async (req, res, next) => {
  try {
    res.json({ data: await getProductById(req.params.id) });
  } catch (error) {
    next(error);
  }
});

productRouter.post('/', async (req, res, next) => {
  try {
    res.status(201).json({ data: await createProduct(req.body) });
  } catch (error) {
    next(error);
  }
});

productRouter.put('/:id', async (req, res, next) => {
  try {
    res.json({ data: await updateProduct(req.params.id, req.body) });
  } catch (error) {
    next(error);
  }
});

productRouter.delete('/:id', async (req, res, next) => {
  try {
    res.json({ data: await deleteProduct(req.params.id) });
  } catch (error) {
    next(error);
  }
});

module.exports = { productRouter };
