// Comprehensive symptom-to-condition-to-tool mapping database
export interface SymptomEntry {
  symptom: string;
  aliases: string[]; // Alternative ways to express the same symptom
  conditions: string[]; // Condition IDs this symptom may indicate
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  commonTools: string[]; // Tool IDs that are commonly used for this symptom
  description?: string;
}

export const symptomDatabase: SymptomEntry[] = [
  // Cardiovascular symptoms
  {
    symptom: "chest pain",
    aliases: ["chest discomfort", "chest tightness", "chest pressure", "angina"],
    conditions: ["hypertension", "heart-failure"],
    urgency: "high",
    commonTools: ["ascvd-calculator", "bp-tracker", "nyha-classification"],
    description: "Pain or discomfort in the chest area"
  },
  {
    symptom: "shortness of breath",
    aliases: ["difficulty breathing", "breathlessness", "dyspnea", "SOB", "can't breathe"],
    conditions: ["heart-failure", "copd", "hypertension"],
    urgency: "high",
    commonTools: ["nyha-classification", "copd-assessment", "bp-tracker"],
    description: "Difficulty breathing or feeling out of breath"
  },
  {
    symptom: "palpitations",
    aliases: ["heart racing", "fast heartbeat", "irregular heartbeat", "heart flutter"],
    conditions: ["hypertension", "heart-failure"],
    urgency: "medium",
    commonTools: ["bp-tracker", "ascvd-calculator"],
    description: "Feeling of rapid, strong, or irregular heartbeat"
  },
  {
    symptom: "swelling",
    aliases: ["edema", "fluid retention", "puffy feet", "swollen legs", "swollen ankles"],
    conditions: ["heart-failure", "hypertension"],
    urgency: "medium",
    commonTools: ["nyha-classification", "bp-tracker"],
    description: "Fluid buildup causing swelling, especially in legs and feet"
  },
  {
    symptom: "fatigue",
    aliases: ["tiredness", "exhaustion", "lack of energy", "weakness"],
    conditions: ["heart-failure", "depression", "diabetes", "copd"],
    urgency: "low",
    commonTools: ["phq9-assessment", "nyha-classification", "a1c-converter"],
    description: "Persistent feeling of tiredness or lack of energy"
  },

  // Respiratory symptoms
  {
    symptom: "cough",
    aliases: ["coughing", "persistent cough", "dry cough", "productive cough"],
    conditions: ["copd", "rhinosinusitis", "heart-failure"],
    urgency: "low",
    commonTools: ["copd-assessment", "sinusitis-assessment"],
    description: "Persistent coughing, may be dry or produce mucus"
  },
  {
    symptom: "wheezing",
    aliases: ["whistling breathing", "tight chest", "asthma symptoms"],
    conditions: ["copd"],
    urgency: "medium",
    commonTools: ["copd-assessment", "asthma-control-test"],
    description: "High-pitched whistling sound when breathing"
  },
  {
    symptom: "sputum production",
    aliases: ["phlegm", "mucus", "productive cough", "bringing up mucus"],
    conditions: ["copd", "rhinosinusitis"],
    urgency: "low",
    commonTools: ["copd-assessment", "sinusitis-assessment"],
    description: "Coughing up mucus or phlegm"
  },

  // Mental health symptoms
  {
    symptom: "depression",
    aliases: ["sadness", "feeling down", "hopelessness", "mood problems", "feeling depressed"],
    conditions: ["depression"],
    urgency: "medium",
    commonTools: ["phq9-assessment", "depression-treatment"],
    description: "Persistent feelings of sadness, hopelessness, or loss of interest"
  },
  {
    symptom: "anxiety",
    aliases: ["worry", "nervousness", "panic", "anxious", "stress"],
    conditions: ["anxiety"],
    urgency: "medium",
    commonTools: ["gad7-assessment"],
    description: "Excessive worry, fear, or nervousness"
  },
  {
    symptom: "panic attacks",
    aliases: ["panic", "sudden fear", "racing heart from anxiety"],
    conditions: ["anxiety"],
    urgency: "high",
    commonTools: ["gad7-assessment"],
    description: "Sudden episodes of intense fear or anxiety"
  },
  {
    symptom: "sleep problems",
    aliases: ["insomnia", "can't sleep", "sleep disturbance", "trouble sleeping"],
    conditions: ["depression", "anxiety"],
    urgency: "low",
    commonTools: ["phq9-assessment", "gad7-assessment"],
    description: "Difficulty falling asleep, staying asleep, or poor sleep quality"
  },

  // Metabolic/Endocrine symptoms
  {
    symptom: "excessive thirst",
    aliases: ["polydipsia", "always thirsty", "increased thirst"],
    conditions: ["diabetes"],
    urgency: "medium",
    commonTools: ["a1c-converter", "diabetes-treatment"],
    description: "Unusual or excessive thirst"
  },
  {
    symptom: "frequent urination",
    aliases: ["polyuria", "urinating often", "increased urination"],
    conditions: ["diabetes", "uti"],
    urgency: "medium",
    commonTools: ["a1c-converter", "uti-assessment"],
    description: "Urinating more frequently than normal"
  },
  {
    symptom: "weight loss",
    aliases: ["losing weight", "unintentional weight loss", "weight dropping"],
    conditions: ["diabetes", "depression"],
    urgency: "medium",
    commonTools: ["a1c-converter", "phq9-assessment"],
    description: "Unintentional loss of body weight"
  },
  {
    symptom: "blurred vision",
    aliases: ["vision problems", "can't see clearly", "fuzzy vision"],
    conditions: ["diabetes", "hypertension"],
    urgency: "medium",
    commonTools: ["a1c-converter", "bp-tracker"],
    description: "Vision that appears unclear or out of focus"
  },

  // Urinary symptoms
  {
    symptom: "burning urination",
    aliases: ["dysuria", "painful urination", "burning when urinating"],
    conditions: ["uti"],
    urgency: "medium",
    commonTools: ["uti-assessment", "uti-diagnostic"],
    description: "Pain or burning sensation during urination"
  },
  {
    symptom: "cloudy urine",
    aliases: ["dark urine", "discolored urine", "abnormal urine color"],
    conditions: ["uti"],
    urgency: "medium",
    commonTools: ["uti-assessment", "uti-diagnostic"],
    description: "Urine that appears cloudy, dark, or unusually colored"
  },

  // Sinus/Upper respiratory symptoms
  {
    symptom: "nasal congestion",
    aliases: ["stuffy nose", "blocked nose", "nasal blockage"],
    conditions: ["rhinosinusitis"],
    urgency: "low",
    commonTools: ["sinusitis-assessment", "sinusitis-diagnostic"],
    description: "Blocked or stuffy nasal passages"
  },
  {
    symptom: "facial pain",
    aliases: ["sinus pain", "facial pressure", "pain around eyes"],
    conditions: ["rhinosinusitis"],
    urgency: "low",
    commonTools: ["sinusitis-assessment", "sinusitis-diagnostic"],
    description: "Pain or pressure in the face, especially around sinuses"
  },
  {
    symptom: "headache",
    aliases: ["head pain", "migraine", "tension headache"],
    conditions: ["rhinosinusitis", "hypertension"],
    urgency: "low",
    commonTools: ["sinusitis-assessment", "bp-tracker"],
    description: "Pain or aching in the head"
  },
  {
    symptom: "fever",
    aliases: ["high temperature", "feeling hot", "temperature"],
    conditions: ["rhinosinusitis", "uti"],
    urgency: "medium",
    commonTools: ["sinusitis-diagnostic", "uti-diagnostic"],
    description: "Elevated body temperature"
  },

  // High cholesterol/lipid symptoms
  {
    symptom: "high cholesterol",
    aliases: ["elevated cholesterol", "lipid problems", "cholesterol issues"],
    conditions: ["hypertriglyceridemia"],
    urgency: "low",
    commonTools: ["triglyceride-calculator", "ascvd-calculator"],
    description: "Elevated blood cholesterol levels"
  },

  // General symptoms
  {
    symptom: "dizziness",
    aliases: ["lightheaded", "dizzy spells", "vertigo"],
    conditions: ["hypertension", "heart-failure"],
    urgency: "medium",
    commonTools: ["bp-tracker", "nyha-classification"],
    description: "Feeling unsteady, lightheaded, or off-balance"
  },
  {
    symptom: "nausea",
    aliases: ["feeling sick", "queasy", "stomach upset"],
    conditions: ["hypertension", "diabetes"],
    urgency: "low",
    commonTools: ["bp-tracker", "a1c-converter"],
    description: "Feeling of sickness with an urge to vomit"
  }
];

// Search functionality
export class SymptomSearchEngine {
  private static normalizeText(text: string): string {
    return text.toLowerCase().trim().replace(/[^\w\s]/g, '');
  }

  private static calculateRelevanceScore(symptomEntry: SymptomEntry, searchTerm: string): number {
    const normalizedSearch = this.normalizeText(searchTerm);
    const normalizedSymptom = this.normalizeText(symptomEntry.symptom);
    
    let score = 0;
    
    // Exact match gets highest score
    if (normalizedSymptom === normalizedSearch) {
      score += 100;
    }
    
    // Symptom contains search term
    if (normalizedSymptom.includes(normalizedSearch)) {
      score += 80;
    }
    
    // Search term contains symptom
    if (normalizedSearch.includes(normalizedSymptom)) {
      score += 70;
    }
    
    // Check aliases
    for (const alias of symptomEntry.aliases) {
      const normalizedAlias = this.normalizeText(alias);
      
      if (normalizedAlias === normalizedSearch) {
        score += 90;
      } else if (normalizedAlias.includes(normalizedSearch)) {
        score += 60;
      } else if (normalizedSearch.includes(normalizedAlias)) {
        score += 50;
      }
    }
    
    // Boost score based on urgency
    switch (symptomEntry.urgency) {
      case 'emergency':
        score += 20;
        break;
      case 'high':
        score += 15;
        break;
      case 'medium':
        score += 10;
        break;
      case 'low':
        score += 5;
        break;
    }
    
    return score;
  }

  public static searchSymptoms(query: string, maxResults: number = 10): SymptomEntry[] {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    const results = symptomDatabase
      .map(entry => ({
        entry,
        score: this.calculateRelevanceScore(entry, query)
      }))
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(result => result.entry);
    
    return results;
  }

  public static getToolsForSymptom(symptom: string): string[] {
    const results = this.searchSymptoms(symptom, 5);
    const tools = new Set<string>();
    
    results.forEach(entry => {
      entry.commonTools.forEach(tool => tools.add(tool));
    });
    
    return Array.from(tools);
  }

  public static getConditionsForSymptom(symptom: string): string[] {
    const results = this.searchSymptoms(symptom, 5);
    const conditions = new Set<string>();
    
    results.forEach(entry => {
      entry.conditions.forEach(condition => conditions.add(condition));
    });
    
    return Array.from(conditions);
  }

  public static getUrgencyForSymptom(symptom: string): 'low' | 'medium' | 'high' | 'emergency' {
    const results = this.searchSymptoms(symptom, 1);
    return results.length > 0 ? results[0].urgency : 'low';
  }
}