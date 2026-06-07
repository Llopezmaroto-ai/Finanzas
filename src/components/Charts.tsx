import { formatCurrency } from '../utils/format';

interface SeriesPoint { label: string; value: number }

export const MiniBarChart = ({ title, data, color = '#2563eb' }: { title: string; data: SeriesPoint[]; color?: string }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return <div className="chart-card">
    <h3>{title}</h3>
    <div className="bars">{data.map((d) => <div className="bar-wrap" key={d.label} title={`${d.label}: ${formatCurrency(d.value)}`}>
      <span className="bar-value">{formatCurrency(d.value)}</span>
      <div className="bar" style={{ height: `${Math.max((d.value / max) * 100, 3)}%`, background: color }} />
      <small>{d.label}</small>
    </div>)}</div>
  </div>;
};

export const DonutList = ({ title, data }: { title: string; data: { label: string; value: number; color?: string }[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return <div className="chart-card">
    <h3>{title}</h3>
    <div className="donut-list">
      {data.length === 0 && <p className="muted">Sin datos para el periodo.</p>}
      {data.map((item, index) => {
        const percentage = total === 0 ? 0 : (item.value / total) * 100;
        return <div className="donut-row" key={item.label}>
          <span className="dot" style={{ background: item.color ?? palette[index % palette.length] }} />
          <span>{item.label}</span>
          <strong>{formatCurrency(item.value)}</strong>
          <small>{percentage.toFixed(1)}%</small>
        </div>;
      })}
    </div>
  </div>;
};

export const palette = ['#2563eb', '#0f766e', '#9333ea', '#ea580c', '#be123c', '#4f46e5', '#16a34a', '#ca8a04'];
