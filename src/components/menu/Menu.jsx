import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext"; 
import { getAllCategories } from "../../services/categoryService";
import { getAllMenuItems } from "../../services/menuItemService";
import { getRecommendations } from "../../services/customerFeatureService"; // Import Recommendation Service
import { Plus, Loader2, UtensilsCrossed, ShoppingCart, Calendar, Search, X, Filter, ChevronRight, Activity, LogIn, User } from "lucide-react";

const Menu = ({ searchQuery }) => {
  const cart = useCart(); 
  const navigate = useNavigate();
    
  // --- Data State ---
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]); // NEW: Store Recommendations
  
  // --- Filter & Search State ---
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [localSearch, setLocalSearch] = useState(""); 
  const [categorySearch, setCategorySearch] = useState(""); 
  const [filteredCategories, setFilteredCategories] = useState([]);

  // --- UI State ---
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const sidebarRef = useRef(null); 

  // --- User, Date & Guest State ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [customerName, setCustomerName] = useState("Guest");
  const [activeOrderId, setActiveOrderId] = useState(null); 
  const [isGuest, setIsGuest] = useState(false);

  // --- Initial Setup ---
  useEffect(() => {
    const customerId = localStorage.getItem("customerId");
    const storedName = localStorage.getItem("customerName");
    const role = localStorage.getItem("userRole"); 

    // 1. Identify User Type
    const isNameValid = storedName && typeof storedName === "string" && storedName !== "undefined" && storedName !== "null";

    if (role === "GUEST") {
        setIsGuest(true);
        setCustomerName("Guest");
    } else if (isNameValid) {
        setIsGuest(false);
        const firstName = storedName.split(" ")[0];
        setCustomerName(firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()); 
    } else {
        setCustomerName("Guest");
    }

    // 2. Check for Active Orders
    const storedOrderId = localStorage.getItem("currentOrderId");
    if (storedOrderId) {
        setActiveOrderId(storedOrderId);
    }

    // 3. Start Clock
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);

    // 4. Fetch All Data (Menu + Recommendations)
    const fetchData = async () => {
      try {
        const [catResponse, menuResponse, recResponse] = await Promise.all([
          getAllCategories(),
          getAllMenuItems(),
          getRecommendations(customerId) // Fetch smart recommendations
        ]);

        setCategories(catResponse.data);
        setFilteredCategories(catResponse.data); 
        setMenuItems(menuResponse.data);
        setFilteredItems(menuResponse.data);
        setRecommendations(recResponse.data); // Save recommendations
        
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    return () => clearInterval(timer);
  }, []);

  // --- Click Outside Sidebar ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside); 
    document.addEventListener("touchstart", handleClickOutside); 
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isSidebarOpen]);

  // --- Filter Logic ---
  useEffect(() => {
    let result = menuItems;
    if (selectedCategory !== "All") {
      result = result.filter(item => item.category === selectedCategory);
    }
    const activeQuery = localSearch || searchQuery;
    if (activeQuery) {
      const lowerQuery = activeQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) || 
        item.description.toLowerCase().includes(lowerQuery) ||
        item.itemCode.includes(lowerQuery)
      );
    }
    setFilteredItems(result);
  }, [selectedCategory, searchQuery, localSearch, menuItems]);

  useEffect(() => {
    if (!categorySearch) {
        setFilteredCategories(categories);
    } else {
        const lowerCatQuery = categorySearch.toLowerCase();
        setFilteredCategories(categories.filter(cat => cat.name.toLowerCase().includes(lowerCatQuery)));
    }
  }, [categorySearch, categories]);

  const handleAddToCart = (item) => cart.addToCart(item, 1);
  const handleCategorySelect = (catName) => {
      setSelectedCategory(catName);
      setIsSidebarOpen(false); 
  };

  const getGreeting = () => {
      const hour = currentDate.getHours();
      if (hour < 12) return "Good morning";
      if (hour < 17) return "Good afternoon"; 
      return "Good evening"; 
  };
  
  const formatDisplayTime = (date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase().replace("am", "a.m.").replace("pm", "p.m.");
  const formatDisplayDate = (date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#1a1a1a] text-[#FF3131]">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1a1a1a] relative"> 
      
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm transition-opacity fade-in"></div>
      )}

      {/* Sidebar Drawer */}
      <aside 
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-80 bg-[#2d2d2d] border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white">Categories</h2>
                    <p className="text-xs text-gray-400">Select to filter menu</p>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-[#FF3131] transition-all">
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input type="text" placeholder="Find a category..." value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} className="w-full bg-[#1a1a1a] text-white pl-9 pr-3 py-3 rounded-xl border border-white/10 focus:border-[#FF3131] outline-none text-sm placeholder-gray-600 transition-colors" />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                <button onClick={() => handleCategorySelect("All")} className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 font-medium flex items-center justify-between group ${selectedCategory === "All" ? "bg-gradient-to-r from-[#FF3131] to-[#FF914D] text-white shadow-lg shadow-orange-500/20" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
                    <span>All Items</span>
                    {selectedCategory === "All" ? <div className="w-2 h-2 bg-white rounded-full"></div> : <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50"/>}
                </button>

                {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                    <button key={cat.categoryId} onClick={() => handleCategorySelect(cat.name)} className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 font-medium flex items-center justify-between group ${selectedCategory === cat.name ? "bg-gradient-to-r from-[#FF3131] to-[#FF914D] text-white shadow-lg shadow-orange-500/20" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}>
                        <span>{cat.name}</span>
                        {selectedCategory === cat.name ? <div className="w-2 h-2 bg-white rounded-full"></div> : <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50"/>}
                    </button>
                    ))
                ) : (
                    <div className="text-center py-8"><p className="text-gray-500 text-sm">No categories found</p></div>
                )}
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 w-full max-w-[100vw]">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="flex flex-col gap-6 md:flex-row justify-between items-start md:items-end mb-8 pb-6 border-b border-white/10 mt-12 md:mt-0">
            <div>
               <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF3131] to-[#FF914D] mb-2">
                 {getGreeting()}, {customerName}!
               </h1>
               
               {isGuest ? (
                   <p className="text-gray-400 text-sm md:text-base flex items-center gap-2">
                       Browsing as Guest. 
                       <span 
                         onClick={() => navigate('/')} 
                         className="text-[#FF914D] cursor-pointer hover:underline flex items-center gap-1 font-bold"
                       >
                         Login to save favorites <LogIn className="w-3 h-3"/>
                       </span>
                   </p>
               ) : (
                   <p className="text-gray-400 text-sm md:text-base">Ready to order? Let's find something delicious.</p>
               )}
            </div>

            <div className="flex flex-col items-end gap-3 w-full md:w-auto">
              <div className="flex items-center gap-3">
                {/* Profile Button (Registered Only) */}
                {!isGuest && (
                    <button 
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 bg-[#2d2d2d] hover:bg-[#333] border border-white/10 px-4 py-2 rounded-full text-white transition-all shadow-lg"
                    >
                        <User className="w-4 h-4 text-[#FF914D]"/>
                        <span className="text-sm font-medium">My Profile</span>
                    </button>
                )}

                {/* Track Order Button */}
                {activeOrderId && (
                    <button 
                        onClick={() => navigate(`/order-status/${activeOrderId}`)}
                        className="flex items-center gap-2 bg-green-500/20 text-green-400 border border-green-500/50 px-4 py-2 rounded-full hover:bg-green-500 hover:text-white transition-all animate-pulse shadow-lg"
                    >
                        <Activity className="w-4 h-4" />
                        <span className="text-sm font-bold">Track #{activeOrderId.substring(0, 5)}</span>
                    </button>
                )}
              </div>

              <div className="hidden md:flex flex-col items-end gap-1">
                <div className="text-5xl font-bold text-white tracking-tight">{formatDisplayTime(currentDate)}</div>
                 <div className="flex items-center gap-2 text-gray-400 font-medium">
                    <Calendar className="w-4 h-4 text-white" />
                    <span>{formatDisplayDate(currentDate)}</span>
                 </div>
              </div>
            </div>
          </div>

          {/* --- RECOMMENDATIONS SECTION --- */}
          {recommendations.length > 0 && !localSearch && selectedCategory === "All" && (
            <div className="mb-10 animate-fade-in">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    {isGuest ? "🔥 Trending Now" : `✨ Recommended for ${customerName}`}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {recommendations.map(item => (
                        <div key={item.id} onClick={() => handleAddToCart(item)} className="bg-[#2d2d2d] p-3 rounded-xl border border-white/5 flex gap-3 cursor-pointer hover:bg-white/5 hover:border-[#FF3131]/30 transition-all group shadow-md">
                            <img src={item.imageUrl || "https://via.placeholder.com/100"} alt={item.name} className="w-16 h-16 rounded-lg object-cover"/>
                            <div className="flex flex-col justify-center">
                                <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-[#FF914D] transition-colors">{item.name}</h4>
                                <span className="text-[#FF3131] text-xs font-bold">${item.price.toFixed(2)}</span>
                                <span className="text-gray-500 text-[10px] mt-1 group-hover:text-white/60">Tap to add</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}
          
          {/* Controls */}
          <div className="flex gap-4 mb-8 sticky top-4 z-30">
             <button onClick={() => setIsSidebarOpen(true)} className="flex items-center gap-3 bg-[#2d2d2d] px-6 py-4 rounded-2xl text-white border border-white/5 hover:bg-[#333] hover:border-[#FF3131]/50 hover:text-[#FF914D] transition-all shadow-lg group">
                <Filter className="w-5 h-5 text-[#FF914D] group-hover:scale-110 transition-transform" />
                <span className="font-bold hidden sm:inline">Categories</span>
             </button>

             <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" placeholder="Search for food..." value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} className="w-full bg-[#2d2d2d] text-white pl-14 pr-6 py-4 rounded-2xl border border-white/5 focus:border-[#FF3131] outline-none transition-all shadow-lg placeholder-gray-500"/>
             </div>
          </div>

          {/* Active Category Title */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <UtensilsCrossed className="w-6 h-6 text-[#FF914D]" />
              {selectedCategory === "All" ? "Full Menu" : selectedCategory}
            </h2>
            <span className="px-3 py-1 bg-white/5 rounded-full text-gray-400 text-xs font-mono border border-white/5">
              {filteredItems.length} Result{filteredItems.length !== 1 && 's'}
            </span>
          </div>

          {/* Items Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
              {filteredItems.map((item) => (
                <div key={item.itemId} className="bg-[#2d2d2d] rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 hover:shadow-2xl hover:shadow-[#FF3131]/10 transition-all duration-300 group flex flex-col">
                  <div className="h-52 overflow-hidden relative">
                    <img src={item.imageUrl || "https://via.placeholder.com/400x300?text=No+Image"} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2d2d2d] via-transparent to-transparent opacity-80"></div>
                    <span className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white px-4 py-1.5 rounded-xl text-sm font-bold border border-white/10 shadow-lg">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex-1 mb-4">
                        <div className="flex justify-between items-start"><h3 className="text-lg font-bold text-white group-hover:text-[#FF914D] transition-colors mb-2 line-clamp-1">{item.name}</h3></div>
                        <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                    <button onClick={() => handleAddToCart(item)} className="w-full mt-auto bg-[#333333] hover:bg-white text-white hover:text-black font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-lg">
                      <Plus className="w-5 h-5 text-[#FF3131] group-hover/btn:text-black transition-colors" /> Add to Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-gray-500 border-2 border-dashed border-white/5 rounded-3xl bg-white/5">
              <UtensilsCrossed className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-xl font-medium text-gray-400">No items found</p>
              <p className="text-sm opacity-60">Try searching for something else.</p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Cart Button */}
      {cart.getTotalItems() > 0 && (
          <button onClick={() => navigate('/checkout')} className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-[#FF3131] to-[#FF914D] text-white p-4 pr-6 rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-3 animate-bounce-in border-4 border-[#1a1a1a]">
              <div className="relative">
                <ShoppingCart className="w-6 h-6"/> 
                <span className="absolute -top-2 -right-2 bg-white text-[#FF3131] text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{cart.getTotalItems()}</span>
              </div>
              <span className="font-bold text-lg hidden sm:block">View Cart</span>
          </button>
      )}
    </div>
  );
};

export default Menu;