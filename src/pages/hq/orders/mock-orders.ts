export interface MockOrderItem {
  orderItemId: string;
  productId: string;
  productCategory: string;
  productName: string;
  supplier: string;
  quantity: number;
  baseCost: number;
  expiryDate: string;
}

export interface MockOrder {
  orderId: string;
  items: MockOrderItem[];
}

export const mockOrders: MockOrder[] = [
  {
    orderId: "1223655623F",
    items: [
      {
        orderItemId: "ORDER-001-WATER",
        productId: "W00001",
        productCategory: "Water",
        productName: "Pure Water 100%",
        supplier: "Lethal Com",
        quantity: 1,
        baseCost: 10,
        expiryDate: "10/09/2025",
      },
      {
        orderItemId: "ORDER-001-CAR",
        productId: "W00002",
        productCategory: "Car",
        productName: "Porchey car",
        supplier: "CP ALL",
        quantity: 1,
        baseCost: 1,
        expiryDate: "10/09/2025",
      },
    ],
  },
  {
    orderId: "1223655624F",
    items: [
      {
        orderItemId: "ORDER-002-COKE",
        productId: "P001002",
        productCategory: "Beverages",
        productName: "Coke 325ml",
        supplier: "CP ALL",
        quantity: 48,
        baseCost: 12,
        expiryDate: "17/06/2027",
      },
      {
        orderItemId: "ORDER-002-BREAD",
        productId: "P002015",
        productCategory: "Bakery",
        productName: "Milk Bread",
        supplier: "Racha Bakery",
        quantity: 24,
        baseCost: 22,
        expiryDate: "10/09/2026",
      },
    ],
  },
];
