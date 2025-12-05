import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/staff";

// --- Authentication ---
export const loginStaff = (credentials) => {
  return axios.post(`${API_URL}/staffLogin`, credentials);
};

// --- Admin Staff Management ---

// Get all staff members
export const getAllStaff = () => {
    return axios.get(`${API_URL}/allStaffs`);
};

// Register a new staff member
export const registerStaff = (staffData) => {
    return axios.post(`${API_URL}/registerStaff`, staffData);
};

// Update an existing staff member
export const updateStaff = (id, staffData) => {
    return axios.put(`${API_URL}/${id}`, staffData);
};

// Delete a staff member
export const deleteStaff = (id) => {
    return axios.delete(`${API_URL}/${id}`);
};