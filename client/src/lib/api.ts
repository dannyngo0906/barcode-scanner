import { Product, NocodbResponse } from '@/types/product';

const NOCODB_BASE_URL = 'https://db.salesai.vn/api/v2/tables/m3rrbw0dbrlqogw/records';
const NOCODB_TOKEN = '1Owqe7hG7sV0V16DQCv_BPC0gUDLITp-_yRXvLGA';

export async function searchProductByBarcode(barcode: string): Promise<Product | null> {
  try {
    const url = `${NOCODB_BASE_URL}?offset=0&limit=25&where=(barcode,eq,${barcode})`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'xc-token': NOCODB_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: NocodbResponse = await response.json();
    
    if (data.list && data.list.length > 0) {
      return data.list[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error searching product by barcode:', error);
    throw new Error('Có lỗi xảy ra khi tìm kiếm sản phẩm. Vui lòng thử lại.');
  }
}
