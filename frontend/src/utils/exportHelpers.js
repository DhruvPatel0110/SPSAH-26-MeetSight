// Export helper functions for different file formats
import jsPDF from 'jspdf';

export const exportAsText = (transcript, summary, actionItems) => {
  let content = `AI TRANSCRIPTION EXPORT
========================

`;

  if (transcript) {
    content += `TRANSCRIPT
----------
${transcript.text}

`;
  }

  if (summary) {
    content += `SUMMARY
-------
Key Points:
${summary.keyPoints.map((point, idx) => `${idx + 1}. ${point.title}: ${point.description}`).join('\n')}

Topics: ${summary.topics.join(', ')}
Sentiment: ${summary.sentiment}

`;
  }

  if (actionItems && actionItems.length > 0) {
    content += `ACTION ITEMS
------------
${actionItems.map((item, idx) => `${idx + 1}. [${item.completed ? 'x' : ' '}] ${item.text} (Priority: ${item.priority}${item.dueDate ? `, Due: ${item.dueDate}` : ''})`).join('\n')}

`;
  }

  content += `---
Generated on: ${new Date().toLocaleString()}`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `transcript-${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportAsPDF = (transcript, summary, actionItems) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to sanitize text and add with word wrap
  const addText = (text, fontSize = 12, isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    // Sanitize text to remove problematic characters
    const sanitizedText = text
      .replace(/[^\x20-\x7E\n]/g, '') // Remove non-ASCII characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    const lines = doc.splitTextToSize(sanitizedText, maxWidth);
    
    lines.forEach(line => {
      if (yPosition > pageHeight - margin - 20) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.6;
    });
    
    yPosition += 8; // Add spacing after text block
  };

  // Title Header
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SUMMARY', margin, 22);
  
  yPosition = 50;
  doc.setTextColor(0, 0, 0);

  // Summary Section
  if (summary) {
    addText('Key Points:', 16, true);
    yPosition += 2;
    
    summary.keyPoints.forEach((point, idx) => {
      addText(`${idx + 1}. ${point.title}`, 13, true);
      addText(point.description, 11);
      yPosition += 3;
    });
    
    addText(`Topics: ${summary.topics.join(', ')}`, 11);
    addText(`Sentiment: ${summary.sentiment.charAt(0).toUpperCase() + summary.sentiment.slice(1)}`, 11);
    yPosition += 10;
  }

  // Action Items Section
  if (actionItems && actionItems.length > 0) {
    addText('ACTION ITEMS', 16, true);
    yPosition += 2;
    
    actionItems.forEach((item, idx) => {
      const status = item.completed ? 'Review' : 'Review';
      const priority = item.priority ? item.priority.toUpperCase() : 'MEDIUM';
      const assignee = item.assignee || 'Team';
      const dueDate = item.dueDate || '2026-05-24';
      
      addText(`${idx + 1}. ${status} the transcript for key points`, 11);
      addText(`   Priority: ${priority} | Assignee: ${assignee} | Due: ${dueDate}`, 10);
      yPosition += 3;
    });
  }

  // Transcript Section (if needed)
  if (transcript && transcript.text) {
    if (yPosition > pageHeight - 100) {
      doc.addPage();
      yPosition = margin;
    }
    addText('TRANSCRIPT', 16, true);
    addText(transcript.text, 10);
  }

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, pageHeight - 10);
  }

  // Save the PDF
  doc.save(`transcript-${Date.now()}.pdf`);
};

export const exportAsJSON = (transcript, summary, actionItems) => {
  const data = {
    transcript,
    summary,
    actionItems,
    exportDate: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `transcript-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportAsMarkdown = (transcript, summary, actionItems) => {
  let content = `# MeetIQ Export

`;

  if (transcript) {
    content += `## Transcript

${transcript.text}

`;
  }

  if (summary) {
    content += `## Summary

### Key Points

${summary.keyPoints.map((point, idx) => `${idx + 1}. **${point.title}**: ${point.description}`).join('\n\n')}

**Topics**: ${summary.topics.join(', ')}  
**Sentiment**: ${summary.sentiment}

`;
  }

  if (actionItems && actionItems.length > 0) {
    content += `## Action Items

${actionItems.map((item, idx) => `${idx + 1}. [${item.completed ? 'x' : ' '}] ${item.text}  
   - **Priority**: ${item.priority}${item.assignee ? `  \n   - **Assignee**: ${item.assignee}` : ''}${item.dueDate ? `  \n   - **Due Date**: ${item.dueDate}` : ''}`).join('\n\n')}

`;
  }

  content += `---

*Generated on: ${new Date().toLocaleString()}*`;

  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `transcript-${Date.now()}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
