import apiClient from "./apiClient";

export const placeNewOrder = (orderData) => {
    return apiClient.post("/order/place", orderData);
};

export const cancelOrder = (orderId) => {
    return apiClient.put(`/order/${orderId}/cancel`);
};

export const undoRecentAdditions = (orderId) => {
    return apiClient.put(`/order/${orderId}/undo`);
};

export const getKitchenOrders = () => {
    return apiClient.get("/order/kitchen");
};

export const updateOrderStatus = (orderId, status) => {
    return apiClient.put(`/order/${orderId}/status`, null, {
        params: { status }
    });
};

export const getOrderStatus = (orderId) => {
    return apiClient.get(`/order/${orderId}`);
};

export const getOrderById = (orderId) => {
    return apiClient.get(`/order/${orderId}`);
};

export const markOrderAsPaid = (orderId) => {
    return apiClient.put(`/order/${orderId}/mark-paid`);
};

export const updatePaymentStatus = (orderId, paymentMethod) => {
    const status = paymentMethod === 'CASH' ? 'AWAITING_CASH' : paymentMethod;
    return apiClient.put(`/order/${orderId}/payment-status`, null, {
        params: { status }
    });
};

export const generatePaymentQR = (orderId) => {
    return apiClient.post(`/payment/create-session/${orderId}`);
};

export const getWaiterOrders = () => {
    return apiClient.get("/order/waiter");
};

export const getOpenTabs = () => {
    return apiClient.get("/staff/orders/open-tabs");
};

export const requestReceipt = (orderId) => {
    return apiClient.get(`/order/${orderId}/receipt`);
};

export const settleCash = (orderId) => {
    return apiClient.post(`/staff/orders/${orderId}/settle-cash`);
};

