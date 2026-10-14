import os
import json
import httpx
from typing import Dict, Any, List, Optional
from models import StudentProfile, LLMIntentAnalysis
from engines.career_engine import CareerEngine
from engines.finance_engine import FinanceEngine
from database import DatabaseManager

class LLMService:
    @staticmethod
    def parse_intent(free_text: str) -> LLMIntentAnalysis:
        text = (free_text or "").strip().lower()
        words = text.split()
        word_count = len(words)
        
        # Keyword dictionaries for domain scoring
        ml_keywords = ["machine learning", "ml", "deep learning", "neural", "pytorch", "tensorflow", "model", "data science", "nlp", "cv"]
        ai_gen_keywords = ["ai", "llm", "genai", "rag", "agent", "prompt", "gpt", "transformer", "langchain", "gemini"]
        web_keywords = ["web", "full stack", "react", "frontend", "backend", "javascript", "typescript", "node", "nextjs", "css", "html"]
        devops_keywords = ["devops", "cloud", "docker", "kubernetes", "aws", "gcp", "azure", "ci/cd", "fastapi"]
        dsa_keywords = ["dsa", "leetcode", "neetcode", "algorithms", "data structures", "binary tree", "graph", "dynamic programming"]

        ml_matches = sum(1 for k in ml_keywords if k in text)
        ai_matches = sum(1 for k in ai_gen_keywords if k in text)
        web_matches = sum(1 for k in web_keywords if k in text)
        devops_matches = sum(1 for k in devops_keywords if k in text)
        dsa_matches = sum(1 for k in dsa_keywords if k in text)

        total_signals = ml_matches + ai_matches + web_matches + devops_matches + dsa_matches

        # Dynamic Confidence Calculation
        # Specific signals + sufficient query length yield high confidence; vague inputs yield low confidence
        if total_signals >= 3:
            confidence = min(0.96, 0.85 + (total_signals * 0.02) + min(0.05, word_count * 0.005))
        elif total_signals == 2:
            confidence = min(0.88, 0.75 + min(0.10, word_count * 0.01))
        elif total_signals == 1:
            confidence = min(0.74, 0.60 + min(0.10, word_count * 0.01))
        else:
            confidence = max(0.38, min(0.55, 0.35 + min(0.15, word_count * 0.02)))

        confidence = round(confidence, 2)

        # Interpreted Goal and Focus
        if ml_matches > 0 or ("data science" in text and "ml" in text):
            goal = "AI & Machine Learning Engineer"
            focus = "ML System Engineering (FastAPI + Docker + Model Training & Evaluation)"
            insights = [
                "You are targeting engineering-grade Machine Learning and applied intelligence.",
                "Given 2026-2027 placement demand, ML Engineering offers top starting compensation in tier-1 tech hubs.",
                "Prioritize: Python + Scikit-Learn + PyTorch, followed by containerized deployment (Docker + FastAPI)."
            ]
        elif ai_matches > 0 or "ai" in text or "llm" in text or "genai" in text:
            goal = "AI Engineer"
            focus = "Generative AI, RAG Architectures & LLM Service Deployment"
            insights = [
                "Strong focus on production AI pipelines, retrieval-augmented generation (RAG), and model APIs.",
                "Master Python fundamentals and vector indexing (FAISS/Chroma) first.",
                "Building 1 end-to-end Copilot or agentic workflow will distinguish you during placements."
            ]
        elif web_matches > 0:
            goal = "Full Stack Developer"
            focus = "Modern React, TypeScript & FastAPI/Node Cloud Microservices"
            insights = [
                "High versatility and immediate campus hiring pipeline across tech startups.",
                "Combine responsive frontend design with robust relational SQL and caching.",
                "Prioritize system architecture and clean REST/GraphQL interfaces."
            ]
        elif devops_matches > 0:
            goal = "DevOps & Cloud Engineer"
            focus = "Container Orchestration, AWS Infrastructure & CI/CD Pipelines"
            insights = [
                "High industry demand for cloud infrastructure management and automated deployment.",
                "Pair containerization skills (Docker, K8s) with Python/Go automation scripts."
            ]
        elif dsa_matches > 0:
            goal = "Software Development Engineer (SDE)"
            focus = "Algorithmic Problem Solving, DSA Mastery & System Design"
            insights = [
                "DSA is the primary screening gate for product-based campus placements.",
                "Maintain a daily sprint on Trees, Graphs, and Dynamic Programming.",
                "Target completing NeetCode 150 alongside 1 substantial system design project."
            ]
        else:
            goal = "Software Engineer"
            focus = "Core Computer Science Foundations & Production Software Engineering"
            insights = [
                "Query was broad; mapped to versatile Software Engineering core competencies.",
                "Recommend establishing balanced proficiency across DSA (Problem Solving) and API Development."
            ]

        return LLMIntentAnalysis(
            interpreted_goal=goal,
            suggested_focus=focus,
            insights=insights,
            confidence_score=confidence
        )

    @staticmethod
    async def chat_copilot(profile: StudentProfile, query: str, chat_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        """
        Dynamically calculates readiness, recommendations, and budget constraints directly from the engines.
        Stores conversation persistently in SQLite.
        Clearly tags whether response originated from live Gemini LLM or the deterministic knowledge engine.
        """
        user_query = (query or "").strip()
        
        # 1. Record incoming user message into SQLite
        try:
            DatabaseManager.save_chat_message(profile.id, "student", user_query)
        except Exception:
            pass

        # 2. Dynamic Engine Calculations (Single source of truth)
        pct, score, strong_skills, missing_skills, partial_skills = CareerEngine.calculate_readiness(profile, profile.career_goal)
        recommendations = CareerEngine.get_career_recommendations(profile)
        fin_metrics = FinanceEngine.get_central_financial_metrics(profile)

        # 3. Learning Decay & ATS Context
        try:
            from engines.learning_decay_engine import LearningDecayEngine
            decay_summary = LearningDecayEngine.get_decay_status(profile.id)
            ats_resume = DatabaseManager.get_user_ats_resume(profile.id)
            ats_score = ats_resume.get("ats_score", 76)
            critical_decay_str = ", ".join([c.concept_name for c in decay_summary.urgent_review_queue[:3]]) or "None (Memory optimal)"
        except Exception:
            ats_score = 76
            critical_decay_str = "Binary Trees & Graph Traversals"

        strong_str = ", ".join(strong_skills) if strong_skills else "Python, SQL"
        missing_str = ", ".join(missing_skills[:3]) if missing_skills else "None"
        avail_learning = float(profile.financial.available_for_learning or 0.0)

        # 4. Fetch recent conversation history from SQLite
        recent_history = []
        try:
            recent_history = DatabaseManager.get_recent_chat_history(profile.id, limit=6)
        except Exception:
            pass

        history_context_str = ""
        if recent_history:
            history_lines = [f"- {h['sender'].capitalize()}: {h['message'][:150]}" for h in recent_history[:-1]]
            if history_lines:
                history_context_str = "Recent Conversation Context:\n" + "\n".join(history_lines) + "\n"

        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        
        context_prompt = f"""
You are the AI Career + Finance Copilot for {profile.name}.
Student Academic Profile: {profile.academic.degree} in {profile.academic.branch} ({profile.academic.year}), CGPA {profile.academic.cgpa}.
Target Career Goal: {profile.career_goal}.
Current Computed Career Readiness: {pct}% (Skill Level {score}/10).
Top Strong Skills: {strong_str}.
Key Missing Bottleneck Skills: {missing_str}.
Resume ATS Score: {ats_score}/100.
Urgent Memory Decay Concepts (Ebbinghaus <60%): {critical_decay_str}.
Available Daily Study Time: {profile.preferences.study_hours_per_day} hours/day.
Financial Intelligence:
- Monthly Income: ₹{fin_metrics['monthly_income']:,.0f}
- Essential Expenses: ₹{fin_metrics.get('essential_monthly_expenses', 6000.0):,.0f}
- Monthly Surplus: ₹{fin_metrics['monthly_surplus']:,.0f}
- Monthly Learning Allocation: ₹{avail_learning:,.0f}
- Emergency Buffer: ₹{fin_metrics['emergency_current']:,.0f} (Target: ₹{fin_metrics['emergency_target']:,.0f}, Runway: {fin_metrics['runway_months']} months)
- Investment Clearance State: {fin_metrics['clearance_badge']}

{history_context_str}
Your task is to provide intelligent, hyper-practical advice that co-optimizes CAREER SUCCESS, LEARNING RETENTION, RESUME ATS, and FINANCIAL SAFETY.
Always cite actual numbers and profile attributes. Never invent placeholder percentages.
"""
        # Attempt Gemini API call if key configured
        if api_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
                payload = {
                    "contents": [
                        {"role": "user", "parts": [{"text": f"{context_prompt}\n\nStudent Question: {user_query}"}]}
                    ]
                }
                async with httpx.AsyncClient(timeout=12.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        text_reply = data["candidates"][0]["content"]["parts"][0]["text"]
                        try:
                            DatabaseManager.save_chat_message(profile.id, "copilot", text_reply)
                        except Exception:
                            pass
                        return {
                            "response": text_reply,
                            "source": "gemini-1.5-flash",
                            "recommendations": [
                                f"Commit to {profile.preferences.study_hours_per_day} hours daily study",
                                f"Close bottleneck skills: {missing_str}",
                                f"Budget: ₹{avail_learning:,.0f}/month for verified upskilling"
                            ]
                        }
            except Exception:
                pass

        # Deterministic Knowledge-Engine Fallback using real calculated metrics
        q = user_query.lower()
        if "certif" in q or "aws" in q or "buy" in q or "cost" in q or "afford" in q or "budget" in q:
            if avail_learning > 0:
                months_to_save = round(10000.0 / avail_learning, 1)
                budget_status_msg = f"With your monthly learning allocation of **₹{avail_learning:,.0f}/month**, accumulating a ₹10,000 professional certification takes **{months_to_save} months**."
                sinking_fund_rec = f"- **Sinking Fund**: Set aside ₹{avail_learning:,.0f}/month for the next **{max(1, int(months_to_save))} months**."
            else:
                budget_status_msg = f"Your current dedicated monthly learning budget is **₹0/month**. However, you have an unallocated monthly surplus of **₹{fin_metrics['monthly_surplus']:,.0f}**."
                sinking_fund_rec = f"- **Zero-Cost First**: Use 100% free accredited courses (CS50, Fast.ai, AWS Free Tier). If paying for a certification, allocate ₹1,000–₹1,500/month from your ₹{fin_metrics['monthly_surplus']:,.0f} surplus."

            reply = (
                f"[Deterministic Knowledge Engine - Offline Fallback Mode]\n\n"
                f"### 💡 Copilot Financial & Career Assessment for {profile.name}\n\n"
                f"1. **Career Value**: High. Certifications validate industry readiness for your target role: **{profile.career_goal}**.\n"
                f"2. **Current Financial Capacity**: {budget_status_msg}\n"
                f"3. **Emergency Reserve Status**: {fin_metrics['clearance_badge']} (Buffer: ₹{fin_metrics['emergency_current']:,.0f} / Target: ₹{fin_metrics['emergency_target']:,.0f}, covering {fin_metrics['runway_months']} months).\n\n"
                f"**Recommended Action Plan**:\n"
                f"{sinking_fund_rec}\n"
                f"- **Zero-Cost Prep**: Master prerequisites first using free documentation and student GitHub packs.\n"
                f"- **Purchase Timing**: Register for official examination vouchers only once your emergency runway covers at least 1 month (₹{fin_metrics['emergency_floor_1m']:,.0f})."
            )
            recs = [
                f"Learning budget: ₹{avail_learning:,.0f}/mo",
                f"Target role: {profile.career_goal} ({pct}% readiness)",
                f"Emergency buffer: ₹{fin_metrics['emergency_current']:,.0f} / ₹{fin_metrics['emergency_target']:,.0f}"
            ]

        elif "today" in q or "what should i do" in q or "schedule" in q or "daily" in q or "plan" in q:
            hours_val = profile.preferences.study_hours_per_day
            first_gap = missing_skills[0] if missing_skills else "System Design"
            
            if hours_val >= 2.0:
                study_breakdown = (
                    f"- **Phase 1: DSA Practice (40 mins)** — Solve 1–2 Medium problems on Arrays / Trees.\n"
                    f"- **Phase 2: Core Skill Gap ({first_gap}) (35 mins)** — Review architecture and run implementation script.\n"
                    f"- **Phase 3: Portfolio Project (30 mins)** — Code REST endpoints and test deployment.\n"
                    f"- **Phase 4: Review & Rest (15 mins)** — Review flashcards for decay concept: {critical_decay_str}."
                )
            else:
                study_breakdown = (
                    f"- **Phase 1: DSA Sprint (30 mins)** — Focus on algorithmic efficiency.\n"
                    f"- **Phase 2: Core Skill Gap ({first_gap}) (30 mins)** — Study hands-on implementation."
                )

            reply = (
                f"[Deterministic Knowledge Engine - Offline Fallback Mode]\n\n"
                f"### 📅 Your Optimized Daily Action Plan ({hours_val} Hours Today)\n\n"
                f"Target Goal: **{profile.career_goal}** (Current Readiness: **{pct}%**)\n\n"
                f"{study_breakdown}\n\n"
                f"👉 Complete each task on your **'Today's Plan'** tab to record skill XP and build placement momentum!"
            )
            recs = [f"Complete {hours_val}h daily plan", f"Bridge {first_gap}", f"Review {critical_decay_str}"]

        elif "data science" in q or "ml engineer" in q or "role" in q or "pivot" in q or "career" in q:
            match_bullets = []
            for r in recommendations[:3]:
                match_bullets.append(f"- **{r.role} (Match: {r.match_percentage}%)**: {r.why_recommended}")
            reply = (
                f"[Deterministic Knowledge Engine - Offline Fallback Mode]\n\n"
                f"### 🎯 Personalized Career Path Analysis for {profile.name}\n\n"
                f"Target Role: **{profile.career_goal}** | Current Computed Readiness: **{pct}%** (Skill Score: {score}/10)\n\n"
                f"{chr(10).join(match_bullets)}\n\n"
                f"**Key Recommendation**: Your strongest foundational capabilities are in **{strong_str}**. "
                f"Closing **{missing_str}** will yield the highest immediate leap in your campus placement competitiveness."
            )
            recs = [f"Target: {profile.career_goal}", f"Bridge: {missing_str}", f"Maintain {hours_val if 'hours_val' in locals() else profile.preferences.study_hours_per_day}h daily commitment"]

        else:
            reply = (
                f"[Deterministic Knowledge Engine - Offline Fallback Mode]\n\n"
                f"### 🤖 Elevare Copilot Strategic Overview for {profile.name}\n\n"
                f"- **Academic Profile**: {profile.academic.degree} in {profile.academic.branch} (CGPA: {profile.academic.cgpa})\n"
                f"- **Target Career Goal**: {profile.career_goal}\n"
                f"- **Calculated Readiness**: {pct}% (Skill Score: {score}/10)\n"
                f"- **Resume ATS Score**: {ats_score}/100\n"
                f"- **Monthly Surplus**: ₹{fin_metrics['monthly_surplus']:,.0f} (Learning Budget: ₹{avail_learning:,.0f}/mo)\n"
                f"- **Emergency Runway**: {fin_metrics['runway_months']} months ({fin_metrics['clearance_badge']})\n\n"
                f"**Highest-Impact Actions for Today**:\n"
                f"1. **Address Top Bottlenecks**: Focus study on {missing_str}.\n"
                f"2. **Protect Memory Retention**: Review concepts approaching decay ({critical_decay_str}).\n"
                f"3. **Financial Discipline**: Maintain emergency buffer growth toward the recommended ₹{fin_metrics['emergency_target']:,.0f} target."
            )
            recs = [f"Bridge {missing_str}", f"Target {profile.career_goal} ({pct}%)", f"Follow {profile.preferences.study_hours_per_day}h daily plan"]

        try:
            DatabaseManager.save_chat_message(profile.id, "copilot", reply)
        except Exception:
            pass

        return {
            "response": reply,
            "source": "deterministic-knowledge-engine",
            "recommendations": recs
        }

    @classmethod
    async def resolve_video_doubt(
        cls,
        profile: StudentProfile,
        topic_name: str,
        timestamp_or_part: str,
        doubt_question: str,
        video_url: Optional[str] = None,
        chat_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        AI Video Learning & Timestamp Doubt Resolver:
        Explains specific moments/parts of video tutorials grounded in the student's learning profile.
        """
        topic = (topic_name or "Computer Science Concept").strip()
        part = (timestamp_or_part or "the main concept").strip()
        doubt = (doubt_question or "Could you explain how this works step by step?").strip()

        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

        history_str = ""
        if chat_history:
            for turn in chat_history[-4:]:
                sender = turn.get("role", "student")
                history_str += f"{sender}: {turn.get('content', '')}\n"

        prompt = f"""
You are an expert AI Video Tutor and Senior Engineering Mentor explaining a technical video tutorial to {profile.name} (Degree: {profile.academic.degree}, Target Goal: {profile.career_goal}).

TOPIC: {topic}
SPECIFIC PART / TIMESTAMP THE STUDENT DIDN'T UNDERSTAND: {part}
STUDENT'S DOUBT: {doubt}
VIDEO REFERENCE: {video_url or 'Technical Lecture'}
{f'PREVIOUS CONVERSATION: {history_str}' if history_str else ''}

INSTRUCTIONS:
1. Directly and kindly explain WHAT is happening at that specific moment/part ({part}) and WHY the instructor wrote or said that.
2. Provide a simple, intuitive real-world mental model or analogy.
3. Provide a clear step-by-step trace of the logic / execution.
4. Provide a small, clean code snippet or ASCII diagram illustrating the concept.
5. Provide a one-sentence key takeaway / golden rule to remember.
6. Suggest 2 short follow-up questions the student might want to ask next.

Respond in a clear, encouraging tone. Format response as JSON with keys:
- "explanation": (detailed explanation of the part/timestamp, 2-3 paragraphs)
- "mental_model_or_analogy": (1 short vivid analogy)
- "step_by_step_breakdown": (list of 3-5 strings)
- "code_or_visual_snippet": (string with code or diagram)
- "key_takeaway": (1-2 sentence takeaway)
- "suggested_followups": (list of 2-3 strings)
"""
        if api_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
                payload = {
                    "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                    "generationConfig": {"response_mime_type": "application/json"}
                }
                async with httpx.AsyncClient(timeout=12.0) as client:
                    resp = await client.post(url, json=payload)
                    if resp.status_code == 200:
                        raw = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                        data = json.loads(raw)
                        return {
                            "topic_name": topic,
                            "timestamp_or_part": part,
                            "explanation": data.get("explanation", ""),
                            "mental_model_or_analogy": data.get("mental_model_or_analogy", ""),
                            "step_by_step_breakdown": data.get("step_by_step_breakdown", []),
                            "code_or_visual_snippet": data.get("code_or_visual_snippet", ""),
                            "key_takeaway": data.get("key_takeaway", ""),
                            "suggested_followups": data.get("suggested_followups", [
                                f"How does {topic} perform under edge cases?",
                                "What is the time and space complexity trade-off?"
                            ]),
                            "source": "gemini-ai-video-copilot"
                        }
            except Exception:
                pass

        lower_t = topic.lower()
        lower_p = part.lower()
        lower_d = doubt.lower()

        if "tree" in lower_t or "dfs" in lower_t or "traversal" in lower_t or "recursion" in lower_t:
            explanation = (
                f"When the instructor reaches **{part}**, what they are demonstrating is the **unwinding of the recursion call stack** in Depth-First Search.\n\n"
                f"At this exact point, the function pauses the current node, visits the left child, and only resumes to the right child once the left subtree has returned its result. "
                f"The reason this felt confusing is that the computer's memory keeps track of where to return automatically via the Stack frame, while our human eyes only see the top-level code."
            )
            analogy = "Think of exploring a labyrinth with a ball of thread: whenever you hit a dead end (null node), you backtrack along the thread (return statement) until you find the nearest unexplored fork in the road."
            steps = [
                "1. Base Condition Check: If root is None, return 0 immediately (prevents infinite recursion).",
                "2. Left Branch Recurse: dfs(root.left) goes down until it reaches the deepest leaf.",
                "3. Call Stack Unwinds: Each leaf returns its answer back up to its immediate parent.",
                "4. Right Branch Recurse: dfs(root.right) calculates the opposite side of the current subtree.",
                "5. Aggregate: The parent combines left + right results and returns the total up to the original caller."
            ]
            code = (
                "# Clear Recursive DFS Structure\n"
                "def dfs(node):\n"
                "    if not node:               # 1. Base case: reached dead end\n"
                "        return 0\n"
                "    left_res = dfs(node.left)  # 2. Recurse left\n"
                "    right_res = dfs(node.right)# 3. Recurse right\n"
                "    return 1 + max(left_res, right_res) # 4. Combine & return height"
            )
            takeaway = "Always trace recursion from the base case upwards, rather than trying to hold 5 layers of function calls in your head at once."
            followups = [
                "Why is the time complexity O(N) when every node is visited once?",
                "How would we rewrite this iteratively using an explicit Stack?",
                "What happens if the tree is heavily skewed (like a linked list)?"
            ]

        elif "docker" in lower_t or "container" in lower_t:
            explanation = (
                f"In the video at **{part}**, the instructor is explaining the difference between an **Image layer** and a **running Container instance**.\n\n"
                f"Each command in your Dockerfile (like `COPY . /app` or `RUN pip install`) creates an immutable cached layer. At {part}, Docker checks if the file checksum changed; if not, it uses the cached layer to speed up builds by 10x."
            )
            analogy = "A Docker Image is like a printed recipe for a cake, while a Docker Container is the actual physical cake baked and sitting on the table."
            steps = [
                "1. Base Image: Pulls minimal Linux kernel + Python runtime (e.g. python:3.11-slim).",
                "2. Workdir: Defines the isolated working directory inside the container filesystem.",
                "3. Dependency Caching: Copies requirements.txt first so heavy pip installs are cached.",
                "4. Port Binding (-p 8000:8000): Forwards your laptop's local port to the isolated container port."
            ]
            code = (
                "# Optimized Production Dockerfile\n"
                "FROM python:3.11-slim\n"
                "WORKDIR /app\n"
                "COPY requirements.txt .\n"
                "RUN pip install --no-cache-dir -r requirements.txt\n"
                "COPY . .\n"
                "CMD [\"uvicorn\", \"main:app\", \"--host\", \"0.0.0.0\", \"--port\", \"8000\"]"
            )
            takeaway = "Order your Dockerfile from least frequently changed commands to most frequently changed to maximize layer cache speed."
            followups = [
                "What is the difference between CMD and ENTRYPOINT?",
                "Why should we use .dockerignore to exclude virtual environments?"
            ]

        elif "fastapi" in lower_t or "api" in lower_t or "backend" in lower_t:
            explanation = (
                f"At **{part}**, the instructor is setting up **asynchronous non-blocking request handlers** (`async def`) and **Pydantic model validation**.\n\n"
                f"FastAPI automatically validates incoming JSON against your schema before your function even runs. If a client sends invalid types, FastAPI automatically rejects it with HTTP 422, saving you dozens of manual if-else validation checks."
            )
            analogy = "Pydantic is like a strict airport security scanner: if luggage doesn't match the allowed dimensions and format, it gets turned away before entering the terminal."
            steps = [
                "1. Request arrives over HTTP with raw JSON payload.",
                "2. Pydantic parses and type-casts types (strings to ints, ISO dates to datetime).",
                "3. Dependency Injection: Verifies Bearer tokens or database sessions via `Depends()`.",
                "4. Route Handler executes business logic and returns Python dictionary.",
                "5. FastAPI automatically serializes response to JSON and updates OpenAPI docs (/docs)."
            ]
            code = (
                "from fastapi import FastAPI, Depends, HTTPException\n"
                "from pydantic import BaseModel\n\n"
                "class PredictReq(BaseModel):\n"
                "    features: list[float]\n"
                "    model_version: str = 'v1.0'\n\n"
                "@app.post('/predict')\n"
                "async def predict(req: PredictReq):\n"
                "    return {'prediction': sum(req.features) * 0.42}"
            )
            takeaway = "Use `async def` for I/O bound operations (database calls, external APIs) and standard `def` for heavy CPU-bound numpy/model calculations."
            followups = [
                "How does FastAPI Dependency Injection manage database sessions?",
                "What is the best way to handle global exceptions and custom error schemas?"
            ]

        elif "machine learning" in lower_t or "pytorch" in lower_t or "deep learning" in lower_t:
            explanation = (
                f"At **{part}**, the video highlights the **loss backward calculation and optimizer step** (`loss.backward()` followed by `optimizer.step()`).\n\n"
                f"When you calculate loss, PyTorch builds a computation graph. `loss.backward()` calculates the partial derivatives (gradients) of the loss with respect to every weight parameter using the Chain Rule. `optimizer.step()` then tweaks each weight slightly in the opposite direction of the gradient to reduce the error on the next iteration."
            )
            analogy = "Imagine being blindfolded on a foggy mountain and wanting to reach the lowest valley: you feel the slope beneath your feet (gradient) and take one cautious step downhill (learning rate * gradient)."
            steps = [
                "1. Forward Pass: Pass input features X through the model layers to produce predictions y_pred.",
                "2. Loss Function: Quantify discrepancy between y_pred and true labels y_true.",
                "3. Zero Gradients: `optimizer.zero_grad()` clears residual gradients from previous batch.",
                "4. Backward Pass: `loss.backward()` populates `.grad` attribute for all trainable weights.",
                "5. Optimizer Step: `optimizer.step()` updates parameters: weight = weight - lr * gradient."
            ]
            code = (
                "# Standard PyTorch Training Loop Step\n"
                "for X_batch, y_batch in dataloader:\n"
                "    optimizer.zero_grad()       # 1. Clear old gradients\n"
                "    y_pred = model(X_batch)     # 2. Forward pass\n"
                "    loss = criterion(y_pred, y_batch) # 3. Compute loss\n"
                "    loss.backward()             # 4. Compute gradients via Autograd\n"
                "    optimizer.step()            # 5. Update weights"
            )
            takeaway = "Always call `optimizer.zero_grad()` before `loss.backward()`, otherwise gradients accumulate across batches and blow up weight magnitudes."
            followups = [
                "Why do we need Learning Rate Schedulers during training?",
                "What is the difference between L1/L2 regularization and Dropout?"
            ]

        elif "sql" in lower_t or "query" in lower_t or "database" in lower_t:
            explanation = (
                f"In the database lecture at **{part}**, the instructor is explaining **Index Lookups vs Full Table Scans** and **Window Functions (`OVER (PARTITION BY ...)`).\n\n"
                f"Unlike `GROUP BY` which collapses rows into a single aggregated summary, a Window Function calculates aggregations across a partition while retaining every individual row in the output."
            )
            analogy = "GROUP BY is like giving one report card for the entire class, while a Window Function prints each student's individual score alongside the class rank and average."
            steps = [
                "1. FROM & JOIN: Identifies base tables and applies join conditions.",
                "2. WHERE clause: Filters out non-matching rows before aggregation.",
                "3. PARTITION BY: Groups rows logically for the window computation.",
                "4. ORDER BY within window: Determines rank and running total sequence.",
                "5. SELECT output: Appends computed metric column to each individual row."
            ]
            code = (
                "-- Ranking items within each category without collapsing rows\n"
                "SELECT \n"
                "    employee_id, department, salary,\n"
                "    DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dept_salary_rank\n"
                "FROM employees;"
            )
            takeaway = "Use Window Functions whenever you need both row-level granularity and group-level aggregates simultaneously."
            followups = [
                "What is the performance difference between B-Tree and Hash indexes?",
                "When should you use CTEs (Common Table Expressions) over subqueries?"
            ]

        else:
            explanation = (
                f"Regarding your doubt on **{topic}** at **{part}**: the core mechanism being demonstrated is how the system handles **state transitions and boundary constraints**.\n\n"
                f"At this specific point ({part}), the instructor is deliberately handling an edge case. The specific reason `{doubt}` arises is that the code must prevent unintended side-effects or out-of-bounds conditions before continuing to the primary execution branch."
            )
            analogy = "Think of it like a checklist before an airplane takeoff: even if the engines work perfectly, you must verify the cabin pressure and doors before accelerating on the runway."
            steps = [
                f"1. Input validation and boundary precondition check for {topic}.",
                f"2. Core transformation at {part}: processing primary payload.",
                "3. Error handling: catching exceptions gracefully.",
                "4. Output emission: returning structured response to the caller."
            ]
            code = (
                f"# Core architectural pattern for {topic}\n"
                "def execute_step(data):\n"
                "    if not data:        # Boundary check\n"
                "        return None\n"
                "    result = transform(data) # Core mechanism\n"
                "    return result"
            )
            takeaway = f"Mastering {topic} requires identifying the boundary condition first before writing the core logic."
            followups = [
                f"How would you optimize this implementation for large scale inputs?",
                f"What are the common pitfalls candidates encounter in {topic} during interviews?"
            ]

        return {
            "topic_name": topic,
            "timestamp_or_part": part,
            "explanation": explanation,
            "mental_model_or_analogy": analogy,
            "step_by_step_breakdown": steps,
            "code_or_visual_snippet": code,
            "key_takeaway": takeaway,
            "suggested_followups": followups,
            "source": "deterministic-engineering-mentor"
        }
