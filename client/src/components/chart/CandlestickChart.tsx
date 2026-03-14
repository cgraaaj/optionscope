import { useEffect, useRef, useCallback } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type HistogramData,
  type Time,
  ColorType,
  CrosshairMode,
} from "lightweight-charts";
import type { Candle } from "@/types";
import { toUnixSeconds, formatPrice } from "@/lib/utils";

const IST_OFFSET = 19800; // +5:30 in seconds

interface CandlestickChartProps {
  candles: Candle[];
  equityCandles?: Candle[];
  showOverlay: boolean;
  overlayOpacity: number;
  overlayForeground: "option" | "equity";
}

function toIST(c: Candle): number {
  return toUnixSeconds(c.bucket) + IST_OFFSET;
}

function isValidCandle(c: Candle): boolean {
  const t = toUnixSeconds(c.bucket);
  return t > 0 && c.open != null && c.high != null && c.low != null && c.close != null;
}

function toChartCandle(c: Candle): CandlestickData<Time> {
  return {
    time: toIST(c) as Time,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  };
}

function toVolumeBar(c: Candle): HistogramData<Time> {
  return {
    time: toIST(c) as Time,
    value: c.volume ?? 0,
    color: c.close >= c.open ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)",
  };
}

function candleColors(opacity: number) {
  const a = opacity.toFixed(2);
  return {
    upColor: `rgba(34,197,94,${a})`,
    downColor: `rgba(239,68,68,${a})`,
    wickUpColor: `rgba(34,197,94,${a})`,
    wickDownColor: `rgba(239,68,68,${a})`,
    borderVisible: false,
  };
}

function equityCandleColors(opacity: number) {
  const a = opacity.toFixed(2);
  return {
    upColor: `rgba(59,130,246,${a})`,
    downColor: `rgba(249,115,22,${a})`,
    wickUpColor: `rgba(59,130,246,${a})`,
    wickDownColor: `rgba(249,115,22,${a})`,
    borderVisible: false,
  };
}

function formatVol(v: number): string {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(1) + "K";
  return String(v);
}

function formatTime(ts: number): string {
  const d = new Date(ts * 1000);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const mon = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yr = d.getUTCFullYear();
  const hr = String(d.getUTCHours()).padStart(2, "0");
  const min = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day}/${mon}/${yr} ${hr}:${min}`;
}

type OhlcData = { open: number; high: number; low: number; close: number };

function buildOhlcHtml(
  label: string,
  labelColor: string,
  d: OhlcData,
  vol?: number
): string {
  const up = d.close >= d.open;
  const clr = labelColor;
  const chg = d.close - d.open;
  const chgPct = d.open ? ((chg / d.open) * 100).toFixed(2) : "0.00";
  const sign = chg >= 0 ? "+" : "";
  return `
    <div style="margin-bottom:6px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
        <span style="width:8px;height:8px;border-radius:2px;background:${clr};display:inline-block"></span>
        <span style="font-weight:600;font-size:11px;color:#e2e8f0">${label}</span>
        <span style="font-size:16px;font-weight:700;color:${up ? "#22c55e" : "#ef4444"}">${formatPrice(d.close)}</span>
        <span style="font-size:10px;color:${up ? "#22c55e" : "#ef4444"}">${sign}${chg.toFixed(2)} (${sign}${chgPct}%)</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:2px 12px;font-size:10px">
        <span style="color:#64748b">O:</span><span style="color:#cbd5e1">${formatPrice(d.open)}</span>
        <span style="color:#64748b">H:</span><span style="color:#cbd5e1">${formatPrice(d.high)}</span>
        <span style="color:#64748b">L:</span><span style="color:#cbd5e1">${formatPrice(d.low)}</span>
        <span style="color:#64748b">C:</span><span style="color:#cbd5e1">${formatPrice(d.close)}</span>
      </div>
      ${vol !== undefined ? `<div style="font-size:10px;margin-top:2px"><span style="color:#64748b">Vol:</span> <span style="color:#cbd5e1">${formatVol(vol)}</span></div>` : ""}
    </div>`;
}

export function CandlestickChart({
  candles,
  equityCandles,
  showOverlay,
  overlayOpacity,
  overlayForeground,
}: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const optionSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const equitySeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const candleMapRef = useRef<Map<number, Candle>>(new Map());
  const equityCandleMapRef = useRef<Map<number, Candle>>(new Map());

  const initChart = useCallback(() => {
    if (!containerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#1a1a2e" },
        textColor: "#94a3b8",
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(42,58,92,0.5)" },
        horzLines: { color: "rgba(42,58,92,0.5)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "rgba(59,130,246,0.4)", width: 1, style: 2 },
        horzLine: { color: "rgba(59,130,246,0.4)", width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: "#2a3a5c",
        scaleMargins: { top: 0.05, bottom: 0.25 },
      },
      leftPriceScale: {
        visible: false,
        borderColor: "#2a3a5c",
        scaleMargins: { top: 0.05, bottom: 0.25 },
      },
      timeScale: {
        borderColor: "#2a3a5c",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
    });

    chartRef.current = chart;

    const optionSeries = chart.addSeries(CandlestickSeries, {
      ...candleColors(1),
      priceScaleId: "right",
    });
    optionSeriesRef.current = optionSeries;

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeriesRef.current = volumeSeries;

    return chart;
  }, []);

  useEffect(() => {
    const chart = initChart();
    if (!chart || !containerRef.current) return;

    const applySize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        if (w > 0 && h > 0) {
          chart.applyOptions({ width: w, height: h });
        }
      }
    };

    const observer = new ResizeObserver(applySize);
    observer.observe(containerRef.current);
    // Ensure size is applied after layout (e.g. when switching to Chart tab on mobile)
    let rafId = requestAnimationFrame(() => {
      applySize();
      rafId = requestAnimationFrame(applySize);
    });

    chart.subscribeCrosshairMove((param) => {
      const tip = tooltipRef.current;
      if (!tip) return;

      if (!param.time || !param.point || param.point.x < 0 || param.point.y < 0) {
        tip.style.display = "none";
        return;
      }

      const ts = param.time as number;
      const optCandle = candleMapRef.current.get(ts);
      const eqCandle = equityCandleMapRef.current.get(ts);

      if (!optCandle && !eqCandle) {
        tip.style.display = "none";
        return;
      }

      let html = `<div style="color:#94a3b8;font-size:11px;margin-bottom:4px;font-weight:500">${formatTime(ts)}</div>`;

      if (optCandle) {
        html += buildOhlcHtml("Option", "#22c55e", optCandle, optCandle.volume);
      }
      if (eqCandle) {
        html += buildOhlcHtml("Equity", "#3b82f6", eqCandle, eqCandle.volume);
      }

      tip.innerHTML = html;
      tip.style.display = "block";
    });

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [initChart]);

  useEffect(() => {
    if (!optionSeriesRef.current || !volumeSeriesRef.current || !chartRef.current) return;
    if (candles.length === 0) return;

    const valid = candles.filter(isValidCandle);
    const map = new Map<number, Candle>();
    for (const c of valid) map.set(toIST(c), c);
    candleMapRef.current = map;

    optionSeriesRef.current.setData(valid.map(toChartCandle));
    volumeSeriesRef.current.setData(valid.map(toVolumeBar));

    if (containerRef.current) {
      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    }
    chartRef.current.timeScale().fitContent();
  }, [candles]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (equitySeriesRef.current) {
      chartRef.current.removeSeries(equitySeriesRef.current);
      equitySeriesRef.current = null;
    }

    if (showOverlay && equityCandles && equityCandles.length > 0) {
      const valid = equityCandles.filter(isValidCandle);
      const map = new Map<number, Candle>();
      for (const c of valid) map.set(toIST(c), c);
      equityCandleMapRef.current = map;

      chartRef.current.priceScale("left").applyOptions({ visible: true });

      const equitySeries = chartRef.current.addSeries(CandlestickSeries, {
        ...equityCandleColors(
          overlayForeground === "equity" ? 1 : overlayOpacity
        ),
        priceScaleId: "left",
      });
      equitySeriesRef.current = equitySeries;
      equitySeries.setData(valid.map(toChartCandle));
    } else {
      equityCandleMapRef.current = new Map();
      chartRef.current.priceScale("left").applyOptions({ visible: false });
    }
  }, [showOverlay, equityCandles, overlayOpacity, overlayForeground]);

  useEffect(() => {
    if (!optionSeriesRef.current) return;
    const optOpacity =
      overlayForeground === "option" || !showOverlay ? 1 : overlayOpacity;
    optionSeriesRef.current.applyOptions(candleColors(optOpacity));

    if (equitySeriesRef.current && showOverlay) {
      const eqOpacity = overlayForeground === "equity" ? 1 : overlayOpacity;
      equitySeriesRef.current.applyOptions(equityCandleColors(eqOpacity));
    }
  }, [overlayOpacity, overlayForeground, showOverlay]);

  return (
    <div className="relative w-full h-full min-h-[300px]">
      <div ref={containerRef} className="w-full h-full" />
      <div
        ref={tooltipRef}
        style={{
          display: "none",
          position: "absolute",
          top: 8,
          left: 8,
          zIndex: 20,
          background: "rgba(15,23,42,0.92)",
          border: "1px solid rgba(42,58,92,0.8)",
          borderRadius: 8,
          padding: "8px 12px",
          pointerEvents: "none",
          backdropFilter: "blur(8px)",
          minWidth: 200,
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        }}
      />
    </div>
  );
}
