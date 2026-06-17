"use client";

import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";

export function PriceHistoryChart({ events }: { events: any[] }) {
  // Group by token, take last event per token
  const byToken: Record<string, { time: string; price: number; forecast?: number }[]> = {};
  events
    .filter(e => e.output_json?.token && e.output_json?.priceHistory)
    .forEach(e => {
      const token = e.output_json.token;
      const hist: number[] = e.output_json.priceHistory || [];
      byToken[token] = hist.map((price, j) => ({
        time: `${hist.length - 1 - j}h ago`,
        price,
        forecast: j === hist.length - 1 ? e.output_json.forecast?.forecasted_price : undefined,
      }));
    });

  const tokens = Object.keys(byToken);
  if (tokens.length === 0) return <EmptyChart label="No price history yet" />;

  return (
    <div className="space-y-6">
      {tokens.map((token) => {
        const series = byToken[token];
        if (series.length === 0) return null;

        const firstPrice = series[0].price;
        const lastPrice = series[series.length - 1].price;
        const priceDiff = lastPrice - firstPrice;
        const pctChange = firstPrice > 0 ? (priceDiff / firstPrice) * 100 : 0;
        const isUp = priceDiff >= 0;

        const strokeColor = isUp ? "#10b981" : "#ef4444";
        const gradientId = `grad-${token}`;

        const prices = series.map(s => s.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const range = maxPrice - minPrice;
        const padding = range * 0.15 || minPrice * 0.01;
        const yDomain = [minPrice - padding, maxPrice + padding];

        const lastForecast = series[series.length - 1]?.forecast;

        return (
          <div key={token} className="glass-panel p-5 relative overflow-hidden group">
            {/* Header info */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Asset</span>
                <h4 className="font-outfit font-bold text-base text-white">{token} / USD</h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Current Price</span>
                <div className="flex items-center justify-end gap-1.5">
                  <span className="font-mono font-bold text-base text-white">
                    ${lastPrice >= 1 ? lastPrice.toFixed(2) : lastPrice.toFixed(4)}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                    {isUp ? "▲" : "▼"} {pctChange.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={strokeColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#6b7280" }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
                <YAxis
                  domain={yDomain}
                  tick={{ fontSize: 9, fill: "#6b7280" }}
                  width={60}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(1)}k` : `$${v.toFixed(v >= 1 ? 2 : 4)}`}
                />
                <Tooltip
                  contentStyle={{ background: "#0d0d0d", border: "1px solid #ffffff15", borderRadius: 8 }}
                  labelStyle={{ color: "#9ca3af", fontSize: 10 }}
                  itemStyle={{ color: "#ffffff", fontSize: 11, fontWeight: "bold" }}
                  formatter={(v: number) => [`$${v >= 1 ? v.toFixed(2) : v.toFixed(4)}`, "Price"]}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={strokeColor}
                  fill={`url(#${gradientId})`}
                  strokeWidth={2}
                  dot={false}
                />
                {lastForecast && (
                  <ReferenceLine
                    y={lastForecast}
                    stroke="#facc15"
                    strokeDasharray="4 4"
                    label={{ value: `FC: $${lastForecast.toFixed(2)}`, position: "top", fill: "#facc15", fontSize: 9, fontWeight: "bold" }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );
      })}
    </div>
  );
}

// ─── Decision Distribution Chart ─────────────────────────────────────────────
export function DecisionChart({ events }: { events: any[] }) {
  const counts: Record<string, Record<string, number>> = {};

  events.forEach(e => {
    const token = e.output_json?.token || "UNKNOWN";
    const decision = e.output_json?.decision || "HOLD";
    if (!counts[token]) counts[token] = { BUY: 0, SELL: 0, HOLD: 0 };
    counts[token][decision] = (counts[token][decision] || 0) + 1;
  });

  const data = Object.entries(counts).map(([token, d]) => ({
    token, BUY: d.BUY || 0, SELL: d.SELL || 0, HOLD: d.HOLD || 0,
  }));

  if (data.length === 0) return <EmptyChart label="No decisions yet" />;

  return (
    <div className="glass-panel p-4">
      <h4 className="font-outfit font-semibold text-sm mb-3">Decision Distribution by Token</h4>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="token" tick={{ fontSize: 11, fill: "#9ca3af" }} />
          <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
          <Tooltip
            contentStyle={{ background: "#0d0d0d", border: "1px solid #ffffff20", borderRadius: 8 }}
            labelStyle={{ color: "#9ca3af" }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="BUY"  fill="#22d3ee" radius={[3,3,0,0]} />
          <Bar dataKey="SELL" fill="#f87171" radius={[3,3,0,0]} />
          <Bar dataKey="HOLD" fill="#facc15" radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Risk Score Timeline ──────────────────────────────────────────────────────
export function RiskScoreChart({ events }: { events: any[] }) {
  const data = events
    .filter(e => e.output_json?.riskScore !== undefined)
    .slice(-30)
    .map((e, i) => ({
      idx: i + 1,
      token: e.output_json?.token || "?",
      risk: e.output_json.riskScore,
      label: `${e.output_json?.token} #${i + 1}`,
    }));

  if (data.length === 0) return <EmptyChart label="No risk scores yet" />;

  return (
    <div className="glass-panel p-4">
      <h4 className="font-outfit font-semibold text-sm mb-3">Risk Score Timeline (last 30 cycles)</h4>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="label" tick={{ fontSize: 8, fill: "#6b7280" }} interval={4} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#6b7280" }} />
          <Tooltip
            contentStyle={{ background: "#0d0d0d", border: "1px solid #ffffff20", borderRadius: 8 }}
            labelStyle={{ color: "#9ca3af" }}
            formatter={(v: number) => [`${v}/100`, "Risk Score"]}
          />
          <ReferenceLine y={70} stroke="#f87171" strokeDasharray="4 4"
            label={{ value: "Block threshold", position: "right", fill: "#f87171", fontSize: 9 }} />
          <Line type="monotone" dataKey="risk" stroke="#a78bfa" strokeWidth={2}
            dot={{ r: 3, fill: "#a78bfa" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Sentiment Trend Chart ────────────────────────────────────────────────────
export function SentimentChart({ events }: { events: any[] }) {
  const data = events
    .filter(e => e.inputs_json?.sentiment !== undefined)
    .slice(-30)
    .map((e, i) => ({
      idx: i + 1,
      token: e.inputs_json?.token || "?",
      sentiment: parseFloat((e.inputs_json.sentiment * 100).toFixed(1)),
      label: `${e.inputs_json?.token} #${i + 1}`,
    }));

  if (data.length === 0) return <EmptyChart label="No sentiment data yet" />;

  return (
    <div className="glass-panel p-4">
      <h4 className="font-outfit font-semibold text-sm mb-3">Sentiment Score Timeline (last 30 cycles)</h4>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#34d399" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="label" tick={{ fontSize: 8, fill: "#6b7280" }} interval={4} />
          <YAxis domain={[-100, 100]} tick={{ fontSize: 10, fill: "#6b7280" }}
            tickFormatter={v => `${v}%`} />
          <Tooltip
            contentStyle={{ background: "#0d0d0d", border: "1px solid #ffffff20", borderRadius: 8 }}
            formatter={(v: number) => [`${v}%`, "Sentiment"]}
          />
          <ReferenceLine y={0} stroke="#ffffff30" />
          <Area type="monotone" dataKey="sentiment" stroke="#34d399"
            fill="url(#sentGrad)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Risk Breakdown Radar ────────────────────────────────────────────────────
export function RiskRadarChart({ events }: { events: any[] }) {
  const last = events.filter(e => e.output_json?.riskBreakdown).slice(-1)[0];
  if (!last) return <EmptyChart label="No risk breakdown yet" />;

  const b = last.output_json.riskBreakdown;
  const data = [
    { metric: "Position", value: b.positionSizePct   || 0 },
    { metric: "Slippage", value: b.slippageRisk       || 0 },
    { metric: "Liquidity",value: b.liquidityDepth     || 0 },
    { metric: "Volatility",value: b.volatilityScore   || 0 },
    { metric: "Sentiment", value: b.sentimentRisk     || 0 },
    { metric: "Reputation",value: b.reputationRisk    || 0 },
  ];

  return (
    <div className="glass-panel p-4">
      <h4 className="font-outfit font-semibold text-sm mb-1">Latest Risk Breakdown</h4>
      <p className="text-xs text-muted-foreground mb-3">
        Token: {last.output_json?.token} | Total: {last.output_json?.riskScore}/100
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data}>
          <PolarGrid stroke="#ffffff15" />
          <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "#9ca3af" }} />
          <Radar name="Risk" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
          <Tooltip
            contentStyle={{ background: "#0d0d0d", border: "1px solid #ffffff20", borderRadius: 8 }}
            formatter={(v: number) => [`${v}/100`, "Risk"]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Forecast Accuracy Chart ─────────────────────────────────────────────────
export function ForecastAccuracyChart({ events }: { events: any[] }) {
  // Compare each forecast to the actual next price seen
  const withForecasts = events.filter(e =>
    e.output_json?.forecast?.forecasted_price && e.inputs_json?.price
  );

  const data = withForecasts.slice(-20).map((e, i) => {
    const actual = withForecasts[i + 1]?.inputs_json?.price;
    const predicted = e.output_json.forecast.forecasted_price;
    const token = e.output_json?.token || "?";
    return {
      label: `${token} #${i + 1}`,
      predicted: parseFloat(predicted.toFixed(4)),
      actual: actual ? parseFloat(actual.toFixed(4)) : null,
      direction: e.output_json.forecast.direction,
    };
  }).filter(d => d.actual !== null);

  if (data.length === 0) return <EmptyChart label="Need 2+ cycles for forecast accuracy" />;

  return (
    <div className="glass-panel p-4">
      <h4 className="font-outfit font-semibold text-sm mb-3">Forecast vs Actual Price</h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="label" tick={{ fontSize: 8, fill: "#6b7280" }} interval={2} />
          <YAxis tick={{ fontSize: 9, fill: "#6b7280" }}
            tickFormatter={v => v >= 1000 ? `$${(v/1000).toFixed(1)}k` : `$${v.toFixed(2)}`} />
          <Tooltip
            contentStyle={{ background: "#0d0d0d", border: "1px solid #ffffff20", borderRadius: 8 }}
            formatter={(v: number) => [`$${v.toFixed(4)}`]}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="predicted" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Prophet Forecast" />
          <Line type="monotone" dataKey="actual"    stroke="#22d3ee" strokeWidth={2} dot={{ r: 3 }} name="Actual Price" strokeDasharray="4 4" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function EmptyChart({ label }: { label: string }) {
  return (
    <div className="glass-panel p-6 text-center text-muted-foreground text-sm">
      {label}
    </div>
  );
}
