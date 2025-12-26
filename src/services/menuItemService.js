import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/admin/menu";

// --- Helper: Get Auth Headers ---
const authHeader = () => {
  // Try to get the token from localStorage or sessionStorage
  const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');

  if (token) {
    return { 
        headers: { 
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json' 
        } 
    };
  } else {
    return {};
  }
};


export const getAllMenuItems = () => {
    return axios.get(`${API_URL}/allItems`, authHeader());
};

export const addMenuItem = (itemData) => {
    return axios.post(`${API_URL}/newMenuItem`, itemData, authHeader());
};

export const updateMenuItem = (itemId, itemData) => {
    return axios.put(`${API_URL}/${itemId}`, itemData, authHeader());
};

export const deleteMenuItem = (itemId) => {
    return axios.delete(`${API_URL}/${itemId}`, authHeader());
};

export const searchMenuItems = (name) => {
    const config = authHeader(); 
    config.params = { name };    
    
    return axios.get(`${API_URL}/search`, config);
};