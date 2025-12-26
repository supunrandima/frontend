import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/staff";

export const loginStaff = (credentials) => {
  return axios.post(`${API_URL}/staffLogin`, credentials);
};


export const getAllStaff = () => {
    return axios.get(`${API_URL}/allStaffs`);
};

export const registerStaff = (staffData) => {
    return axios.post(`${API_URL}/registerStaff`, staffData);
};

export const updateStaff = (id, staffData) => {
    return axios.put(`${API_URL}/${id}`, staffData);
};

export const deleteStaff = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};