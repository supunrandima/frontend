import React, { useState, useEffect } from 'react';
import { getOpenTabs, settleCash } from '../../services/orderService';
import { Coffee, Banknote, Receipt, Loader2, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import ThermalReceipt from './ThermalReceipt';

const WaiterOpenTabs = () => {
    const [openTabs, setOpenTabs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedCards, setExpandedCards] = useState({});
    const [actioningOrderId, setActioningOrderId] = useState(null);
    const [receiptOrder, setReceiptOrder] = useState(null);
    const [isPreliminaryReceipt, setIsPreliminaryReceipt] = useState(false);

    const fetchOpenTabs = async () => {
        try {
            const response = await getOpenTabs();
            setOpenTabs(response.data || []);
        } catch (error) {
            console.error("Error fetching open tabs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOpenTabs();
        const interval = setInterval(fetchOpenTabs, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const toggleExpand = (orderId) => {
        setExpandedCards(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    const handleSettleCash = async (order) => {
        setActioningOrderId(order.orderId);
        try {
            const response = await settleCash(order.orderId);
            const receiptAction = response.data?.receiptAction;

            if (receiptAction === 'EMAILED') {
                const wantsPrint = window.confirm("Payment confirmed and digital receipt emailed.\n\nDoes the customer also want a physical printout?");
                if (wantsPrint) {
                    setIsPreliminaryReceipt(false);
                    setReceiptOrder(order);
                    setTimeout(() => window.print(), 100);
                }
            } else if (receiptAction === 'PRINT_REQUIRED') {
                alert("Payment confirmed. Printing final receipt...");
                setIsPreliminaryReceipt(false);
                setReceiptOrder(order);
                setTimeout(() => window.print(), 100);
            }

            // Optimistic update
            setOpenTabs(prev => prev.filter(tab => tab.orderId !== order.orderId));
        } catch (error) {
            console.error("Failed to settle tab:", error);
            alert("Error settling tab. Please try again.");
        } finally {
            setActioningOrderId(null);
        }
    };

    const handlePrintBill = async (order) => {
        setActioningOrderId(order.orderId);
        setIsPreliminaryReceipt(true);
        setReceiptOrder(order);
        setTimeout(() => {
            window.print();
            setActioningOrderId(null);
        }, 100);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20 text-[#FF3131]">
                <Loader2 className="w-10 h-10 animate-spin" />
            </div>
        );
    }

    if (openTabs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500 border-2 border-dashed border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                <Coffee className="w-16 h-16 mb-4 text-gray-600 drop-shadow-md" />
                <h3 className="text-xl font-bold text-white mb-2">No Open Tabs</h3>
                <p>All served tables have settled their bills.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
            {openTabs.map((tab) => {
                const isExpanded = expandedCards[tab.orderId];
                return (
                    <div key={tab.orderId} className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl transition-all duration-300 flex flex-col relative overflow-hidden group hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(59,130,246,0.2)] hover:border-blue-500/50">
                        {/* Status Indicator */}
                        <div className={`absolute top-0 left-0 w-full h-1 ${tab.paymentStatus === 'AWAITING_CASH' ? 'bg-gradient-to-r from-yellow-400 to-amber-600 animate-pulse' : 'bg-gradient-to-r from-blue-400 to-indigo-600'}`}></div>
                        
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
                            <div>
                                <h3 className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors drop-shadow-md">
                                    Table {tab.tableNumber || 'N/A'}
                                </h3>
                                <div className="text-xs text-gray-400 font-mono mt-1">#{tab.orderId}</div>
                                {tab.paymentStatus === 'AWAITING_CASH' && (
                                    <span className="text-[10px] text-yellow-500 font-extrabold bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded mt-2 inline-block uppercase tracking-wider animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                                        Requested Bill
                                    </span>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-[#FF914D] drop-shadow-[0_0_8px_rgba(255,145,77,0.4)]">
                                    ${tab.totalAmount?.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(tab.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        </div>

                        {/* Items Summary (Expandable) */}
                        <div className="flex-1 mb-6">
                            <button 
                                onClick={() => toggleExpand(tab.orderId)}
                                className="w-full flex items-center justify-between text-sm text-gray-400 hover:text-white transition-colors mb-2 font-bold uppercase tracking-wider bg-black/20 p-2 rounded-xl border border-white/5 hover:border-white/20"
                            >
                                <span>Order Details ({tab.items?.length || 0} items)</span>
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            
                            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-60 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                                <div className="space-y-2 p-4 bg-black/40 backdrop-blur-md rounded-xl border border-white/5 shadow-inner overflow-y-auto custom-scrollbar">
                                    {tab.items && tab.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm items-start">
                                            <div className="flex gap-2">
                                                <span className="text-[#FF914D] font-bold">{item.quantity}x</span>
                                                <span className="text-gray-300">{item.name}</span>
                                            </div>
                                            <span className="text-gray-400">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto grid grid-cols-2 gap-3">
                            <button
                                onClick={() => handlePrintBill(tab)}
                                disabled={actioningOrderId === tab.orderId}
                                className="py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10 flex items-center justify-center gap-2 text-sm disabled:opacity-50 hover:shadow-lg"
                            >
                                <Receipt className="w-4 h-4 text-gray-300" />
                                Print Bill
                            </button>
                            <button
                                onClick={() => handleSettleCash(tab)}
                                disabled={actioningOrderId === tab.orderId}
                                className="py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                            >
                                {actioningOrderId === tab.orderId ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Banknote className="w-4 h-4" />
                                        Collect Payment
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                );
            })}
            </div>

            {/* Thermal Receipt Component (Hidden unless printing) */}
            <div id="thermal-receipt-container">
                <ThermalReceipt order={receiptOrder} isPreliminary={isPreliminaryReceipt} />
            </div>
        </div>
    );
};

export default WaiterOpenTabs;
