export const exportCSV = (data, fileName) => {
  if (!data || data.length === 0) return;

  const columns = Object.keys(data[0]);
  const header = columns.join(',');

  const rows = data.map((row) =>
    columns.map((col) => {
      const val = row[col] === null || row[col] === undefined ? '' : row[col];
      const str = String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')
  );

  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName.replace(/\.[^.]+$/, '')}-cleaned.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};