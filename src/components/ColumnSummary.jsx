const ColumnSummary = ({ stats }) => {
  if (!stats || !stats.columns) return null;

  const columns = Object.entries(stats.columns);

  const typeColor = (type) => {
    if (type === 'numeric') return '#4f46e5';
    if (type === 'categorical') return '#059669';
    if (type === 'date') return '#d97706';
    return '#9ca3af';
  };

  const typeBg = (type) => {
    if (type === 'numeric') return '#eef2ff';
    if (type === 'categorical') return '#ecfdf5';
    if (type === 'date') return '#fffbeb';
    return '#f3f4f6';
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
        Column Summary
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {columns.map(([colName, colStats]) => (
          <div
            key={colName}
            style={{
              backgroundColor: '#fafafa',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontWeight: '600', color: '#111827', minWidth: '150px' }}>
              {colName}
            </span>

            <span
              style={{
                backgroundColor: typeBg(colStats.type),
                color: typeColor(colStats.type),
                padding: '2px 10px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              {colStats.type}
            </span>

            <span style={{ fontSize: '13px', color: '#6b7280' }}>
              {colStats.unique} unique
            </span>

            <span style={{ fontSize: '13px', color: colStats.missing > 0 ? '#ef4444' : '#9ca3af' }}>
              {colStats.missing} missing
            </span>

            {colStats.type === 'numeric' && (
              <>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                  Min: <strong>{colStats.min}</strong>
                </span>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                  Max: <strong>{colStats.max}</strong>
                </span>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                  Avg: <strong>{colStats.average}</strong>
                </span>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                  Sum: <strong>{colStats.sum}</strong>
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColumnSummary;