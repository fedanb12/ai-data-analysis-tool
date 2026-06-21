const DataTable = ({ data }) => {
  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);
  const preview = data.slice(0, 50);

  return (
    <div style={{ marginTop: '24px' }}>
      <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
        Data Preview — showing {preview.length} of {data.length} rows
      </h3>
      <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6' }}>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontWeight: '600',
                    borderBottom: '1px solid #e5e7eb',
                    whiteSpace: 'nowrap',
                    color: '#374151',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr
                key={i}
                style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fafb' }}
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    style={{
                      padding: '8px 14px',
                      borderBottom: '1px solid #f3f4f6',
                      whiteSpace: 'nowrap',
                      color: '#6b7280',
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {row[col] === '' || row[col] === null || row[col] === undefined
                      ? <span style={{ color: '#d1d5db', fontStyle: 'italic' }}>empty</span>
                      : String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;