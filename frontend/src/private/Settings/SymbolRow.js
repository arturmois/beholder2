import React from 'react';

/**
 * props.onclick
 * props.onDeleteClick
 * props.data:
 * - symbol
 * - basePrecision
 * - quotePrecision
 * - minNotional
 * - minLotSize
 * - isFavorite
 */
function SymbolRow(props) {

    return (
        <tr>
            <td className="text-gray-900">
                {props.data.symbol}
                {
                    props.data.isFavorite
                        ? <svg fill="yellow" className="icon icon-xs" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"></path>
                        </svg>
                        : <React.Fragment></React.Fragment>
                }

            </td>
            <td className="text-gray-900">
                {props.data.basePrecision}
            </td>
            <td className="text-gray-900">
                {props.data.quotePrecision}
            </td>
            <td className="text-gray-900">
                {props.data.minNotional}
            </td>
            <td className="text-gray-900">
                {props.data.minNotional}
            </td>
            <td>
                <button id={"edit" + props.data.symbol} className="btn btn-secondary animate-up-2" width={32} data-bs-toggle="modal" data-bs-target="#modalSymbol" onClick={props.onClick}>
                    <svg id={"edit" + props.data.symbol} className="icon icon-xs" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" onClick={props.onClick}>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"></path>
                    </svg>
                </button>
                <button id={"edit" + props.data.symbol} className="btn btn-danger animate-up-2 color-red" width={32} onClick={props.onDeleteClick}>
                    <svg id={"edit" + props.data.symbol} className="icon icon-xs" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"></path>
                    </svg>
                </button>
            </td>
        </tr>
    )
}

export default SymbolRow;