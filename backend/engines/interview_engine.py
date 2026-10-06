import random
import uuid
from typing import List, Dict, Any
from models import (
    MockInterviewQuestion, MockInterviewAnswerItem, MockInterviewScores, MockInterviewResult, StudentProfile
)
from engines.career_engine import CareerEngine

ROLE_INTERVIEW_BANKS: Dict[str, List[Dict[str, Any]]] = {
    "AI Engineer": [
        {
            "id": "ai-q1",
            "category": "Technical",
            "question": "Explain the difference between Fine-Tuning, Prompt Engineering, and Retrieval-Augmented Generation (RAG). When would you choose RAG over Fine-Tuning?",
            "sample_hint": "Focus on data freshness, privacy, cost, hallucinations, and parametric vs non-parametric memory.",
            "difficulty": "Hard"
        },
        {
            "id": "ai-q2",
            "category": "DSA/Algorithms",
            "question": "How do Vector Embeddings work mathematically, and why do we use Cosine Similarity instead of Euclidean Distance for high-dimensional semantic search?",
            "sample_hint": "Discuss dot products, normalized magnitudes in hyperspace, and curse of dimensionality.",
            "difficulty": "Medium"
        },
        {
            "id": "ai-q3",
            "category": "System Design",
            "question": "How would you design a low-latency LLM inference API that handles streaming responses, rate limiting, and fallback model routing?",
            "sample_hint": "Mention Server-Sent Events (SSE), token streaming, Redis token bucket, and async workers with FastAPI/Celery.",
            "difficulty": "Hard"
        },
        {
            "id": "ai-q4",
            "category": "Behavioral",
            "question": "Describe a project where your AI model didn't perform as expected on real-world inputs. How did you diagnose and remediate the issue?",
            "sample_hint": "Use the STAR method (Situation, Task, Action, Result) and discuss data distribution drift or edge cases.",
            "difficulty": "Medium"
        }
    ],
    "ML Engineer": [
        {
            "id": "ml-q1",
            "category": "Technical",
            "question": "How do you detect and address Data Drift and Concept Drift in production Machine Learning pipelines?",
            "sample_hint": "Discuss Kolmogorov-Smirnov tests, Population Stability Index (PSI), automated retraining triggers, and shadow deployments.",
            "difficulty": "Hard"
        },
        {
            "id": "ml-q2",
            "category": "DSA/Algorithms",
            "question": "Walk me through how Gradient Descent optimizes loss in deep neural networks. What are vanishing/exploding gradients and how do we resolve them?",
            "sample_hint": "Mention backpropagation, chain rule, Adam optimizer, residual connections (ResNet), and layer normalization.",
            "difficulty": "Medium"
        },
        {
            "id": "ml-q3",
            "category": "System Design",
            "question": "Design an end-to-end MLOps pipeline for feature store ingestion, model registry, automated unit testing, and Canary deployments.",
            "sample_hint": "Mention Feast, MLflow, GitHub Actions CI/CD, Docker containers, and Kubernetes/Triton inference server.",
            "difficulty": "Hard"
        },
        {
            "id": "ml-q4",
            "category": "Behavioral",
            "question": "How do you balance model interpretability with raw predictive accuracy when stakeholder trust is critical?",
            "sample_hint": "Discuss SHAP, LIME values, simpler baseline models vs ensembles, and stakeholder communication.",
            "difficulty": "Medium"
        }
    ],
    "Full Stack Developer": [
        {
            "id": "fs-q1",
            "category": "Technical",
            "question": "Explain the React reconciliation algorithm and Virtual DOM diffing. How do React 18 Concurrent features (like useTransition) improve UI responsiveness?",
            "sample_hint": "Discuss Fiber tree, time-slicing, non-blocking state transitions, and component re-render optimization.",
            "difficulty": "Medium"
        },
        {
            "id": "fs-q2",
            "category": "Technical",
            "question": "How does Database Indexing (e.g., B-Trees vs Hash Indexes in PostgreSQL) work under the hood? When does an index degrade write performance?",
            "sample_hint": "Discuss log(N) traversals, index maintenance during INSERT/UPDATE/DELETE, and composite index column order.",
            "difficulty": "Medium"
        },
        {
            "id": "fs-q3",
            "category": "System Design",
            "question": "Design a real-time collaborative document editor (like Google Docs) with conflict resolution and WebSocket scaling.",
            "sample_hint": "Mention Operational Transformation (OT) or CRDTs, Redis pub/sub, stateless WebSocket servers, and persistence layers.",
            "difficulty": "Hard"
        },
        {
            "id": "fs-q4",
            "category": "Behavioral",
            "question": "Tell me about a time you had to optimize a slow API or sluggish web frontend. How did you profile the bottleneck and measure the impact?",
            "sample_hint": "Mention Chrome DevTools / Lighthouse, query EXPLAIN ANALYZE, caching layers, and measurable ms reduction.",
            "difficulty": "Medium"
        }
    ],
    "Data Scientist": [
        {
            "id": "ds-q1",
            "category": "Technical",
            "question": "Explain the difference between Type I and Type II errors in hypothesis testing. How do you choose sample size for an A/B test?",
            "sample_hint": "Mention alpha, statistical power (1-beta), effect size (MDE), and variance reduction techniques.",
            "difficulty": "Medium"
        },
        {
            "id": "ds-q2",
            "category": "Technical",
            "question": "How do you handle highly imbalanced datasets when predicting rare events (e.g. credit fraud with 0.1% positive rate)?",
            "sample_hint": "Mention Precision-Recall AUC (PR-AUC), SMOTE, focal loss, class weights, and threshold tuning.",
            "difficulty": "Medium"
        },
        {
            "id": "ds-q3",
            "category": "System Design",
            "question": "How would you design a customer churn prediction and automated uplift modeling system for a fintech subscription service?",
            "sample_hint": "Discuss feature engineering on transaction history, two-model approach / meta-learners, and business retention ROI.",
            "difficulty": "Hard"
        },
        {
            "id": "ds-q4",
            "category": "Behavioral",
            "question": "How do you translate complex statistical insights into simple, actionable recommendations for non-technical business executives?",
            "sample_hint": "Focus on ROI metrics, clear visualizations, avoiding technical jargon, and risk framing.",
            "difficulty": "Medium"
        }
    ]
}

# Generic fallback for any other custom role
GENERIC_QUESTIONS = [
    {
        "id": "gen-q1",
        "category": "Technical",
        "question": "What core technical architectures and patterns do you consider essential for your target role, and why?",
        "sample_hint": "Discuss standard frameworks, design principles, modularity, and error handling.",
        "difficulty": "Medium"
    },
    {
        "id": "gen-q2",
        "category": "DSA/Algorithms",
        "question": "How do you evaluate time and space complexity when optimizing a performance-critical function?",
        "sample_hint": "Mention Big-O notation, memory allocation, caching, and algorithmic trade-offs.",
        "difficulty": "Medium"
    },
    {
        "id": "gen-q3",
        "category": "System Design",
        "question": "How do you approach designing a resilient, scalable service with proper logging and monitoring?",
        "sample_hint": "Mention microservices/APIs, health checks, Prometheus/Grafana metrics, and circuit breakers.",
        "difficulty": "Hard"
    },
    {
        "id": "gen-q4",
        "category": "Behavioral",
        "question": "Tell me about a challenging bug or technical hurdle you solved. How did you break down the problem?",
        "sample_hint": "Use the STAR method: Situation, Task, Action, and measurable Result.",
        "difficulty": "Medium"
    }
]

class MockInterviewEngine:
    @staticmethod
    def generate_interview(role: str) -> List[MockInterviewQuestion]:
        questions_raw = ROLE_INTERVIEW_BANKS.get(role, GENERIC_QUESTIONS)
        return [MockInterviewQuestion(**q) for q in questions_raw]

    @staticmethod
    def evaluate_interview(
        role: str,
        answers: List[MockInterviewAnswerItem],
        profile: StudentProfile
    ) -> MockInterviewResult:
        total_answers = len(answers)
        if total_answers == 0:
            tech, comm, conf, acc, struct = 50, 50, 50, 50, 50
        else:
            # Multi-dimensional heuristics based on length, depth, keyword density & structure
            tech_scores = []
            comm_scores = []
            conf_scores = []
            acc_scores = []
            struct_scores = []

            for item in answers:
                text = item.user_answer.strip()
                word_count = len(text.split())

                # Length / Detail heuristic
                if word_count > 60:
                    depth_score = 90
                elif word_count > 30:
                    depth_score = 78
                elif word_count > 15:
                    depth_score = 65
                elif word_count > 5:
                    depth_score = 45
                else:
                    depth_score = 25

                # Structural signals (bullet points, numbering, paragraphs, STAR keywords)
                has_structure = any(token in text.lower() for token in ['first', 'second', 'because', 'for example', 'such as', 'result', 'therefore', '1.', '2.'])
                structure_val = min(95, depth_score + (15 if has_structure else 0))

                # Technical keywords
                tech_keywords = ['latency', 'async', 'pipeline', 'scale', 'model', 'api', 'database', 'memory', 'algorithm', 'vector', 'docker', 'test', 'index', 'cache', 'complexity']
                matched_keywords = sum(1 for kw in tech_keywords if kw in text.lower())
                tech_val = min(98, 40 + (matched_keywords * 12) + (depth_score * 0.4))

                # Communication clarity
                comm_val = min(95, depth_score + 5)
                conf_val = min(92, 60 + (depth_score * 0.35))
                acc_val = min(95, tech_val - random.randint(0, 5))

                tech_scores.append(tech_val)
                comm_scores.append(comm_val)
                conf_scores.append(conf_val)
                acc_scores.append(acc_val)
                struct_scores.append(structure_val)

            tech = int(sum(tech_scores) / len(tech_scores))
            comm = int(sum(comm_scores) / len(comm_scores))
            conf = int(sum(conf_scores) / len(conf_scores))
            acc = int(sum(acc_scores) / len(acc_scores))
            struct = int(sum(struct_scores) / len(struct_scores))

        # Overall composite score: Technical (30%), Accuracy (25%), Communication (20%), Structure (15%), Confidence (10%)
        overall = int((tech * 0.30) + (acc * 0.25) + (comm * 0.20) + (struct * 0.15) + (conf * 0.10))

        # Strengths & improvements
        strengths = []
        if tech >= 75:
            strengths.append("Strong technical depth with relevant architectural terminology.")
        if struct >= 75:
            strengths.append("Clear, structured reasoning with logical step-by-step breakdown.")
        if comm >= 75:
            strengths.append("Articulate explanations suitable for high-caliber engineering interviews.")
        if not strengths:
            strengths.append("Good baseline effort; clear engagement with the core question prompts.")

        areas_to_improve = []
        if tech < 75:
            areas_to_improve.append("Incorporate deeper technical trade-offs (e.g. time vs space, latency vs throughput).")
        if struct < 75:
            areas_to_improve.append("Use the STAR format (Situation, Task, Action, Result) for behavioural and system questions.")
        if comm < 75:
            areas_to_improve.append("Expand answers with concrete production examples and measurable outcomes.")
        if not areas_to_improve:
            areas_to_improve.append("Refine response pacing and prepare for advanced follow-up edge cases.")

        actionable_feedback = (
            f"Your interview readiness for {role} scored {overall}/100. "
            f"Technical accuracy ({acc}%) and communication clarity ({comm}%) were notable. "
            f"To reach the 90%+ tier for Tier-1 companies, focus on articulating quantitative results (e.g. 'reduced latency by 40%') "
            f"and evaluating architectural trade-offs directly."
        )

        exemplars = [
            {
                "question": "How to structure a high-scoring answer?",
                "model_answer": "1. Direct TL;DR answer with core definition -> 2. Technical mechanisms & data flow -> 3. Concrete production trade-offs -> 4. Edge cases & mitigation."
            }
        ]

        # Calculate impact on Placement Readiness
        readiness_calc = CareerEngine.calculate_readiness(profile)
        old_readiness = readiness_calc.get("readiness_pct", 50)
        
        # Interview score directly lifts readiness by up to +8%
        readiness_boost = max(2, int((overall - 50) * 0.15))
        new_readiness = min(99, old_readiness + readiness_boost)

        return MockInterviewResult(
            role=role,
            scores=MockInterviewScores(
                technical=tech,
                communication=comm,
                confidence=conf,
                accuracy=acc,
                structure=struct,
                overall=overall
            ),
            strengths=strengths,
            areas_to_improve=areas_to_improve,
            actionable_feedback=actionable_feedback,
            exemplar_answers=exemplars,
            previous_mock_score=max(40, overall - 8),
            new_mock_score=overall,
            readiness_impact=readiness_boost,
            new_readiness_pct=new_readiness
        )
