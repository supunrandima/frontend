import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext"; 
import { getAllCategories } from "../../services/categoryService";
import { getAllMenuItems } from "../../services/menuItemService";
import { getRecommendations } from "../../services/customerFeatureService";
import { Plus, Loader2, UtensilsCrossed, ShoppingCart, Calendar, Search, X, Filter, ChevronRight, Activity, LogIn, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ItemCustomizationModal from "./ItemCustomizationModal";

const Menu = ({ searchQuery }) => {
  const cart = useCart(); 
  const navigate = useNavigate();
    
  // --- Data State ---
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [recommendations, setRecommendations] = useState([]); 
  
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

  // --- Modal State ---
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Initial Setup ---
  useEffect(() => {
    const customerId = localStorage.getItem("customerId");
    const storedName = localStorage.getItem("customerName");
    const role = localStorage.getItem("userRole"); 

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

    const storedOrderId = localStorage.getItem("currentOrderId");
    if (storedOrderId) {
        setActiveOrderId(storedOrderId);
    }

    const timer = setInterval(() => setCurrentDate(new Date()), 1000);

    const fetchData = async () => {
      try {
        const [catResponse, menuResponse, recResponse] = await Promise.all([
          getAllCategories(),
          getAllMenuItems(),
          getRecommendations(customerId)
        ]);

        setCategories(catResponse.data);
        setFilteredCategories(catResponse.data); 
        setMenuItems(menuResponse.data);
        setFilteredItems(menuResponse.data);
        setRecommendations(recResponse.data); 
        
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

  const handleAddToCart = (item) => {
      setSelectedItemForModal(item);
      setIsModalOpen(true);
  };
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


  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const sidebarVariants = {
    hidden: { x: "-100%" },
    show: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-950 to-black text-[#FF914D]">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-950 to-black relative font-poppins selection:bg-orange-500/30 overflow-x-hidden"> 
      
      {/* Background Decorative Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
      {isSidebarOpen && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        />
      )}
      </AnimatePresence>

      {/* Sidebar Drawer */}
      <AnimatePresence>
      {isSidebarOpen && (
      <motion.aside 
        ref={sidebarRef}
        variants={sidebarVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        className="fixed top-0 left-0 h-full w-80 bg-black/40 backdrop-blur-3xl border-r border-white/10 z-50 shadow-[20px_0_50px_rgba(0,0,0,0.5)]"
      >
        <div className="p-5 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white drop-shadow-md">Categories</h2>
                    <p className="text-xs text-gray-400">Select to filter menu</p>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10">
                    <X className="w-5 h-5" />
                </button>
            </div>
            
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input type="text" placeholder="Find a category..." value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} className="w-full bg-black/50 text-white pl-9 pr-3 py-3 rounded-xl border border-white/10 focus:border-orange-500 outline-none text-sm placeholder-gray-600 transition-colors shadow-inner" />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                <button onClick={() => handleCategorySelect("All")} className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 font-medium flex items-center justify-between group ${selectedCategory === "All" ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]" : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/5"}`}>
                    <span>All Items</span>
                    {selectedCategory === "All" ? <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_white]"></div> : <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50"/>}
                </button>

                {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                    <button key={cat.categoryId} onClick={() => handleCategorySelect(cat.name)} className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 font-medium flex items-center justify-between group ${selectedCategory === cat.name ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]" : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/5"}`}>
                        <span>{cat.name}</span>
                        {selectedCategory === cat.name ? <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_white]"></div> : <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50"/>}
                    </button>
                    ))
                ) : (
                    <div className="text-center py-8"><p className="text-gray-500 text-sm">No categories found</p></div>
                )}
            </div>
        </div>
      </motion.aside>
      )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 w-full max-w-[100vw] z-10">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col gap-6 md:flex-row justify-between items-start md:items-end mb-8 pb-6 border-b border-white/10 mt-12 md:mt-0">
            <div>
               <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 mb-2 drop-shadow-sm tracking-tight">
                 {getGreeting()}, {customerName}!
               </h1>
               
               {isGuest ? (
                   <p className="text-gray-400 text-sm md:text-base flex items-center gap-2">
                       Browsing as Guest. 
                       <span 
                         onClick={() => navigate('/')} 
                         className="text-orange-400 cursor-pointer hover:text-orange-300 transition-colors flex items-center gap-1 font-bold"
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
                    className="flex items-center gap-2 bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full text-white transition-all shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    >
                        <User className="w-4 h-4 text-orange-400"/>
                        <span className="text-sm font-medium">My Profile</span>
                    </button>
                )}

                {/* Track Order Button */}
                {activeOrderId && (
                    <button 
                        onClick={() => navigate(`/order-status/${activeOrderId}`)}
                        className="flex items-center gap-2 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 text-teal-300 border border-teal-500/30 px-4 py-2 rounded-full hover:from-teal-500/40 hover:to-emerald-500/40 transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)]"
                    >
                        <Activity className="w-4 h-4 animate-pulse" />
                        <span className="text-sm font-bold">Track #{activeOrderId.substring(0, 5)}</span>
                    </button>
                )}
              </div>

              <div className="hidden md:flex flex-col items-end gap-1">
                <div className="text-5xl font-black text-white tracking-tighter drop-shadow-md">{formatDisplayTime(currentDate)}</div>
                 <div className="flex items-center gap-2 text-gray-400 font-medium bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    <span className="text-sm">{formatDisplayDate(currentDate)}</span>
                 </div>
              </div>
            </div>
          </motion.div>

          {/* --- RECOMMENDATIONS SECTION --- */}
          {recommendations.length > 0 && !localSearch && selectedCategory === "All" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }} className="mb-10">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    {isGuest ? (
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">🔥 Trending Now</span>
                    ) : (
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">✨ Recommended for {customerName}</span>
                    )}
                </h3>
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    {recommendations.map(item => (
                        <motion.div variants={itemVariants} key={item.id} onClick={() => handleAddToCart(item)} className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex gap-4 cursor-pointer hover:-translate-y-1 hover:bg-white/10 hover:border-orange-500/30 hover:shadow-[0_8px_20px_rgba(249,115,22,0.15)] transition-all duration-300 group">
                            <img src={item.imageUrl || "https://via.placeholder.com/100"} alt={item.name} className="w-16 h-16 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform"/>
                            <div className="flex flex-col justify-center flex-1">
                                <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-orange-400 transition-colors">{item.name}</h4>
                                <span className="text-orange-400 text-xs font-black tracking-wider">${item.price.toFixed(2)}</span>
                                <span className="text-gray-500 text-[10px] mt-1 font-medium group-hover:text-gray-300 transition-colors uppercase tracking-widest">Tap to add</span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
          )}
          
          {/* Controls */}
          <div className="flex gap-4 mb-8 sticky top-4 z-30">
             <button onClick={() => setIsSidebarOpen(true)} className="flex items-center gap-3 bg-black/40 backdrop-blur-xl px-6 py-4 rounded-2xl text-white border border-white/10 hover:bg-black/60 hover:border-orange-500/50 hover:text-orange-400 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.3)] group">
                <Filter className="w-5 h-5 text-orange-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold hidden sm:inline">Categories</span>
             </button>

             <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-400 transition-colors" />
                <input type="text" placeholder="Search for food..." value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} className="w-full bg-black/40 backdrop-blur-xl text-white pl-14 pr-6 py-4 rounded-2xl border border-white/10 focus:border-orange-500 outline-none transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.3)] placeholder-gray-500 focus:shadow-[0_0_20px_rgba(249,115,22,0.2)]"/>
             </div>
          </div>

          {/* Active Category Title */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
              <UtensilsCrossed className="w-6 h-6 text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
              {selectedCategory === "All" ? "Full Menu" : selectedCategory}
            </h2>
            <span className="px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full text-gray-300 text-xs font-bold border border-white/10 shadow-inner">
              {filteredItems.length} Result{filteredItems.length !== 1 && 's'}
            </span>
          </div>

          {/* Items Grid */}
          <AnimatePresence mode="wait">
          {filteredItems.length > 0 ? (
            <motion.div 
                key="grid"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20"
            >
              {filteredItems.map((item) => (
                <motion.div variants={itemVariants} key={item.itemId} className="bg-white/5 backdrop-blur-lg rounded-[2rem] overflow-hidden border border-white/10 hover:border-orange-500/40 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition-all duration-300 group flex flex-col hover:-translate-y-2">
                  <div className="h-56 overflow-hidden relative">
                    <img src={item.imageUrl || "https://via.placeholder.com/400x300?text=No+Image"} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/40 to-transparent opacity-90"></div>
                    <span className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xl text-white px-4 py-1.5 rounded-xl text-sm font-black border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]">${item.price.toFixed(2)}</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col relative z-10 bg-gradient-to-b from-[#111] to-transparent">
                    <div className="flex-1 mb-6">
                        <div className="flex justify-between items-start"><h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors mb-2 line-clamp-1 drop-shadow-sm">{item.name}</h3></div>
                        <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed font-medium">{item.description}</p>
                    </div>
                    <button onClick={() => handleAddToCart(item)} className="w-full mt-auto bg-white/10 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-white/10 hover:border-transparent">
                      <Plus className="w-5 h-5 text-orange-400 group-hover/btn:text-white transition-colors" /> Add to Order
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32 text-gray-500 border-2 border-dashed border-white/10 rounded-[3rem] bg-white/5 backdrop-blur-sm"
            >
              <UtensilsCrossed className="w-16 h-16 mb-4 opacity-30 drop-shadow-md" />
              <p className="text-xl font-bold text-gray-300">No items found</p>
              <p className="text-sm opacity-60 mt-2 font-medium">Try searching for something else.</p>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Cart Button */}
      <AnimatePresence>
      {cart.getTotalItems() > 0 && (
          <motion.button 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/review')} 
            className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 pr-6 rounded-full shadow-[0_10px_40px_rgba(249,115,22,0.5)] flex items-center gap-3 border-2 border-white/20"
          >
              <div className="relative">
                <ShoppingCart className="w-6 h-6 drop-shadow-md"/> 
                <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-black w-5 h-5 flex items-center justify-center rounded-full shadow-md">{cart.getTotalItems()}</span>
              </div>
              <span className="font-bold text-lg hidden sm:block drop-shadow-md">View Cart</span>
          </motion.button>
      )}
      </AnimatePresence>

      {/* Item Customization Modal */}
      <ItemCustomizationModal 
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItemForModal}
        onAddToCart={(item, quantity, selectedOptions, specialNote) => {
            cart.addToCart(item, quantity, selectedOptions, specialNote);
        }}
      />
    </div>
  );
};

export default Menu;