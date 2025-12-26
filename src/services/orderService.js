import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/order"; 


const authHeader = () => {
  const token = localStorage.getItem('staffToken') || sessionStorage.getItem('staffToken');

  if (token) {
    return { 
        headers: { 
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json' 
        } 
    };
  } else {
    return {};
  }
};


export const placeNewOrder = (orderData) => {
    return axios.post(`${API_URL}/place`, orderData);
};

export const getKitchenOrders = () => {
    return axios.get(`${API_URL}/kitchen`, authHeader());
};

export const updateOrderStatus = (orderId, newStatus) => {
    return axios.put(`${API_URL}/${orderId}/status`, { status: newStatus }, authHeader());
};

export const getOrderStatus = (orderId) => {
    return axios.get(`${API_URL}/${orderId}`);
};

export const getOrderById = (orderId) => {
    return axios.get(`${API_URL}/${orderId}`);
};
