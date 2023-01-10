import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { getSymbols } from '../../services/SymbolsService';
import SymbolRow from './SymbolRow';

function Symbols() {

    const history = useHistory();

    const [symbols, setSymbols] = useState([]);

    const [error, setError] = useState('');

    const [success, setSuccess] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        getSymbols(token)
            .then(symbols => {
                setSymbols(symbols);
            })
            .catch(err => {
                if (err.response && err.response.status === 401) return history.push('/');
                console.error(err.message);
                setError(err.message);
                setSuccess('');
            })
    }, [])

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
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="table align-items-center table-flush">
                                    <thead className="thead-light">
                                        <th className="border-bottom" scope="col">Symbol</th>
                                        <th className="border-bottom" scope="col">Base Prec</th>
                                        <th className="border-bottom" scope="col">Quote Prec</th>
                                        <th className="border-bottom" scope="col">Min Notional</th>
                                        <th className="border-bottom" scope="col">Min Lot Size</th>
                                        <th >Actions</th>

                                    </thead>
                                    <tbody>
                                        {symbols.map(item => <SymbolRow key={item.symbol} data={item} />)}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="2">
                                                <button className="btn btn-primary animate-up-2" type="button">
                                                    <svg className="icon icon-xs" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    Sync
                                                </button>
                                            </td>
                                            <td>
                                                {error ?
                                                    <div className="alert alert-danger">{error}</div>
                                                    : <React.Fragment></React.Fragment>
                                                }
                                                {success ?
                                                    <div className="alert alert-success">{success}</div>
                                                    : <React.Fragment></React.Fragment>
                                                }
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {
                error ? <div className="alert alert-danger">{error}</div>
                    : <React.Fragment></React.Fragment>
            }
        </React.Fragment>
    )
}

export default Symbols;