import { exportCSV } from '../utils/exportCSV';
import { useState } from 'react';
import { cleanData } from '../utils/cleanData';
import { cleanFileOnBackend } from '../utils/api';

const CleaningPanel = ({ data, fileName, backendSessionId, onDataCleaned }) => {
  const [report, setReport] = useState(null);
  const [cleaned, setCleaned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(null);

  const handleCleanFrontend = () => {
    const { cleaned: cleanedData, report: cleanReport } = cleanData(data);
    setReport(cleanReport);
    setCleaned(true);
    setMode('frontend');
    onDataCleaned(cleanedData);
  };

  const handleCleanBackend = async () => {
    if (!backendSessionId) {
      alert('Backend session not found. Make sure the backend is running.');
      return;
    }
    setLoading(true);
    try {
      const result = await cleanFileOnBackend(backendSessionId);
      setReport(result.report);
      setCleaned(true);
      setMode('backend');
      onDataCleaned(data, result.stats);
    } catch (err) {
      alert('Backend cleaning failed. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
        Data Cleaning
      </h3>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: '#fafafa',
        }}
      >
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
          Automatically removes duplicates, fills missing values, and fixes whitespace.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <button
            onClick={handleCleanFrontend}
            disabled={cleaned || loading}
            style={{
              padding: '10px 20px',
              backgroundColor: cleaned || loading ? '#e5e7eb' : '#4f46e5',
              color: cleaned || loading ? '#9ca3af' : '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: cleaned || loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            {cleaned && mode === 'frontend' ? 'Cleaned ✓' : 'Clean (Browser)'}
          </button>

          <button
            onClick={handleCleanBackend}
            disabled={cleaned || loading}
            style={{
              padding: '10px 20px',
              backgroundColor: cleaned || loading ? '#e5e7eb' : '#059669',
              color: cleaned || loading ? '#9ca3af' : '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: cleaned || loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            {loading ? 'Cleaning...' : cleaned && mode === 'backend' ? 'Cleaned ✓' : 'Clean (Python)'}
          </button>
        </div>

        <p style={{ fontSize: '12px', color: '#9ca3af' }}>
          Browser — fast, runs locally. Python — uses pandas, more accurate for large datasets.
        </p>

        {report && (
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <ReportCard label="Duplicates Removed" value={report.duplicatesRemoved} color="#ef4444" />
            <ReportCard label="Missing Values Filled" value={report.missingFilled} color="#d97706" />
            <ReportCard label="Whitespace Fixed" value={report.whitespaceFixed} color="#059669" />
            <ReportCard
              label="Final Row Count"
              value={report.totalRows - report.duplicatesRemoved}
              color="#4f46e5"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const ReportCard = ({ label, value, color }) => (
  <div
    style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '12px 20px',
      minWidth: '140px',
      textAlign: 'center',
    }}
  >
    <p style={{ fontSize: '24px', fontWeight: '700', color, margin: 0 }}>{value}</p>
    <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{label}</p>
  </div>
);

{report && (
  <button
    onClick={() => exportCSV(data, fileName)}
    style={{
      marginTop: '16px',
      padding: '10px 20px',
      backgroundColor: '#059669',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '14px',
    }}
  >
    Export Cleaned Data as CSV
  </button>
)}

export default CleaningPanel;