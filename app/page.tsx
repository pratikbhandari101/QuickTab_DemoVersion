"use client";

import React, { useState, useEffect } from "react";
import { MenuItem, Table, CreditCustomer, SalesAuditLog, FloorStructure, FloorZone, Category } from "@/lib/types";
import FloorPlan from "@/components/FloorPlan";
import POSBilling from "@/components/POSBilling";
import POSCart from "@/components/POSCart";
import CreditLedger from "@/components/CreditLedger";
import Management from "@/components/Management";
import LandingPage from "@/components/LandingPage";
import { Coffee, Armchair, Users, Settings, Clock, Calculator, MapPin, ChevronRight, ArrowLeft, Check, ShoppingBag, Receipt, Sparkles, AlertTriangle, Menu, X, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Firestore and Firebase helpers
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { collection, doc, setDoc, onSnapshot, deleteDoc, writeBatch } from "firebase/firestore";

// Mock Initial Database
const INITIAL_MENU: MenuItem[] = [
  { id: "m1", name: "Double Espresso", price: 3.5, category: "Beverages", stock: 45, maxStock: 100 },
  { id: "m2", name: "Vanilla Latte", price: 4.8, category: "Beverages", stock: 3, maxStock: 80 }, // low stock
  { id: "m3", name: "Ceremonial Matcha Latte", price: 5.5, category: "Beverages", stock: 25, maxStock: 60 },
  { id: "m4", name: "Butter Croissant", price: 3.95, category: "Pastries", stock: 12, maxStock: 30 },
  { id: "m5", name: "Chocolate Pain au Chocolat", price: 4.25, category: "Pastries", stock: 1, maxStock: 25 }, // low stock
  { id: "m6", name: "Avocado Sourdough Toast", price: 11.5, category: "Mains", stock: 15, maxStock: 40 },
  { id: "m7", name: "Smoked Salmon Bagel", price: 12.95, category: "Mains", stock: 8, maxStock: 30 },
  { id: "m8", name: "Salted Caramel Cheesecake", price: 6.5, category: "Desserts", stock: 10, maxStock: 20 },
  { id: "m9", name: "Warm Chocolate Brownie", price: 5.95, category: "Desserts", stock: 0, maxStock: 15 }, // sold out
];

const INITIAL_TABLES: Table[] = [
  { id: "t1", name: "Bar Stool 1", status: "Free", currentCart: [] },
  { id: "t2", name: "Bar Stool 2", status: "Occupied", currentCart: [{ menuItem: INITIAL_MENU[0], quantity: 2 }] },
  { id: "t3", name: "Bar Stool 3", status: "Free", currentCart: [] },
  { id: "t4", name: "Table 4 (4P)", status: "Free", currentCart: [] },
  { id: "t5", name: "Table 5 (2P)", status: "Billing", currentCart: [{ menuItem: INITIAL_MENU[5], quantity: 1 }, { menuItem: INITIAL_MENU[3], quantity: 2 }] },
  { id: "t6", name: "Table 6 (6P)", status: "Free", currentCart: [] },
  { id: "t7", name: "Window Nook A", status: "Free", currentCart: [] },
  { id: "t8", name: "Window Nook B", status: "Free", currentCart: [] },
  { id: "t9", name: "Patio Table 1", status: "Free", currentCart: [] },
  { id: "t10", name: "Patio Table 2", status: "Free", currentCart: [] },
];

const mapDefaultTablePosition = (id: string) => {
  switch (id) {
    case "t1": return { x: 10, y: 15, shape: "circle" as const, width: 70, height: 70, seats: 1, zoneId: "main" };
    case "t2": return { x: 22, y: 15, shape: "circle" as const, width: 70, height: 70, seats: 1, zoneId: "main" };
    case "t3": return { x: 34, y: 15, shape: "circle" as const, width: 70, height: 70, seats: 1, zoneId: "main" };
    case "t4": return { x: 12, y: 45, shape: "rectangle" as const, width: 90, height: 80, seats: 4, zoneId: "main" };
    case "t5": return { x: 32, y: 45, shape: "square" as const, width: 80, height: 80, seats: 2, zoneId: "main" };
    case "t6": return { x: 52, y: 45, shape: "rectangle" as const, width: 110, height: 80, seats: 6, zoneId: "main" };
    case "t7": return { x: 15, y: 78, shape: "square" as const, width: 80, height: 80, seats: 2, zoneId: "main" };
    case "t8": return { x: 35, y: 78, shape: "square" as const, width: 80, height: 80, seats: 2, zoneId: "main" };
    case "t9": return { x: 78, y: 30, shape: "rectangle" as const, width: 90, height: 80, seats: 4, zoneId: "garden" };
    case "t10": return { x: 78, y: 65, shape: "rectangle" as const, width: 90, height: 80, seats: 4, zoneId: "garden" };
    default: return { x: 40, y: 40, shape: "square" as const, width: 80, height: 80, seats: 4, zoneId: "main" };
  }
};

const INITIAL_CUSTOMERS: CreditCustomer[] = [
  {
    id: "c1",
    name: "Jane Cooper",
    phone: "555-0143",
    balance: 145.5,
    limit: 500,
    log: [
      { id: "l1", timestamp: "2026-07-04 14:32", type: "Charge", amount: 45.5, description: "Avocado Toast & Matcha (Table 5)" },
      { id: "l2", timestamp: "2026-07-05 09:15", type: "Charge", amount: 100, description: "Catering order settlement" },
    ],
  },
  {
    id: "c2",
    name: "Alex Rivera",
    phone: "555-0188",
    balance: 28.9,
    limit: 200,
    log: [
      { id: "l3", timestamp: "2026-07-05 10:20", type: "Charge", amount: 28.9, description: "Pain au Chocolat & Espresso (Bar 2)" },
    ],
  },
  {
    id: "c3",
    name: "Kristin Watson",
    phone: "555-0199",
    balance: 420,
    limit: 500, // Near limit warning
    log: [
      { id: "l4", timestamp: "2026-07-03 11:45", type: "Charge", amount: 320, description: "Company Meeting Breakfast Tab" },
      { id: "l5", timestamp: "2026-07-04 16:30", type: "Charge", amount: 100, description: "Evening mains + desserts" },
    ],
  },
];

const INITIAL_AUDIT_LOGS: SalesAuditLog[] = [
  {
    id: "a1",
    timestamp: "2026-07-04 15:40",
    tableName: "Table 4 (4P)",
    itemsCount: 4,
    subtotal: 35.8,
    tax: 3.58,
    discount: 5.0,
    total: 34.38,
    paymentMethod: "Card",
  },
  {
    id: "a2",
    timestamp: "2026-07-05 10:20",
    tableName: "Bar Stool 2",
    itemsCount: 2,
    subtotal: 26.2,
    tax: 2.62,
    discount: 0,
    total: 28.82,
    paymentMethod: "Credit Ledger",
    customerName: "Alex Rivera",
  },
];

const INITIAL_STRUCTURES: FloorStructure[] = [
  { id: "s1", type: "counter", label: "Espresso Bar & Counter", x: 0, y: 0, width: 350, height: 40, zoneId: "main" },
  { id: "s2", type: "label", label: "Window View", x: 3, y: 92, width: 120, height: 30, zoneId: "main" },
  { id: "s3", type: "door", label: "Sliding Patio Doors", x: 65, y: 15, width: 15, height: 120, zoneId: "main" },
  { id: "s4", type: "label", label: "Outdoor Patio", x: 82, y: 4, width: 120, height: 30, zoneId: "garden" },
  { id: "s5", type: "plant", label: "Ficus Tree", x: 50, y: 15, width: 50, height: 50, zoneId: "main" },
  { id: "s6", type: "window", label: "Street Facing Window", x: 0, y: 96, width: 300, height: 15, zoneId: "main" }
];

const DEFAULT_ZONES: FloorZone[] = [
  { id: "main", name: "Main Hall", description: "Indoor dining area" },
  { id: "garden", name: "Patio Garden", description: "Outdoor seating & garden" },
  { id: "upstairs", name: "Second Floor", description: "Quiet workspace & lounge" },
];

const INITIAL_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Beverages", description: "Brewed coffee, teas, iced shakes, and custom lattes", color: "amber" },
  { id: "cat-2", name: "Pastries", description: "Freshly baked croissants, slices, donuts, and muffins", color: "pink" },
  { id: "cat-3", name: "Mains", description: "Gourmet sandwiches, pastas, wraps, and savory breakfasts", color: "emerald" },
  { id: "cat-4", name: "Desserts", description: "Chilled gelatos, custard puddings, and sweet parfaits", color: "purple" }
];

export default function Page() {
  const [activeTab, setActiveTab] = useState<"POS" | "Credit" | "Management">("POS");
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  
  // Mode selection state (Landing page or interactive POS client)
  const [isPOSMode, setIsPOSMode] = useState<boolean>(true);
  const [checkingMode, setCheckingMode] = useState<boolean>(true);

  // Auto-detect environment and stored choices to skip landing page in desktop apps
  useEffect(() => {
    const isTauriEnv = typeof window !== "undefined" && ("__TAURI_INTERNALS__" in window || "__TAURI__" in window);
    const storedPOS = typeof window !== "undefined" && localStorage.getItem("cafe_pos_launched") === "true";
    
    if (isTauriEnv || storedPOS) {
      setIsPOSMode(true);
    } else {
      setIsPOSMode(false);
    }
    setCheckingMode(false);
  }, []);

  const handleLaunchPOS = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cafe_pos_launched", "true");
    }
    setIsPOSMode(true);
  };

  const handleExitToLanding = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cafe_pos_launched");
    }
    setIsPOSMode(false);
  };

  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [tables, setTables] = useState<Table[]>([]);
  const [customers, setCustomers] = useState<CreditCustomer[]>(INITIAL_CUSTOMERS);
  const [auditLogs, setAuditLogs] = useState<SalesAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [activeTableId, setActiveTableId] = useState<string | null>("t5"); // select table 5 initially
  const [posStep, setPosStep] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<string>("");

  // Multi-Zone properties
  const [zones, setZones] = useState<FloorZone[]>(DEFAULT_ZONES);
  const [activeZoneId, setActiveZoneId] = useState<string>("main");

  // Visual layout structures & canvas customization state
  const [structures, setStructures] = useState<FloorStructure[]>([]);
  const [canvasTheme, setCanvasTheme] = useState<string>("grid");
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);

  // Cloud Sync properties
  const [isCloudSync, setIsCloudSync] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error" | "offline">("offline");

  // Live Digital clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-persist menu when it changes
  useEffect(() => {
    if (menu && menu.length > 0) {
      localStorage.setItem("cafe_pos_menu", JSON.stringify(menu));
    }
  }, [menu]);

  // Auto-persist categories when they change
  useEffect(() => {
    if (categories && categories.length > 0) {
      localStorage.setItem("cafe_pos_categories", JSON.stringify(categories));
    }
  }, [categories]);

  // Initial local state loading and mappings
  useEffect(() => {
    const storedCloudSync = localStorage.getItem("cafe_pos_cloud_sync") === "true";
    setIsCloudSync(storedCloudSync);

    const storedZones = localStorage.getItem("cafe_pos_zones");
    if (storedZones) {
      try {
        setZones(JSON.parse(storedZones));
      } catch (e) {
        console.error("Failed to parse local zones", e);
      }
    } else {
      setZones(DEFAULT_ZONES);
      localStorage.setItem("cafe_pos_zones", JSON.stringify(DEFAULT_ZONES));
    }

    const storedTables = localStorage.getItem("cafe_pos_tables");
    if (storedTables) {
      try {
        const parsed = JSON.parse(storedTables);
        const mapped = parsed.map((t: Table) => ({
          ...t,
          zoneId: t.zoneId || (t.id === "t9" || t.id === "t10" ? "garden" : "main")
        }));
        setTables(mapped);
      } catch (e) {
        console.error("Failed to parse local tables", e);
      }
    } else {
      // Map mock tables to default layout styles and store
      const mapped = INITIAL_TABLES.map((t) => ({
        ...t,
        ...mapDefaultTablePosition(t.id)
      }));
      setTables(mapped);
      localStorage.setItem("cafe_pos_tables", JSON.stringify(mapped));
    }

    // Load background physical layout structures
    const storedStructures = localStorage.getItem("cafe_pos_structures");
    if (storedStructures) {
      try {
        const parsed = JSON.parse(storedStructures);
        const mapped = parsed.map((s: FloorStructure) => ({
          ...s,
          zoneId: s.zoneId || (s.id === "s4" ? "garden" : "main")
        }));
        setStructures(mapped);
      } catch (e) {
        console.error("Failed to parse local structures", e);
      }
    } else {
      setStructures(INITIAL_STRUCTURES);
      localStorage.setItem("cafe_pos_structures", JSON.stringify(INITIAL_STRUCTURES));
    }

    // Load menu catalog
    const storedMenu = localStorage.getItem("cafe_pos_menu");
    if (storedMenu) {
      try {
        setMenu(JSON.parse(storedMenu));
      } catch (e) {
        console.error("Failed to parse local menu", e);
      }
    } else {
      setMenu(INITIAL_MENU);
      localStorage.setItem("cafe_pos_menu", JSON.stringify(INITIAL_MENU));
    }

    // Load categories
    const storedCategories = localStorage.getItem("cafe_pos_categories");
    if (storedCategories) {
      try {
        const parsed = JSON.parse(storedCategories);
        if (Array.isArray(parsed)) {
          const uniqueCategories: Category[] = [];
          const seenIds = new Set<string>();
          const seenNames = new Set<string>();
          
          parsed.forEach((cat: any) => {
            if (cat && cat.id && cat.name) {
              const nameLower = cat.name.trim().toLowerCase();
              if (!seenIds.has(cat.id) && !seenNames.has(nameLower)) {
                seenIds.add(cat.id);
                seenNames.add(nameLower);
                uniqueCategories.push({
                  id: cat.id,
                  name: cat.name.trim(),
                  description: cat.description,
                  color: cat.color,
                });
              }
            }
          });

          if (uniqueCategories.length > 0) {
            setCategories(uniqueCategories);
            localStorage.setItem("cafe_pos_categories", JSON.stringify(uniqueCategories));
          } else {
            setCategories(INITIAL_CATEGORIES);
            localStorage.setItem("cafe_pos_categories", JSON.stringify(INITIAL_CATEGORIES));
          }
        } else {
          setCategories(INITIAL_CATEGORIES);
          localStorage.setItem("cafe_pos_categories", JSON.stringify(INITIAL_CATEGORIES));
        }
      } catch (e) {
        console.error("Failed to parse local categories", e);
        setCategories(INITIAL_CATEGORIES);
      }
    } else {
      setCategories(INITIAL_CATEGORIES);
      localStorage.setItem("cafe_pos_categories", JSON.stringify(INITIAL_CATEGORIES));
    }

    // Load styles and snapping configurations
    const storedTheme = localStorage.getItem("cafe_pos_canvas_theme") || "grid";
    setCanvasTheme(storedTheme);

    const storedSnap = localStorage.getItem("cafe_pos_snap_to_grid") !== "false";
    setSnapToGrid(storedSnap);
  }, []);

  // Firestore Listener for Live Seating Synchronization
  useEffect(() => {
    if (!isCloudSync) {
      setSyncStatus("offline");
      return;
    }

    setSyncStatus("syncing");
    const unsubscribe = onSnapshot(
      collection(db, "tables"),
      (snapshot) => {
        const dbTables: Table[] = [];
        snapshot.forEach((doc) => {
          dbTables.push(doc.data() as Table);
        });

        if (dbTables.length > 0) {
          // Sort by ID to preserve order if needed
          dbTables.sort((a, b) => a.id.localeCompare(b.id));
          setTables(dbTables);
          localStorage.setItem("cafe_pos_tables", JSON.stringify(dbTables));
          setSyncStatus("synced");
        } else {
          // Seed initial tables in Firestore if completely empty
          const seedFirestore = async () => {
            setSyncStatus("syncing");
            try {
              for (const table of tables) {
                await setDoc(doc(db, "tables", table.id), {
                  id: table.id,
                  name: table.name,
                  status: table.status,
                  currentCart: table.currentCart,
                  x: table.x !== undefined ? table.x : 50,
                  y: table.y !== undefined ? table.y : 50,
                  width: table.width || 80,
                  height: table.height || 80,
                  shape: table.shape || "square",
                  seats: table.seats || 4,
                  rotation: table.rotation || 0,
                  zoneId: table.zoneId || "main"
                });
              }
              setSyncStatus("synced");
            } catch (err) {
              console.error("Seeding Firestore tables collection failed:", err);
              setSyncStatus("error");
            }
          };
          if (tables.length > 0) {
            seedFirestore();
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "tables");
        setSyncStatus("error");
        setIsCloudSync(false);
        localStorage.setItem("cafe_pos_cloud_sync", "false");
        alert("Firestore permissions denied or database offline. Reverting to local storage persistence mode.");
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCloudSync]);

  // Firestore Listener for Live Background Structures Synchronization
  useEffect(() => {
    if (!isCloudSync) {
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, "structures"),
      (snapshot) => {
        const dbStructures: FloorStructure[] = [];
        snapshot.forEach((doc) => {
          dbStructures.push(doc.data() as FloorStructure);
        });

        if (dbStructures.length > 0) {
          // Sort by ID to preserve order
          dbStructures.sort((a, b) => a.id.localeCompare(b.id));
          setStructures(dbStructures);
          localStorage.setItem("cafe_pos_structures", JSON.stringify(dbStructures));
        } else {
          // Seed initial structures in Firestore if completely empty
          const seedFirestoreStructures = async () => {
            try {
              for (const struct of structures) {
                await setDoc(doc(db, "structures", struct.id), {
                  id: struct.id,
                  type: struct.type,
                  label: struct.label,
                  x: struct.x,
                  y: struct.y,
                  width: struct.width,
                  height: struct.height,
                  color: struct.color || "",
                  rotation: struct.rotation || 0,
                  zoneId: struct.zoneId || "main"
                });
              }
            } catch (err) {
              console.error("Seeding Firestore structures failed:", err);
            }
          };
          if (structures.length > 0) {
            seedFirestoreStructures();
          }
        }
      },
      (error) => {
        console.error("Firestore listener on structures failed:", error);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCloudSync]);

  // Firestore Listener for Live Zones Synchronization
  useEffect(() => {
    if (!isCloudSync) {
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, "zones"),
      (snapshot) => {
        const dbZones: FloorZone[] = [];
        snapshot.forEach((doc) => {
          dbZones.push(doc.data() as FloorZone);
        });

        if (dbZones.length > 0) {
          dbZones.sort((a, b) => a.id.localeCompare(b.id));
          setZones(dbZones);
          localStorage.setItem("cafe_pos_zones", JSON.stringify(dbZones));
        } else {
          // Seed initial zones in Firestore if completely empty
          const seedFirestoreZones = async () => {
            try {
              for (const zone of zones) {
                await setDoc(doc(db, "zones", zone.id), zone);
              }
            } catch (err) {
              console.error("Seeding Firestore zones failed:", err);
            }
          };
          if (zones.length > 0) {
            seedFirestoreZones();
          }
        }
      },
      (error) => {
        console.error("Firestore listener on zones failed:", error);
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCloudSync]);

  const activeTable = tables.find((t) => t.id === activeTableId) || null;

  // Auto-switch active zone to the selected table's zone
  useEffect(() => {
    if (activeTable && activeTable.zoneId && activeTable.zoneId !== activeZoneId) {
      setActiveZoneId(activeTable.zoneId);
    }
  }, [activeTableId, activeTable, activeZoneId]);

  // Single entity sync helper (saves to LocalStorage & Firestore if active)
  const persistTable = async (table: Table, updatedList?: Table[]) => {
    const list = updatedList || tables.map((t) => (t.id === table.id ? table : t));
    localStorage.setItem("cafe_pos_tables", JSON.stringify(list));

    if (isCloudSync) {
      setSyncStatus("syncing");
      try {
        await setDoc(doc(db, "tables", table.id), {
          id: table.id,
          name: table.name,
          status: table.status,
          currentCart: table.currentCart,
          x: table.x !== undefined ? table.x : 50,
          y: table.y !== undefined ? table.y : 50,
          width: table.width || 80,
          height: table.height || 80,
          shape: table.shape || "square",
          seats: table.seats || 4,
          rotation: table.rotation || 0,
          zoneId: table.zoneId || "main"
        });
        setSyncStatus("synced");
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `tables/${table.id}`);
        setSyncStatus("error");
      }
    }
  };

  // Delete sync helper
  const persistDeleteTable = async (tableId: string, updatedList: Table[]) => {
    localStorage.setItem("cafe_pos_tables", JSON.stringify(updatedList));

    if (isCloudSync) {
      setSyncStatus("syncing");
      try {
        await deleteDoc(doc(db, "tables", tableId));
        setSyncStatus("synced");
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `tables/${tableId}`);
        setSyncStatus("error");
      }
    }
  };

  // Toggle sync mode
  const handleToggleCloudSync = () => {
    const nextVal = !isCloudSync;
    setIsCloudSync(nextVal);
    localStorage.setItem("cafe_pos_cloud_sync", nextVal ? "true" : "false");
  };

  // Visual customizer handlers
  const handleUpdateTableLayout = (tableId: string, updates: Partial<Table>) => {
    setTables((prev) => {
      const next = prev.map((t) => {
        if (t.id === tableId) {
          const updated = { ...t, ...updates };
          persistTable(updated, prev.map(x => x.id === tableId ? updated : x));
          return updated;
        }
        return t;
      });
      return next;
    });
  };

  const handleAddTable = (name: string, shape: "circle" | "square" | "rectangle" | "oval", seats: number, zoneId?: string) => {
    const newId = `t-${Date.now()}`;
    const targetZone = zoneId || activeZoneId;
    const newTable: Table = {
      id: newId,
      name,
      status: "Free",
      currentCart: [],
      x: 35,
      y: 35,
      width: shape === "circle" || shape === "square" ? 80 : 100,
      height: 80,
      shape,
      seats,
      rotation: 0,
      zoneId: targetZone
    };

    setTables((prev) => {
      const next = [...prev, newTable];
      localStorage.setItem("cafe_pos_tables", JSON.stringify(next));

      if (isCloudSync) {
        setSyncStatus("syncing");
        setDoc(doc(db, "tables", newId), {
          id: newTable.id,
          name: newTable.name,
          status: newTable.status,
          currentCart: newTable.currentCart,
          x: newTable.x,
          y: newTable.y,
          width: newTable.width,
          height: newTable.height,
          shape: newTable.shape,
          seats: newTable.seats,
          rotation: newTable.rotation || 0,
          zoneId: newTable.zoneId
        })
          .then(() => setSyncStatus("synced"))
          .catch((err) => {
            handleFirestoreError(err, OperationType.CREATE, `tables/${newId}`);
            setSyncStatus("error");
          });
      }
      return next;
    });
  };

  const handleDeleteTable = (tableId: string) => {
    setTables((prev) => {
      const next = prev.filter((t) => t.id !== tableId);
      persistDeleteTable(tableId, next);
      return next;
    });
    if (activeTableId === tableId) {
      setActiveTableId(null);
    }
  };

  // Structures persist and state handlers
  const persistStructure = async (struct: FloorStructure, updatedList?: FloorStructure[]) => {
    const list = updatedList || structures.map((s) => (s.id === struct.id ? struct : s));
    localStorage.setItem("cafe_pos_structures", JSON.stringify(list));

    if (isCloudSync) {
      try {
        await setDoc(doc(db, "structures", struct.id), {
          id: struct.id,
          type: struct.type,
          label: struct.label,
          x: struct.x,
          y: struct.y,
          width: struct.width,
          height: struct.height,
          color: struct.color || "",
          rotation: struct.rotation || 0,
          zoneId: struct.zoneId || "main"
        });
      } catch (err) {
        console.error("Failed to persist structure to Firestore:", err);
      }
    }
  };

  const persistDeleteStructure = async (structureId: string, updatedList: FloorStructure[]) => {
    localStorage.setItem("cafe_pos_structures", JSON.stringify(updatedList));

    if (isCloudSync) {
      try {
        await deleteDoc(doc(db, "structures", structureId));
      } catch (err) {
        console.error("Failed to delete structure from Firestore:", err);
      }
    }
  };

  const handleUpdateStructureLayout = (id: string, updates: Partial<FloorStructure>) => {
    setStructures((prev) => {
      const next = prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...updates };
          persistStructure(updated, prev.map(x => x.id === id ? updated : x));
          return updated;
        }
        return s;
      });
      return next;
    });
  };

  const handleAddStructure = (type: FloorStructure["type"], label: string, zoneId?: string) => {
    const newId = `s-${Date.now()}`;
    const targetZone = zoneId || activeZoneId;
    const newStruct: FloorStructure = {
      id: newId,
      type,
      label,
      x: 40,
      y: 40,
      width: type === "counter" || type === "wall" || type === "window" ? 150 : 80,
      height: type === "wall" ? 15 : type === "window" ? 12 : 60,
      color: "",
      rotation: 0,
      zoneId: targetZone
    };

    setStructures((prev) => {
      const next = [...prev, newStruct];
      localStorage.setItem("cafe_pos_structures", JSON.stringify(next));

      if (isCloudSync) {
        setDoc(doc(db, "structures", newId), {
          id: newStruct.id,
          type: newStruct.type,
          label: newStruct.label,
          x: newStruct.x,
          y: newStruct.y,
          width: newStruct.width,
          height: newStruct.height,
          color: newStruct.color || "",
          rotation: 0,
          zoneId: newStruct.zoneId
        }).catch((err) => console.error("Error adding structure", err));
      }
      return next;
    });
  };

  // Zones State handlers
  const persistDeleteZone = async (zoneId: string, updatedList: FloorZone[]) => {
    localStorage.setItem("cafe_pos_zones", JSON.stringify(updatedList));

    if (isCloudSync) {
      try {
        await deleteDoc(doc(db, "zones", zoneId));
      } catch (err) {
        console.error("Failed to delete zone from Firestore:", err);
      }
    }
  };

  const handleAddZone = (name: string, description?: string) => {
    const newId = `z-${Date.now()}`;
    const newZone: FloorZone = { id: newId, name, description };
    setZones((prev) => {
      const next = [...prev, newZone];
      localStorage.setItem("cafe_pos_zones", JSON.stringify(next));
      if (isCloudSync) {
        setDoc(doc(db, "zones", newId), newZone).catch((err) =>
          console.error("Failed to save new zone to Firestore", err)
        );
      }
      return next;
    });
  };

  const handleDeleteZone = (zoneId: string) => {
    if (zoneId === "main") {
      alert("Cannot delete the default Main Hall zone.");
      return;
    }
    // Check if any tables or structures are in this zone
    const tablesInZone = tables.filter((t) => (t.zoneId || "main") === zoneId);
    const structuresInZone = structures.filter((s) => (s.zoneId || "main") === zoneId);
    if (tablesInZone.length > 0 || structuresInZone.length > 0) {
      alert(`Cannot delete this zone. It still contains ${tablesInZone.length} tables and ${structuresInZone.length} physical structures. Move or delete them first.`);
      return;
    }

    setZones((prev) => {
      const next = prev.filter((z) => z.id !== zoneId);
      persistDeleteZone(zoneId, next);
      return next;
    });

    if (activeZoneId === zoneId) {
      setActiveZoneId("main");
    }
  };

  const handleDeleteStructure = (id: string) => {
    setStructures((prev) => {
      const next = prev.filter((s) => s.id !== id);
      persistDeleteStructure(id, next);
      return next;
    });
  };

  const handleUpdateCanvasTheme = (theme: string) => {
    setCanvasTheme(theme);
    localStorage.setItem("cafe_pos_canvas_theme", theme);
  };

  const handleToggleSnapToGrid = () => {
    const nextVal = !snapToGrid;
    setSnapToGrid(nextVal);
    localStorage.setItem("cafe_pos_snap_to_grid", nextVal ? "true" : "false");
  };

  // Active table handlers
  const handleSelectTable = (tableId: string) => {
    setActiveTableId(tableId);
    setPosStep(2); // Automatically advance to menu selection
    const targetTable = tables.find((t) => t.id === tableId);
    if (targetTable && targetTable.status === "Free") {
      const updatedTable = { ...targetTable, status: "Occupied" as const };
      const updatedList = tables.map((t) => (t.id === tableId ? updatedTable : t));
      setTables(updatedList);
      persistTable(updatedTable, updatedList);
    }
  };

  const handleAddToTableCart = (item: MenuItem, qty: number) => {
    if (!activeTableId) return;

    // Verify stock is sufficient
    const currentQtyInCart = activeTable?.currentCart.find((c) => c.menuItem.id === item.id)?.quantity || 0;
    if (item.stock < currentQtyInCart + qty) {
      alert(`Cannot add more. Only ${item.stock} units of ${item.name} are available in stock.`);
      return;
    }

    const targetTable = tables.find((t) => t.id === activeTableId);
    if (!targetTable) return;

    const existingItemIndex = targetTable.currentCart.findIndex((c) => c.menuItem.id === item.id);
    let updatedCart = targetTable.currentCart.map((c) => ({ ...c }));

    if (existingItemIndex > -1) {
      updatedCart[existingItemIndex].quantity += qty;
    } else {
      updatedCart.push({ menuItem: item, quantity: qty });
    }

    const updatedTable = {
      ...targetTable,
      currentCart: updatedCart,
      status: "Occupied" as const,
    };

    const updatedList = tables.map((t) => (t.id === activeTableId ? updatedTable : t));
    setTables(updatedList);
    persistTable(updatedTable, updatedList);
  };

  const handleUpdateCartItemQty = (menuItemId: string, change: number) => {
    if (!activeTableId) return;

    const targetTable = tables.find((t) => t.id === activeTableId);
    if (!targetTable) return;

    let hasError = false;
    const updatedCart = targetTable.currentCart
      .map((c) => {
        if (c.menuItem.id === menuItemId) {
          const newQty = c.quantity + change;
          if (change > 0 && c.menuItem.stock < newQty) {
            alert(`Cannot increase quantity. Max in-stock capacity is ${c.menuItem.stock}.`);
            hasError = true;
            return c;
          }
          return { ...c, quantity: newQty };
        }
        return c;
      })
      .filter((c) => c.quantity > 0);

    if (hasError) return;

    const updatedTable = {
      ...targetTable,
      currentCart: updatedCart,
      status: updatedCart.length === 0 ? ("Free" as const) : targetTable.status,
    };

    const updatedList = tables.map((t) => (t.id === activeTableId ? updatedTable : t));
    setTables(updatedList);
    persistTable(updatedTable, updatedList);
  };

  const handleRemoveCartItem = (menuItemId: string) => {
    if (!activeTableId) return;

    const targetTable = tables.find((t) => t.id === activeTableId);
    if (!targetTable) return;

    const updatedCart = targetTable.currentCart.filter((c) => c.menuItem.id !== menuItemId);
    const updatedTable = {
      ...targetTable,
      currentCart: updatedCart,
      status: updatedCart.length === 0 ? ("Free" as const) : targetTable.status,
    };

    const updatedList = tables.map((t) => (t.id === activeTableId ? updatedTable : t));
    setTables(updatedList);
    persistTable(updatedTable, updatedList);
  };

  const handleHoldOrder = () => {
    if (!activeTableId) return;

    const targetTable = tables.find((t) => t.id === activeTableId);
    if (!targetTable) return;

    const updatedTable = { ...targetTable, status: "Occupied" as const };
    const updatedList = tables.map((t) => (t.id === activeTableId ? updatedTable : t));

    setTables(updatedList);
    persistTable(updatedTable, updatedList);

    setActiveTableId(null);
    setPosStep(1); // Reset to seating Selection
  };

  const handleSimulateBill = () => {
    if (!activeTableId) return;

    const targetTable = tables.find((t) => t.id === activeTableId);
    if (!targetTable) return;

    const updatedTable = { ...targetTable, status: "Billing" as const };
    const updatedList = tables.map((t) => (t.id === activeTableId ? updatedTable : t));

    setTables(updatedList);
    persistTable(updatedTable, updatedList);
  };

  // Checkout and settle order
  const handleCompleteCheckout = (
    paymentMethod: "Cash" | "Card" | "Credit Ledger",
    customerName?: string,
    customerId?: string,
    discountAmount: number = 0
  ) => {
    if (!activeTable) return;

    const cart = activeTable.currentCart;
    const subtotal = cart.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);
    const tax = subtotal * 0.0;
    const finalTotal = Math.max(0, subtotal + tax - discountAmount);

    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);

    // 1. Log transaction in Audit Logs
    const newAuditLog: SalesAuditLog = {
      id: `a-${Date.now()}`,
      timestamp: nowStr,
      tableName: activeTable.name,
      itemsCount: cart.reduce((acc, c) => acc + c.quantity, 0),
      subtotal,
      tax,
      discount: discountAmount,
      total: finalTotal,
      paymentMethod,
      customerName: paymentMethod === "Credit Ledger" ? customerName : undefined,
    };

    setAuditLogs((prev) => [...prev, newAuditLog]);

    // 2. Subtract dishes stocks
    setMenu((prevMenu) =>
      prevMenu.map((menuItem) => {
        const cartItem = cart.find((c) => c.menuItem.id === menuItem.id);
        if (cartItem) {
          return { ...menuItem, stock: Math.max(0, menuItem.stock - cartItem.quantity) };
        }
        return menuItem;
      })
    );

    // 3. Update customer's outstanding balance if Credit Ledger
    if (paymentMethod === "Credit Ledger" && customerId) {
      setCustomers((prevCusts) =>
        prevCusts.map((cust) => {
          if (cust.id === customerId) {
            return {
              ...cust,
              balance: cust.balance + finalTotal,
              log: [
                ...cust.log,
                {
                  id: `l-${Date.now()}`,
                  timestamp: nowStr,
                  type: "Charge",
                  amount: finalTotal,
                  description: `Settle Check (Table: ${activeTable.name})`,
                },
              ],
            };
          }
          return cust;
        })
      );
    }

    // 4. Reset table status & clear cart
    const updatedTable = { ...activeTable, status: "Free" as const, currentCart: [] };
    const updatedList = tables.map((t) => (t.id === activeTable.id ? updatedTable : t));
    setTables(updatedList);
    persistTable(updatedTable, updatedList);

    setActiveTableId(null);
    setPosStep(1); // Reset to seating Selection
  };

  const handleTransferTable = (fromId: string, toId: string) => {
    const fromTable = tables.find((t) => t.id === fromId);
    const toTable = tables.find((t) => t.id === toId);
    if (!fromTable || !toTable) return;

    const cartToMove = [...fromTable.currentCart];

    const updatedFromTable = {
      ...fromTable,
      currentCart: [],
      status: "Free" as const,
    };

    const updatedToTable = {
      ...toTable,
      currentCart: cartToMove,
      status: fromTable.status,
    };

    const updatedList = tables.map((t) => {
      if (t.id === fromId) return updatedFromTable;
      if (t.id === toId) return updatedToTable;
      return t;
    });

    setTables(updatedList);
    persistTable(updatedFromTable, updatedList);
    persistTable(updatedToTable, updatedList);

    setActiveTableId(toId);
  };

  const handleSwapTables = (idA: string, idB: string) => {
    const tableA = tables.find((t) => t.id === idA);
    const tableB = tables.find((t) => t.id === idB);
    if (!tableA || !tableB) return;

    const cartA = [...tableA.currentCart];
    const statusA = tableA.status;
    const cartB = [...tableB.currentCart];
    const statusB = tableB.status;

    const updatedTableA = {
      ...tableA,
      currentCart: cartB,
      status: statusB,
    };

    const updatedTableB = {
      ...tableB,
      currentCart: cartA,
      status: statusA,
    };

    const updatedList = tables.map((t) => {
      if (t.id === idA) return updatedTableA;
      if (t.id === idB) return updatedTableB;
      return t;
    });

    setTables(updatedList);
    persistTable(updatedTableA, updatedList);
    persistTable(updatedTableB, updatedList);
  };

  const handleMergeTables = (fromId: string, toId: string) => {
    const fromTable = tables.find((t) => t.id === fromId);
    const toTable = tables.find((t) => t.id === toId);
    if (!fromTable || !toTable) return;

    const mergedCart = [...toTable.currentCart];
    fromTable.currentCart.forEach((itemFrom) => {
      const existingIdx = mergedCart.findIndex((itemTo) => itemTo.menuItem.id === itemFrom.menuItem.id);
      if (existingIdx > -1) {
        mergedCart[existingIdx] = {
          ...mergedCart[existingIdx],
          quantity: mergedCart[existingIdx].quantity + itemFrom.quantity,
        };
      } else {
        mergedCart.push({ ...itemFrom });
      }
    });

    const updatedFromTable = {
      ...fromTable,
      currentCart: [],
      status: "Free" as const,
    };

    const updatedToTable = {
      ...toTable,
      currentCart: mergedCart,
      status: toTable.status === "Free" ? fromTable.status : toTable.status,
    };

    const updatedList = tables.map((t) => {
      if (t.id === fromId) return updatedFromTable;
      if (t.id === toId) return updatedToTable;
      return t;
    });

    setTables(updatedList);
    persistTable(updatedFromTable, updatedList);
    persistTable(updatedToTable, updatedList);

    setActiveTableId(toId);
  };

  // Credit customer ledger handlers
  const handleRegisterCustomer = (name: string, phone: string, limit: number) => {
    const newCust: CreditCustomer = {
      id: `c-${Date.now()}`,
      name,
      phone,
      balance: 0,
      limit,
      log: [],
    };
    setCustomers((prev) => [...prev, newCust]);
  };

  const handleRecordPayment = (customerId: string, amount: number, note: string) => {
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 16);

    setCustomers((prevCusts) =>
      prevCusts.map((cust) => {
        if (cust.id === customerId) {
          return {
            ...cust,
            balance: Math.max(0, cust.balance - amount),
            log: [
              ...cust.log,
              {
                id: `l-${Date.now()}`,
                timestamp: nowStr,
                type: "Payment",
                amount,
                description: note || "Customer payment settlement",
              },
            ],
          };
        }
        return cust;
      })
    );

    // Also register this payment in the Sales Audit Logs so owner knows cash was collected
    const collectionLog: SalesAuditLog = {
      id: `a-${Date.now()}`,
      timestamp: nowStr,
      tableName: "Dues Collection",
      itemsCount: 0,
      subtotal: -amount,
      tax: 0,
      discount: 0,
      total: -amount,
      paymentMethod: "Cash",
      customerName: customers.find((c) => c.id === customerId)?.name,
    };
    setAuditLogs((prev) => [...prev, collectionLog]);
  };

  // Management / menu items handlers
  const handleAddNewDish = (
    name: string,
    price: number,
    category: MenuItem["category"],
    stock: number,
    max: number
  ) => {
    const newDish: MenuItem = {
      id: `m-${Date.now()}`,
      name,
      price,
      category,
      stock,
      maxStock: max,
    };
    setMenu((prev) => [...prev, newDish]);
  };

  const handleUpdateMenuDish = (dishId: string, updatedFields: Partial<MenuItem>) => {
    setMenu((prev) =>
      prev.map((item) => {
        if (item.id === dishId) {
          return { ...item, ...updatedFields };
        }
        return item;
      })
    );
  };

  const handleDeleteMenuDish = (dishId: string) => {
    setMenu((prev) => prev.filter((item) => item.id !== dishId));
  };

  const handleAddCategory = (name: string, description?: string, color?: string) => {
    const randomSuffix = Math.floor(Math.random() * 1000000).toString(36);
    const newId = `cat-${Date.now()}-${randomSuffix}`;
    const newCategory: Category = {
      id: newId,
      name,
      description,
      color: color || "amber",
    };
    setCategories((prev) => {
      if (prev.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
        return prev;
      }
      return [...prev, newCategory];
    });
  };

  const handleUpdateCategory = (categoryId: string, name: string, description?: string, color?: string) => {
    const oldCategory = categories.find((c) => c.id === categoryId);
    if (!oldCategory) return;

    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, name, description, color } : c))
    );

    if (oldCategory.name !== name) {
      setMenu((prev) =>
        prev.map((item) => (item.category === oldCategory.name ? { ...item, category: name } : item))
      );
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (categories.length <= 1) {
      alert("You must keep at least one category.");
      return;
    }
    const categoryToDelete = categories.find((c) => c.id === categoryId);
    if (!categoryToDelete) return;

    const remainingCategories = categories.filter((c) => c.id !== categoryId);
    const fallbackCategory = remainingCategories[0]?.name || "General";

    setCategories(remainingCategories);
    setMenu((prev) =>
      prev.map((item) => (item.category === categoryToDelete.name ? { ...item, category: fallbackCategory } : item))
    );
  };

  const handleDeleteCategories = (categoryIds: string[]) => {
    const remaining = categories.filter((c) => !categoryIds.includes(c.id));
    if (remaining.length === 0) {
      alert("You must keep at least one category.");
      return;
    }

    const deletedNames = categories
      .filter((c) => categoryIds.includes(c.id))
      .map((c) => c.name);

    const fallbackCategory = remaining[0]?.name || "General";

    setCategories(remaining);
    setMenu((prev) =>
      prev.map((item) => (deletedNames.includes(item.category) ? { ...item, category: fallbackCategory } : item))
    );
  };

  const handleBulkAddMenu = (newDishes: MenuItem[]) => {
    setMenu((prev) => [...prev, ...newDishes]);
  };

  const handleReplaceMenu = (newMenu: MenuItem[]) => {
    setMenu(newMenu);
  };

  if (checkingMode) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <span className="text-xs font-bold uppercase tracking-widest font-mono">Loading operator workspace...</span>
      </div>
    );
  }

  if (!isPOSMode) {
    return <LandingPage onLaunchPOS={handleLaunchPOS} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" id="main-terminal-container">
      {/* Premium Horizontal Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          {/* Left section: Hamburger Dropdown + Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all flex items-center justify-center cursor-pointer border border-slate-800 bg-slate-950/60 shadow-inner"
                title="Open Terminal Modules"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Hamburger Dropdown Panel */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2.5 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden text-white"
                  >
                    <div className="px-3 py-2 border-b border-slate-800 mb-2">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest font-mono">Select Terminal Module</span>
                    </div>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setActiveTab("POS");
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                          activeTab === "POS"
                            ? "bg-amber-500 text-slate-950 font-black"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Calculator className="w-4 h-4" />
                          <span>POS Seating & Sales</span>
                        </div>
                        {activeTab === "POS" && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("Credit");
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                          activeTab === "Credit"
                            ? "bg-amber-500 text-slate-950 font-black"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Users className="w-4 h-4" />
                          <span>Customer Credit Tabs</span>
                        </div>
                        {activeTab === "Credit" && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("Management");
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                          activeTab === "Management"
                            ? "bg-amber-500 text-slate-950 font-black"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Settings className="w-4 h-4" />
                          <span>Control Tower</span>
                        </div>
                        {activeTab === "Management" && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                      </button>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800 px-3 pb-1 flex items-center justify-between text-[9px] text-slate-500 font-bold">
                      <span>ESPRESS CAFE TERMINAL</span>
                      <span>v1.3.0</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Logo / Brand Header */}
            <div className="flex items-center gap-2.5" id="brand-logo-header">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-slate-900 shadow-md shrink-0">
                <Coffee className="w-4 h-4 font-extrabold" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-extrabold text-xs tracking-tight text-white leading-tight">Espress Café</h1>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block">Operator Console</span>
              </div>
            </div>
          </div>

          {/* Center Section: Active POS steps or active tab description */}
          <div className="flex-1 max-w-xl mx-auto hidden sm:flex items-center justify-center gap-2">
            {activeTab === "POS" ? (
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 border border-slate-800 rounded-xl shadow-inner">
                {/* Step 1: Floor Plan */}
                <button
                  onClick={() => setPosStep(1)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    posStep === 1
                      ? "bg-amber-500 text-slate-950 font-black shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[9px] font-black ${
                    posStep === 1 ? "bg-slate-900 text-amber-400" : "bg-slate-800 text-slate-400"
                  }`}>
                    1
                  </span>
                  <span>Floor Plan</span>
                </button>

                <ChevronRight className="w-3.5 h-3.5 text-slate-700 shrink-0" />

                {/* Step 2: Combined Order & Check */}
                <button
                  onClick={() => {
                    if (activeTableId) {
                      setPosStep(2);
                    } else {
                      alert("Please select a table from the floor plan first!");
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    posStep === 2
                      ? "bg-amber-500 text-slate-950 font-black shadow-md"
                      : activeTableId
                      ? "text-slate-400 hover:text-white hover:bg-slate-800/50"
                      : "opacity-40 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[9px] font-black ${
                    posStep === 2 ? "bg-slate-900 text-amber-400" : "bg-slate-800 text-slate-400"
                  }`}>
                    2
                  </span>
                  <span>Dishes & Checkout</span>
                </button>

                {/* Active Session Table badge inside the steps list */}
                {activeTable && (
                  <div className="border-l border-slate-800 pl-2.5 ml-1.5 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-amber-400 font-extrabold px-2 py-0.5 rounded-md font-mono">
                      {activeTable.name}
                    </span>
                  </div>
                )}
              </div>
            ) : activeTab === "Credit" ? (
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400 bg-slate-950 px-4 py-2 border border-slate-800 rounded-xl shadow-inner font-mono">
                <Users className="w-4 h-4" />
                <span>Customer Credit Ledger</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400 bg-slate-950 px-4 py-2 border border-slate-800 rounded-xl shadow-inner font-mono">
                <Settings className="w-4 h-4" />
                <span>Café Control Tower</span>
              </div>
            )}
          </div>

          {/* Right section: System status details */}
          <div className="flex items-center gap-3.5 text-xs text-slate-400 font-semibold shrink-0">
            {typeof window !== "undefined" && !("__TAURI_INTERNALS__" in window || "__TAURI__" in window) && (
              <button
                onClick={handleExitToLanding}
                className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-bold text-[10px] tracking-wider uppercase font-mono shadow-inner shadow-amber-500/5 active:scale-95"
              >
                Product Page
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className={`w-1.5 h-1.5 rounded-full bg-current animate-pulse ${isCloudSync ? "text-amber-400" : "text-emerald-400"}`}></span>
              <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">
                {isCloudSync ? "Synced" : "Local"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300 font-mono text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{currentTime || "00:00:00"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Workspace Area */}
      <main className="flex-grow max-w-[1600px] w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-between">
        <div>
          {/* Dynamic Switch Workspace content */}
          <div className="space-y-6">
            {activeTab === "POS" && (
              <div className="space-y-6" id="pos-billing-sub-workspace">
                <div className="w-full">
                  {posStep === 1 && (
                    <div className="space-y-4">
                      <FloorPlan
                        tables={tables}
                        activeTableId={activeTableId}
                        onSelectTable={handleSelectTable}
                        onUpdateTableLayout={handleUpdateTableLayout}
                        onAddTable={handleAddTable}
                        onDeleteTable={handleDeleteTable}
                        isCloudSync={isCloudSync}
                        onToggleCloudSync={handleToggleCloudSync}
                        syncStatus={syncStatus}
                        structures={structures}
                        onAddStructure={handleAddStructure}
                        onUpdateStructureLayout={handleUpdateStructureLayout}
                        onDeleteStructure={handleDeleteStructure}
                        canvasTheme={canvasTheme}
                        onUpdateCanvasTheme={handleUpdateCanvasTheme}
                        snapToGrid={snapToGrid}
                        onToggleSnapToGrid={handleToggleSnapToGrid}
                        zones={zones}
                        activeZoneId={activeZoneId}
                        onSelectZone={setActiveZoneId}
                        onAddZone={handleAddZone}
                        onDeleteZone={handleDeleteZone}
                      />

                      {/* Interactive Step Navigation Action Bar below Floor Plan */}
                      {activeTableId && (
                        <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 flex items-center justify-between shadow-xs">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                              <Check className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-800">Table "{activeTable?.name}" is selected</p>
                              <p className="text-[10px] text-slate-500 font-semibold">Proceed to the combined menu and checkout panel to place orders.</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setPosStep(2)}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                          >
                            <span>Proceed to Menu & Checkout (Step 2)</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {posStep === 2 && (
                    <div className="space-y-4">
                      {/* Combined Step Header with back controls */}
                      <div className="flex items-center justify-between bg-slate-50/80 border border-slate-100 p-3 rounded-2xl">
                        <button
                          onClick={() => setPosStep(1)}
                          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-800 bg-white border border-slate-200/80 px-4 py-2 rounded-xl shadow-xs font-extrabold transition-all cursor-pointer"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back to Floor Plan
                        </button>
                        <span className="text-xs text-slate-500 font-bold font-mono">Unified Order & Settlement Console</span>
                      </div>

                      {/* Unified side-by-side grid */}
                      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                        {/* Menu catalog panel */}
                        <div className="xl:col-span-8">
                          <POSBilling
                            menu={menu}
                            categories={categories}
                            onAddToTableCart={handleAddToTableCart}
                            activeTableName={activeTable ? activeTable.name : "Unselected"}
                            tables={tables}
                            activeTable={activeTable}
                            onTransferTable={handleTransferTable}
                            onSwapTables={handleSwapTables}
                            onMergeTables={handleMergeTables}
                          />
                        </div>

                        {/* Order Cart & Payment Settlement Panel */}
                        <div className="xl:col-span-4 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                            <div>
                              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Active Check Summary</h3>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Table: {activeTable?.name}</p>
                            </div>
                            <span className="text-[10px] bg-slate-100 border border-slate-200 font-bold px-2.5 py-1 rounded-full text-slate-600">
                              Locked Checkout
                            </span>
                          </div>

                          <POSCart
                            activeTable={activeTable}
                            onUpdateCartItemQty={handleUpdateCartItemQty}
                            onRemoveCartItem={handleRemoveCartItem}
                            onHoldOrder={handleHoldOrder}
                            onSimulateBill={handleSimulateBill}
                            onCompleteCheckout={handleCompleteCheckout}
                            customers={customers}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "Credit" && (
              <CreditLedger
                customers={customers}
                onRegisterCustomer={handleRegisterCustomer}
                onRecordPayment={handleRecordPayment}
              />
            )}

            {activeTab === "Management" && (
              <Management
                menu={menu}
                auditLogs={auditLogs}
                onAddNewDish={handleAddNewDish}
                onUpdateMenuDish={handleUpdateMenuDish}
                onDeleteMenuDish={handleDeleteMenuDish}
                categories={categories}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                onDeleteCategories={handleDeleteCategories}
                onBulkAddMenu={handleBulkAddMenu}
                onReplaceMenu={handleReplaceMenu}
              />
            )}
          </div>
        </div>

        {/* Footer legalities */}
        <footer className="mt-12 pt-6 border-t border-slate-100 text-[10px] text-slate-400 font-semibold flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <span>© 2026 Espress Café POS System. All Rights Reserved. Hybrid Persistent engine active.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-600 transition-colors">Security Rules</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Operator Guidelines</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Ledger Audit Specs</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
