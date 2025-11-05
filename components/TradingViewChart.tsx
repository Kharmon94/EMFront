'use client';

import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData, HistogramData } from 'lightweight-charts';

export type ChartType = 'candlestick' | 'line' | 'area' | 'histogram';
export type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

interface TradingViewChartProps {
  data: CandlestickData[] | LineData[] | HistogramData[];
  type?: ChartType;
  height?: number;
  showVolume?: boolean;
  volumeData?: HistogramData[];
  theme?: 'light' | 'dark';
  onTimeframeChange?: (timeframe: TimeFrame) => void;
  loading?: boolean;
}

export default function TradingViewChart({
  data,
  type = 'candlestick',
  height = 400,
  showVolume = true,
  volumeData,
  theme = 'dark',
  onTimeframeChange,
  loading = false,
}: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick' | 'Line' | 'Area' | 'Histogram'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [activeTimeframe, setActiveTimeframe] = React.useState<TimeFrame>('1h');

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: showVolume ? height - 100 : height,
      layout: {
        background: { color: theme === 'dark' ? '#000000' : '#FFFFFF' },
        textColor: theme === 'dark' ? '#9CA3AF' : '#374151',
      },
      grid: {
        vertLines: { color: theme === 'dark' ? '#1F2937' : '#E5E7EB' },
        horzLines: { color: theme === 'dark' ? '#1F2937' : '#E5E7EB' },
      },
      crosshair: {
        mode: 1, // Normal crosshair
        vertLine: {
          color: theme === 'dark' ? '#6B7280' : '#9CA3AF',
          width: 1,
          style: 3, // Dashed
          labelBackgroundColor: theme === 'dark' ? '#8B5CF6' : '#7C3AED',
        },
        horzLine: {
          color: theme === 'dark' ? '#6B7280' : '#9CA3AF',
          width: 1,
          style: 3,
          labelBackgroundColor: theme === 'dark' ? '#8B5CF6' : '#7C3AED',
        },
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#374151' : '#D1D5DB',
        scaleMargins: {
          top: 0.1,
          bottom: showVolume ? 0.3 : 0.1,
        },
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#374151' : '#D1D5DB',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add series based on type
    let series: ISeriesApi<'Candlestick' | 'Line' | 'Area' | 'Histogram'>;

    switch (type) {
      case 'candlestick':
        series = chart.addCandlestickSeries({
          upColor: '#10B981', // Green
          downColor: '#EF4444', // Red
          borderUpColor: '#10B981',
          borderDownColor: '#EF4444',
          wickUpColor: '#10B981',
          wickDownColor: '#EF4444',
        });
        break;

      case 'line':
        series = chart.addLineSeries({
          color: '#8B5CF6', // Purple
          lineWidth: 2,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 6,
        });
        break;

      case 'area':
        series = chart.addAreaSeries({
          topColor: 'rgba(139, 92, 246, 0.4)',
          bottomColor: 'rgba(139, 92, 246, 0.0)',
          lineColor: '#8B5CF6',
          lineWidth: 2,
        });
        break;

      case 'histogram':
        series = chart.addHistogramSeries({
          color: '#8B5CF6',
        });
        break;
    }

    seriesRef.current = series;

    // Add volume series if enabled
    if (showVolume && volumeData) {
      const volumeSeries = chart.addHistogramSeries({
        color: '#6B7280',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      });
      volumeSeriesRef.current = volumeSeries;
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [type, height, showVolume, theme]);

  // Update data
  useEffect(() => {
    if (!seriesRef.current || !data.length) return;

    try {
      seriesRef.current.setData(data as any);

      // Fit content
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    } catch (error) {
      console.error('Error setting chart data:', error);
    }
  }, [data]);

  // Update volume data
  useEffect(() => {
    if (!volumeSeriesRef.current || !volumeData?.length) return;

    try {
      volumeSeriesRef.current.setData(volumeData);
    } catch (error) {
      console.error('Error setting volume data:', error);
    }
  }, [volumeData]);

  const handleTimeframeClick = (timeframe: TimeFrame) => {
    setActiveTimeframe(timeframe);
    onTimeframeChange?.(timeframe);
  };

  const timeframes: TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];

  return (
    <div className="relative w-full">
      {/* Timeframe Selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => handleTimeframeClick(tf)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeTimeframe === tf
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Chart Type Selector (optional) */}
        <div className="flex gap-2">
          <button
            className={`p-2 rounded ${
              type === 'candlestick' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
            title="Candlestick"
          >
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="7" y="4" width="2" height="16" />
              <rect x="5" y="8" width="6" height="8" />
              <rect x="15" y="2" width="2" height="20" />
              <rect x="13" y="6" width="6" height="12" />
            </svg>
          </button>
          <button
            className={`p-2 rounded ${
              type === 'line' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
            }`}
            title="Line"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative bg-black rounded-xl overflow-hidden border border-gray-800">
        {loading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-white">Loading chart data...</div>
          </div>
        )}
        
        <div ref={chartContainerRef} />

        {/* Volume Label */}
        {showVolume && (
          <div className="absolute bottom-2 left-2 text-xs text-gray-400">
            Volume
          </div>
        )}
      </div>

      {/* Chart Info */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <div>TradingView Chart • {data.length} data points</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-sm" />
            <span>Buy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-sm" />
            <span>Sell</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add missing React import
import * as React from 'react';

// Helper function to convert price data to candlestick format
export function convertToCandlestickData(
  trades: Array<{ time: number; price: number; volume?: number }>
): { candles: CandlestickData[]; volume: HistogramData[] } {
  // Group trades by time intervals (e.g., 1 hour)
  const intervals = new Map<number, { open: number; high: number; low: number; close: number; volume: number }>();

  trades.forEach((trade) => {
    const intervalTime = Math.floor(trade.time / 3600) * 3600; // 1-hour intervals

    if (!intervals.has(intervalTime)) {
      intervals.set(intervalTime, {
        open: trade.price,
        high: trade.price,
        low: trade.price,
        close: trade.price,
        volume: trade.volume || 0,
      });
    } else {
      const interval = intervals.get(intervalTime)!;
      interval.high = Math.max(interval.high, trade.price);
      interval.low = Math.min(interval.low, trade.price);
      interval.close = trade.price;
      interval.volume += trade.volume || 0;
    }
  });

  const candles: CandlestickData[] = [];
  const volume: HistogramData[] = [];

  intervals.forEach((data, time) => {
    candles.push({
      time: time as any,
      open: data.open,
      high: data.high,
      low: data.low,
      close: data.close,
    });

    volume.push({
      time: time as any,
      value: data.volume,
      color: data.close >= data.open ? '#10B981' : '#EF4444',
    });
  });

  return { candles, volume };
}

// Helper function to convert price data to line format
export function convertToLineData(prices: Array<{ time: number; price: number }>): LineData[] {
  return prices.map((p) => ({
    time: p.time as any,
    value: p.price,
  }));
}

