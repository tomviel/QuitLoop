interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

export function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div className="card flex flex-col gap-1">
      <p className="text-text-muted text-xs">{label}</p>
      <p className={`text-3xl font-bold leading-none ${accent ? 'text-success' : 'text-text-primary'}`}>
        {value}
      </p>
      {sub && <p className="text-text-secondary text-xs">{sub}</p>}
    </div>
  );
}
