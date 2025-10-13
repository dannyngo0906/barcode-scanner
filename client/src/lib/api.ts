import { Product, NocodbResponse } from '@/types/product';

// Fallback mặc định (không an toàn để commit token thật vào repo)
const DEFAULT_NOCODB_BASE_URL = 'https://db.salesai.vn/api/v2/tables/m3rrbw0dbrlqogw/records';

// Hành vi:
// - Nếu VITE_NOCODB_BASE_URL được cung cấp lúc build, sẽ dùng giá trị đó.
// - Nếu không, client mặc định gọi cùng origin tới /api/nocodb (bạn deploy 1 serverless/function proxy tại đó)
// - Token lấy từ VITE_NOCODB_TOKEN nếu bạn muốn gọi trực tiếp từ client (không khuyến nghị)
const NOCODB_BASE_URL = (import.meta.env?.VITE_NOCODB_BASE_URL as string) || `${window.location.origin}/api/nocodb` || DEFAULT_NOCODB_BASE_URL;
const NOCODB_TOKEN = (import.meta.env?.VITE_NOCODB_TOKEN as string) || undefined;

export async function searchProductByBarcode(barcode: string): Promise<Product | null> {
  if (!barcode) throw new Error('Barcode is required.');

  const isDev = Boolean(import.meta.env && import.meta.env.DEV);

  if (isDev) {
    console.debug('[api] NOCODB_BASE_URL:', NOCODB_BASE_URL);
    console.debug('[api] Token provided:', NOCODB_TOKEN ? 'Yes' : 'No');
  }

  try {
    const where = encodeURIComponent(`(barcode,eq,${barcode})`);
    const url = `${NOCODB_BASE_URL}?offset=0&limit=25&where=${where}`;

    if (isDev) console.debug('[api] Fetching URL:', url);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Nếu bạn dùng proxy server-side, proxy sẽ thêm token. Nếu không và bạn muốn gọi trực tiếp, attach token.
    if (NOCODB_TOKEN) headers['xc-token'] = NOCODB_TOKEN;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[api] NocoDB response error', response.status, response.statusText, errText);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as NocodbResponse;

    if (isDev) console.debug('[api] response data', data);

    if (data?.list && data.list.length > 0) {
      return data.list[0] as Product;
    }

    return null;
  } catch (err) {
    console.error('[api] Error in searchProductByBarcode', err);
    throw new Error('Có lỗi xảy ra khi tìm kiếm sản phẩm. Vui lòng thử lại.');
  }
}