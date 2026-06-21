import { useState } from 'react';
import { generateChartFromBackend } from '../utils/api';

const CHART_TYPES = [
  { type: 'histogram', label: 'Histogram', needsY: false },
  { type: 'pie', label: 'Pie Chart', needsY: false },
  { type: 'bar', label: 'Bar Chart', needsY: true },
  { type: 'line', label: 'Line Chart', needsY: true },
  { type: 'scatter', label: 'Scatter Plot', needsY: true },
  { type: 'heatmap', label: 'Correlation Heatmap', needsY: false, needsX: false },
];

const MatplotlibCharts = ({ stats, backendSessionId }) => {
  const [selectedChart, setSelectedChart] = useState('histogram');
  const [xCol, setXCol] = useState('');
  const [yCol, setYCol] = useState('');
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const columns = stats ? Object.keys(stats.columns) : [];
  const numericColumns = stats
    ? Object.entries(stats.columns)
        .filter(([, col]) => col.type === 'numeric')
        .map(([name]) => name)
    : [];

  const selectedChartConfig = CHART_TYPES.find((c) => c.type === selectedChart);
  const needsY = selectedChartConfig?.needsY ?? true;
  const needsX = selectedChartConfig?.needsX ?? true;

  
  const handleGenerate = async () => {
  console.log('backendSessionId:', backendSessionId);
  console.log('selectedChart:', selectedChart);
  console.log('xCol:', xCol);
  console.log('yCol:', yCol);

    if (!backendSessionId) {
      setError('Backend session not found. Make sure the backend is running.');
      return;
    }
    if (needsX && !xCol) {
      setError('Please select an X column.');
      return;
    }
    if (needsY && !yCol) {
      setError('Please select a Y column.');
      return;
    }

    setLoading(true);
    setError('');
    setImage(null);

    try {
      const result = await generateChartFromBackend(
        backendSessionId,
        selectedChart,
        xCol,
        needsY ? yCol : null,
        title
      );
      setImage(result.image);
    } catch (err) {
      setError('Failed to generate chart. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
        Python Charts
      </h3>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: '#fafafa',
        }}
      >
        {/* Chart type selector */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {CHART_TYPES.map((chart) => (
            <button
              key={chart.type}
              onClick={() => { setSelectedChart(chart.type); setImage(null); }}
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: selectedChart === chart.type ? '#4f46e5' : '#e5e7eb',
                color: selectedChart === chart.type ? '#ffffff' : '#374151',
                fontWeight: selectedChart === chart.type ? '600' : '400',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {chart.label}
            </button>
          ))}
        </div>

        {/* Column selectors */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {needsX && (
  <div>
    <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
      X Column {selectedChart === 'histogram' || selectedChart === 'pie' ? '(any)' : '(any)'}
    </label>
    <select
      value={xCol}
      onChange={(e) => setXCol(e.target.value)}
      style={{
        padding: '8px 12px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '13px',
        backgroundColor: '#ffffff',
      }}
    >
      <option value="">Select column</option>
      {(selectedChart === 'histogram' ? numericColumns : columns).map((col) => (
        <option key={col} value={col}>{col}</option>
      ))}
    </select>
  </div>
)}

          {needsY && (
            <div>
              <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                Y Column (numeric)
              </label>
              <select
                value={yCol}
                onChange={(e) => setYCol(e.target.value)}
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
          )}

          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Chart title"
              style={{
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '13px',
                width: '200px',
              }}
            />
          </div>
        </div>

        
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#e5e7eb' : '#4f46e5',
            color: loading ? '#9ca3af' : '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            marginBottom: '16px',
          }}
        >
          {loading ? 'Generating...' : 'Generate Chart'}
        </button>

        {error && (
          <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '12px' }}>{error}</p>
        )}

        {image && (
          <div style={{ marginTop: '16px' }}>
            <img
              src={`data:image/png;base64,${image}`}
              alt="Generated chart"
              style={{ width: '100%', borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MatplotlibCharts;