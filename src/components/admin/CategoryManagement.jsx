import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, List, ClipboardList, AlertCircle, CheckCircle, Save, Loader2 } from "lucide-react";
import { getAllCategories, addCategory, updateCategory, deleteCategory } from "../../services/categoryService"; 

const CategoryManagement = ({ onBack }) => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", categoryCode: "" });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false); 

  const inputStyle = (hasError) => `w-full px-4 py-2 border rounded-lg focus:ring-2 transition-all placeholder-gray-500 text-gray-800 ${
    hasError ? "border-red-500" : "border-gray-300 focus:ring-red-500/50"
  }`;
  
  const generateNextCategoryCode = (currentCategories) => {
    if (!currentCategories || currentCategories.length === 0) return "01";


    const codes = currentCategories.map(cat => parseInt(cat.categoryCode, 10)).filter(n => !isNaN(n));
    
    if (codes.length === 0) return "01";

    const maxCode = Math.max(...codes);
    const nextCode = maxCode + 1;

    if (nextCode > 99) {
        return "";
    }

    return nextCode.toString().padStart(2, '0');
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const response = await getAllCategories();
      const fetchedCategories = response.data;
      setCategories(fetchedCategories);
      
      const nextCode = generateNextCategoryCode(fetchedCategories);
      setNewCategory(prev => ({ ...prev, categoryCode: nextCode }));

    } catch (error) {
      console.error("Error fetching categories:", error);
      setMessage({ type: "error", text: "Failed to load categories." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const validateForm = () => {
    if (!newCategory.name.trim()) {
      setMessage({ type: "error", text: "Name is required." });
      return false;
    }
    if (!newCategory.categoryCode) {
        setMessage({ type: "error", text: "Category Code is invalid or limit reached." });
        return false;
    }
    return true;
  };
  
  const getErrorMessage = (error) => {
    return error.response?.data?.error || "An unexpected error occurred.";
  };

  // CRUD Functions

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsFormLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await addCategory(newCategory);
      
      const updatedList = [...categories, response.data];
      setCategories(updatedList);
      
      const nextCode = generateNextCategoryCode(updatedList);
      

      setNewCategory({ name: "", categoryCode: nextCode });
      
      setMessage({ type: "success", text: `Category "${response.data.name}" added successfully.` });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleUpdateCategory = async (id) => {
    if (!newCategory.name.trim()) {
        setMessage({ type: "error", text: "Name is required." });
        return;
    }
    
    setIsFormLoading(true);
    setMessage({ type: "", text: "" });
    
    const payload = {
        name: newCategory.name,
        categoryCode: newCategory.categoryCode 
    };

    try {
      const response = await updateCategory(id, payload);
      
      const updatedList = categories.map((cat) => (cat.categoryId === id ? response.data : cat));
      setCategories(updatedList);
      
      setEditingId(null);
      const nextCode = generateNextCategoryCode(updatedList);
      setNewCategory({ name: "", categoryCode: nextCode });

      setMessage({ type: "success", text: `Category updated successfully.` });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category: ${name}?`)) return;

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
        await deleteCategory(id);
        const updatedList = categories.filter((cat) => cat.categoryId !== id);
        setCategories(updatedList);
        
        // Recalculate next code if we are currently in "Add" mode
        if (!editingId) {
            const nextCode = generateNextCategoryCode(updatedList);
            setNewCategory(prev => ({ ...prev, categoryCode: nextCode }));
        }

        setMessage({ type: "success", text: `Category "${name}" deleted.` });
    } catch (error) {
        let errorMessage = getErrorMessage(error);
        if (error.response?.status === 404) {
            errorMessage = "Category not found or already deleted.";
        }
        setMessage({ type: "error", text: errorMessage });
    } finally {
        setIsLoading(false);
    }
  };

  const startEdit = (category) => {
    setEditingId(category.categoryId);
    setNewCategory({ name: category.name, categoryCode: category.categoryCode });
    setMessage({ type: "", text: "" }); 
  };

  const cancelEdit = () => {
    setEditingId(null);
    const nextCode = generateNextCategoryCode(categories);
    setNewCategory({ name: "", categoryCode: nextCode });
    setMessage({ type: "", text: "" });
  };

  const hasNameError = message.type === 'error' && message.text.includes('Name');

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg h-full fade-in">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <ClipboardList className="w-6 h-6" /> Manage Menu Categories
        </h2>
        <button 
          onClick={onBack} 
          className="btn-secondary flex items-center gap-2 text-sm"
          disabled={isLoading || isFormLoading}
        >
          <List className="w-4 h-4" /> Back to Menu Items
        </button>
      </div>

      {message.text && (
        <div 
          className={`mb-6 p-4 rounded-xl flex items-start gap-3 fade-in ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <form 
        onSubmit={(e) => {
            if (editingId) {
                e.preventDefault();
                handleUpdateCategory(editingId);
            } else {
                handleAddCategory(e);
            }
        }} 
        className="mb-8 p-6 border rounded-xl bg-gray-50 card-shadow"
      >
        <h3 className="text-xl font-semibold text-gray-700 mb-4">{editingId ? 'Edit Category' : 'Add New Category'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input
              type="text"
              placeholder="e.g., Burgers"
              className={inputStyle(hasNameError)}
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              disabled={isFormLoading}
              required
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Code (Auto)</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-200 bg-gray-100 rounded-lg text-gray-500 font-mono cursor-not-allowed focus:outline-none"
              value={newCategory.categoryCode}
              readOnly
              title="Category Code is auto-generated"
            />
          </div>
          <div className="md:col-span-1 flex space-x-2">
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center gap-1 text-sm"
              disabled={isFormLoading}
            >
              {isFormLoading ? (
                 <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingId ? (
                <><Save className="w-4 h-4" /> Update</> 
              ) : (
                <><Plus className="w-4 h-4" /> Add</>
              )}
            </button>
            {editingId && (
                <button
                    type="button"
                    onClick={cancelEdit}
                    className="btn-secondary flex-1 flex items-center justify-center gap-1 text-sm bg-white"
                    disabled={isFormLoading}
                >
                    Cancel
                </button>
            )}
          </div>
        </div>
      </form>

      <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2"><List className="w-5 h-5" /> Current Categories ({categories.length})</h3>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10 text-red-600">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <p className="text-gray-500 py-10 text-center border rounded-xl">No categories found. Use the form above to add your first menu category.</p>
      ) : (
        <ul className="divide-y divide-gray-200 border rounded-xl overflow-hidden">
          <li className="p-4 bg-gray-100 font-semibold grid grid-cols-5 text-gray-700">
              <span className="col-span-3">Category Name</span>
              <span>Code</span>
              <span className="text-right">Actions</span>
          </li>
          {categories.map((cat) => (
            <li key={cat.categoryId} className="p-4 grid grid-cols-5 items-center hover:bg-red-50/50 transition-colors">
              <span className="font-medium text-gray-800 col-span-3">{cat.name}</span>
              <span className="font-mono text-gray-600 border border-red-200 bg-red-50 inline-block px-2 py-1 rounded text-xs w-fit">
                  {cat.categoryCode}
              </span>
              <div className="text-right space-x-2">
                <button 
                  onClick={() => startEdit(cat)} 
                  className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                  disabled={isLoading || isFormLoading}
                >
                  <Edit3 className="w-5 h-5 inline" />
                </button>
                <button 
                  onClick={() => handleDeleteCategory(cat.categoryId, cat.name)} 
                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors"
                  disabled={isLoading || isFormLoading}
                >
                  <Trash2 className="w-5 h-5 inline" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoryManagement;