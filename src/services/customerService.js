import axios from "axios";

const API_URL = "http://localhost:8080/api/v1/customer";

export const registerCustomer = (customerData) => {
  return axios.post(`${API_URL}/registerCustomer`, customerData)
    .catch(error => {
      throw error; 
    });
};

export const loginCustomer = (phone) => {
  return axios.post(`${API_URL}/customerLogin`, { phone })
    .catch(error => {
      throw error; 
    });
};

// export const getCustomerById = (customerId,customerData) => {
//   return axios.get(`${API_URL}/${customerId}`, { customerData })
//     .catch(error => {
//       throw error; // Propagate error to component
//     });
// };
