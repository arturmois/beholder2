import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const ORDERS_URL = `${API_URL}/orders/`;

const { STOP_TYPES } = require('./ExchangeService');

export async function getOrders(symbol, page, token) {
    const ordersUrl = `${ORDERS_URL}${symbol}?page=${page}`;
    const headers = { 'authorization': token }
    const response = await axios.get(ordersUrl, { headers });
    return response.data; // { count, rows }
}

export async function cancelOrder(symbol, orderId, token) {
    const ordersUrl = `${ORDERS_URL}${symbol}/${orderId}`;
    const headers = { 'authorization': token }
    const response = await axios.delete(ordersUrl, { headers });
    return response.data;
}

export async function syncOrder(beholderOrderId, token) {
    const ordersUrl = `${ORDERS_URL}${beholderOrderId}/sync`;
    const headers = { 'authorization': token }
    const response = await axios.post(ordersUrl, null, { headers });
    return response.data;
}

export async function insertOrder(order, token) {
    const postOrder = {
        symbol: order.symbol.toUpperCase(),
        quantity: order.quantity,
        side: order.side.toUpperCase(),
        options: {
            type: order.type.toUpperCase()
        }
    }

    if (['LIMIT', 'STOP_LOSS_LIMIT', 'TAKE_PROFIT_LIMIT', 'TRAILING_STOP'].includes(postOrder.options.type))
        postOrder.limitPrice = order.limitPrice;

    if (postOrder.options.type === "ICEBERG")
        postOrder.options.icebergQty = order.icebergQty;

    if (STOP_TYPES.includes(postOrder.options.type))
        postOrder.options.stopPrice = order.stopPrice;

    if (postOrder.options.type === 'TRAILING_STOP')
        postOrder.options.stopPriceMultiplier = order.stopPriceMultiplier;

    const headers = { 'authorization': token };
    const response = await axios.post(ORDERS_URL, postOrder, { headers });
    return response.data;
}