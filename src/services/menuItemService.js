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

// --- Menu Item CRUD ---

// 1. Get All Items
export const getAllMenuItems = () => {
    // Ideally should be authenticated, but might work if public
    return axios.get(`${API_URL}/allItems`, authHeader());
};

// 2. Add New Item
export const addMenuItem = (itemData) => {
    return axios.post(`${API_URL}/newMenuItem`, itemData, authHeader());
};

// 3. Update Item
export const updateMenuItem = (itemId, itemData) => {
    return axios.put(`${API_URL}/${itemId}`, itemData, authHeader());
};

// 4. Delete Item
export const deleteMenuItem = (itemId) => {
    return axios.delete(`${API_URL}/${itemId}`, authHeader());
};

// 5. Search Items (FIXED: Now includes Auth headers + params)
export const searchMenuItems = (name) => {
    const config = authHeader(); // Get headers { headers: ... }
    config.params = { name };    // Add params to the config object
    
    return axios.get(`${API_URL}/search`, config);
};