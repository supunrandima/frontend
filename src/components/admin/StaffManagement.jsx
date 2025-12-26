// src/components/admin/StaffManagement.jsx
import React, { useState, useEffect } from "react";
import { Users, Plus, Edit2, Trash2, Save, X, Phone, MapPin, User, Lock, Briefcase, CheckCircle, AlertCircle } from "lucide-react";
import { getAllStaff, registerStaff, updateStaff, deleteStaff } from "../../services/staffService";

const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [view, setView] = useState("list"); 
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // Initial Form State
  const initialFormState = {
    id: null,
    firstName: "",
    lastName: "",
    staffId: "",
    password: "",
    phone: "",
    address: "",
    role: "KITCHEN", 
    status: "ACTIVE"
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const response = await getAllStaff();
      setStaffList(response.data);
    } catch (error) {
      console.error("Error fetching staff:", error);
      setMessage({ type: "error", text: "Failed to load staff list." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.staffId) return "Name and Staff ID are required.";
    if (!isEditing && !formData.password) return "Password is required for new staff.";
    const phonePattern = /^[+]?[0-9]{10,15}$/;
    if (!phonePattern.test(formData.phone)) return "Invalid phone number (10-15 digits required).";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
        setMessage({ type: "error", text: error });
        return;
    }

    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
        if (isEditing) {
            await updateStaff(formData.id, formData);
            setMessage({ type: "success", text: "Staff member updated successfully!" });
        } else {
            await registerStaff(formData);
            setMessage({ type: "success", text: "New staff registered successfully!" });
        }
        await fetchStaff();
        setView("list");
        setFormData(initialFormState);
    } catch (err) {
        const errorMsg = err.response?.data?.error || "Operation failed. Please try again.";
        setMessage({ type: "error", text: errorMsg });
    } finally {
        setIsLoading(false);
    }
  };

  const handleEdit = (staff) => {
    setFormData({
        ...staff,
        password: "" 
    });
    setIsEditing(true);
    setView("form");
    setMessage({ type: "", text: "" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    
    try {
        await deleteStaff(id);
        setStaffList(staffList.filter(s => s.id !== id));
        setMessage({ type: "success", text: "Staff member deleted." });
    } catch (error) {
        console.error=("Error deleting staff:", error);
        setMessage({ type: "error", text: "Failed to delete staff." });
    }
  };

  // --- UI Components ---

  const renderForm = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">
                {isEditing ? "Edit Staff Member" : "Register New Staff"}
            </h3>
            <button 
                onClick={() => setView("list")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
                <X className="w-5 h-5 text-gray-500" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF3131] focus:border-transparent outline-none" 
                            placeholder="John" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF3131] focus:border-transparent outline-none" 
                            placeholder="Doe" />
                    </div>
                </div>
            </div>

            {/* Creds Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID (Login ID)</label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input type="text" name="staffId" value={formData.staffId} onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF3131] focus:border-transparent outline-none" 
                            placeholder="STF001" disabled={isEditing} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password {isEditing && <span className="text-xs text-gray-400">(Leave blank to keep current)</span>}
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input type="password" name="password" value={formData.password} onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF3131] focus:border-transparent outline-none" 
                            placeholder="••••••" />
                    </div>
                </div>
            </div>

            {/* Contact Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF3131] focus:border-transparent outline-none" 
                            placeholder="0771234567" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input type="text" name="address" value={formData.address} onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF3131] focus:border-transparent outline-none" 
                            placeholder="City, Street" />
                    </div>
                </div>
            </div>

            {/* Role & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select name="role" value={formData.role} onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF3131] outline-none bg-white">
                        <option value="KITCHEN">Kitchen Staff</option>
                        <option value="WAITER">Waiter</option>
                        <option value="MANAGER">Manager</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF3131] outline-none bg-white">
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
                <button type="submit" disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-[#FF3131] to-[#FF914D] text-white py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50">
                    {isLoading ? "Saving..." : "Save Staff Member"}
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
    <div className="h-full">
        {/* Message Alert */}
        {message.text && (
            <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
                <p>{message.text}</p>
            </div>
        )}

        {view === "list" ? (
            <div className="bg-white rounded-xl shadow-lg p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold gradient-text">Staff Management</h2>
                        <p className="text-gray-500 text-sm">Manage employee accounts and roles</p>
                    </div>
                    <button 
                        onClick={() => {
                            setFormData(initialFormState);
                            setIsEditing(false);
                            setView("form");
                            setMessage({type: "", text: ""});
                        }}
                        className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
                    >
                        <Plus className="w-4 h-4" /> Add Staff
                    </button>
                </div>

                <div className="flex-1 overflow-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {staffList.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">No staff members found.</td>
                                </tr>
                            ) : (
                                staffList.map((staff) => (
                                    <tr key={staff.staffId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{staff.staffId}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                                                    {staff.firstName[0]}{staff.lastName[0]}
                                                </div>
                                                {staff.firstName} {staff.lastName}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                                {staff.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{staff.phone}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                staff.status === 'ACTIVE' 
                                                ? 'bg-green-50 text-green-600 border border-green-100' 
                                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                                            }`}>
                                                {staff.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(staff)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(staff.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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

export default StaffManagement;