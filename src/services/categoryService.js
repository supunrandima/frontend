import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/admin/categories";

const authHeader = () => {
  const token =
    localStorage.getItem("adminToken") ||
    sessionStorage.getItem("adminToken");

  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    : {};
};

// ✅ GET ALL
export const getAllCategories = () => {
  return axios.get(`${API_URL}/allCategories`, authHeader());
};

// ✅ ADD
export const addCategory = (data) => {
  return axios.post(`${API_URL}/newCategory`, data, authHeader());
};

// ✅ UPDATE
export const updateCategory = (id, data) => {
  return axios.put(`${API_URL}/${id}`, data, authHeader());
};

// ✅ DELETE
export const deleteCategory = (id) => {
  return axios.delete(`${API_URL}/${id}`, authHeader());
};
