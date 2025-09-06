import { z } from "zod";

export const productSchema = z.object({
  Id: z.number(),
  CreatedAt: z.string(),
  UpdatedAt: z.string(),
  product_id: z.number(),
  description: z.string().nullable(),
  variant_id: z.string(),
  url: z.string(),
  title: z.string(),
  image: z.string().nullable(),
  brand: z.string().nullable(),
  type: z.string().nullable(),
  tag: z.string().nullable(),
  sku: z.string(),
  barcode: z.string(),
  sale_price: z.number(),
  price: z.number(),
  image_link: z.string().nullable(),
  stock: z.number(),
  "153 NCT": z.number().nullable(),
  "16 VHT": z.number().nullable(),
  "06 QT": z.number().nullable(),
  Inbox: z.unknown().nullable(),
  "Kho tong": z.number().nullable(),
  published_scope: z.string(),
  label_1: z.string().nullable(),
  label_2: z.string().nullable(),
  "Viết mô tả": z.object({
    type: z.string(),
    label: z.string(),
    fk_webhook_id: z.string(),
  }).nullable(),
});

export const nocodbResponseSchema = z.object({
  list: z.array(productSchema),
  pageInfo: z.object({
    totalRows: z.number(),
    page: z.number(),
    pageSize: z.number(),
    isFirstPage: z.boolean(),
    isLastPage: z.boolean(),
  }),
});

export type Product = z.infer<typeof productSchema>;
export type NocodbResponse = z.infer<typeof nocodbResponseSchema>;

// Scanner state types
export type ScannerState = 'welcome' | 'scanner' | 'product' | 'cameraError' | 'loading';

export type CameraError = {
  type: 'permission' | 'notFound' | 'constraint' | 'unknown';
  message: string;
};
