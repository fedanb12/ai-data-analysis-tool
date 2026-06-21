const BASE_URL = 'https://ai-data-analysis-backend.onrender.com';

export const uploadFileToBackend = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Upload failed');
  return response.json();
};

export const cleanFileOnBackend = async (sessionId) => {
  const response = await fetch(`${BASE_URL}/clean`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });

  if (!response.ok) throw new Error('Cleaning failed');
  return response.json();
};

export const generateChartFromBackend = async (sessionId, chartType, xCol, yCol = null, title = '') => {
  const response = await fetch(`${BASE_URL}/chart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      chart_type: chartType,
      x_col: xCol || null,
      y_col: yCol || null,
      title: title || '',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Backend chart error:', error);
    throw new Error('Chart generation failed');
  }
  return response.json();
};

export const getCorrelation = async (sessionId) => {
  const response = await fetch(`${BASE_URL}/stats/correlation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });

  if (!response.ok) throw new Error('Correlation failed');
  return response.json();
};

export const getOutliers = async (sessionId) => {
  const response = await fetch(`${BASE_URL}/stats/outliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });

  if (!response.ok) throw new Error('Outlier detection failed');
  return response.json();
};

export const runStatTest = async (sessionId, col1, col2) => {
  const response = await fetch(`${BASE_URL}/stats/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, col1, col2 }),
  });

  if (!response.ok) throw new Error('Statistical test failed');
  return response.json();
};

export const exportPDFFromBackend = async (sessionId, fileName, stats, insights, history) => {
  const response = await fetch(`${BASE_URL}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      file_name: fileName,
      stats,
      insights,
      history,
    }),
  });

  if (!response.ok) throw new Error('Report generation failed');

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}-report.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const getSessionsFromBackend = async () => {
  const response = await fetch(`${BASE_URL}/sessions`);
  if (!response.ok) throw new Error('Failed to fetch sessions');
  return response.json();
};