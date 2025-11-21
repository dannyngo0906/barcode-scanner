import { Product } from '@shared/schema';

// Barcode validation
const BARCODE_REGEX = /^[A-Z0-9]{8,14}$/i;

interface ApiResponse {
  product?: Product;
  error?: string;
}

export async function searchProductByBarcode(barcode: string): Promise<Product | null> {
  // Validate barcode format
  if (!barcode || !BARCODE_REGEX.test(barcode)) {
    throw new Error('Invalid barcode format. Barcode must be 8-14 alphanumeric characters.');
  }

  try {
    // Call backend API proxy instead of NocoDB directly
    const url = `/api/products/${encodeURIComponent(barcode)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }

      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `API request failed: ${response.status}`);
    }

    const data: ApiResponse = await response.json();

    return data.product || null;
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('An error occurred while searching for the product. Please try again.');
  }
}