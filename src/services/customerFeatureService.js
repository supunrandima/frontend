import apiClient from "./apiClient";

export const getRecommendations = (customerId) => {
    // If no ID (fresh load), send a dummy guest string
    const id = customerId || "GUEST-DEFAULT";
    return apiClient.get(`/customer-features/recommendations/${id}`);
};

export const getOrderHistory = (customerId) => {
    return apiClient.get(`/customer-features/history/${customerId}`);
};