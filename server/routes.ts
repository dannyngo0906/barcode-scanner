import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";

// NocoDB configuration - stored server-side only
const NOCODB_BASE_URL = process.env.NOCODB_BASE_URL || 'https://db.salesai.vn/api/v2/tables/m3rrbw0dbrlqogw/records';
const NOCODB_TOKEN = process.env.NOCODB_TOKEN;

// Barcode validation regex (alphanumeric, 8-14 characters)
const BARCODE_REGEX = /^[A-Z0-9]{8,14}$/i;

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS configuration - restrict to specific origins in production
  app.use((req, res, next) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5000', 'http://localhost:5173'];
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Product search endpoint - proxies requests to NocoDB
  app.get("/api/products/:barcode", async (req: Request, res: Response) => {
    try {
      const { barcode } = req.params;

      // Validate barcode format
      if (!barcode || !BARCODE_REGEX.test(barcode)) {
        return res.status(400).json({
          error: "Invalid barcode format. Barcode must be 8-14 alphanumeric characters."
        });
      }

      // Build NocoDB API URL with proper escaping
      const where = encodeURIComponent(`(barcode,eq,${barcode})`);
      const url = `${NOCODB_BASE_URL}?offset=0&limit=25&where=${where}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (NOCODB_TOKEN) {
        headers['xc-token'] = NOCODB_TOKEN;
      }

      // Fetch from NocoDB
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('[NocoDB Error]', response.status, response.statusText, errText);
        return res.status(response.status).json({
          error: `Failed to fetch product data: ${response.statusText}`
        });
      }

      const data = await response.json();

      if (data?.list && data.list.length > 0) {
        return res.json({ product: data.list[0] });
      }

      return res.status(404).json({ error: "Product not found" });

    } catch (error) {
      console.error('[API Error]', error);
      return res.status(500).json({
        error: "An error occurred while searching for the product. Please try again."
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
