import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from '@mui/material';
import { Star } from 'lucide-react';
import { submitFeedback } from '../../services/feedbackService';

const CustomerFeedbackModal = ({ open, onClose, orderId, customerId }) => {
    const [rating, setRating] = useState(5);
    const [comments, setComments] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        try {
            const feedbackData = { customerId, orderId, rating, comments };
            await submitFeedback(feedbackData);
            onClose(); // Close on success
            // Reset state
            setRating(5);
            setComments("");
        } catch (err) {
            setError("Failed to submit feedback. Please try again.");
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Rate Your Experience</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {error && <Typography color="error" variant="body2" gutterBottom>{error}</Typography>}
                    
                    <Box display="flex" justifyContent="center" mb={3} mt={1}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                onClick={() => setRating(star)}
                                style={{
                                    cursor: 'pointer',
                                    color: star <= rating ? '#FFD700' : '#E0E0E0',
                                    width: '40px',
                                    height: '40px',
                                    margin: '0 8px'
                                }}
                                fill={star <= rating ? '#FFD700' : 'none'}
                            />
                        ))}
                    </Box>

                    <TextField
                        label="Written Review"
                        multiline
                        rows={3}
                        fullWidth
                        variant="outlined"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Tell us what you liked or how we can improve..."
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary" 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Submitting..." : "Submit Feedback"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CustomerFeedbackModal;
