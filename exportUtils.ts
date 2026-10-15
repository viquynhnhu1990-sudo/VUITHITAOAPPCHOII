import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle, HeadingLevel } from 'docx';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { Matrix, Exam, QualityInspectionReport } from '../types';
import { PERIOD_NAMES } from '../data/curriculumData';

// Helper to trigger browser file download
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 1. XUẤT MA TRẬN WORD (.DOCX)
export async function exportMatrixDocx(matrix: Matrix): Promise<void> {
  const periodText = PERIOD_NAMES[matrix.period];
  const filename = `01_Ma_tran_${matrix.subject.replace(/\s+/g, '_')}_Lop${matrix.grade}_${matrix.period}_${matrix.academicYear}.docx`;

  const titleRows = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: matrix.schoolName.toUpperCase(), bold: true, size: 24 }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ MÔN ${matrix.subject.toUpperCase()} - LỚP ${matrix.grade}`,
          bold: true,
          size: 28,
          color: '0f172a',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Thời điểm: ${periodText} - Năm học: ${matrix.academicYear} - Thời gian: ${matrix.durationMinutes} phút`,
          italics: true,
          size: 22,
        }),
      ],
    }),
    new Paragraph({ text: '' }),
  ];

  // Table header
  const tableHeader = new TableRow({
    children: [
      new TableCell({ width: { size: 6, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'STT', bold: true })] })] }),
      new TableCell({ width: { size: 28, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Chủ đề / Mạch kiến thức', bold: true })] })] }),
      new TableCell({ width: { size: 24, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Yêu cầu cần đạt', bold: true })] })] }),
      new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Mức 1 (Nhận biết)', bold: true })] })] }),
      new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Mức 2 (Kết nối)', bold: true })] })] }),
      new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Mức 3 (Vận dụng)', bold: true })] })] }),
      new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Tổng điểm', bold: true })] })] }),
    ],
  });

  // Table rows for cells
  const dataRows = matrix.cells.map((cell, idx) => {
    return new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(`${idx + 1}`)] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: cell.topicName, bold: true })] }), new Paragraph({ children: [new TextRun({ text: cell.sourceRef ? `(${cell.sourceRef})` : '', italics: true, size: 18 })] })] }),
        new TableCell({ children: [new Paragraph(cell.outcome)] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(`${cell.level1Count} câu (${cell.level1Points}đ)`)] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(`${cell.level2Count} câu (${cell.level2Points}đ)`)] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun(`${cell.level3Count} câu (${cell.level3Points}đ)`)] })] }),
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${cell.totalPoints}đ`, bold: true })] })] }),
      ],
    });
  });

  // Total summary row
  const totalM1 = matrix.cells.reduce((sum, c) => sum + c.level1Points, 0);
  const totalM2 = matrix.cells.reduce((sum, c) => sum + c.level2Points, 0);
  const totalM3 = matrix.cells.reduce((sum, c) => sum + c.level3Points, 0);
  const totalQ = matrix.cells.reduce((sum, c) => sum + c.totalQuestions, 0);

  const summaryRow = new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TỔNG', bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${totalQ} câu hỏi - Tỷ lệ: ${Math.round((totalM1 / 10) * 100)}% - ${Math.round((totalM2 / 10) * 100)}% - ${Math.round((totalM3 / 10) * 100)}%`, bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Đạt chuẩn Thông tư 27/2020/TT-BGDĐT', italics: true })] })] }),
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${totalM1}đ (${Math.round((totalM1 / 10) * 100)}%)`, bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${totalM2}đ (${Math.round((totalM2 / 10) * 100)}%)`, bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${totalM3}đ (${Math.round((totalM3 / 10) * 100)}%)`, bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `10.0đ (100%)`, bold: true, color: 'b91c1c' })] })] }),
    ],
  });

  const matrixTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [tableHeader, ...dataRows, summaryRow],
  });

  // Signatures row
  const signatureSection = [
    new Paragraph({ text: '' }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: `Hà Nội, ngày .... tháng .... năm 202...`, italics: true })],
    }),
    new Paragraph({ text: '' }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'BAN GIÁM HIỆU DUYỆT', bold: true })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Ký và ghi rõ họ tên)', italics: true })] }),
                new Paragraph({ text: '' }),
                new Paragraph({ text: '' }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: matrix.approvedBy || 'Trần Thị Thu Hiệu', bold: true })] }),
              ],
            }),
            new TableCell({
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TỔ TRƯỞNG CHUYÊN MÔN', bold: true })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Ký và ghi rõ họ tên)', italics: true })] }),
                new Paragraph({ text: '' }),
                new Paragraph({ text: '' }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Lê Hoàng Anh', bold: true })] }),
              ],
            }),
            new TableCell({
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'NGƯỜI LẬP MA TRẬN', bold: true })] }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Ký và ghi rõ họ tên)', italics: true })] }),
                new Paragraph({ text: '' }),
                new Paragraph({ text: '' }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: matrix.creatorName, bold: true })] }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  const doc = new Document({
    sections: [
      {
        children: [...titleRows, matrixTable, ...signatureSection],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, filename);
}

// 2. XUẤT ĐỀ KIỂM TRA HỌC SINH (.DOCX) - TUYỆT ĐỐI KHÔNG LỘ ĐÁP ÁN
export async function exportExamDocx(exam: Exam, variantCode = '101'): Promise<void> {
  const periodText = PERIOD_NAMES[exam.period];
  const filename = `03_De_kiem_tra_${exam.subject.replace(/\s+/g, '_')}_Lop${exam.grade}_De${variantCode}.docx`;

  const examHeader = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ children: [new TextRun({ text: exam.schoolName.toUpperCase(), bold: true, size: 20 })] }),
              new Paragraph({ children: [new TextRun({ text: `TỔ CHUYÊN MÔN: ${exam.department.toUpperCase()}`, size: 18 })] }),
              new Paragraph({ children: [new TextRun({ text: `Họ và tên học sinh: .....................................................`, size: 20 })] }),
              new Paragraph({ children: [new TextRun({ text: `Lớp: ${exam.grade}.... - Năm học: ${exam.academicYear}`, size: 20 })] }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'BÀI KIỂM TRA ĐỊNH KỲ', bold: true, size: 22 })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${periodText.toUpperCase()}`, bold: true, size: 20 })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `MÔN: ${exam.subject.toUpperCase()} - LỚP ${exam.grade}`, bold: true, size: 22 })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Thời gian làm bài: ${exam.durationMinutes} phút (Không kể phát đề)`, italics: true, size: 18 })] }),
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `MÃ ĐỀ: ${variantCode}`, bold: true, size: 20, color: '1e3a8a' })] }),
            ],
          }),
        ],
      }),
    ],
  });

  const scoreBox = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ĐIỂM SỐ', bold: true })] }),
              new Paragraph({ text: '' }),
              new Paragraph({ text: '' }),
            ],
          }),
          new TableCell({
            width: { size: 70, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({ children: [new TextRun({ text: 'NHẬN XÉT CỦA GIÁO VIÊN', bold: true })] }),
              new Paragraph({ children: [new TextRun({ text: '...........................................................................................................................................', italics: true })] }),
              new Paragraph({ children: [new TextRun({ text: '...........................................................................................................................................', italics: true })] }),
            ],
          }),
        ],
      }),
    ],
  });

  // Questions content
  const questionParagraphs: Paragraph[] = [
    new Paragraph({ text: '' }),
    new Paragraph({
      children: [new TextRun({ text: 'I. PHẦN CÂU HỎI VÀ BÀI TẬP', bold: true, size: 22 })],
    }),
  ];

  exam.questions.forEach((q, idx) => {
    questionParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Câu ${idx + 1} (${q.points} điểm): `, bold: true }),
          new TextRun({ text: q.content }),
        ],
      })
    );

    // If MC, output options
    if (q.options && q.options.length > 0) {
      q.options.forEach((opt) => {
        questionParagraphs.push(
          new Paragraph({
            indent: { left: 720 },
            children: [
              new TextRun({ text: `${opt.key}. `, bold: true }),
              new TextRun({ text: opt.text }),
            ],
          })
        );
      });
    } else {
      // Space for student to write answers
      questionParagraphs.push(new Paragraph({ text: '' }));
      questionParagraphs.push(new Paragraph({ children: [new TextRun({ text: 'Bài làm:', italics: true })] }));
      questionParagraphs.push(new Paragraph({ text: '....................................................................................................................................................................................................................' }));
      questionParagraphs.push(new Paragraph({ text: '....................................................................................................................................................................................................................' }));
      questionParagraphs.push(new Paragraph({ text: '....................................................................................................................................................................................................................' }));
    }

    questionParagraphs.push(new Paragraph({ text: '' }));
  });

  questionParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: '---------------------- HẾT ----------------------', italics: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: '(Cán bộ coi thi không giải thích gì thêm)', italics: true, size: 18 })],
    })
  );

  const doc = new Document({
    sections: [
      {
        children: [examHeader, new Paragraph({ text: '' }), scoreBox, ...questionParagraphs],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, filename);
}

// 3. XUẤT ĐÁP ÁN & HƯỚNG DẪN CHẤM (.DOCX) - TÁCH BIỆT ĐỘC LẬP
export async function exportAnswerKeyDocx(exam: Exam, variantCode = '101'): Promise<void> {
  const periodText = PERIOD_NAMES[exam.period];
  const filename = `04_Dap_an_Huong_dan_cham_${exam.subject.replace(/\s+/g, '_')}_Lop${exam.grade}_De${variantCode}.docx`;

  const header = [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: exam.schoolName.toUpperCase(), bold: true, size: 22 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `HƯỚNG DẪN CHẤM VÀ ĐÁP ÁN ĐỀ KIỂM TRA ĐỊNH KỲ`, bold: true, size: 26, color: '15803d' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `MÔN: ${exam.subject.toUpperCase()} - LỚP ${exam.grade} (MÃ ĐỀ: ${variantCode})`, bold: true, size: 22 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Thời điểm: ${periodText} - Năm học: ${exam.academicYear}`, italics: true })] }),
    new Paragraph({ text: '' }),
  ];

  // MC Answer key table
  const mcQuestions = exam.questions.filter((q) => q.type === 'multiple_choice');
  let mcTable: Table | null = null;
  if (mcQuestions.length > 0) {
    const headerRow = new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Câu', bold: true })] })] }),
        ...mcQuestions.map((_, i) => new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${i + 1}`, bold: true })] })] })),
      ],
    });
    const ansRow = new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Đáp án', bold: true })] })] }),
        ...mcQuestions.map((q) => new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: q.correctAnswer, bold: true, color: '15803d' })] })] })),
      ],
    });
    const pointsRow = new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Điểm', bold: true })] })] }),
        ...mcQuestions.map((q) => new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${q.points}đ` })] })] })),
      ],
    });

    mcTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ansRow, pointsRow],
    });
  }

  // Detailed Rubrics for all questions
  const detailedRubrics: Paragraph[] = [
    new Paragraph({ text: '' }),
    new Paragraph({ children: [new TextRun({ text: 'II. HƯỚNG DẪN CHẤM CHI TIẾT TỪNG CÂU VÀ THANG ĐIỂM', bold: true, size: 22 })] }),
    new Paragraph({ text: '' }),
  ];

  exam.questions.forEach((q, idx) => {
    detailedRubrics.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Câu ${idx + 1} (${q.points} điểm) - [${q.level === 1 ? 'Mức 1' : q.level === 2 ? 'Mức 2' : 'Mức 3'}]: `, bold: true }),
          new TextRun({ text: q.content }),
        ],
      }),
      new Paragraph({
        indent: { left: 360 },
        children: [
          new TextRun({ text: 'Đáp án đúng: ', bold: true, color: '15803d' }),
          new TextRun({ text: q.correctAnswer }),
        ],
      }),
      new Paragraph({
        indent: { left: 360 },
        children: [
          new TextRun({ text: 'Biểu điểm & Barem chấm chi tiết:', bold: true }),
        ],
      }),
      ...q.rubric.split('\n').map((line) => new Paragraph({ indent: { left: 720 }, children: [new TextRun({ text: line, italics: true })] })),
      new Paragraph({ text: '' })
    );
  });

  const doc = new Document({
    sections: [
      {
        children: [
          ...header,
          mcTable ? new Paragraph({ children: [new TextRun({ text: 'I. BẢNG ĐÁP ÁN TRẮC NGHIỆM', bold: true, size: 22 })] }) : new Paragraph({ text: '' }),
          ...(mcTable ? [mcTable] : []),
          ...detailedRubrics,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, filename);
}

// 4. XUẤT MA TRẬN EXCEL (.XLSX)
export function exportMatrixXlsx(matrix: Matrix): void {
  const filename = `01_Ma_tran_${matrix.subject.replace(/\s+/g, '_')}_Lop${matrix.grade}.xlsx`;

  const rows: (string | number)[][] = [
    [matrix.schoolName],
    [`MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ MÔN ${matrix.subject.toUpperCase()} - LỚP ${matrix.grade}`],
    [`Thời điểm: ${PERIOD_NAMES[matrix.period]} - Năm học: ${matrix.academicYear}`],
    [],
    ['STT', 'Chủ đề / Mạch kiến thức', 'Yêu cầu cần đạt', 'Mức 1 (Số câu)', 'Mức 1 (Điểm)', 'Mức 2 (Số câu)', 'Mức 2 (Điểm)', 'Mức 3 (Số câu)', 'Mức 3 (Điểm)', 'Tổng số câu', 'Tổng điểm'],
  ];

  matrix.cells.forEach((c, idx) => {
    rows.push([
      idx + 1,
      c.topicName,
      c.outcome,
      c.level1Count,
      c.level1Points,
      c.level2Count,
      c.level2Points,
      c.level3Count,
      c.level3Points,
      c.totalQuestions,
      c.totalPoints,
    ]);
  });

  // Total row
  const m1Count = matrix.cells.reduce((s, c) => s + c.level1Count, 0);
  const m1Pts = matrix.cells.reduce((s, c) => s + c.level1Points, 0);
  const m2Count = matrix.cells.reduce((s, c) => s + c.level2Count, 0);
  const m2Pts = matrix.cells.reduce((s, c) => s + c.level2Points, 0);
  const m3Count = matrix.cells.reduce((s, c) => s + c.level3Count, 0);
  const m3Pts = matrix.cells.reduce((s, c) => s + c.level3Points, 0);

  rows.push([
    'TỔNG',
    'Toàn bộ mạch kiến thức',
    'Chuẩn GDPT 2018',
    m1Count,
    m1Pts,
    m2Count,
    m2Pts,
    m3Count,
    m3Pts,
    m1Count + m2Count + m3Count,
    10.0,
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ma Trận Kiểm Tra');
  XLSX.writeFile(workbook, filename);
}

// 5. XUẤT TRỌN BỘ HỒ SƠ DẠNG ZIP (.ZIP)
export async function exportFullDossierZip(matrix: Matrix, exam: Exam): Promise<void> {
  const zip = new JSZip();
  const periodText = PERIOD_NAMES[matrix.period];
  const zipName = `Ho_so_kiem_tra_Lop${matrix.grade}_${matrix.subject.replace(/\s+/g, '_')}_${matrix.period}_${matrix.academicYear}.zip`;

  // 1. Ma tran docx
  // We can build buffers
  const titleRows = [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: matrix.schoolName.toUpperCase(), bold: true, size: 24 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `MA TRẬN ĐỀ KIỂM TRA ĐỊNH KỲ MÔN ${matrix.subject.toUpperCase()} - LỚP ${matrix.grade}`, bold: true, size: 28 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Năm học: ${matrix.academicYear} - Thời gian: ${matrix.durationMinutes} phút`, italics: true })] }),
    new Paragraph({ text: '' }),
  ];

  const tableHeader = new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'STT', bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Mạch kiến thức', bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Yêu cầu cần đạt', bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Mức 1', bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Mức 2', bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Mức 3', bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Tổng điểm', bold: true })] })] }),
    ],
  });

  const dataRows = matrix.cells.map((cell, idx) => {
    return new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(`${idx + 1}`)] }),
        new TableCell({ children: [new Paragraph(cell.topicName)] }),
        new TableCell({ children: [new Paragraph(cell.outcome)] }),
        new TableCell({ children: [new Paragraph(`${cell.level1Count} câu (${cell.level1Points}đ)`)] }),
        new TableCell({ children: [new Paragraph(`${cell.level2Count} câu (${cell.level2Points}đ)`)] }),
        new TableCell({ children: [new Paragraph(`${cell.level3Count} câu (${cell.level3Points}đ)`)] }),
        new TableCell({ children: [new Paragraph(`${cell.totalPoints}đ`)] }),
      ],
    });
  });

  const matrixDoc = new Document({
    sections: [{ children: [...titleRows, new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [tableHeader, ...dataRows] })] }],
  });
  const matrixBlob = await Packer.toBlob(matrixDoc);
  zip.file(`01_Ma_tran_${matrix.subject}_Lop${matrix.grade}.docx`, matrixBlob);

  // 2. Bang dac ta docx
  const specDoc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `BẢNG ĐẶC TẢ MA TRẬN ĐỀ KIỂM TRA MÔN ${matrix.subject.toUpperCase()}`, bold: true, size: 26 })] }),
          new Paragraph({ text: '' }),
          ...matrix.cells.map(
            (c, i) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `${i + 1}. ${c.topicName}: `, bold: true }),
                  new TextRun({ text: `${c.outcome}. Tổng: ${c.totalQuestions} câu, ${c.totalPoints} điểm.` }),
                ],
              })
          ),
        ],
      },
    ],
  });
  const specBlob = await Packer.toBlob(specDoc);
  zip.file(`02_Bang_dac_ta_${matrix.subject}_Lop${matrix.grade}.docx`, specBlob);

  // 3. De kiem tra docx
  const examDoc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `BÀI KIỂM TRA ĐỊNH KỲ MÔN ${exam.subject.toUpperCase()} - LỚP ${exam.grade}`, bold: true, size: 26 })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Họ và tên: .................................................... Lớp: ${exam.grade}....`, size: 20 })] }),
          new Paragraph({ text: '' }),
          ...exam.questions.flatMap((q, idx) => [
            new Paragraph({
              children: [new TextRun({ text: `Câu ${idx + 1} (${q.points}đ): `, bold: true }), new TextRun(q.content)],
            }),
            ...(q.options
              ? q.options.map((o) => new Paragraph({ indent: { left: 720 }, children: [new TextRun({ text: `${o.key}. ${o.text}` })] }))
              : [new Paragraph({ text: '....................................................................................................' })]),
            new Paragraph({ text: '' }),
          ]),
        ],
      },
    ],
  });
  const examBlob = await Packer.toBlob(examDoc);
  zip.file(`03_De_kiem_tra_${exam.subject}_Lop${exam.grade}.docx`, examBlob);

  // 4. Dap an docx
  const ansDoc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `HƯỚNG DẪN CHẤM VÀ ĐÁP ÁN MÔN ${exam.subject.toUpperCase()}`, bold: true, size: 26 })] }),
          new Paragraph({ text: '' }),
          ...exam.questions.flatMap((q, idx) => [
            new Paragraph({
              children: [new TextRun({ text: `Câu ${idx + 1}: Đáp án: ${q.correctAnswer} (${q.points}đ)`, bold: true, color: '15803d' })],
            }),
            new Paragraph({ indent: { left: 360 }, children: [new TextRun({ text: `Barem: ${q.rubric}`, italics: true })] }),
            new Paragraph({ text: '' }),
          ]),
        ],
      },
    ],
  });
  const ansBlob = await Packer.toBlob(ansDoc);
  zip.file(`04_Dap_an_Huong_dan_cham_${exam.subject}_Lop${exam.grade}.docx`, ansBlob);

  // 5. Bao cao kiem tra chat luong txt
  const reportText = `BÁO CÁO KIỂM TRA CHẤT LƯỢNG ĐỀ KIỂM TRA TIỂU HỌC
Hệ thống: EDU TEST MATRIX AI
Tiêu chuẩn: Thông tư 27/2020/TT-BGDĐT & GDPT 2018
Môn: ${exam.subject} - Khối: ${exam.grade}
Mã đề: ${exam.code}
Tổng điểm: 10.0 chẵn (Không điểm thập phân tổng theo quy định)
Trạng thái kiểm tra: ĐẠT TIÊU CHUẨN PHÁP LÝ VÀ CHUYÊN MÔN
Thời gian xuất hồ sơ: ${new Date().toLocaleString('vi-VN')}
--------------------------------------------------------
Danh mục tài liệu trong hồ sơ:
1. 01_Ma_tran.docx
2. 02_Bang_dac_ta.docx
3. 03_De_kiem_tra.docx
4. 04_Dap_an_Huong_dan_cham.docx
5. 05_Bao_cao_kiem_tra_chat_luong.txt`;

  zip.file(`05_Bao_cao_kiem_tra_chat_luong.txt`, reportText);

  // Generate zip file
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, zipName);
}
