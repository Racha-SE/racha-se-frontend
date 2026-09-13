export interface MockInventoryLot {
  lotId: string;
  quantity: number;
  costPrice: number;
  expiryDate: string;
}

export interface MockInventoryItem extends MockInventoryLot {
  productId: string;
  category: string;
  productName: string;
}

export interface MockInventoryProductGroup {
  productId: string;
  category: string;
  productName: string;
  items: MockInventoryLot[];
}

export const mockGroupedInventory: MockInventoryProductGroup[] = [
  {
    productId: "P001001",
    category: "Beverages",
    productName: "Drinking Water 600ml",
    items: [
      {
        lotId: "LOT-WATER-001",
        quantity: 24,
        costPrice: 6,
        expiryDate: "06/10/2026",
      },
      {
        lotId: "LOT-WATER-002",
        quantity: 30,
        costPrice: 6,
        expiryDate: "20/10/2026",
      },
      {
        lotId: "LOT-WATER-003",
        quantity: 18,
        costPrice: 6,
        expiryDate: "03/11/2026",
      },
      {
        lotId: "LOT-WATER-004",
        quantity: 42,
        costPrice: 6,
        expiryDate: "18/11/2026",
      },
      {
        lotId: "LOT-WATER-005",
        quantity: 36,
        costPrice: 6,
        expiryDate: "02/12/2026",
      },
      {
        lotId: "LOT-WATER-006",
        quantity: 20,
        costPrice: 6,
        expiryDate: "16/12/2026",
      },
    ],
  },
  {
    productId: "P001002",
    category: "Beverages",
    productName: "Coke 325ml",
    items: [
      {
        lotId: "LOT-COKE-001",
        quantity: 32,
        costPrice: 12,
        expiryDate: "17/06/2027",
      },
      {
        lotId: "LOT-COKE-002",
        quantity: 18,
        costPrice: 12,
        expiryDate: "01/07/2027",
      },
    ],
  },
  {
    productId: "P002015",
    category: "Snacks & Bakery",
    productName: "Milk Bread",
    items: [
      {
        lotId: "LOT-BREAD-001",
        quantity: 8,
        costPrice: 22,
        expiryDate: "10/09/2026",
      },
      {
        lotId: "LOT-BREAD-002",
        quantity: 6,
        costPrice: 22,
        expiryDate: "12/09/2026",
      },
      {
        lotId: "LOT-BREAD-003",
        quantity: 10,
        costPrice: 22,
        expiryDate: "14/09/2026",
      },
      {
        lotId: "LOT-BREAD-004",
        quantity: 12,
        costPrice: 22,
        expiryDate: "16/09/2026",
      },
    ],
  },
  {
    productId: "P003020",
    category: "Personal Care",
    productName: "Cooling Shampoo",
    items: [
      {
        lotId: "LOT-SHAMPOO-001",
        quantity: 30,
        costPrice: 82,
        expiryDate: "17/09/2027",
      },
    ],
  },
  {
    productId: "P004010",
    category: "Household",
    productName: "Bar Soap 90g",
    items: [
      {
        lotId: "LOT-SOAP-001",
        quantity: 34,
        costPrice: 17,
        expiryDate: "22/11/2028",
      },
      {
        lotId: "LOT-SOAP-002",
        quantity: 26,
        costPrice: 17,
        expiryDate: "15/01/2029",
      },
    ],
  },
];

export const mockInventory: MockInventoryItem[] = mockGroupedInventory.flatMap(
  ({ productId, category, productName, items }) =>
    items.map((item) => ({
      ...item,
      productId,
      category,
      productName,
    })),
);
