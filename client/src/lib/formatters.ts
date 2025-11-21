export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

export function calculateDiscount(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

export function cleanHtmlDescription(description: string): string {
  // Create a temporary DOM element to safely decode HTML entities
  // and strip all HTML tags
  if (typeof window !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.textContent = description; // This prevents script execution
    const textOnly = tempDiv.textContent || tempDiv.innerText || '';

    // Now decode any HTML entities that might be in the text
    tempDiv.innerHTML = textOnly;
    const decoded = tempDiv.textContent || tempDiv.innerText || '';

    // Remove extra whitespace
    return decoded.replace(/\s+/g, ' ').trim();
  }

  // Fallback for server-side rendering (if any)
  return description
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
