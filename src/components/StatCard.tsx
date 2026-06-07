export const StatCard = ({ title, value, detail, tone = 'neutral' }: { title: string; value: string; detail?: string; tone?: 'neutral' | 'good' | 'bad' | 'info' }) => (
  <article className={`stat-card ${tone}`}>
    <span>{title}</span>
    <strong>{value}</strong>
    {detail && <small>{detail}</small>}
  </article>
);
