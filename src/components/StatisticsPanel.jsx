import { useState } from 'react';
import { getCorrelation, getOutliers, runStatTest } from '../utils/api';

const StatisticsPanel = ({ stats, backendSessionId }) => {
  const [correlation, setCorrelation] = useState(null);
  const [outliers, setOutliers] = useState(null);
  const [statTest, setStatTest] = useState(null);
  const [col1, setCol1] = useState('');
  const [col2, setCol2] = useState('');
  const [loading, setLoading] = useState({
    correlation: false,
    outliers: false,
    statTest: false,
  });
  const [error, setError] = useState('');

  const numericColumns = stats
    ? Object.entries(stats.columns)
        .filter(([, col]) => col.type === 'numeric')
        .map(([name]) => name)
    : [];

  const handleCorrelation = async () => {
    if (!backendSessionId) return;
    setLoading((prev) => ({ ...prev, correlation: true }));
    setError('');
    try {
      const result = await getCorrelation(backendSessionId);
      setCorrelation(result.correlation);
    } catch (err) {
      setError('Failed to get correlation matrix.');
    } finally {
      setLoading((prev) => ({ ...prev, correlation: false }));
    }
  };

  const handleOutliers = async () => {
    if (!backendSessionId) return;
    setLoading((prev) => ({ ...prev, outliers: true }));
    setError('');
    try {
      const result = await getOutliers(backendSessionId);
      setOutliers(result.outliers);
    } catch (err) {
      setError('Failed to detect outliers.');
    } finally {
      setLoading((prev) => ({ ...prev, outliers: false }));
    }
  };

  const handleStatTest = async () => {
    if (!backendSessionId || !col1 || !col2) return;
    setLoading((prev) => ({ ...prev, statTest: true }));
    setError('');
    try {
      const result = await runStatTest(backendSessionId, col1, col2);
      setStatTest(result);
    } catch (err) {
      setError('Failed to run statistical test.');
    } finally {
      setLoading((prev) => ({ ...prev, statTest: false }));
    }
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
        Statistical Analysis
      </h3>

      {error && (
        <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '12px' }}>{error}</p>
      )}

      {/* Outlier Detection */}
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#fafafa',
        marginBottom: '16px',
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          Outlier Detection
        </h4>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
          Detects outliers in numeric columns using Z-score method.
        </p>
        <button
          onClick={handleOutliers}
          disabled={loading.outliers}
          style={{
            padding: '8px 16px',
            backgroundColor: loading.outliers ? '#e5e7eb' : '#4f46e5',
            color: loading.outliers ? '#9ca3af' : '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: loading.outliers ? 'not-allowed' : 'pointer',
            fontSize: '13px',
          }}
        >
          {loading.outliers ? 'Detecting...' : 'Detect Outliers'}
        </button>

        {outliers && (
          <div style={{ marginTop: '12px' }}>
            {Object.keys(outliers).length === 0 ? (
              <p style={{ fontSize: '13px', color: '#059669' }}>
                ✓ No significant outliers detected
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(outliers).map(([col, data]) => (
                  <div
                    key={col}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#fff7ed',
                      border: '1px solid #fed7aa',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                  >
                    <strong>{col}</strong> — {data.count} outliers ({data.percentage}% of values)
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Correlation Matrix */}
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#fafafa',
        marginBottom: '16px',
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          Correlation Matrix
        </h4>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
          Shows correlations between all numeric columns.
        </p>
        <button
          onClick={handleCorrelation}
          disabled={loading.correlation}
          style={{
            padding: '8px 16px',
            backgroundColor: loading.correlation ? '#e5e7eb' : '#4f46e5',
            color: loading.correlation ? '#9ca3af' : '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: loading.correlation ? 'not-allowed' : 'pointer',
            fontSize: '13px',
          }}
        >
          {loading.correlation ? 'Computing...' : 'Get Correlation Matrix'}
        </button>

        {correlation && (
          <div style={{ marginTop: '12px', overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px', border: '1px solid #e5e7eb', backgroundColor: '#f3f4f6' }}></th>
                  {Object.keys(correlation).map((col) => (
                    <th key={col} style={{
                      padding: '8px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: '#f3f4f6',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(correlation).map(([rowCol, values]) => (
                  <tr key={rowCol}>
                    <td style={{
                      padding: '8px',
                      border: '1px solid #e5e7eb',
                      fontWeight: '600',
                      backgroundColor: '#f3f4f6',
                      whiteSpace: 'nowrap',
                    }}>
                      {rowCol}
                    </td>
                    {Object.values(values).map((val, i) => {
                      const absVal = Math.abs(val);
                      const bg = absVal > 0.7
                        ? '#dbeafe'
                        : absVal > 0.4
                        ? '#eff6ff'
                        : '#ffffff';
                      return (
                        <td key={i} style={{
                          padding: '8px',
                          border: '1px solid #e5e7eb',
                          textAlign: 'center',
                          backgroundColor: bg,
                          color: val === 1 ? '#6b7280' : '#111827',
                        }}>
                          {typeof val === 'number' ? val.toFixed(3) : val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistical Tests */}
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#fafafa',
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          Statistical Tests
        </h4>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
          Run T-test and Pearson correlation between two numeric columns.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
              Column 1
            </label>
            <select
              value={col1}
              onChange={(e) => setCol1(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '13px',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="">Select column</option>
              {numericColumns.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
              Column 2
            </label>
            <select
              value={col2}
              onChange={(e) => setCol2(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '13px',
                backgroundColor: '#ffffff',
              }}
            >
              <option value="">Select column</option>
              {numericColumns.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleStatTest}
          disabled={loading.statTest || !col1 || !col2}
          style={{
            padding: '8px 16px',
            backgroundColor: loading.statTest || !col1 || !col2 ? '#e5e7eb' : '#4f46e5',
            color: loading.statTest || !col1 || !col2 ? '#9ca3af' : '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: loading.statTest || !col1 || !col2 ? 'not-allowed' : 'pointer',
            fontSize: '13px',
          }}
        >
          {loading.statTest ? 'Running...' : 'Run Tests'}
        </button>

        {statTest && (
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              padding: '16px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              minWidth: '200px',
            }}>
              <h5 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#4f46e5' }}>
                T-Test
              </h5>
              <p style={{ fontSize: '13px', margin: '4px 0' }}>
                T-statistic: <strong>{statTest.t_test?.t_statistic}</strong>
              </p>
              <p style={{ fontSize: '13px', margin: '4px 0' }}>
                P-value: <strong>{statTest.t_test?.p_value}</strong>
              </p>
              <p style={{ fontSize: '13px', margin: '4px 0' }}>
                Significant:{' '}
                <strong style={{ color: statTest.t_test?.significant ? '#059669' : '#ef4444' }}>
                  {statTest.t_test?.significant ? 'Yes' : 'No'}
                </strong>
              </p>
            </div>

            <div style={{
              padding: '16px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              minWidth: '200px',
            }}>
              <h5 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#4f46e5' }}>
                Pearson Correlation
              </h5>
              <p style={{ fontSize: '13px', margin: '4px 0' }}>
                R value: <strong>{statTest.correlation?.pearson_r}</strong>
              </p>
              <p style={{ fontSize: '13px', margin: '4px 0' }}>
                P-value: <strong>{statTest.correlation?.p_value}</strong>
              </p>
              <p style={{ fontSize: '13px', margin: '4px 0' }}>
                Significant:{' '}
                <strong style={{ color: statTest.correlation?.significant ? '#059669' : '#ef4444' }}>
                  {statTest.correlation?.significant ? 'Yes' : 'No'}
                </strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsPanel;