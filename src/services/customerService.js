import apiClient from "./apiClient";

export const registerCustomer = (customerData) => {
  return apiClient.post("/customer/registerCustomer", customerData);
};

export const loginCustomer = (phone) => {
  return apiClient.post("/customer/customerLogin", { phone });
};
