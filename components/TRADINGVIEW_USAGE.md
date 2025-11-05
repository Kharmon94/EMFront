# TradingView Charts Integration

## Overview

We're using **TradingView Lightweight Charts** - the professional-grade, open-source charting library used by major exchanges like Binance, Coinbase, and more.

### Why Lightweight Charts?

- ✅ **Fast** - Optimized for rendering millions of data points
- ✅ **Beautiful** - Professional trading UI
- ✅ **Customizable** - Full control over appearance
- ✅ **Free** - Open source, no external dependencies
- ✅ **Mobile-friendly** - Responsive and touch-enabled
- ✅ **Real-time** - Built for live data updates

---

## Installation

Already added to `package.json`:

```bash
npm install lightweight-charts
```

---

## Basic Usage

### 1. Candlestick Chart (Default)

```tsx
import TradingViewChart from '@/components/TradingViewChart';
import type { CandlestickData } from 'lightweight-charts';

const data: CandlestickData[] = [
  { time: 1638360000, open: 100, high: 110, low: 95, close: 105 },
  { time: 1638446400, open: 105, high: 115, low: 100, close: 112 },
  // ... more data
];

<TradingViewChart
  data={data}
  type="candlestick"
  height={400}
  showVolume={true}
/>
```

### 2. Line Chart

```tsx
import { convertToLineData } from '@/components/TradingViewChart';

const prices = [
  { time: 1638360000, price: 100 },
  { time: 1638446400, price: 105 },
];

const lineData = convertToLineData(prices);

<TradingViewChart
  data={lineData}
  type="line"
  height={400}
/>
```

### 3. Area Chart

```tsx
<TradingViewChart
  data={lineData}
  type="area"
  height={400}
  theme="dark"
/>
```

---

## Component Props

### TradingViewChart

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `CandlestickData[] \| LineData[]` | Required | Chart data |
| `type` | `'candlestick' \| 'line' \| 'area'` | `'candlestick'` | Chart type |
| `height` | `number` | `400` | Chart height in pixels |
| `showVolume` | `boolean` | `true` | Show volume bars |
| `volumeData` | `HistogramData[]` | `undefined` | Volume data |
| `theme` | `'light' \| 'dark'` | `'dark'` | Color theme |
| `onTimeframeChange` | `(tf: TimeFrame) => void` | `undefined` | Timeframe callback |
| `loading` | `boolean` | `false` | Show loading state |

---

## Data Format

### Candlestick Data

```typescript
interface CandlestickData {
  time: number; // Unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
}
```

### Line Data

```typescript
interface LineData {
  time: number; // Unix timestamp
  value: number; // Price
}
```

### Volume Data

```typescript
interface HistogramData {
  time: number;
  value: number; // Volume
  color?: string; // Optional color (green/red)
}
```

---

## Helper Functions

### Convert Trade Data to Candlesticks

```typescript
import { convertToCandlestickData } from '@/components/TradingViewChart';

const trades = [
  { time: 1638360000, price: 100, volume: 1000 },
  { time: 1638360060, price: 101, volume: 500 },
];

const { candles, volume } = convertToCandlestickData(trades);

<TradingViewChart
  data={candles}
  volumeData={volume}
/>
```

### Convert Prices to Line Data

```typescript
import { convertToLineData } from '@/components/TradingViewChart';

const prices = [
  { time: 1638360000, price: 100 },
  { time: 1638446400, price: 105 },
];

const lineData = convertToLineData(prices);

<TradingViewChart
  data={lineData}
  type="line"
/>
```

---

## Real-Time Updates

For live data updates, use React state:

```tsx
const [chartData, setChartData] = useState<CandlestickData[]>([]);

useEffect(() => {
  // Connect to WebSocket
  const ws = new WebSocket('wss://your-api.com/trades');
  
  ws.onmessage = (event) => {
    const trade = JSON.parse(event.data);
    
    // Add new candle or update existing
    setChartData(prev => {
      const lastCandle = prev[prev.length - 1];
      const newTime = Math.floor(trade.time / 3600) * 3600;
      
      if (lastCandle.time === newTime) {
        // Update existing candle
        return [
          ...prev.slice(0, -1),
          {
            ...lastCandle,
            high: Math.max(lastCandle.high, trade.price),
            low: Math.min(lastCandle.low, trade.price),
            close: trade.price,
          },
        ];
      } else {
        // Add new candle
        return [
          ...prev,
          {
            time: newTime,
            open: trade.price,
            high: trade.price,
            low: trade.price,
            close: trade.price,
          },
        ];
      }
    });
  };
  
  return () => ws.close();
}, []);

<TradingViewChart data={chartData} />
```

---

## Fetching Historical Data

```typescript
const fetchChartData = async (tokenId: number, timeframe: string) => {
  const response = await fetch(
    `/api/v1/tokens/${tokenId}/chart?timeframe=${timeframe}`
  );
  
  const { candles, volume } = await response.json();
  
  return { candles, volume };
};

// Usage
const { candles, volume } = await fetchChartData(123, '1h');

<TradingViewChart
  data={candles}
  volumeData={volume}
/>
```

---

## Customization Examples

### Custom Colors

```typescript
// In TradingViewChart.tsx, modify the series options:

chart.addCandlestickSeries({
  upColor: '#00FF00',      // Custom green
  downColor: '#FF0000',    // Custom red
  borderUpColor: '#00FF00',
  borderDownColor: '#FF0000',
  wickUpColor: '#00FF00',
  wickDownColor: '#FF0000',
});
```

### Custom Timeframe Buttons

```typescript
const customTimeframes = ['5m', '15m', '1h', '4h', '1d', '1w', '1M'];

<TradingViewChart
  data={data}
  onTimeframeChange={(tf) => {
    console.log('Timeframe changed to:', tf);
    fetchNewData(tf);
  }}
/>
```

### Custom Height for Mobile

```typescript
const isMobile = useMediaQuery('(max-width: 768px)');

<TradingViewChart
  data={data}
  height={isMobile ? 300 : 500}
/>
```

---

## Performance Tips

### 1. Limit Data Points

```typescript
// Only show last 500 candles
const limitedData = chartData.slice(-500);

<TradingViewChart data={limitedData} />
```

### 2. Debounce Updates

```typescript
import { useDebouncedValue } from '@/hooks/useDebounce';

const debouncedData = useDebouncedValue(chartData, 100);

<TradingViewChart data={debouncedData} />
```

### 3. Memoize Data Conversion

```typescript
const memoizedCandles = useMemo(
  () => convertToCandlestickData(trades),
  [trades]
);

<TradingViewChart data={memoizedCandles.candles} />
```

---

## Where Charts Are Used

### 1. Token Trading Page (`/tokens/[id]`)
- Candlestick chart with volume
- Multiple timeframes (1m, 5m, 15m, 1h, 4h, 1d)
- Real-time trade updates
- Buy/sell indicators

### 2. Bonding Curve Display
- Shows exponential price growth
- Graduation threshold indicator
- Trade history visualization
- Volume analysis

### 3. Platform Metrics (`/platform`)
- Line chart for daily volume
- Area chart for user growth
- Historical fee collection

### 4. Artist Token Performance
- Portfolio value over time
- Holder distribution chart
- Trading volume trends

---

## API Integration

### Expected Backend Endpoint

```ruby
# backend/app/controllers/api/v1/artist_tokens_controller.rb

def chart
  @token = ArtistToken.find(params[:id])
  timeframe = params[:timeframe] || '1h'
  
  # Get trades grouped by timeframe
  candles = Trade.where(artist_token: @token)
                .group_by_hour(:created_at)
                .select(
                  'MIN(price) as low',
                  'MAX(price) as high',
                  'FIRST(price) as open',
                  'LAST(price) as close',
                  'SUM(amount) as volume',
                  'EXTRACT(EPOCH FROM date_trunc('hour', created_at)) as time'
                )
  
  render json: {
    candles: candles,
    timeframe: timeframe
  }
end
```

---

## Accessibility

The TradingView component includes:

- ✅ **Keyboard navigation** - Arrow keys to navigate
- ✅ **Crosshair** - Precise value reading
- ✅ **Touch support** - Mobile gestures
- ✅ **High contrast** - WCAG compliant colors
- ✅ **Screen reader** - ARIA labels (can be enhanced)

---

## Troubleshooting

### Chart not rendering?

1. Check data format (must be sorted by time)
2. Verify timestamps are Unix timestamps (seconds, not milliseconds)
3. Ensure container has width/height

### Data not updating?

1. Use `setData()` not `update()` for batch updates
2. Check React state is properly updating
3. Verify useEffect dependencies

### Performance issues?

1. Limit data points to last 1000
2. Use debounced updates for real-time data
3. Memoize data conversions

---

## Advanced Features

### Adding Indicators

```typescript
// Add moving average
const movingAverage = chart.addLineSeries({
  color: '#FFD700',
  lineWidth: 1,
});

// Calculate 20-period MA
const ma20 = calculateMA(chartData, 20);
movingAverage.setData(ma20);
```

### Price Alerts

```typescript
chart.subscribeCrosshairMove((param) => {
  if (param.time) {
    const price = param.seriesData.get(candlestickSeries);
    
    if (price.close > alertPrice) {
      showNotification('Price alert triggered!');
    }
  }
});
```

### Drawing Tools

```typescript
// Add horizontal line (support/resistance)
const priceLine = candlestickSeries.createPriceLine({
  price: 100,
  color: '#FFD700',
  lineWidth: 2,
  lineStyle: 2, // Dashed
  axisLabelVisible: true,
  title: 'Support',
});
```

---

## Resources

- **Official Docs**: https://tradingview.github.io/lightweight-charts/
- **Examples**: https://tradingview.github.io/lightweight-charts/tutorials/
- **GitHub**: https://github.com/tradingview/lightweight-charts

---

## Next Steps

1. ✅ Install library
2. ✅ Create TradingViewChart component
3. ✅ Update BondingCurveChart
4. ⏳ Add real-time WebSocket updates
5. ⏳ Implement backend chart endpoint
6. ⏳ Add drawing tools (optional)
7. ⏳ Add technical indicators (optional)

**Your charts are now professional-grade! 📈🚀**

