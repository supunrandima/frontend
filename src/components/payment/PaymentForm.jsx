import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Loader2, Lock } from 'lucide-react';

const PaymentForm = ({ onSuccess, onError, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // Important: Prevents redirecting away
    });

    if (error) {
      onError(error.message);
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id); // Pass Transaction ID back
    } else {
      onError("Payment failed.");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div className="flex justify-between mb-4">
            <h3 className="font-bold text-gray-700">Total to Pay</h3>
            <span className="font-bold text-2xl text-[#FF3131]">${amount.toFixed(2)}</span>
        </div>
        {/* Stripe's secure UI element */}
        <PaymentElement />
      </div>

      <button 
        disabled={isProcessing || !stripe || !elements} 
        className="w-full bg-[#FF3131] hover:bg-[#e62e2e] text-white py-4 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 transition-all disabled:opacity-50"
      >
        {isProcessing ? <Loader2 className="animate-spin" /> : <><Lock className="w-4 h-4"/> Pay Now</>}
      </button>
    </form>
  );
};

export default PaymentForm;