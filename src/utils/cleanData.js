export const cleanData = (data) => {
  const report = {
    duplicatesRemoved: 0,
    missingFilled: 0,
    whitespaceFixed: 0,
    totalRows: data.length,
  };

  // Remove duplicates
  const seen = new Set();
  let deduped = data.filter((row) => {
    const key = JSON.stringify(row);
    if (seen.has(key)) {
      report.duplicatesRemoved++;
      return false;
    }
    seen.add(key);
    return true;
  });

  // Detect column types for smart filling
  const columns = Object.keys(deduped[0] || {});
  const columnStats = {};

  columns.forEach((col) => {
    const values = deduped
      .map((row) => row[col])
      .filter((v) => v !== '' && v !== null && v !== undefined);

    const numeric = values.filter((v) => !isNaN(Number(v)));

    if (numeric.length / values.length > 0.8) {
      const nums = numeric.map(Number);
      columnStats[col] = {
        type: 'numeric',
        fill: (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2),
      };
    } else {
      const freq = {};
      values.forEach((v) => {
        freq[v] = (freq[v] || 0) + 1;
      });
      const mode = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
      columnStats[col] = {
        type: 'categorical',
        fill: mode ? mode[0] : 'unknown',
      };
    }
  });

  // Fill missing values and fix whitespace
  const cleaned = deduped.map((row) => {
    const newRow = { ...row };
    columns.forEach((col) => {
      // Fix whitespace
      if (typeof newRow[col] === 'string') {
        const trimmed = newRow[col].trim();
        if (trimmed !== newRow[col]) {
          report.whitespaceFixed++;
        }
        newRow[col] = trimmed;
      }

      // Fill missing
      if (
        newRow[col] === '' ||
        newRow[col] === null ||
        newRow[col] === undefined
      ) {
        newRow[col] = columnStats[col]?.fill ?? 'unknown';
        report.missingFilled++;
      }
    });
    return newRow;
  });

  return { cleaned, report };
};