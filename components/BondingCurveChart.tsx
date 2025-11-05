'use client';

import { useEffect, useState } from 'react';
import TradingViewChart, { convertToLineData, convertToCandlestickData } from './TradingViewChart';
import type { LineData, CandlestickData, HistogramData } from 'lightweight-charts';

interface Trade {
  id: number;
  price: number;
  amount: number;
  trade_type: 'buy' | 'sell';
  created_at: string;
}

interface BondingCurveChartProps {
  tokenId: number;
  currentPrice: number;
  trades?: Trade[];
  height?: number;
}

export default function BondingCurveChart({
  tokenId,
  currentPrice,
  trades = [],
  height = 400,
}: BondingCurveChartProps) {
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [volumeData, setVolumeData] = useState<HistogramData[]>([]);
  const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick');
  const [lineData, setLineData] = useState<LineData[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d'>('1h');

  useEffect(() => {
    if (trades.length === 0) {
      // Generate sample bonding curve data if no trades
      generateSampleData();
      return;
    }

    // Convert real trade data
    const priceData = trades.map((trade) => ({
      time: Math.floor(new Date(trade.created_at).getTime() / 1000),
      price: trade.price,
      volume: trade.amount * trade.price,
    }));

    // Sort by time
    priceData.sort((a, b) => a.time - b.time);

    if (chartType === 'candlestick') {
      const { candles, volume } = convertToCandlestickData(priceData);
      setChartData(candles);
      setVolumeData(volume);
    } else {
      const lineDataConverted = convertToLineData(priceData);
      setLineData(lineDataConverted);
    }
  }, [trades, chartType, timeframe]);

  const generateSampleData = () => {
    // Generate sample bonding curve data (exponential growth)
    const now = Math.floor(Date.now() / 1000);
    const hoursBack = 168; // 1 week
    const data: CandlestickData[] = [];
    const volume: HistogramData[] = [];

    for (let i = hoursBack; i >= 0; i--) {
      const time = now - i * 3600;
      const basePrice = 0.001;
      const growth = Math.pow(1.01, hoursBack - i); // Exponential growth
      const volatility = Math.random() * 0.02 - 0.01; // ±1%
      
      const open = basePrice * growth;
      const high = open * (1 + Math.abs(volatility));
      const low = open * (1 - Math.abs(volatility));
      const close = open * (1 + volatility);

      data.push({
        time: time as any,
        open,
        high,
        low,
        close,
      });

      volume.push({
        time: time as any,
        value: Math.random() * 10000 + 1000,
        color: close >= open ? '#10B981' : '#EF4444',
      });
    }

    setChartData(data);
    setVolumeData(volume);
  };

  const handleTimeframeChange = async (newTimeframe: any) => {
    setTimeframe(newTimeframe);
    setLoading(true);
    
    // TODO: Fetch data for new timeframe from API
    // For now, just simulate loading
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setLoading(false);
  };

  const stats = {
    high24h: chartData.length > 0 ? Math.max(...chartData.map(d => d.high)) : currentPrice,
    low24h: chartData.length > 0 ? Math.min(...chartData.map(d => d.low)) : currentPrice,
    volume24h: volumeData.reduce((sum, v) => sum + v.value, 0),
    change24h: chartData.length >= 2 
      ? ((chartData[chartData.length - 1].close - chartData[0].open) / chartData[0].open * 100)
      : 0,
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      {/* Chart Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Price Chart</h3>
            <div className="flex items-baseline gap-3">
              <div className="text-3xl font-bold text-white">
                ${currentPrice.toFixed(6)}
              </div>
              <div className={`text-lg font-semibold ${
                stats.change24h >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {stats.change24h >= 0 ? '+' : ''}{stats.change24h.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setChartType('candlestick')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                chartType === 'candlestick'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Candlestick
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                chartType === 'line'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Line
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">24h High</div>
            <div className="text-sm font-semibold text-white">
              ${stats.high24h.toFixed(6)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">24h Low</div>
            <div className="text-sm font-semibold text-white">
              ${stats.low24h.toFixed(6)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">24h Volume</div>
            <div className="text-sm font-semibold text-white">
              ${stats.volume24h.toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Trades</div>
            <div className="text-sm font-semibold text-white">
              {trades.length || chartData.length}
            </div>
          </div>
        </div>
      </div>

      {/* TradingView Chart */}
      <TradingViewChart
        data={chartType === 'candlestick' ? chartData : lineData}
        type={chartType}
        height={height}
        showVolume={true}
        volumeData={volumeData}
        theme="dark"
        onTimeframeChange={handleTimeframeChange}
        loading={loading}
      />

      {/* Bonding Curve Info */}
      <div className="mt-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-white mb-1">Bonding Curve Active</h4>
            <p className="text-xs text-gray-300">
              This token uses a bonding curve pricing model. Price automatically increases with each purchase 
              and decreases with each sale. Graduates to Raydium at $69k market cap.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
