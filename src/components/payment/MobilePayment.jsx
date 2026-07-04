import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { getOrderById, updateOrderStatus } from '../../services/orderService'; 
import { createPaymentIntent } from '../../services/paymentService'; 
import PaymentForm from './PaymentForm'; 
import { Loader2, CheckCircle, Smartphone } from 'lucide-react';

// Replace with your Stripe Public Key
const stripePromise = loadStripe("pk_test_..."); 

const MobilePayment = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [clientSecret, setClientSecret] = useState("");
    const [status, setStatus] = useState("LOADING"); // LOADING, READY, SUCCESS

    useEffect(() => {
        const initPayment = async () => {
            try {
                // 1. Get Order Details
                const orderRes = await getOrderById(orderId);
                setOrder(orderRes.data);

                if (orderRes.data.status === 'PAID') {
                    setStatus("SUCCESS");
                    return;
                }

                // 2. Create Payment Session
                const paymentRes = await createPaymentIntent(orderRes.data.totalAmount);
                setClientSecret(paymentRes.data.clientSecret);
                setStatus("READY");

            } catch (error) {
                console.error("Payment setup failed", error);
            }
        };
        initPayment();
    }, [orderId]);

    const handleSuccess = async (transactionId) => {
        try {
            // 3. Update Backend Status to PAID
            await updateOrderStatus(orderId, "PAID");
            setStatus("SUCCESS");
        } catch (error) {
            console.error("Status update failed", error);
        }
    };

    if (status === "LOADING") return <div className="flex justify-center h-screen items-center"><Loader2 className="animate-spin text-[#FF3131]" /></div>;

    if (status === "SUCCESS") return (
        <div className="h-screen bg-green-50 flex flex-col justify-center items-center p-6 text-center">
            <CheckCircle className="w-24 h-24 text-green-500 mb-6 drop-shadow-md" />
            <h1 className="text-3xl font-bold text-green-800">Payment Successful!</h1>
            <p className="text-gray-600 mt-2">Thank you. The restaurant tablet has been updated automatically.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col justify-center font-poppins">
            <div className="bg-white p-6 rounded-3xl shadow-xl max-w-md mx-auto w-full border border-gray-200">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Smartphone className="w-8 h-8 text-[#FF3131]" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Complete Payment</h2>
                    <p className="text-gray-500 text-sm mt-1">Order #{order.orderId}</p>
                </div>

                {clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <PaymentForm 
                            amount={order.totalAmount} 
                            onSuccess={handleSuccess} 
                            onError={(msg) => alert(msg)} 
                        />
                    </Elements>
                )}
            </div>
        </div>
    );
};

export default MobilePayment;