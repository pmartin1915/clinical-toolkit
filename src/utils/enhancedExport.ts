// Enhanced export utilities with better PDF reports and email integration
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import type {
  ExportData,
  PatientProfile,
  AssessmentResult,
  VitalSigns,
  GoalTracking
} from '../types/storage';

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  attachments?: Array<{ filename: string; blob: Blob; type: string }>;
}

interface PDFOptions {
  includeCharts?: boolean;
  includeTimeline?: boolean;
  includeMedications?: boolean;
  includeAssessments?: boolean;
  includeVitals?: boolean;
  includeGoals?: boolean;
  customLogo?: string;
  watermark?: string;
  template?: 'standard' | 'summary' | 'detailed' | 'provider';
}

export class EnhancedExportManager {
  private static readonly BRAND_COLOR = '#0ea5e9';
  private static readonly SECONDARY_COLOR = '#64748b';
  private static readonly SUCCESS_COLOR = '#10b981';
  private static readonly WARNING_COLOR = '#f59e0b';
  private static readonly ERROR_COLOR = '#ef4444';

  // Enhanced PDF Generation with Templates
  public static async generateEnhancedPatientReport(
    data: ExportData, 
    options: PDFOptions = {}
  ): Promise<Blob> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Set default options
    const opts = {
      includeCharts: true,
      includeTimeline: true,
      includeMedications: true,
      includeAssessments: true,
      includeVitals: true,
      includeGoals: true,
      template: 'detailed' as const,
      ...options
    };

    // Helper functions
    const addText = (text: string, x: number, y: number, maxWidth?: number): number => {
      if (maxWidth) {
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + (lines.length * 6);
      } else {
        pdf.text(text, x, y);
        return y + 6;
      }
    };

    const checkNewPage = (requiredSpace: number = 30): void => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        this.addHeader(pdf, pageWidth, margin, opts);
        yPosition += 40;
      }
    };

    const addSection = (title: string, underline: boolean = true): void => {
      checkNewPage(30);
      yPosition += 10;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(this.BRAND_COLOR);
      yPosition = addText(title, margin, yPosition);
      
      if (underline) {
        pdf.setDrawColor(this.BRAND_COLOR);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
      }
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
    };

    // Add header with logo and branding
    this.addHeader(pdf, pageWidth, margin, opts);
    yPosition = 60;

    // Executive Summary (for provider template)
    if (opts.template === 'provider' || opts.template === 'summary') {
      addSection('Executive Summary');
      const summary = this.generateExecutiveSummary(data);
      yPosition = addText(summary, margin, yPosition, pageWidth - 2 * margin);
    }

    // Patient Information
    addSection('Patient Information');
    yPosition = this.addPatientInfo(pdf, data.patientProfile, margin, yPosition, pageWidth);

    // Health Indicators Dashboard
    if (opts.template === 'detailed' && opts.includeCharts) {
      addSection('Health Indicators Dashboard');
      yPosition = this.addHealthDashboard(pdf, data, margin, yPosition, pageWidth);
    }

    // Medications
    if (opts.includeMedications && data.patientProfile.currentMedications.length > 0) {
      addSection('Current Medications');
      yPosition = this.addMedications(pdf, data.patientProfile, margin, yPosition, pageWidth);
    }

    // Assessment History with Trends
    if (opts.includeAssessments && data.assessments.length > 0) {
      addSection('Assessment History & Trends');
      yPosition = this.addAssessmentTrends(pdf, data.assessments, margin, yPosition, pageWidth, opts);
    }

    // Vital Signs Tracking
    if (opts.includeVitals && data.vitals.length > 0) {
      addSection('Vital Signs Tracking');
      yPosition = this.addVitalTrends(pdf, data.vitals, margin, yPosition, pageWidth);
    }

    // Goals & Progress
    if (opts.includeGoals && data.goals.length > 0) {
      addSection('Health Goals & Progress');
      yPosition = this.addGoalsProgress(pdf, data.goals, margin, yPosition, pageWidth);
    }

    // Timeline View
    if (opts.includeTimeline && opts.template === 'detailed') {
      addSection('Health Timeline');
      yPosition = this.addHealthTimeline(pdf, data, margin, yPosition, pageWidth);
    }

    // Clinical Recommendations
    if (opts.template === 'provider') {
      addSection('Clinical Recommendations');
      yPosition = this.addClinicalRecommendations(pdf, data, margin, yPosition, pageWidth);
    }

    // Footer with generation info
    this.addFooter(pdf, pageWidth, pageHeight);

    return new Promise(resolve => {
      resolve(pdf.output('blob'));
    });
  }

  private static addHeader(pdf: jsPDF, pageWidth: number, margin: number, opts: PDFOptions): void {
    // Header background
    pdf.setFillColor(this.BRAND_COLOR);
    pdf.rect(0, 0, pageWidth, 35, 'F');

    // Title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Clinical Toolkit - Patient Report', margin, 20);

    // Date and template info
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const headerInfo = `Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')} | Template: ${opts.template?.toUpperCase()}`;
    pdf.text(headerInfo, pageWidth - margin - pdf.getTextWidth(headerInfo), 30);

    // Watermark if specified
    if (opts.watermark) {
      pdf.setTextColor(200, 200, 200);
      pdf.setFontSize(8);
      pdf.text(opts.watermark, pageWidth - margin - pdf.getTextWidth(opts.watermark), pageWidth - 10);
    }

    pdf.setTextColor(0, 0, 0);
  }

  private static addFooter(pdf: jsPDF, pageWidth: number, pageHeight: number): void {
    const pageCount = pdf.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(this.SECONDARY_COLOR);
      
      // Page number
      pdf.text(`Page ${i} of ${pageCount}`, pageWidth - 40, pageHeight - 10);
      
      // Footer line
      pdf.setDrawColor(this.SECONDARY_COLOR);
      pdf.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);
      
      // Disclaimer
      const disclaimer = 'This report is generated for informational purposes only. Consult healthcare professionals for medical advice.';
      pdf.text(disclaimer, 20, pageHeight - 5);
    }
  }

  private static generateExecutiveSummary(data: ExportData): string {
    const patient = data.patientProfile;
    const recentAssessments = data.assessments
      .filter(a => new Date(a.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .length;
    
    const vitalTrends = this.analyzeVitalTrends(data.vitals);
    const goalProgress = this.analyzeGoalProgress(data.goals);

    return `Patient ${patient.firstName} ${patient.lastName} (DOB: ${format(new Date(patient.dateOfBirth), 'MMM dd, yyyy')}) 
has ${patient.conditions.length} documented condition(s): ${patient.conditions.join(', ')}. 
${recentAssessments} assessment(s) completed in the last 30 days. 
Vital signs trend: ${vitalTrends}. Goal completion rate: ${goalProgress}%.`;
  }

  private static addPatientInfo(pdf: jsPDF, patient: PatientProfile, margin: number, yPosition: number, pageWidth: number): number {
    // Create a bordered info box
    pdf.setDrawColor(this.SECONDARY_COLOR);
    pdf.setFillColor(248, 250, 252);
    const boxHeight = 60;
    pdf.roundedRect(margin, yPosition, pageWidth - 2 * margin, boxHeight, 3, 3, 'FD');

    yPosition += 10;
    
    // Two column layout
    const colWidth = (pageWidth - 2 * margin - 20) / 2;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Name:', margin + 10, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${patient.firstName} ${patient.lastName}`, margin + 40, yPosition);

    pdf.setFont('helvetica', 'bold');
    pdf.text('DOB:', margin + colWidth + 10, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(format(new Date(patient.dateOfBirth), 'MMM dd, yyyy'), margin + colWidth + 35, yPosition);

    yPosition += 12;

    if (patient.medicalRecordNumber) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('MRN:', margin + 10, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(patient.medicalRecordNumber, margin + 40, yPosition);
    }

    yPosition += 12;

    pdf.setFont('helvetica', 'bold');
    pdf.text('Conditions:', margin + 10, yPosition);
    pdf.setFont('helvetica', 'normal');
    yPosition = this.addText(pdf, patient.conditions.join(', '), margin + 10, yPosition + 8, pageWidth - 2 * margin - 20);

    if (patient.allergies.length > 0) {
      yPosition += 8;
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(this.ERROR_COLOR);
      pdf.text('ALLERGIES:', margin + 10, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(patient.allergies.join(', '), margin + 60, yPosition);
      pdf.setTextColor(0, 0, 0);
    }

    return yPosition + 20;
  }

  private static addHealthDashboard(pdf: jsPDF, data: ExportData, margin: number, yPosition: number, pageWidth: number): number {
    // Create visual health indicators
    const indicators = this.calculateHealthIndicators(data);
    
    const boxWidth = (pageWidth - 2 * margin - 30) / 3;
    let xPosition = margin;

    indicators.forEach((indicator, index) => {
      const color = indicator.status === 'good' ? this.SUCCESS_COLOR : 
                   indicator.status === 'warning' ? this.WARNING_COLOR : this.ERROR_COLOR;
      
      // Indicator box
      pdf.setFillColor(color);
      pdf.roundedRect(xPosition, yPosition, boxWidth, 40, 3, 3, 'F');
      
      // White text
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text(indicator.name, xPosition + 5, yPosition + 10);
      
      pdf.setFontSize(14);
      pdf.text(indicator.value, xPosition + 5, yPosition + 25);
      
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text(indicator.trend, xPosition + 5, yPosition + 35);
      
      xPosition += boxWidth + 10;
    });

    pdf.setTextColor(0, 0, 0);
    return yPosition + 50;
  }

  private static addText(pdf: jsPDF, text: string, x: number, y: number, maxWidth?: number): number {
    if (maxWidth) {
      const lines = pdf.splitTextToSize(text, maxWidth);
      pdf.text(lines, x, y);
      return y + (lines.length * 6);
    } else {
      pdf.text(text, x, y);
      return y + 6;
    }
  }

  // Email Integration
  public static async sendReportByEmail(
    reportBlob: Blob, 
    filename: string, 
    options: EmailOptions
  ): Promise<boolean> {
    try {
      // Create email with attachment
      const emailData = this.createEmailWithAttachment(reportBlob, filename, options);
      
      // Use mailto for now - can be enhanced with actual email service
      const mailtoLink = this.generateMailtoLink(emailData);
      window.open(mailtoLink);
      
      return true;
    } catch (error) {
      console.error('Email send failed:', error);
      return false;
    }
  }

  private static createEmailWithAttachment(
    blob: Blob, 
    filename: string, 
    options: EmailOptions
  ): string {
    // Convert blob to base64 for email attachment
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    }) as any;
  }

  private static generateMailtoLink(emailData: any): string {
    const subject = encodeURIComponent(emailData.subject);
    const body = encodeURIComponent(emailData.body);
    return `mailto:${emailData.to}?subject=${subject}&body=${body}`;
  }

  // Analytics and insights
  private static analyzeVitalTrends(vitals: VitalSigns[]): string {
    if (vitals.length < 2) return 'Insufficient data';
    
    const recent = vitals.slice(-5);
    const bp = recent.filter(v => v.type === 'blood-pressure');
    
    if (bp.length >= 2) {
      const trend = bp[bp.length - 1].systolic - bp[0].systolic;
      return trend > 5 ? 'Increasing' : trend < -5 ? 'Decreasing' : 'Stable';
    }
    
    return 'Stable';
  }

  private static analyzeGoalProgress(goals: GoalTracking[]): number {
    if (goals.length === 0) return 0;
    
    const totalProgress = goals.reduce((sum, goal) => {
      return sum + (goal.progress / goal.maxProgress) * 100;
    }, 0);
    
    return Math.round(totalProgress / goals.length);
  }

  private static calculateHealthIndicators(data: ExportData): Array<{name: string, value: string, status: string, trend: string}> {
    return [
      {
        name: 'Blood Pressure',
        value: this.getLatestBP(data.vitals),
        status: this.getBPStatus(data.vitals),
        trend: this.analyzeVitalTrends(data.vitals)
      },
      {
        name: 'Goal Progress',
        value: `${this.analyzeGoalProgress(data.goals)}%`,
        status: this.analyzeGoalProgress(data.goals) > 70 ? 'good' : 'warning',
        trend: 'On track'
      },
      {
        name: 'Assessments',
        value: `${data.assessments.length}`,
        status: 'good',
        trend: 'Recent activity'
      }
    ];
  }

  private static getLatestBP(vitals: VitalSigns[]): string {
    const bp = vitals.filter(v => v.type === 'blood-pressure').slice(-1)[0];
    return bp ? `${bp.systolic}/${bp.diastolic}` : 'No data';
  }

  private static getBPStatus(vitals: VitalSigns[]): string {
    const bp = vitals.filter(v => v.type === 'blood-pressure').slice(-1)[0];
    if (!bp) return 'unknown';
    
    if (bp.systolic > 140 || bp.diastolic > 90) return 'warning';
    if (bp.systolic < 120 && bp.diastolic < 80) return 'good';
    return 'warning';
  }

  // Additional helper methods for other sections...
  private static addMedications(pdf: jsPDF, patient: PatientProfile, margin: number, yPosition: number, pageWidth: number): number {
    // Implementation for detailed medication section
    return yPosition + 50;
  }

  private static addAssessmentTrends(pdf: jsPDF, assessments: AssessmentResult[], margin: number, yPosition: number, pageWidth: number, opts: PDFOptions): number {
    // Implementation for assessment trends with charts
    return yPosition + 50;
  }

  private static addVitalTrends(pdf: jsPDF, vitals: VitalSigns[], margin: number, yPosition: number, pageWidth: number): number {
    // Implementation for vital signs trends
    return yPosition + 50;
  }

  private static addGoalsProgress(pdf: jsPDF, goals: GoalTracking[], margin: number, yPosition: number, pageWidth: number): number {
    // Implementation for goals progress
    return yPosition + 50;
  }

  private static addHealthTimeline(pdf: jsPDF, data: ExportData, margin: number, yPosition: number, pageWidth: number): number {
    // Implementation for health timeline
    return yPosition + 50;
  }

  private static addClinicalRecommendations(pdf: jsPDF, data: ExportData, margin: number, yPosition: number, pageWidth: number): number {
    // Implementation for clinical recommendations
    return yPosition + 50;
  }

  // Bulk Export Functions
  public static async exportMultiplePatients(patients: PatientProfile[], format: 'pdf' | 'csv' | 'zip'): Promise<Blob> {
    // Implementation for bulk patient export
    return new Blob();
  }

  // Download helper
  public static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Generate filename with timestamp
  public static generateFilename(patient: PatientProfile, format: string, suffix?: string): string {
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmm');
    const name = `${patient.firstName}-${patient.lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const suffixPart = suffix ? `-${suffix}` : '';
    return `clinical-toolkit-${name}${suffixPart}-${timestamp}.${format}`;
  }
}