import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  HeadingLevel, 
  TableOfContents, 
  Header, 
  PageNumber, 
  PageBreak,
  TabStopType,
  TabStopPosition,
  LeaderType
} from 'docx';
import jsPDF from 'jspdf';
import { ABNTDocumentData } from '../types';

// Configure worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type;

  if (fileType === 'application/pdf') {
    return extractTextFromPDF(file);
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractTextFromDOCX(file);
  } else {
    throw new Error('Formato de arquivo não suportado. Use PDF ou DOCX.');
  }
};

const extractTextFromPDF = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n\n';
  }

  return fullText;
};

const extractTextFromDOCX = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

// --- Helper Functions ---

const renderPdfTOC = (doc: jsPDF, headers: { text: string; level: number; page: number }[]) => {
    // Go to the reserved TOC page
    doc.setPage(1); // Assuming page 1 is reserved or we overwrite it
    
    const pageWidth = 21; // A4 width in cm
    const margin = 3;
    const rightMargin = 2;
    const contentWidth = pageWidth - margin - rightMargin;
    let y = 3; // Top margin start

    // Title: SUMÁRIO
    doc.setFont("Times", "bold");
    doc.setFontSize(12);
    doc.text("SUMÁRIO", pageWidth / 2, y, { align: "center" });
    y += 1.5;

    doc.setFont("Times", "normal");
    doc.setFontSize(12);

    headers.forEach(h => {
        // Indentation for subsections
        const indent = (h.level - 1) * 0.75;
        const xText = margin + indent;
        const xPage = pageWidth - rightMargin;

        // Styling: Main sections bold/uppercase, others normal
        let displayText = h.text;
        
        if (h.level === 1) {
             doc.setFont("Times", "bold");
             displayText = displayText.toUpperCase();
        } else {
             doc.setFont("Times", "normal"); // Or italic if preferred
        }

        doc.text(displayText, xText, y);

        // Calculate dotted leader
        const textWidth = doc.getTextWidth(displayText);
        const pageNumStr = h.page.toString();
        const pageNumWidth = doc.getTextWidth(pageNumStr);
        
        const startDot = xText + textWidth + 0.2;
        const endDot = xPage - pageNumWidth - 0.2;

        if (endDot > startDot) {
            doc.setFont("Times", "normal"); // Dots always normal
            
            // Draw manual dots for better control
            let currentX = startDot;
            const dotChar = ".";
            const dotWidth = doc.getTextWidth(dotChar);
            
            while (currentX < endDot) {
                doc.text(dotChar, currentX, y);
                currentX += (dotWidth + 0.1); // Spacing between dots
            }
        }

        // Page Number
        doc.text(pageNumStr, xPage, y, { align: "right" });

        y += 0.8;
    });
};

// --- ABNT Styles for DOCX ---
// Defines specific TOC styles to ensure dots and alignment works in Word
const getABNTDocxStyles = () => ({
    paragraphStyles: [
        {
            id: "Heading1",
            name: "Heading 1",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
                font: "Times New Roman",
                size: 24, // 12pt
                bold: true,
                allCaps: true,
                color: "000000"
            },
            paragraph: {
                spacing: { before: 240, after: 240 },
                keepNext: true,
                keepLines: true,
            }
        },
        {
            id: "Heading2",
            name: "Heading 2",
            basedOn: "Normal",
            next: "Normal",
            quickFormat: true,
            run: {
                font: "Times New Roman",
                size: 24,
                bold: true,
                color: "000000"
            },
            paragraph: {
                spacing: { before: 240, after: 240 },
                keepNext: true,
            }
        },
        // TOC Styles specifically for ABNT (Dots + Right Align)
        {
            id: "TOC1",
            name: "TOC 1",
            basedOn: "Normal",
            next: "Normal",
            run: {
                font: "Times New Roman",
                size: 24,
                bold: true,
                allCaps: true, // Level 1 is Uppercase
                color: "000000"
            },
            paragraph: {
                tabs: [
                    {
                        val: TabStopType.RIGHT,
                        pos: 9300, // Approx right margin for A4
                        leader: LeaderType.DOT,
                    },
                ],
                spacing: { after: 0 },
            },
        },
        {
            id: "TOC2",
            name: "TOC 2",
            basedOn: "Normal",
            next: "Normal",
            run: {
                font: "Times New Roman",
                size: 24,
                color: "000000"
            },
            paragraph: {
                indent: { left: 240 }, // Slight indentation
                tabs: [
                    {
                        val: TabStopType.RIGHT,
                        pos: 9300,
                        leader: LeaderType.DOT,
                    },
                ],
                spacing: { after: 0 },
            },
        },
        {
            id: "TOC3",
            name: "TOC 3",
            basedOn: "Normal",
            next: "Normal",
            run: {
                font: "Times New Roman",
                size: 24,
                color: "000000"
            },
            paragraph: {
                indent: { left: 480 },
                tabs: [
                    {
                        val: TabStopType.RIGHT,
                        pos: 9300,
                        leader: LeaderType.DOT,
                    },
                ],
                spacing: { after: 0 },
            },
        },
    ],
});

// --- Generation Logic (File Mode) ---

export const generateDOCXBlob = async (markdownText: string): Promise<Blob> => {
  const lines = markdownText.split('\n');
  const children: (Paragraph | TableOfContents)[] = [];

  // Table of Contents Section
  children.push(
    new Paragraph({
      text: "SUMÁRIO",
      heading: HeadingLevel.HEADING_5, // Hidden from TOC (Headings 1-3 only)
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      run: {
          font: "Times New Roman",
          size: 24,
          bold: true,
          allCaps: true,
      }
    }),
    new TableOfContents("Sumário", {
      hyperlink: true,
      headingStyleRange: "1-3",
    }),
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  lines.forEach(line => {
    const cleanLine = line.trim();
    if (!cleanLine) {
      children.push(new Paragraph({ spacing: { after: 200 } }));
      return;
    }

    if (cleanLine.startsWith('# ')) {
      // Heading 1
      children.push(new Paragraph({
        text: cleanLine.replace('# ', '').toUpperCase(),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.LEFT,
        spacing: { before: 360, after: 240 },
      }));
    } else if (cleanLine.startsWith('## ')) {
      // Heading 2
      children.push(new Paragraph({
        text: cleanLine.replace('## ', ''),
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 120 },
      }));
    } else if (cleanLine.startsWith('### ')) {
       // Heading 3
       children.push(new Paragraph({
        text: cleanLine.replace('### ', ''),
        heading: HeadingLevel.HEADING_3,
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 120 },
      }));
    } else {
      // Body Text
      children.push(new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        indent: { firstLine: 708 }, // 1.25cm
        spacing: { line: 360, lineRule: "auto" }, // 1.5 spacing
        children: [
          new TextRun({
            text: cleanLine,
            font: "Times New Roman",
            size: 24, // 12pt
          }),
        ],
      }));
    }
  });

  const doc = new Document({
    styles: getABNTDocxStyles(), // Apply strict ABNT Styles
    features: { updateFields: true },
    sections: [
      {
        properties: {
            page: {
                margin: { top: 1701, bottom: 1134, left: 1701, right: 1134 } // 3cm, 2cm, 3cm, 2cm
            }
        },
        headers: {
            default: new Header({
                children: [
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                            new TextRun({
                                children: [PageNumber.CURRENT],
                                font: "Times New Roman",
                                size: 20, // 10pt for page numbers per ABNT common practice
                            })
                        ]
                    })
                ]
            })
        },
        children: children,
      },
    ],
  });

  return await Packer.toBlob(doc);
};

export const generatePDFBlob = async (markdownText: string): Promise<Blob> => {
  const doc = new jsPDF({ unit: 'cm', format: 'a4' });
  const fontName = 'Times';
  const fontSize = 12;
  const lineHeight = 1.5; 
  const margin = { top: 3, left: 3, bottom: 2, right: 2 };
  
  // Reserve Page 1 for TOC
  doc.addPage(); 
  doc.setPage(2); 

  doc.setFont(fontName, 'normal');
  doc.setFontSize(fontSize);

  let y = margin.top;
  const pageWidth = 21;
  const maxLineWidth = pageWidth - margin.left - margin.right;

  const lines = markdownText.split('\n');
  const headers: { text: string; level: number; page: number }[] = [];
  
  const checkPageBreak = (heightToAdd: number) => {
    if (y + heightToAdd > (29.7 - margin.bottom)) {
      doc.addPage();
      y = margin.top;
      return true;
    }
    return false;
  };

  lines.forEach((line) => {
    const cleanLine = line.trim();
    if (!cleanLine) { y += 0.5; return; }
    
    let currentFontSize = fontSize;
    let isBold = false;
    let isHeader = false;
    let headerLevel = 0;
    let textToPrint = line;

    if (cleanLine.startsWith('# ')) {
      currentFontSize = 12; isBold = true; isHeader = true; headerLevel = 1;
      textToPrint = cleanLine.replace('# ', '').toUpperCase();
    } else if (cleanLine.startsWith('## ')) {
      currentFontSize = 12; isBold = true; isHeader = true; headerLevel = 2;
      textToPrint = cleanLine.replace('## ', '');
    } else if (cleanLine.startsWith('### ')) {
      currentFontSize = 12; isBold = true; isHeader = true; headerLevel = 3;
      textToPrint = cleanLine.replace('### ', '');
    }

    if (isHeader) {
        checkPageBreak(1.5); // Ensure header isn't at very bottom
        headers.push({ 
            text: textToPrint, 
            level: headerLevel, 
            page: doc.getNumberOfPages() 
        });
        doc.setFont(fontName, 'bold');
    } else {
        doc.setFont(fontName, 'normal');
    }

    doc.setFontSize(currentFontSize);
    const textLines = doc.splitTextToSize(textToPrint, maxLineWidth);
    
    textLines.forEach((textLine: string, index: number) => {
        checkPageBreak(0.7);
        let xOffset = margin.left;
        if (index === 0 && !isBold) { xOffset += 1.25; } // Paragraph indent
        
        if (!isBold) { 
            doc.text(textLine, xOffset, y, { maxWidth: maxLineWidth, align: 'justify' }); 
        } else { 
            doc.text(textLine, margin.left, y); 
        }
        y += (currentFontSize / 72 * 2.54) * lineHeight; 
    });
    
    y += 0.3; // Paragraph spacing
  });

  // Render TOC on reserved page 1
  renderPdfTOC(doc, headers);

  // Add Page Numbers to all pages starting from page 2 (content)
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont(fontName, 'normal');
    doc.setFontSize(10);
    doc.text(String(i), pageWidth - 2, 2); 
  }

  return doc.output('blob');
};

// --- Generation Logic (Structured Builder Mode) ---

export const generateStructuredDOCX = async (data: ABNTDocumentData): Promise<Blob> => {
  
  // Helper to create body paragraphs
  const createBodyParagraph = (text: string) => {
      const lines = text.split('\n');
      return lines.map(line => {
          if (!line.trim()) return new Paragraph({ spacing: { after: 200 } });
          return new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              indent: { firstLine: 708 }, // 1.25cm
              spacing: { line: 360, lineRule: "auto" }, // 1.5 line spacing
              children: [new TextRun({ text: line.trim(), font: "Times New Roman", size: 24 })]
          });
      });
  };

  // 1. CAPA (Cover)
  const coverChildren = [
    new Paragraph({
      text: data.institution.toUpperCase(),
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_5, // Using 5 to avoid TOC inclusion
      spacing: { before: 0, after: 3000 }, 
      run: { font: "Times New Roman", size: 24, bold: true, allCaps: true }
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 2500 },
      children: [new TextRun({ text: data.author.toUpperCase(), font: "Times New Roman", size: 24, bold: true })]
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: data.title.toUpperCase(), font: "Times New Roman", size: 28, bold: true })]
    }),
  ];

  if (data.subtitle) {
      coverChildren.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: data.subtitle, font: "Times New Roman", size: 24 })]
      }));
  }

  coverChildren.push(
      new Paragraph({ spacing: { before: 3000 } }), 
      new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: data.city.toUpperCase(), font: "Times New Roman", size: 24 })]
      }),
      new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: data.year, font: "Times New Roman", size: 24 })]
      }),
      new Paragraph({ children: [new PageBreak()] })
  );

  // 2. FOLHA DE ROSTO & PRE-TEXTUAL
  const pretextChildren: (Paragraph | TableOfContents)[] = [
      new Paragraph({
          text: data.author.toUpperCase(),
          alignment: AlignmentType.CENTER,
          spacing: { before: 1000, after: 2000 },
          children: [new TextRun({ text: data.author.toUpperCase(), font: "Times New Roman", size: 24, bold: true })]
      }),
      new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 1000 },
          children: [new TextRun({ text: data.title.toUpperCase(), font: "Times New Roman", size: 28, bold: true })]
      }),
  ];

  if (data.preamble) {
      pretextChildren.push(new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          indent: { left: 4535 }, 
          children: [new TextRun({ text: data.preamble, font: "Times New Roman", size: 20 })]
      }));
  }

  pretextChildren.push(
      new Paragraph({ spacing: { before: 2000 } }),
      new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: data.city.toUpperCase(), font: "Times New Roman", size: 24 })]
      }),
      new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: data.year, font: "Times New Roman", size: 24 })]
      }),
      new Paragraph({ children: [new PageBreak()] })
  );

  // 3. RESUMO
  if (data.resumo) {
      pretextChildren.push(
          new Paragraph({
              text: "RESUMO",
              heading: HeadingLevel.HEADING_5, // Not in TOC
              alignment: AlignmentType.CENTER,
              spacing: { after: 240 },
              run: { font: "Times New Roman", size: 24, bold: true }
          }),
          ...createBodyParagraph(data.resumo),
          new Paragraph({ children: [new PageBreak()] })
      );
  }

  // 4. ABSTRACT
  if (data.abstract) {
      pretextChildren.push(
          new Paragraph({
              text: "ABSTRACT",
              heading: HeadingLevel.HEADING_5, // Not in TOC
              alignment: AlignmentType.CENTER,
              spacing: { after: 240 },
              run: { font: "Times New Roman", size: 24, bold: true }
          }),
          ...createBodyParagraph(data.abstract),
          new Paragraph({ children: [new PageBreak()] })
      );
  }

  // 5. SUMÁRIO (Actual TOC)
  pretextChildren.push(
      new Paragraph({
          text: "SUMÁRIO",
          heading: HeadingLevel.HEADING_5,
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          run: { font: "Times New Roman", size: 24, bold: true }
      }),
      new TableOfContents("Sumário", {
          hyperlink: true,
          headingStyleRange: "1-3",
      }),
      new Paragraph({ children: [new PageBreak()] })
  );

  // 6. BODY 
  const bodyChildren: Paragraph[] = [];

  // Introduction
  bodyChildren.push(
      new Paragraph({
          text: "1 INTRODUÇÃO",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 240 }
      }),
      ...createBodyParagraph(data.introduction)
  );

  // Chapters
  let chapterIndex = 2;
  data.development.forEach(chapter => {
      bodyChildren.push(
          new Paragraph({
              text: `${chapterIndex} ${chapter.title.toUpperCase()}`,
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 360, after: 240 }
          }),
          ...createBodyParagraph(chapter.content)
      );
      chapterIndex++;
  });

  // Conclusion
  bodyChildren.push(
      new Paragraph({
          text: `${chapterIndex} CONCLUSÃO`,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 360, after: 240 }
      }),
      ...createBodyParagraph(data.conclusion),
      new Paragraph({ children: [new PageBreak()] })
  );

  // 7. REFERÊNCIAS
  // References are often NOT numbered in TOC, but typically listed.
  // We'll leave it unnumbered but styled as Header 1 so it appears in TOC.
  bodyChildren.push(
      new Paragraph({
          text: "REFERÊNCIAS",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.LEFT, 
          spacing: { before: 360, after: 240 },
          run: { color: "000000" }
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { line: 240, after: 240 }, 
        children: [new TextRun({ text: data.references, font: "Times New Roman", size: 24 })]
      })
  );

  const doc = new Document({
      styles: getABNTDocxStyles(),
      features: { updateFields: true },
      sections: [
          {
              properties: {
                  page: {
                      margin: { top: 1701, bottom: 1134, left: 1701, right: 1134 }
                  }
              },
              children: [...coverChildren, ...pretextChildren]
          },
          {
              properties: {
                  page: {
                      margin: { top: 1701, bottom: 1134, left: 1701, right: 1134 }
                  },
              },
              headers: {
                  default: new Header({
                      children: [
                          new Paragraph({
                              alignment: AlignmentType.RIGHT,
                              children: [
                                  new TextRun({
                                      children: [PageNumber.CURRENT],
                                      font: "Times New Roman",
                                      size: 20,
                                  })
                              ]
                          })
                      ]
                  })
              },
              children: bodyChildren
          }
      ]
  });

  return await Packer.toBlob(doc);
};


export const generateStructuredPDF = async (data: ABNTDocumentData): Promise<Blob> => {
    const doc = new jsPDF({ unit: 'cm', format: 'a4' });
    const fontName = 'Times';
    
    // Config
    const margin = { top: 3, left: 3, bottom: 2, right: 2 };
    const pageWidth = 21;
    const maxLineWidth = pageWidth - margin.left - margin.right;
    
    // Headers collector
    const headers: { text: string; level: number; page: number }[] = [];

    // --- Helper: Centered Text ---
    const centerText = (text: string, y: number, size: number = 12, bold: boolean = false) => {
        doc.setFont(fontName, bold ? 'bold' : 'normal');
        doc.setFontSize(size);
        doc.text(text, pageWidth / 2, y, { align: 'center' });
    };

    // --- Helper: Justified Text ---
    const justifiedText = (text: string, y: number, indentFirst: boolean = true) => {
        doc.setFont(fontName, 'normal');
        doc.setFontSize(12);
        const lines = text.split('\n');
        
        let currentY = y;
        
        lines.forEach(line => {
             const wrapped = doc.splitTextToSize(line, maxLineWidth);
             wrapped.forEach((wLine: string, idx: number) => {
                 if (currentY > 27) { doc.addPage(); currentY = margin.top; }
                 
                 let x = margin.left;
                 if (idx === 0 && indentFirst) x += 1.25;

                 doc.text(wLine, x, currentY, { maxWidth: maxLineWidth, align: 'justify' });
                 currentY += 0.5; // Line height
             });
             currentY += 0.3; // Paragraph spacing
        });
        return currentY;
    };

    // 1. CAPA
    let y = margin.top;
    centerText(data.institution.toUpperCase(), y, 12, true);
    y += 8;
    centerText(data.author.toUpperCase(), y, 12, true);
    y += 4;
    centerText(data.title.toUpperCase(), y, 14, true);
    if(data.subtitle) {
        y += 1;
        centerText(data.subtitle, y, 12);
    }
    
    // Bottom
    centerText(data.city.toUpperCase(), 25, 12);
    centerText(data.year, 26, 12);
    doc.addPage();

    // 2. FOLHA DE ROSTO
    y = margin.top + 2;
    centerText(data.author.toUpperCase(), y, 12, true);
    y += 4;
    centerText(data.title.toUpperCase(), y, 14, true);
    
    if (data.preamble) {
        y += 4;
        doc.setFontSize(10);
        doc.setFont(fontName, 'normal');
        const preambleLines = doc.splitTextToSize(data.preamble, 10); // Width 10cm
        doc.text(preambleLines, 10, y); 
    }

    centerText(data.city.toUpperCase(), 25, 12);
    centerText(data.year, 26, 12);
    doc.addPage();

    // 3. RESUMO
    if (data.resumo) {
        y = margin.top;
        centerText("RESUMO", y, 12, true);
        y += 1.5;
        justifiedText(data.resumo, y, false);
        doc.addPage();
    }
    
    // 4. ABSTRACT
    if (data.abstract) {
        y = margin.top;
        centerText("ABSTRACT", y, 12, true);
        y += 1.5;
        justifiedText(data.abstract, y, false);
        doc.addPage();
    }

    // 5. RESERVE TOC PAGE
    doc.addPage();
    const tocPageNumber = doc.getNumberOfPages();
    
    // 6. CONTENT
    doc.addPage(); // Content starts here
    y = margin.top;
    
    const printHeader = (text: string, level: number = 1) => {
        if (y > 25) { doc.addPage(); y = margin.top; }
        doc.setFont(fontName, 'bold');
        doc.setFontSize(12);
        doc.text(text.toUpperCase(), margin.left, y);
        
        headers.push({ text: text.toUpperCase(), level, page: doc.getNumberOfPages() });
        y += 1;
    };

    printHeader("1 INTRODUÇÃO");
    y = justifiedText(data.introduction, y);
    y += 1;

    let chNum = 2;
    data.development.forEach(chap => {
        printHeader(`${chNum} ${chap.title}`);
        y = justifiedText(chap.content, y);
        y += 1;
        chNum++;
    });

    printHeader(`${chNum} CONCLUSÃO`);
    y = justifiedText(data.conclusion, y);
    
    doc.addPage();
    y = margin.top;
    
    // REFERÊNCIAS
    if (y > 25) { doc.addPage(); y = margin.top; }
    doc.setFont(fontName, 'bold');
    doc.setFontSize(12);
    doc.text("REFERÊNCIAS", margin.left, y);
    
    // Add Referências to TOC but typically unnumbered in strictly automated lists if manual, but here we add it
    headers.push({ text: "REFERÊNCIAS", level: 1, page: doc.getNumberOfPages() });

    y += 0.5;
    doc.setFont(fontName, 'normal');
    doc.setFontSize(12);
    doc.text(data.references, margin.left, y, { maxWidth: maxLineWidth });

    // 7. PRINT TOC
    // Switch to TOC page
    doc.setPage(tocPageNumber);
    renderPdfTOC(doc, headers);

    // Page Numbers (on content pages)
    // ABNT: Count from cover, show from content.
    // We already have pages.
    const totalPages = doc.getNumberOfPages();
    // Assuming content started after TOC page. 
    // Cover(1), Face(2), Resumo(3), Abstract(4), TOC(5), Content(6)
    // Simplified: show numbers on pages >= tocPageNumber + 1
    for (let i = tocPageNumber + 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(String(i), pageWidth - 2, 2);
    }

    return doc.output('blob');
};