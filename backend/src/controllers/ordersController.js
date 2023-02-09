const ordersRepository = require('../repositories/ordersRepository');
const settingsRepository = require('../repositories/settingsRepository');

async function getOrders(req, res, next) {
    const symbol = req.params.symbol && req.params.symbol.toUpperCase();
    const page = parseInt(req.query.page);
    const orders = await ordersRepository.getOrders(symbol, page || 1);
    res.json(orders);
}

async function insertOrder(req, res, next) {
    const id = res.locals.token.id;
    const settings = await settingsRepository.getDecryptedSettings(id);
    const exchange = require('../utils/exchange')(settings.get({ plain: true }));

    const { side, symbol, quantity, limitPrice, options, automationId } = req.body;

    let result;

    try {
        if (side === 'BUY')
            result = await exchange.buy(symbol, quantity, limitPrice, options);
        else if (side === 'SELL')
            result = await exchange.sell(symbol, quantity, limitPrice, options);
    }
    catch (err) {
        return res.status(400).json(err.body);
    }

    const order = await ordersRepository.insertOrder({
        automationId,
        symbol,
        quantity,
        type: options ? options.type : 'MARKET',
        side,
        limitPrice,
        stopPrice: options ? options.stopPrice : null,
        icebergQty: options ? options.icebergQty : null,
        orderId: result.orderId,
        clientOrderId: result.clientOrderId,
        transactTime: result.transactTime,
        status: result.status || 'NEW'
    })

    res.status(201).json(order.get({ plain: true }));
}

async function cancelOrder(req, res, next) {
    const id = res.locals.token.id;
    const settings = await settingsRepository.getDecryptedSettings(id);
    const exchange = require('../utils/exchange')(settings);

    const { symbol, orderId } = req.params;

    try {
        result = await exchange.cancel(symbol, orderId);
    }
    catch (err) {
        return res.status(400).json(err.body);
    }

    const order = await ordersRepository.updateOrderByOrderId(result.orderId, result.origClientOrderId, {
        status: result.status
    })

    res.json(order.get({ plain: true }));
}


module.exports = {
    getOrders,
    insertOrder,
    cancelOrder
}