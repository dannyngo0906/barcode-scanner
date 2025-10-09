import { Product, NocodbResponse } from '@/types/product';

const NOCODB_BASE_URL = 'https://db.salesai.vn/api/v2/tables/m3rrbw0dbrlqogw/records';
const NOCODB_TOKEN = 1Owqe7hG7sV0V16DQCv_BPC0gUDLITp-_yRXvLGA;

export async function searchProductByBarcode(barcode: string): Promise<Product | null> {
  try {
    const url = `${NOCODB_BASE_URL}?offset=0&limit=25&where=(barcode,eq,${barcode})`;
    
    // Debug logging for deployment troubleshooting
    console.log('Searching for barcode:', barcode);
    console.log('API URL:', url);
    console.log('Token available:', NOCODB_TOKEN ? 'Yes' : 'No');
    console.log('Token value:', NOCODB_TOKEN ? `${NOCODB_TOKEN.substring(0, 8)}...` : 'undefined');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'xc-token': NOCODB_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: NocodbResponse = await response.json();
    console.log('API response data:', data);
    
    if (data.list && data.list.length > 0) {
      console.log('Found product:', data.list[0]);
      return data.list[0];
    }
    
    console.log('No product found for barcode:', barcode);
    return null;
  } catch (error) {
    console.error('Error searching product by barcode:', error);
    throw new Error('Có lỗi xảy ra khi tìm kiếm sản phẩm. Vui lòng thử lại.');
  }
}
