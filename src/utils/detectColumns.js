export const detectColumnTypes = (data) => {
  if (!data || data.length === 0) return {};

  const columns = Object.keys(data[0]);
  const columnTypes = {};

  columns.forEach((col) => {
    const values = data
      .map((row) => row[col])
      .filter((val) => val !== '' && val !== null && val !== undefined);

    if (values.length === 0) {
      columnTypes[col] = 'empty';
      return;
    }

    // Check if date
    const dateCount = values.filter((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && isNaN(Number(val));
    }).length;

    if (dateCount / values.length > 0.8) {
      columnTypes[col] = 'date';
      return;
    }

    // Check if numeric
    const numericCount = values.filter(
      (val) => !isNaN(Number(val)) && val !== ''
    ).length;

    if (numericCount / values.length > 0.8) {
      columnTypes[col] = 'numeric';
      return;
    }

    // Default to categorical
    columnTypes[col] = 'categorical';
  });

  return columnTypes;
};