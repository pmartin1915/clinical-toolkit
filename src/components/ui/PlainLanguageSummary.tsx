import { Info, Heart, MessageCircle } from 'lucide-react';

interface PlainLanguageSummaryProps {
  conditionId: string;
}

const simpleSummaries: Record<string, {
  what: string;
  whyCare: string;
  whatToDo: string[];
  whenToWorry: string[];
}> = {
  hypertension: {
    what: "High blood pressure means your heart is working harder than it should to pump blood through your body. Think of it like a garden hose with too much pressure - it can damage the hose over time.",
    whyCare: "High blood pressure can quietly damage your heart, brain, kidneys, and eyes over many years. The good news? It's very manageable with the right approach.",
    whatToDo: [
      "Take any prescribed medications every day, even if you feel fine",
      "Eat less salt (aim for less than a teaspoon per day)",
      "Move your body for 30 minutes most days - walking counts!",
      "Keep a healthy weight",
      "Limit alcohol and don't smoke"
    ],
    whenToWorry: [
      "Blood pressure readings consistently over 180/120",
      "Severe headaches that don't go away",
      "Chest pain or trouble breathing",
      "Vision changes or severe dizziness"
    ]
  },
  diabetes: {
    what: "Type 2 diabetes means your body has trouble using sugar (glucose) properly. It's like having a key that doesn't quite fit the lock - the sugar can't get into your cells where it's needed.",
    whyCare: "Over time, high blood sugar can damage your blood vessels, nerves, kidneys, and eyes. But with good management, people with diabetes live full, healthy lives.",
    whatToDo: [
      "Check your blood sugar as recommended by your doctor",
      "Take medications as prescribed",
      "Eat regular, balanced meals - focus on vegetables, lean proteins, and whole grains",
      "Stay active - even a 10-minute walk after meals helps",
      "Keep regular doctor appointments for check-ups"
    ],
    whenToWorry: [
      "Blood sugar over 300 mg/dL",
      "Persistent vomiting or can't keep fluids down",
      "Signs of infection that won't heal",
      "Sudden vision changes"
    ]
  },
  anxiety: {
    what: "Anxiety disorders involve excessive worry or fear that interferes with daily life. It's your brain's alarm system being overly sensitive - like a smoke detector that goes off when you're just making toast.",
    whyCare: "Anxiety is very common and very treatable. With the right support and strategies, you can feel significantly better and regain control.",
    whatToDo: [
      "Practice deep breathing: breathe in for 4 counts, hold for 4, out for 4",
      "Challenge worried thoughts: ask 'Is this likely to happen? What would I tell a friend?'",
      "Stay active - exercise is a natural anxiety reducer",
      "Limit caffeine and alcohol",
      "Consider therapy - it's one of the most effective treatments"
    ],
    whenToWorry: [
      "Thoughts of hurting yourself or others",
      "Can't function at work, school, or home",
      "Panic attacks happening frequently",
      "Avoiding many normal activities due to anxiety"
    ]
  },
  depression: {
    what: "Depression is more than feeling sad - it's a medical condition that affects how you think, feel, and handle daily activities. Think of it like having the flu, but for your emotions and energy.",
    whyCare: "Depression is a real medical condition, not a personal weakness. With proper treatment, most people feel significantly better within a few months.",
    whatToDo: [
      "Stick to daily routines, even small ones",
      "Try to move your body daily, even if it's just a short walk",
      "Connect with supportive family or friends",
      "Consider therapy - talking helps more than you might think",
      "Take medications as prescribed if recommended"
    ],
    whenToWorry: [
      "Thoughts of death or suicide",
      "Can't get out of bed or take care of basic needs",
      "Using alcohol or drugs to cope",
      "Symptoms getting worse despite treatment"
    ]
  },
  copd: {
    what: "COPD (Chronic Obstructive Pulmonary Disease) makes it harder to breathe because your airways are inflamed and damaged. Imagine trying to breathe through a straw that keeps getting narrower.",
    whyCare: "While COPD can't be cured, the right treatment can help you breathe easier, stay active, and prevent it from getting worse quickly.",
    whatToDo: [
      "Take your medications exactly as prescribed - they help keep airways open",
      "Quit smoking if you haven't already - this is the most important thing you can do",
      "Stay active with light exercise like walking",
      "Get vaccinated against flu and pneumonia",
      "Use techniques to save your energy for activities you enjoy"
    ],
    whenToWorry: [
      "Sudden worsening of breathing or wheezing",
      "Coughing up blood or unusual amounts of mucus",
      "Fever with breathing problems",
      "Can't speak in full sentences due to breathlessness"
    ]
  },
  'heart-failure': {
    what: "Heart failure means your heart isn't pumping blood as well as it should. It's not that your heart has 'failed' - think of it more like a car engine that needs tune-ups to run efficiently.",
    whyCare: "With the right medications, lifestyle changes, and monitoring, many people with heart failure live active, fulfilling lives for many years.",
    whatToDo: [
      "Take medications as prescribed - they help your heart work more efficiently",
      "Weigh yourself daily and track fluid intake",
      "Limit salt to less than 2 grams per day",
      "Stay active with light exercise as approved by your doctor",
      "Keep regular doctor appointments for monitoring"
    ],
    whenToWorry: [
      "Sudden weight gain (3+ pounds in 2 days)",
      "Severe shortness of breath or can't lie flat",
      "Chest pain or rapid heartbeat",
      "Swelling in legs, feet, or abdomen that's getting worse"
    ]
  },
  uti: {
    what: "A urinary tract infection (UTI) happens when bacteria get into your urinary system and cause irritation. Think of it like unwelcome guests causing trouble in your plumbing system.",
    whyCare: "While UTIs are common and usually not serious, they can be very uncomfortable and may lead to kidney problems if left untreated.",
    whatToDo: [
      "Drink plenty of water to help flush out bacteria",
      "Take antibiotics exactly as prescribed if given",
      "Urinate frequently and don't hold it in",
      "Wipe from front to back after using the bathroom",
      "Avoid irritating products like douches or strong soaps"
    ],
    whenToWorry: [
      "Fever, chills, or severe back pain",
      "Blood in urine or very dark/cloudy urine",
      "Vomiting or can't keep fluids down",
      "Symptoms getting worse despite treatment"
    ]
  },
  rhinosinusitis: {
    what: "Rhinosinusitis (or sinus infection) is when the spaces around your nose become swollen and inflamed. It's like having congested traffic in the tunnels around your nose.",
    whyCare: "Most sinus infections get better on their own, but some may need treatment to prevent complications or help you feel better faster.",
    whatToDo: [
      "Use saline rinses or sprays to keep nasal passages moist",
      "Apply warm compresses to your face for comfort",
      "Stay hydrated with plenty of fluids",
      "Rest and let your body heal",
      "Take over-the-counter pain relievers if needed"
    ],
    whenToWorry: [
      "Severe headache or facial pain that gets worse",
      "High fever (over 101.3°F) or symptoms lasting over 10 days",
      "Changes in vision or severe eye pain",
      "Symptoms that improve then suddenly get much worse"
    ]
  },
  hypertriglyceridemia: {
    what: "High triglycerides means you have too much of a certain type of fat in your blood. Think of it like having too much oil mixed in with your blood, which can clog up your body's pipes.",
    whyCare: "High triglycerides increase your risk of heart disease and can sometimes cause serious pancreas problems. The good news is it's very responsive to lifestyle changes.",
    whatToDo: [
      "Limit sugary foods and drinks - these raise triglycerides quickly",
      "Choose healthy fats like fish, nuts, and olive oil",
      "Exercise regularly - even walking helps a lot",
      "Limit alcohol or avoid it completely",
      "Maintain a healthy weight"
    ],
    whenToWorry: [
      "Severe abdominal pain that doesn't go away",
      "Triglyceride levels over 1000 mg/dL",
      "Signs of diabetes (excessive thirst, frequent urination)",
      "Chest pain or signs of heart problems"
    ]
  }
};

export const PlainLanguageSummary = ({ conditionId }: PlainLanguageSummaryProps) => {
  const summary = simpleSummaries[conditionId];
  
  if (!summary) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <div className="bg-blue-100 p-2 rounded-full">
          <MessageCircle className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">In Simple Terms</h2>
        <div className="bg-blue-100 px-2 py-1 rounded-full">
          <span className="text-xs font-medium text-blue-700">Easy to understand</span>
        </div>
      </div>

      <div className="space-y-5">
        {/* What is it? */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2 flex items-center">
            <Info className="w-4 h-4 text-blue-600 mr-2" />
            What is this condition?
          </h3>
          <p className="text-gray-700 leading-relaxed">{summary.what}</p>
        </div>

        {/* Why should I care? */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2 flex items-center">
            <Heart className="w-4 h-4 text-red-500 mr-2" />
            Why should I care about it?
          </h3>
          <p className="text-gray-700 leading-relaxed">{summary.whyCare}</p>
        </div>

        {/* What can I do? */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">✅ What can I do to help myself?</h3>
          <ul className="space-y-2">
            {summary.whatToDo.map((action, index) => (
              <li key={index} className="flex items-start">
                <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-gray-700 leading-relaxed">{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* When to worry */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-900 mb-3">� When to seek immediate help:</h3>
          <ul className="space-y-2">
            {summary.whenToWorry.map((warning, index) => (
              <li key={index} className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-red-800 leading-relaxed">{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Remember:</strong> This is general information. Always follow your doctor's specific advice for your situation.
        </p>
      </div>
    </div>
  );
};