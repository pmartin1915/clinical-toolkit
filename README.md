# Clinical Wizard 🩺

A comprehensive, evidence-based clinical reference application for healthcare professionals, students, and anyone interested in medical knowledge. This Progressive Web App (PWA) provides offline access to clinical guidelines, diagnostic tools, and evidence-based treatment protocols for common medical conditions.

## 🌟 Features

### 📱 **Progressive Web App (PWA)**
- **Offline functionality** - Works without internet connection
- **Installable** - Can be installed on mobile and desktop devices
- **Responsive design** - Optimized for all screen sizes
- **Fast loading** - Optimized for performance

### 🏥 **Clinical Conditions Covered**

| Condition | Category | Severity | Tools Available |
|-----------|----------|----------|-----------------|
| **Hypertension** | Cardiovascular | High | BP Tracker, ASCVD Calculator, Medication Guide |
| **Type 2 Diabetes** | Endocrine | High | A1C Converter, Medication Guide, Carb Counter |
| **Anxiety (GAD)** | Mental Health | Medium | GAD-7 Assessment, CBT Techniques, Crisis Resources |
| **Depression (MDD)** | Mental Health | High | PHQ-9 Screening, Mood Tracker, Suicide Risk Assessment |
| **Hypertriglyceridemia** | Metabolic | Medium | TG Calculator, Diet Planner, Medication Comparison |
| **Bacterial Rhinosinusitis** | Infectious | Low | Diagnostic Criteria, Antibiotic Guide, Symptom Tracker |
| **Urinary Tract Infections** | Infectious | Low | UTI Classification, Treatment Guide, Prevention Tips |

### 🧮 **Interactive Tools & Calculators**

#### **Working Tools:**
- **A1C to Glucose Converter** - Convert A1C percentage to estimated average glucose
- **GAD-7 Assessment** - Standardized anxiety screening questionnaire
- **PHQ-9 Assessment** - Depression screening with suicide risk evaluation
- **ASCVD Risk Calculator** - 10-year cardiovascular risk assessment
- **Blood Pressure Tracker** - Log and track BP readings with categorization

#### **Planned Tools (35+ total):**
- Risk calculators and clinical scoring systems
- Medication dosing calculators and interaction checkers  
- Patient education materials and handouts
- Symptom trackers and monitoring tools
- Treatment algorithms and decision trees

### 📖 **Evidence-Based Content**

Each condition includes:
- **Overview**: Definition, prevalence, key clinical points
- **Guidelines**: Current diagnostic criteria and treatment protocols
- **Tools**: Interactive calculators and assessment instruments
- **Resources**: Citations from major medical organizations (AHA, ADA, NICE, etc.)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pmartin1915/clinical-toolkit.git
   cd clinical-toolkit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built application will be in the `dist/` directory, ready for deployment.

## 🏗️ Architecture

### **Tech Stack**
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **PWA**: Vite PWA Plugin + Workbox
- **State Management**: React Hooks + Local Storage
- **Icons**: Lucide React

### **Project Structure**
```
src/
├── components/
│   ├── layout/          # Header, navigation components
│   ├── ui/              # Reusable UI components  
│   └── tools/           # Calculator and assessment tools
├── pages/               # Main application pages
├── data/
│   └── conditions/      # Clinical condition data files
├── types/               # TypeScript type definitions
└── utils/               # Helper functions
```

### **Data Architecture**
- **Condition-based organization** - Each medical condition is a self-contained module
- **Type-safe** - Full TypeScript definitions for clinical data
- **Extensible** - Easy to add new conditions and tools
- **Offline-first** - All data stored locally for offline access

## 📊 Usage Examples

### **For Healthcare Students**
- Study common conditions with evidence-based protocols
- Practice with interactive assessment tools (GAD-7, PHQ-9)
- Learn clinical decision-making with calculators
- Access current treatment guidelines

### **For Healthcare Providers**
- Quick reference for diagnostic criteria
- Clinical calculators for patient encounters
- Treatment algorithms and medication guides
- Patient education resources

### **For General Public**
- Understand medical conditions in accessible language
- Track health metrics (blood pressure, mood)
- Learn about treatment options
- Access reliable medical information

## 🔧 Development

### **Adding New Conditions**

1. Create condition data file in `src/data/conditions/`
2. Define clinical information following the `Condition` interface
3. Add to the conditions array in `src/pages/Dashboard.tsx`
4. Create associated tools in `src/components/tools/`

### **Adding New Tools**

1. Create tool component in `src/components/tools/`
2. Add to the tool switch statement in `src/pages/ConditionDetail.tsx`
3. Update condition data to include the new tool
4. Follow established patterns for calculations and UI

### **Key Design Principles**
- **Evidence-based**: All content sourced from reputable medical organizations
- **User-friendly**: Accessible to both medical professionals and general public
- **Accurate**: Careful attention to clinical accuracy and safety
- **Responsive**: Works seamlessly across all device types
- **Fast**: Optimized for quick loading and smooth interactions

## 📋 Current Status

### ✅ **Completed Features**
- [x] 7 comprehensive clinical conditions
- [x] 5 working interactive tools
- [x] PWA with offline functionality
- [x] Responsive design
- [x] Evidence-based clinical content
- [x] Search and filtering capabilities
- [x] Professional medical-grade UI

### 🔄 **In Progress**
- [ ] Additional calculator tools (30+ planned)
- [ ] Enhanced data visualization
- [ ] Export/import functionality
- [ ] User preferences and customization

### 🎯 **Future Enhancements**
- [ ] More clinical conditions
- [ ] Advanced tracking and analytics
- [ ] Integration with medical APIs
- [ ] Multilingual support
- [ ] Clinical decision support systems

## 📚 Clinical References

All medical content is based on current guidelines from:
- American Heart Association (AHA)
- American College of Cardiology (ACC)
- American Diabetes Association (ADA)
- American Psychological Association (APA)
- Infectious Diseases Society of America (IDSA)
- National Institute for Health and Care Excellence (NICE)

## ⚠️ Medical Disclaimer

**This application is for educational and informational purposes only.**

- Not intended to replace professional medical advice, diagnosis, or treatment
- Always seek advice from qualified healthcare providers
- Emergency medical situations require immediate professional care
- Calculated results are estimates and should be validated clinically
- Individual patient factors may significantly affect treatment decisions

## 🤝 Contributing

This project is developed for educational and clinical reference purposes. Contributions should maintain the highest standards of medical accuracy and evidence-based practice.

### **Contribution Guidelines**
1. All medical content must be sourced from reputable medical organizations
2. Include proper citations for clinical information
3. Follow established code patterns and TypeScript definitions
4. Ensure accessibility and responsive design
5. Test thoroughly across different devices and browsers

## 📞 Support & Feedback

For questions, suggestions, or clinical content discussions:
- **GitHub Issues**: Report bugs or request features
- **Medical Accuracy**: Please cite sources for any content corrections
- **Feature Requests**: Describe clinical use cases and evidence base

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for healthcare education and clinical practice**

*Last updated: August 2025*
