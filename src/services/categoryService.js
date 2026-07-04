import apiClient from "./apiClient";

export const getAllCategories = () => {
  return apiClient.get("/admin/categories/allCategories");
};

export const addCategory = (data) => {
  return apiClient.post("/admin/categories/newCategory", data);
};

export const updateCategory = (id, data) => {
  return apiClient.put(`/admin/categories/${id}`, data);
};

export const deleteCategory = (id) => {
  return apiClient.delete(`/admin/categories/${id}`);
};
