import apiClient from "./apiClient";

export const continueAsGuest = () => {
    return apiClient.post("/auth/guest-login");
};