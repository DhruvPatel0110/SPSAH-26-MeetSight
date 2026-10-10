// Export helper functions for different file formats
import { jsPDF } from 'jspdf';

export const exportAsText = (transcript, summary, actionItems) => {
  let content = `AI TRANSCRIPTION EXPORT
========================

`;

  if (transcript) {
    const textContent = typeof transcript === 'string' ? transcript : (transcript.text || '');
    content += `TRANSCRIPT
----------
${textContent}

`;
  }

  if (summary) {
    const points = summary.keyPoints || summary.key_points || [];
    const topics = Array.isArray(summary.topics) ? summary.topics.join(', ') : (summary.topics || 'N/A');
    const sentiment = summary.sentiment || 'N/A';
    const overview = summary.overview ? `Overview:\n${summary.overview}\n\n` : '';

    content += `SUMMARY
-------
${overview}Key Points:
${points.map((point, idx) => {
  if (typeof point === 'string') return `${idx + 1}. ${point}`;
  return `${idx + 1}. ${point.title || 'Key Point'}: ${point.description || ''}`;
}).join('\n')}

Topics: ${topics}
Sentiment: ${sentiment}

`;
  }

  if (actionItems && actionItems.length > 0) {
    content += `ACTION ITEMS
------------
${actionItems.map((item, idx) => {
  const task = item.task || item.text || item.title || 'Action item';
  const priority = item.priority || 'medium';
  const deadline = item.deadline || item.dueDate || item.due_date || '';
  const assignee = item.assignee ? ` [Assignee: ${item.assignee}]` : '';
  const isDone = Boolean(item.completed || item.status === 'completed' || item.status === 'done');
  return `${idx + 1}. [${isDone ? 'x' : ' '}] ${task} (Priority: ${priority}${deadline ? `, Due: ${deadline}` : ''})${assignee}`;
}).join('\n')}

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
    const sanitizedText = String(text || '')
      .replace(/[^\x20-\x7E\n]/g, '') // Remove non-ASCII characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    if (!sanitizedText) return;

    const lines = doc.splitTextToSize(sanitizedText, maxWidth);
    
    lines.forEach(line => {
      if (yPosition > pageHeight - margin - 20) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.6;
    });
    
    yPosition += 6; // Add spacing after text block
  };

  // Title Header
  doc.setFillColor(10, 10, 10);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MEETSIGHT SUMMARY', margin, 22);
  
  yPosition = 50;
  doc.setTextColor(0, 0, 0);

  // Summary Section
  if (summary) {
    addText('EXECUTIVE SUMMARY', 16, true);
    yPosition += 2;

    if (summary.overview) {
      addText(summary.overview, 11);
      yPosition += 2;
    }

    const points = summary.keyPoints || summary.key_points || [];
    if (points.length > 0) {
      addText('Key Points:', 13, true);
      points.forEach((point, idx) => {
        if (typeof point === 'string') {
          addText(`${idx + 1}. ${point}`, 11);
        } else {
          addText(`${idx + 1}. ${point.title || 'Discussion Point'}`, 12, true);
          if (point.description) {
            addText(`   ${point.description}`, 11);
          }
        }
        yPosition += 2;
      });
    }
    
    const topics = Array.isArray(summary.topics) ? summary.topics.join(', ') : (summary.topics || 'General');
    const sentiment = summary.sentiment || 'Constructive';
    addText(`Topics: ${topics}`, 10);
    addText(`Sentiment: ${sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}`, 10);
    yPosition += 8;
  }

  // Action Items Section
  if (actionItems && actionItems.length > 0) {
    addText('ACTION ITEMS', 16, true);
    yPosition += 2;
    
    actionItems.forEach((item, idx) => {
      const isDone = Boolean(item.completed || item.status === 'completed' || item.status === 'done');
      const status = isDone ? '[DONE]' : '[PENDING]';
      const task = item.task || item.text || item.title || 'Action item';
      const priority = item.priority ? item.priority.toUpperCase() : 'MEDIUM';
      const assignee = item.assignee || 'Team';
      const dueDate = item.deadline || item.dueDate || item.due_date || 'Next sync';
      
      addText(`${idx + 1}. ${status} ${task}`, 11, true);
      addText(`   Priority: ${priority} | Assignee: ${assignee} | Due: ${dueDate}`, 10);
      yPosition += 2;
    });
    yPosition += 8;
  }

  // Transcript Section (if needed)
  if (transcript) {
    const textContent = typeof transcript === 'string' ? transcript : (transcript.text || '');
    if (textContent) {
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = margin;
      }
      addText('TRANSCRIPT', 16, true);
      addText(textContent, 9);
    }
  }

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated by MeetSight AI - ${new Date().toLocaleString()}`, margin, pageHeight - 10);
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
  let content = `# MeetSight Meeting Report

`;

  if (summary) {
    const points = summary.keyPoints || summary.key_points || [];
    const topics = Array.isArray(summary.topics) ? summary.topics.join(', ') : (summary.topics || 'N/A');
    const sentiment = summary.sentiment || 'Constructive';

    content += `## Executive Summary

`;
    if (summary.overview) {
      content += `${summary.overview}

`;
    }

    if (points.length > 0) {
      content += `### Key Discussion Points

${points.map((point, idx) => {
  if (typeof point === 'string') return `${idx + 1}. ${point}`;
  return `${idx + 1}. **${point.title || 'Discussion Point'}**: ${point.description || ''}`;
}).join('\n\n')}

`;
    }

    content += `**Topics**: ${topics}  
**Sentiment**: ${sentiment}

`;
  }

  if (actionItems && actionItems.length > 0) {
    content += `## Action Items

${actionItems.map((item, idx) => {
  const isDone = Boolean(item.completed || item.status === 'completed' || item.status === 'done');
  const task = item.task || item.text || item.title || 'Action item';
  const priority = item.priority || 'medium';
  const assignee = item.assignee ? `  \n   - **Assignee**: ${item.assignee}` : '';
  const dueDate = (item.deadline || item.dueDate || item.due_date) ? `  \n   - **Due Date**: ${item.deadline || item.dueDate || item.due_date}` : '';
  return `${idx + 1}. [${isDone ? 'x' : ' '}] **${task}**  
   - **Priority**: ${priority}${assignee}${dueDate}`;
}).join('\n\n')}

`;
  }

  if (transcript) {
    const textContent = typeof transcript === 'string' ? transcript : (transcript.text || '');
    if (textContent) {
      content += `## Transcript

${textContent}

`;
    }
  }

  content += `---
*Generated by MeetSight AI on: ${new Date().toLocaleString()}*`;

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
