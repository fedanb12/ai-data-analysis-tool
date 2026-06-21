import { useState } from 'react';
import { parseFile } from '../utils/parseFile';

const FileUpload = ({ onDataLoaded }) => {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFile = async (file) => {
    setError('');
    setLoading(true);
    setFileName(file.name);
    setFileSize(formatSize(file.size));

    try {
      const data = await parseFile(file);
onDataLoaded(data, file.name, file);
    } catch (err) {
      setError(err.message || 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${dragging ? '#4f46e5' : '#ccc'}`,
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        backgroundColor: dragging ? '#eef2ff' : '#fafafa',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <input
        type="file"
        accept=".csv,.xlsx,.xls,.json"
        onChange={handleChange}
        style={{ display: 'none' }}
        id="file-input"
      />
      <label htmlFor="file-input" style={{ cursor: 'pointer' }}>
        <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
          {loading ? 'Parsing file...' : 'Drag and drop or click to upload'}
        </p>
        <p style={{ fontSize: '14px', color: '#888' }}>
          Supports CSV, Excel, and JSON
        </p>
      </label>

      {fileName && !error && (
        <div style={{ marginTop: '16px', color: '#4f46e5', fontWeight: '500' }}>
          ✓ {fileName} ({fileSize})
        </div>
      )}

      {error && (
        <div style={{ marginTop: '16px', color: '#ef4444' }}>
          ✗ {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;