import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/admin";

export const registerAdmin = (AdminData) => {
  return axios.post(`${API_URL}/registerAdmin`, AdminData)
    .catch(error => {
      throw error; // Propagate error to component
    });
};

export const loginAdmin = (loginData) => { 
  return axios.post(`${API_URL}/adminLogin`, loginData) 
    .catch(error => {
      throw error; // Propagate error to component
    });
};
