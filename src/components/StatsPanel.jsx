const StatsPanel = ({ stats }) => {
  if (!stats || !stats.rowCount) return null;

  return (
    <div style={{ marginTop: '24px' }}>
      <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
        Dataset Overview
      </h3>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <StatCard label="Total Rows" value={stats.rowCount} />
        <StatCard label="Total Columns" value={stats.columnCount} />
        <StatCard
          label="Total Missing Values"
          value={Object.values(stats.columns).reduce(
            (acc, col) => acc + col.missing, 0
          )}
        />
        <StatCard
          label="Numeric Columns"
          value={Object.values(stats.columns).filter(
            (col) => col.type === 'numeric'
          ).length}
        />
        <StatCard
          label="Categorical Columns"
          value={Object.values(stats.columns).filter(
            (col) => col.type === 'categorical'
          ).length}
        />
        <StatCard
          label="Date Columns"
          value={Object.values(stats.columns).filter(
            (col) => col.type === 'date'
          ).length}
        />
      </div>
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div
    style={{
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px 24px',
      minWidth: '140px',
      textAlign: 'center',
    }}
  >
    <p style={{ fontSize: '28px', fontWeight: '700', color: '#4f46e5', margin: 0 }}>
      {value}
    </p>
    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
      {label}
    </p>
  </div>
);

export default StatsPanel;