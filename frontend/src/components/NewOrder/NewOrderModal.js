import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getSymbol } from '../../services/SymbolsService';
import SelectSymbol from '../SelectSymbol/SelectSymbol';
import SymbolPrice from './SymbolPrice'
import WalletSummary from './WalletSummary';
import SelectSide from './SelectSide';
import OrderType from './OrderType';
import QuantityInput from './QuantityInput';
import { STOP_TYPES } from '../../services/ExchangeService';
import { insertOrder } from '../../services/OrdersService';

/**
 * props:
 * - wallet
 * -onSubmit
 */
function NewOrderModal(props) {

    const [error, setError] = useState('');

    const history = useHistory();

    const DEFAULT_ORDER = {
        symbol: "",
        limitPrice: "0",
        stopPrice: "0",
        quantity: "0",
        icebergQty: "0",
        side: "BUY",
        type: "LIMIT"
    }

    const [order, setOrder] = useState(DEFAULT_ORDER);

    const [symbol, setSymbol] = useState({});

    const [isVisible, setIsVisible] = useState(false);

    const btnClose = useRef('');
    const btnSend = useRef('');
    const inputTotal = useRef('');


    useEffect(() => {
        const modal = document.getElementById('modalOrder');
        modal.addEventListener('hidden.bs.modal', (event) => {
            setIsVisible(false);
        })
        modal.addEventListener('shown.bs.modal', (event) => {
            setIsVisible(true);
        })

    }, [props.wallet])

    useEffect(() => {
        if (!order.symbol) return;

        const token = localStorage.getItem('token');
        getSymbol(order.symbol, token)
            .then(symbolObject => setSymbol(symbolObject))
            .catch(err => {
                console.error(err.response ? err.response.message : err.message);
                setError(err.response ? err.response.message : err.message);
            })
    }, [order.symbol])

    useEffect(() => {
        setError('');
        btnSend.current.disabled = false;

        const quantity = parseFloat(order.quantity);

        if (quantity && quantity < parseFloat(symbol.minLotSize)) {
            btnSend.current.disabled = true;
            return setError(`Min Lot Size: ${symbol.minLotSize}`);
        }

        if (order.type === 'ICEBERG') {
            const icebergQty = parseFloat(order.icebergQty);
            if (icebergQty && icebergQty < parseFloat(symbol.minLotSize)) {
                btnSend.current.disabled = true;
                return setError(`Min Lot Size (I) ${symbol.minLotSize}`);
            }
        }

        if (!quantity) return;

        const price = parseFloat(order.limitPrice);
        if (!price) return;

        const total = quantity * price;
        inputTotal.current.value = `${total}`.substring(0, 8);

        const minNotional = parseFloat(symbol.minNotional);
        if (total < minNotional) {
            btnSend.current.disabled = true;
            return setError(`Min Notional ${symbol.minNotional}`);
        }

    }, [order.limitPrice, order.quantity, order.icebergQty])


    function onSubmit(event) {
        const token = localStorage.getItem('token');
        insertOrder(order, token)
            .then(result => {
                btnClose.current.click();
                if (props.onSubmit) props.onSubmit(result);
            })
            .catch(err => {
                if (err.response && err.response.status === 401) {
                    btnClose.current.click();
                    return history.pushState('/');
                }
                console.error(err);
                setError(err.message);
            })
    }

    function onInputChange(event) {
        setOrder(prevState => ({ ...prevState, [event.target.id]: event.target.value }));

    }

    function getPriceClasses(orderType) {
        return orderType === 'MARKET' ? "col-md-6 mb-3 d-none" : "col-md-6 mb-3"
    }

    function getIcebergClasses(orderType) {
        return orderType === 'ICEBERG' ? "col-md-6 mb-3" : "col-md-6 mb-3 d-none";
    }

    function getStopPriceClasses(orderType) {
        return STOP_TYPES.indexOf(orderType) !== -1 ? "col-md-6 mb-3" : "col-md-6 mb-3 d-none";
    }

    function onPriceChange(book) {
        btnSend.current.disabled = false;
        setError('');

        const quantity = parseFloat(order.quantity);
        if (order.type === 'MARKET' && quantity) {
            if (order.side === 'BUY')
                inputTotal.current.value = `${quantity * parseFloat(book.ask)}`.substring(0, 8);
            else
                inputTotal.current.value = `${quantity * parseFloat(book.bid)}`.substring(0, 8);

            if (parseFloat(inputTotal.current.value) < order.minNotional) {
                btnSend.current.disabled = true;
                return setError(`Min Notional: ${order.minNotional}`);
            }
        }
    }

    return (
        <div className="modal fade" id="modalOrder" tabIndex="-1" role="dialog" aria-labelledby="modalTitleNotify" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <p className="modal-title" id="modalTitleNotify">New Order</p>
                        <button ref={btnClose} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="close" />
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <div className="form-group mb-4">
                                        <label htmlFor="symbol">Symbol</label>
                                        <SelectSymbol onChange={onInputChange} />
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    {
                                        isVisible
                                            ? <SymbolPrice symbol={order.symbol} onChange={onPriceChange} />
                                            : <React.Fragment></React.Fragment>
                                    }

                                </div>
                            </div>
                            <div className="row">
                                <label>You have:</label>
                            </div>
                            <WalletSummary wallet={props.wallet} symbol={symbol} />
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <SelectSide side={order.side} onChange={onInputChange} />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <OrderType type={order.type} onChange={onInputChange} />
                                </div>
                            </div>
                            <div className="row">
                                <div className={getPriceClasses(order.type)}>
                                    <div className="form-group">
                                        <label htmlFor="limitPrice">Limit Price:</label>
                                        <input type="number" className="form-control" id="limitPrice" placeholder="0" onChange={onInputChange} value={order.limitPrice} />
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <QuantityInput id="quantity" text="Quantity:" symbol={symbol} wallet={props.wallet} price={order.limitPrice} side={order.side} onChange={onInputChange} />
                                </div>
                            </div>
                            <div className="row">
                                <div className={getIcebergClasses(order.type)}>
                                    <QuantityInput id="icebergQty" text="Iceberg Qty:" symbol={symbol} wallet={props.wallet} price={order.limitPrice} side={order.side} onChange={onInputChange} />
                                </div>
                                <div className={getStopPriceClasses(order.type)}>
                                    <div className="form-group">
                                        <label htmlFor="stopPrice">Stop Price:</label>
                                        <input className="form-control" id="stopPrice" type="number" placeholder={order.stopPrice} onChange={onInputChange} value={order.stopPrice} />
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="total">Total Price:</label>
                                        <input ref={inputTotal} className="form-control" id="total" type="number" placeholder="0" disabled />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        {
                            error
                                ? <div className="alert alert-danger mt-1 col-9 py-1">{error}</div>
                                : <React.Fragment></React.Fragment>
                        }
                        <button ref={btnSend} type="button" className="btn btn-sm btn-primary" onClick={onSubmit}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NewOrderModal;