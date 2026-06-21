import { useState, useEffect } from 'react';
import { askGemini, buildDataContext } from '../utils/gemini';
import { saveHistory, loadHistory } from '../utils/db';
import HistoryPanel from './HistoryPanel';

const ChatPanel = ({ data, stats, sessionId }) => {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const dataContext = buildDataContext(data, stats);

  useEffect(() => {
    if (sessionId) {
      loadHistory(sessionId).then(setHistory);
    }
  }, [sessionId]);

  const handleAsk = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const question = input;
    setInput('');
    setLoading(true);

    try {
      const response = await askGemini(question, dataContext);
      const aiMessage = { role: 'ai', content: response };
      setMessages((prev) => [...prev, aiMessage]);

      if (sessionId) {
        await saveHistory(sessionId, question, response);
        const updated = await loadHistory(sessionId);
        setHistory(updated);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div style={{ marginTop: '32px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
          Ask Questions About Your Data
        </h3>
        {history.length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              padding: '6px 14px',
              backgroundColor: 'transparent',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#6b7280',
              cursor: 'pointer',
            }}
          >
            {showHistory ? 'Hide History' : `Show History (${history.length})`}
          </button>
        )}
      </div>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          minHeight: '200px',
          maxHeight: '400px',
          overflowY: 'auto',
          backgroundColor: '#fafafa',
          marginBottom: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {messages.length === 0 && (
          <p
            style={{
              color: '#9ca3af',
              fontSize: '14px',
              textAlign: 'center',
              marginTop: '60px',
            }}
          >
            Ask anything about your dataset
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.role === 'user' ? '#4f46e5' : '#ffffff',
              color: msg.role === 'user' ? '#ffffff' : '#111827',
              padding: '10px 14px',
              borderRadius: '8px',
              maxWidth: '80%',
              fontSize: '14px',
              lineHeight: '1.5',
              border: msg.role === 'ai' ? '1px solid #e5e7eb' : 'none',
              whiteSpace: 'pre-wrap',
            }}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div
            style={{
              alignSelf: 'flex-start',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#6b7280',
            }}
          >
            Thinking...
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your data... (Enter to send)"
          rows={2}
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'none',
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
        <button
          onClick={handleAsk}
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 20px',
            backgroundColor:
              loading || !input.trim() ? '#e5e7eb' : '#4f46e5',
            color: loading || !input.trim() ? '#9ca3af' : '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            fontSize: '14px',
          }}
        >
          Ask
        </button>
      </div>

      {showHistory && <HistoryPanel history={history} />}
    </div>
  );
};

export default ChatPanel;