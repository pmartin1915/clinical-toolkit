export interface Condition {
  id: string;
  title: string;
  shortDescription: string;
  category: 'cardiovascular' | 'endocrine' | 'mental-health' | 'infectious' | 'metabolic' | 'orthopedic';
  severity: 'low' | 'medium' | 'high';
  overview: {
    definition: string;
    prevalence: string;
    keyPoints: string[];
  };
  guidelines: {
    diagnosis: string[];
    treatment: Treatment[];
    monitoring: string[];
  };
  tools: Tool[];
  resources: Resource[];
}

export interface Treatment {
  category: string;
  options: TreatmentOption[];
}

export interface TreatmentOption {
  name: string;
  dosage?: string;
  duration?: string;
  notes?: string;
  indications?: string[];
  contraindications?: string[];
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  type: 'calculator' | 'assessment' | 'tracker' | 'reference' | 'education';
  component: string;
  inputs?: ToolInput[];
}

export interface ToolInput {
  id: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'radio' | 'checkbox';
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  unit?: string;
}

export interface Resource {
  title: string;
  type: 'guideline' | 'study' | 'calculator' | 'education' | 'reference';
  url?: string;
  citation?: string;
}

export interface CalculatorResult {
  value: number | string;
  interpretation: string;
  recommendations?: string[];
  riskLevel?: 'low' | 'moderate' | 'high';
}