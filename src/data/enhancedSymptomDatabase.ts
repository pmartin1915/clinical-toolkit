// Enhanced clinical symptom database with medical terminology and ICD-10 codes
export interface EnhancedSymptomEntry {
  symptom: string;
  medicalTerms: string[]; // Clinical/medical terminology
  commonTerms: string[]; // Patient-friendly terms
  icd10Codes: string[]; // Related ICD-10 codes
  conditions: string[]; // Condition IDs this symptom may indicate
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  commonTools: string[]; // Tool IDs that are commonly used for this symptom
  description: string;
  redFlags?: string[]; // Warning signs requiring immediate attention
  differentials?: string[]; // Key differential diagnoses to consider
  physicalExam?: string[]; // Key physical exam findings
  diagnosticTests?: string[]; // Recommended diagnostic tests
}

export const enhancedSymptomDatabase: EnhancedSymptomEntry[] = [
  // Cardiovascular symptoms
  {
    symptom: "chest pain",
    medicalTerms: ["angina pectoris", "chest discomfort", "retrosternal pain", "precordial pain", "substernal pain"],
    commonTerms: ["chest hurt", "chest tightness", "chest pressure", "heavy chest", "squeezing chest"],
    icd10Codes: ["R06.02", "I20.9", "R07.89"],
    conditions: ["hypertension", "heart-failure", "emergency-orthopedic"],
    urgency: "high",
    commonTools: ["ascvd-calculator", "bp-tracker", "cha2ds2-vasc-calculator", "wells-score"],
    description: "Pain, pressure, or discomfort in the chest area that may indicate cardiac, pulmonary, or musculoskeletal conditions",
    redFlags: ["crushing pain", "radiation to arm/jaw", "diaphoresis", "syncope", "severe dyspnea"],
    differentials: ["acute coronary syndrome", "pulmonary embolism", "aortic dissection", "pneumothorax"],
    physicalExam: ["vital signs", "cardiac auscultation", "lung examination", "peripheral pulses"],
    diagnosticTests: ["ECG", "cardiac enzymes", "chest X-ray", "D-dimer"]
  },
  {
    symptom: "dyspnea",
    medicalTerms: ["dyspnea", "dyspnoea", "shortness of breath", "breathlessness", "respiratory distress"],
    commonTerms: ["can't breathe", "out of breath", "winded", "air hunger", "breathing problems"],
    icd10Codes: ["R06.00", "R06.02", "R06.03"],
    conditions: ["heart-failure", "copd", "hypertension"],
    urgency: "high",
    commonTools: ["nyha-classification", "copd-assessment", "bp-tracker", "wells-score"],
    description: "Difficulty breathing or sensation of breathlessness that may indicate cardiac or pulmonary pathology",
    redFlags: ["acute onset", "orthopnea", "paroxysmal nocturnal dyspnea", "cyanosis"],
    differentials: ["heart failure", "asthma", "COPD", "pulmonary embolism", "pneumonia"],
    physicalExam: ["respiratory rate", "oxygen saturation", "lung auscultation", "JVD assessment"],
    diagnosticTests: ["chest X-ray", "ABG", "BNP/NT-proBNP", "pulmonary function tests"]
  },
  {
    symptom: "palpitations",
    medicalTerms: ["palpitations", "tachycardia", "arrhythmia", "irregular heartbeat"],
    commonTerms: ["heart racing", "fast heartbeat", "heart flutter", "skipped beats", "heart pounding"],
    icd10Codes: ["R00.2", "I49.9"],
    conditions: ["hypertension", "heart-failure"],
    urgency: "medium",
    commonTools: ["bp-tracker", "ascvd-calculator", "cha2ds2-vasc-calculator"],
    description: "Awareness of heartbeat that may indicate arrhythmia or other cardiac conditions",
    redFlags: ["syncope", "chest pain", "severe dyspnea", "hemodynamic instability"],
    differentials: ["atrial fibrillation", "SVT", "anxiety", "hyperthyroidism"],
    physicalExam: ["pulse assessment", "cardiac auscultation", "blood pressure"],
    diagnosticTests: ["ECG", "Holter monitor", "thyroid function tests"]
  },
  {
    symptom: "peripheral edema",
    medicalTerms: ["edema", "peripheral edema", "fluid retention", "lymphedema"],
    commonTerms: ["swelling", "puffy feet", "swollen legs", "swollen ankles", "fluid buildup"],
    icd10Codes: ["R60.0", "R60.9"],
    conditions: ["heart-failure", "hypertension"],
    urgency: "medium",
    commonTools: ["nyha-classification", "bp-tracker", "egfr-calculator"],
    description: "Fluid accumulation in peripheral tissues, commonly in lower extremities",
    redFlags: ["acute onset", "unilateral swelling", "erythema", "warmth"],
    differentials: ["heart failure", "chronic venous insufficiency", "DVT", "nephritis"],
    physicalExam: ["pitting assessment", "skin examination", "cardiac assessment"],
    diagnosticTests: ["BNP", "renal function", "urinalysis", "venous duplex"]
  },

  // Respiratory symptoms
  {
    symptom: "cough",
    medicalTerms: ["cough", "tussis", "productive cough", "nonproductive cough", "chronic cough"],
    commonTerms: ["coughing", "hacking", "dry cough", "wet cough", "persistent cough"],
    icd10Codes: ["R05", "R05.1", "R05.2"],
    conditions: ["copd", "rhinosinusitis", "heart-failure"],
    urgency: "low",
    commonTools: ["copd-assessment", "sinusitis-assessment"],
    description: "Sudden, forceful expulsion of air from lungs that may indicate respiratory or cardiac pathology",
    redFlags: ["hemoptysis", "night sweats", "weight loss", "fever >38.5°C"],
    differentials: ["COPD", "asthma", "pneumonia", "heart failure", "lung cancer"],
    physicalExam: ["lung auscultation", "percussion", "lymph node examination"],
    diagnosticTests: ["chest X-ray", "sputum culture", "CBC"]
  },
  {
    symptom: "hemoptysis",
    medicalTerms: ["hemoptysis", "haemoptysis", "bloody sputum"],
    commonTerms: ["coughing up blood", "blood in sputum", "bloody cough"],
    icd10Codes: ["R04.2"],
    conditions: ["copd", "emergency-orthopedic"],
    urgency: "high",
    commonTools: ["copd-assessment", "wells-score"],
    description: "Coughing up blood or blood-tinged sputum requiring urgent evaluation",
    redFlags: ["massive hemoptysis", "hemodynamic instability", "respiratory distress"],
    differentials: ["pulmonary embolism", "lung cancer", "tuberculosis", "bronchiectasis"],
    physicalExam: ["vital signs", "lung examination", "cardiovascular assessment"],
    diagnosticTests: ["chest X-ray", "CT pulmonary angiogram", "CBC", "coagulation studies"]
  },

  // Neurological symptoms
  {
    symptom: "headache",
    medicalTerms: ["cephalgia", "headache", "migraine", "tension headache", "cluster headache"],
    commonTerms: ["head pain", "head hurt", "headache", "pain in head"],
    icd10Codes: ["G44.1", "R51"],
    conditions: ["rhinosinusitis", "hypertension"],
    urgency: "low",
    commonTools: ["sinusitis-assessment", "bp-tracker"],
    description: "Pain in the head or neck region with various potential causes",
    redFlags: ["sudden severe onset", "fever with neck stiffness", "neurological deficits", "worst headache of life"],
    differentials: ["tension headache", "migraine", "sinusitis", "hypertensive crisis", "meningitis"],
    physicalExam: ["neurological examination", "blood pressure", "fundoscopy"],
    diagnosticTests: ["CT head", "lumbar puncture if indicated"]
  },
  {
    symptom: "dizziness",
    medicalTerms: ["dizziness", "vertigo", "lightheadedness", "presyncope"],
    commonTerms: ["dizzy", "lightheaded", "off balance", "spinning sensation"],
    icd10Codes: ["R42", "H81.9"],
    conditions: ["hypertension", "heart-failure"],
    urgency: "medium",
    commonTools: ["bp-tracker", "nyha-classification"],
    description: "Sensation of unsteadiness, lightheadedness, or spinning",
    redFlags: ["syncope", "neurological deficits", "hearing loss", "severe headache"],
    differentials: ["orthostatic hypotension", "vestibular dysfunction", "medication side effects"],
    physicalExam: ["orthostatic vitals", "neurological exam", "cardiac assessment"],
    diagnosticTests: ["ECG", "glucose", "CBC"]
  },

  // Gastrointestinal symptoms
  {
    symptom: "nausea",
    medicalTerms: ["nausea", "emesis", "vomiting"],
    commonTerms: ["feeling sick", "queasy", "sick to stomach", "want to throw up"],
    icd10Codes: ["R11.0", "R11.10"],
    conditions: ["hypertension", "diabetes"],
    urgency: "low",
    commonTools: ["bp-tracker", "a1c-converter"],
    description: "Sensation of unease and discomfort in the stomach with urge to vomit",
    redFlags: ["severe dehydration", "bilious vomiting", "severe abdominal pain"],
    differentials: ["gastroenteritis", "medication side effects", "diabetic ketoacidosis"],
    physicalExam: ["hydration status", "abdominal examination", "vital signs"],
    diagnosticTests: ["basic metabolic panel", "glucose"]
  },

  // Endocrine/Metabolic symptoms
  {
    symptom: "polydipsia",
    medicalTerms: ["polydipsia", "excessive thirst"],
    commonTerms: ["always thirsty", "increased thirst", "drinking lots of water"],
    icd10Codes: ["R63.1"],
    conditions: ["diabetes"],
    urgency: "medium",
    commonTools: ["a1c-converter", "diabetes-treatment"],
    description: "Excessive thirst often associated with diabetes or other metabolic conditions",
    redFlags: ["rapid weight loss", "altered mental status", "dehydration"],
    differentials: ["diabetes mellitus", "diabetes insipidus", "psychogenic polydipsia"],
    physicalExam: ["hydration assessment", "blood pressure", "weight"],
    diagnosticTests: ["glucose", "HbA1c", "urinalysis"]
  },
  {
    symptom: "polyuria",
    medicalTerms: ["polyuria", "frequent urination"],
    commonTerms: ["urinating often", "peeing a lot", "frequent bathroom trips"],
    icd10Codes: ["R35.0"],
    conditions: ["diabetes", "uti"],
    urgency: "medium",
    commonTools: ["a1c-converter", "uti-assessment", "egfr-calculator"],
    description: "Excessive urination that may indicate diabetes, UTI, or kidney disease",
    redFlags: ["severe dehydration", "altered mental status", "fever"],
    differentials: ["diabetes mellitus", "UTI", "chronic kidney disease", "medications"],
    physicalExam: ["hydration status", "abdominal examination", "external genitalia"],
    diagnosticTests: ["glucose", "urinalysis", "renal function"]
  },
  {
    symptom: "polyphagia",
    medicalTerms: ["polyphagia", "hyperphagia", "excessive appetite"],
    commonTerms: ["always hungry", "eating a lot", "increased appetite"],
    icd10Codes: ["R63.2"],
    conditions: ["diabetes"],
    urgency: "low",
    commonTools: ["a1c-converter", "diabetes-treatment"],
    description: "Excessive hunger or appetite often associated with diabetes",
    differentials: ["diabetes mellitus", "hyperthyroidism", "psychiatric conditions"],
    physicalExam: ["weight assessment", "thyroid examination"],
    diagnosticTests: ["glucose", "HbA1c", "TSH"]
  },

  // Genitourinary symptoms
  {
    symptom: "dysuria",
    medicalTerms: ["dysuria", "painful urination"],
    commonTerms: ["burning when peeing", "painful urination", "stinging urine"],
    icd10Codes: ["R30.0"],
    conditions: ["uti"],
    urgency: "medium",
    commonTools: ["uti-assessment", "uti-diagnostic"],
    description: "Pain or burning sensation during urination",
    redFlags: ["fever", "flank pain", "hematuria", "inability to void"],
    differentials: ["UTI", "urethritis", "prostatitis", "kidney stones"],
    physicalExam: ["abdominal examination", "costovertebral angle tenderness"],
    diagnosticTests: ["urinalysis", "urine culture"]
  },
  {
    symptom: "hematuria",
    medicalTerms: ["hematuria", "blood in urine"],
    commonTerms: ["bloody urine", "red urine", "pink urine"],
    icd10Codes: ["R31.9"],
    conditions: ["uti"],
    urgency: "medium",
    commonTools: ["uti-assessment", "egfr-calculator"],
    description: "Blood in urine that may indicate urinary tract pathology",
    redFlags: ["gross hematuria", "clots", "inability to void", "severe pain"],
    differentials: ["UTI", "kidney stones", "bladder cancer", "glomerulonephritis"],
    physicalExam: ["abdominal examination", "external genitalia", "blood pressure"],
    diagnosticTests: ["urinalysis", "urine culture", "renal function", "imaging"]
  },

  // Musculoskeletal symptoms
  {
    symptom: "ankle pain",
    medicalTerms: ["ankle pain", "malleolar pain", "ankle trauma"],
    commonTerms: ["hurt ankle", "twisted ankle", "sprained ankle", "ankle injury"],
    icd10Codes: ["S93.40", "M25.571"],
    conditions: ["emergency-orthopedic"],
    urgency: "medium",
    commonTools: ["ottawa-ankle-rules"],
    description: "Pain in the ankle region that may indicate fracture, sprain, or other injury",
    redFlags: ["deformity", "inability to bear weight", "neurovascular compromise"],
    differentials: ["ankle fracture", "ankle sprain", "Achilles tendon injury"],
    physicalExam: ["inspection", "palpation", "range of motion", "weight bearing"],
    diagnosticTests: ["X-ray (if Ottawa rules positive)", "MRI if ligament injury suspected"]
  },
  {
    symptom: "foot pain",
    medicalTerms: ["foot pain", "metatarsal pain", "midfoot pain"],
    commonTerms: ["foot hurt", "sore foot", "foot injury"],
    icd10Codes: ["M79.3", "S92.90"],
    conditions: ["emergency-orthopedic"],
    urgency: "medium",
    commonTools: ["ottawa-ankle-rules"],
    description: "Pain in the foot that may indicate fracture or soft tissue injury",
    redFlags: ["deformity", "inability to bear weight", "open wound"],
    differentials: ["metatarsal fracture", "navicular fracture", "soft tissue injury"],
    physicalExam: ["inspection", "palpation of bones", "weight bearing assessment"],
    diagnosticTests: ["X-ray (if Ottawa rules positive)"]
  },

  // Cardiovascular risk factors
  {
    symptom: "high blood pressure",
    medicalTerms: ["hypertension", "elevated blood pressure", "high BP"],
    commonTerms: ["high blood pressure", "high BP", "blood pressure up"],
    icd10Codes: ["I10", "I15.9"],
    conditions: ["hypertension"],
    urgency: "medium",
    commonTools: ["bp-tracker", "ascvd-calculator", "cha2ds2-vasc-calculator"],
    description: "Elevated blood pressure readings requiring evaluation and management",
    redFlags: ["BP >180/120", "end organ damage", "symptoms of hypertensive crisis"],
    differentials: ["primary hypertension", "secondary hypertension", "white coat hypertension"],
    physicalExam: ["multiple BP readings", "fundoscopy", "cardiac examination"],
    diagnosticTests: ["ECG", "basic metabolic panel", "urinalysis"]
  },
  {
    symptom: "atrial fibrillation",
    medicalTerms: ["atrial fibrillation", "AF", "AFib", "irregular rhythm"],
    commonTerms: ["irregular heartbeat", "heart rhythm problems"],
    icd10Codes: ["I48.91", "I48.0"],
    conditions: ["hypertension", "heart-failure"],
    urgency: "medium",
    commonTools: ["cha2ds2-vasc-calculator", "bp-tracker"],
    description: "Irregular heart rhythm requiring stroke risk assessment and anticoagulation consideration",
    redFlags: ["hemodynamic instability", "chest pain", "severe dyspnea"],
    differentials: ["atrial fibrillation", "atrial flutter", "multifocal atrial tachycardia"],
    physicalExam: ["pulse assessment", "cardiac auscultation", "signs of heart failure"],
    diagnosticTests: ["ECG", "echocardiogram", "thyroid function"]
  },

  // Thromboembolic symptoms
  {
    symptom: "leg swelling",
    medicalTerms: ["unilateral leg edema", "deep vein thrombosis", "DVT"],
    commonTerms: ["swollen leg", "leg swelling", "puffy leg"],
    icd10Codes: ["I80.209", "R60.0"],
    conditions: ["emergency-orthopedic"],
    urgency: "high",
    commonTools: ["wells-score"],
    description: "Unilateral leg swelling that may indicate deep vein thrombosis",
    redFlags: ["sudden onset", "calf tenderness", "erythema", "warmth"],
    differentials: ["DVT", "cellulitis", "chronic venous insufficiency"],
    physicalExam: ["calf measurement", "palpation", "skin examination"],
    diagnosticTests: ["D-dimer", "venous duplex ultrasound"]
  },
  {
    symptom: "sudden dyspnea",
    medicalTerms: ["acute dyspnea", "sudden onset breathlessness", "pulmonary embolism"],
    commonTerms: ["sudden trouble breathing", "can't catch breath", "sudden shortness of breath"],
    icd10Codes: ["I26.99", "R06.00"],
    conditions: ["emergency-orthopedic"],
    urgency: "emergency",
    commonTools: ["wells-score"],
    description: "Acute onset dyspnea that may indicate pulmonary embolism",
    redFlags: ["chest pain", "hemoptysis", "syncope", "tachycardia"],
    differentials: ["pulmonary embolism", "pneumothorax", "acute heart failure"],
    physicalExam: ["vital signs", "lung examination", "cardiac assessment", "leg examination"],
    diagnosticTests: ["D-dimer", "CT pulmonary angiogram", "ABG", "ECG"]
  },

  // Mental health symptoms expanded
  {
    symptom: "major depression",
    medicalTerms: ["major depressive disorder", "clinical depression", "unipolar depression"],
    commonTerms: ["depression", "feeling depressed", "very sad", "hopeless"],
    icd10Codes: ["F32.9", "F33.9"],
    conditions: ["depression"],
    urgency: "medium",
    commonTools: ["phq9-assessment", "depression-treatment"],
    description: "Persistent depressed mood and loss of interest in activities",
    redFlags: ["suicidal ideation", "psychosis", "severe functional impairment"],
    differentials: ["major depression", "bipolar disorder", "adjustment disorder"],
    physicalExam: ["mental status exam", "neurological screening"],
    diagnosticTests: ["PHQ-9", "thyroid function", "B12/folate"]
  },
  {
    symptom: "generalized anxiety",
    medicalTerms: ["generalized anxiety disorder", "GAD", "anxiety disorder"],
    commonTerms: ["anxiety", "worry", "nervousness", "anxious feelings"],
    icd10Codes: ["F41.1", "F41.9"],
    conditions: ["anxiety"],
    urgency: "medium",
    commonTools: ["gad7-assessment"],
    description: "Excessive anxiety and worry about various life events",
    redFlags: ["panic attacks", "severe functional impairment", "substance use"],
    differentials: ["GAD", "panic disorder", "social anxiety", "medical causes"],
    physicalExam: ["mental status exam", "cardiovascular assessment"],
    diagnosticTests: ["GAD-7", "thyroid function", "drug screen if indicated"]
  }
];

// Enhanced search engine with medical terminology support
export class EnhancedSymptomSearchEngine {
  private static normalizeText(text: string): string {
    return text.toLowerCase().trim().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const substitutionCost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + substitutionCost // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private static fuzzyMatch(text: string, target: string, threshold: number = 0.8): boolean {
    const normalizedText = this.normalizeText(text);
    const normalizedTarget = this.normalizeText(target);
    
    if (normalizedText.includes(normalizedTarget) || normalizedTarget.includes(normalizedText)) {
      return true;
    }
    
    const maxLength = Math.max(normalizedText.length, normalizedTarget.length);
    if (maxLength === 0) return true;
    
    const distance = this.levenshteinDistance(normalizedText, normalizedTarget);
    const similarity = (maxLength - distance) / maxLength;
    
    return similarity >= threshold;
  }

  private static calculateRelevanceScore(symptomEntry: EnhancedSymptomEntry, searchTerm: string): number {
    const normalizedSearch = this.normalizeText(searchTerm);
    const words = normalizedSearch.split(' ').filter(w => w.length > 0);
    
    let score = 0;
    
    // Check main symptom
    const normalizedSymptom = this.normalizeText(symptomEntry.symptom);
    if (normalizedSymptom === normalizedSearch) {
      score += 100;
    } else if (normalizedSymptom.includes(normalizedSearch)) {
      score += 80;
    } else if (this.fuzzyMatch(symptomEntry.symptom, searchTerm, 0.8)) {
      score += 70;
    }
    
    // Check medical terms (high priority)
    for (const term of symptomEntry.medicalTerms) {
      const normalizedTerm = this.normalizeText(term);
      if (normalizedTerm === normalizedSearch) {
        score += 95;
      } else if (normalizedTerm.includes(normalizedSearch)) {
        score += 75;
      } else if (this.fuzzyMatch(term, searchTerm, 0.8)) {
        score += 65;
      }
    }
    
    // Check common terms
    for (const term of symptomEntry.commonTerms) {
      const normalizedTerm = this.normalizeText(term);
      if (normalizedTerm === normalizedSearch) {
        score += 85;
      } else if (normalizedTerm.includes(normalizedSearch)) {
        score += 65;
      } else if (this.fuzzyMatch(term, searchTerm, 0.8)) {
        score += 55;
      }
    }
    
    // Check ICD-10 codes
    for (const code of symptomEntry.icd10Codes) {
      if (code.toLowerCase() === normalizedSearch.replace(/\s/g, '')) {
        score += 90;
      }
    }
    
    // Multi-word matching
    if (words.length > 1) {
      const allTerms = [
        symptomEntry.symptom,
        ...symptomEntry.medicalTerms,
        ...symptomEntry.commonTerms
      ];
      
      for (const term of allTerms) {
        const termWords = this.normalizeText(term).split(' ');
        const matchedWords = words.filter(word => 
          termWords.some(termWord => 
            termWord.includes(word) || word.includes(termWord) || 
            this.fuzzyMatch(termWord, word, 0.8)
          )
        );
        
        if (matchedWords.length === words.length) {
          score += 60;
        } else if (matchedWords.length > words.length / 2) {
          score += 40;
        }
      }
    }
    
    // Urgency boost (reduced to prioritize relevance over urgency)
    switch (symptomEntry.urgency) {
      case 'emergency':
        score += 10;
        break;
      case 'high':
        score += 8;
        break;
      case 'medium':
        score += 5;
        break;
      case 'low':
        score += 2;
        break;
    }
    
    return score;
  }

  public static searchSymptoms(query: string, maxResults: number = 10): EnhancedSymptomEntry[] {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    const results = enhancedSymptomDatabase
      .map(entry => ({
        entry,
        score: this.calculateRelevanceScore(entry, query)
      }))
      .filter(result => result.score > 0)
      .sort((a, b) => {
        // Prioritize by urgency first, then by score
        const urgencyOrder = { emergency: 4, high: 3, medium: 2, low: 1 };
        const urgencyDiff = urgencyOrder[b.entry.urgency] - urgencyOrder[a.entry.urgency];
        
        if (urgencyDiff !== 0) {
          return urgencyDiff;
        }
        
        return b.score - a.score;
      })
      .slice(0, maxResults)
      .map(result => result.entry);
    
    return results;
  }

  public static searchByICD10(icd10Code: string): EnhancedSymptomEntry[] {
    return enhancedSymptomDatabase.filter(entry =>
      entry.icd10Codes.some(code => 
        code.toLowerCase() === icd10Code.toLowerCase()
      )
    );
  }

  public static getConditionsForSymptom(symptom: string): string[] {
    const results = this.searchSymptoms(symptom, 5);
    const conditions = new Set<string>();
    
    results.forEach(entry => {
      entry.conditions.forEach(condition => conditions.add(condition));
    });
    
    return Array.from(conditions);
  }

  public static getToolsForSymptom(symptom: string): string[] {
    const results = this.searchSymptoms(symptom, 5);
    const tools = new Set<string>();
    
    results.forEach(entry => {
      entry.commonTools.forEach(tool => tools.add(tool));
    });
    
    return Array.from(tools);
  }

  public static getRedFlags(symptom: string): string[] {
    const results = this.searchSymptoms(symptom, 1);
    return results.length > 0 && results[0].redFlags ? results[0].redFlags : [];
  }

  public static getDifferentials(symptom: string): string[] {
    const results = this.searchSymptoms(symptom, 1);
    return results.length > 0 && results[0].differentials ? results[0].differentials : [];
  }
}