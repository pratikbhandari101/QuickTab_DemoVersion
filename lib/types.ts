export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  maxStock: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string; // Tailwind color name like "amber", "pink", "emerald", "purple", "blue", "orange"
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Table {
  id: string;
  name: string;
  status: "Free" | "Occupied" | "Billing" | "Dues";
  currentCart: CartItem[];
  x?: number; // relative coordinate percentage (0-100)
  y?: number; // relative coordinate percentage (0-100)
  width?: number; // width in pixels (e.g. 80)
  height?: number; // height in pixels (e.g. 80)
  shape?: "circle" | "square" | "rectangle" | "oval"; // visual shape
  seats?: number; // seating capacity
  rotation?: number; // rotation in degrees (e.g. 0, 90, 180, 270 or arbitrary)
  zoneId?: string; // identifier of the floor plan zone/room
}

export interface FloorStructure {
  id: string;
  type: "wall" | "counter" | "door" | "window" | "plant" | "label";
  label: string; // e.g. "Front Entrance", "Coffee Bar", "Flower Pot"
  x: number; // coordinate % (0-100)
  y: number; // coordinate % (0-100)
  width: number; // width in pixels
  height: number; // height in pixels
  color?: string; // styling options
  rotation?: number; // rotation in degrees
  zoneId?: string; // identifier of the floor plan zone/room
}

export interface FloorZone {
  id: string;
  name: string;
  description?: string;
}

export interface CreditTransactionLog {
  id: string;
  timestamp: string;
  type: "Charge" | "Payment";
  amount: number;
  description: string;
}

export interface CreditCustomer {
  id: string;
  name: string;
  phone: string;
  balance: number;
  limit: number;
  log: CreditTransactionLog[];
}

export interface SalesAuditLog {
  id: string;
  timestamp: string;
  tableName: string;
  itemsCount: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: "Cash" | "Card" | "Credit Ledger";
  customerName?: string;
}
