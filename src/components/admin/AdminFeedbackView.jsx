import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, Calendar, Loader2 } from 'lucide-react';
import { getAllFeedback } from '../../services/feedbackService';

const AdminFeedbackView = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await getAllFeedback();
                // Assumes response is an array of feedback objects.
                setFeedbacks(response.data || response); 
            } catch (error) {
                console.error("Error fetching feedback:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeedback();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF3131]" />
            </div>
        );
    }

    if (!feedbacks || feedbacks.length === 0) {
        return (
            <div className="text-center p-8 bg-[#2d2d2d] rounded-xl border border-white/5">
                <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Feedback Yet</h3>
                <p className="text-gray-400">Customers haven't submitted any feedback yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-500 mb-6">Customer Feedback</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedbacks.map((fb) => (
                    <div key={fb.id} className="bg-[#2d2d2d] rounded-2xl p-6 border border-white/5 shadow-lg flex flex-col h-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF3131] to-[#FF914D]"></div>
                        
                        <div className="flex justify-between items-start mb-4 mt-2">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-white font-medium">{fb.customerId || 'Guest'}</span>
                            </div>
                            <span className="text-xs font-mono text-gray-500 bg-black/20 px-2 py-1 rounded">
                                Order #{fb.orderId}
                            </span>
                        </div>

                        <div className="flex gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                    key={star} 
                                    className={`w-5 h-5 ${star <= fb.rating ? 'fill-[#FFD700] text-[#FFD700]' : 'text-gray-600'}`} 
                                />
                            ))}
                        </div>

                        <div className="flex-grow">
                            <p className="text-gray-300 text-sm italic line-clamp-4">
                                {fb.comments ? `"${fb.comments}"` : <span className="text-gray-600">No comment provided</span>}
                            </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {new Date(fb.createdAt).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminFeedbackView;
