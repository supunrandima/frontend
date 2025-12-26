import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/otp"; 

export const sendOtp = (phoneNumber) => {
    return axios.post(`${API_URL}/send`, { phoneNumber });
};

export const verifyOtp = (phoneNumber, code) => {
    return axios.post(`${API_URL}/verify`, { phoneNumber, code });
};