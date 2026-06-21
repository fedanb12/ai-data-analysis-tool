const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const callGroq = async (prompt) => {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export const buildDataContext = (data, stats) => {
  if (!stats || !stats.columns) return '';

  const columns = Object.entries(stats.columns)
    .map(([name, col]) => {
      let summary = `${name} (${col.type}, ${col.unique} unique, ${col.missing} missing)`;
      if (col.type === 'numeric') {
        summary += ` min:${col.min} max:${col.max} avg:${col.average}`;
      }
      return summary;
    })
    .join('\n');

  const sample = data.slice(0, 20);

  return `
You are a data analyst assistant. Here is the dataset you are working with:

DATASET OVERVIEW:
- Total rows: ${stats.rowCount}
- Total columns: ${stats.columnCount}

COLUMNS:
${columns}

SAMPLE DATA (first 20 rows):
${JSON.stringify(sample, null, 2)}

Use this context to answer questions about the dataset accurately and concisely.
`;
};

export const askGemini = async (question, dataContext) => {
  const prompt = `${dataContext}\n\nUser question: ${question}`;
  return await callGroq(prompt);
};

export const generateInsights = async (dataContext) => {
  const prompt = `
${dataContext}

Based on this dataset, generate 5 key insights. For each insight:
- Keep it concise and specific
- Reference actual column names and values
- Focus on patterns, outliers, or interesting relationships

Format your response as a numbered list.
`;
  return await callGroq(prompt);
};

export const suggestCharts = async (dataContext) => {
  const prompt = `
${dataContext}

Suggest 3 charts that would best visualize this dataset.
Respond ONLY with a JSON array, no markdown, no backticks, no explanation. Example format:
[
  {
    "type": "bar",
    "title": "Chart title",
    "xKey": "column_name",
    "yKey": "column_name",
    "reasoning": "why this chart is useful"
  }
]

Chart types available: bar, line, scatter, pie.
Only use column names that exist in the dataset.
`;
  const text = await callGroq(prompt);
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};