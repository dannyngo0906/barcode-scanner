import { Product, NocodbResponse } from '@/types/product';

/**
 * Search for a product by barcode using the secure backend proxy.
 * This prevents exposing NocoDB credentials to the client.
 */
export async function searchProductByBarcode(barcode: string): Promise<Product | null> {
  if (!barcode) throw new Error('Barcode is required.');

  const isDev = Boolean(import.meta.env && import.meta.env.DEV);

  try {
    // Call our secure backend proxy instead of NocoDB directly
    const url = `/api/products/search?barcode=${encodeURIComponent(barcode)}`;

    if (isDev) {
      console.debug('[api] Fetching from backend proxy:', url);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: response.statusText }));
      console.error('[api] Backend API error:', response.status, errData);

      if (response.status === 404) {
        return null;
      }

      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as NocodbResponse;

    if (isDev) {
      console.debug('[api] Response data:', data);
    }

    if (data?.list && data.list.length > 0) {
      return data.list[0] as Product;
    }

    return null;
  } catch (err) {
    console.error('[api] Error in searchProductByBarcode:', err);
    throw new Error('Có lỗi xảy ra khi tìm kiếm sản phẩm. Vui lòng thử lại.');
  }
}