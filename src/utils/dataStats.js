export const calculateStats = (data, columnTypes) => {
  if (!data || data.length === 0) return {};

  const columns = Object.keys(data[0]);
  const stats = {
    rowCount: data.length,
    columnCount: columns.length,
    columns: {},
  };

  columns.forEach((col) => {
    const values = data.map((row) => row[col]);
    const missing = values.filter(
      (val) => val === '' || val === null || val === undefined
    ).length;

    const colStats = {
      type: columnTypes[col],
      missing,
      unique: new Set(values).size,
    };

    if (columnTypes[col] === 'numeric') {
      const numbers = values
        .filter((val) => !isNaN(Number(val)) && val !== '')
        .map(Number);

      if (numbers.length > 0) {
        colStats.min = Math.min(...numbers);
        colStats.max = Math.max(...numbers);
        colStats.average = (
          numbers.reduce((a, b) => a + b, 0) / numbers.length
        ).toFixed(2);
        colStats.sum = numbers.reduce((a, b) => a + b, 0).toFixed(2);
      }
    }

    stats.columns[col] = colStats;
  });

  return stats;
};