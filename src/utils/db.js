import Dexie from 'dexie';

const db = new Dexie('AIDataAnalysisTool');

db.version(1).stores({
  sessions: '++id, fileName, uploadedAt',
  history: '++id, sessionId, question, answer, createdAt',
});

export const saveSession = async (fileName, data, stats, insights) => {
  try {
    const dataSize = JSON.stringify(data).length;
    if (dataSize > 4 * 1024 * 1024) {
      console.warn('Dataset too large to save — skipping persistence');
      return null;
    }
    const id = await db.sessions.add({
      fileName,
      data,
      stats,
      insights,
      uploadedAt: new Date().toISOString(),
    });
    return id;
  } catch (err) {
    console.error('Failed to save session:', err);
    return null;
  }
};

export const loadSessions = async () => {
  try {
    return await db.sessions.orderBy('uploadedAt').reverse().toArray();
  } catch (err) {
    console.error('Failed to load sessions:', err);
    return [];
  }
};

export const deleteSession = async (id) => {
  try {
    await db.sessions.delete(id);
    await db.history.where('sessionId').equals(id).delete();
  } catch (err) {
    console.error('Failed to delete session:', err);
  }
};

export const saveHistory = async (sessionId, question, answer) => {
  try {
    await db.history.add({
      sessionId,
      question,
      answer,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to save history:', err);
  }
};

export const loadHistory = async (sessionId) => {
  try {
    return await db.history
      .where('sessionId')
      .equals(sessionId)
      .sortBy('createdAt');
  } catch (err) {
    console.error('Failed to load history:', err);
    return [];
  }
};

export default db;