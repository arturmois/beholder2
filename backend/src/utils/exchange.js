const Binance = require('node-binance-api');

module.exports = (settings) => {

    if (!settings) throw new Error(`The settings object is required to connect on exchange!`);

    const binance = new Binance().options({
        APIKEY: settings.accessKey,
        APISECRET: settings.secretKey,
        recvWindow: 60000,
        family: 0,
        urls: {
            base: settings.apiUrl.endsWith('/') ? settings.apiUrl : settings.apiUrl + '/',
            stream: settings.streamUrl.endsWith('/') ? settings.streamUrl : settings.streamUrl + '/'
        }
    })

    function balance() {
        return binance.balance();
    }

    function exchangeInfo() {
        return binance.exchangeInfo();
    }

    function buy(symbol, quantity, limitPrice, options) {
        if (limitPrice)
            return binance.buy(symbol, quantity, limitPrice, options)
        return binance.marketBuy(symbol, quantity);
    }

    function sell(symbol, quantity, limitPrice, options) {
        if (limitPrice)
            return binance.sell(symbol, quantity, limitPrice, options)
        return binance.marketSell(symbol, quantity);
    }

    function cancel(symbol, orderId) {
        return binance.cancel(symbol, orderId);
    }

    function orderStatus(symbol, orderId) {
        return binance.orderStatus(symbol, orderId);
    }

    async function orderTrade(symbol, orderId) {
        const trades = await binance.trades(symbol);

        return trades.find(t => t.orderId ===  orderId);
    }

    function miniTickerStream(callback) {
        binance.websockets.miniTicker(markets => callback(markets));
    }

    function bookStream(callback) {
        binance.websockets.bookTickers(order => callback(order));
    }

    function userDataStream(balanceCallback, executionCallback, listStatusCallback) {
        binance.websockets.userData(
            balance => balanceCallback(balance),
            executionData => executionCallback(executionData),
            subscribeData => console.log(`userDataStream:subscribed:  ${subscribeData}`),
            listStatusData => listStatusCallback(listStatusData)
        )
    }

    return {
        exchangeInfo,
        miniTickerStream,
        bookStream,
        userDataStream,
        balance,
        buy,
        sell,
        cancel,
        orderStatus,
        orderTrade
    }
}