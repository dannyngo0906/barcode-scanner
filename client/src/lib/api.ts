import { Product, NocodbResponse } from '@/types/product';

// Cấu hình API trực tiếp - NocoDB v3
const NOCODB_BASE_URL = 'https://db.salesai.vn/api/v3/data/pc6dn5x2psu1vsz/m3rrbw0dbrlqogw/records';
const NOCODB_TOKEN = '1Owqe7hG7sV0V16DQCv_BPC0gUDLITp-_yRXvLGA';

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
      'xc-token': NOCODB_TOKEN,
    };

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