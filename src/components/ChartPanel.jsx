import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { suggestCharts } from '../utils/gemini';

const COLORS = ['#4f46e5', '#059669', '#d97706', '#ef4444', '#8b5cf6', '#06b6d4'];

const ChartPanel = ({ data, stats, dataContext, backendSessionId, cachedCharts, onChartsCached }) => {
  const [charts, setCharts] = useState(cachedCharts || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateCharts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const suggestions = await suggestCharts(dataContext);
      setCharts(suggestions);
      onChartsCached(suggestions);
    } catch (err) {
      setError('Could not generate chart suggestions. Try refreshing.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dataContext, onChartsCached]);

  useEffect(() => {
    if (cachedCharts && cachedCharts.length > 0) {
      setCharts(cachedCharts);
      return;
    }
    if (data && stats) {
      generateCharts();
    }
  }, [cachedCharts, data, stats, generateCharts]);

  const prepareChartData = (chart) => {
    if (chart.type === 'pie') {
      const counts = {};
      data.forEach((row) => {
        const val = row[chart.xKey];
        if (val !== undefined && val !== '') {
          counts[val] = (counts[val] || 0) + 1;
        }
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }

    return data
      .filter((row) => row[chart.xKey] !== '' && row[chart.yKey] !== '')
      .slice(0, 50)
      .map((row) => ({
        [chart.xKey]: row[chart.xKey],
        [chart.yKey]: parseFloat(row[chart.yKey]) || row[chart.yKey],
      }));
  };

  const renderChart = (chart, index) => {
    const chartData = prepareChartData(chart);
    if (!chartData || chartData.length === 0) return null;

    return (
      <div
        key={index}
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: '#fafafa',
          marginBottom: '16px',
        }}
      >
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
          {chart.title}
        </h4>
        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
          {chart.reasoning}
        </p>

        <ResponsiveContainer width="100%" height={300}>
          {chart.type === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xKey} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey={chart.yKey} fill={COLORS[index % COLORS.length]} />
            </BarChart>
          ) : chart.type === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xKey} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line dataKey={chart.yKey} stroke={COLORS[index % COLORS.length]} dot={false} />
            </LineChart>
          ) : chart.type === 'scatter' ? (
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xKey} tick={{ fontSize: 11 }} />
              <YAxis dataKey={chart.yKey} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Scatter data={chartData} fill={COLORS[index % COLORS.length]} />
            </ScatterChart>
          ) : chart.type === 'pie' ? (
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : null}
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div style={{ marginTop: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
          AI Suggested Charts
        </h3>
        <button
          onClick={generateCharts}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: loading ? '#e5e7eb' : '#4f46e5',
            color: loading ? '#9ca3af' : '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '13px',
          }}
        >
          {loading ? 'Generating...' : 'Regenerate Charts'}
        </button>
      </div>

      {loading && (
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Analyzing your data and generating charts...
        </p>
      )}

      {error && (
        <p style={{ color: '#ef4444', fontSize: '14px' }}>{error}</p>
      )}

      {!loading && charts.map((chart, index) => renderChart(chart, index))}
    </div>
  );
};

export default ChartPanel;