import React, { useState } from "react";
import { Bell, User, ChevronDown } from "lucide-react";

// Mock Data to simulate backend response
const mockOrders = [
  { id: 101, table: "T-04", customerId: "C-9921", items: ["Spicy Burger", "Coke", "Fries"], status: "Cooking" },
  { id: 102, table: "T-07", customerId: "C-1234", items: ["Pasta Alfredo", "Garlic Bread"], status: "Pending" },
  { id: 103, table: "T-01", customerId: "C-8877", items: ["Pizza", "Pepsi"], status: "Plating" },
  { id: 104, table: "T-12", customerId: "C-5541", items: ["Steak", "Mashed Potato"], status: "Cooking" },
];

const KitchenDashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState(mockOrders[0]);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-poppins flex flex-col p-2">
      
      {/* 1. Header (Matches Image 2 Top Bar) */}
      <header className="flex justify-between items-center px-6 py-3 bg-[#2d2d2d] rounded-xl mb-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-[#FF914D]">Taste Trek</h1>
        <div className="flex items-center gap-4">
          <User className="w-6 h-6 text-gray-400" />
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
             <Bell className="w-5 h-5 text-gray-300" />
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex flex-1 gap-4 overflow-hidden mb-4">
        
        {/* 2. Left Panel: Ongoing Orders */}
        <div className="flex-[2] bg-[#2d2d2d] rounded-3xl p-6 flex flex-col border border-white/5">
          <h2 className="text-2xl font-bold mb-6">Ongoing Orders</h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {mockOrders.map((order) => (
              <div 
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`w-full h-20 rounded-full cursor-pointer transition-all flex items-center px-8 justify-between
                  ${selectedOrder.id === order.id ? 'bg-[#3d3d3d] border border-[#FF3131]/50' : 'bg-[#333333] hover:bg-[#383838]'}`}
              >
                <div className="h-4 w-1/3 bg-gray-500/20 rounded-full"></div> {/* Placeholder lines from image */}
              </div>
            ))}
            {/* Empty placeholders to match the image look */}
            <div className="w-full h-20 rounded-full bg-[#333333] opacity-50"></div>
            <div className="w-full h-20 rounded-full bg-[#333333] opacity-30"></div>
          </div>
          {/* Scroll bar indicator mimic */}
          <div className="absolute right-4 top-1/2 w-2 h-32 bg-gray-600 rounded-full opacity-50"></div>
        </div>

        {/* 3. Right Panel: Current Order Details */}
        <div className="flex-1 bg-[#2d2d2d] rounded-3xl p-6 flex flex-col items-center border border-white/5">
          <h2 className="text-2xl font-bold mb-8">Current Order</h2>
          
          <div className="w-full flex justify-between px-4 mb-6 text-xs text-gray-400">
            <div className="flex flex-col items-center">
                <span>Table</span>
                <span className="text-white text-lg font-semibold">{selectedOrder.table}</span>
            </div>
            <div className="flex flex-col items-center">
                <span>Customer ID</span>
                <span className="text-white text-lg font-semibold">{selectedOrder.customerId}</span>
            </div>
          </div>

          <h3 className="text-sm font-bold mb-4">Order Items</h3>
          <div className="w-full space-y-3 mb-8">
            {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="w-full h-8 bg-[#3d3d3d] rounded-full"></div> // Placeholder bars
            ))}
            {/* Visual placeholders */}
            <div className="w-full h-8 bg-[#3d3d3d] rounded-full opacity-50"></div> 
            <div className="w-full h-8 bg-[#3d3d3d] rounded-full opacity-50"></div> 
          </div>

          {/* Customizations Box */}
          <div className="w-full bg-[#444444] rounded-2xl p-4 mb-6 min-h-[100px] relative">
            <span className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-300">Customizations</span>
          </div>

          {/* Order Status Stepper */}
          <div className="mt-auto w-full">
            <h3 className="text-center text-sm font-bold mb-4">Order Status</h3>
            <div className="flex justify-center items-center gap-2">
                {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full ${step <= 2 ? 'bg-[#963E2E]' : 'bg-[#963E2E] opacity-50'}`}></div>
                        {step !== 4 && <div className="w-8 h-1 bg-[#963E2E] opacity-50"></div>}
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Panel: Ready to Serve */}
      <div className="h-28 bg-[#2d2d2d] rounded-3xl p-4 flex items-center border border-white/5">
        <h2 className="text-lg font-bold mr-8 min-w-[100px]">Ready to serve</h2>
        
        <div className="flex-1 flex gap-4 overflow-x-auto">
            {/* Serve Item 1 */}
            <div className="flex-1 bg-[#333333] rounded-2xl p-2 px-6 flex items-center justify-between min-w-[300px]">
                <div className="space-y-2 w-2/3">
                    <div className="h-3 w-full bg-gray-500/30 rounded-full"></div>
                    <div className="h-3 w-2/3 bg-gray-500/30 rounded-full"></div>
                </div>
                <button className="px-6 py-2 bg-[#FF5733] hover:bg-[#ff7050] text-white font-bold rounded-full transition-colors">
                    Serve
                </button>
            </div>

             {/* Serve Item 2 */}
             <div className="flex-1 bg-[#333333] rounded-2xl p-2 px-6 flex items-center justify-between min-w-[300px]">
                <div className="space-y-2 w-2/3">
                    <div className="h-3 w-full bg-gray-500/30 rounded-full"></div>
                    <div className="h-3 w-2/3 bg-gray-500/30 rounded-full"></div>
                </div>
                <button className="px-6 py-2 bg-[#FF5733] hover:bg-[#ff7050] text-white font-bold rounded-full transition-colors">
                    Serve
                </button>
            </div>
        </div>
      </div>

    </div>
  );
};

export default KitchenDashboard;