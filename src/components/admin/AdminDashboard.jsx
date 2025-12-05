// src/components/admin/AdminDashboard.jsx
import React, { useState } from "react";
import { LogOut, LayoutDashboard, Utensils, Users, ClipboardList, BarChart3, ChevronLeft, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CategoryManagement from "./CategoryManagement"; // Assumes file is in the same folder
import StaffManagement from "./StaffManagement"; // Assumes file is in the same folder

// --- Sub-Components ---

// 1. Menu Management Component
const MenuManagement = () => {
  // State to switch between Menu Item view and Category Management view
  const [view, setView] = useState("items"); // 'items' or 'categories'

  if (view === "categories") {
    return <CategoryManagement onBack={() => setView("items")} />;
  }

  // Default view: Menu Item Management
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg h-full">
      <h2 className="text-2xl font-bold gradient-text mb-4">Menu Management</h2>
      <p className="text-gray-600 mb-4">Configure categories, add new dishes, update prices, and manage item availability.</p>
      
      <div className="space-y-4">
          {/* Actions Section */}
          <div className="flex flex-wrap gap-4">
              <button className="btn-primary flex items-center gap-2">
                  <Utensils className="w-5 h-5" /> Add New Item
              </button>
              <button 
                  className="btn-secondary flex items-center gap-2"
                  onClick={() => setView("categories")}
              >
                  <ClipboardList className="w-5 h-5" /> Manage Categories
              </button>
          </div>

          {/* Placeholder Table for Menu Items */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-3 font-semibold bg-gray-50 border-b text-gray-700 grid grid-cols-4">
                  <span>Item Name</span>
                  <span>Category</span>
                  <span>Price</span>
                  <span>Actions</span>
              </div>
              <div className="p-3 grid grid-cols-4 hover:bg-red-50/50 transition-colors">
                  <span>Spicy Chicken Burger</span>
                  <span>10 (Burgers)</span>
                  <span>$12.99</span>
                  <span className="text-sm space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">Edit</button>
                      <button className="text-red-600 hover:text-red-800">Delete</button>
                  </span>
              </div>
              <div className="p-3 grid grid-cols-4 hover:bg-red-50/50 transition-colors">
                  <span>Diet Coke (Item Code: 20001)</span>
                  <span>20 (Drinks)</span>
                  <span>$2.50</span>
                  <span className="text-sm space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">Edit</button>
                      <button className="text-red-600 hover:text-red-800">Delete</button>
                  </span>
              </div>
          </div>
      </div>
    </div>
  );
};

// 2. Customer Management Component (Placeholder)
const CustomerManagement = () => (
  <div className="p-6 bg-white rounded-xl shadow-lg h-full">
    <h2 className="text-2xl font-bold gradient-text mb-4">Customers</h2>
    <p className="text-gray-600">View and manage customer profiles and loyalty data.</p>
    <button className="btn-secondary mt-4 flex items-center gap-2">
        <ClipboardList className="w-5 h-5" /> Export Data
    </button>
  </div>
);

// 3. Reports Component (Placeholder)
const Reports = () => (
  <div className="p-6 bg-white rounded-xl shadow-lg h-full">
    <h2 className="text-2xl font-bold gradient-text mb-4">Sales Reports</h2>
    <p className="text-gray-600">Analyze performance with Daily and Monthly Sales reports.</p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-4 border rounded-xl bg-red-50/50">
            <h3 className="text-xl font-semibold text-red-700">Daily Sales</h3>
            <p className="text-2xl font-bold mt-2">$1,540.00</p>
            <p className="text-sm text-gray-500">+8.5% today</p>
        </div>
        <div className="p-4 border rounded-xl bg-orange-50/50">
            <h3 className="text-xl font-semibold text-orange-700">Monthly Sales</h3>
            <p className="text-2xl font-bold mt-2">$35,200.00</p>
            <p className="text-sm text-gray-500">Target 80% Achieved</p>
        </div>
    </div>
  </div>
);

// --- Main Dashboard Component ---

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear tokens and redirect
    localStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    sessionStorage.removeItem("adminUser");
    navigate("/adminLogin");
  };

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard Overview" },
    { id: "menu", icon: Utensils, label: "Menu Management" },
    { id: "staff", icon: Users, label: "Staff Management" },
    { id: "customer", icon: ClipboardList, label: "Customers" },
    { id: "reports", icon: BarChart3, label: "Reports & Analytics" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "menu":
        return <MenuManagement />;
      case "staff":
        // Using the imported StaffManagement component
        return <StaffManagement />;
      case "customer":
        return <CustomerManagement />;
      case "reports":
        return <Reports />;
      case "dashboard":
      default:
        return (
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold gradient-text mb-4">Welcome Back, Admin!</h2>
            <p className="text-gray-600">Quick view of today's key metrics.</p>
            {/* Quick Stats Grid */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-5 border border-red-100">
                    <p className="text-sm text-gray-500">Today's Orders</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">45</p>
                </div>
                <div className="card p-5 border border-red-100">
                    <p className="text-sm text-gray-500">New Customers</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">12</p>
                </div>
                <div className="card p-5 border border-red-100">
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">$1,540</p>
                </div>
            </div>
            <div className="mt-8">
              <Reports /> {/* Embed Sales Report for quick access */}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <div 
        className={`bg-[#2d2d2d] text-white transition-all duration-300 flex-shrink-0 ${isSidebarOpen ? 'w-64' : 'w-20'} relative z-20 shadow-xl`}
        style={{ background: 'linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%)' }}
      >
        <div className="p-4 flex items-center justify-between h-20 border-b border-gray-700">
          {isSidebarOpen && (
            <h1 className="text-2xl font-extrabold gradient-text">
              TasteTrek
            </h1>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-grow">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center ${isSidebarOpen ? 'justify-start px-3' : 'justify-center'} py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'gradient-bg text-white shadow-lg'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isSidebarOpen ? 'mr-3' : ''}`} />
              {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
        
        {/* Logout Button */}
        <div className="p-4 pt-8 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${isSidebarOpen ? 'justify-start px-3' : 'justify-center'} py-3 rounded-xl transition-all duration-200 text-red-400 hover:bg-red-900`}
          >
            <LogOut className={`w-5 h-5 ${isSidebarOpen ? 'mr-3' : ''}`} />
            {isSidebarOpen && <span className="text-sm font-medium">Log Out</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold text-gray-800">{menuItems.find(item => item.id === activeTab)?.label || "Dashboard"}</h1>
            <div className="flex items-center space-x-4">
                <span className="text-gray-600">Logged in as: Admin</span>
            </div>
        </header>
        
        {/* Content Rendered Based on Active Tab */}
        <div className="h-full">
            {renderContent()}
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;