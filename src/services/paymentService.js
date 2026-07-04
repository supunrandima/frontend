import apiClient from "./apiClient";

export const createPaymentIntent = (amount) => {
    return apiClient.post("/payment/create-payment-intent", { amount });
};

export const createCheckoutSession = (orderId) => {
    return apiClient.post(`/payment/create-session/${orderId}`);
};