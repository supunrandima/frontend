import apiClient from "./apiClient";

export const getAllMenuItems = () => {
    return apiClient.get("/admin/menu/allItems");
};

export const addMenuItem = (itemData) => {
    return apiClient.post("/admin/menu/newMenuItem", itemData);
};

export const updateMenuItem = (itemId, itemData) => {
    return apiClient.put(`/admin/menu/${itemId}`, itemData);
};

export const deleteMenuItem = (itemId) => {
    return apiClient.delete(`/admin/menu/${itemId}`);
};

export const searchMenuItems = (name) => {
    return apiClient.get("/admin/menu/search", { params: { name } });
};