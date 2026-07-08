"use client";

import React, { useState } from "react";
import { CreditCustomer, CreditTransactionLog } from "@/lib/types";
import { Users, Search, Plus, DollarSign, Phone, ShieldAlert, History, CreditCard, ChevronRight, UserPlus, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CreditLedgerProps {
  customers: CreditCustomer[];
  onRegisterCustomer: (name: string, phone: string, limit: number) => void;
  onRecordPayment: (customerId: string, amount: number, note: string) => void;
}

export default function CreditLedger({ customers, onRegisterCustomer, onRecordPayment }: CreditLedgerProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || "");
  const [showRegisterForm, setShowRegisterForm] = useState<boolean>(false);

  // New Customer Form State
  const [newName, setNewName] = useState<string>("");
  const [newPhone, setNewPhone] = useState<string>("");
  const [newLimit, setNewLimit] = useState<number>(500);

  // Payment Form State
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payNote, setPayNote] = useState<string>("Regular settlement");
  const [showPaymentSuccess, setShowPaymentSuccess] = useState<boolean>(false);

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    return (
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
    );
  });

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Metrics
  const totalReceivables = customers.reduce((acc, c) => acc + c.balance, 0);
  const nearLimitAccounts = customers.filter((c) => c.balance >= c.limit * 0.8).length;

  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || newLimit <= 0) return;

    onRegisterCustomer(newName, newPhone, newLimit);
    setNewName("");
    setNewPhone("");
    setNewLimit(500);
    setShowRegisterForm(false);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || payAmount <= 0) return;

    onRecordPayment(selectedCustomerId, payAmount, payNote);
    setPayAmount(0);
    setPayNote("Regular settlement");

    // Success animation
    setShowPaymentSuccess(true);
    setTimeout(() => {
      setShowPaymentSuccess(false);
    }, 2000);
  };

  return (
    <div className="space-y-6" id="credit-ledger-tab">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Active Credit Accounts</span>
            <h4 className="text-2xl font-extrabold text-slate-950 mt-0.5">{customers.length} Accounts</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Outstanding Receivables</span>
            <h4 className="text-2xl font-extrabold text-slate-950 mt-0.5">Rs. {totalReceivables.toFixed(2)}</h4>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500">Accounts Near Limit (&gt;80%)</span>
            <h4 className="text-2xl font-extrabold text-slate-950 mt-0.5">{nearLimitAccounts} Warning</h4>
          </div>
        </div>
      </div>

      {/* Main split dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customer Accounts List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 text-base">Customer Ledger Accounts</h3>
              <button
                onClick={() => setShowRegisterForm(true)}
                className="text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                id="btn-register-cust-trigger"
              >
                <UserPlus className="w-3.5 h-3.5" />
                New Tab Account
              </button>
            </div>

            {/* Account Search bar */}
            <div className="relative w-full mb-4">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by customer name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-slate-800 font-semibold"
                id="input-ledger-search"
              />
            </div>

            {/* Customer accounts listing */}
            <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1" id="ledger-customer-list">
              {filteredCustomers.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
                  <p className="text-xs font-semibold">No accounts found</p>
                </div>
              ) : (
                filteredCustomers.map((customer) => {
                  const isSelected = customer.id === selectedCustomerId;
                  const utilization = (customer.balance / customer.limit) * 100;

                  return (
                    <button
                      key={customer.id}
                      onClick={() => setSelectedCustomerId(customer.id)}
                      className={`w-full p-3.5 rounded-xl border flex items-center justify-between text-left cursor-pointer transition-all ${
                        isSelected
                          ? "bg-amber-50/50 border-amber-300 shadow-sm"
                          : "bg-white border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-800 truncate">{customer.name}</h4>
                          {utilization >= 80 && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-300" /> {customer.phone}
                        </p>
                        {/* Utilization progress bar */}
                        <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              utilization >= 80 ? "bg-rose-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${Math.min(100, utilization)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900">Rs. {customer.balance.toFixed(2)}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Limit: Rs. {customer.limit}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Account detail workspace */}
        <div className="lg:col-span-7 space-y-6">
          {/* Detailed account manager */}
          {selectedCustomer ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6" id="ledger-detail-panel">
              {/* Profile Card */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-5">
                <div>
                  <h4 className="text-lg font-bold text-slate-950">{selectedCustomer.name}</h4>
                  <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedCustomer.phone}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding Due Balance</span>
                  <span className="text-xl font-extrabold text-amber-600 font-mono">Rs. {selectedCustomer.balance.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500 block">Available Credit Limit: Rs. {(selectedCustomer.limit - selectedCustomer.balance).toFixed(2)} / Rs. {selectedCustomer.limit}</span>
                </div>
              </div>

              {/* Record Payment Form */}
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100" id="dues-collection-form">
                <h5 className="font-bold text-slate-700 text-xs flex items-center gap-1.5 mb-3">
                  <CreditCard className="w-4 h-4 text-amber-600" /> Record Dues Payment (Collection)
                </h5>
                <form onSubmit={handleRecordPaymentSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      placeholder="Payment Amount (Rs.)"
                      value={payAmount || ""}
                      onChange={(e) => setPayAmount(Math.max(0, Number(e.target.value)))}
                      className="bg-white border border-slate-200 text-xs pl-8 pr-3 py-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 font-bold"
                      id="input-payment-amount"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Note/Memo"
                      value={payNote}
                      onChange={(e) => setPayNote(e.target.value)}
                      className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-semibold"
                      id="input-payment-note"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 shadow-sm cursor-pointer transition-colors"
                  >
                    {showPaymentSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Applied!
                      </>
                    ) : (
                      "Apply Settlement"
                    )}
                  </button>
                </form>
              </div>

              {/* Ledger Transaction History Log */}
              <div>
                <h5 className="font-bold text-slate-700 text-xs flex items-center gap-1.5 mb-3">
                  <History className="w-4 h-4 text-amber-600" /> Account Transaction Ledger History
                </h5>
                <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50" id="ledger-transaction-rows">
                  {selectedCustomer.log.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                      No transactions recorded yet.
                    </div>
                  ) : (
                    selectedCustomer.log.map((logItem) => (
                      <div key={logItem.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50/50 transition-colors">
                        <div>
                          <p className="font-bold text-slate-800">{logItem.description}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{logItem.timestamp}</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`font-bold text-xs px-2.5 py-0.5 rounded-full ${
                              logItem.type === "Charge"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {logItem.type === "Charge" ? "+" : "-"}Rs. {logItem.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm text-center text-slate-400">
              Select a customer ledger account to view details
            </div>
          )}
        </div>
      </div>

      {/* Register Customer Account Modal overlay */}
      <AnimatePresence>
        {showRegisterForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-100 shadow-xl space-y-4"
              id="register-cust-modal"
            >
              <div>
                <h4 className="font-bold text-slate-800 text-lg">Register Credit Account</h4>
                <p className="text-slate-400 text-xs mt-0.5">Register a customer to authorize credit tab checkout.</p>
              </div>

              <form onSubmit={handleCreateCustomerSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Customer Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter name (e.g., John Doe)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-semibold"
                    id="input-new-cust-name"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter phone (e.g., 555-0199)"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-semibold"
                    id="input-new-cust-phone"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Authorized Credit Limit (Rs.)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 500"
                    value={newLimit || ""}
                    onChange={(e) => setNewLimit(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-bold"
                    id="input-new-cust-limit"
                    required
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRegisterForm(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-500 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm cursor-pointer transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
