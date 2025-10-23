import { jsPDF } from "jspdf";
import type { GtmFramework, GtmAssessment, GtmAssessmentResult } from "../../drizzle/schema";

interface PDFReportData {
  framework: GtmFramework;
  assessment: GtmAssessment;
  result: GtmAssessmentResult;
}

export async function generatePDFReport(data: PDFReportData): Promise<Buffer> {
  const { framework, assessment, result } = data;
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Header with GTM Planetary branding
  doc.setFillColor(41, 128, 185); // Blue color
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("GTM PLANETARY", margin, 20);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("AI-Powered GTM Framework Analysis", margin, 30);

  yPos = 50;

  // Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(`${framework.name} Assessment Report`, margin, yPos);
  yPos += 10;

  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const date = new Date(assessment.completedAt || "").toLocaleDateString();
  doc.text(`Completed: ${date}`, margin, yPos);
  yPos += 15;

  // Overall Score Box
  checkPageBreak(40);
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 30, 3, 3, "F");
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Overall Score", margin + 10, yPos + 12);
  
  // Score color based on value
  const score = result.overallScore;
  if (score >= 80) doc.setTextColor(34, 139, 34); // Green
  else if (score >= 60) doc.setTextColor(255, 165, 0); // Orange
  else doc.setTextColor(220, 20, 60); // Red
  
  doc.setFontSize(32);
  doc.text(`${score}/100`, pageWidth - margin - 10, yPos + 20, { align: "right" });
  yPos += 45;

  // Framework Description
  checkPageBreak(30);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Framework Overview", margin, yPos);
  yPos += 7;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const descLines = doc.splitTextToSize(framework.description, pageWidth - 2 * margin);
  doc.text(descLines, margin, yPos);
  yPos += descLines.length * 5 + 10;

  // Category Scores
  checkPageBreak(60);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Category Performance", margin, yPos);
  yPos += 10;

  const categoryScores = result.categoryScores as Record<string, number>;
  for (const [category, categoryScore] of Object.entries(categoryScores)) {
    checkPageBreak(15);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(category, margin + 5, yPos);
    
    // Progress bar
    const barWidth = 100;
    const barX = pageWidth - margin - barWidth - 30;
    doc.setDrawColor(200, 200, 200);
    doc.rect(barX, yPos - 4, barWidth, 6);
    
    // Fill based on score
    if (categoryScore >= 80) doc.setFillColor(34, 139, 34);
    else if (categoryScore >= 60) doc.setFillColor(255, 165, 0);
    else doc.setFillColor(220, 20, 60);
    
    doc.rect(barX, yPos - 4, (barWidth * categoryScore) / 100, 6, "F");
    
    // Score text
    doc.setFont("helvetica", "bold");
    doc.text(`${categoryScore}`, pageWidth - margin - 20, yPos, { align: "right" });
    
    yPos += 12;
  }
  yPos += 5;

  // Strengths
  checkPageBreak(40);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(34, 139, 34);
  doc.text("✓ Strengths", margin, yPos);
  yPos += 8;

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  const strengths = result.strengths as string[];
  for (const strength of strengths) {
    checkPageBreak(10);
    const lines = doc.splitTextToSize(`• ${strength}`, pageWidth - 2 * margin - 10);
    doc.text(lines, margin + 5, yPos);
    yPos += lines.length * 5 + 2;
  }
  yPos += 8;

  // Gaps
  checkPageBreak(40);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 165, 0);
  doc.text("⚠ Areas for Improvement", margin, yPos);
  yPos += 8;

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  
  const gaps = result.gaps as string[];
  for (const gap of gaps) {
    checkPageBreak(10);
    const lines = doc.splitTextToSize(`• ${gap}`, pageWidth - 2 * margin - 10);
    doc.text(lines, margin + 5, yPos);
    yPos += lines.length * 5 + 2;
  }
  yPos += 8;

  // Recommendations
  doc.addPage();
  yPos = margin;
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(41, 128, 185);
  doc.text("Recommendations", margin, yPos);
  yPos += 12;

  const recommendations = result.recommendations as Array<{
    title: string;
    description: string;
    priority: string;
  }>;
  
  for (const rec of recommendations) {
    checkPageBreak(25);
    
    // Priority badge
    doc.setFontSize(8);
    if (rec.priority === "high") doc.setFillColor(220, 20, 60);
    else if (rec.priority === "medium") doc.setFillColor(255, 165, 0);
    else doc.setFillColor(100, 100, 100);
    
    doc.roundedRect(margin, yPos - 3, 25, 5, 1, 1, "F");
    doc.setTextColor(255, 255, 255);
    doc.text(rec.priority.toUpperCase(), margin + 12.5, yPos, { align: "center" });
    
    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(rec.title, margin + 30, yPos);
    yPos += 7;
    
    // Description
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const recLines = doc.splitTextToSize(rec.description, pageWidth - 2 * margin - 5);
    doc.text(recLines, margin + 5, yPos);
    yPos += recLines.length * 4 + 8;
  }

  // Action Plan
  doc.addPage();
  yPos = margin;
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(41, 128, 185);
  doc.text("Action Plan", margin, yPos);
  yPos += 12;

  const actionPlan = result.actionPlan as Array<{
    phase: string;
    actions: string[];
    timeline: string;
  }>;
  
  for (const phase of actionPlan) {
    checkPageBreak(30);
    
    // Phase header
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(margin, yPos - 5, pageWidth - 2 * margin, 10, 2, 2, "F");
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(phase.phase, margin + 5, yPos);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text(phase.timeline, pageWidth - margin - 5, yPos, { align: "right" });
    yPos += 12;
    
    // Actions
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    for (const action of phase.actions) {
      checkPageBreak(8);
      const actionLines = doc.splitTextToSize(`• ${action}`, pageWidth - 2 * margin - 10);
      doc.text(actionLines, margin + 5, yPos);
      yPos += actionLines.length * 4 + 2;
    }
    yPos += 8;
  }

  // Footer with CTA
  doc.addPage();
  yPos = pageHeight / 2 - 40;
  
  doc.setFillColor(41, 128, 185);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 80, 5, 5, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Ready to Implement These Recommendations?", pageWidth / 2, yPos + 20, {
    align: "center",
  });
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(
    "GTM Planetary can help you execute this action plan with our",
    pageWidth / 2,
    yPos + 32,
    { align: "center" }
  );
  doc.text("AI-powered automation solutions for trade businesses.", pageWidth / 2, yPos + 40, {
    align: "center",
  });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Schedule a Consultation: wyatt@gtmplanetary.com", pageWidth / 2, yPos + 55, {
    align: "center",
  });

  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return pdfBuffer;
}

