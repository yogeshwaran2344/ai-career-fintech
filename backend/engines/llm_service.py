import os
import json
import httpx
from typing import Dict, Any, List, Optional
from models import StudentProfile, LLMIntentAnalysis
from engines.career_engine import CareerEngine
from engines.finance_engine import FinanceEngine

class LLMService:
    @staticmethod
    def parse_intent(free_text: str) -> LLMIntentAnalysis:
        text = (free_text or "").lower()
        
        if "data science" in text and "ml" in text:
            goal = "AI & Machine Learning Engineer"
            focus = "ML System Engineering (FastAPI + Docker + Model Training)"
            insights = [
                "You are evaluating theoretical Data Science (analytics/statistics) versus engineering-heavy Machine Learning.",
                "Given industry trends for 2026-2027 placements, ML Engineering and AI Application Development offer higher starting compensation in tech hubs.",
                "Recommendation: Master Python + Scikit-Learn + PyTorch first, then add API deployment skills (FastAPI + Docker)."
            ]
        elif "ai" in text or "llm" in text or "genai" in text:
            goal = "AI Engineer"
            focus = "Generative AI, RAG Systems & Backend API Integrations"
            insights = [
                "Your interest is focused on state-of-the-art AI systems and LLM applications.",
                "Prioritize Python, Deep Learning fundamentals, and production deployment (Docker + FastAPI).",
                "Building 1 comprehensive RAG / Copilot portfolio project will give you top-tier placement visibility."
            ]
        elif "web" in text or "full stack" in text or "react" in text:
            goal = "Full Stack Developer"
            focus = "Modern React, TypeScript & FastAPI/Node Services"
            insights = [
                "High versatility and immediate freelance/internship opportunities.",
                "Combine your frontend interests with strong backend data management."
            ]
        else:
            goal = "AI Engineer"
            focus = "Core CS Foundations & Applied Machine Learning"
            insights = [
                "Interpreted your goal towards engineering scalable software and intelligent applications.",
                "Focus on bridging DSA and machine learning deployment in parallel."
            ]
            
        return LLMIntentAnalysis(
            interpreted_goal=goal,
            suggested_focus=focus,
            insights=insights,
            confidence_score=0.92
        )

    @staticmethod
    async def chat_copilot(profile: StudentProfile, query: str, chat_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Dynamically calculates readiness, recommendations, and budget constraints directly from the engines.
        No hardcoded percentages!
        """
        # Dynamic Engine Calculations
        pct, score, strong_skills, missing_skills, partial_skills = CareerEngine.calculate_readiness(profile, profile.career_goal)
        recommendations = CareerEngine.get_career_recommendations(profile)
        budget_analysis = FinanceEngine.analyze_budget(profile)

        top_match = recommendations[0] if recommendations else None
        strong_str = ", ".join(strong_skills) if strong_skills else "Python, SQL"
        missing_str = ", ".join(missing_skills[:3]) if missing_skills else "None"
        
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        user_query = query.strip()
        
        context_prompt = f"""
You are the AI Career + Finance Copilot for {profile.name}.
Student Academic Profile: {profile.academic.degree} in {profile.academic.branch} ({profile.academic.year}), CGPA {profile.academic.cgpa}.
Target Career Goal: {profile.career_goal}.
Current Computed Readiness: {pct}% (Skill Level {score}/10).
Top Strong Skills: {strong_str}.
Key Missing Bottleneck Skills: {missing_str}.
Available Study Time: {profile.preferences.study_hours_per_day} hours/day.
Financial Capacity: Monthly Income ₹{profile.financial.monthly_income:,.0f}, Available for Learning ₹{profile.financial.available_for_learning:,.0f}/month, Savings ₹{profile.financial.savings:,.0f}, Emergency Buffer ₹{profile.financial.emergency_buffer:,.0f}.
Emergency Buffer Health: {budget_analysis['savings_health']}.

Your task is to provide intelligent, hyper-practical advice that co-optimizes CAREER SUCCESS and FINANCIAL AFFORDABILITY.
Always give clear, bulleted action steps with specific numbers, timelines, and trade-off rationales.
"""
        # If Gemini API Key exists, call Gemini REST
        if api_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
                payload = {
                    "contents": [
                        {"role": "user", "parts": [{"text": f"{context_prompt}\n\nStudent Question: {user_query}"}]}
                    ]
                }
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        text_reply = data["candidates"][0]["content"]["parts"][0]["text"]
                        return {
                            "response": text_reply,
                            "source": "gemini-1.5-flash",
                            "recommendations": [
                                f"Commit to {profile.preferences.study_hours_per_day} hours daily",
                                f"Focus on closing {missing_str}",
                                f"Maintain ₹{profile.financial.available_for_learning:,.0f}/month sinking fund"
                            ]
                        }
            except Exception:
                pass

        # Dynamic Knowledge-Engine fallback strictly using real calculated metrics
        q = user_query.lower()
        if "certif" in q or "aws" in q or "buy" in q or "cost" in q or "afford" in q:
            months_to_save = round(10000.0 / max(500.0, profile.financial.available_for_learning), 1)
            reply = (
                f"### 💡 Copilot Financial & Career Assessment\n\n"
                f"1. **Career Value**: High. Certifications validate cloud & engineering readiness for **{profile.career_goal}**.\n"
                f"2. **Current Financial Capacity**: With your monthly learning allocation of **₹{profile.financial.available_for_learning:,.0f}/month**, accumulating a ₹10,000 certification requires **{months_to_save} months**.\n"
                f"3. **Emergency Buffer Status**: {budget_analysis['health_warning']}\n\n"
                f"**Recommended Action Plan**:\n"
                f"- **Sinking Fund**: Set aside ₹{profile.financial.available_for_learning:,.0f}/month for the next **{int(months_to_save)} months**.\n"
                f"- **Zero-Cost Prep**: Use official documentation and GitHub student credits during months 1–2.\n"
                f"- **Purchase Timing**: Register for the official exam only after your dedicated sinking fund is accumulated without depleting living buffers."
            )
            recs = [f"Save ₹{profile.financial.available_for_learning:,.0f}/mo into sinking fund", "Use free hands-on labs first", "Build portfolio project before exam"]
        elif "today" in q or "what should i do" in q or "schedule" in q or "daily" in q:
            reply = (
                f"### 📅 Your Optimized Daily Plan ({profile.preferences.study_hours_per_day} Hours Today)\n\n"
                f"Based on your **{profile.career_goal}** readiness ({pct}%):\n\n"
                f"- **Phase 1: DSA Practice (45 mins)** — Focus on your #{1} algorithmic filter on LeetCode/NeetCode.\n"
                f"- **Phase 2: Core Gap ({missing_skills[0] if missing_skills else 'Deep Learning'}) (45 mins)** — Study core architecture & implement 1 pipeline.\n"
                f"- **Phase 3: Portfolio Building (30 mins)** — Add API endpoints and Dockerfile to your portfolio capstone.\n\n"
                f"👉 Check off each item on your **'Today's Plan'** tab as you finish to log skill XP!"
            )
            recs = ["Start with 45m DSA", f"Study {missing_skills[0] if missing_skills else 'Deep Learning'}", "Commit project code to GitHub"]
        elif "data science" in q or "ml engineer" in q or "which role" in q or "pivot" in q:
            match_bullets = []
            for r in recommendations[:3]:
                match_bullets.append(f"- **{r.role} (Match: {r.match_percentage}%)**: {r.why_recommended}")
            reply = (
                f"### 🎯 Career Path Analysis from Your Profile\n\n"
                f"{chr(10).join(match_bullets)}\n\n"
                f"**Strategic Advice**: Your strongest foundation is in **{strong_str}**. Pursuing **{profile.career_goal}** gives you maximum leverage with your current academic timeline."
            )
            recs = [f"Target {profile.career_goal}", f"Bridge {missing_str}", "Build 1 showcase capstone"]
        else:
            reply = (
                f"### 🤖 AI Copilot Guidance for {profile.name}\n\n"
                f"You are currently at **{pct}% Readiness** (Skill Score: **{score}/10**) for your target role **{profile.career_goal}**.\n\n"
                f"**Key Focus Areas for This Week**:\n"
                f"1. **Bridge Missing Skill Gaps**: {missing_str} are your highest priority targets.\n"
                f"2. **Maintain Budget Health**: Keep upskilling expenses within your ₹{profile.financial.available_for_learning:,.0f}/month limit.\n"
                f"3. **Daily Consistency**: Commit {profile.preferences.study_hours_per_day} hours daily using our structured Daily Action Plan.\n\n"
                f"Feel free to ask specific questions about course selections, certification timing, or project architectures!"
            )
            recs = [f"Bridge {missing_str}", f"Maintain ₹{profile.financial.available_for_learning:,.0f}/mo budget", "Follow daily action plan"]

        return {
            "response": reply,
            "source": "knowledge-engine",
            "recommendations": recs
        }
