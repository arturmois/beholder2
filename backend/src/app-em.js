const WebSocket = require('ws');
const crypto = require('./utils/crypto');

module.exports = (settings, wss) => {

    if (!settings) throw new Error(`Can't start Exchange Monitor without settings.`);

    settings.secretKey = crypto.decrypt(settings.secretKey);
    const exchange = require('./utils/exchange')(settings);

    exchange.miniTickerStream((markets) => {
        //console.log(markets);
        if (!wss || !wss.clients) return;
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ miniTicker: markets }));
            }
        })

        const books = Object.entries(markets).map(mkt => {
            return { symbol: mkt[0], bestBid: mkt[1].close, bestAsk: mkt[1].close }
        })

        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ book: books }));
            }
        })
    })

    console.log(`App Exchange Monitor is running!`)
}