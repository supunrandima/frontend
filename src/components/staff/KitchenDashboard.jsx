import React, { useState, useEffect, useMemo } from 'react';
import { getKitchenOrdersByStation, updateOrderItemStatus } from '../../services/kitchenService';
import { Clock, ChefHat, UtensilsCrossed, Loader2, Filter } from 'lucide-react';
import { Grid, Box, Typography, Chip } from '@mui/material';
import TableBarIcon from '@mui/icons-material/TableBar';
import TakeoutDiningIcon from '@mui/icons-material/TakeoutDining';

const STATIONS = ['All Stations', 'Grill & Wok', 'Pizza & Pasta', 'Salad & Dessert', 'Beverages'];

const OrderCard = ({ order, getStatusColor, handleItemStatusUpdate }) => (
    <div className={`rounded-2xl p-5 border-2 flex flex-col bg-[#2d2d2d] shadow-2xl ${getStatusColor(order.status).split(' ')[1]}`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-3">
            <div>
                <h2 className="text-2xl font-bold">#{order.orderId}</h2>
                <div className={`text-xs font-bold px-2 py-1 rounded mt-1 inline-block ${getStatusColor(order.status)}`}>
                    Order: {order.status}
                </div>
                {order.status === 'READY' && (
                    <div className="text-[10px] font-extrabold px-2 py-1 rounded mt-2 bg-red-500/20 text-red-500 border border-red-500/30 animate-pulse block text-center uppercase tracking-wide">
                        Waiting for Waiter Pickup
                    </div>
                )}
            </div>
            <div className="text-right">
                <div className="text-lg font-extrabold text-[#FF914D]">
                    {order.tableNumber ? `Table ${order.tableNumber}` : (order.orderType === 'TABLE' ? 'Table Order' : 'Takeout')}
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1 mt-1 justify-end">
                    <Clock className="w-3 h-3" />
                    {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
            </div>
        </div>

        {/* Items List */}
        <div className="flex-1 space-y-3">
            {order.items && order.items.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-[#FF3131] bg-[#FF3131]/10 px-2 py-1 rounded text-lg">
                            {item.quantity}x
                        </span>
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-200 text-lg leading-tight">
                                {item.name}
                            </span>
                            {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {item.selectedCustomizations.map((c, i) => (
                                        <Chip 
                                            key={i} 
                                            label={`+ ${c.name}`} 
                                            size="small" 
                                            color="success" 
                                            variant="outlined" 
                                            sx={{ height: '20px', fontSize: '0.65rem', fontWeight: 'bold' }} 
                                        />
                                    ))}
                                </div>
                            )}
                            {item.specialNote && (
                                <Box className="mt-2 bg-yellow-100 text-yellow-800 p-2 rounded-md font-bold italic border-l-4 border-yellow-500 shadow-md text-xs w-fit">
                                    Note: {item.specialNote}
                                </Box>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                                {item.kitchenStation && item.kitchenStation !== 'None' && (
                                    <span className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded font-mono uppercase">
                                        {item.kitchenStation}
                                    </span>
                                )}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                    item.itemStatus === 'READY' ? 'bg-green-500/20 text-green-400' :
                                    item.itemStatus === 'PREPARING' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                    {item.itemStatus || 'PENDING'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 shrink-0">
                        {(item.itemStatus === 'PENDING' || !item.itemStatus) && (
                            <button
                                onClick={() => handleItemStatusUpdate(order.orderId, item.menuItemId || item.itemCode, 'PREPARING')}
                                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
                            >
                                Prep
                            </button>
                        )}
                        {item.itemStatus === 'PREPARING' && (
                            <button
                                onClick={() => handleItemStatusUpdate(order.orderId, item.menuItemId || item.itemCode, 'READY')}
                                className="px-4 py-2 text-sm bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
                            >
                                Ready
                            </button>
                        )}
                        {item.itemStatus === 'READY' && (
                            <span className="px-4 py-2 text-sm text-green-500 font-bold flex items-center gap-2">
                                Completed
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const AllStationsView = ({ dineInOrders, takeawayOrders, getStatusColor, handleItemStatusUpdate }) => (
    <Grid container sx={{ height: 'calc(100vh - 160px)' }}>
        {/* Left Column: Dine-In */}
        <Grid item xs={12} md={6} lg={6} sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            pr: { md: 4 }, 
            borderRight: { md: '1px solid rgba(255,255,255,0.1)' },
            mb: { xs: 4, md: 0 }
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TableBarIcon sx={{ color: '#FF914D', mr: 1.5 }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                    Dine-In (Table)
                </Typography>
            </Box>
            
            <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, pr: 1 }}>
                {dineInOrders.length === 0 ? (
                    <div className="text-gray-500 text-center py-10 bg-[#2d2d2d] rounded-2xl border-2 border-white/5 shadow-inner">
                        No active Dine-In orders.
                    </div>
                ) : (
                    dineInOrders.map(order => (
                        <OrderCard 
                            key={order.orderId} 
                            order={order} 
                            getStatusColor={getStatusColor} 
                            handleItemStatusUpdate={handleItemStatusUpdate} 
                        />
                    ))
                )}
            </Box>
        </Grid>
        
        {/* Right Column: Takeaway */}
        <Grid item xs={12} md={6} lg={6} sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            pl: { md: 4 } 
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TakeoutDiningIcon sx={{ color: '#FF914D', mr: 1.5 }} />
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                    Takeaway
                </Typography>
            </Box>
            
            <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3, pr: 1 }}>
                {takeawayOrders.length === 0 ? (
                    <div className="text-gray-500 text-center py-10 bg-[#2d2d2d] rounded-2xl border-2 border-white/5 shadow-inner">
                        No active Takeaway orders.
                    </div>
                ) : (
                    takeawayOrders.map(order => (
                        <OrderCard 
                            key={order.orderId} 
                            order={order} 
                            getStatusColor={getStatusColor} 
                            handleItemStatusUpdate={handleItemStatusUpdate} 
                        />
                    ))
                )}
            </Box>
        </Grid>
    </Grid>
);

const AggregatedStationView = ({ groupedItems, selectedStation, handleItemStatusUpdate }) => {
    if (Object.keys(groupedItems).length === 0) {
        return (
            <div className="text-center py-20 opacity-50">
                <UtensilsCrossed className="w-20 h-20 mx-auto mb-4" />
                <p className="text-2xl">No active orders for {selectedStation}</p>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {Object.values(groupedItems).map((group, groupIdx) => (
                <div key={groupIdx} className="rounded-2xl flex flex-col bg-[#2d2d2d] shadow-2xl border-2 border-white/10 overflow-hidden">
                    {/* Parent Card Header */}
                    <div className="flex justify-between items-center p-5 bg-black/20 border-b border-white/10">
                        <h2 className="text-2xl font-bold text-white">{group.name}</h2>
                        <div className="bg-[#FF914D] text-black font-extrabold px-4 py-2 rounded-xl text-lg flex items-center gap-2">
                            Total: {group.totalQuantity}x
                        </div>
                    </div>

                    {/* Child Rows List */}
                    <div className="p-5 space-y-3">
                        {group.requests.map((request, reqIdx) => (
                            <div key={reqIdx} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-white/5 transition-colors ${request.itemStatus === 'READY' ? 'bg-green-500/10 border-green-500/20' : request.itemStatus === 'PREPARING' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-white/5 hover:bg-white/10'}`}>
                                <div className="flex items-center gap-4 flex-1">
                                    <span className="font-bold text-[#FF3131] bg-[#FF3131]/10 px-3 py-1.5 rounded-lg text-lg min-w-[3rem] text-center">
                                        {request.quantity}x
                                    </span>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white text-lg">
                                                #{request.orderId}
                                            </span>
                                            <span className="text-sm font-semibold text-[#FF914D]">
                                                {request.tableNumber ? `Table ${request.tableNumber}` : (request.orderType === 'TABLE' ? 'Table Order' : 'Takeout')}
                                            </span>
                                        </div>
                                        {request.selectedCustomizations && request.selectedCustomizations.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {request.selectedCustomizations.map((c, i) => (
                                                    <Chip 
                                                        key={i} 
                                                        label={`+ ${c.name}`} 
                                                        size="small" 
                                                        color="success" 
                                                        variant="outlined" 
                                                        sx={{ height: '20px', fontSize: '0.65rem', fontWeight: 'bold' }} 
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        {request.specialNote && (
                                            <Box className="mt-2 bg-yellow-100 text-yellow-800 p-2 rounded-md font-bold italic border-l-4 border-yellow-500 shadow-md text-xs w-fit">
                                                Note: {request.specialNote}
                                            </Box>
                                        )}
                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {request.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                            <span className={`px-2 py-0.5 rounded font-bold ${
                                                request.itemStatus === 'READY' ? 'bg-green-500/20 text-green-400' :
                                                request.itemStatus === 'PREPARING' ? 'bg-blue-500/20 text-blue-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                                {request.itemStatus || 'PENDING'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 shrink-0 mt-2 sm:mt-0">
                                    {(request.itemStatus === 'PENDING' || !request.itemStatus) && (
                                        <button
                                            onClick={() => handleItemStatusUpdate(request.orderId, request.menuItemId || request.itemCode, 'PREPARING')}
                                            className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
                                        >
                                            Prep
                                        </button>
                                    )}
                                    {request.itemStatus === 'PREPARING' && (
                                        <button
                                            onClick={() => handleItemStatusUpdate(request.orderId, request.menuItemId || request.itemCode, 'READY')}
                                            className="px-5 py-2 text-sm bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-all shadow-lg hover:scale-105 active:scale-95"
                                        >
                                            Ready
                                        </button>
                                    )}
                                    {request.itemStatus === 'READY' && (
                                        <span className="px-5 py-2 text-sm text-green-500 font-bold flex items-center gap-2">
                                            Completed
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const KitchenDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const defaultStation = localStorage.getItem("staffStation") || 'All Stations';
    const [selectedStation, setSelectedStation] = useState(defaultStation);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await getKitchenOrdersByStation(selectedStation);
                const activeOrders = response.data || [];
                setOrders(activeOrders);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        };

        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, [selectedStation]);

    const handleItemStatusUpdate = async (orderId, itemId, newStatus) => {
        // Optimistic UI Update
        setOrders(prev => prev.map(o => {
            if (o.orderId === orderId) {
                const updatedItems = o.items.map(item => {
                    if (item.menuItemId === itemId || item.itemCode === itemId) {
                        return { ...item, itemStatus: newStatus };
                    }
                    return item;
                });
                
                const allReady = updatedItems.length > 0 && updatedItems.every(item => item.itemStatus === 'READY');
                const anyPrep = updatedItems.some(item => item.itemStatus === 'PREPARING' || item.itemStatus === 'READY');
                const orderStatus = allReady ? 'READY' : (anyPrep ? 'PREPARING' : o.status);
                
                return { ...o, items: updatedItems, status: orderStatus };
            }
            return o;
        }));

        try {
            await updateOrderItemStatus(orderId, itemId, newStatus);
        } catch (error) {
            console.error("Failed to update item status", error);
        }
    };

    const { dineInOrders, takeawayOrders } = useMemo(() => {
        if (selectedStation !== 'All Stations') return { dineInOrders: [], takeawayOrders: [] };
        const sortedOrders = [...orders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const dineIn = sortedOrders.filter(o => o.orderType === 'TABLE');
        const takeaway = sortedOrders.filter(o => o.orderType === 'TAKEOUT');
        return { dineInOrders: dineIn, takeawayOrders: takeaway };
    }, [orders, selectedStation]);

    const groupedItems = useMemo(() => {
        if (selectedStation === 'All Stations') return {};

        const allItems = [];
        orders.forEach(order => {
            if (order.items) {
                order.items.forEach(item => {
                    allItems.push({
                        ...item,
                        orderId: order.orderId,
                        tableNumber: order.tableNumber,
                        orderType: order.orderType,
                        orderStatus: order.status,
                        createdAt: new Date(order.createdAt)
                    });
                });
            }
        });

        // Sort by createdAt ascending (First-Come, First-Serve)
        allItems.sort((a, b) => a.createdAt - b.createdAt);

        const grouped = {};
        allItems.forEach(item => {
            const key = item.name;
            if (!grouped[key]) {
                grouped[key] = {
                    name: item.name,
                    menuItemId: item.menuItemId || item.itemCode,
                    totalQuantity: 0,
                    requests: []
                };
            }
            grouped[key].totalQuantity += item.quantity;
            grouped[key].requests.push(item);
        });

        return grouped;
    }, [orders, selectedStation]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-500/20 border-yellow-500 text-yellow-500';
            case 'PREPARING': return 'bg-blue-500/20 border-blue-500 text-blue-500';
            case 'READY': return 'bg-green-500/20 border-green-500 text-green-500';
            default: return 'bg-gray-500/20 border-gray-500 text-gray-500';
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#1a1a1a] flex justify-center items-center text-[#FF3131]">
            <Loader2 className="w-10 h-10 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#1a1a1a] p-6 font-poppins text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <ChefHat className="w-10 h-10 text-[#FF914D]" /> Kitchen Display System
                </h1>
                
                <div className="flex items-center gap-3 bg-[#2d2d2d] p-2 rounded-xl border border-white/10">
                    <Filter className="w-5 h-5 text-gray-400 ml-2" />
                    <select
                        value={selectedStation}
                        onChange={(e) => {
                            setSelectedStation(e.target.value);
                            setLoading(true);
                        }}
                        className="bg-transparent text-white font-bold outline-none pr-4 cursor-pointer"
                    >
                        {STATIONS.map(st => (
                            <option key={st} value={st} className="bg-[#2d2d2d] text-white">
                                {st}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedStation === 'All Stations' ? (
                <AllStationsView 
                    dineInOrders={dineInOrders} 
                    takeawayOrders={takeawayOrders} 
                    getStatusColor={getStatusColor}
                    handleItemStatusUpdate={handleItemStatusUpdate}
                />
            ) : (
                <AggregatedStationView 
                    groupedItems={groupedItems} 
                    selectedStation={selectedStation}
                    handleItemStatusUpdate={handleItemStatusUpdate}
                />
            )}
        </div>
    );
};

export default KitchenDashboard;