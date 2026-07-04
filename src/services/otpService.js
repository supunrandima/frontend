import apiClient from "./apiClient";

export const sendOtp = (phoneNumber) => {
    return apiClient.post("/otp/send", { phoneNumber });
};

export const verifyOtp = (phoneNumber, code) => {
    return apiClient.post("/otp/verify", { phoneNumber, code });
};