import express from "express";
import cors from "cors";
import path from "path";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);
const TICKERFLOW_BASE_URL =
  process.env.TICKERFLOW_BASE_URL || "https://tickerflow.cgraaaj.in";
const TICKERFLOW_API_KEY = process.env.TICKERFLOW_API_KEY || "";

if (!TICKERFLOW_API_KEY || TICKERFLOW_API_KEY === "your-api-key-here") {
  console.warn(
    "WARNING: TICKERFLOW_API_KEY is not set. API requests will fail."
  );
}

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(
  "/api",
  createProxyMiddleware({
    target: TICKERFLOW_BASE_URL,
    changeOrigin: true,
    pathRewrite: (p) => (p.startsWith("/api") ? p : `/api${p}`),
    on: {
      proxyReq: (proxyReq) => {
        proxyReq.setHeader("X-API-KEY", TICKERFLOW_API_KEY);
      },
    },
  })
);

const UPSTOX_INTERVAL_MAP: Record<string, string> = {
  "1m": "1minute",
  "5m": "1minute",
  "15m": "1minute",
  "30m": "30minute",
  "1h": "30minute",
  "4h": "day",
  "1d": "day",
};

/**
 * Upstox returns IST timestamps like "2025-06-30T09:15:00+05:30".
 * TickerFlow stores IST clock times as UTC ("2025-06-30T09:15:00Z").
 * To align both on the chart x-axis, strip the IST offset and label as UTC.
 */
function normalizeUpstoxTimestamp(ts: string): string {
  const m = ts.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
  return m ? m[1] + "Z" : ts;
}

app.get(
  "/upstox/historical-candle/:instrumentKey/:interval/:toDate/:fromDate",
  async (req, res) => {
    const { instrumentKey, interval, toDate, fromDate } = req.params;
    const upstoxInterval = UPSTOX_INTERVAL_MAP[interval] || interval;
    const encodedKey = encodeURIComponent(instrumentKey);
    const url = `https://api.upstox.com/v2/historical-candle/${encodedKey}/${upstoxInterval}/${toDate}/${fromDate}`;

    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      const data = (await response.json()) as {
        status: string;
        data?: { candles?: (string | number)[][] };
      };

      if (data.status === "success" && data.data?.candles) {
        const candles = data.data.candles
          .map((c: (string | number)[]) => ({
            bucket: normalizeUpstoxTimestamp(c[0] as string),
            open: c[1],
            high: c[2],
            low: c[3],
            close: c[4],
            volume: c[5],
            open_interest: c[6] ?? 0,
          }))
          .reverse();

        res.json({ count: candles.length, results: candles });
      } else {
        res
          .status(response.status)
          .json({ error: "Upstox API error", details: data });
      }
    } catch (err) {
      console.error("Upstox proxy error:", err);
      res.status(500).json({ error: "Failed to fetch from Upstox" });
    }
  }
);

const clientDist = path.resolve(__dirname, "../../client/dist");
app.use(express.static(clientDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`OptionScope BFF listening on http://localhost:${PORT}`);
  console.log(`Proxying /api -> ${TICKERFLOW_BASE_URL}`);
});
