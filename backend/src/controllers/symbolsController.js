const symbolsRepository = require('../repositories/symbolsRepository');

async function getSymbols(req, res, next) {
    const symbols = await symbolsRepository.getSymbols();
    res.json(symbols);
}

async function getSymbol(req, res, next) {
    const symbol = req.params.symbol;
    synbolData = await symbolsRepository.getSymbol(symbol);
    res.json(synbolData);
}

async function updateSymbol(req, res, next) {
    const newSymbol = req.body;
    const symbol = req.params.symbol;
    await symbolsRepository.updateSymbol(symbol, newSymbol);
    res.sendStatus(200);
}

async function syncSymbols(req, res, next) {

    const favoriteSymbols = (await symbolsRepository.getSymbols()).filter(s => s.isFavorite).map(s => s.symbol);

    const settingsRepository = require('../repositories/settingsRepository');
    const settings = await settingsRepository.getDecryptedSettings(res.locals.token.id);
    const { exchangeInfo } = require('../utils/exchange')(settings.get({ plain: true }));

    const symbols = (await exchangeInfo()).symbols.map(item => {

        const minNotionalFilter = item.filters.find(f => f.filterType === 'MIN_NOTIONAL');
        const minLotSizeFilter = item.filters.find(f => f.filterType === 'LOT_SIZE');

        return {
            symbol: item.symbol,
            basePrecision: item.baseAssetPrecision,
            quotePrecision: item.quoteAssetPrecision,
            base: item.baseAsset,
            quote: item.quoteAsset,
            minNotional: minNotionalFilter ? minNotionalFilter.minNotional : '1',
            minLotSize: minLotSizeFilter ? minLotSizeFilter.minQty : '1',
            isFavorite: favoriteSymbols.some(s => s === item.symbol)
        }
    })

    await symbolsRepository.bulkInsert(symbols);

    res.sendStatus(201);
}

async function deleteSymbol(req, res, next) {
    const symbol = req.params.symbol;
    await symbolsRepository.deleteSymbol(symbol);
    res.sendStatus(200);
}

module.exports = {
    getSymbols,
    getSymbol,
    updateSymbol,
    syncSymbols,
    deleteSymbol
}