// Export utilities for generating reports and data files
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import { format } from 'date-fns';
import type {
  ExportData,
  PatientProfile,
  AssessmentResult,
  VitalSigns,
  GoalTracking
} from '../types/storage';
import {
  maskPatientPII,
  createSafeDisplayNameWithMRN,
  sanitizeErrorMessage,
  createAuditLogEntry
} from './security/piiMasking';

export class ExportManager {
  // PDF Report Generation
  public static async generatePatientReport(data: ExportData): Promise<Blob> {
    // Mask patient PII for HIPAA compliance
    const maskedPatient = await maskPatientPII(data.patientProfile);
    const maskedDisplayName = createSafeDisplayNameWithMRN(maskedPatient);

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addText = (text: string, x: number, y: number, maxWidth?: number): number => {
      if (maxWidth) {
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + (lines.length * 7);
      } else {
        pdf.text(text, x, y);
        return y + 7;
      }
    };

    // Helper function to check for new page
    const checkNewPage = (requiredSpace: number = 20): void => {
      if (yPosition + requiredSpace > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    yPosition = addText('Clinical Toolkit - Patient Report', margin, yPosition);
    
    // Patient Information
    yPosition += 10;
    pdf.setFontSize(16);
    yPosition = addText('Patient Information', margin, yPosition);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const patient = data.patientProfile;

    // Use masked patient identifiers - HIPAA compliant
    yPosition = addText(`Patient: ${maskedDisplayName}`, margin, yPosition);
    yPosition = addText(`Age Group: ${maskedPatient.ageGroup}`, margin, yPosition);
    yPosition = addText(`Patient ID (Hashed): ${maskedPatient.hashedId.substring(0, 12)}...`, margin, yPosition);
    yPosition = addText(`Conditions: ${patient.conditions.join(', ')}`, margin, yPosition, pageWidth - 2 * margin);
    if (patient.allergies.length > 0) {
      yPosition = addText(`Allergies: ${patient.allergies.join(', ')}`, margin, yPosition, pageWidth - 2 * margin);
    }

    // Current Medications
    if (patient.currentMedications.length > 0) {
      checkNewPage(50);
      yPosition += 10;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Current Medications', margin, yPosition);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      patient.currentMedications.forEach(med => {
        checkNewPage(25);
        yPosition = addText(`• ${med.name} (${med.genericName})`, margin + 5, yPosition);
        yPosition = addText(`  Dosage: ${med.dosage}, Frequency: ${med.frequency}`, margin + 10, yPosition);
        if (med.notes) {
          yPosition = addText(`  Notes: ${med.notes}`, margin + 10, yPosition, pageWidth - 2 * margin - 10);
        }
        yPosition += 3;
      });
    }

    // Recent Assessments
    if (data.assessments.length > 0) {
      checkNewPage(50);
      yPosition += 10;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Recent Assessments', margin, yPosition);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const recentAssessments = data.assessments
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      recentAssessments.forEach(assessment => {
        checkNewPage(30);
        yPosition = addText(`${assessment.toolName}`, margin, yPosition);
        yPosition = addText(`Date: ${format(new Date(assessment.timestamp), 'MMM dd, yyyy HH:mm')}`, margin + 5, yPosition);
        if (assessment.score !== undefined) {
          yPosition = addText(`Score: ${assessment.score}`, margin + 5, yPosition);
        }
        if (assessment.severity) {
          yPosition = addText(`Severity: ${assessment.severity}`, margin + 5, yPosition);
        }
        if (assessment.recommendations.length > 0) {
          yPosition = addText('Recommendations:', margin + 5, yPosition);
          assessment.recommendations.forEach(rec => {
            yPosition = addText(`  • ${rec}`, margin + 10, yPosition, pageWidth - 2 * margin - 15);
          });
        }
        yPosition += 5;
      });
    }

    // Vital Signs Trends
    if (data.vitals.length > 0) {
      checkNewPage(50);
      yPosition += 10;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Recent Vital Signs', margin, yPosition);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      const recentVitals = data.vitals
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 20);

      const vitalsByType = recentVitals.reduce((acc, vital) => {
        if (!acc[vital.type]) acc[vital.type] = [];
        acc[vital.type].push(vital);
        return acc;
      }, {} as Record<string, VitalSigns[]>);

      Object.entries(vitalsByType).forEach(([type, vitals]) => {
        checkNewPage(25);
        yPosition = addText(`${type.replace('_', ' ').toUpperCase()}:`, margin, yPosition);
        vitals.slice(0, 5).forEach(vital => {
          const valueStr = typeof vital.value === 'object' 
            ? `${vital.value.systolic}/${vital.value.diastolic}` 
            : `${vital.value}`;
          yPosition = addText(
            `  ${format(new Date(vital.timestamp), 'MMM dd')}: ${valueStr} ${vital.unit}`,
            margin + 5,
            yPosition
          );
        });
        yPosition += 3;
      });
    }

    // Goal Progress
    if (data.goals.length > 0) {
      checkNewPage(50);
      yPosition += 10;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      yPosition = addText('Goal Progress', margin, yPosition);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      data.goals.forEach(goal => {
        checkNewPage(25);
        const completionRate = goal.completions.length > 0 
          ? Math.round((goal.completions.filter(c => c.completed).length / goal.completions.length) * 100)
          : 0;
        
        yPosition = addText(`${goal.goalTitle} (${goal.category})`, margin, yPosition);
        yPosition = addText(`  Target: ${goal.target}`, margin + 5, yPosition);
        yPosition = addText(`  Completion Rate: ${completionRate}%`, margin + 5, yPosition);
        yPosition = addText(`  Status: ${goal.status}`, margin + 5, yPosition);
        yPosition += 3;
      });
    }

    // Footer
    const pageCount = (pdf as typeof pdf & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Generated on ${format(new Date(data.exportedAt), 'MMMM dd, yyyy HH:mm')} - Page ${i} of ${pageCount}`,
        margin,
        pdf.internal.pageSize.getHeight() - 10
      );
      pdf.text(
        'Clinical Toolkit - Confidential Medical Information',
        pageWidth - margin - 100,
        pdf.internal.pageSize.getHeight() - 10
      );
    }

    return new Blob([pdf.output('blob')], { type: 'application/pdf' });
  }

  // CSV Export for different data types
  public static generateAssessmentsCSV(assessments: AssessmentResult[]): Blob {
    const csvData = assessments.map(assessment => ({
      Date: format(new Date(assessment.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      Tool: assessment.toolName,
      Condition: assessment.conditionId,
      Score: assessment.score || '',
      Severity: assessment.severity || '',
      Recommendations: assessment.recommendations.join('; '),
      Provider: assessment.providerId || ''
    }));

    const csv = Papa.unparse(csvData);
    return new Blob([csv], { type: 'text/csv' });
  }

  public static generateVitalsCSV(vitals: VitalSigns[]): Blob {
    const csvData = vitals.map(vital => {
      const baseData = {
        Date: format(new Date(vital.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        Type: vital.type,
        Unit: vital.unit,
        Location: vital.location || '',
        Notes: vital.notes || ''
      };

      if (typeof vital.value === 'object') {
        return {
          ...baseData,
          Systolic: vital.value.systolic,
          Diastolic: vital.value.diastolic,
          Value: `${vital.value.systolic}/${vital.value.diastolic}`
        };
      } else {
        return {
          ...baseData,
          Value: vital.value,
          Systolic: '',
          Diastolic: ''
        };
      }
    });

    const csv = Papa.unparse(csvData);
    return new Blob([csv], { type: 'text/csv' });
  }

  public static generateGoalsCSV(goals: GoalTracking[]): Blob {
    const csvData: Array<{
      GoalTitle: string;
      Category: string;
      Target: string;
      Frequency: string;
      Status: string;
      StartDate: string;
      EndDate: string;
      CompletionRate: string;
      TotalCompletions: number;
      SuccessfulCompletions: number;
      CompletionDate: string;
      Completed: string;
      CompletionValue: string;
      CompletionNotes: string;
    }> = [];
    
    goals.forEach(goal => {
      const completionRate = goal.completions.length > 0 
        ? Math.round((goal.completions.filter(c => c.completed).length / goal.completions.length) * 100)
        : 0;
      
      const baseGoalData = {
        GoalTitle: goal.goalTitle,
        Category: goal.category,
        Target: goal.target,
        Frequency: goal.frequency,
        Status: goal.status,
        StartDate: goal.startDate,
        EndDate: goal.endDate || '',
        CompletionRate: `${completionRate}%`,
        TotalCompletions: goal.completions.length,
        SuccessfulCompletions: goal.completions.filter(c => c.completed).length
      };

      if (goal.completions.length > 0) {
        goal.completions.forEach(completion => {
          csvData.push({
            ...baseGoalData,
            CompletionDate: completion.date,
            Completed: completion.completed ? 'Yes' : 'No',
            CompletionValue: String(completion.value || ''),
            CompletionNotes: completion.notes || ''
          });
        });
      } else {
        csvData.push({
          ...baseGoalData,
          CompletionDate: '',
          Completed: '',
          CompletionValue: '',
          CompletionNotes: ''
        });
      }
    });

    const csv = Papa.unparse(csvData);
    return new Blob([csv], { type: 'text/csv' });
  }

  // Complete data export in JSON format
  public static generateJSONExport(data: ExportData): Blob {
    const jsonString = JSON.stringify(data, null, 2);
    return new Blob([jsonString], { type: 'application/json' });
  }

  // Download helper function
  public static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Generate filename with patient info and timestamp (HIPAA compliant - uses masked initials)
  public static async generateFilename(patient: PatientProfile, type: 'pdf' | 'csv' | 'json', category?: string): Promise<string> {
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');

    // Use masked initials instead of full name for HIPAA compliance
    const maskedPatient = await maskPatientPII(patient);
    const patientIdentifier = maskedPatient.displayInitials.replace(/\./g, '');

    const categoryStr = category ? `_${category}` : '';
    return `clinical-toolkit_${patientIdentifier}${categoryStr}_${timestamp}.${type}`;
  }

  // Batch export for multiple patients
  public static async generateBatchReport(patients: PatientProfile[], getData: (id: string) => ExportData): Promise<Blob> {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (const patient of patients) {
      try {
        const data = getData(patient.id);
        const pdfBlob = await this.generatePatientReport(data);
        const filename = await this.generateFilename(patient, 'pdf');

        zip.file(filename, pdfBlob);

        // Create audit log entry for export
        const maskedPatient = await maskPatientPII(patient);
        const auditEntry = createAuditLogEntry('EXPORT_PATIENT_REPORT', maskedPatient, {
          format: 'pdf',
          batchExport: true
        });
        console.info('📋 Patient report exported:', auditEntry);
      } catch (error) {
        const maskedPatient = await maskPatientPII(patient);
        const sanitizedError = sanitizeErrorMessage(error as Error, maskedPatient);
        console.error(`Error generating report for patient ${maskedPatient.displayInitials}:`, sanitizedError);
      }
    }

    return await zip.generateAsync({ type: 'blob' });
  }

  // Summary statistics for export
  public static generateSummaryStats(data: ExportData): {
    reportGenerated: string;
    assessmentsSummary: { total: number; lastThirtyDays: number; byTool: Record<string, number> };
    vitalsSummary: { total: number; lastThirtyDays: number; byType: Record<string, number> };
    goalsSummary: { total: number; active: number; completed: number; completionRate: number };
    educationSummary: { totalModules: number; completedModules: number; averageProgress: number; totalTimeSpent: number };
  } {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Recent assessments (last 30 days)
    const recentAssessments = data.assessments.filter(
      a => new Date(a.timestamp) >= thirtyDaysAgo
    );

    // Recent vitals
    const recentVitals = data.vitals.filter(
      v => new Date(v.timestamp) >= thirtyDaysAgo
    );

    // Active goals
    const activeGoals = data.goals.filter(g => g.status === 'active');
    const completedGoals = data.goals.filter(g => g.status === 'completed');

    // Education progress
    const completedModules = data.education.filter(e => e.completedAt);
    const avgProgress = data.education.length > 0 
      ? Math.round(data.education.reduce((sum, e) => sum + e.progress, 0) / data.education.length)
      : 0;

    return {
      reportGenerated: format(now, 'MMMM dd, yyyy HH:mm'),
      assessmentsSummary: {
        total: data.assessments.length,
        lastThirtyDays: recentAssessments.length,
        byTool: this.groupByProperty(recentAssessments, 'toolName')
      },
      vitalsSummary: {
        total: data.vitals.length,
        lastThirtyDays: recentVitals.length,
        byType: this.groupByProperty(recentVitals, 'type')
      },
      goalsSummary: {
        total: data.goals.length,
        active: activeGoals.length,
        completed: completedGoals.length,
        completionRate: data.goals.length > 0 
          ? Math.round((completedGoals.length / data.goals.length) * 100) 
          : 0
      },
      educationSummary: {
        totalModules: data.education.length,
        completedModules: completedModules.length,
        averageProgress: avgProgress,
        totalTimeSpent: Math.round(data.education.reduce((sum, e) => sum + e.timeSpent, 0))
      }
    };
  }

  private static groupByProperty<T, K extends keyof T>(
    array: T[],
    property: K
  ): Record<string, number> {
    return array.reduce((acc: Record<string, number>, item) => {
      const key = String(item[property]);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}