"use client";

import React, { useState, useRef } from "react";
import { MenuItem, SalesAuditLog, Category } from "@/lib/types";
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Tag,
  Package,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertTriangle,
  ClipboardList,
  Download,
  Upload,
  FolderPlus,
  FileSpreadsheet,
  ClipboardPaste,
  Info,
  Layers,
  X,
  Settings,
  ChevronDown,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ManagementProps {
  menu: MenuItem[];
  auditLogs: SalesAuditLog[];
  categories: Category[];
  onAddNewDish: (name: string, price: number, category: string, stock: number, max: number) => void;
  onUpdateMenuDish: (dishId: string, updatedFields: Partial<MenuItem>) => void;
  onDeleteMenuDish: (dishId: string) => void;
  onAddCategory: (name: string, description?: string, color?: string) => void;
  onUpdateCategory: (id: string, name: string, description?: string, color?: string) => void;
  onDeleteCategory: (id: string) => void;
  onDeleteCategories?: (ids: string[]) => void;
  onBulkAddMenu: (newDishes: MenuItem[]) => void;
  onReplaceMenu: (newMenu: MenuItem[]) => void;
}

export default function Management({
  menu,
  auditLogs,
  categories,
  onAddNewDish,
  onUpdateMenuDish,
  onDeleteMenuDish,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onDeleteCategories,
  onBulkAddMenu,
  onReplaceMenu,
}: ManagementProps) {
  // Main tabs: flat navigation structure
  const [activeTab, setActiveTab] = useState<"Inventory" | "Categories" | "CSVUtility" | "AuditLogs">("Inventory");
  
  // State for Add Product Form
  const [showAddDishForm, setShowAddDishForm] = useState(false);
  const [dishName, setDishName] = useState("");
  const [dishPrice, setDishPrice] = useState<number>(0);
  const [dishCategory, setDishCategory] = useState<string>(categories[0]?.name || "Beverages");
  const [dishStock, setDishStock] = useState<number>(50);
  const [dishMax, setDishMax] = useState<number>(100);
  const [isStockEnabled, setIsStockEnabled] = useState(false);
  const [showAdvancedStock, setShowAdvancedStock] = useState(false);

  // State for Edit Product Form (Modal)
  const [showEditDishForm, setShowEditDishForm] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [editDishName, setEditDishName] = useState("");
  const [editDishPrice, setEditDishPrice] = useState<number>(0);
  const [editDishCategory, setEditDishCategory] = useState<string>("");
  const [editDishStock, setEditDishStock] = useState<number>(50);
  const [editDishMax, setEditDishMax] = useState<number>(100);
  const [isEditStockEnabled, setIsEditStockEnabled] = useState(false);
  const [showEditAdvancedStock, setShowEditAdvancedStock] = useState(false);

  // Bulk Selection States
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Inline editing state for Dishes
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editCategory, setEditCategory] = useState<string>("");
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  const [editMaxStock, setEditMaxStock] = useState<number>(100);

  // Category Builder State
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catColor, setCatColor] = useState("amber");

  // State for Edit Category Form (Modal)
  const [showEditCategoryForm, setShowEditCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatDesc, setEditCatDesc] = useState("");
  const [editCatColor, setEditCatColor] = useState("amber");

  // State for Custom Delete Confirmation Modals
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [bulkCategoriesToDelete, setBulkCategoriesToDelete] = useState<string[] | null>(null);
  const [bulkDishesToDelete, setBulkDishesToDelete] = useState<string[] | null>(null);

  // Search & Filter state variables
  const [dishSearchQuery, setDishSearchQuery] = useState("");
  const [dishCategoryFilter, setDishCategoryFilter] = useState("All");
  const [dishStockFilter, setDishStockFilter] = useState<"All" | "LowStock" | "OutOfStock" | "Unlimited">("All");
  const [categorySearchQuery, setCategorySearchQuery] = useState("");

  // CSV Import State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [csvImportMode, setCsvImportMode] = useState<"append" | "overwrite">("append");
  const [importLog, setImportLog] = useState<{ status: "success" | "error" | null; message: string }>({ status: null, message: "" });

  // Color options for categories
  const colorOptions = [
    { value: "amber", label: "Amber Yellow", badgeBg: "bg-amber-100 text-amber-800" },
    { value: "pink", label: "Blossom Pink", badgeBg: "bg-pink-100 text-pink-800" },
    { value: "emerald", label: "Emerald Green", badgeBg: "bg-emerald-100 text-emerald-800" },
    { value: "purple", label: "Lilac Purple", badgeBg: "bg-purple-100 text-purple-800" },
    { value: "blue", label: "Ocean Blue", badgeBg: "bg-blue-100 text-blue-800" },
    { value: "orange", label: "Sunset Orange", badgeBg: "bg-orange-100 text-orange-800" },
  ];

  // Core calculations for analytics
  const grossSales = auditLogs.reduce((acc, log) => acc + log.total, 0);
  const discountsGiven = auditLogs.reduce((acc, log) => acc + log.discount, 0);
  const netSales = grossSales - discountsGiven;
  const lowStockItems = menu.filter((item) => item.stock < 5);

  // Submissions
  const handleCreateDishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim() || dishPrice <= 0) return;

    const finalStock = isStockEnabled ? dishStock : 99999;
    const finalMax = isStockEnabled ? dishMax : 99999;

    onAddNewDish(dishName.trim(), dishPrice, dishCategory || categories[0]?.name || "Beverages", finalStock, finalMax);

    // Reset Form
    setDishName("");
    setDishPrice(0);
    setDishCategory(categories[0]?.name || "Beverages");
    setDishStock(50);
    setDishMax(100);
    setIsStockEnabled(false);
    setShowAdvancedStock(false);
    setShowAddDishForm(false);
  };

  const handleStartEditing = (item: MenuItem) => {
    setEditingDish(item);
    setEditDishName(item.name);
    setEditDishCategory(item.category || categories[0]?.name || "Beverages");
    setEditDishPrice(item.price);
    setEditDishStock(item.stock >= 99999 ? 50 : item.stock);
    setEditDishMax(item.maxStock >= 99999 ? 100 : item.maxStock);
    setIsEditStockEnabled(item.stock < 99999);
    setShowEditAdvancedStock(item.stock < 99999);
    setShowEditDishForm(true);
  };

  const handleEditDishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDish || !editDishName.trim() || editDishPrice <= 0) return;

    const finalStock = isEditStockEnabled ? editDishStock : 99999;
    const finalMax = isEditStockEnabled ? editDishMax : 99999;

    onUpdateMenuDish(editingDish.id, {
      name: editDishName.trim(),
      price: editDishPrice,
      category: editDishCategory,
      stock: finalStock,
      maxStock: finalMax,
    });

    // Reset & Close
    setShowEditDishForm(false);
    setEditingDish(null);
  };

  const handleSaveInlineEdit = (id: string) => {
    if (!editName.trim()) {
      alert("Product name cannot be empty.");
      return;
    }
    onUpdateMenuDish(id, {
      name: editName.trim(),
      category: editCategory,
      price: editPrice,
      stock: editStock,
      maxStock: editMaxStock,
    });
    setEditingDishId(null);
  };

  // Category Management Submissions
  const handleCreateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    // Check if category name already exists to prevent duplicate titles
    const exists = categories.some((c) => c.name.toLowerCase() === catName.trim().toLowerCase());
    if (exists) {
      alert("A category with this name already exists.");
      return;
    }

    onAddCategory(catName.trim(), catDesc.trim(), catColor);

    // Reset Form
    setCatName("");
    setCatDesc("");
    setCatColor("amber");
    setShowAddCategoryForm(false);
  };

  const handleStartEditingCategory = (cat: Category) => {
    setEditingCategory(cat);
    setEditCatName(cat.name);
    setEditCatDesc(cat.description || "");
    setEditCatColor(cat.color || "amber");
    setShowEditCategoryForm(true);
  };

  const handleEditCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCatName.trim()) return;
    onUpdateCategory(editingCategory.id, editCatName.trim(), editCatDesc.trim(), editCatColor);
    setShowEditCategoryForm(false);
    setEditingCategory(null);
  };

  // CSV Parsing Engine (RFC-4180 Compliant basic CSV parser)
  const parseCSV = (text: string): string[][] => {
    const result: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let entry = "";

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        row.push(entry.trim());
        entry = "";
      } else if ((char === "\r" || char === "\n") && !inQuotes) {
        if (char === "\r" && nextChar === "\n") {
          i++; // Skip LF in CRLF sequence
        }
        row.push(entry.trim());
        if (row.length > 0 && (row.length > 1 || row[0] !== "")) {
          result.push(row);
        }
        row = [];
        entry = "";
      } else {
        entry += char;
      }
    }
    if (entry || row.length > 0) {
      row.push(entry.trim());
      result.push(row);
    }
    return result;
  };

  // CSV Export utility
  const handleExportCSV = () => {
    try {
      const headers = ["id", "name", "price", "category", "stock", "maxStock"];
      const rows = menu.map((item) => [
        item.id,
        `"${item.name.replace(/"/g, '""')}"`, // escape quotes
        item.price.toString(),
        `"${item.category.replace(/"/g, '""')}"`,
        item.stock.toString(),
        item.maxStock.toString(),
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `cafe_menu_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("CSV Export failed", e);
      alert("CSV Export failed. Please check browser console.");
    }
  };

  // Helper validation for imported rows
  const validateAndConvertCsvRows = (rows: string[][]): MenuItem[] => {
    if (rows.length <= 1) {
      throw new Error("CSV file is empty or only contains headers.");
    }

    const headers = rows[0].map((h) => h.toLowerCase().trim());
    const idxName = headers.indexOf("name");
    const idxPrice = headers.indexOf("price");
    const idxCategory = headers.indexOf("category");
    const idxStock = headers.indexOf("stock");
    const idxMaxStock = headers.indexOf("maxstock");

    if (idxName === -1 || idxPrice === -1 || idxCategory === -1) {
      throw new Error("Missing required headers. CSV must include columns: 'name', 'price', and 'category'. Optional: 'stock', 'maxStock'.");
    }

    const validDishes: MenuItem[] = [];

    // Parse data rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 3) continue; // skip corrupted short lines

      const rawName = row[idxName]?.trim();
      const rawPrice = parseFloat(row[idxPrice]);
      const rawCategory = row[idxCategory]?.trim();

      if (!rawName) {
        throw new Error(`Row ${i + 1}: Dish name is empty.`);
      }
      if (isNaN(rawPrice) || rawPrice <= 0) {
        throw new Error(`Row ${i + 1} ('${rawName}'): Price must be a positive number (found '${row[idxPrice]}').`);
      }
      if (!rawCategory) {
        throw new Error(`Row ${i + 1} ('${rawName}'): Category is empty.`);
      }

      // Read stock fields with safe fallback defaults
      let stock = 99999;
      if (idxStock !== -1 && row[idxStock] !== undefined && row[idxStock] !== "") {
        const val = parseInt(row[idxStock], 10);
        if (!isNaN(val) && val >= 0) stock = val;
      }

      let maxStock = 99999;
      if (idxMaxStock !== -1 && row[idxMaxStock] !== undefined && row[idxMaxStock] !== "") {
        const val = parseInt(row[idxMaxStock], 10);
        if (!isNaN(val) && val > 0) maxStock = val;
      }

      // Form fully compliant MenuItem
      validDishes.push({
        id: `m-csv-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
        name: rawName,
        price: rawPrice,
        category: rawCategory,
        stock,
        maxStock,
      });
    }

    return validDishes;
  };

  // File drag & drop triggers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processCsvFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processCsvFile(e.target.files[0]);
    }
  };

  const processCsvFile = (file: File) => {
    setImportLog({ status: null, message: "" });
    if (!file.name.endsWith(".csv")) {
      setImportLog({ status: "error", message: "Invalid file type. Please upload a .csv file." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          throw new Error("Could not read file content.");
        }

        const parsedRows = parseCSV(text);
        const dishes = validateAndConvertCsvRows(parsedRows);

        // Ensure dynamic categories are created for any non-existent imported categories
        const importedCategories = Array.from(new Set(dishes.map((d) => d.category)));
        importedCategories.forEach((catName) => {
          const exists = categories.some((c) => c.name.toLowerCase() === catName.toLowerCase());
          if (!exists) {
            onAddCategory(catName, `Imported via spreadsheet`, "blue");
          }
        });

        // Apply to parent state based on import mode
        if (csvImportMode === "overwrite") {
          onReplaceMenu(dishes);
          setImportLog({
            status: "success",
            message: `Overwrite successful! Completely replaced menu with ${dishes.length} items from CSV file.`,
          });
        } else {
          onBulkAddMenu(dishes);
          setImportLog({
            status: "success",
            message: `Append successful! Loaded and added ${dishes.length} new items to the catalog.`,
          });
        }
      } catch (error: any) {
        setImportLog({
          status: "error",
          message: `Parsing failure: ${error.message || error}`,
        });
      }
    };
    reader.readAsText(file);
  };

  // Filtered menu based on search query, category selection, and stock filter
  const filteredMenu = menu.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(dishSearchQuery.toLowerCase()) ||
      (item.category || "").toLowerCase().includes(dishSearchQuery.toLowerCase());
    
    const matchesCategory = dishCategoryFilter === "All" || item.category === dishCategoryFilter;
    
    let matchesStock = true;
    if (dishStockFilter === "LowStock") {
      matchesStock = item.stock < 5 && item.stock < 99999;
    } else if (dishStockFilter === "OutOfStock") {
      matchesStock = item.stock === 0;
    } else if (dishStockFilter === "Unlimited") {
      matchesStock = item.stock >= 99999;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Filtered categories based on search query
  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
      (cat.description || "").toLowerCase().includes(categorySearchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6" id="management-control-tower">
      {/* Analytics Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Gross Sales Volume</span>
            <h4 className="text-2xl font-extrabold text-slate-950 mt-0.5">Rs. {grossSales.toFixed(2)}</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Net Business Revenue</span>
            <h4 className="text-2xl font-extrabold text-slate-950 mt-0.5">Rs. {netSales.toFixed(2)}</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Total Discounts Given</span>
            <h4 className="text-2xl font-extrabold text-slate-950 mt-0.5">Rs. {discountsGiven.toFixed(2)}</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Low-Stock Warnings</span>
            <h4 className="text-2xl font-extrabold text-slate-950 mt-0.5">{lowStockItems.length} Warnings</h4>
          </div>
        </div>
      </div>

      {/* Flat Navigation Tabs */}
      <div className="flex flex-wrap border-b border-slate-100 gap-1 sm:gap-2">
        <button
          onClick={() => setActiveTab("Inventory")}
          className={`px-4 sm:px-5 py-3 text-xs font-black border-b-2 cursor-pointer transition-all ${
            activeTab === "Inventory"
              ? "border-amber-600 text-amber-600 font-black"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Product Catalog & Stock
        </button>
        <button
          onClick={() => setActiveTab("Categories")}
          className={`px-4 sm:px-5 py-3 text-xs font-black border-b-2 cursor-pointer transition-all ${
            activeTab === "Categories"
              ? "border-amber-600 text-amber-600 font-black"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Category Builder
        </button>
        <button
          onClick={() => setActiveTab("CSVUtility")}
          className={`px-4 sm:px-5 py-3 text-xs font-black border-b-2 cursor-pointer transition-all ${
            activeTab === "CSVUtility"
              ? "border-amber-600 text-amber-600 font-black"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Bulk Add & CSV Utility
        </button>
        <button
          onClick={() => setActiveTab("AuditLogs")}
          className={`px-4 sm:px-5 py-3 text-xs font-black border-b-2 cursor-pointer transition-all ${
            activeTab === "AuditLogs"
              ? "border-amber-600 text-amber-600 font-black"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Shift Settlement Logs
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: PRODUCT CATALOG */}
        {activeTab === "Inventory" && (
          <motion.div
            key="inventory-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Dishes Catalog</h3>
                  <p className="text-xs text-slate-400">View and adjust item pricing or core storage inventory.</p>
                </div>
                <button
                  onClick={() => setShowAddDishForm(true)}
                  className="text-[11px] font-black bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                  id="btn-add-dish-trigger"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New Dish
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-5 p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="sm:col-span-6 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search dishes, drinks..."
                    value={dishSearchQuery}
                    onChange={(e) => setDishSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700"
                  />
                  {dishSearchQuery && (
                    <button
                      onClick={() => setDishSearchQuery("")}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={dishCategoryFilter}
                    onChange={(e) => setDishCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="All">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={dishStockFilter}
                    onChange={(e) => setDishStockFilter(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="All">All Stock</option>
                    <option value="LowStock">Low Stock (&lt; 5)</option>
                    <option value="OutOfStock">Out of Stock</option>
                    <option value="Unlimited">Unlimited Stock</option>
                  </select>
                </div>
              </div>

              {/* Bulk Actions Console */}
              {selectedDishIds.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-amber-900 bg-amber-200/50 px-2.5 py-1 rounded-full text-[10px]">
                      {selectedDishIds.length} Selected
                    </span>
                    <button
                      onClick={() => setSelectedDishIds([])}
                      className="text-[11px] text-amber-700 hover:text-amber-950 underline font-extrabold cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                    {/* Bulk Reassign Category */}
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-2xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Category:</span>
                      <select
                        onChange={(e) => {
                          const catName = e.target.value;
                          if (catName) {
                            selectedDishIds.forEach(id => {
                              onUpdateMenuDish(id, { category: catName });
                            });
                            setSelectedDishIds([]);
                          }
                        }}
                        className="bg-transparent border-none text-[10px] font-bold text-slate-700 focus:outline-none cursor-pointer max-w-[100px]"
                        defaultValue=""
                      >
                        <option value="" disabled>Move to...</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Bulk Set Stock Level */}
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-2xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Stock:</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="50"
                        id="bulk-dish-stock-qty"
                        className="w-10 border-none bg-transparent text-[11px] font-black text-slate-800 text-center focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          const inputEl = document.getElementById("bulk-dish-stock-qty") as HTMLInputElement;
                          if (inputEl) {
                            const val = parseInt(inputEl.value, 10);
                            if (!isNaN(val) && val >= 0) {
                              selectedDishIds.forEach(id => {
                                onUpdateMenuDish(id, { stock: val });
                              });
                              setSelectedDishIds([]);
                              inputEl.value = "";
                            }
                          }
                        }}
                        className="text-[10px] font-black text-amber-700 hover:text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        Set
                      </button>
                    </div>

                    {/* Bulk Delete */}
                    <button
                      onClick={() => {
                        setBulkDishesToDelete(selectedDishIds);
                      }}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-black px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Selected</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-2 w-8">
                        <input
                          type="checkbox"
                          checked={selectedDishIds.length === filteredMenu.length && filteredMenu.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDishIds(filteredMenu.map((d) => d.id));
                            } else {
                              setSelectedDishIds([]);
                            }
                          }}
                          className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-2">Dish Name</th>
                      <th className="py-3 px-2">Category</th>
                      <th className="py-3 px-2 text-right">Price (Rs.)</th>
                      <th className="py-3 px-2 text-center">In Stock</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50" id="dish-inventory-rows">
                    {filteredMenu.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                          No matching dishes or drinks found. Try adjusting your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredMenu.map((item) => {
                        const isEditing = editingDishId === item.id;
                        const isLowStock = item.stock < 5;
                        const isChecked = selectedDishIds.includes(item.id);

                        return (
                          <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors ${isChecked ? "bg-amber-50/20" : ""}`}>
                          <td className="py-3 px-2 w-8">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedDishIds((prev) => [...prev, item.id]);
                                } else {
                                  setSelectedDishIds((prev) => prev.filter((id) => id !== item.id));
                                }
                              }}
                              className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                            />
                          </td>
                           <td className="py-3 px-2 font-bold text-slate-800">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full max-w-[120px] bg-slate-100 border border-slate-200 p-1 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold text-slate-700"
                              />
                            ) : (
                              item.name
                            )}
                          </td>
                          <td className="py-3 px-2 text-slate-500 font-semibold">
                            {isEditing ? (
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="bg-slate-100 border border-slate-200 p-1 rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold text-slate-700 cursor-pointer"
                              >
                                {categories.map((cat) => (
                                  <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              item.category
                            )}
                          </td>
                          <td className="py-3 px-2 text-right font-bold text-slate-800">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.1"
                                value={editPrice}
                                onChange={(e) => setEditPrice(Math.max(0.1, Number(e.target.value)))}
                                className="w-16 bg-slate-100 border border-slate-200 p-1 text-right rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold text-slate-700"
                              />
                            ) : (
                              `Rs. ${item.price.toFixed(2)}`
                            )}
                          </td>
                          <td className="py-3 px-2 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1.5">
                                <input
                                  type="number"
                                  value={editStock === 99999 ? "" : editStock}
                                  placeholder="∞"
                                  onChange={(e) => {
                                    const val = e.target.value === "" ? 99999 : Math.max(0, Number(e.target.value));
                                    setEditStock(val);
                                  }}
                                  className="w-12 bg-slate-100 border border-slate-200 p-1 text-center rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold text-slate-700"
                                  title="Current Stock (leave blank for unlimited)"
                                />
                                <span className="text-slate-400 font-black">/</span>
                                <input
                                  type="number"
                                  value={editMaxStock === 99999 ? "" : editMaxStock}
                                  placeholder="∞"
                                  onChange={(e) => {
                                    const val = e.target.value === "" ? 99999 : Math.max(1, Number(e.target.value));
                                    setEditMaxStock(val);
                                  }}
                                  className="w-12 bg-slate-100 border border-slate-200 p-1 text-center rounded text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-bold text-slate-700"
                                  title="Max Limit (leave blank for unlimited)"
                                />
                              </div>
                            ) : (
                              item.stock >= 99999 ? (
                                <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  Yes
                                </span>
                              ) : (
                                <span
                                  className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                    isLowStock
                                      ? "bg-rose-50 text-rose-700 animate-pulse border border-rose-100"
                                      : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {item.stock} / {item.maxStock}
                                </span>
                              )
                            )}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isEditing ? (
                                <button
                                  onClick={() => handleSaveInlineEdit(item.id)}
                                  className="p-1 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 border border-emerald-200/50 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStartEditing(item)}
                                  className="p-1 bg-slate-50 text-slate-600 hover:text-amber-600 rounded-lg border border-slate-100 hover:border-slate-200 cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => onDeleteMenuDish(item.id)}
                                className="p-1 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-100 hover:border-slate-200 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Low stock alerts side bar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Stock Shortage Alert Monitor
                </h3>
                <div className="space-y-2.5" id="low-stock-panel-list">
                  {lowStockItems.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs font-semibold">
                      Inventory is fully stocked!
                    </div>
                  ) : (
                    lowStockItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 rounded-xl border border-rose-100/60 bg-rose-50/25 text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{item.name}</p>
                          <p className="text-[10px] text-rose-600 font-semibold mt-0.5">Critically low stock</p>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-rose-700 text-sm">{item.stock}</span>
                          <span className="text-[10px] text-slate-500"> / {item.maxStock}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: CATEGORY BUILDER */}
        {activeTab === "Categories" && (
          <motion.div
            key="categories-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-base">Category Builder</h3>
                  <p className="text-xs text-slate-400">Add, rename, or customize food & beverage categories in your menu.</p>
                </div>
                <button
                  onClick={() => setShowAddCategoryForm(true)}
                  className="text-[11px] font-black bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  Add Custom Category
                </button>
              </div>

              {/* Search Category Bar */}
              <div className="relative mb-5 max-w-md bg-slate-50/50 rounded-2xl p-2 border border-slate-100 flex items-center">
                <span className="pl-2.5 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  className="w-full pl-2.5 pr-4 py-1.5 bg-transparent text-xs font-semibold focus:outline-none text-slate-700"
                />
                {categorySearchQuery && (
                  <button
                    onClick={() => setCategorySearchQuery("")}
                    className="flex items-center px-2 text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Category Bulk Actions Bar */}
              {selectedCategoryIds.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-amber-900 bg-amber-200/50 px-2.5 py-1 rounded-full text-[10px]">
                      {selectedCategoryIds.length} Selected
                    </span>
                    <button
                      onClick={() => setSelectedCategoryIds([])}
                      className="text-[11px] text-amber-700 hover:text-amber-950 underline font-extrabold cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Bulk Change Color */}
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 shadow-2xs">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Set Color:</span>
                      <select
                        onChange={(e) => {
                          const colorVal = e.target.value;
                          if (colorVal) {
                            selectedCategoryIds.forEach(id => {
                              const cat = categories.find(c => c.id === id);
                              if (cat) {
                                onUpdateCategory(id, cat.name, cat.description || "", colorVal);
                              }
                            });
                            setSelectedCategoryIds([]);
                          }
                        }}
                        className="bg-transparent border-none text-[10px] font-bold text-slate-700 focus:outline-none cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled>Choose...</option>
                        {colorOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Bulk Delete Categories */}
                    <button
                      onClick={() => {
                        setBulkCategoriesToDelete(selectedCategoryIds);
                      }}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-black px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Selected</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Categories Grid Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                      <th className="py-3 px-2 w-8">
                        <input
                          type="checkbox"
                          checked={selectedCategoryIds.length === filteredCategories.length && filteredCategories.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategoryIds(filteredCategories.map((c) => c.id));
                            } else {
                              setSelectedCategoryIds([]);
                            }
                          }}
                          className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                      </th>
                      <th className="py-3 px-2">Category Tag</th>
                      <th className="py-3 px-2">Visual Color Preset</th>
                      <th className="py-3 px-2">Description</th>
                      <th className="py-3 px-2 text-center">Menu Items</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50" id="category-builder-rows">
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                          No matching categories found. Try adjusting your search query.
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((cat) => {
                        const itemCount = menu.filter((item) => item.category === cat.name).length;
                        const isChecked = selectedCategoryIds.includes(cat.id);

                        return (
                          <tr key={cat.id} className={`hover:bg-slate-50/50 transition-colors ${isChecked ? "bg-amber-50/20" : ""}`}>
                          <td className="py-3 px-2 w-8">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCategoryIds((prev) => [...prev, cat.id]);
                                } else {
                                  setSelectedCategoryIds((prev) => prev.filter((id) => id !== cat.id));
                                }
                              }}
                              className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-2 font-bold text-slate-800">
                            <span className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full bg-${cat.color || "amber"}-500`} />
                              {cat.name}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-slate-500 font-semibold">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] capitalize bg-${cat.color || "amber"}-50 text-${cat.color || "amber"}-700 border border-${cat.color || "amber"}-100`}>
                              {cat.color || "amber"}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-slate-400">
                            {cat.description || "No description provided"}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className="bg-slate-100 text-slate-600 font-extrabold px-2 py-0.5 rounded-full text-[10px]">
                              {itemCount} dishes
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleStartEditingCategory(cat)}
                                className="p-1 bg-slate-50 text-slate-600 hover:text-amber-600 rounded-lg border border-slate-100 hover:border-slate-200 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setCategoryToDelete(cat);
                                }}
                                className="p-1 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-100 hover:border-slate-200 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: BULK ADD & CSV UTILITY */}
        {activeTab === "CSVUtility" && (
          <motion.div
            key="csv-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="max-w-2xl mx-auto"
          >
            {/* CSV Import/Export Panel */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Spreadsheet CSV Operations</h3>
                <p className="text-xs text-slate-400">Import your menus directly or download backups to keep items synchronized.</p>
              </div>

              {/* Export Panel */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs">Export Dishes Catalog</h4>
                  <p className="text-[10px] text-slate-400">Export as a formatted spreadsheet file containing names, stocks, and pricing.</p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="text-xs font-black bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Import Options Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">CSV Loading Settings</label>
                  <div className="flex gap-1.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setCsvImportMode("append")}
                      className={`px-3 py-1 rounded-full font-bold cursor-pointer transition-all border ${
                        csvImportMode === "append"
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      Append Items
                    </button>
                    <button
                      type="button"
                      onClick={() => setCsvImportMode("overwrite")}
                      className={`px-3 py-1 rounded-full font-bold cursor-pointer transition-all border ${
                        csvImportMode === "overwrite"
                          ? "bg-rose-100 text-rose-800 border-rose-300"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      Overwrite Catalog
                    </button>
                  </div>
                </div>

                {/* Drag-and-Drop Dropzone Box */}
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${
                    dragActive
                      ? "border-amber-500 bg-amber-50/40"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".csv"
                    className="hidden"
                  />
                  <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs text-amber-600">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-700 text-xs">Drag and drop CSV sheet here</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">or click inside the box to browse local files</p>
                  </div>
                  <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 font-extrabold px-2 py-0.5 rounded-full">
                    Supports columns: name, price, category, stock, maxStock
                  </span>
                </div>

                {/* Import Status Messages */}
                {importLog.status && (
                  <div
                    className={`p-3 rounded-xl border text-xs font-bold flex gap-2 items-start ${
                      importLog.status === "success"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                        : "bg-rose-50 text-rose-800 border-rose-100"
                    }`}
                  >
                    {importLog.status === "success" ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{importLog.message}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: TRANSATION AUDIT LOGS */}
        {activeTab === "AuditLogs" && (
          <motion.div
            key="auditlogs-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">Check Settlement Audit Trails</h3>
                <p className="text-xs text-slate-400">Verifiable transactional ledger of all cash, card, and credit tab settlements.</p>
              </div>
              <ClipboardList className="w-5 h-5 text-amber-600" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-2">Timestamp</th>
                    <th className="py-3 px-2">Table Context</th>
                    <th className="py-3 px-2 text-right">Tax (Rs.)</th>
                    <th className="py-3 px-2 text-right">Promo Discount (Rs.)</th>
                    <th className="py-3 px-2 text-right">Settled Amount (Rs.)</th>
                    <th className="py-3 px-2 text-center">Settlement Method</th>
                    <th className="py-3 px-2 text-right">Debtor Account</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50" id="sales-audit-rows">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs font-semibold">
                        No check transactions registered in this shift yet.
                      </td>
                    </tr>
                  ) : (
                    [...auditLogs].reverse().map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-2 text-slate-400 font-semibold">{log.timestamp}</td>
                        <td className="py-3 px-2 font-bold text-slate-800">{log.tableName}</td>
                        <td className="py-3 px-2 text-right text-slate-500 font-semibold">Rs. {log.tax.toFixed(2)}</td>
                        <td className="py-3 px-2 text-right text-rose-600 font-semibold">
                          {log.discount > 0 ? `-Rs. ${log.discount.toFixed(2)}` : "-"}
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-slate-900">Rs. {log.total.toFixed(2)}</td>
                        <td className="py-3 px-2 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider ${
                              log.paymentMethod === "Cash"
                                ? "bg-emerald-50 text-emerald-700"
                                : log.paymentMethod === "Card"
                                ? "bg-sky-50 text-sky-700"
                                : "bg-purple-50 text-purple-700"
                            }`}
                          >
                            {log.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-semibold text-slate-600">
                          {log.customerName || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Product Dialog Modal */}
      <AnimatePresence>
        {showAddDishForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 text-xs"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-100 shadow-xl space-y-4"
              id="add-dish-modal"
            >
              <div>
                <h4 className="font-extrabold text-slate-800 text-lg">Add Menu Product</h4>
                <p className="text-slate-400 text-xs mt-0.5">Introduce a new food or beverage product item.</p>
              </div>

              <form onSubmit={handleCreateDishSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Dish/Drink Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter name (e.g., Iced Matcha Latte)"
                    value={dishName}
                    onChange={(e) => setDishName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-semibold"
                    id="input-dish-name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                      Menu Category
                    </label>
                    <select
                      value={dishCategory}
                      onChange={(e) => setDishCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-semibold"
                      id="select-dish-category"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                      Sale Price (Rs.)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      placeholder="e.g., 5.95"
                      value={dishPrice || ""}
                      onChange={(e) => setDishPrice(Math.max(0.1, Number(e.target.value)))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-bold"
                      id="input-dish-price"
                      required
                    />
                  </div>
                </div>

                {/* Track Stock Toggle - Enabled by Default */}
                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-700 block">Track Stock & Inventory</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">Keep track of item counts & limits automatically.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isStockEnabled}
                      onChange={(e) => {
                        setIsStockEnabled(e.target.checked);
                        if (e.target.checked) {
                          setDishStock(50);
                          setDishMax(100);
                        } else {
                          setDishStock(99999);
                          setDishMax(99999);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {/* Advanced Settings Dropdown */}
                {isStockEnabled && (
                  <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/30">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedStock(!showAdvancedStock)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 transition-colors text-left cursor-pointer border-none focus:outline-none"
                    >
                      <span className="text-[11px] font-black text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        Advanced Stock Limits
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showAdvancedStock ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {showAdvancedStock && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="p-3 space-y-3 border-t border-slate-100 bg-white"
                        >
                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                                Opening Stock Qty
                              </label>
                              <input
                                type="number"
                                placeholder="Default: 50"
                                value={dishStock === 99999 ? "" : dishStock}
                                onChange={(e) => setDishStock(Math.max(0, Number(e.target.value)))}
                                className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                                Max Threshold Limit
                              </label>
                              <input
                                type="number"
                                placeholder="Default: 100"
                                value={dishMax === 99999 ? "" : dishMax}
                                onChange={(e) => setDishMax(Math.max(1, Number(e.target.value)))}
                                className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-bold"
                              />
                            </div>
                          </div>
                          <p className="text-[9px] text-slate-400 font-semibold leading-normal">
                            Customize initial levels and safety alerts. Low stock triggers are enabled below 5 items.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddDishForm(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-sm cursor-pointer transition-colors"
                  >
                    Add Product
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Product Dialog Modal */}
      <AnimatePresence>
        {showEditDishForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 text-xs"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-100 shadow-xl space-y-4"
              id="edit-dish-modal"
            >
              <div>
                <h4 className="font-extrabold text-slate-800 text-lg">Edit Menu Product</h4>
                <p className="text-slate-400 text-xs mt-0.5">Modify the selected food or beverage product item.</p>
              </div>

              <form onSubmit={handleEditDishSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Dish/Drink Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter name (e.g., Iced Matcha Latte)"
                    value={editDishName}
                    onChange={(e) => setEditDishName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-semibold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                      Menu Category
                    </label>
                    <select
                      value={editDishCategory}
                      onChange={(e) => setEditDishCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-semibold"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                      Sale Price (Rs.)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      placeholder="e.g., 5.95"
                      value={editDishPrice || ""}
                      onChange={(e) => setEditDishPrice(Math.max(0.1, Number(e.target.value)))}
                      className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-bold"
                      required
                    />
                  </div>
                </div>

                {/* Track Stock Toggle */}
                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-700 block">Track Stock & Inventory</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">Keep track of item counts & limits automatically.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEditStockEnabled}
                      onChange={(e) => {
                        setIsEditStockEnabled(e.target.checked);
                        if (e.target.checked) {
                          setEditDishStock(50);
                          setEditDishMax(100);
                        } else {
                          setEditDishStock(99999);
                          setEditDishMax(99999);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {/* Advanced Settings Dropdown */}
                {isEditStockEnabled && (
                  <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/30">
                    <button
                      type="button"
                      onClick={() => setShowEditAdvancedStock(!showEditAdvancedStock)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 transition-colors text-left cursor-pointer border-none focus:outline-none"
                    >
                      <span className="text-[11px] font-black text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        Advanced Stock Limits
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showEditAdvancedStock ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {showEditAdvancedStock && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15 }}
                          className="p-3 space-y-3 border-t border-slate-100 bg-white"
                        >
                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                                Stock Quantity
                              </label>
                              <input
                                type="number"
                                placeholder="Default: 50"
                                value={editDishStock === 99999 ? "" : editDishStock}
                                onChange={(e) => setEditDishStock(Math.max(0, Number(e.target.value)))}
                                className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-bold"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                                Max Limit
                              </label>
                              <input
                                type="number"
                                placeholder="Default: 100"
                                value={editDishMax === 99999 ? "" : editDishMax}
                                onChange={(e) => setEditDishMax(Math.max(1, Number(e.target.value)))}
                                className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-bold"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditDishForm(false);
                      setEditingDish(null);
                    }}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-sm cursor-pointer transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Custom Category Modal */}
      <AnimatePresence>
        {showAddCategoryForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 text-xs"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-100 shadow-xl space-y-4"
              id="add-category-modal"
            >
              <div>
                <h4 className="font-extrabold text-slate-800 text-lg">Create Custom Category</h4>
                <p className="text-slate-400 text-xs mt-0.5">Define a new category to classify and filter your dishes.</p>
              </div>

              <form onSubmit={handleCreateCategorySubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter name (e.g., Seasonal Specials)"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description (e.g., Summer cold drinks)"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Visual Accent Color
                  </label>
                  <select
                    value={catColor}
                    onChange={(e) => setCatColor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-semibold"
                  >
                    {colorOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryForm(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-sm cursor-pointer transition-colors"
                  >
                    Build Category
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Custom Category Modal */}
      <AnimatePresence>
        {showEditCategoryForm && editingCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 text-xs"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-100 shadow-xl space-y-4"
              id="edit-category-modal"
            >
              <div>
                <h4 className="font-extrabold text-slate-800 text-lg">Edit Menu Category</h4>
                <p className="text-slate-400 text-xs mt-0.5">Modify the classification settings for this category.</p>
              </div>

              <form onSubmit={handleEditCategorySubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter name (e.g., Seasonal Specials)"
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description"
                    value={editCatDesc}
                    onChange={(e) => setEditCatDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Visual Accent Color
                  </label>
                  <select
                    value={editCatColor}
                    onChange={(e) => setEditCatColor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-semibold"
                  >
                    {colorOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditCategoryForm(false);
                      setEditingCategory(null);
                    }}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-sm cursor-pointer transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Single Category Delete Confirmation Modal */}
      <AnimatePresence>
        {categoryToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 text-xs"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-100 shadow-xl space-y-4"
              id="confirm-delete-category-modal"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base">Delete Category?</h4>
                  <p className="text-slate-500 text-xs mt-1">
                    Are you sure you want to delete the category <span className="font-bold text-slate-700">"{categoryToDelete.name}"</span>?
                  </p>
                </div>
              </div>

              <div className="bg-rose-50/50 border border-rose-100/60 rounded-xl p-3 text-rose-800 text-[11px] font-medium leading-relaxed">
                ⚠️ All existing dishes in this category will be automatically reassigned to <span className="font-bold">General</span>. This action cannot be undone.
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoryToDelete(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteCategory(categoryToDelete.id);
                    setCategoryToDelete(null);
                  }}
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm cursor-pointer transition-colors"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Bulk Categories Delete Confirmation Modal */}
      <AnimatePresence>
        {bulkCategoriesToDelete && bulkCategoriesToDelete.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 text-xs"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-100 shadow-xl space-y-4"
              id="confirm-bulk-delete-categories-modal"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base">Delete Selected Categories?</h4>
                  <p className="text-slate-500 text-xs mt-1">
                    Are you sure you want to delete the <span className="font-black text-rose-700">{bulkCategoriesToDelete.length}</span> selected categories?
                  </p>
                </div>
              </div>

              <div className="bg-rose-50/50 border border-rose-100/60 rounded-xl p-3 text-rose-800 text-[11px] font-medium leading-relaxed">
                ⚠️ All dishes belonging to these categories will be automatically reassigned to <span className="font-bold">General</span>. This action cannot be undone.
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setBulkCategoriesToDelete(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteCategories) {
                      onDeleteCategories(bulkCategoriesToDelete);
                    } else {
                      bulkCategoriesToDelete.forEach(id => {
                        onDeleteCategory(id);
                      });
                    }
                    setSelectedCategoryIds([]);
                    setBulkCategoriesToDelete(null);
                  }}
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm cursor-pointer transition-colors"
                >
                  Yes, Delete All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Bulk Dishes Delete Confirmation Modal */}
      <AnimatePresence>
        {bulkDishesToDelete && bulkDishesToDelete.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 text-xs"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-100 shadow-xl space-y-4"
              id="confirm-bulk-delete-dishes-modal"
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-base">Delete Selected Dishes?</h4>
                  <p className="text-slate-500 text-xs mt-1">
                    Are you sure you want to permanently delete the <span className="font-black text-rose-700">{bulkDishesToDelete.length}</span> selected dishes?
                  </p>
                </div>
              </div>

              <div className="bg-rose-50/50 border border-rose-100/60 rounded-xl p-3 text-rose-800 text-[11px] font-medium leading-relaxed">
                ⚠️ This will permanently erase the selected food/drink items from the menu catalog database. This action cannot be undone.
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setBulkDishesToDelete(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    bulkDishesToDelete.forEach(id => onDeleteMenuDish(id));
                    setSelectedDishIds([]);
                    setBulkDishesToDelete(null);
                  }}
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-sm cursor-pointer transition-colors"
                >
                  Yes, Delete All
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
