import apiClient from './apiClient';

export const submitFeedback = async (feedbackData) => {
    try {
        const response = await apiClient.post("/customer-features/feedback", feedbackData);
        return response.data;
    } catch (error) {
        console.error("Error submitting feedback:", error);
        throw error;
    }
};

export const getAllFeedback = () => apiClient.get("/admin/feedback");
