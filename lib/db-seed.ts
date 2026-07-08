import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "./firebase";

export async function seedDatabaseIfEmpty() {
  try {
    // 1. Check products
    const productsCol = collection(db, "products");
    const productsSnapshot = await getDocs(productsCol);
    
    if (productsSnapshot.empty) {
      console.log("Seeding default products...");
      const defaultProducts = [
        { id: "p1", name: "Classic Espresso", price: 120, category: "Beverages", stock: 99, isAvailable: true },
        { id: "p2", name: "Cappuccino", price: 150, category: "Beverages", stock: 80, isAvailable: true },
        { id: "p3", name: "Café Latte", price: 160, category: "Beverages", stock: 75, isAvailable: true },
        { id: "p4", name: "Iced Americano", price: 140, category: "Beverages", stock: 120, isAvailable: true },
        { id: "p5", name: "Peach Iced Tea", price: 150, category: "Beverages", stock: 45, isAvailable: true },
        { id: "p6", name: "Matcha Latte", price: 180, category: "Beverages", stock: 30, isAvailable: true },
        { id: "p7", name: "Chocolate Croissant", price: 110, category: "Desserts", stock: 12, isAvailable: true },
        { id: "p8", name: "Blueberry Cheesecake", price: 190, category: "Desserts", stock: 5, isAvailable: true },
        { id: "p9", name: "Red Velvet Slice", price: 180, category: "Desserts", stock: 8, isAvailable: true },
        { id: "p10", name: "Tiramisu", price: 220, category: "Desserts", stock: 6, isAvailable: true },
        { id: "p11", name: "Avocado Toast", price: 240, category: "Mains", stock: 25, isAvailable: true },
        { id: "p12", name: "Grilled Chicken Panini", price: 280, category: "Mains", stock: 15, isAvailable: true },
        { id: "p13", name: "Truffle Fries", price: 160, category: "Sides", stock: 40, isAvailable: true },
        { id: "p14", name: "Margherita Pizza", price: 320, category: "Mains", stock: 10, isAvailable: true }
      ];
      
      const batch = writeBatch(db);
      defaultProducts.forEach((p) => {
        batch.set(doc(db, "products", p.id), p);
      });
      await batch.commit();
    }

    // 2. Check tables
    const tablesCol = collection(db, "tables");
    const tablesSnapshot = await getDocs(tablesCol);
    
    if (tablesSnapshot.empty) {
      console.log("Seeding default tables...");
      const defaultTables = [
        { id: "t1", number: "Table 1", seats: 2, floor: "Ground Floor", status: "vacant", activeOrderId: "" },
        { id: "t2", number: "Table 2", seats: 4, floor: "Ground Floor", status: "vacant", activeOrderId: "" },
        { id: "t3", number: "Table 3", seats: 2, floor: "Ground Floor", status: "vacant", activeOrderId: "" },
        { id: "t4", number: "Table 4", seats: 6, floor: "Ground Floor", status: "vacant", activeOrderId: "" },
        { id: "t10", number: "Table 10", seats: 4, floor: "First Floor", status: "vacant", activeOrderId: "" },
        { id: "t11", number: "Table 11", seats: 2, floor: "First Floor", status: "vacant", activeOrderId: "" },
        { id: "t12", number: "Table 12", seats: 4, floor: "First Floor", status: "vacant", activeOrderId: "" },
        { id: "b1", number: "Bar 1", seats: 1, floor: "Bar Counter", status: "vacant", activeOrderId: "" },
        { id: "b2", number: "Bar 2", seats: 1, floor: "Bar Counter", status: "vacant", activeOrderId: "" },
        { id: "b3", number: "Bar 3", seats: 1, floor: "Bar Counter", status: "vacant", activeOrderId: "" }
      ];
      
      const batch = writeBatch(db);
      defaultTables.forEach((t) => {
        batch.set(doc(db, "tables", t.id), t);
      });
      await batch.commit();
    }

    // 3. Check credit customers
    const customersCol = collection(db, "credit_customers");
    const customersSnapshot = await getDocs(customersCol);
    
    if (customersSnapshot.empty) {
      console.log("Seeding default credit customers...");
      const defaultCustomers = [
        {
          id: "c1",
          name: "Pratik Bhandari",
          phone: "9876543210",
          balance: 1500,
          limit: 10000,
          logs: [
            {
              id: "log1",
              date: "2026-07-04T12:00:00Z",
              type: "credit",
              amount: 1500,
              details: "Assigned running credit for order"
            }
          ]
        },
        {
          id: "c2",
          name: "Aarav Sharma",
          phone: "9812345678",
          balance: 0,
          limit: 5000,
          logs: []
        }
      ];
      
      const batch = writeBatch(db);
      defaultCustomers.forEach((c) => {
        batch.set(doc(db, "credit_customers", c.id), c);
      });
      await batch.commit();
    }
  } catch (error) {
    console.error("Error seeding default data:", error);
  }
}
