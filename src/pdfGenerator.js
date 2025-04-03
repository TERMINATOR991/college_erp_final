import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDF = (student) => {
  const doc = new jsPDF();

  // Student Info
  doc.setFontSize(18);
  doc.text(`Result for ${student.name}`, 10, 20);

  // Marks Table (CORRECTED METHOD NAME)
  doc.autoTable({ // ✅ Use autoTable (not autofable)
    startY: 30,
    head: [['IA1', 'IA2', 'IA Avg', 'ESE', 'Total']],
    body: [
      [
        student.ia1,
        student.ia2,
        ((student.ia1 + student.ia2) / 2).toFixed(2),
        student.ese,
        ((student.ia1 + student.ia2) / 2 + student.ese).toFixed(2)
      ]
    ]
  });

  doc.save(`${student.name}_result.pdf`);
};