import apiClient from "./apiClient";

export const getKitchenOrders = () => {
    return apiClient.get("/order/kitchen");
};

export const updateOrderStatus = (orderId, status) => {
    return apiClient.put(`/order/${orderId}/status`, null, {
        params: { status }
    });
};