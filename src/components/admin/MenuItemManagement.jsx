import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, X, Search, Image, DollarSign, FileText, Tag, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { getAllMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from "../../services/menuItemService";
import { getAllCategories } from "../../services/categoryService";

const MenuItemManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [view, setView] = useState("list");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const initialFormState = {
    itemId: null,
    name: "",
    itemCode: "",
    category: "",
    description: "",
    price: "",
    imageUrl: "",
    status: "Available"
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [itemsResponse, catsResponse] = await Promise.all([
        getAllMenuItems(),
        getAllCategories()
      ]);
      setMenuItems(itemsResponse.data);
      setCategories(catsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ type: "error", text: "Failed to load data." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const generateItemCode = (categoryName) => {
    const selectedCat = categories.find(c => c.name === categoryName);
    if (!selectedCat) return "";

    const catCode = selectedCat.categoryCode; 

    const categoryItems = menuItems.filter(item => item.itemCode.startsWith(catCode));

    let maxSeq = 0;
    categoryItems.forEach(item => {
        // Extract last 3 digits: "10005" -> "005" -> 5
        const seqPart = parseInt(item.itemCode.substring(2)); 
        if (!isNaN(seqPart) && seqPart > maxSeq) {
            maxSeq = seqPart;
        }
    });

    const nextSeq = maxSeq + 1;
    const nextSeqString = nextSeq.toString().padStart(3, '0');

    return `${catCode}${nextSeqString}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "category") {
        if (!isEditing) {
            const newItemCode = generateItemCode(value);
            setFormData({ ...formData, category: value, itemCode: newItemCode });
        } else {
             const newItemCode = generateItemCode(value);
             setFormData({ ...formData, category: value, itemCode: newItemCode });
        }
    } else {
        setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.price) {
        setMessage({ type: "error", text: "Name, Category, and Price are required." });
        return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
        if (isEditing) {
            await updateMenuItem(formData.itemId, formData);
            setMessage({ type: "success", text: "Menu item updated successfully!" });
        } else {
            await addMenuItem(formData);
            setMessage({ type: "success", text: "New menu item added successfully!" });
        }
        await fetchData(); 
        setView("list");
        setFormData(initialFormState);
    } catch (err) {
        setMessage({ type: "error", text: err.response?.data?.error || "Operation failed." });
    } finally {
        setIsLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setIsEditing(true);
    setView("form");
    setMessage({ type: "", text: "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this menu item?")) return;
    try {
        await deleteMenuItem(id);
        setMenuItems(menuItems.filter(item => item.itemId !== id));
        setMessage({ type: "success", text: "Item deleted." });
    } catch (error) {
        console.error("Error deleting items", error);
        setMessage({ type: "error", text: "Failed to delete item." });
    }
  };

  // --- UI Components ---
  const renderForm = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">{isEditing ? "Edit Menu Item" : "Add New Menu Item"}</h3>
            <button onClick={() => setView("list")} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select name="category" value={formData.category} onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF3131] bg-white outline-none" required>
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                            <option key={cat.categoryId} value={cat.name}>{cat.name} ({cat.categoryCode})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Code (Auto)</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input type="text" name="itemCode" value={formData.itemCode} readOnly
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-100 rounded-lg text-gray-500 font-mono outline-none cursor-not-allowed" 
                            placeholder="Select category first" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF3131] outline-none" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF3131] outline-none" required />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <div className="relative">
                        <Image className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF3131] outline-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF3131] bg-white outline-none">
                        <option value="Available">Available</option>
                        <option value="Out of Stock">Out of Stock</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange} 
                rows="3"
                maxLength="100" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF3131] outline-none resize-none" 
                required 
            />
            </div>

            <div className="flex gap-4 pt-2">
                <button type="submit" disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-[#FF3131] to-[#FF914D] text-white py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50">
                    {isLoading ? "Saving..." : (isEditing ? "Update Item" : "Add Item")}
                </button>
                <button type="button" onClick={() => setView("list")}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-all">
                    Cancel
                </button>
            </div>
        </form>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
        {message.text && (
            <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
                <p>{message.text}</p>
            </div>
        )}

        {view === "list" ? (
            <div className="bg-white rounded-xl shadow-lg p-6 flex-1 flex flex-col min-h-0">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold gradient-text">Menu Items</h2>
                        <p className="text-gray-500 text-sm">{menuItems.length} items available</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search items..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FF3131] outline-none"
                            />
                        </div>
                        <button 
                            onClick={() => {
                                setFormData(initialFormState);
                                setIsEditing(false);
                                setView("form");
                                setMessage({type: "", text: ""});
                            }}
                            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" /> Add Item
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar border rounded-xl">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border-b">Image</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border-b">Code</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border-b">Name</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border-b">Category</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border-b">Price</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase border-b">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan="7" className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#FF3131]"/></td></tr>
                            ) : menuItems.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-10 text-gray-500">No menu items found.</td></tr>
                            ) : (
                                menuItems.map((item) => (
                                    <tr key={item.itemId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <img src={item.imageUrl || "https://via.placeholder.com/40?text=Food"} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-200" />
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.itemCode}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                                        <td className="px-4 py-3 text-gray-600">{item.category}</td>
                                        <td className="px-4 py-3 font-semibold text-[#FF3131]">${item.price}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs rounded-full border ${item.status === 'Available' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(item.itemId)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            renderForm()
        )}
    </div>
  );
};

export default MenuItemManagement;