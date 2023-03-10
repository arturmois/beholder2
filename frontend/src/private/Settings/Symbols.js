import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { searchSymbols, syncSymbols } from '../../services/SymbolsService';
import SymbolRow from './SymbolRow';
import SelectQuote, { getDefaultQuote, setDefaultQuote } from '../../components/SelectQuote/SelectQuote';
import SymbolModal from './SymbolModal';
import Pagination from '../../components/Pagination/Pagination';

function Symbols() {

    const history = useHistory();

    const defaultLocation = useLocation();

    function getPage(location) {
        if (!location) location = defaultLocation;
        return new URLSearchParams(location.search).get('page') || 1;
    }


    useEffect(() => {
        return history.listen(location => {
            setPage(getPage(location));
        })
    }, [history])

    const [symbols, setSymbols] = useState([]);

    const [error, setError] = useState('');

    const [page, setPage] = useState(getPage());

    const [count, setCount] = useState(0);

    const [quote, setQuote] = useState(getDefaultQuote());

    const [success, setSuccess] = useState('');

    const [isSyncing, setIsSyncing] = useState(false);

    const [editSymbol, setEditSymbol] = useState({
        symbol: '',
        basePrecision: 0,
        quotePrecision: 0,
        minNotional: '',
        minLotSite: ''
    })

    function onSyncClick(event) {
        const token = localStorage.getItem('token');
        setIsSyncing(true);
        syncSymbols(token)
            .then(response => setIsSyncing(false))
            .catch(err => {
                if (err.response && err.response.status === 401) return history.push('/');
                console.error(err.message);
                setError(err.message);
                setSuccess('');
            })
    }

    function onQuoteChange(event) {
        setQuote(event.target.value);
        setDefaultQuote(event.target.value);
    }

    function onEditSymbol(event) {
        const symbol = event.target.id.replace('edit', '');
        const symbolObj = symbols.find(s => s.symbol === symbol);
        setEditSymbol(symbolObj);
    }

    function errorHandling(err) {
        console.error(err.response ? err.response.data : err.message);
        setError(err.response ? err.response.data : err.message);
        setSuccess('');
    }

    function loadSymbols(selectedValue) {
        const token = localStorage.getItem('token');
        const search = selectedValue === 'FAVORITES' ? '' : selectedValue;
        const onlyFavorites = selectedValue === 'FAVORITES';
        searchSymbols(token, search, onlyFavorites, getPage())
            .then(result => {
                setSymbols(result.rows);
                setCount(result.count);
            })
            .catch(err => errorHandling(err));
    }

    useEffect(() => {
        loadSymbols(quote);
    }, [isSyncing, quote, page])

    function onModalSubmit(event) {
        loadSymbols(quote)
    }

    return (
        <React.Fragment>
            <div className="row">
                <div className="col-12">
                    <div className="col-12 mb-4">
                        <div className="card border-0 shadow">
                            <div className="card-header">
                                <div className="row align-items-center">
                                    <div className="col">
                                        <h2 className="fs-5 fw-bold mb-0">Symbols</h2>
                                    </div>
                                    <div className="col">
                                        <SelectQuote onChange={onQuoteChange} />
                                    </div>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="table align-items-center table-flush">
                                    <thead className="thead-light">
                                        <tr>
                                            <th className="border-bottom" scope="col">Symbol</th>
                                            <th className="border-bottom" scope="col">Base Prec</th>
                                            <th className="border-bottom" scope="col">Quote Prec</th>
                                            <th className="border-bottom" scope="col">Min Notional</th>
                                            <th className="border-bottom" scope="col">Min Lot Size</th>
                                            <th >Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {symbols.map(item => <SymbolRow key={item.symbol} data={item} onClick={onEditSymbol} />)}
                                    </tbody>
                                </table>
                                <Pagination count={count} />
                                <div className="card-footer">
                                    <div className="row">
                                        <div className="col">
                                            <button className="btn btn-primary animate-up-2" type="button" onClick={onSyncClick}>
                                                <svg className="icon icon-xs" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"></path>
                                                </svg>
                                                {isSyncing ? "Syncing..." : "Sync"}
                                            </button>
                                        </div>
                                        <div className="col">
                                            {error ?
                                                <div className="alert alert-danger">{error}</div>
                                                : <React.Fragment></React.Fragment>
                                            }
                                            {success ?
                                                <div className="alert alert-success">{success}</div>
                                                : <React.Fragment></React.Fragment>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* {
                error ? <div className="alert alert-danger">{error}</div>
                    : <React.Fragment></React.Fragment>
            } */}
            <SymbolModal data={editSymbol} onSubmit={onModalSubmit} />
        </React.Fragment>
    )
}

export default Symbols;