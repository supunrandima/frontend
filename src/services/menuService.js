import axios from "axios";

// Using the admin endpoints because they are configured as public (permitAll) for GET requests
const API_BASE_URL = "http://localhost:8080/api/v1/admin";

export const getAllCategories = () => {
  return axios.get(`${API_BASE_URL}/categories/allCategories`);
};

export const getAllMenuItems = () => {
  return axios.get(`${API_BASE_URL}/menu/allItems`);
};

// You can add this later when you build the search backend
export const searchMenuItems = (query) => {
  return axios.get(`${API_BASE_URL}/menu/search`, { params: { name: query } });
};