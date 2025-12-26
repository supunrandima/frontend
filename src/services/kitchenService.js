import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/order"; 

export const getKitchenOrders = () => {
    return axios.get(`${API_URL}/kitchen`);
};

export const updateOrderStatus = (orderId, status) => {
    return axios.put(`${API_URL}/${orderId}/status`, null, {
        params: { status }
    });
};