import { useState } from 'react';
import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';
import StatsPanel from './components/StatsPanel';
import ColumnSummary from './components/ColumnSummary';
import ChatPanel from './components/ChatPanel';
import ChartPanel from './components/ChartPanel';
import CleaningPanel from './components/CleaningPanel';
import MatplotlibCharts from './components/MatplotlibCharts';
import StatisticsPanel from './components/StatisticsPanel';
import { detectColumnTypes } from './utils/detectColumns';
import { calculateStats } from './utils/dataStats';
import { buildDataContext, generateInsights } from './utils/gemini';
import { saveSession, loadSessions, deleteSession } from './utils/db';
import { exportPDFFromBackend, uploadFileToBackend } from './utils/api';
import './styles/main.css';

const App = () => {
  const [data, setData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [stats, setStats] = useState(null);
  const [dataContext, setDataContext] = useState('');
  const [insights, setInsights] = useState('');
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [sessionId, setSessionId] = useState(null);
  const [backendSessionId, setBackendSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showSessions, setShowSessions] = useState(false);
  const [cachedCharts, setCachedCharts] = useState(null);

  const handleDataLoaded = async (parsedData, name, file) => {
    const columnTypes = detectColumnTypes(parsedData);
    const dataStats = calculateStats(parsedData, columnTypes);
    const context = buildDataContext(parsedData, dataStats);

    setData(parsedData);
    setFileName(name);
    setStats(dataStats);
    setDataContext(context);
    setInsights('');
    setActiveTab('overview');
    setSessionId(null);
    setBackendSessionId(null);
    setCachedCharts(null);

    setInsightsLoading(true);

    try {
      console.log('Uploading to backend...');
      const backendResponse = await uploadFileToBackend(file);
      console.log('Backend session ID:', backendResponse.session_id);
      setBackendSessionId(backendResponse.session_id);

      const aiInsights = await generateInsights(context);
      setInsights(aiInsights);

      const id = await saveSession(name, parsedData, dataStats, aiInsights);
      setSessionId(id);
    } catch (err) {
      console.error(err);
      setInsights('Could not generate insights. Try asking a question below.');
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleDataCleaned = (cleanedData, newStats) => {
    if (newStats) {
      const context = buildDataContext(cleanedData, newStats);
      setData(cleanedData);
      setStats(newStats);
      setDataContext(context);
    } else {
      const columnTypes = detectColumnTypes(cleanedData);
      const dataStats = calculateStats(cleanedData, columnTypes);
      const context = buildDataContext(cleanedData, dataStats);
      setData(cleanedData);
      setStats(dataStats);
      setDataContext(context);
    }
  };

  const handleLoadSessions = async () => {
    const saved = await loadSessions();
    setSessions(saved);
    setShowSessions(true);
  };

  const handleRestoreSession = (session) => {
    const context = buildDataContext(session.data, session.stats);
    setData(session.data);
    setFileName(session.fileName);
    setStats(session.stats);
    setDataContext(context);
    setInsights(session.insights);
    setSessionId(session.id);
    setShowSessions(false);
    setActiveTab('overview');
  };

  const handleDeleteSession = async (id, e) => {
    e.stopPropagation();
    await deleteSession(id);
    const updated = await loadSessions();
    setSessions(updated);
  };

  const handleExportPDF = async () => {
    if (!backendSessionId) {
      alert('Please upload a file first to export a PDF.');
      return;
    }
    try {
      await exportPDFFromBackend(backendSessionId, fileName, stats, insights, []);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF export failed. Make sure the backend is running.');
    }
  };

  const tabs = ['overview', 'clean', 'charts', 'python charts', 'statistics', 'ask'];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
            AI Data Analysis Tool
          </h1>
          <p style={{ color: '#6b7280', marginTop: '6px' }}>
            Upload a dataset to get started
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleLoadSessions}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#6b7280',
              cursor: 'pointer',
            }}
          >
            Past Sessions
          </button>
          {data && (
            <button
              onClick={handleExportPDF}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4f46e5',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#ffffff',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Export PDF
            </button>
          )}
        </div>
      </div>

      {/* Past Sessions */}
      {showSessions && (
        <div style={{
          marginBottom: '24px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontWeight: '600', fontSize: '14px' }}>Past Sessions</span>
            <button
              onClick={() => setShowSessions(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                fontSize: '13px',
              }}
            >
              Close
            </button>
          </div>
          {sessions.length === 0 ? (
            <p style={{ padding: '16px', color: '#9ca3af', fontSize: '14px' }}>
              No saved sessions yet.
            </p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleRestoreSession(session)}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                }}
              >
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>
                    {session.fileName}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                    {new Date(session.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#ef4444',
                    fontSize: '13px',
                  }}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <FileUpload onDataLoaded={handleDataLoaded} />

      {data && (
        <>
          <div style={{
            marginTop: '24px',
            padding: '12px 16px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
          }}>
            <p style={{ margin: 0, color: '#15803d', fontWeight: '500' }}>
              ✓ Loaded <strong>{fileName}</strong> — {data.length} rows detected
            </p>
          </div>

          {/* Insights */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#eef2ff',
            border: '1px solid #c7d2fe',
            borderRadius: '8px',
          }}>
            <h3 style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#4f46e5',
              marginBottom: '8px',
            }}>
              AI Insights
            </h3>
            {insightsLoading ? (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Analyzing your dataset...
              </p>
            ) : (
              <p style={{
                fontSize: '14px',
                color: '#374151',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.7',
              }}>
                {insights}
              </p>
            )}
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '4px',
            marginTop: '32px',
            borderBottom: '1px solid #e5e7eb',
            flexWrap: 'wrap',
          }}>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #4f46e5' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  fontWeight: activeTab === tab ? '600' : '400',
                  color: activeTab === tab ? '#4f46e5' : '#6b7280',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textTransform: 'capitalize',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab === 'ask' ? 'Ask AI' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <>
              <StatsPanel stats={stats} />
              <ColumnSummary stats={stats} />
              <DataTable data={data} />
            </>
          )}

          {activeTab === 'clean' && (
            <CleaningPanel
              data={data}
              backendSessionId={backendSessionId}
              onDataCleaned={handleDataCleaned}
            />
          )}

          {activeTab === 'clean' && (
  <CleaningPanel
    data={data}
    fileName={fileName}
    backendSessionId={backendSessionId}
    onDataCleaned={handleDataCleaned}
  />
)}

          {activeTab === 'python charts' && (
            <MatplotlibCharts
              stats={stats}
              backendSessionId={backendSessionId}
            />
          )}

          {activeTab === 'statistics' && (
            <StatisticsPanel
              stats={stats}
              backendSessionId={backendSessionId}
            />
          )}

          {activeTab === 'ask' && (
            <ChatPanel
              data={data}
              stats={stats}
              sessionId={sessionId}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;