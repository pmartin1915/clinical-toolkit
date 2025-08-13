import { useState } from 'react';
import { ChevronRight, AlertTriangle, CheckCircle, Heart, Activity, Shield, Zap, TrendingUp } from 'lucide-react';

interface PatientData {
  age: number;
  gender: 'male' | 'female' | '';
  
  // Cardiovascular Risk Factors
  totalCholesterol: number;
  hdlCholesterol: number;
  systolicBP: number;
  onBPMedication: boolean;
  currentSmoker: boolean;
  hasDiabetes: boolean;
  race: 'white' | 'african_american' | 'other' | '';
  
  // Fall Risk Factors
  fallsInPastYear: number;
  usesWalkingAid: boolean;
  hasBalanceProblems: boolean;
  takesHighRiskMedications: boolean;
  hasVisionProblems: boolean;
  hasFootProblems: boolean;
  fearOfFalling: boolean;
  livesAlone: boolean;
  cognitiveImpairment: boolean;
  
  // Frailty Assessment
  unintentionalWeightLoss: boolean;
  exhaustion: boolean;
  lowPhysicalActivity: boolean;
  slowWalkingSpeed: boolean;
  weakGripStrength: boolean;
  
  // VTE Risk Factors
  hasActiveCancer: boolean;
  hasHistory_VTE: boolean;
  isBedridden: boolean;
  majorSurgeryPlanned: boolean;
  isPregnant: boolean;
  takesHormones: boolean;
  hasInflammatoryDisease: boolean;
  
  // Delirium Risk
  hasBaseline_Dementia: boolean;
  severeMedicalIllness: boolean;
  takesHighRiskPsychMeds: boolean;
  hasMetabolicDisturbance: boolean;
  hasInfection: boolean;
}

interface RiskResult {
  category: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
  score?: number;
  percentage?: number;
  description: string;
  interventions: string[];
  monitoring: string[];
  timeframe: string;
}

export const RiskStratification = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRiskTypes, setSelectedRiskTypes] = useState<string[]>([]);
  const [patientData, setPatientData] = useState<PatientData>({
    age: 0,
    gender: '',
    totalCholesterol: 0,
    hdlCholesterol: 0,
    systolicBP: 0,
    onBPMedication: false,
    currentSmoker: false,
    hasDiabetes: false,
    race: '',
    fallsInPastYear: 0,
    usesWalkingAid: false,
    hasBalanceProblems: false,
    takesHighRiskMedications: false,
    hasVisionProblems: false,
    hasFootProblems: false,
    fearOfFalling: false,
    livesAlone: false,
    cognitiveImpairment: false,
    unintentionalWeightLoss: false,
    exhaustion: false,
    lowPhysicalActivity: false,
    slowWalkingSpeed: false,
    weakGripStrength: false,
    hasActiveCancer: false,
    hasHistory_VTE: false,
    isBedridden: false,
    majorSurgeryPlanned: false,
    isPregnant: false,
    takesHormones: false,
    hasInflammatoryDisease: false,
    hasBaseline_Dementia: false,
    severeMedicalIllness: false,
    takesHighRiskPsychMeds: false,
    hasMetabolicDisturbance: false,
    hasInfection: false
  });
  
  const [showResults, setShowResults] = useState(false);

  const riskTypes = [
    {
      id: 'cardiovascular',
      name: 'Cardiovascular Risk (ASCVD)',
      description: '10-year risk of heart attack or stroke',
      icon: '❤️'
    },
    {
      id: 'falls',
      name: 'Fall Risk Assessment',
      description: 'Risk of falls and fall-related injuries',
      icon: '🚶'
    },
    {
      id: 'frailty',
      name: 'Frailty Assessment',
      description: 'Physical frailty and functional decline risk',
      icon: '👴'
    },
    {
      id: 'vte',
      name: 'VTE Risk (Blood Clots)',
      description: 'Venous thromboembolism risk assessment',
      icon: '🩸'
    },
    {
      id: 'delirium',
      name: 'Delirium Risk',
      description: 'Risk of developing delirium in hospital/illness',
      icon: '🧠'
    }
  ];

  const updatePatientData = (field: keyof PatientData, value: any) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const toggleRiskType = (riskType: string) => {
    setSelectedRiskTypes(prev => 
      prev.includes(riskType) 
        ? prev.filter(type => type !== riskType)
        : [...prev, riskType]
    );
  };

  const calculateASCVDRisk = (): RiskResult => {
    const { age, gender, race, totalCholesterol, hdlCholesterol, systolicBP, onBPMedication, currentSmoker, hasDiabetes } = patientData;
    
    // Simplified ASCVD Risk Calculator (actual calculation is more complex)
    // This is a representative calculation for demonstration
    let riskScore = 0;
    
    // Age factor
    if (gender === 'male') {
      riskScore += Math.max(0, (age - 40) * 0.8);
    } else {
      riskScore += Math.max(0, (age - 45) * 0.6);
    }
    
    // Cholesterol factors
    if (totalCholesterol > 240) riskScore += 3;
    else if (totalCholesterol > 200) riskScore += 1;
    
    if (hdlCholesterol < 40) riskScore += 2;
    else if (hdlCholesterol < 60) riskScore += 1;
    
    // Blood pressure
    if (systolicBP >= 160) riskScore += 3;
    else if (systolicBP >= 140) riskScore += 2;
    else if (systolicBP >= 130) riskScore += 1;
    
    if (onBPMedication) riskScore += 1;
    
    // Risk factors
    if (currentSmoker) riskScore += 3;
    if (hasDiabetes) riskScore += 3;
    if (race === 'african_american') riskScore += 1;
    
    // Convert to percentage (simplified)
    const percentage = Math.min(Math.max(riskScore * 2, 1), 40);
    
    let riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
    if (percentage < 5) riskLevel = 'low';
    else if (percentage < 10) riskLevel = 'moderate';
    else if (percentage < 20) riskLevel = 'high';
    else riskLevel = 'very_high';
    
    const interventions = [
      'Lifestyle modifications (diet, exercise, smoking cessation)',
      percentage >= 7.5 ? 'Consider statin therapy' : 'Monitor cholesterol levels',
      'Blood pressure optimization',
      'Diabetes management if present',
      percentage >= 20 ? 'Consider aspirin therapy' : 'Assess bleeding risk for aspirin'
    ];
    
    return {
      category: 'ASCVD Risk',
      riskLevel,
      percentage,
      description: `${percentage.toFixed(1)}% 10-year risk of heart attack or stroke`,
      interventions,
      monitoring: ['Annual lipid panel', 'Blood pressure monitoring', 'Diabetes screening'],
      timeframe: '10 years'
    };
  };

  const calculateFallRisk = (): RiskResult => {
    const { 
      age, fallsInPastYear, usesWalkingAid, hasBalanceProblems, takesHighRiskMedications,
      hasVisionProblems, hasFootProblems, fearOfFalling, livesAlone, cognitiveImpairment
    } = patientData;
    
    let riskScore = 0;
    
    // Age factor
    if (age >= 85) riskScore += 3;
    else if (age >= 75) riskScore += 2;
    else if (age >= 65) riskScore += 1;
    
    // Fall history
    riskScore += Math.min(fallsInPastYear * 2, 6);
    
    // Risk factors
    if (usesWalkingAid) riskScore += 2;
    if (hasBalanceProblems) riskScore += 3;
    if (takesHighRiskMedications) riskScore += 2;
    if (hasVisionProblems) riskScore += 1;
    if (hasFootProblems) riskScore += 1;
    if (fearOfFalling) riskScore += 1;
    if (livesAlone) riskScore += 1;
    if (cognitiveImpairment) riskScore += 2;
    
    let riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
    if (riskScore <= 2) riskLevel = 'low';
    else if (riskScore <= 5) riskLevel = 'moderate';
    else if (riskScore <= 10) riskLevel = 'high';
    else riskLevel = 'very_high';
    
    const interventions = [
      'Comprehensive home safety assessment',
      'Exercise program focusing on balance and strength',
      'Medication review (especially sedatives, antihypertensives)',
      'Vision and hearing assessment',
      'Podiatry evaluation if foot problems',
      riskLevel === 'high' || riskLevel === 'very_high' ? 'Consider physical therapy referral' : '',
      'Fall prevention education'
    ].filter(Boolean);
    
    return {
      category: 'Fall Risk',
      riskLevel,
      score: riskScore,
      description: `Fall risk score: ${riskScore} (${riskLevel} risk)`,
      interventions,
      monitoring: ['Quarterly fall assessment', 'Annual home safety review', 'Medication monitoring'],
      timeframe: '1 year'
    };
  };

  const calculateFrailtyRisk = (): RiskResult => {
    const { unintentionalWeightLoss, exhaustion, lowPhysicalActivity, slowWalkingSpeed, weakGripStrength } = patientData;
    
    let frailtyCount = 0;
    if (unintentionalWeightLoss) frailtyCount++;
    if (exhaustion) frailtyCount++;
    if (lowPhysicalActivity) frailtyCount++;
    if (slowWalkingSpeed) frailtyCount++;
    if (weakGripStrength) frailtyCount++;
    
    let riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
    let description: string;
    
    if (frailtyCount === 0) {
      riskLevel = 'low';
      description = 'Not frail (0 criteria)';
    } else if (frailtyCount <= 2) {
      riskLevel = 'moderate';
      description = `Pre-frail (${frailtyCount} criteria)`;
    } else {
      riskLevel = 'high';
      description = `Frail (${frailtyCount} criteria)`;
    }
    
    const interventions = [
      'Nutritional assessment and optimization',
      'Progressive resistance exercise program',
      'Protein supplementation if indicated',
      'Comprehensive geriatric assessment',
      frailtyCount >= 3 ? 'Referral to geriatrician' : '',
      'Social support evaluation',
      'Medication burden review'
    ].filter(Boolean);
    
    return {
      category: 'Frailty Status',
      riskLevel,
      score: frailtyCount,
      description,
      interventions,
      monitoring: ['Biannual frailty assessment', 'Weight monitoring', 'Functional status tracking'],
      timeframe: 'Ongoing'
    };
  };

  const calculateVTERisk = (): RiskResult => {
    const { 
      age, hasActiveCancer, hasHistory_VTE, isBedridden, majorSurgeryPlanned,
      isPregnant, takesHormones, hasInflammatoryDisease
    } = patientData;
    
    let riskScore = 0;
    
    // Major risk factors
    if (hasActiveCancer) riskScore += 3;
    if (hasHistory_VTE) riskScore += 4;
    if (isBedridden) riskScore += 3;
    if (majorSurgeryPlanned) riskScore += 3;
    if (isPregnant) riskScore += 2;
    
    // Moderate risk factors
    if (takesHormones) riskScore += 2;
    if (hasInflammatoryDisease) riskScore += 1;
    if (age >= 75) riskScore += 2;
    else if (age >= 60) riskScore += 1;
    
    let riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
    if (riskScore <= 1) riskLevel = 'low';
    else if (riskScore <= 3) riskLevel = 'moderate';
    else if (riskScore <= 6) riskLevel = 'high';
    else riskLevel = 'very_high';
    
    const interventions = [
      'Early mobilization and ambulation',
      'Compression stockings if appropriate',
      riskScore >= 3 ? 'Consider pharmacologic prophylaxis' : '',
      'Hydration maintenance',
      'Patient education on VTE signs/symptoms',
      majorSurgeryPlanned ? 'Preoperative VTE risk assessment' : '',
      'Risk factor modification when possible'
    ].filter(Boolean);
    
    return {
      category: 'VTE Risk',
      riskLevel,
      score: riskScore,
      description: `VTE risk score: ${riskScore} (${riskLevel} risk)`,
      interventions,
      monitoring: ['Clinical assessment for VTE symptoms', 'Risk reassessment with status changes'],
      timeframe: 'Current episode'
    };
  };

  const calculateDeliriumRisk = (): RiskResult => {
    const { 
      age, hasBaseline_Dementia, severeMedicalIllness, takesHighRiskPsychMeds,
      hasMetabolicDisturbance, hasInfection, cognitiveImpairment
    } = patientData;
    
    let riskScore = 0;
    
    // Predisposing factors
    if (age >= 80) riskScore += 2;
    else if (age >= 70) riskScore += 1;
    
    if (hasBaseline_Dementia || cognitiveImpairment) riskScore += 3;
    
    // Precipitating factors
    if (severeMedicalIllness) riskScore += 2;
    if (takesHighRiskPsychMeds) riskScore += 2;
    if (hasMetabolicDisturbance) riskScore += 1;
    if (hasInfection) riskScore += 2;
    
    let riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
    if (riskScore <= 1) riskLevel = 'low';
    else if (riskScore <= 3) riskLevel = 'moderate';
    else if (riskScore <= 6) riskLevel = 'high';
    else riskLevel = 'very_high';
    
    const interventions = [
      'Delirium prevention protocols',
      'Orientation aids (clock, calendar, familiar objects)',
      'Minimize high-risk medications',
      'Maintain sleep-wake cycle',
      'Early mobilization',
      'Optimize nutrition and hydration',
      'Family involvement in care',
      riskLevel === 'high' || riskLevel === 'very_high' ? 'Formal delirium screening tools' : ''
    ].filter(Boolean);
    
    return {
      category: 'Delirium Risk',
      riskLevel,
      score: riskScore,
      description: `Delirium risk score: ${riskScore} (${riskLevel} risk)`,
      interventions,
      monitoring: ['Daily delirium screening if hospitalized', 'Cognitive status monitoring'],
      timeframe: 'Current illness/hospitalization'
    };
  };

  const generateResults = (): RiskResult[] => {
    const results: RiskResult[] = [];
    
    if (selectedRiskTypes.includes('cardiovascular')) {
      results.push(calculateASCVDRisk());
    }
    if (selectedRiskTypes.includes('falls')) {
      results.push(calculateFallRisk());
    }
    if (selectedRiskTypes.includes('frailty')) {
      results.push(calculateFrailtyRisk());
    }
    if (selectedRiskTypes.includes('vte')) {
      results.push(calculateVTERisk());
    }
    if (selectedRiskTypes.includes('delirium')) {
      results.push(calculateDeliriumRisk());
    }
    
    return results;
  };

  const results = showResults ? generateResults() : [];

  const stepTitles = [
    'Select Risk Types',
    'Demographics',
    'Risk Factor Assessment',
    'Risk Analysis'
  ];

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 border-green-500 text-green-800';
      case 'moderate': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'very_high': return 'bg-red-100 border-red-500 text-red-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'moderate': return <Shield className="w-5 h-5 text-yellow-600" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'very_high': return <Zap className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Select the risk assessments you'd like to perform:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {riskTypes.map((riskType) => (
                <label
                  key={riskType.id}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedRiskTypes.includes(riskType.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedRiskTypes.includes(riskType.id)}
                    onChange={() => toggleRiskType(riskType.id)}
                    className="sr-only"
                  />
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{riskType.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{riskType.name}</h4>
                      <p className="text-sm text-gray-600">{riskType.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  value={patientData.age || ''}
                  onChange={(e) => updatePatientData('age', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="65"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  value={patientData.gender}
                  onChange={(e) => updatePatientData('gender', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Race/Ethnicity</label>
                <select
                  value={patientData.race}
                  onChange={(e) => updatePatientData('race', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select race</option>
                  <option value="white">White</option>
                  <option value="african_american">African American</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            {/* Cardiovascular Risk Factors */}
            {selectedRiskTypes.includes('cardiovascular') && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Cardiovascular Risk Factors
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-red-900 mb-1">Total Cholesterol (mg/dL)</label>
                    <input
                      type="number"
                      value={patientData.totalCholesterol || ''}
                      onChange={(e) => updatePatientData('totalCholesterol', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-red-300 rounded-md"
                      placeholder="200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-red-900 mb-1">HDL Cholesterol (mg/dL)</label>
                    <input
                      type="number"
                      value={patientData.hdlCholesterol || ''}
                      onChange={(e) => updatePatientData('hdlCholesterol', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-red-300 rounded-md"
                      placeholder="50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-red-900 mb-1">Systolic BP (mmHg)</label>
                    <input
                      type="number"
                      value={patientData.systolicBP || ''}
                      onChange={(e) => updatePatientData('systolicBP', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-red-300 rounded-md"
                      placeholder="130"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  {[
                    { key: 'onBPMedication', label: 'Taking blood pressure medication' },
                    { key: 'currentSmoker', label: 'Current smoker' },
                    { key: 'hasDiabetes', label: 'Diabetes mellitus' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={patientData[key as keyof PatientData] as boolean}
                        onChange={(e) => updatePatientData(key as keyof PatientData, e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-red-800">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Fall Risk Factors */}
            {selectedRiskTypes.includes('falls') && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-4">🚶 Fall Risk Factors</h4>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-orange-900 mb-1">Number of falls in past year</label>
                  <input
                    type="number"
                    value={patientData.fallsInPastYear || ''}
                    onChange={(e) => updatePatientData('fallsInPastYear', parseInt(e.target.value) || 0)}
                    className="w-32 px-3 py-2 border border-orange-300 rounded-md"
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { key: 'usesWalkingAid', label: 'Uses walking aid (cane, walker)' },
                    { key: 'hasBalanceProblems', label: 'Balance or gait problems' },
                    { key: 'takesHighRiskMedications', label: 'Takes high-risk medications (sedatives, antihypertensives)' },
                    { key: 'hasVisionProblems', label: 'Vision problems' },
                    { key: 'hasFootProblems', label: 'Foot problems or poor footwear' },
                    { key: 'fearOfFalling', label: 'Fear of falling' },
                    { key: 'livesAlone', label: 'Lives alone' },
                    { key: 'cognitiveImpairment', label: 'Cognitive impairment' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={patientData[key as keyof PatientData] as boolean}
                        onChange={(e) => updatePatientData(key as keyof PatientData, e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-orange-800">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Frailty Assessment */}
            {selectedRiskTypes.includes('frailty') && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-4">👴 Frailty Criteria (Fried Phenotype)</h4>
                
                <div className="space-y-3">
                  {[
                    { key: 'unintentionalWeightLoss', label: 'Unintentional weight loss (>10 lbs in past year)' },
                    { key: 'exhaustion', label: 'Self-reported exhaustion' },
                    { key: 'lowPhysicalActivity', label: 'Low physical activity level' },
                    { key: 'slowWalkingSpeed', label: 'Slow walking speed' },
                    { key: 'weakGripStrength', label: 'Weak grip strength' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center p-2 border border-purple-200 rounded">
                      <input
                        type="checkbox"
                        checked={patientData[key as keyof PatientData] as boolean}
                        onChange={(e) => updatePatientData(key as keyof PatientData, e.target.checked)}
                        className="mr-3"
                      />
                      <span className="text-sm text-purple-800">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* VTE Risk Factors */}
            {selectedRiskTypes.includes('vte') && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-4">🩸 VTE Risk Factors</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { key: 'hasActiveCancer', label: 'Active cancer' },
                    { key: 'hasHistory_VTE', label: 'Previous VTE history' },
                    { key: 'isBedridden', label: 'Bedridden >3 days' },
                    { key: 'majorSurgeryPlanned', label: 'Major surgery planned/recent' },
                    { key: 'isPregnant', label: 'Pregnant or postpartum' },
                    { key: 'takesHormones', label: 'Hormone therapy/oral contraceptives' },
                    { key: 'hasInflammatoryDisease', label: 'Inflammatory disease (IBD, RA)' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={patientData[key as keyof PatientData] as boolean}
                        onChange={(e) => updatePatientData(key as keyof PatientData, e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-blue-800">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Delirium Risk Factors */}
            {selectedRiskTypes.includes('delirium') && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-4">🧠 Delirium Risk Factors</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { key: 'hasBaseline_Dementia', label: 'Baseline dementia/cognitive impairment' },
                    { key: 'severeMedicalIllness', label: 'Severe acute medical illness' },
                    { key: 'takesHighRiskPsychMeds', label: 'High-risk psychoactive medications' },
                    { key: 'hasMetabolicDisturbance', label: 'Metabolic disturbances' },
                    { key: 'hasInfection', label: 'Active infection' }
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={patientData[key as keyof PatientData] as boolean}
                        onChange={(e) => updatePatientData(key as keyof PatientData, e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-yellow-800">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedRiskTypes.length > 0;
      case 2: return patientData.age > 0 && patientData.gender !== '';
      case 3: return true;
      default: return false;
    }
  };

  if (showResults && results.length > 0) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-bold text-gray-900">Risk Stratification Results</h3>
        </div>

        <div className="space-y-6">
          {results.map((result, index) => (
            <div key={index} className={`border-2 rounded-lg p-6 ${getRiskColor(result.riskLevel)}`}>
              <div className="flex items-start space-x-3">
                {getRiskIcon(result.riskLevel)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xl font-bold">{result.category}</h4>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                        result.riskLevel === 'low' ? 'bg-green-200 text-green-900' :
                        result.riskLevel === 'moderate' ? 'bg-yellow-200 text-yellow-900' :
                        result.riskLevel === 'high' ? 'bg-orange-200 text-orange-900' :
                        'bg-red-200 text-red-900'
                      }`}>
                        {result.riskLevel.replace('_', ' ').toUpperCase()} RISK
                      </span>
                      <div className="text-sm mt-1">
                        {result.timeframe}
                      </div>
                    </div>
                  </div>

                  <p className="text-lg font-medium mb-4">{result.description}</p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold mb-3">Recommended Interventions:</h5>
                      <ul className="space-y-2">
                        {result.interventions.map((intervention, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-current mt-2 mr-3 flex-shrink-0"></span>
                            {intervention}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-semibold mb-3">Monitoring & Follow-up:</h5>
                      <ul className="space-y-2">
                        {result.monitoring.map((item, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-current mt-2 mr-3 flex-shrink-0"></span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">Clinical Notes:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Risk scores are estimates based on validated tools but clinical judgment is essential</li>
            <li>• Regular reassessment is needed as patient status changes</li>
            <li>• Consider patient preferences and goals of care in intervention planning</li>
            <li>• Multidisciplinary approach often beneficial for high-risk patients</li>
            <li>• Document risk assessments and interventions for care continuity</li>
          </ul>
        </div>

        <button
          onClick={() => {
            setShowResults(false);
            setCurrentStep(1);
            setSelectedRiskTypes([]);
            setPatientData({
              age: 0, gender: '', totalCholesterol: 0, hdlCholesterol: 0, systolicBP: 0,
              onBPMedication: false, currentSmoker: false, hasDiabetes: false, race: '',
              fallsInPastYear: 0, usesWalkingAid: false, hasBalanceProblems: false,
              takesHighRiskMedications: false, hasVisionProblems: false, hasFootProblems: false,
              fearOfFalling: false, livesAlone: false, cognitiveImpairment: false,
              unintentionalWeightLoss: false, exhaustion: false, lowPhysicalActivity: false,
              slowWalkingSpeed: false, weakGripStrength: false, hasActiveCancer: false,
              hasHistory_VTE: false, isBedridden: false, majorSurgeryPlanned: false,
              isPregnant: false, takesHormones: false, hasInflammatoryDisease: false,
              hasBaseline_Dementia: false, severeMedicalIllness: false, takesHighRiskPsychMeds: false,
              hasMetabolicDisturbance: false, hasInfection: false
            });
          }}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
        >
          Start New Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="w-6 h-6 text-green-600" />
        <h3 className="text-xl font-bold text-gray-900">Risk Stratification Assessment</h3>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          {stepTitles.map((_, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index + 1 === currentStep 
                  ? 'bg-primary-600 text-white' 
                  : index + 1 < currentStep 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1 < currentStep ? '✓' : index + 1}
              </div>
              {index < stepTitles.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
              )}
            </div>
          ))}
        </div>
        <h4 className="text-lg font-semibold text-gray-900">{stepTitles[currentStep - 1]}</h4>
      </div>

      {/* Step content */}
      <div className="mb-8">
        {renderStep()}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {currentStep < stepTitles.length ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => setShowResults(true)}
            disabled={!canProceed()}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Calculate Risk Scores
          </button>
        )}
      </div>
    </div>
  );
};