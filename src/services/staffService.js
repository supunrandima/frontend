import apiClient from "./apiClient";

export const loginStaff = (credentials) => {
  return apiClient.post("/staff/staffLogin", credentials);
};

export const getAllStaff = () => {
    return apiClient.get("/staff/allStaffs");
};

export const registerStaff = (staffData) => {
    return apiClient.post("/staff/registerStaff", staffData);
};

export const updateStaff = (id, staffData) => {
    return apiClient.put(`/staff/${id}`, staffData);
};

export const deleteStaff = (id) => {
    return apiClient.delete(`/staff/${id}`);
};