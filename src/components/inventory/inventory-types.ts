export interface InventoryProduct {
  productId: string;
  category: string;
  productName: string;
  description: string;
  barcode: string;
}

export interface InventoryLot {
  lotId: string;
  quantity: number;
  costPrice: number;
  expiryDate: string;
}

export interface InventoryItem extends InventoryProduct, InventoryLot {}

export interface InventoryProductGroup extends InventoryProduct {
  items: InventoryLot[];
}
