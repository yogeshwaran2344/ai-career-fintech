import io
import re
from typing import Dict, Any, List, Optional
import pypdf
from models import ResumeAnalysisResponse, StudentProfile

# Core industry skills dictionary for taxonomy extraction
TAXONOMY_SKILLS = [
    "Python", "Java", "C++", "C", "JavaScript", "TypeScript", "Go", "Rust", "SQL",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "FastAPI", "Django", "Flask", "Node.js",
    "React", "Next.js", "Vue", "Angular", "HTML", "CSS", "TailwindCSS",
    "Machine Learning", "Deep Learning", "PyTorch", "TensorFlow", "Keras", "Scikit-Learn",
    "Pandas", "NumPy", "OpenCV", "NLP", "LLMs", "LangChain", "Transformers",
    "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Linux", "Git", "GitHub", "CI/CD",
    "DSA", "Data Structures", "Algorithms", "System Design", "Microservices", "REST APIs",
    "GraphQL", "PowerBI", "Tableau", "Excel", "Spark", "Kafka", "Airflow"
]

class ResumeParserEngine:
    @staticmethod
    def extract_text_from_pdf(pdf_bytes: bytes) -> str:
        try:
            reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
            text = ""
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
            return text.strip()
        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")

    @staticmethod
    def analyze_resume_text(resume_text: str, target_role: str = "AI Engineer") -> Dict[str, Any]:
        text_lower = resume_text.lower()
        word_count = len(resume_text.split())

        if word_count < 20:
            raise ValueError("Resume content too brief. Please provide a complete resume.")

        # 1. Skill Extraction
        extracted_skills = []
        for skill in TAXONOMY_SKILLS:
            pattern = r'\b' + re.escape(skill.lower()) + r'\b'
            if re.search(pattern, text_lower):
                extracted_skills.append(skill)

        # 2. Section Detection (Experience, Projects, Education, Certifications)
        has_education = any(k in text_lower for k in ["education", "b.tech", "btech", "degree", "university", "college", "gpa", "cgpa"])
        has_experience = any(k in text_lower for k in ["experience", "internship", "work history", "employment"])
        has_projects = any(k in text_lower for k in ["projects", "project", "github.com", "built", "developed"])
        has_contact = any(k in text_lower for k in ["@", "email", "phone", "linkedin.com", "github.com"])

        # 3. Action Verbs & Metric Quantification Check
        action_verbs = ["developed", "architected", "engineered", "built", "implemented", "optimized", "reduced", "scaled", "designed", "trained", "deployed"]
        metric_patterns = [r'\d+%', r'\$\d+', r'₹\d+', r'\d+x', r'\d+\s*(ms|seconds|users|requests|records|gb|tb|stars)']
        
        action_verb_count = sum(1 for v in action_verbs if v in text_lower)
        metric_count = sum(len(re.findall(pat, text_lower)) for pat in metric_patterns)

        # 4. Scoring Rubric
        # ATS Compatibility (0 to 100)
        ats_score = 70
        if has_contact: ats_score += 10
        if has_education: ats_score += 8
        if has_projects or has_experience: ats_score += 12
        ats_score = min(98, ats_score)

        # Technical Skills Score
        tech_score = min(98, max(45, len(extracted_skills) * 9))

        # Projects Score
        proj_score = min(95, max(50, 60 + (metric_count * 8)))

        # Impact Statements Score
        impact_score = min(95, max(40, (action_verb_count * 10) + (metric_count * 12)))

        # Formatting & Structure
        formatting_score = 92 if (has_education and has_projects and has_contact) else 75

        # Keyword Match with target role
        role_keywords_map = {
            "AI Engineer": ["python", "machine learning", "deep learning", "pytorch", "fastapi", "docker", "nlp", "llms"],
            "ML Engineer": ["python", "scikit-learn", "docker", "cloud", "mlops", "tensorflow", "sql", "dsa"],
            "Full Stack Developer": ["javascript", "react", "node.js", "sql", "git", "api", "css", "html"],
            "Data Scientist": ["python", "sql", "statistics", "pandas", "machine learning", "tableau", "visualization"]
        }
        expected_kws = role_keywords_map.get(target_role, ["python", "sql", "git", "api", "docker"])
        matched_kws = [kw for kw in expected_kws if kw in text_lower]
        keyword_match_pct = int((len(matched_kws) / max(1, len(expected_kws))) * 100)

        # Overall Resume Score
        overall_score = int(
            (ats_score * 0.25) +
            (tech_score * 0.25) +
            (impact_score * 0.20) +
            (proj_score * 0.15) +
            (keyword_match_pct * 0.15)
        )

        # Suggested Improvements with concrete Before vs After
        bullet_improvements = [
            {
                "original": "Worked on machine learning model for customer data.",
                "improved": "Developed and deployed a Random Forest classification pipeline with 91.4% accuracy on 15,000+ customer records, reducing processing latency by 35%.",
                "rationale": "Quantifies business impact and cites specific algorithms and record volumes."
            },
            {
                "original": "Built a full stack web application with React and Node.",
                "improved": "Architected a full-stack real-time collaboration dashboard using React, Node.js, and Redis Pub/Sub, supporting 500+ concurrent WebSocket connections.",
                "rationale": "Highlights system architecture and concurrency scaling metrics."
            }
        ]

        strengths = []
        if len(extracted_skills) >= 6:
            strengths.append(f"Strong technical breadth with {len(extracted_skills)} recognized frameworks and languages.")
        if metric_count >= 3:
            strengths.append("Effective use of quantitative metrics and percentage results.")
        if has_projects and has_education:
            strengths.append("Standard ATS-compliant layout with clearly delineated sections.")
        if not strengths:
            strengths.append("Good foundational resume draft ready for metric optimization.")

        missing_keywords = [kw.title() for kw in expected_kws if kw not in text_lower]

        action_recommendations = [
            "Quantify engineering impact using specific performance metrics (e.g. latency reduction, request throughput).",
            "Ensure all key technologies from your target role (like PyTorch, Docker, FastAPI) appear in the Skills and Experience sections.",
            "Include direct hyperlinks to live deployed projects and GitHub repositories."
        ]

        return ResumeAnalysisResponse(
            overall_resume_score=overall_score,
            ats_compatibility_pct=ats_score,
            technical_skills_score=tech_score,
            projects_score=proj_score,
            impact_statements_score=impact_score,
            missing_keywords=missing_keywords,
            bullet_improvements=bullet_improvements,
            action_recommendations=action_recommendations
        )
