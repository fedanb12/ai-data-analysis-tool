const HistoryPanel = ({ history }) => {
  if (!history || history.length === 0) return null;

  return (
    <div style={{ marginTop: '32px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
        Analysis History
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {history.map((item, i) => (
          <div
            key={i}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#fafafa',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#4f46e5',
                  margin: 0,
                }}
              >
                Q: {item.question}
              </p>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                {new Date(item.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <p
              style={{
                fontSize: '13px',
                color: '#374151',
                margin: 0,
                whiteSpace: 'pre-wrap',
                lineHeight: '1.6',
              }}
            >
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;