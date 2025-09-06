export interface Product {
  Id: number;
  CreatedAt: string;
  UpdatedAt: string;
  product_id: number;
  description: string | null;
  variant_id: string;
  url: string;
  title: string;
  image: string | null;
  brand: string | null;
  type: string | null;
  tag: string | null;
  sku: string;
  barcode: string;
  sale_price: number;
  price: number;
  image_link: string | null;
  stock: number;
  "153 NCT": number | null;
  "16 VHT": number | null;
  "06 QT": number | null;
  Inbox: unknown | null;
  "Kho tong": number | null;
  published_scope: string;
  label_1: string | null;
  label_2: string | null;
  "Viết mô tả": {
    type: string;
    label: string;
    fk_webhook_id: string;
  } | null;
}

export interface NocodbResponse {
  list: Product[];
  pageInfo: {
    totalRows: number;
    page: number;
    pageSize: number;
    isFirstPage: boolean;
    isLastPage: boolean;
  };
}

export type ScannerState = 'welcome' | 'scanner' | 'product' | 'cameraError' | 'loading';
