// src/services/categoryService.js
import axios from "axios";

// Base API URL for all admin-related services
const API_URL = "http://localhost:8080/api/v1/admin";

// Helper function to retrieve the admin token from storage
const authHeader = () => {
  // Prioritize localStorage (for 'Remember Me') then sessionStorage
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

/**
 * Fetches all menu categories from the backend.
 * * Backend endpoint: GET /api/v1/admin/categories/allCategories
 * @returns {Promise<any>} The response containing the list of categories.
 */
export const getAllCategories = () => {
  // CORRECTED PATH to match @GetMapping("/allCategories")
  return axios.get(`${API_URL}/categories/allCategories`, authHeader())
    .catch(error => {
      throw error;
    });
};

/**
 * Sends a request to add a new category.
 * * Backend endpoint: POST /api/v1/admin/categories/newCategory
 * @param {object} categoryData - The new category object ({ name: string, categoryCode: string }).
 * @returns {Promise<any>} The response containing the newly created category.
 */
export const addCategory = (categoryData) => {
  // CORRECTED PATH to match @PostMapping("/newCategory")
  return axios.post(`${API_URL}/categories/newCategory`, categoryData, authHeader())
    .catch(error => {
      throw error;
    });
};

/**
 * Sends a request to update an existing category.
 * * Backend endpoint: PUT /api/v1/admin/categories/{categoryId}
 * @param {string} categoryId - The ID of the category to update.
 * @param {object} categoryData - The updated category object ({ name: string, categoryCode: string }).
 * @returns {Promise<any>} The response containing the updated category.
 */
export const updateCategory = (categoryId, categoryData) => {
  return axios.put(`${API_URL}/categories/${categoryId}`, categoryData, authHeader())
    .catch(error => {
      throw error;
    });
};

/**
 * Sends a request to delete a category by its ID.
 * * Backend endpoint: DELETE /api/v1/admin/categories/{categoryId}
 * @param {string} categoryId - The ID of the category to delete.
 * @returns {Promise<any>} The response.
 */
export const deleteCategory = (categoryId) => {
  return axios.delete(`${API_URL}/categories/${categoryId}`, authHeader())
    .catch(error => {
      throw error;
    });
};