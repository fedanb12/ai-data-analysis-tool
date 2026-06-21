import jsPDF from 'jspdf';

export const exportPDF = (fileName, stats, insights, history) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  const addLine = (text, size = 11, bold = false, color = [17, 24, 39]) => {
    doc.setFontSize(size);
    doc.setTextColor(...color);
    if (bold) doc.setFont('helvetica', 'bold');
    else doc.setFont('helvetica', 'normal');

    const lines = doc.splitTextToSize(text, pageWidth - 40);
    lines.forEach((line) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 20, y);
      y += size * 0.6;
    });
    y += 2;
  };

  const addDivider = () => {
    doc.setDrawColor(229, 231, 235);
    doc.line(20, y, pageWidth - 20, y);
    y += 8;
  };

  // Title
  addLine('AI Data Analysis Report', 20, true, [79, 70, 229]);
  addLine(`File: ${fileName}`, 11, false, [107, 114, 128]);
  addLine(`Generated: ${new Date().toLocaleString()}`, 11, false, [107, 114, 128]);
  y += 4;
  addDivider();

  // Dataset Overview
  addLine('Dataset Overview', 14, true);
  y += 2;
  addLine(`Total Rows: ${stats.rowCount}`);
  addLine(`Total Columns: ${stats.columnCount}`);
  addLine(
    `Total Missing Values: ${Object.values(stats.columns).reduce(
      (acc, col) => acc + col.missing, 0
    )}`
  );
  addLine(
    `Numeric Columns: ${Object.values(stats.columns).filter(
      (col) => col.type === 'numeric'
    ).length}`
  );
  addLine(
    `Categorical Columns: ${Object.values(stats.columns).filter(
      (col) => col.type === 'categorical'
    ).length}`
  );
  y += 4;
  addDivider();

  // Column Summary
  addLine('Column Summary', 14, true);
  y += 2;
  Object.entries(stats.columns).forEach(([colName, colStats]) => {
    let colText = `${colName} — ${colStats.type}, ${colStats.unique} unique, ${colStats.missing} missing`;
    if (colStats.type === 'numeric') {
      colText += ` | min: ${colStats.min}, max: ${colStats.max}, avg: ${colStats.average}`;
    }
    addLine(colText);
  });
  y += 4;
  addDivider();

  // AI Insights
  if (insights) {
    addLine('AI Insights', 14, true);
    y += 2;
    addLine(insights);
    y += 4;
    addDivider();
  }

  // Analysis History
  if (history && history.length > 0) {
    addLine('Analysis History', 14, true);
    y += 2;
    history.forEach((item, i) => {
      addLine(`Q${i + 1}: ${item.question}`, 11, true);
      addLine(item.answer, 11, false, [55, 65, 81]);
      y += 4;
    });
  }

  doc.save(`${fileName}-analysis-report.pdf`);
};