export interface MockOrderItem {
  orderItemId: string;
  productId: string;
  productCategory: string;
  productCategoryValue: string;
  productName: string;
  supplier: string;
  supplierValue: string;
  quantity: number;
  costPrice: number;
  expiryDate: string;
}

export interface MockOrder {
  orderId: string;
  items: MockOrderItem[];
}

export const mockSupplierOptions = [
  { label: "Lethal Com", value: "lethal-com" },
  { label: "Goonsquad", value: "goonsquad" },
  { label: "CP ALL", value: "cp-all" },
  { label: "Racha Bakery", value: "racha-bakery" },
] as const;

export const mockOrders: MockOrder[] = [
  {
    orderId: "1223655623F",
    items: [
      {
        orderItemId: "ORDER-001-WATER",
        productId: "W00001",
        productCategory: "Water",
        productCategoryValue: "beverages",
        productName: "Pure Water 100%",
        supplier: "Lethal Com",
        supplierValue: "lethal-com",
        quantity: 1,
        costPrice: 10,
        expiryDate: "10/09/2025",
      },
      {
        orderItemId: "ORDER-001-CAR",
        productId: "W00002",
        productCategory: "Car",
        productCategoryValue: "household",
        productName: "Porchey car",
        supplier: "CP ALL",
        supplierValue: "cp-all",
        quantity: 1,
        costPrice: 1,
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
        productCategoryValue: "beverages",
        productName: "Coke 325ml",
        supplier: "CP ALL",
        supplierValue: "cp-all",
        quantity: 48,
        costPrice: 12,
        expiryDate: "17/06/2027",
      },
      {
        orderItemId: "ORDER-002-BREAD",
        productId: "P002015",
        productCategory: "Bakery",
        productCategoryValue: "bakery",
        productName: "Milk Bread",
        supplier: "Racha Bakery",
        supplierValue: "racha-bakery",
        quantity: 24,
        costPrice: 22,
        expiryDate: "10/09/2026",
      },
    ],
  },
];
