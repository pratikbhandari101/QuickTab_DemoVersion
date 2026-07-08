"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Table, FloorStructure, FloorZone } from "@/lib/types";
import {
  Coffee,
  User,
  Receipt,
  CreditCard,
  Armchair,
  Settings,
  Plus,
  Trash2,
  Maximize2,
  RefreshCw,
  Sliders,
  Type,
  Users,
  CheckCircle,
  Check,
  AlertCircle,
  CloudLightning,
  Wifi,
  Grid,
  Layers,
  DoorOpen,
  PanelLeft,
  Leaf,
  Sparkles,
  AlignLeft,
  LayoutGrid
} from "lucide-react";

interface FloorPlanProps {
  tables: Table[];
  activeTableId: string | null;
  onSelectTable: (tableId: string) => void;
  onUpdateTableLayout: (tableId: string, updates: Partial<Table>) => void;
  onAddTable: (name: string, shape: "circle" | "square" | "rectangle" | "oval", seats: number, zoneId?: string) => void;
  onDeleteTable: (tableId: string) => void;
  isCloudSync: boolean;
  onToggleCloudSync: () => void;
  syncStatus: "synced" | "syncing" | "error" | "offline";
  // Custom background layout properties
  structures: FloorStructure[];
  onAddStructure: (type: FloorStructure["type"], label: string, zoneId?: string) => void;
  onUpdateStructureLayout: (id: string, updates: Partial<FloorStructure>) => void;
  onDeleteStructure: (id: string) => void;
  canvasTheme: string;
  onUpdateCanvasTheme: (theme: string) => void;
  snapToGrid: boolean;
  onToggleSnapToGrid: () => void;

  // Zone management props
  zones: FloorZone[];
  activeZoneId: string;
  onSelectZone: (zoneId: string) => void;
  onAddZone: (name: string, description?: string) => void;
  onDeleteZone: (zoneId: string) => void;
}

export default function FloorPlan({
  tables,
  activeTableId,
  onSelectTable,
  onUpdateTableLayout,
  onAddTable,
  onDeleteTable,
  isCloudSync,
  onToggleCloudSync,
  syncStatus,
  structures,
  onAddStructure,
  onUpdateStructureLayout,
  onDeleteStructure,
  canvasTheme,
  onUpdateCanvasTheme,
  snapToGrid,
  onToggleSnapToGrid,
  zones,
  activeZoneId,
  onSelectZone,
  onAddZone,
  onDeleteZone
}: FloorPlanProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Confirmation & alert states to avoid iframe-blocked native alert/confirm
  const [tableDeleteConfirm, setTableDeleteConfirm] = useState<string | null>(null);
  const [structureDeleteConfirm, setStructureDeleteConfirm] = useState<string | null>(null);
  const [layoutAlert, setLayoutAlert] = useState<string | null>(null);

  // Zone management local state
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneDesc, setNewZoneDesc] = useState("");
  const [zoneDeleteConfirm, setZoneDeleteConfirm] = useState<string | null>(null);

  // Automatically dismiss layout warnings after a few seconds
  useEffect(() => {
    if (layoutAlert) {
      const timer = setTimeout(() => {
        setLayoutAlert(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [layoutAlert]);

  // Reset delete confirmations on selection changes
  useEffect(() => {
    setTableDeleteConfirm(null);
  }, [selectedTableId, activeTableId]);

  useEffect(() => {
    setStructureDeleteConfirm(null);
  }, [selectedStructureId]);

  // Designer panel subtab
  const [designerSubTab, setDesignerSubTab] = useState<"tables" | "architecture" | "canvas">("tables");

  // Form states for table additions / modifications
  const [newTableName, setNewTableName] = useState("");
  const [newTableShape, setNewTableShape] = useState<"circle" | "square" | "rectangle" | "oval">("square");
  const [newTableSeats, setNewTableSeats] = useState(4);

  // Form states for structural additions / modifications
  const [newStructureType, setNewStructureType] = useState<FloorStructure["type"]>("wall");
  const [newStructureLabel, setNewStructureLabel] = useState("");

  const activeEditTable = tables.find((t) => t.id === (selectedTableId || activeTableId));
  const activeEditStructure = structures.find((s) => s.id === selectedStructureId);

  // Auto-fill active edit details
  const [editName, setEditName] = useState("");
  const [editSeats, setEditSeats] = useState(4);
  const [editShape, setEditShape] = useState<"circle" | "square" | "rectangle" | "oval">("square");

  const [editStructLabel, setEditStructLabel] = useState("");
  const [editStructColor, setEditStructColor] = useState("");

  useEffect(() => {
    if (activeEditTable) {
      setEditName(activeEditTable.name);
      setEditSeats(activeEditTable.seats || 4);
      setEditShape(activeEditTable.shape || "square");
    }
  }, [selectedTableId, activeTableId, activeEditTable]);

  useEffect(() => {
    if (activeEditStructure) {
      setEditStructLabel(activeEditStructure.label);
      setEditStructColor(activeEditStructure.color || "");
    }
  }, [selectedStructureId, activeEditStructure]);

  // Set default structure label suggestions based on type
  useEffect(() => {
    const defaultLabels: Record<FloorStructure["type"], string> = {
      wall: "Wall Partition",
      counter: "Espresso Bar Counter",
      door: "Main Double Doors",
      window: "Stained Glass Window",
      plant: "Monstera Pot",
      label: "Cozy Dining Area"
    };
    setNewStructureLabel(defaultLabels[newStructureType] || "Floor Element");
  }, [newStructureType]);

  // Set the next default table name suggestion
  useEffect(() => {
    const tableNumbers = tables
      .map((t) => {
        const match = t.name.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter((n) => n > 0);
    const maxNum = tableNumbers.length > 0 ? Math.max(...tableNumbers) : 0;
    setNewTableName(`Table ${maxNum + 1}`);
  }, [tables]);

  // Map status to visual coloring
  const getStatusColor = (status: Table["status"], isActive: boolean, isEditing: boolean) => {
    if (isEditing) {
      if (isActive) {
        return "bg-amber-100 border-amber-600 text-amber-950 shadow-md ring-4 ring-amber-300";
      }
      return "bg-white border-slate-300 text-slate-800 hover:border-slate-400";
    }

    if (isActive) {
      return "bg-amber-500 border-amber-600 text-white shadow-lg ring-4 ring-amber-200";
    }

    switch (status) {
      case "Free":
        return "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 text-emerald-700";
      case "Occupied":
        return "bg-sky-50 border-sky-200 hover:bg-sky-100 hover:border-sky-300 text-sky-700";
      case "Billing":
        return "bg-rose-50 border-rose-200 hover:bg-rose-100 hover:border-rose-300 text-rose-700";
      case "Dues":
        return "bg-purple-50 border-purple-200 hover:bg-purple-100 hover:border-purple-300 text-purple-700";
      default:
        return "bg-slate-50 border-slate-200 text-slate-700";
    }
  };

  const getStatusIcon = (status: Table["status"]) => {
    switch (status) {
      case "Free":
        return <Armchair className="w-3.5 h-3.5" />;
      case "Occupied":
        return <User className="w-3.5 h-3.5 animate-pulse" />;
      case "Billing":
        return <Receipt className="w-3.5 h-3.5" />;
      case "Dues":
        return <CreditCard className="w-3.5 h-3.5" />;
    }
  };

  // Drag Event Handlers for Tables
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>, tableId: string) => {
    if (!isEditMode) return;
    e.preventDefault();
    setSelectedTableId(tableId);
    setSelectedStructureId(null);

    const buttonElement = e.currentTarget;
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const startX = table.x !== undefined ? table.x : 50;
    const startY = table.y !== undefined ? table.y : 50;

    const startPointerX = e.clientX;
    const startPointerY = e.clientY;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startPointerX;
      const deltaY = moveEvent.clientY - startPointerY;

      const deltaXPercent = (deltaX / containerRect.width) * 100;
      const deltaYPercent = (deltaY / containerRect.height) * 100;

      const tableWidthPx = table.width || 80;
      const tableHeightPx = table.height || 80;
      const widthPercent = (tableWidthPx / containerRect.width) * 100;
      const heightPercent = (tableHeightPx / containerRect.height) * 100;

      let nextX = Math.min(Math.max(0, startX + deltaXPercent), 100 - widthPercent);
      let nextY = Math.min(Math.max(0, startY + deltaYPercent), 100 - heightPercent);

      // Snap alignment options
      if (snapToGrid) {
        nextX = Math.round(nextX / 2) * 2;
        nextY = Math.round(nextY / 2) * 2;
      } else {
        nextX = Math.round(nextX);
        nextY = Math.round(nextY);
      }

      onUpdateTableLayout(tableId, { x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Resize Event Handlers for Tables
  const handleResizePointerDown = (e: React.PointerEvent<HTMLDivElement>, tableId: string) => {
    e.stopPropagation();
    e.preventDefault();

    const container = containerRef.current;
    if (!container) return;

    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const startWidth = table.width || 80;
    const startHeight = table.height || 80;
    const startPointerX = e.clientX;
    const startPointerY = e.clientY;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startPointerX;
      const deltaY = moveEvent.clientY - startPointerY;

      let nextWidth = Math.min(Math.max(60, startWidth + deltaX), 240);
      let nextHeight = Math.min(Math.max(60, startHeight + deltaY), 240);

      const currentShape = table.shape || "square";
      if (currentShape === "square" || currentShape === "circle") {
        const averageSize = Math.round((nextWidth + nextHeight) / 2);
        nextWidth = averageSize;
        nextHeight = averageSize;
      } else {
        nextWidth = Math.round(nextWidth);
        nextHeight = Math.round(nextHeight);
      }

      onUpdateTableLayout(tableId, { width: nextWidth, height: nextHeight });
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Drag Event Handlers for Structural elements
  const handleStructurePointerDown = (e: React.PointerEvent<HTMLButtonElement>, id: string) => {
    if (!isEditMode) return;
    e.preventDefault();
    setSelectedStructureId(id);
    setSelectedTableId(null);

    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const struct = structures.find((s) => s.id === id);
    if (!struct) return;

    const startX = struct.x;
    const startY = struct.y;

    const startPointerX = e.clientX;
    const startPointerY = e.clientY;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startPointerX;
      const deltaY = moveEvent.clientY - startPointerY;

      const deltaXPercent = (deltaX / containerRect.width) * 100;
      const deltaYPercent = (deltaY / containerRect.height) * 100;

      const structWidthPx = struct.width;
      const structHeightPx = struct.height;
      const widthPercent = (structWidthPx / containerRect.width) * 100;
      const heightPercent = (structHeightPx / containerRect.height) * 100;

      let nextX = Math.min(Math.max(0, startX + deltaXPercent), 100 - widthPercent);
      let nextY = Math.min(Math.max(0, startY + deltaYPercent), 100 - heightPercent);

      if (snapToGrid) {
        nextX = Math.round(nextX / 2) * 2;
        nextY = Math.round(nextY / 2) * 2;
      } else {
        nextX = Math.round(nextX);
        nextY = Math.round(nextY);
      }

      onUpdateStructureLayout(id, { x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Resize Event Handlers for Structural elements
  const handleStructureResizePointerDown = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    e.stopPropagation();
    e.preventDefault();

    const struct = structures.find((s) => s.id === id);
    if (!struct) return;

    const startWidth = struct.width;
    const startHeight = struct.height;
    const startPointerX = e.clientX;
    const startPointerY = e.clientY;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startPointerX;
      const deltaY = moveEvent.clientY - startPointerY;

      const nextWidth = Math.min(Math.max(30, startWidth + deltaX), 400);
      const nextHeight = Math.min(Math.max(10, startHeight + deltaY), 300);

      onUpdateStructureLayout(id, {
        width: Math.round(nextWidth),
        height: Math.round(nextHeight)
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handleAddNewTableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName) return;

    onAddTable(newTableName, newTableShape, newTableSeats, activeZoneId);
    setTimeout(() => {
      const added = tables.find((t) => t.name === newTableName);
      if (added) setSelectedTableId(added.id);
    }, 100);
  };

  const handleAddNewStructureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStructureLabel) return;

    onAddStructure(newStructureType, newStructureLabel, activeZoneId);
  };

  const handleDeleteActiveTable = () => {
    if (!activeEditTable) return;

    const isBillingOrDues = activeEditTable.status === "Billing" || activeEditTable.status === "Dues";
    const hasItems = activeEditTable.currentCart && activeEditTable.currentCart.length > 0;

    if (hasItems || isBillingOrDues) {
      setLayoutAlert(`Cannot delete "${activeEditTable.name}". Seating holds open orders or active billing tabs.`);
      return;
    }

    setTableDeleteConfirm(activeEditTable.id);
  };

  const handleDeleteActiveStructure = () => {
    if (!activeEditStructure) return;
    setStructureDeleteConfirm(activeEditStructure.id);
  };

  // Seating capacity calculations
  const totalSeats = tables.reduce((acc, t) => acc + (t.seats || 4), 0);
  const occupiedSeats = tables
    .filter((t) => t.status !== "Free")
    .reduce((acc, t) => acc + (t.seats || 4), 0);
  const occupancyPercentage = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;

  // Background style theme builder
  const getCanvasThemeClass = (themeName: string) => {
    switch (themeName) {
      case "wood":
        return "bg-amber-50/15 bg-[linear-gradient(90deg,rgba(110,62,20,0.04)_1px,transparent_1px)] [background-size:24px_100%] border-solid border-slate-200";
      case "concrete":
        return "bg-zinc-100 bg-[radial-gradient(#d4d4d8_1.5px,transparent_1.5px)] [background-size:16px_16px] border-solid border-slate-200";
      case "terrazzo":
        return "bg-slate-50 bg-[radial-gradient(#94a3b8_1.5px,transparent_1.5px),radial-gradient(#f1f5f9_1.5px,transparent_1.5px)] [background-size:20px_20px] [background-position:0_0,10px_10px] border-solid border-slate-200";
      case "dark-slate":
        return "bg-slate-900 bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:22px_22px] border-solid border-slate-800 text-slate-100";
      case "grid":
      default:
        return "bg-slate-50 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] [background-size:20px_20px] border-solid border-slate-200";
    }
  };

  return (
    <div
      className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-full flex flex-col justify-between"
      id="floor-plan-card"
    >
      <div>
        {/* Floor Plan Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-slate-50 pb-4">
          <div>
            <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-lg">
              <Coffee className="w-5 h-5 text-amber-600" />
              Interactive Floor Plan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditMode
                ? "Drag architectural elements or tables. Use the control dock to customize."
                : "Select tables to edit cart, bill checks, or collect credit payments."}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Sync status widget */}
            <div
              onClick={onToggleCloudSync}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${
                isCloudSync
                  ? "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
              title="Click to toggle Firestore cloud synchronization"
              id="cloud-sync-status-badge"
            >
              {isCloudSync ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-amber-600" />
                  {syncStatus === "syncing" && <RefreshCw className="w-3 h-3 animate-spin" />}
                  {syncStatus === "synced" && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                  {syncStatus === "error" && <AlertCircle className="w-3 h-3 text-rose-500" />}
                  <span className="text-[10px]">Cloud Sync</span>
                </>
              ) : (
                <>
                  <CloudLightning className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px]">Local Mode</span>
                </>
              )}
            </div>

            {/* Edit Mode Toggle Switch */}
            <button
              onClick={() => {
                setIsEditMode(!isEditMode);
                setSelectedTableId(null);
                setSelectedStructureId(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                isEditMode
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "bg-amber-600 text-white hover:bg-amber-700"
              }`}
              id="btn-edit-floor-plan-toggle"
            >
              <Sliders className="w-3.5 h-3.5" />
              {isEditMode ? "Exit Designer" : "Edit Floor Plan"}
            </button>
          </div>
        </div>

        {/* Zone Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-slate-50/50 p-2 rounded-xl border border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5" id="zone-tabs-list">
            {zones.map((zone) => {
              const isActive = zone.id === activeZoneId;
              const zoneTables = tables.filter((t) => (t.zoneId || "main") === zone.id);
              const activeZoneTables = zoneTables.length;

              return (
                <div key={zone.id} className="relative group flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectZone(zone.id);
                      setSelectedTableId(null);
                      setSelectedStructureId(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? "bg-amber-600 text-white shadow-sm font-extrabold"
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <span>{zone.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black ${
                      isActive ? "bg-amber-700 text-amber-50" : "bg-slate-200 text-slate-600"
                    }`}>
                      {activeZoneTables}
                    </span>
                  </button>

                  {/* Show delete button if not main and in edit mode */}
                  {isEditMode && zone.id !== "main" && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoneDeleteConfirm(zone.id);
                      }}
                      className="ml-1 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                      title="Delete this zone"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add Zone Inline Button */}
            {isEditMode && !isAddingZone && (
              <button
                type="button"
                onClick={() => setIsAddingZone(true)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-600 hover:bg-amber-50 flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Zone
              </button>
            )}
          </div>

          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <span>Occupancy:</span>
            <span className="font-bold text-slate-600">{occupancyPercentage}%</span>
          </div>
        </div>

        {/* Add Zone Form */}
        <AnimatePresence>
          {isAddingZone && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden bg-amber-50/45 border border-amber-100 rounded-xl p-3 mb-4 space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">Create New Zone / Area</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingZone(false);
                    setNewZoneName("");
                    setNewZoneDesc("");
                  }}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Zone Name (e.g., Garden Patio, Lounge)"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <input
                  type="text"
                  placeholder="Optional brief description"
                  value={newZoneDesc}
                  onChange={(e) => setNewZoneDesc(e.target.value)}
                  className="bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!newZoneName.trim()) return;
                  onAddZone(newZoneName.trim(), newZoneDesc.trim() || undefined);
                  setIsAddingZone(false);
                  setNewZoneName("");
                  setNewZoneDesc("");
                }}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-1.5 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Confirm and Create Zone
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Zone Confirmation Dialogue */}
        <AnimatePresence>
          {zoneDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <div>
                  <h5 className="font-bold text-rose-900 text-xs">Delete Zone &quot;{zones.find(z => z.id === zoneDeleteConfirm)?.name}&quot;?</h5>
                  <p className="text-[10px] text-rose-700 mt-0.5">This action is permanent. Zone must be empty of tables and structures.</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onDeleteZone(zoneDeleteConfirm);
                    setZoneDeleteConfirm(null);
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer shadow-sm"
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  onClick={() => setZoneDeleteConfirm(null)}
                  className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-bold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Design Toolbar */}
        <AnimatePresence>
          {isEditMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden bg-slate-50 border border-slate-100 rounded-xl p-4 mb-4 space-y-3.5 text-xs"
              id="designer-control-dock"
            >
              {/* Selector subtabs */}
              <div className="flex border-b border-slate-250 pb-2">
                <button
                  type="button"
                  onClick={() => setDesignerSubTab("tables")}
                  className={`px-3 py-1.5 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1.5 ${
                    designerSubTab === "tables"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <Armchair className="w-3.5 h-3.5" />
                  Tables Layout
                </button>
                <button
                  type="button"
                  onClick={() => setDesignerSubTab("architecture")}
                  className={`ml-1 px-3 py-1.5 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1.5 ${
                    designerSubTab === "architecture"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Structures (Walls/Doors)
                </button>
                <button
                  type="button"
                  onClick={() => setDesignerSubTab("canvas")}
                  className={`ml-1 px-3 py-1.5 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1.5 ${
                    designerSubTab === "canvas"
                      ? "bg-amber-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Backdrops & Snap
                </button>
              </div>

              {designerSubTab === "tables" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  {/* Section A: Add Tables */}
                  <form onSubmit={handleAddNewTableSubmit} className="space-y-3 border-r border-slate-200 pr-0 md:pr-4">
                    <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-amber-600" />
                      Place Seating Spot
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Label Name</label>
                        <input
                          type="text"
                          value={newTableName}
                          onChange={(e) => setNewTableName(e.target.value)}
                          placeholder="e.g., Table 12"
                          className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-semibold text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Seats Count</label>
                        <input
                          type="number"
                          min={1}
                          max={16}
                          value={newTableSeats}
                          onChange={(e) => setNewTableSeats(parseInt(e.target.value, 10) || 4)}
                          className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-bold text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 items-center">
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Visual Shape</label>
                        <select
                          value={newTableShape}
                          onChange={(e) => setNewTableShape(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-semibold text-xs"
                        >
                          <option value="square">Square</option>
                          <option value="rectangle">Rectangle</option>
                          <option value="circle">Circle</option>
                          <option value="oval">Oval</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="mt-3.5 w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 rounded-lg shadow-sm flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Place Table
                      </button>
                    </div>
                  </form>

                  {/* Section B: Edit Tables */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Grid className="w-4 h-4 text-amber-600" />
                      Adjust Selected Spot
                    </h4>

                    {layoutAlert && (
                      <div className="bg-rose-50 border border-rose-250 text-rose-700 text-[11px] p-2.5 rounded-lg flex items-start gap-2 font-semibold">
                        <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                        <span>{layoutAlert}</span>
                      </div>
                    )}

                    {activeEditTable ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Rename Seating</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => {
                                setEditName(e.target.value);
                                onUpdateTableLayout(activeEditTable.id, { name: e.target.value });
                              }}
                              className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-semibold text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Edit Seats</label>
                            <input
                              type="number"
                              min={1}
                              max={16}
                              value={editSeats}
                              onChange={(e) => {
                                const v = parseInt(e.target.value, 10) || 1;
                                setEditSeats(v);
                                onUpdateTableLayout(activeEditTable.id, { seats: v });
                              }}
                              className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-bold text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 items-end justify-between">
                          <div className="w-[50%]">
                            <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Shape Pattern</label>
                            <select
                              value={editShape}
                              onChange={(e) => {
                                const sh = e.target.value as any;
                                setEditShape(sh);
                                onUpdateTableLayout(activeEditTable.id, { shape: sh });
                              }}
                              className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-semibold text-xs"
                            >
                              <option value="square">Square</option>
                              <option value="rectangle">Rectangle</option>
                              <option value="circle">Circle</option>
                              <option value="oval">Oval</option>
                            </select>
                          </div>

                          <div className="w-[48%] flex justify-end">
                            {tableDeleteConfirm === activeEditTable.id ? (
                              <div className="flex flex-col gap-1 w-full">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteTable(activeEditTable.id);
                                    setSelectedTableId(null);
                                    setTableDeleteConfirm(null);
                                  }}
                                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-1.5 px-2 rounded-lg text-[10px] text-center cursor-pointer transition-all shadow-sm"
                                >
                                  Click to Confirm
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTableDeleteConfirm(null)}
                                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-1 px-2 rounded-lg text-[9px] text-center cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={handleDeleteActiveTable}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors text-xs"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Rotation controls */}
                        <div className="pt-2.5 border-t border-slate-200/60">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-slate-600">Rotate Table Layout</span>
                            <span className="font-mono text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">{(activeEditTable.rotation || 0)}°</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={345}
                              step={15}
                              value={activeEditTable.rotation || 0}
                              onChange={(e) => {
                                onUpdateTableLayout(activeEditTable.id, { rotation: parseInt(e.target.value, 10) });
                              }}
                              className="flex-1 accent-amber-600 cursor-ew-resize h-1 bg-slate-200 rounded-lg appearance-none"
                            />
                            <div className="flex gap-1">
                              {[0, 90, 180, 270].map((deg) => (
                                <button
                                  key={deg}
                                  type="button"
                                  onClick={() => onUpdateTableLayout(activeEditTable.id, { rotation: deg })}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-black border transition-all ${
                                    (activeEditTable.rotation || 0) === deg
                                      ? "bg-amber-600 text-white border-amber-700"
                                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                  }`}
                                >
                                  {deg}°
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center text-slate-400 italic">
                        Click any seating unit on the canvas below to adjust its parameters.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {designerSubTab === "architecture" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  {/* Section A: Add Architecture */}
                  <form onSubmit={handleAddNewStructureSubmit} className="space-y-3 border-r border-slate-200 pr-0 md:pr-4">
                    <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-amber-600" />
                      Add Physical Element
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Element Type</label>
                        <select
                          value={newStructureType}
                          onChange={(e) => setNewStructureType(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-semibold text-xs"
                        >
                          <option value="wall">Divider Wall</option>
                          <option value="counter">Bar Counter</option>
                          <option value="door">Entry Door</option>
                          <option value="window">Window Slot</option>
                          <option value="plant">Indoor Plant</option>
                          <option value="label">Zone Text Tag</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Label / Title</label>
                        <input
                          type="text"
                          value={newStructureLabel}
                          onChange={(e) => setNewStructureLabel(e.target.value)}
                          placeholder="e.g. espresso bar"
                          className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-semibold text-xs"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 rounded-lg shadow-sm flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Place Architecture
                    </button>
                  </form>

                  {/* Section B: Edit Selected Architecture */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-600" />
                      Modify Architectural Element
                    </h4>
                    {activeEditStructure ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Rename Structure Label</label>
                          <input
                            type="text"
                            value={editStructLabel}
                            onChange={(e) => {
                              setEditStructLabel(e.target.value);
                              onUpdateStructureLayout(activeEditStructure.id, { label: e.target.value });
                            }}
                            className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-semibold text-xs"
                          />
                        </div>

                        <div className="flex gap-2 items-end justify-between">
                          <div className="w-[50%]">
                            <label className="text-[9px] font-bold text-slate-500 block mb-0.5">Theme Hue Tint</label>
                            <select
                              value={editStructColor}
                              onChange={(e) => {
                                setEditStructColor(e.target.value);
                                onUpdateStructureLayout(activeEditStructure.id, { color: e.target.value });
                              }}
                              className="w-full bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-700 font-semibold text-xs"
                            >
                              <option value="">Standard Accent</option>
                              <option value="warm">Sandy Oak (Wood)</option>
                              <option value="teal">Minty Green (Lush)</option>
                              <option value="royal">Imperial Blue</option>
                              <option value="coal">Charcoal Slate</option>
                            </select>
                          </div>

                          <div className="w-[48%] flex justify-end">
                            {structureDeleteConfirm === activeEditStructure.id ? (
                              <div className="flex flex-col gap-1 w-full">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteStructure(activeEditStructure.id);
                                    setSelectedStructureId(null);
                                    setStructureDeleteConfirm(null);
                                  }}
                                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-1.5 px-2 rounded-lg text-[10px] text-center cursor-pointer transition-all shadow-sm"
                                >
                                  Click to Confirm
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setStructureDeleteConfirm(null)}
                                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-1 px-2 rounded-lg text-[9px] text-center cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={handleDeleteActiveStructure}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors text-xs"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Rotation controls */}
                        <div className="pt-2.5 border-t border-slate-200/60">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-slate-600">Rotate Structural Element</span>
                            <span className="font-mono text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">{(activeEditStructure.rotation || 0)}°</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={0}
                              max={345}
                              step={15}
                              value={activeEditStructure.rotation || 0}
                              onChange={(e) => {
                                onUpdateStructureLayout(activeEditStructure.id, { rotation: parseInt(e.target.value, 10) });
                              }}
                              className="flex-1 accent-amber-600 cursor-ew-resize h-1 bg-slate-200 rounded-lg appearance-none"
                            />
                            <div className="flex gap-1">
                              {[0, 90, 180, 270].map((deg) => (
                                <button
                                  key={deg}
                                  type="button"
                                  onClick={() => onUpdateStructureLayout(activeEditStructure.id, { rotation: deg })}
                                  className={`px-1.5 py-0.5 rounded text-[9px] font-black border transition-all ${
                                    (activeEditStructure.rotation || 0) === deg
                                      ? "bg-amber-600 text-white border-amber-700"
                                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                  }`}
                                >
                                  {deg}°
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center text-slate-400 italic">
                        Click on any physical structure (walls, doors, plants) on the map below to configure it.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {designerSubTab === "canvas" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <h4 className="font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                      <LayoutGrid className="w-4 h-4 text-amber-600" />
                      Backdrop Flooring Material
                    </h4>
                    <div className="grid grid-cols-5 gap-1">
                      {[
                        { id: "grid", name: "Grid" },
                        { id: "wood", name: "Oak Wood" },
                        { id: "concrete", name: "Concrete" },
                        { id: "terrazzo", name: "Tile" },
                        { id: "dark-slate", name: "Slate" }
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => onUpdateCanvasTheme(t.id)}
                          className={`px-1 py-2 rounded-lg font-bold text-[9px] border transition-all truncate text-center ${
                            canvasTheme === t.id
                              ? "bg-amber-600 text-white border-amber-700 shadow-sm"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-slate-700">Grid Alignment snapping</h5>
                      <p className="text-[10px] text-slate-500">Align elements to neat grid intervals automatically.</p>
                    </div>
                    <button
                      type="button"
                      onClick={onToggleSnapToGrid}
                      className={`px-3 py-1.5 font-bold text-xs rounded-lg transition-all border ${
                        snapToGrid
                          ? "bg-slate-900 border-slate-950 text-white"
                          : "bg-white border-slate-250 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {snapToGrid ? "Snapping ON" : "Fine Control (OFF)"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Floor Layout Canvas Stage */}
        <div
          ref={containerRef}
          className={`relative border-2 rounded-xl h-[480px] overflow-hidden select-none transition-all ${getCanvasThemeClass(
            canvasTheme
          )} ${isEditMode ? "border-dashed border-slate-400" : ""}`}
          id="floor-plan-interactive-stage"
        >
          {/* Render Structures */}
          {structures
            .filter((s) => (s.zoneId || "main") === activeZoneId)
            .map((struct) => {
              const isSelected = selectedStructureId === struct.id;
            const styleX = `${struct.x}%`;
            const styleY = `${struct.y}%`;

            // Compute structural coloring
            const getStructureStyle = (type: FloorStructure["type"], colorTint?: string) => {
              if (type === "counter") {
                if (colorTint === "warm") return "bg-amber-100/95 border-amber-800 text-amber-950";
                if (colorTint === "teal") return "bg-teal-100/95 border-teal-800 text-teal-950";
                if (colorTint === "royal") return "bg-blue-100/95 border-blue-800 text-blue-950";
                if (colorTint === "coal") return "bg-slate-200/95 border-slate-850 text-slate-900";
                return "bg-orange-50/95 border-amber-700/60 text-amber-900";
              }
              if (type === "wall") {
                if (colorTint === "warm") return "bg-amber-900/90 border-amber-950 text-amber-100";
                if (colorTint === "teal") return "bg-teal-800/90 border-teal-950 text-teal-100";
                if (colorTint === "royal") return "bg-blue-900/90 border-blue-950 text-blue-100";
                if (colorTint === "coal") return "bg-slate-950 border-black text-slate-300";
                return "bg-slate-750 border-slate-900 text-slate-150";
              }
              if (type === "door") {
                return "bg-slate-100/50 border-l-4 border-dashed border-amber-700 text-slate-700";
              }
              if (type === "window") {
                return "bg-sky-100/75 border-y-2 border-sky-400 text-sky-900";
              }
              if (type === "plant") {
                return "bg-emerald-100/95 border-emerald-500 text-emerald-900";
              }
              // labels
              return "border-none bg-transparent text-slate-500/70 font-bold font-mono";
            };

            const getStructureShapeClass = (type: FloorStructure["type"]) => {
              if (type === "plant") return "rounded-full";
              if (type === "label") return "rounded-none";
              return "rounded-lg";
            };

            return (
              <motion.button
                key={struct.id}
                onClick={() => {
                  if (isEditMode) {
                    setSelectedStructureId(struct.id);
                    setSelectedTableId(null);
                  }
                }}
                onPointerDown={(e) => handleStructurePointerDown(e, struct.id)}
                style={{
                  position: "absolute",
                  left: styleX,
                  top: styleY,
                  width: `${struct.width}px`,
                  height: `${struct.height}px`,
                  rotate: struct.rotation || 0,
                  touchAction: "none"
                }}
                className={`border text-[10px] flex items-center justify-center font-bold shadow-sm select-none outline-none leading-tight p-1.5 text-center ${getStructureShapeClass(
                  struct.type
                )} ${getStructureStyle(struct.type, struct.color)} ${
                  isEditMode && isSelected
                    ? "ring-4 ring-amber-400 border-amber-600 shadow-md scale-[1.01]"
                    : ""
                }`}
                whileHover={isEditMode ? {} : { scale: 1.01 }}
                whileTap={isEditMode ? {} : { scale: 0.99 }}
              >
                <div className="flex flex-col items-center justify-center gap-1 max-w-full">
                  {struct.type === "plant" && <Leaf className="w-3.5 h-3.5 text-emerald-600" />}
                  {struct.type === "door" && <DoorOpen className="w-3.5 h-3.5 text-slate-500" />}
                  <span className="truncate max-w-full font-sans uppercase tracking-wider text-[8px] font-black leading-none">
                    {struct.label}
                  </span>
                </div>

                {/* Drag Coordinates */}
                {isEditMode && isSelected && (
                  <div className="absolute -top-6 bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                    X:{struct.x}%, Y:{struct.y}%
                  </div>
                )}

                {/* Resize Handle node */}
                {isEditMode && isSelected && (
                  <div
                    onPointerDown={(e) => handleStructureResizePointerDown(e, struct.id)}
                    className="absolute bottom-1 right-1 w-4 h-4 bg-amber-500 rounded-md border border-white flex items-center justify-center cursor-se-resize shadow shadow-black/10 hover:scale-110 active:scale-95 transition-all z-25"
                    title="Drag to resize this element"
                  >
                    <Maximize2 className="w-2.5 h-2.5 text-slate-950" />
                  </div>
                )}

                {/* Quick Rotate clicker handle */}
                {isEditMode && isSelected && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onUpdateStructureLayout(struct.id, { rotation: ((struct.rotation || 0) + 45) % 360 });
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="absolute bottom-1 left-1 w-4 h-4 bg-amber-500 rounded-md border border-white flex items-center justify-center cursor-pointer shadow shadow-black/10 hover:scale-110 active:scale-95 transition-all z-25"
                    title="Click to rotate 45°"
                  >
                    <RefreshCw className="w-2.5 h-2.5 text-slate-950" />
                  </div>
                )}
              </motion.button>
            );
          })}

          {/* Render Tables */}
          {tables
            .filter((t) => (t.zoneId || "main") === activeZoneId)
            .map((table) => {
              const isSelected = selectedTableId === table.id || activeTableId === table.id;
            const itemsInCart = table.currentCart.reduce((acc, item) => acc + item.quantity, 0);

            const tblWidth = table.width || 80;
            const tblHeight = table.height || 80;
            const styleX = table.x !== undefined ? `${table.x}%` : "50%";
            const styleY = table.y !== undefined ? `${table.y}%` : "50%";

            const getShapeClassName = (sh: Table["shape"]) => {
              switch (sh) {
                case "circle":
                  return "rounded-full aspect-square";
                case "oval":
                  return "rounded-[50%]";
                case "square":
                  return "rounded-xl aspect-square";
                case "rectangle":
                default:
                  return "rounded-xl";
              }
            };

            return (
              <motion.button
                key={table.id}
                onClick={() => {
                  if (isEditMode) {
                    setSelectedTableId(table.id);
                    setSelectedStructureId(null);
                  } else {
                    onSelectTable(table.id);
                  }
                }}
                onPointerDown={(e) => handlePointerDown(e, table.id)}
                style={{
                  position: "absolute",
                  left: styleX,
                  top: styleY,
                  width: `${tblWidth}px`,
                  height: `${tblHeight}px`,
                  rotate: table.rotation || 0,
                  touchAction: "none"
                }}
                className={`border-2 flex flex-col items-center justify-center shadow-sm select-none outline-none ${getShapeClassName(
                  table.shape || "square"
                )} ${getStatusColor(table.status, isSelected, isEditMode)}`}
                whileHover={isEditMode ? {} : { scale: 1.04 }}
                whileTap={isEditMode ? {} : { scale: 0.96 }}
                id={`btn-table-${table.id}`}
              >
                {/* Table details */}
                <span className="text-[11px] font-bold truncate max-w-[90%] leading-none">{table.name}</span>
                <span className="text-[8px] opacity-75 font-semibold mt-0.5">({table.seats || 4} Seats)</span>

                {!isEditMode && (
                  <div className="flex items-center gap-0.5 mt-1 text-[8px] font-bold">
                    {getStatusIcon(table.status)}
                    <span>{table.status}</span>
                  </div>
                )}

                {/* Open order counter badge */}
                {!isEditMode && itemsInCart > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white border-2 border-white font-black text-[9px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm"
                  >
                    {itemsInCart}
                  </motion.span>
                )}

                {/* Drag Alignment coordinates */}
                {isEditMode && isSelected && (
                  <div className="absolute -top-6 bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap">
                    X:{table.x || 0}%, Y:{table.y || 0}%
                  </div>
                )}

                {/* Resize Handle node */}
                {isEditMode && isSelected && (
                  <div
                    onPointerDown={(e) => handleResizePointerDown(e, table.id)}
                    className="absolute bottom-1 right-1 w-4 h-4 bg-amber-500 rounded-md border border-white flex items-center justify-center cursor-se-resize shadow shadow-black/10 hover:scale-110 active:scale-95 transition-all z-20"
                    title="Drag to resize this seating layout"
                  >
                    <Maximize2 className="w-2.5 h-2.5 text-slate-950" />
                  </div>
                )}

                {/* Quick Rotate clicker handle */}
                {isEditMode && isSelected && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onUpdateTableLayout(table.id, { rotation: ((table.rotation || 0) + 45) % 360 });
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="absolute bottom-1 left-1 w-4 h-4 bg-amber-500 rounded-md border border-white flex items-center justify-center cursor-pointer shadow shadow-black/10 hover:scale-110 active:scale-95 transition-all z-20"
                    title="Click to rotate 45°"
                  >
                    <RefreshCw className="w-2.5 h-2.5 text-slate-950" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Seating occupancy capacity metadata */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          POS Terminal Active
        </span>
        <span className="text-slate-600">
          Capacity: <b className="text-slate-800">{occupiedSeats}</b> / {totalSeats} seats (<b>{occupancyPercentage}%</b> Occupied)
        </span>
      </div>
    </div>
  );
}
