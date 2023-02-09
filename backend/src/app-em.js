const WebSocket = require('ws');
const ordersRepository = require('./repositories/OrdersRepository')

module.exports = (settings, wss) => {

    if (!settings) throw new Error(`Can't start Exchange Monitor without settings.`);

    const exchange = require('./utils/exchange')(settings);

    function broadcast(jsonObject) {
        if (!wss || !wss.clients) return;
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(jsonObject));
            }
        })
    }

    exchange.miniTickerStream((markets) => {
        //console.log(markets);
        broadcast({ miniTicker: markets });

        const books = Object.entries(markets).map(mkt => {
            return { symbol: mkt[0], bestBid: mkt[1].close, bestAsk: mkt[1].close }
        })
        broadcast({ book: books });
    })

    function processExecutionData(executionData) {

        if (executionData.x === 'NEW') return;
        const order = {
            symbol: executionData.s,
            orderId: executionData.i,
            clientOrderId: executionData.X === 'CANCELED' ? executionData.C : executionData.c,
            side: executionData.S,
            type: executionData.o,
            status: executionData.X,
            isMaker: executionData.m,
            transactTime: executionData.T
        }

        if (order.status === 'FILLED') {
            const quoteAmount = parseFloat(executionData.Z);
            order.avgPrice = quoteAmount / parseFloat(executionData.z);
            order.commission = executionData.n;
            const isQuoteCommission = executionData.N && order.symbol.endsWith(executionData.N);
            order.net = isQuoteCommission ? quoteAmount - parseFloat(order.commission) : quoteAmount;
        }

        if (order.status === 'REJECTED') order.obs = executionData.r;

        setTimeout(() => {
            ordersRepository.updateOrderByOrderId(order.orderId, order.clientOrderId, order)
                .then(order => order && broadcast({ execution: order }))
                .catch(err => console.error(err))
        }, 3000)

    }

    exchange.userDataStream(balanceData => {
        broadcast({ balance: balanceData });
    },
        executionData => processExecutionData(executionData)
    )

    console.log(`App Exchange Monitor is running!`)
}