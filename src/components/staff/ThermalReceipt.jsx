import React from 'react';

const ThermalReceipt = ({ order, isPreliminary }) => {
    if (!order) return null;

    const receiptTitle = isPreliminary ? "PRELIMINARY BILL - NOT A RECEIPT" : "FINAL RECEIPT";

    return (
        <div className="hidden print:block print:absolute print:top-0 print:left-0 print:w-full print:bg-white print:text-black font-mono text-sm p-4 w-[80mm] mx-auto">
            <style>{`
                @media print {
                    @page { margin: 0; }
                    body {
                        background-color: white !important;
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }
                }
            `}</style>
            
            <div className="text-center mb-4">
                <h1 className="text-2xl font-black mb-1 uppercase">Taste Trek</h1>
                <p className="text-sm font-bold border-y border-black py-1 my-2">{receiptTitle}</p>
                <p className="text-xs">123 Flavor Street</p>
                <p className="text-xs">Food City, FC 90210</p>
                <p className="text-xs mt-2 font-bold">Tel: (555) 123-4567</p>
            </div>
            
            <div className="border-t border-b border-black py-2 mb-4 text-xs">
                <div className="flex justify-between">
                    <span>Order: #{order.orderId}</span>
                    <span>Table: {order.tableNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between mt-1">
                    <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                    <span>Time: {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
            </div>
            
            <table className="w-full text-xs mb-4">
                <thead>
                    <tr className="border-b border-black text-left">
                        <th className="py-1">QTY</th>
                        <th className="py-1">ITEM</th>
                        <th className="py-1 text-right">AMT</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items && order.items.map((item, idx) => (
                        <tr key={idx}>
                            <td className="py-1 align-top">{item.quantity}</td>
                            <td className="py-1 align-top pr-2">{item.name}</td>
                            <td className="py-1 align-top text-right">${((item.unitPrice || 0) * item.quantity).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            <div className="border-t border-black pt-2 mb-6">
                <div className="flex justify-between font-bold text-lg">
                    <span>TOTAL</span>
                    <span>${(order.totalAmount || 0).toFixed(2)}</span>
                </div>
            </div>
            
            <div className="text-center text-xs space-y-1">
                <p>Thank you for dining with us!</p>
                <p>Please come again.</p>
                <p className="mt-4 font-bold text-[10px]">Powered by Taste Trek POS</p>
            </div>
        </div>
    );
};

export default ThermalReceipt;
