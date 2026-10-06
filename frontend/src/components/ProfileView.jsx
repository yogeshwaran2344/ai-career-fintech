import React, { useState } from 'react';
import { 
  UserCircle, 
  GraduationCap, 
  Code, 
  Wallet, 
  Clock, 
  Sparkles, 
  Save, 
  RotateCcw, 
  Sliders,
  CheckCircle
} from 'lucide-react';
import { api } from '../api';

export default function ProfileView({ profile, onSaveProfile, onReset }) {
  const [formData, setFormData] = useState(profile);
  const [intentText, setIntentText] = useState(profile?.preferences?.free_text_intent || '');
  const [isParsingIntent, setIsParsingIntent] = useState(false);
  const [intentInsights, setIntentInsights] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleAcademicChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      academic: { ...prev.academic, [field]: value }
    }));
  };

  const handleFinancialChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      financial: { ...prev.financial, [field]: Number(value) }
    }));
  };

  const handlePreferencesChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, [field]: value }
    }));
  };

  const handleSkillChange = (skillName, newProficiency) => {
    const updated = formData.skills.map((s) => {
      if (s.name.toLowerCase() === skillName.toLowerCase()) {
        const prof = Number(newProficiency);
        let level = 'Beginner';
        if (prof >= 7.5) level = 'Advanced';
        else if (prof >= 4.0) level = 'Intermediate';
        return { ...s, proficiency: prof, level };
      }
      return s;
    });
    setFormData((prev) => ({ ...prev, skills: updated }));
  };

  const handleParseIntent = async () => {
    if (!intentText.trim()) return;
    setIsParsingIntent(true);
    try {
      const res = await api.parseIntent(intentText);
      setIntentInsights(res);
      setFormData((prev) => ({
        ...prev,
        career_goal: res.interpreted_goal.includes('AI') ? 'AI Engineer' : (res.interpreted_goal.includes('Data') ? 'Data Scientist' : prev.career_goal),
        preferences: { ...prev.preferences, free_text_intent: intentText }
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsingIntent(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveProfile(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white advisor-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-orange-500">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-orange-100 text-orange-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Student Profile Configuration
            </span>
            <span className="text-xs text-stone-500">Adaptive AI Knowledge Graph</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 mt-1">
            Edit Student Profile & Preferences
          </h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Updating your skill matrix, financial allowance, or study hours automatically re-evaluates all career and decision roadmaps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? 'Saved & Recalculated!' : 'Save & Recalculate'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Academic + Target Goal & Intent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Academic Details */}
        <div className="advisor-card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <GraduationCap className="w-4 h-4 text-orange-600" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Academic Information</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Student Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Degree</label>
              <input
                type="text"
                value={formData.academic.degree}
                onChange={(e) => handleAcademicChange('degree', e.target.value)}
                className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Branch / Major</label>
              <input
                type="text"
                value={formData.academic.branch}
                onChange={(e) => handleAcademicChange('branch', e.target.value)}
                className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Academic Year</label>
              <input
                type="text"
                value={formData.academic.year}
                onChange={(e) => handleAcademicChange('year', e.target.value)}
                className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">CGPA</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.academic.cgpa}
                onChange={(e) => handleAcademicChange('cgpa', Number(e.target.value))}
                className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Target Placement Year</label>
              <input
                type="number"
                value={formData.preferences.target_placement_year}
                onChange={(e) => handlePreferencesChange('target_placement_year', Number(e.target.value))}
                className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
              />
            </div>
          </div>
        </div>

        {/* Target Career & Free-Text Intent */}
        <div className="advisor-card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">Target Goal & AI Intent Parser</h3>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Target Career Role</label>
            <select
              value={formData.career_goal}
              onChange={(e) => setFormData({ ...formData, career_goal: e.target.value })}
              className="w-full text-xs p-2 bg-white border border-stone-300 rounded-lg font-bold text-stone-900"
            >
              <optgroup label="AI, Machine Learning & Data">
                <option value="AI Engineer">AI Engineer</option>
                <option value="ML Engineer">ML Engineer</option>
                <option value="Generative AI & LLM Engineer">Generative AI & LLM Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Data Engineer">Data Engineer</option>
              </optgroup>
              <optgroup label="Software Engineering, Cloud & Security">
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Backend Systems Engineer">Backend Systems Engineer</option>
                <option value="Cloud & DevOps Engineer">Cloud & DevOps Engineer</option>
                <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                <option value="Mobile App Developer (Flutter/React Native)">Mobile App Developer (Flutter/React Native)</option>
              </optgroup>
              <optgroup label="Electronics, Embedded & Hardware">
                <option value="Embedded Systems & IoT Engineer">Embedded Systems & IoT Engineer</option>
                <option value="VLSI & Chip Design Engineer">VLSI & Chip Design Engineer</option>
                <option value="Robotics & Automation Engineer">Robotics & Automation Engineer</option>
              </optgroup>
              <optgroup label="Core Engineering (Mechanical / Civil)">
                <option value="CAD / CAE Simulation Engineer">CAD / CAE Simulation Engineer</option>
                <option value="BIM & Smart Infrastructure Engineer">BIM & Smart Infrastructure Engineer</option>
              </optgroup>
              <optgroup label="Business, Finance & Analytics">
                <option value="Business & Product Analyst">Business & Product Analyst</option>
                <option value="Quantitative Financial Analyst">Quantitative Financial Analyst</option>
                <option value="Financial Risk Analyst">Financial Risk Analyst</option>
                <option value="Fintech Product Manager">Fintech Product Manager</option>
                <option value="Digital Marketing & Growth Analyst">Digital Marketing & Growth Analyst</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">
              Free-Text Career Intent (LLM Natural Language Understanding)
            </label>
            <textarea
              rows="3"
              value={intentText}
              onChange={(e) => setIntentText(e.target.value)}
              placeholder="e.g. I want to work in AI but I'm not sure whether I should learn data science or ML engineering."
              className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            ></textarea>
            <button
              type="button"
              onClick={handleParseIntent}
              disabled={isParsingIntent}
              className="mt-2 w-full py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isParsingIntent ? 'Analyzing Intent with LLM...' : 'Analyze Intent with AI'}</span>
            </button>
          </div>

          {intentInsights && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 space-y-1.5 text-xs">
              <span className="font-bold text-amber-950 block">AI Intent Analysis:</span>
              <p className="text-stone-700 font-medium">{intentInsights.suggested_focus}</p>
              <ul className="space-y-1 pt-1">
                {intentInsights.insights.map((ins, idx) => (
                  <li key={idx} className="text-[11px] text-stone-600 flex items-start gap-1">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{ins}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* SECTION: SKILL PROFICIENCY MATRIX (SLIDERS) */}
      <div className="advisor-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-orange-600" />
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Technical Skill Proficiency Sliders (0 - 10)
            </h3>
          </div>
          <span className="text-xs text-stone-500">
            Slide to update and trigger immediate re-evaluation
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {formData.skills.map((s) => (
            <div key={s.name} className="p-3 bg-stone-50/80 rounded-xl border border-stone-200/70 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-stone-900">{s.name}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  s.proficiency >= 7.5 ? 'bg-emerald-100 text-emerald-800' : (s.proficiency >= 4.0 ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-700')
                }`}>
                  {s.proficiency}/10 ({s.level})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={s.proficiency}
                onChange={(e) => handleSkillChange(s.name, e.target.value)}
                className="w-full accent-orange-500 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* SECTION: FINANCIAL NUMBERS & STUDY TIME */}
      <div className="advisor-card p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <Wallet className="w-4 h-4 text-orange-600" />
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
            Financial Profile & Study Capacity
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Monthly Income (₹)</label>
            <input
              type="number"
              step="500"
              value={formData.financial.monthly_income}
              onChange={(e) => handleFinancialChange('monthly_income', e.target.value)}
              className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Available for Learning (₹/mo)</label>
            <input
              type="number"
              step="100"
              value={formData.financial.available_for_learning}
              onChange={(e) => handleFinancialChange('available_for_learning', e.target.value)}
              className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg text-orange-600 font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Daily Study Time (hrs/day)</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="12"
              value={formData.preferences.study_hours_per_day}
              onChange={(e) => handlePreferencesChange('study_hours_per_day', Number(e.target.value))}
              className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 block mb-1">Learning Style</label>
            <select
              value={formData.preferences.preferred_learning_style}
              onChange={(e) => handlePreferencesChange('preferred_learning_style', e.target.value)}
              className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
            >
              <option value="Video">Video Based</option>
              <option value="Hands-on / Projects">Hands-on / Projects</option>
              <option value="Reading">Documentation / Reading</option>
              <option value="Hybrid">Hybrid Multi-Modal</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="text-xs text-stone-600 block mb-1">Food Expenses (₹)</label>
            <input
              type="number"
              step="100"
              value={formData.financial.food}
              onChange={(e) => handleFinancialChange('food', e.target.value)}
              className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
            />
          </div>
          <div>
            <label className="text-xs text-stone-600 block mb-1">Travel Expenses (₹)</label>
            <input
              type="number"
              step="100"
              value={formData.financial.travel}
              onChange={(e) => handleFinancialChange('travel', e.target.value)}
              className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
            />
          </div>
          <div>
            <label className="text-xs text-stone-600 block mb-1">Entertainment (₹)</label>
            <input
              type="number"
              step="100"
              value={formData.financial.entertainment}
              onChange={(e) => handleFinancialChange('entertainment', e.target.value)}
              className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
            />
          </div>
          <div>
            <label className="text-xs text-stone-600 block mb-1">Other Expenses (₹)</label>
            <input
              type="number"
              step="100"
              value={formData.financial.other}
              onChange={(e) => handleFinancialChange('other', e.target.value)}
              className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
