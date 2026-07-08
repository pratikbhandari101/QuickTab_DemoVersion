"use client";

import React, { useState, useEffect } from "react";
import { MenuItem, Table, Category } from "@/lib/types";
import {
  Search,
  ShoppingBag,
  AlertTriangle,
  Sparkles,
  Coffee,
  Cake,
  UtensilsCrossed,
  IceCream,
  ArrowLeft,
  ChevronRight,
  Layers,
  HelpCircle,
  Plus,
  ArrowLeftRight,
  Move,
  GitMerge,
  Check,
  X,
  Undo2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface POSBillingProps {
  menu: MenuItem[];
  categories: Category[];
  onAddToTableCart: (item: MenuItem, qty: number) => void;
  activeTableName: string;
  tables: Table[];
  activeTable: Table | null;
  onTransferTable: (fromId: string, toId: string) => void;
  onSwapTables: (idA: string, idB: string) => void;
  onMergeTables: (fromId: string, toId: string) => void;
}

export default function POSBilling({
  menu,
  categories,
  onAddToTableCart,
  activeTableName,
  tables,
  activeTable,
  onTransferTable,
  onSwapTables,
  onMergeTables,
}: POSBillingProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Table operations panel states
  const [showTransferPanel, setShowTransferPanel] = useState(false);
  const [actionType, setActionType] = useState<"transfer" | "swap" | "merge">("transfer");
  const [targetTableId, setTargetTableId] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Reset local filters and states when active table changes
  useEffect(() => {
    setSelectedCategory(null);
    setSearchQuery("");
    setShowTransferPanel(false);
    setTargetTableId("");
    setSuccessMessage("");
  }, [activeTableName]);

  const hasActiveTable = activeTableName !== "Unselected" && activeTable !== null;

  // Dynamically map categories with correct icons, colors, and descriptions
  const mappedCategories = categories.map((cat) => {
    // Determine icon based on name
    let IconComponent = Coffee;
    const nameLower = cat.name.toLowerCase();
    if (nameLower.includes("beverage") || nameLower.includes("drink") || nameLower.includes("coffee") || nameLower.includes("tea")) {
      IconComponent = Coffee;
    } else if (nameLower.includes("pastry") || nameLower.includes("bakery") || nameLower.includes("bread") || nameLower.includes("cake")) {
      IconComponent = Cake;
    } else if (nameLower.includes("main") || nameLower.includes("food") || nameLower.includes("lunch") || nameLower.includes("meal")) {
      IconComponent = UtensilsCrossed;
    } else if (nameLower.includes("dessert") || nameLower.includes("sweet") || nameLower.includes("ice cream") || nameLower.includes("shake")) {
      IconComponent = IceCream;
    } else {
      IconComponent = Sparkles; // Fallback icon for custom categories!
    }

    // Determine colors based on category color field or cyclic index
    let bgColor = "bg-amber-50 text-amber-600 border-amber-100/70 hover:border-amber-300";
    let iconBg = "bg-amber-100 text-amber-700";

    const color = cat.color || "amber";
    if (color === "amber") {
      bgColor = "bg-amber-50 text-amber-600 border-amber-100/70 hover:border-amber-300";
      iconBg = "bg-amber-100 text-amber-700";
    } else if (color === "pink" || color === "rose") {
      bgColor = "bg-pink-50 text-pink-600 border-pink-100/70 hover:border-pink-300";
      iconBg = "bg-pink-100 text-pink-700";
    } else if (color === "emerald" || color === "green") {
      bgColor = "bg-emerald-50 text-emerald-600 border-emerald-100/70 hover:border-emerald-300";
      iconBg = "bg-emerald-100 text-emerald-700";
    } else if (color === "purple" || color === "violet") {
      bgColor = "bg-purple-50 text-purple-600 border-purple-100/70 hover:border-purple-300";
      iconBg = "bg-purple-100 text-purple-700";
    } else if (color === "blue" || color === "sky" || color === "indigo") {
      bgColor = "bg-blue-50 text-blue-600 border-blue-100/70 hover:border-blue-300";
      iconBg = "bg-blue-100 text-blue-700";
    } else if (color === "orange" || color === "yellow") {
      bgColor = "bg-orange-50 text-orange-600 border-orange-100/70 hover:border-orange-300";
      iconBg = "bg-orange-100 text-orange-700";
    } else {
      bgColor = "bg-slate-50 text-slate-600 border-slate-100/70 hover:border-slate-300";
      iconBg = "bg-slate-100 text-slate-700";
    }

    return {
      id: cat.name, // We use the category name for matching item.category
      name: cat.name,
      icon: IconComponent,
      desc: cat.description || `Delicious selection of ${cat.name}`,
      bgColor,
      iconBg,
    };
  });

  // We are viewing the product list if a category is selected OR a search query is entered
  const isViewingProducts = selectedCategory !== null || searchQuery.trim().length > 0;

  // Filter menu items based on selected category and search terms
  const filteredMenu = menu.filter((item) => {
    // 1. Category Filter
    const matchesCategory =
      selectedCategory === null ||
      selectedCategory === "All" ||
      searchQuery.trim().length > 0 ||
      item.category === selectedCategory;

    // 2. Robust Search (Multi-term, case-insensitive)
    const searchTerms = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matchesSearch =
      searchTerms.length === 0 ||
      searchTerms.every(
        (term) =>
          item.name.toLowerCase().includes(term) ||
          item.category.toLowerCase().includes(term)
      );

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-full min-h-[580px]" id="pos-billing-panel">
      
      {/* FLOW SYSTEM CONTAINER */}
      {!hasActiveTable ? (
        /* STEP 1: Select Seating/Table */
        <div className="flex-grow flex flex-col items-center justify-center text-center p-6 space-y-6" id="flow-step-1">
          {/* Visual Progress Steps Bar */}
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 max-w-sm w-full mx-auto mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
            <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Step 1</span>
            <span>Select Seating & Table</span>
          </div>

          <div className="relative">
            {/* Table Mock Illustration */}
            <div className="w-24 h-24 bg-slate-100 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center relative mx-auto">
              <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner animate-pulse">
                <Coffee className="w-6 h-6" />
              </div>
              {/* Chairs around the table mock */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-3 bg-slate-200 rounded-t-sm border border-slate-300" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-3 bg-slate-200 rounded-b-sm border border-slate-300" />
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-5 bg-slate-200 rounded-l-sm border border-slate-300" />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-5 bg-slate-200 rounded-r-sm border border-slate-300" />
            </div>
            <div className="absolute -right-1 bottom-0 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white shadow text-xs font-black animate-bounce">
              1
            </div>
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Lock an Order to a Table</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              To place an order or select dishes, please choose any table from the interactive <span className="text-amber-700">Floor Plan layout on the left</span>.
            </p>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 max-w-sm text-[11px] text-amber-800 font-bold flex gap-2 items-start text-left">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>The hybrid workflow will automatically save active items, manage checkout limits, and trace logs to your designated table.</span>
          </div>
        </div>
      ) : (
        /* STEP 2 & 3: CATEGORY & PRODUCT SELECTION */
        <div className="flex-grow flex flex-col h-full justify-between" id="flow-steps-active">
          <div>
            {/* Active Table Badge & Table Action triggers */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                    {isViewingProducts ? "Step 2: Products" : "Step 2: Categories"}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">of 2 Steps</span>
                </div>
                <h3 className="font-extrabold text-slate-800 text-base tracking-tight flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  {isViewingProducts ? `${selectedCategory || "Search"} Catalog` : "Product Catalog"}
                </h3>
              </div>
              
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {/* Moved Table Actions Button from Order Cart */}
                <button
                  onClick={() => setShowTransferPanel(!showTransferPanel)}
                  className={`text-[11px] font-black px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border ${
                    showTransferPanel
                      ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                      : "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-100"
                  }`}
                  title="Transfer, Swap or Merge tables and bills"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Table Actions</span>
                </button>
                
                <span className="inline-block text-xs font-black text-slate-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                  📍 {activeTableName}
                </span>
              </div>
            </div>

            {/* Table Actions Slider Panel */}
            <AnimatePresence>
              {showTransferPanel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden bg-amber-50/60 border border-amber-100/70 rounded-2xl p-4 mb-4 space-y-3.5 text-xs shadow-inner"
                  id="table-action-panel-billing"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                      <Move className="w-3.5 h-3.5" /> Table & Bill Operations
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowTransferPanel(false);
                        setTargetTableId("");
                      }}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Action Type tabs */}
                  <div className="grid grid-cols-3 gap-1 bg-white p-0.5 border border-slate-150 rounded-xl shadow-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setActionType("transfer");
                        setTargetTableId("");
                      }}
                      className={`py-2 rounded-lg text-[10px] font-black cursor-pointer transition-all flex items-center justify-center gap-1 ${
                        actionType === "transfer" ? "bg-amber-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Move className="w-3.5 h-3.5" />
                      Transfer
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActionType("swap");
                        setTargetTableId("");
                      }}
                      className={`py-2 rounded-lg text-[10px] font-black cursor-pointer transition-all flex items-center justify-center gap-1 ${
                        actionType === "swap" ? "bg-amber-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      Swap
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActionType("merge");
                        setTargetTableId("");
                      }}
                      className={`py-2 rounded-lg text-[10px] font-black cursor-pointer transition-all flex items-center justify-center gap-1 ${
                        actionType === "merge" ? "bg-amber-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <GitMerge className="w-3.5 h-3.5" />
                      Merge
                    </button>
                  </div>

                  {/* Target Table Dropdown Selector */}
                  <div>
                    <label className="text-[9px] font-bold text-amber-900 block mb-1">Select Target Table</label>
                    <select
                      value={targetTableId}
                      onChange={(e) => setTargetTableId(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-750 font-bold cursor-pointer shadow-xs"
                    >
                      <option value="">
                        {actionType === "transfer"
                          ? "-- Choose vacant destination table --"
                          : actionType === "merge"
                          ? "-- Choose occupied destination table --"
                          : "-- Choose destination table to swap with --"}
                      </option>
                      {tables
                        .filter((t) => {
                          if (t.id === activeTable.id) return false;
                          if (actionType === "transfer") {
                            return t.currentCart.length === 0; // vacant only
                          }
                          if (actionType === "merge") {
                            return t.currentCart.length > 0; // occupied only
                          }
                          return true; // swap allows all
                        })
                        .map((t) => {
                          const isVacant = t.currentCart.length === 0;
                          const cartPrice = t.currentCart.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);
                          const itemsCount = t.currentCart.reduce((acc, item) => acc + item.quantity, 0);
                          const labelSuffix = isVacant
                            ? "(Vacant)"
                            : `(Occupied - ${itemsCount} items, Rs. ${cartPrice.toFixed(2)})`;
                          return (
                            <option key={t.id} value={t.id}>
                              {t.name} {labelSuffix}
                            </option>
                          );
                        })}
                    </select>

                    {/* Validation Info helper if no tables match criteria */}
                    {tables.filter((t) => {
                      if (t.id === activeTable.id) return false;
                      if (actionType === "transfer") return t.currentCart.length === 0;
                      if (actionType === "merge") return t.currentCart.length > 0;
                      return true;
                    }).length === 0 && (
                      <p className="text-[9.5px] text-rose-600 font-semibold mt-1">
                        {actionType === "transfer" && "⚠️ No vacant tables available to transfer this order."}
                        {actionType === "merge" && "⚠️ No other occupied tables are available to merge with."}
                      </p>
                    )}
                  </div>

                  {/* Guidance and Confirmation Info Alert */}
                  {targetTableId && (
                    <div className="bg-white/90 border border-amber-100 p-2.5 rounded-lg text-[10px] text-slate-600 font-semibold space-y-1">
                      {actionType === "transfer" && (
                        <p>
                          <b>Transfer:</b> Move all order items from <span className="font-bold text-amber-700">{activeTable.name}</span> to{" "}
                          <span className="font-bold text-amber-700">
                            {tables.find((t) => t.id === targetTableId)?.name}
                          </span>
                          . {activeTable.name} will become vacant.
                        </p>
                      )}
                      {actionType === "swap" && (
                        <p>
                          <b>Swap:</b> Swap active order draft and customer status between{" "}
                          <span className="font-bold text-amber-700">{activeTable.name}</span> and{" "}
                          <span className="font-bold text-amber-700">
                            {tables.find((t) => t.id === targetTableId)?.name}
                          </span>
                          .
                        </p>
                      )}
                      {actionType === "merge" && (
                        <p>
                          <b>Merge Bills:</b> Combine all items from <span className="font-bold text-amber-700">{activeTable.name}</span> into{" "}
                          <span className="font-bold text-amber-700">
                            {tables.find((t) => t.id === targetTableId)?.name}
                          </span>
                          's bill. {activeTable.name} will be set to vacant.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    type="button"
                    disabled={
                      !targetTableId ||
                      (actionType === "transfer" && activeTable.currentCart.length === 0) ||
                      (actionType === "merge" && activeTable.currentCart.length === 0)
                    }
                    onClick={() => {
                      if (!targetTableId) return;
                      const targetName = tables.find(t => t.id === targetTableId)?.name || "Target Table";
                      if (actionType === "transfer") {
                        onTransferTable(activeTable.id, targetTableId);
                        setSuccessMessage(`Successfully transferred order to ${targetName}!`);
                      } else if (actionType === "swap") {
                        onSwapTables(activeTable.id, targetTableId);
                        setSuccessMessage(`Successfully swapped orders with ${targetName}!`);
                      } else if (actionType === "merge") {
                        onMergeTables(activeTable.id, targetTableId);
                        setSuccessMessage(`Successfully merged bills into ${targetName}!`);
                      }
                      setShowTransferPanel(false);
                      setTargetTableId("");
                      setTimeout(() => setSuccessMessage(""), 3000);
                    }}
                    className={`w-full text-xs font-black py-2 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 ${
                      !targetTableId ||
                      ((actionType === "transfer" || actionType === "merge") && activeTable.currentCart.length === 0)
                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                        : "bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                    }`}
                  >
                    Confirm and Apply Operations
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Action Notification */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 mb-4 text-xs flex items-center gap-2 text-emerald-850"
                >
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick search bar */}
            <div className="relative w-full mb-4">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search coffee, pastries, mains, desserts (supports letters & words)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-14 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-slate-800 font-semibold"
                id="input-menu-search-flow"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 hover:text-slate-600 cursor-pointer bg-slate-100 px-1.5 py-0.5 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>

            <div>
              {!isViewingProducts ? (
                /* STEP 2: INITIAL CATEGORY CARDS GRID (When no pill is selected or typed) */
                <motion.div
                  key="categories"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.12 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
                    <span>Choose a category to display menu items:</span>
                    <button
                      onClick={() => setSelectedCategory("All")}
                      className="text-amber-600 hover:underline flex items-center gap-0.5 text-[11px] font-black cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      View All Products
                    </button>
                  </div>

                  {/* Large visual cards for Category selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="category-cards-grid">
                    {mappedCategories.map((cat) => {
                      const count = menu.filter((item) => item.category === cat.id).length;
                      const CatIcon = cat.icon;

                      return (
                        <motion.button
                          key={cat.id}
                          whileHover={{ scale: 1.015 }}
                          whileTap={{ scale: 0.985 }}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`flex items-start text-left p-4 rounded-2xl border transition-all cursor-pointer ${cat.bgColor}`}
                          id={`cat-card-${cat.id}`}
                        >
                          <div className={`p-3 rounded-xl shrink-0 mr-4 ${cat.iconBg}`}>
                            <CatIcon className="w-5 h-5 font-bold" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-slate-800 text-sm tracking-tight">{cat.name}</h4>
                              <span className="text-[10px] bg-white border border-slate-100 text-slate-500 font-extrabold px-1.5 py-0.5 rounded-full">
                                {count} items
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-tight font-semibold">
                              {cat.desc}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                /* STEP 3: PRODUCTS GRID LIST WITH ACTIVE PILTER INDICATOR */
                <motion.div
                  key="products"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.12 }}
                  className="space-y-4"
                >
                  {/* Category Header with Back Button */}
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl">
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setSearchQuery("");
                      }}
                      className="text-xs text-slate-600 hover:text-slate-800 font-extrabold flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to Category Cards
                    </button>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Filtered Items</span>
                      <span className="text-xs font-black text-slate-700 font-mono">
                        {filteredMenu.length} dishes found
                      </span>
                    </div>
                  </div>

                  {/* Menu Grid */}
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 overflow-y-auto max-h-[420px] pr-1.5"
                    id="menu-items-grid-flow"
                  >
                    {filteredMenu.length === 0 ? (
                      <div className="col-span-full py-16 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <HelpCircle className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-700 font-bold text-sm">No dishes found matching criteria</p>
                          <p className="text-[11px] text-slate-400 font-semibold">Try another search term or click below to return to the category list.</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedCategory(null);
                            setSearchQuery("");
                          }}
                          className="text-xs font-black text-amber-600 hover:text-amber-700 cursor-pointer bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100"
                        >
                          Back to Category Grid
                        </button>
                      </div>
                    ) : (
                      filteredMenu.map((item) => {
                        const isOutOfStock = item.stock === 0;
                        const isLowStock = item.stock > 0 && item.stock < 5;

                        return (
                          <button
                            key={item.id}
                            disabled={isOutOfStock}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isOutOfStock) {
                                onAddToTableCart(item, 1);
                              }
                            }}
                            className={`border rounded-xl p-3.5 flex flex-col justify-between transition-all duration-150 text-left w-full group ${
                              isOutOfStock
                                ? "border-slate-100 bg-slate-50/50 opacity-60 cursor-not-allowed"
                                : "border-slate-150 hover:border-amber-500 hover:shadow-md hover:scale-[1.015] active:scale-[0.985] bg-white cursor-pointer"
                            }`}
                            id={`item-card-flow-${item.id}`}
                          >
                            <div className="w-full">
                              <div className="flex justify-between items-start gap-1.5">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                  {item.category}
                                </span>
                                {isOutOfStock ? (
                                  <span className="bg-slate-100 text-slate-500 font-extrabold px-1.5 py-0.5 rounded text-[8px] uppercase">
                                    Sold Out
                                  </span>
                                ) : isLowStock ? (
                                  <span className="bg-amber-50 border border-amber-200 text-amber-700 font-extrabold px-1.5 py-0.5 rounded text-[8px] uppercase flex items-center gap-0.5">
                                    <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                                    Only {item.stock} left
                                  </span>
                                ) : (
                                  <span className="bg-emerald-50 border border-emerald-150 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded text-[8px] uppercase">
                                    {item.stock >= 99999 ? "In Stock" : `Stock: ${item.stock}`}
                                  </span>
                                )}
                              </div>

                              <h4 className="font-bold text-slate-800 text-xs mt-1.5 leading-tight tracking-tight">
                                {item.name}
                              </h4>
                              <p className="text-sm font-extrabold text-slate-900 mt-1 font-mono">
                                Rs. {item.price.toFixed(2)}
                              </p>
                            </div>

                            <div className="mt-3.5 pt-2.5 border-t border-slate-50 flex items-center justify-between text-[10px] w-full">
                              <span className="text-[9px] text-slate-400 font-bold uppercase">
                                Limit: {item.maxStock >= 99999 ? "∞" : item.maxStock}
                              </span>
                              {!isOutOfStock ? (
                                <span className="text-amber-600 font-extrabold flex items-center gap-0.5 group-hover:text-amber-700 transition-colors">
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 font-bold">Sold Out</span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Flow Assistance Footprint helper */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold font-mono">
            <span>Flow State Engine Active</span>
            <span className="text-slate-300">|</span>
            <span className="text-amber-600">Locked to {activeTableName}</span>
          </div>
        </div>
      )}
    </div>
  );
}
