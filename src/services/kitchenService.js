import apiClient from "./apiClient";

export const getKitchenOrders = () => {
    return apiClient.get("/order/kitchen");
};

export const updateOrderStatus = (orderId, status) => {
    return apiClient.put(`/order/${orderId}/status`, null, {
        params: { status }
    });
};

export const getKitchenOrdersByStation = (stationName) => {
    return apiClient.get("/kitchen/active-orders", {
        params: { station: stationName }
    });
};

export const updateOrderItemStatus = (orderId, itemId, status) => {
    return apiClient.put(`/kitchen/orders/${orderId}/items/${itemId}/status`, null, {
        params: { status }
    });
};