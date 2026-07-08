"use client";

import React, { useState } from "react";
import { Table, CreditCustomer } from "@/lib/types";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Receipt,
  Percent,
  DollarSign,
  Wallet,
  AlertCircle,
  CheckCircle,
  Move,
  ArrowLeftRight,
  GitMerge,
  Sparkles,
  Check,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface POSCartProps {
  activeTable: Table | null;
  onUpdateCartItemQty: (menuItemId: string, change: number) => void;
  onRemoveCartItem: (menuItemId: string) => void;
  onHoldOrder: () => void;
  onSimulateBill: () => void;
  onCompleteCheckout: (
    paymentMethod: "Cash" | "Card" | "Credit Ledger",
    customerName?: string,
    customerId?: string,
    discountAmount?: number
  ) => void;
  customers: CreditCustomer[];
}

export default function POSCart({
  activeTable,
  onUpdateCartItemQty,
  onRemoveCartItem,
  onHoldOrder,
  onSimulateBill,
  onCompleteCheckout,
  customers,
}: POSCartProps) {
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Card" | "Credit Ledger">("Cash");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [discountType, setDiscountType] = useState<"Percent" | "Fixed">("Percent");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);

  if (!activeTable) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm h-full flex flex-col items-center justify-center text-center text-slate-400">
        <ShoppingCart className="w-12 h-12 text-slate-300 mb-3 stroke-1" />
        <p className="font-semibold text-slate-600 text-sm">No Active Table Selected</p>
        <p className="text-xs mt-1 max-w-[200px]">Select any table on the Floor Plan to begin ordering.</p>
      </div>
    );
  }

  const cart = activeTable.currentCart || [];
  const isCartEmpty = cart.length === 0;

  // Calculators
  const subtotal = cart.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);
  const tax = subtotal * 0.0; // 0% tax/VAT by default for Nepal context

  let calculatedDiscount = 0;
  if (discountType === "Percent") {
    calculatedDiscount = subtotal * (discountValue / 100);
  } else {
    calculatedDiscount = Math.min(discountValue, subtotal);
  }

  const finalTotal = Math.max(0, subtotal + tax - calculatedDiscount);

  // Selected Credit Customer Details
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const isCreditValid =
    paymentMethod !== "Credit Ledger" ||
    (selectedCustomer !== undefined && selectedCustomer.balance + finalTotal <= selectedCustomer.limit);

  const handleCheckoutSubmit = () => {
    if (isCartEmpty) return;
    if (paymentMethod === "Credit Ledger" && !selectedCustomerId) return;
    if (!isCreditValid) return;

    onCompleteCheckout(paymentMethod, selectedCustomer?.name, selectedCustomer?.id, calculatedDiscount);

    // Show visual confirmation
    setShowCheckoutSuccess(true);
    setTimeout(() => {
      setShowCheckoutSuccess(false);
      // Reset checkout options
      setSelectedCustomerId("");
      setDiscountValue(0);
      setPaymentMethod("Cash");
    }, 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-full flex flex-col justify-between relative" id="pos-cart-panel">
      {/* Visual Success Overlay */}
      <AnimatePresence>
        {showCheckoutSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/95 z-50 rounded-2xl flex flex-col items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <CheckCircle className="w-16 h-16 text-emerald-500 mb-4 stroke-1.5" />
            </motion.div>
            <h4 className="font-bold text-slate-800 text-lg">Transaction Completed!</h4>
            <p className="text-slate-500 text-xs mt-1.5 max-w-[240px]">
              Checkout finalized for <span className="font-semibold text-slate-700">{activeTable.name}</span>. Receipt printed, and dues cleared successfully.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        {/* Cart Title & Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-slate-800 text-base tracking-tight">Review Order Cart</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-slate-100 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl font-black">
              📍 {activeTable.name}
            </span>
          </div>
        </div>

        {isCartEmpty ? (
          <div className="py-24 flex flex-col items-center justify-center text-center text-slate-400 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
              <ShoppingCart className="w-8 h-8 stroke-1" />
            </div>
            <div className="space-y-1">
              <p className="font-extrabold text-slate-700 text-sm">Cart is currently empty</p>
              <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed font-semibold">
                Select dishes from the catalog on the left to add items to {activeTable.name}'s order list.
              </p>
            </div>
          </div>
        ) : (
          /* Seamless Vertical Layout for combined POS screen */
          <div className="space-y-5">
            
            {/* Cart Items List - Max-Height Restricted for sidebar layout */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3 font-mono">Dishes Ordered ({cart.reduce((s, i) => s + i.quantity, 0)} items)</h4>
              <div className="overflow-y-auto max-h-[220px] pr-1.5 space-y-2.5" id="cart-items-container">
                {cart.map((item) => (
                  <motion.div
                    key={item.menuItem.id}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-xs"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-xs text-slate-800 truncate">{item.menuItem.name}</h4>
                        <span className="text-[8px] bg-slate-50 border border-slate-100 text-slate-500 font-bold px-1 py-0.2 rounded-full">
                          {item.menuItem.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                        Rs. {item.menuItem.price.toFixed(2)} each
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-50 border border-slate-150 rounded-lg p-0.5">
                        <button
                          onClick={() => onUpdateCartItemQty(item.menuItem.id, -1)}
                          className="p-1 text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-1.5 text-xs font-black text-slate-800 min-w-[16px] text-center font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateCartItemQty(item.menuItem.id, 1)}
                          className="p-1 text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveCartItem(item.menuItem.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Bill calculation summary card */}
            <div className="bg-slate-50/50 border border-slate-150 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Order Subtotal</span>
                <span className="font-bold text-slate-800">Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">VAT & Svc Charge (0%)</span>
                <span className="font-bold text-slate-800">Rs. {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-black text-slate-900 pt-2 border-t border-slate-150">
                <span>Total Amount Due</span>
                <span className="text-sm font-black text-slate-950 font-mono">Rs. {finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Settle check trigger button */}
            <button
              type="button"
              onClick={() => setShowSettlementModal(true)}
              disabled={isCartEmpty}
              className={`w-full py-3.5 rounded-2xl text-xs font-black text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                isCartEmpty
                  ? "bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                  : "bg-amber-600 hover:bg-amber-700 hover:shadow-lg hover:shadow-amber-600/15"
              }`}
              id="btn-cart-checkout-trigger"
            >
              <Wallet className="w-4 h-4" /> Proceed to Settle Check (Rs. {finalTotal.toFixed(2)})
            </button>

            {/* Big Popup Settlement Modal */}
            <AnimatePresence>
              {showSettlementModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                  onClick={() => setShowSettlementModal(false)} // Close when clicking outside modal border
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 15 }}
                    className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-slate-100 shadow-2xl space-y-6 relative"
                    id="settlement-popup-modal"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                  >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-lg md:text-xl tracking-tight">Settle Order Dues</h3>
                        <p className="text-slate-400 text-xs mt-0.5">Finalize transaction details for table <span className="font-semibold text-slate-700">{activeTable.name}</span></p>
                      </div>
                      <button
                        onClick={() => setShowSettlementModal(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer border border-slate-100"
                      >
                        <X className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Configuration & Input */}
                      <div className="space-y-4">
                        {/* Payment Mode */}
                        <div>
                          <span className="text-xs font-extrabold text-slate-700 block mb-2">Payment Mode</span>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => setPaymentMethod("Cash")}
                              className={`py-2 px-1 rounded-xl text-[10px] font-black border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                                paymentMethod === "Cash"
                                  ? "bg-amber-50/50 border-amber-500 text-amber-800 shadow-md ring-1 ring-amber-500"
                                  : "bg-white border-slate-200/80 hover:bg-slate-50 text-slate-600"
                              }`}
                            >
                              <DollarSign className="w-4 h-4 text-emerald-600" />
                              Cash Settle
                            </button>
                            <button
                              onClick={() => setPaymentMethod("Card")}
                              className={`py-2 px-1 rounded-xl text-[10px] font-black border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                                paymentMethod === "Card"
                                  ? "bg-amber-50/50 border-amber-500 text-amber-800 shadow-md ring-1 ring-amber-500"
                                  : "bg-white border-slate-200/80 hover:bg-slate-50 text-slate-600"
                              }`}
                            >
                              <CreditCard className="w-4 h-4 text-blue-600" />
                              Credit Card
                            </button>
                            <button
                              onClick={() => setPaymentMethod("Credit Ledger")}
                              className={`py-2 px-1 rounded-xl text-[10px] font-black border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                                paymentMethod === "Credit Ledger"
                                  ? "bg-amber-50/50 border-amber-500 text-amber-800 shadow-md ring-1 ring-amber-500"
                                  : "bg-white border-slate-200/80 hover:bg-slate-50 text-slate-600"
                              }`}
                            >
                              <Wallet className="w-4 h-4 text-amber-600" />
                              Ledger Tab
                            </button>
                          </div>
                        </div>

                        {/* Credit Ledger Customer Selector */}
                        {paymentMethod === "Credit Ledger" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="bg-slate-50 p-3 rounded-xl border border-slate-150 overflow-hidden space-y-2"
                          >
                            <div>
                              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                                Customer Account
                              </label>
                              <select
                                value={selectedCustomerId}
                                onChange={(e) => setSelectedCustomerId(e.target.value)}
                                className="w-full bg-white border border-slate-200 text-xs px-2.5 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-750 font-bold cursor-pointer"
                                id="select-credit-customer-modal"
                              >
                                <option value="">-- Choose Account --</option>
                                {customers.map((customer) => (
                                  <option key={customer.id} value={customer.id}>
                                    {customer.name} (Due: Rs. {customer.balance.toFixed(2)})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Credit Validation Warning */}
                            {selectedCustomer && (
                              <div className="space-y-1 text-[9.5px] border-t border-slate-200/60 pt-2 font-semibold font-mono">
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Current Balance:</span>
                                  <span className="font-extrabold text-slate-800">Rs. {selectedCustomer.balance.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Additional Charges:</span>
                                  <span className="font-extrabold text-amber-600">+Rs. {finalTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between border-t border-dashed border-slate-250 pt-1">
                                  <span className="text-slate-500">Projected Balance:</span>
                                  <span className={`font-extrabold ${!isCreditValid ? "text-rose-600" : "text-emerald-600"}`}>
                                    Rs. {(selectedCustomer.balance + finalTotal).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Authorized Limit:</span>
                                  <span className="font-extrabold text-slate-800">Rs. {selectedCustomer.limit.toFixed(2)}</span>
                                </div>

                                {!isCreditValid && (
                                  <div className="bg-rose-50 border border-rose-100 text-rose-700 p-2.5 rounded-xl flex items-start gap-1.5 mt-2 font-semibold leading-normal font-sans">
                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                    <span>
                                      Projected balance exceeds limit of Rs. {selectedCustomer.limit}. Please settle ledger dues first.
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </motion.div>
                        )}

                        {/* Discounts & Promos Section */}
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100" id="discount-section-modal">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
                            <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                              <Percent className="w-3.5 h-3.5 text-amber-600" /> Promo Discount
                            </span>
                            <div className="flex bg-white border border-slate-150 rounded-lg p-0.5 self-start sm:self-auto">
                              <button
                                onClick={() => {
                                  setDiscountType("Percent");
                                  setDiscountValue(0);
                                }}
                                className={`px-2 py-0.5 rounded-md text-[9px] font-black cursor-pointer transition-colors ${
                                  discountType === "Percent" ? "bg-amber-100 text-amber-800" : "text-slate-500 hover:text-slate-800"
                                }`}
                              >
                                % Percent
                              </button>
                              <button
                                onClick={() => {
                                  setDiscountType("Fixed");
                                  setDiscountValue(0);
                                }}
                                className={`px-2 py-0.5 rounded-md text-[9px] font-black cursor-pointer transition-colors ${
                                  discountType === "Fixed" ? "bg-amber-100 text-amber-800" : "text-slate-500 hover:text-slate-800"
                                }`}
                              >
                                Rs. Fixed
                              </button>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder={discountType === "Percent" ? "Discount percent (e.g. 10%)" : "Discount amount (e.g. Rs. 200)"}
                              value={discountValue || ""}
                              onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value)))}
                              className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-850 font-bold"
                              id="input-discount-modal"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right: Bill details and checkout actions */}
                      <div className="space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <span className="text-xs font-extrabold text-slate-700 block">Check Invoice Details</span>
                          <div className="bg-slate-50/50 border border-slate-150 p-4 rounded-xl space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-semibold">Order Subtotal</span>
                              <span className="font-bold text-slate-800">Rs. {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-semibold">VAT & Svc Charge (0%)</span>
                              <span className="font-bold text-slate-800">Rs. {tax.toFixed(2)}</span>
                            </div>
                            {calculatedDiscount > 0 && (
                              <div className="flex justify-between text-rose-600 font-bold">
                                <span>Promo Discount</span>
                                <span>-Rs. {calculatedDiscount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                              <span>Grand Total (NPR)</span>
                              <span className="text-base font-black text-slate-950 font-mono">Rs. {finalTotal.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          {/* Hold & Print buttons */}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                onHoldOrder();
                                setShowSettlementModal(false);
                              }}
                              className="py-2.5 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50 text-slate-600 flex items-center justify-center gap-1 cursor-pointer transition-colors bg-white shadow-xs"
                            >
                              Hold Seating
                            </button>
                            <button
                              type="button"
                              onClick={onSimulateBill}
                              className="py-2.5 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50 text-slate-600 flex items-center justify-center gap-1 cursor-pointer transition-colors bg-white shadow-xs"
                            >
                              <Receipt className="w-3.5 h-3.5 text-amber-600" /> Print Check
                            </button>
                          </div>

                          {/* Final settle button */}
                          <button
                            type="button"
                            onClick={handleCheckoutSubmit}
                            disabled={isCartEmpty || !isCreditValid || (paymentMethod === "Credit Ledger" && !selectedCustomerId)}
                            className={`w-full py-3.5 rounded-xl text-xs font-black text-white shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                              isCartEmpty || !isCreditValid || (paymentMethod === "Credit Ledger" && !selectedCustomerId)
                                ? "bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                                : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/15"
                            }`}
                            id="btn-confirm-checkout-modal"
                          >
                            <CheckCircle className="w-4 h-4" /> Confirm Dues & Settle Check (Rs. {finalTotal.toFixed(2)})
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}
      </div>
    </div>
  );
}
