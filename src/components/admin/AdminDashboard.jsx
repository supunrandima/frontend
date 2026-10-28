// src/components/admin/AdminDashboard.jsx
import { BarChart3, ChevronLeft, ClipboardList, LayoutDashboard, LogOut, Menu, Users, Utensils, User2, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import apiClient from "../../services/apiClient";

import CategoryManagement from "./CategoryManagement";
import StaffManagement from "./StaffManagement";
import MenuItemManagement from "./MenuItemManagement";
import AdminFeedbackView from "./AdminFeedbackView";



const MenuManagement = () => {
  const [view, setView] = useState("items"); 

  if (view === "categories") {
    return <CategoryManagement onBack={() => setView("items")} />;
  }

  return (
    <div className="h-full flex flex-col relative">
     
      <div className="absolute -top-6 right-1 z-10">
        <button 
          onClick={() => setView("categories")}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:text-[#FF3131] hover:border-[#FF3131]/30 transition-all"
        >
          <ClipboardList className="w-4 h-4" />
          Manage Categories
        </button>
      </div>

      <MenuItemManagement />
    </div>
  );
};


const Reports = ({ dailyRevenue, monthlyRevenue }) => (
  <div className="p-6 bg-white rounded-xl shadow-lg h-full">
    <h2 className="text-2xl font-bold gradient-text mb-4">Sales Reports</h2>
    <p className="text-gray-600">Analyze performance with Daily and Monthly Sales reports.</p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-4 border rounded-xl bg-red-50/50">
            <h3 className="text-xl font-semibold text-red-700">Total Sales</h3>
            <p className="text-2xl font-bold mt-2">{dailyRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            <p className="text-sm text-gray-500">All-time revenue</p>
        </div>
        <div className="p-4 border rounded-xl bg-orange-50/50">
            <h3 className="text-xl font-semibold text-orange-700">Recent Sales</h3>
            <p className="text-2xl font-bold mt-2">{monthlyRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            <p className="text-sm text-gray-500">Target 80% Achieved</p>
        </div>
    </div>
  </div>
);

// Main Dashboard 

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [metrics, setMetrics] = useState({
    todaysOrders: 0,
    newCustomers: 0,
    dailyRevenue: 0,
    monthlyRevenue: 0,
  });
  const [analyticsData, setAnalyticsData] = useState({
    dailySales: [],
    topItems: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [metricsResponse, analyticsResponse] = await Promise.all([
          apiClient.get("/admin/dashboard/metrics"),
          apiClient.get("/admin/dashboard/analytics")
        ]);
        setMetrics(metricsResponse.data);
        setAnalyticsData(analyticsResponse.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };
    fetchMetrics();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    sessionStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    sessionStorage.removeItem("adminUser");
    navigate("/adminLogin");
  };

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard Overview" },
    { id: "menu", icon: Utensils, label: "Menu Management" },
    { id: "staff", icon: User2, label: "Staff Management" },
    { id: "customer", icon: Users, label: "Customers" },
    { id: "reports", icon: BarChart3, label: "Reports & Analytics" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "menu":
        return <MenuManagement />;
      case "staff":
        return <StaffManagement />;
      case "customer":
        return <AdminFeedbackView />;
      case "reports":
        return <Reports dailyRevenue={metrics.dailyRevenue} monthlyRevenue={metrics.monthlyRevenue} />;
      case "dashboard":
      default:
        return (
          <div className="p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold gradient-text mb-4">Welcome Back, Admin!</h2>
            <p className="text-gray-600">Quick view of today's key metrics.</p>
          
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-5 border border-red-100">
                    <p className="text-sm text-gray-500">Total Orders</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">{metrics.todaysOrders}</p>
                </div>
                <div className="card p-5 border border-red-100">
                    <p className="text-sm text-gray-500">Total Customers</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">{metrics.newCustomers}</p>
                </div>
                <div className="card p-5 border border-red-100">
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="text-3xl font-bold text-red-600 mt-1">{metrics.dailyRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Revenue Over Time (Last 7 Days)</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.dailySales}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="date" tick={{fill: '#6B7280', fontSize: 12}} tickLine={false} axisLine={false} />
                      <YAxis tick={{fill: '#6B7280', fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        formatter={(value) => [`$${value}`, 'Revenue']}
                      />
                      <Line type="monotone" dataKey="totalSales" stroke="#FF3131" strokeWidth={3} dot={{r: 4, fill: '#FF3131', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Top 5 Best-Selling Items</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.topItems}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="itemName" tick={{fill: '#6B7280', fontSize: 12}} tickLine={false} axisLine={false} />
                      <YAxis tick={{fill: '#6B7280', fontSize: 12}} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        formatter={(value) => [value, 'Quantity Sold']}
                        cursor={{ fill: '#F3F4F6' }}
                      />
                      <Bar dataKey="quantitySold" fill="#FF3131" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Reports dailyRevenue={metrics.dailyRevenue} monthlyRevenue={metrics.monthlyRevenue} /> 
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      
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


      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-semibold text-gray-800">{menuItems.find(item => item.id === activeTab)?.label || "Dashboard"}</h1>
            <div className="flex items-center space-x-4">
                <span className="text-gray-600">Logged in as: Admin</span>
            </div>
        </header>
        
        
        <div className="h-full">
            {renderContent()}
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;