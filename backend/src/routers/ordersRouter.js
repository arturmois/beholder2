const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

router.get('/:symbol?', ordersController.getOrders);

router.post('/', ordersController.insertOrder);

router.delete('/:symbol/:orderId', ordersController.cancelOrder);

module.exports = router;