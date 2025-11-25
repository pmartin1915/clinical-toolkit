// CDS Alert History Management
import type { CDSAlert } from './cdsEngine';

export interface CDSAlertHistory {
  id: string;
  patientId: string;
  alert: CDSAlert;
  status: 'active' | 'acknowledged' | 'dismissed' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  notes?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

export interface CDSAuditLog {
  id: string;
  patientId: string;
  action: 'alert_triggered' | 'alert_acknowledged' | 'alert_dismissed' | 'alert_resolved' | 'follow_up_added';
  alertId: string;
  userId?: string;
  timestamp: string;
  details: Record<string, unknown>;
}

class CDSHistoryManager {
  private static readonly STORAGE_KEY = 'clinical-toolkit-cds-history';
  private static readonly AUDIT_LOG_KEY = 'clinical-toolkit-cds-audit';

  // Get all CDS alert history for a patient
  public static getPatientAlertHistory(patientId: string): CDSAlertHistory[] {
    const allHistory = this.getAllHistory();
    return allHistory.filter(history => history.patientId === patientId)
      .sort((a, b) => new Date(b.alert.triggeredAt).getTime() - new Date(a.alert.triggeredAt).getTime());
  }

  // Get all CDS alert history
  public static getAllHistory(): CDSAlertHistory[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading CDS history:', error);
      return [];
    }
  }

  // Save CDS alert to history
  public static saveAlertToHistory(patientId: string, alert: CDSAlert): string {
    const historyEntry: CDSAlertHistory = {
      id: this.generateId(),
      patientId,
      alert,
      status: 'active'
    };

    const history = this.getAllHistory();
    history.push(historyEntry);
    this.saveHistory(history);

    // Add to audit log
    this.logAction('alert_triggered', patientId, historyEntry.id, {
      ruleName: alert.ruleName,
      priority: alert.priority,
      category: alert.category
    });

    return historyEntry.id;
  }

  // Acknowledge an alert
  public static acknowledgeAlert(historyId: string, acknowledgedBy?: string, notes?: string): boolean {
    const history = this.getAllHistory();
    const entry = history.find(h => h.id === historyId);
    
    if (entry) {
      entry.status = 'acknowledged';
      entry.acknowledgedBy = acknowledgedBy;
      entry.acknowledgedAt = new Date().toISOString();
      entry.notes = notes;
      
      this.saveHistory(history);
      
      // Add to audit log
      this.logAction('alert_acknowledged', entry.patientId, historyId, {
        acknowledgedBy,
        notes
      });
      
      return true;
    }
    
    return false;
  }

  // Dismiss an alert
  public static dismissAlert(historyId: string, dismissedBy?: string, notes?: string): boolean {
    const history = this.getAllHistory();
    const entry = history.find(h => h.id === historyId);
    
    if (entry) {
      entry.status = 'dismissed';
      entry.acknowledgedBy = dismissedBy;
      entry.acknowledgedAt = new Date().toISOString();
      entry.notes = notes;
      
      this.saveHistory(history);
      
      // Add to audit log
      this.logAction('alert_dismissed', entry.patientId, historyId, {
        dismissedBy,
        notes
      });
      
      return true;
    }
    
    return false;
  }

  // Mark alert as resolved
  public static resolveAlert(historyId: string, resolvedBy?: string, notes?: string): boolean {
    const history = this.getAllHistory();
    const entry = history.find(h => h.id === historyId);
    
    if (entry) {
      entry.status = 'resolved';
      entry.acknowledgedBy = resolvedBy;
      entry.acknowledgedAt = new Date().toISOString();
      entry.notes = notes;
      
      this.saveHistory(history);
      
      // Add to audit log
      this.logAction('alert_resolved', entry.patientId, historyId, {
        resolvedBy,
        notes
      });
      
      return true;
    }
    
    return false;
  }

  // Add follow-up requirement
  public static addFollowUp(historyId: string, followUpDate: string, notes?: string): boolean {
    const history = this.getAllHistory();
    const entry = history.find(h => h.id === historyId);
    
    if (entry) {
      entry.followUpRequired = true;
      entry.followUpDate = followUpDate;
      if (notes) {
        entry.notes = (entry.notes || '') + '\n' + notes;
      }
      
      this.saveHistory(history);
      
      // Add to audit log
      this.logAction('follow_up_added', entry.patientId, historyId, {
        followUpDate,
        notes
      });
      
      return true;
    }
    
    return false;
  }

  // Get active alerts for a patient
  public static getActiveAlerts(patientId: string): CDSAlertHistory[] {
    return this.getPatientAlertHistory(patientId)
      .filter(history => history.status === 'active');
  }

  // Get alerts requiring follow-up
  public static getFollowUpAlerts(patientId?: string): CDSAlertHistory[] {
    const history = patientId ? this.getPatientAlertHistory(patientId) : this.getAllHistory();
    return history.filter(h => h.followUpRequired && h.followUpDate);
  }

  // Get CDS statistics for a patient
  public static getPatientCDSStats(patientId: string): {
    total: number;
    active: number;
    acknowledged: number;
    dismissed: number;
    resolved: number;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
  } {
    const history = this.getPatientAlertHistory(patientId);
    
    const stats = {
      total: history.length,
      active: 0,
      acknowledged: 0,
      dismissed: 0,
      resolved: 0,
      bySeverity: {} as Record<string, number>,
      byCategory: {} as Record<string, number>
    };

    history.forEach(entry => {
      // Count by status
      stats[entry.status]++;
      
      // Count by severity
      const severity = entry.alert.priority;
      stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;
      
      // Count by category
      const category = entry.alert.category;
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    });

    return stats;
  }

  // Get audit log
  public static getAuditLog(patientId?: string): CDSAuditLog[] {
    try {
      const stored = localStorage.getItem(this.AUDIT_LOG_KEY);
      const logs: CDSAuditLog[] = stored ? JSON.parse(stored) : [];
      
      if (patientId) {
        return logs.filter(log => log.patientId === patientId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      }
      
      return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (error) {
      console.error('Error loading CDS audit log:', error);
      return [];
    }
  }

  // Export CDS history for a patient
  public static exportPatientCDSHistory(patientId: string): {
    history: CDSAlertHistory[];
    auditLog: CDSAuditLog[];
    stats: ReturnType<typeof CDSHistoryManager.getPatientCDSStats>;
  } {
    return {
      history: this.getPatientAlertHistory(patientId),
      auditLog: this.getAuditLog(patientId),
      stats: this.getPatientCDSStats(patientId)
    };
  }

  // Clear old history (retention policy)
  public static cleanupOldHistory(retentionDays: number = 90): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    const history = this.getAllHistory();
    const filteredHistory = history.filter(entry => 
      new Date(entry.alert.triggeredAt) > cutoffDate
    );
    
    this.saveHistory(filteredHistory);

    // Also cleanup audit log
    const auditLog = this.getAuditLog();
    const filteredAuditLog = auditLog.filter(log => 
      new Date(log.timestamp) > cutoffDate
    );
    
    this.saveAuditLog(filteredAuditLog);
  }

  // Private helper methods
  private static saveHistory(history: CDSAlertHistory[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving CDS history:', error);
    }
  }

  private static logAction(
    action: CDSAuditLog['action'],
    patientId: string,
    alertId: string,
    details: Record<string, unknown>
  ): void {
    const auditEntry: CDSAuditLog = {
      id: this.generateId(),
      patientId,
      action,
      alertId,
      timestamp: new Date().toISOString(),
      details
    };

    const auditLog = this.getAuditLog();
    auditLog.push(auditEntry);
    this.saveAuditLog(auditLog);
  }

  private static saveAuditLog(auditLog: CDSAuditLog[]): void {
    try {
      localStorage.setItem(this.AUDIT_LOG_KEY, JSON.stringify(auditLog));
    } catch (error) {
      console.error('Error saving CDS audit log:', error);
    }
  }

  private static generateId(): string {
    return `cds-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export { CDSHistoryManager };