export interface MockInventoryItem {
  productId: string;
  category: string;
  productName: string;
  quantity: number;
  sellingPrice: number;
  expiryDate: string;
}

export const mockInventory: MockInventoryItem[] = [
  {
    productId: "P001001",
    category: "Beverages",
    productName: "Drinking Water 600ml",
    quantity: 100,
    sellingPrice: 10,
    expiryDate: "06/04/2027",
  },
  {
    productId: "P001002",
    category: "Beverages",
    productName: "Coke 325ml",
    quantity: 50,
    sellingPrice: 18,
    expiryDate: "17/06/2027",
  },
  {
    productId: "P002015",
    category: "Snacks & Bakery",
    productName: "Milk Bread",
    quantity: 24,
    sellingPrice: 35,
    expiryDate: "10/09/2026",
  },
  {
    productId: "P003020",
    category: "Personal Care",
    productName: "Cooling Shampoo",
    quantity: 30,
    sellingPrice: 129,
    expiryDate: "17/09/2027",
  },
  {
    productId: "P004010",
    category: "Household",
    productName: "Bar Soap 90g",
    quantity: 60,
    sellingPrice: 29,
    expiryDate: "22/11/2028",
  },
];
