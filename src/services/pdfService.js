import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Parse metadata from HTML content
const parseMetadataFromContent = (htmlContent, proposal) => {
  const metadata = {};
  
  if (!htmlContent) return metadata;
  
  console.log('=== DEBUGGING PDF CONTENT PARSING ===');
  console.log('Full content length:', htmlContent.length);
  console.log('First 1000 chars:', htmlContent.substring(0, 1000));
  console.log('Proposal object:', proposal);
  
  // Try multiple patterns to find "Prepared by"
  const patterns = [
    /Prepared by:\s*([^<\n\r]+)/i,
    /Prepared by\s*:\s*([^<\n\r]+)/i,
    /<[^>]*>Prepared by:\s*([^<\n\r]+)/i,
    /Prepared by:\s*<[^>]*>([^<]+)<\/[^>]*>/i
  ];
  
  for (const pattern of patterns) {
    const match = htmlContent.match(pattern);
    if (match) {
      metadata.preparedBy = match[1].trim()
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
        .replace(/&amp;/g, '&') // Replace HTML entities
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      console.log('Found prepared by with pattern:', pattern, 'Result:', metadata.preparedBy);
      break;
    }
  }
  
  // If still not found, try looking for any text after "Prepared by" in different formats
  if (!metadata.preparedBy) {
    const lines = htmlContent.split(/\n|<br>|<p>|<\/p>/);
    for (const line of lines) {
      if (line.toLowerCase().includes('prepared by:')) {
        const parts = line.split(':');
        if (parts.length > 1) {
          metadata.preparedBy = parts[1].trim()
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
            .replace(/&amp;/g, '&') // Replace HTML entities
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
          console.log('Found prepared by in line:', line, 'Result:', metadata.preparedBy);
          break;
        }
      }
    }
  }
  
  // Look for patterns like "Date: Date"
  const dateMatch = htmlContent.match(/Date:\s*([^<\n\r]+)/i);
  if (dateMatch) {
    metadata.date = dateMatch[1].trim()
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/&amp;/g, '&') // Replace HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    console.log('Found date:', metadata.date);
  }
  
  // Look for patterns like "Prepared for: Client Name"
  const preparedForMatch = htmlContent.match(/Prepared for:\s*([^<\n\r]+)/i);
  if (preparedForMatch) {
    metadata.preparedFor = preparedForMatch[1].trim()
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/&amp;/g, '&') // Replace HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    console.log('Found prepared for:', metadata.preparedFor);
  }
  
  console.log('Final parsed metadata:', metadata);
  console.log('=== END DEBUGGING ===');
  return metadata;
};

// Clean HTML content by removing metadata sections
const cleanHTMLContent = (htmlContent) => {
  if (!htmlContent) return '';
  
  // Remove any paragraphs that contain metadata
  let cleaned = htmlContent
    .replace(/<p[^>]*>.*?Prepared by:.*?<\/p>/gi, '')
    .replace(/<p[^>]*>.*?Date:.*?<\/p>/gi, '')
    .replace(/<p[^>]*>.*?Prepared for:.*?<\/p>/gi, '')
    .replace(/<p[^>]*>.*?Client:.*?<\/p>/gi, '');
  
  // Remove any standalone metadata lines
  cleaned = cleaned
    .replace(/Prepared by:\s*[^\n<]+/gi, '')
    .replace(/Date:\s*[^\n<]+/gi, '')
    .replace(/Prepared for:\s*[^\n<]+/gi, '')
    .replace(/Client:\s*[^\n<]+/gi, '');
  
  // Clean up extra whitespace and empty paragraphs
  cleaned = cleaned
    .replace(/<p[^>]*>\s*<\/p>/gi, '')
    .replace(/\n\s*\n/g, '\n')
    .trim();
  
  return cleaned;
};

// Convert HTML content to PDF
export const generatePDF = async (proposal, htmlContent) => {
  try {
    if (!proposal) {
      throw new Error('Proposal data is required');
    }
    if (!htmlContent) {
      throw new Error('HTML content is required');
    }
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();

    // Add fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Clean HTML content to remove any metadata sections and parse for PDF
    const cleanedContent = cleanHTMLContent(htmlContent);
    const content = parseHTMLContent(cleanedContent);
    let yPosition = height - 50;
    const margin = 50;
    const lineHeight = 20;
    const maxWidth = width - (margin * 2);

    // Add title with proper text wrapping
    const title = proposal.title || 'Untitled Proposal';
    const titleLines = wrapText(title, maxWidth, boldFont, 24);
    for (const line of titleLines) {
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: 24,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 30;
    }
    yPosition -= 10;

    // Add client info if available
    if (proposal.clientName) {
      page.drawText(`Client: ${proposal.clientName}`, {
        x: margin,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0.3, 0.3, 0.3),
      });
      yPosition -= 25;
    }

    // Parse metadata from the actual content
    const metadata = parseMetadataFromContent(htmlContent, proposal);
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // If we couldn't parse from content, try to get from proposal data
    let finalPreparedBy = metadata.preparedBy;
    if (!finalPreparedBy && proposal.companyName) {
      finalPreparedBy = proposal.companyName;
      console.log('Using proposal.companyName:', finalPreparedBy);
    }
    if (!finalPreparedBy && proposal.projectDetails && proposal.projectDetails.companyName) {
      finalPreparedBy = proposal.projectDetails.companyName;
      console.log('Using projectDetails.companyName:', finalPreparedBy);
    }
    
    const metadataLines = [
      `Prepared by: ${finalPreparedBy || 'ProposeAI Development Team'}`,
      `Date: ${metadata.date || currentDate}`,
      `Prepared for: ${metadata.preparedFor || proposal.clientName || 'Client'}`
    ];
    
    console.log('Final metadata lines:', metadataLines);

    for (const line of metadataLines) {
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0.4, 0.4, 0.4),
      });
      yPosition -= 15;
    }
    yPosition -= 20;

    // Add content
    for (const block of content) {
      if (yPosition < 120) {
        // Add new page if needed with more margin
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        page = newPage;
        yPosition = height - 50;
      }

      if (block.type === 'heading') {
        const fontSize = block.level === 1 ? 18 : block.level === 2 ? 16 : 14;
        const headingLines = wrapText(block.text, maxWidth, boldFont, fontSize);
        
        for (const line of headingLines) {
          page.drawText(line, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: boldFont,
            color: rgb(0, 0, 0),
          });
          yPosition -= fontSize + 5;
        }
        yPosition -= 10; // Extra space after heading
      } else if (block.type === 'paragraph') {
        const lines = wrapText(block.text, maxWidth, font, 12);
        for (const line of lines) {
          if (yPosition < 50) {
            // Add new page if running out of space
            const newPage = pdfDoc.addPage([595.28, 841.89]);
            page = newPage;
            yPosition = height - 50;
          }
          
          page.drawText(line, {
            x: margin,
            y: yPosition,
            size: 12,
            font: font,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight;
        }
        yPosition -= 10; // Extra space after paragraph
      } else if (block.type === 'list') {
        for (const item of block.items) {
          const lines = wrapText(`• ${item}`, maxWidth, font, 12);
          for (const line of lines) {
            if (yPosition < 50) {
              // Add new page if running out of space
              const newPage = pdfDoc.addPage([595.28, 841.89]);
              page = newPage;
              yPosition = height - 50;
            }
            
            page.drawText(line, {
              x: margin + (line.startsWith('•') ? 0 : 20),
              y: yPosition,
              size: 12,
              font: font,
              color: rgb(0, 0, 0),
            });
            yPosition -= lineHeight;
          }
        }
        yPosition -= 10;
      } else if (block.type === 'horizontalRule') {
        // Draw a horizontal line
        page.drawLine({
          start: { x: margin, y: yPosition },
          end: { x: width - margin, y: yPosition },
          thickness: 1,
          color: rgb(0.8, 0.8, 0.8),
        });
        yPosition -= 20;
      }
    }

    // Add footer
    const footerY = 50;
    page.drawText('Generated by ProposeAI', {
      x: margin,
      y: footerY,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Parse HTML content from TiptapEditor
const parseHTMLContent = (htmlContent) => {
  const content = [];
  
  if (!htmlContent) {
    return content;
  }

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;

  // Process each child element
  const processElement = (element) => {
    if (!element) return;

    const tagName = element.tagName?.toLowerCase();
    const text = element.textContent?.trim();

    if (!text) return;

    switch (tagName) {
      case 'h1':
        content.push({
          type: 'heading',
          text: text,
          level: 1
        });
        break;
      case 'h2':
        content.push({
          type: 'heading',
          text: text,
          level: 2
        });
        break;
      case 'h3':
        content.push({
          type: 'heading',
          text: text,
          level: 3
        });
        break;
      case 'p':
        content.push({
          type: 'paragraph',
          text: text
        });
        break;
      case 'ul':
        const items = [];
        const listItems = element.querySelectorAll('li');
        listItems.forEach(li => {
          if (li.textContent?.trim()) {
            items.push(li.textContent.trim());
          }
        });
        if (items.length > 0) {
          content.push({
            type: 'list',
            items: items
          });
        }
        break;
      case 'hr':
        content.push({
          type: 'horizontalRule'
        });
        break;
      default:
        // For other elements, treat as paragraph if they have text
        if (text && !element.querySelector('h1, h2, h3, p, ul, hr')) {
          content.push({
            type: 'paragraph',
            text: text
          });
        }
        break;
    }
  };

  // Process all direct children
  Array.from(tempDiv.children).forEach(processElement);

  // If no children were processed, treat the entire content as a paragraph
  if (content.length === 0 && tempDiv.textContent?.trim()) {
    content.push({
      type: 'paragraph',
      text: tempDiv.textContent.trim()
    });
  }

  return content;
};

// Wrap text to fit within specified width
const wrapText = (text, maxWidth, font, fontSize) => {
  if (!text) return [];
  
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const textWidth = font.widthOfTextAtSize(testLine, fontSize);
    
    if (textWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

// Download PDF file
export const downloadPDF = (pdfBlob, filename) => {
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'proposal.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export as HTML file
export const exportHTML = (proposal, htmlContent) => {
  const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${proposal.title || 'Proposal'}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1, h2, h3 {
            color: #333;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        h1 { font-size: 28px; }
        h2 { font-size: 24px; }
        h3 { font-size: 20px; }
        p { margin-bottom: 15px; }
        ul { margin-bottom: 15px; }
        li { margin-bottom: 5px; }
        hr { 
            border: none;
            border-top: 1px solid #ddd;
            margin: 30px 0;
        }
        .header {
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .client-info {
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${proposal.title || 'Untitled Proposal'}</h1>
        ${proposal.clientName ? `<p class="client-info">Client: ${proposal.clientName}</p>` : ''}
    </div>
    <div class="content">
        ${htmlContent}
    </div>
    <hr>
    <p style="text-align: center; color: #999; font-size: 12px;">
        Generated by ProposeAI
    </p>
</body>
</html>`;

  const blob = new Blob([fullHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${proposal.title || 'proposal'}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export as plain text
export const exportText = (proposal, htmlContent) => {
  // Convert HTML to plain text
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  const textContent = tempDiv.textContent || tempDiv.innerText || '';

  const fullText = `
${proposal.title || 'Untitled Proposal'}
${proposal.clientName ? `Client: ${proposal.clientName}` : ''}
${'='.repeat(50)}

${textContent}

${'='.repeat(50)}
Generated by ProposeAI`;

  const blob = new Blob([fullText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${proposal.title || 'proposal'}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export as Markdown
export const exportMarkdown = (proposal, htmlContent) => {
  // Simple HTML to Markdown conversion
  let markdown = htmlContent
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<hr[^>]*>/gi, '---\n\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<ul[^>]*>(.*?)<\/ul>/gi, (match, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n';
    })
    .replace(/<br[^>]*>/gi, '\n')
    .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up multiple newlines
    .trim();

  const fullMarkdown = `# ${proposal.title || 'Untitled Proposal'}
${proposal.clientName ? `**Client:** ${proposal.clientName}` : ''}

---

${markdown}

---

*Generated by ProposeAI*`;

  const blob = new Blob([fullMarkdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${proposal.title || 'proposal'}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
