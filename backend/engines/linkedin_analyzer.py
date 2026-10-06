import re
from typing import List, Dict, Any, Optional
from models import LinkedInAnalysisRequest, LinkedInAnalysisResult, LinkedInSectionScore

class LinkedInAnalyzerEngine:
    @staticmethod
    def analyze_profile(req: LinkedInAnalysisRequest, target_role: str = "AI Engineer") -> LinkedInAnalysisResult:
        headline = (req.headline or "").strip()
        about = (req.about or "").strip()
        skills = req.skills or []
        projects = req.projects or []
        experience = (req.experience or "").strip()
        certifications = req.certifications or []

        # 1. Headline scoring
        headline_score = 50
        if len(headline) >= 20:
            headline_score += 20
        if any(role_term.lower() in headline.lower() for role_term in [target_role.lower(), "engineer", "developer", "student", "specialist"]):
            headline_score += 15
        if "|" in headline or "•" in headline or "🚀" in headline or "/" in headline:
            headline_score += 15
        headline_score = min(100, headline_score)

        # 2. About section scoring
        about_score = 40
        if len(about) >= 120:
            about_score += 25
        if re.search(r"\d+%|\d+\+|built|architected|developed|reduced|increased", about, re.IGNORECASE):
            about_score += 20
        if any(kw in about.lower() for kw in ["contact", "reach", "email", "connect", "github", "portfolio"]):
            about_score += 15
        about_score = min(100, about_score)

        # 3. Skills scoring
        skills_score = min(100, max(30, len(skills) * 12))

        # 4. Experience & Projects scoring
        exp_score = 45
        if len(projects) >= 2:
            exp_score += 25
        if len(experience) >= 50 or certifications:
            exp_score += 30
        exp_score = min(100, exp_score)

        # Overall Score
        overall = int((headline_score * 0.3) + (about_score * 0.3) + (skills_score * 0.2) + (exp_score * 0.2))

        sections = [
            LinkedInSectionScore(
                section="Headline",
                score=headline_score,
                feedback="Include target job title, 2 core tech keywords (e.g. PyTorch, FastAPI), and career aspiration." if headline_score < 80 else "Strong, concise headline with clear professional identity."
            ),
            LinkedInSectionScore(
                section="About Summary",
                score=about_score,
                feedback="Add a quantifiable metric (e.g., 'achieved 92% model accuracy') and a clear call-to-action." if about_score < 80 else "Engaging narrative highlighting domain expertise and project deliverables."
            ),
            LinkedInSectionScore(
                section="Featured Skills",
                score=skills_score,
                feedback=f"Add at least 5 target industry skills relevant to {target_role}." if skills_score < 80 else "Good skills breadth aligned with current recruitment filters."
            ),
            LinkedInSectionScore(
                section="Experience & Projects",
                score=exp_score,
                feedback="Highlight GitHub links and production deployment status for key projects." if exp_score < 80 else "Clear showcase of technical impact and hands-on execution."
            )
        ]

        # Optimized suggestions
        clean_name = "Aspiring " + target_role if not headline else headline.split("|")[0].strip()
        optimized_headline = f"{clean_name} | Building High-Performance ML & AI Systems | PyTorch • FastAPI • Vector DBs | Open to SDE / AI Roles 🚀"
        optimized_about = (
            f"Passionate {target_role} specializing in designing scalable machine learning pipelines, deep learning architectures, and modern web APIs. "
            "Passionate about applying AI to solve real-world problems. Experienced in Python, PyTorch, FastAPI, and PostgreSQL with hands-on deployments. "
            "Always exploring generative AI and cloud infrastructure. Open to connecting with tech leads and fellow developers — reach out at LinkedIn message or GitHub!"
        )

        strengths = []
        if headline_score >= 70:
            strengths.append("Professional headline with clear job role context.")
        if len(skills) >= 4:
            strengths.append(f"Listed {len(skills)} recognizable technical competencies.")
        if projects:
            strengths.append("Demonstrated project initiatives relevant to software engineering.")
        if not strengths:
            strengths.append("Solid base profile primed for immediate recruitment optimization.")

        actionable_recommendations = [
            "Adopt the suggested headline format with pipe separators and top 3 tech stacks to improve LinkedIn search discovery by up to 40%.",
            "Embed links to your deployed live web apps and GitHub repositories directly in the Featured section.",
            "Request 1-2 skill endorsements from peers or mentors for Python, Machine Learning, and Problem Solving."
        ]

        readiness_impact = 4 if overall >= 75 else 2

        return LinkedInAnalysisResult(
            overall_score=overall,
            section_breakdown=sections,
            optimized_headline=optimized_headline,
            optimized_about=optimized_about,
            strengths=strengths,
            actionable_recommendations=actionable_recommendations,
            readiness_impact=readiness_impact
        )
