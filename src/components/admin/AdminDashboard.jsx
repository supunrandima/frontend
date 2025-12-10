// src/components/admin/AdminDashboard.jsx
import { BarChart3, ChevronLeft, ClipboardList, LayoutDashboard, LogOut, Menu, Users, Utensils } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// --- Imported Management Components ---
import CategoryManagement from "./CategoryManagement";
import StaffManagement from "./StaffManagement";
import MenuItemManagement from "./MenuItemManagement";


// --- Sub-Components ---

// 1. Menu Management Wrapper
// This component switches between the Item List (MenuItemManagement) and Category List (CategoryManagement)
const MenuManagement = () => {
  const [view, setView] = useState("items"); // 'items' or 'categories'

  if (view === "categories") {
    return <CategoryManagement onBack={() => setView("items")} />;
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Floating Switch Button */}
      {/* Positioned absolutely to sit on top of the MenuItemManagement header */}
      <div className="absolute top-6 right-6 z-10">
        <button 
          onClick={() => setView("categories")}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:text-[#FF3131] hover:border-[#FF3131]/30 transition-all"
        >
          <ClipboardList className="w-4 h-4" />
          Manage Categories
        </button>
      </div>

      {/* Main Item Manager */}
      <MenuItemManagement />
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