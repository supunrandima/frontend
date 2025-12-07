import React, { useState, useEffect } from "react";
import { getAllCategories, getAllMenuItems } from "../../services/menuService";
import { Plus, Loader2, UtensilsCrossed } from "lucide-react";
import MenuNavbar from "./MenuNavbar";

const Menu = ({ searchQuery }) => {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catResponse, menuResponse] = await Promise.all([
          getAllCategories(),
          getAllMenuItems()
        ]);
        setCategories(catResponse.data);
        setMenuItems(menuResponse.data);
        setFilteredItems(menuResponse.data); // Initially show all
      } catch (error) {
        console.error("Error loading menu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 2. Filter Logic (Category + Search) ---
  useEffect(() => {
    let result = menuItems;

    // Filter by Category
    if (selectedCategory !== "All") {
      // Assuming backend sends category name or code. Matching by Name here.
      result = result.filter(item => item.category === selectedCategory);
    }

    // Filter by Search (from Props)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) || 
        item.description.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredItems(result);
  }, [selectedCategory, searchQuery, menuItems]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-[#FF3131]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-88px)]"> 
      
      {/* --- Sidebar Navigation --- */}
      <aside className="w-full md:w-64 bg-[#2d2d2d] md:min-h-full p-4 md:sticky md:top-[88px] overflow-x-auto md:overflow-visible flex md:flex-col gap-3 border-b md:border-b-0 md:border-r border-white/5 z-10">
        <h2 className="hidden md:block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 px-2">Categories</h2>
        
        {/* "All" Button */}
        <button
          onClick={() => setSelectedCategory("All")}
          className={`flex-shrink-0 w-auto md:w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
            selectedCategory === "All"
              ? "bg-gradient-to-r from-[#FF3131] to-[#FF914D] text-white shadow-lg shadow-orange-500/20"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          All Items
        </button>

        {/* Dynamic Categories */}
        {categories.map((cat) => (
          <button
            key={cat.categoryId}
            onClick={() => setSelectedCategory(cat.name)}
            className={`flex-shrink-0 w-auto md:w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
              selectedCategory === cat.name
                ? "bg-gradient-to-r from-[#FF3131] to-[#FF914D] text-white shadow-lg shadow-orange-500/20"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </aside>

      {/* --- Main Content (Menu Grid) --- */}
      <main className="flex-1 p-6 bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              {selectedCategory === "All" ? "Full Menu" : selectedCategory}
            </h2>
            <p className="text-gray-400">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} available
            </p>
          </div>

          {/* Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div 
                  key={item.itemId} 
                  className="bg-[#2d2d2d] rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 hover:shadow-2xl hover:shadow-[#FF3131]/10 transition-all duration-300 group flex flex-col"
                >
                  {/* Image Area */}
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={item.imageUrl || "https://via.placeholder.com/400x300?text=No+Image"} 
                      alt={item.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2d2d2d] to-transparent opacity-60"></div>
                    <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-bold border border-white/10">
                      ${item.price}
                    </span>
                  </div>

                  {/* Content Area */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white group-hover:text-[#FF914D] transition-colors">
                          {item.name}
                        </h3>
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                        {item.description}
                      </p>
                    </div>

                    {/* Action */}
                    <button className="w-full mt-auto bg-[#333333] hover:bg-white text-white hover:text-black font-semibold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group/btn">
                      <Plus className="w-4 h-4 text-[#FF3131] group-hover/btn:text-black" />
                      Add to Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <UtensilsCrossed className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-xl font-medium">No items found</p>
              <p className="text-sm">Try selecting a different category or change your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Menu;