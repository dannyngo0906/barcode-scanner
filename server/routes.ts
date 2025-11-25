import type { Express } from "express";
import { createServer, type Server } from "http";
import type { EnvConfig } from "./env";

export async function registerRoutes(app: Express, env: EnvConfig): Promise<Server> {
  // CORS headers - Allow frontend origin
  const allowedOrigins = env.ALLOWED_ORIGINS;

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Backend proxy for NocoDB API - secure endpoint
  app.get("/api/products/search", async (req, res) => {
    try {
      const barcode = req.query.barcode as string;

      if (!barcode) {
        return res.status(400).json({
          error: "Barcode is required"
        });
      }

      // Validate barcode format (basic validation)
      if (!/^[0-9A-Za-z\-_]+$/.test(barcode)) {
        return res.status(400).json({
          error: "Invalid barcode format"
        });
      }

      // Call NocoDB API with server-side credentials
      // Note: NocoDB v3 expects raw where clause, not URI encoded
      const where = `(barcode,eq,${barcode})`;
      const url = `${env.NOCODB_BASE_URL}?offset=0&limit=25&where=${where}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add token if available
      if (env.NOCODB_TOKEN) {
        headers['xc-token'] = env.NOCODB_TOKEN;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('[server] NocoDB API error:', response.status, errText);
        return res.status(response.status).json({
          error: `Database query failed: ${response.statusText}`
        });
      }

      const data = await response.json();

      // Return the product data
      res.json(data);
    } catch (error) {
      console.error('[server] Error in /api/products/search:', error);
      res.status(500).json({
        error: "Internal server error"
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
