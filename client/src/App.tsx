import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BarChart3, List } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { OptionChainTable } from "@/components/option-chain/OptionChainTable";
import { HolidayList, getNonTradingReason } from "@/components/option-chain/HolidayList";
import { CandlestickChart } from "@/components/chart/CandlestickChart";
import { ChartHeader } from "@/components/chart/ChartHeader";
import { IntervalSelector } from "@/components/chart/IntervalSelector";
import { UnderlyingOverlay } from "@/components/chart/UnderlyingOverlay";
import { useStocks } from "@/hooks/useStocks";
import { useExpiries } from "@/hooks/useExpiries";
import { useInstruments } from "@/hooks/useInstruments";
import { useCandles } from "@/hooks/useCandles";
import { useEquityCandles } from "@/hooks/useEquityCandles";
import { startOfDayIST, endOfDayIST, formatDate, cn } from "@/lib/utils";
import type { Stock, Instrument, Interval } from "@/types";

function App() {
  const queryClient = useQueryClient();

  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [selectedExpiry, setSelectedExpiry] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedInstrument, setSelectedInstrument] =
    useState<Instrument | null>(null);
  const [interval, setInterval] = useState<Interval>("5m");

  const [mobileTab, setMobileTab] = useState<"chain" | "chart">("chain");
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0.35);
  const [overlayForeground, setOverlayForeground] = useState<
    "option" | "equity"
  >("option");

  const { data: stocks = [], isLoading: stocksLoading } = useStocks();
  const { data: expiries = [], isLoading: expiriesLoading } = useExpiries();
  const { data: optionChain = [], isLoading: chainLoading } = useInstruments(
    selectedStock?.name,
    selectedExpiry ?? undefined
  );

  const startOfDay = useMemo(
    () => startOfDayIST(selectedDate),
    [selectedDate]
  );
  const endOfDay = useMemo(
    () => endOfDayIST(selectedDate),
    [selectedDate]
  );

  const {
    data: candles = [],
    isLoading: candlesLoading,
    isFetched: candlesFetched,
  } = useCandles(
    selectedInstrument?.instrument_seq,
    interval,
    startOfDay,
    endOfDay
  );

  const dateToastRef = useRef<string>("");
  useEffect(() => {
    const dateKey = formatDate(selectedDate);
    if (dateToastRef.current === dateKey) return;
    const reason = getNonTradingReason(selectedDate);
    if (reason) {
      dateToastRef.current = dateKey;
      toast.warning("Non-trading day", {
        description: `${formatDate(selectedDate)} is ${reason}. Market is closed.`,
      });
    }
  }, [selectedDate]);

  const candleToastRef = useRef<string>("");
  useEffect(() => {
    if (!candlesFetched || candlesLoading || !selectedInstrument) return;
    const key = `${selectedInstrument.instrument_seq}-${formatDate(selectedDate)}`;
    if (candles.length === 0 && candleToastRef.current !== key) {
      if (getNonTradingReason(selectedDate)) return;
      candleToastRef.current = key;
      toast.warning("No candle data available", {
        description: `No data for ${selectedInstrument.trading_symbol} on ${formatDate(selectedDate)}.`,
      });
    }
  }, [candles, candlesFetched, candlesLoading, selectedInstrument, selectedDate]);

  const {
    data: equityCandles,
    isLoading: equityCandlesLoading,
  } = useEquityCandles(
    selectedStock?.instrument_key,
    interval,
    selectedDate,
    selectedDate,
    showOverlay && !!selectedInstrument
  );

  const lastPrice = candles.length > 0 ? candles[candles.length - 1].close : undefined;

  const handleStockSelect = useCallback(
    (stock: Stock) => {
      setSelectedStock(stock);
      setSelectedExpiry(null);
      setSelectedInstrument(null);
      setShowOverlay(false);
    },
    []
  );

  const handleExpirySelect = useCallback(
    (expiry: string) => {
      setSelectedExpiry(expiry);
      setSelectedInstrument(null);
      setShowOverlay(false);
    },
    []
  );

  const handleInstrumentSelect = useCallback((instrument: Instrument) => {
    setSelectedInstrument(instrument);
  }, []);

  const handleRefresh = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  const optionChainPanel = (
    <>
      <div className="px-3 py-2 border-b border-border bg-surface">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          Option Chain
        </span>
        {selectedStock && selectedExpiry && (
          <span className="ml-2 text-xs text-text-muted">
            {selectedStock.name} &middot; {selectedExpiry}
          </span>
        )}
      </div>
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-auto">
          <OptionChainTable
            rows={optionChain}
            isLoading={chainLoading}
            onInstrumentSelect={(inst) => {
              handleInstrumentSelect(inst);
              setMobileTab("chart");
            }}
            selectedInstrumentId={selectedInstrument?.id}
            startOfDay={startOfDay}
            endOfDay={endOfDay}
          />
        </div>
        <HolidayList selectedDate={selectedDate} />
      </div>
    </>
  );

  const chartPanel = (
    <>
      <div className="flex items-center justify-between border-b border-border bg-surface px-2 flex-wrap gap-1">
        <ChartHeader
          instrument={selectedInstrument}
          lastPrice={lastPrice}
        />
        <div className="flex items-center gap-1 sm:gap-3 pr-2">
          <IntervalSelector selected={interval} onSelect={setInterval} />
        </div>
      </div>

      {selectedInstrument && (
        <div className="flex items-center gap-2 px-2 sm:px-4 py-1.5 border-b border-border bg-surface/50 flex-wrap">
          <UnderlyingOverlay
            showOverlay={showOverlay}
            onToggle={() => setShowOverlay((v) => !v)}
            overlayOpacity={overlayOpacity}
            onOpacityChange={setOverlayOpacity}
            foreground={overlayForeground}
            onForegroundToggle={() =>
              setOverlayForeground((v) =>
                v === "option" ? "equity" : "option"
              )
            }
            isLoading={equityCandlesLoading}
          />
          {showOverlay && (
            <div className="hidden sm:flex items-center gap-3 ml-auto text-[10px] text-text-muted">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-sm bg-green" />
                Option Up
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-sm bg-red" />
                Option Down
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-sm bg-accent" />
                Equity Up
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-sm bg-orange-500" />
                Equity Down
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 min-h-0 relative">
        {candlesLoading && selectedInstrument && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <span className="text-sm text-text-muted">Loading chart...</span>
          </div>
        )}
        {selectedInstrument ? (
          <CandlestickChart
            candles={candles}
            equityCandles={equityCandles}
            showOverlay={showOverlay}
            overlayOpacity={overlayOpacity}
            overlayForeground={overlayForeground}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-muted text-sm text-center px-4">
              {selectedStock
                ? "Select a strike from the option chain"
                : "Search for a stock to get started"}
            </p>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex flex-col h-screen">
      <Header
        stocks={stocks}
        stocksLoading={stocksLoading}
        selectedStock={selectedStock}
        onStockSelect={handleStockSelect}
        expiries={expiries}
        expiriesLoading={expiriesLoading}
        selectedExpiry={selectedExpiry}
        onExpirySelect={handleExpirySelect}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onRefresh={handleRefresh}
      />

      {/* Mobile tab switcher */}
      <div className="md:hidden flex border-b border-border bg-surface shrink-0">
        <button
          onClick={() => setMobileTab("chain")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors",
            mobileTab === "chain"
              ? "text-accent border-b-2 border-accent"
              : "text-text-muted"
          )}
        >
          <List className="h-3.5 w-3.5" />
          Chain
        </button>
        <button
          onClick={() => setMobileTab("chart")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors",
            mobileTab === "chart"
              ? "text-accent border-b-2 border-accent"
              : "text-text-muted"
          )}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Chart
        </button>
      </div>

      {/* Mobile: tab content */}
      <div className="flex-1 min-h-0 flex flex-col md:hidden">
        {mobileTab === "chain" ? (
          <div className="flex-1 min-h-0 flex flex-col">{optionChainPanel}</div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col">{chartPanel}</div>
        )}
      </div>

      {/* Desktop: side-by-side */}
      <div className="hidden md:flex flex-1 min-h-0">
        <div className="w-[480px] lg:w-[520px] shrink-0 border-r border-border flex flex-col">
          {optionChainPanel}
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          {chartPanel}
        </div>
      </div>
    </div>
  );
}

export default App;
