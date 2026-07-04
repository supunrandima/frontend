import apiClient from "./apiClient";

export const placeNewOrder = (orderData) => {
    return apiClient.post("/order/place", orderData);
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
