import apiClient from "./apiClient";

export const registerAdmin = (AdminData) => {
  return apiClient.post("/admin/registerAdmin", AdminData);
};

export const loginAdmin = (loginData) => { 
  return apiClient.post("/admin/adminLogin", loginData);
};
