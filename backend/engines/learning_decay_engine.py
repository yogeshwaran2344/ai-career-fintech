import math
import datetime
from typing import Dict, Any, List, Optional
from database import DatabaseManager
from models import (
    LearningDecayConcept,
    LearningDecayStatusResponse,
    ConceptQuizQuestion,
    ConceptQuizResponse,
    SubmitConceptQuizRequest,
    ConceptQuizEvaluationResponse
)

# Rich conceptual flash-quiz bank calibrated for spaced retrieval practice
CONCEPT_QUIZ_BANK: Dict[str, Dict[str, Any]] = {
    "Binary Trees & DFS": {
        "category": "DSA",
        "questions": [
            {
                "id": "tree-q1",
                "question": "In a post-order traversal (Left, Right, Root) of a binary tree, what is guaranteed about the root node of any subtree?",
                "options": [
                    "It is visited before both its left and right children.",
                    "It is visited strictly after both its left and right children have been visited.",
                    "It is visited between the left child and right child.",
                    "It is visited in level-order priority."
                ],
                "correct_answer": "It is visited strictly after both its left and right children have been visited.",
                "hint": "Think about bottom-up calculation in subtree maximum depth.",
                "explanation": "Post-order processes children first, making it ideal for bottom-up aggregations like calculating tree depth or deleting trees."
            },
            {
                "id": "tree-q2",
                "question": "What is the worst-case space complexity of recursive DFS on an unbalanced, degenerate binary tree with N nodes?",
                "options": [
                    "O(1)",
                    "O(log N)",
                    "O(N) due to call stack depth",
                    "O(N^2)"
                ],
                "correct_answer": "O(N) due to call stack depth",
                "hint": "In a skewed tree (linked list structure), every node adds a stack frame.",
                "explanation": "When a tree degrades into a straight line, recursion stack depth reaches N frames, resulting in O(N) memory."
            }
        ]
    },
    "Dynamic Programming (Tabulation)": {
        "category": "DSA",
        "questions": [
            {
                "id": "dp-q1",
                "question": "What is the fundamental difference between DP Tabulation (Bottom-Up) and Memoization (Top-Down)?",
                "options": [
                    "Tabulation relies on recursion, while Memoization uses an iterative loop.",
                    "Tabulation solves all subproblems iteratively in topological order, avoiding call stack recursion overhead.",
                    "Memoization is asymptotically faster than Tabulation by an order of magnitude.",
                    "Tabulation requires exponential memory space O(2^N)."
                ],
                "correct_answer": "Tabulation solves all subproblems iteratively in topological order, avoiding call stack recursion overhead.",
                "hint": "Consider iterative table filling vs recursive calls with a cache dictionary.",
                "explanation": "Tabulation systematically fills a table from base cases upward, eliminating recursion overhead and avoiding stack overflow."
            },
            {
                "id": "dp-q2",
                "question": "In the 0/1 Knapsack problem with capacity W and N items, what is the standard time complexity using 2D DP?",
                "options": [
                    "O(N log W)",
                    "O(N * W)",
                    "O(2^N)",
                    "O(N + W)"
                ],
                "correct_answer": "O(N * W)",
                "hint": "Each state (item i, current capacity w) is computed in O(1) time.",
                "explanation": "The 2D table has N rows and W+1 columns, giving a pseudo-polynomial time complexity of O(N * W)."
            }
        ]
    },
    "PyTorch Tensor Broadcasting": {
        "category": "AI_ML",
        "questions": [
            {
                "id": "pt-q1",
                "question": "Two PyTorch tensors with shapes (3, 1, 5) and (2, 5) are multiplied element-wise. What is the resulting shape after broadcasting?",
                "options": [
                    "Runtime shape mismatch error",
                    "(3, 2, 5)",
                    "(3, 1, 5)",
                    "(6, 5)"
                ],
                "correct_answer": "(3, 2, 5)",
                "hint": "Trailing dimensions are aligned right-to-left: 5 matches 5, 1 stretches to 2, leading 3 is preserved.",
                "explanation": "Broadcasting rules align dimensions right-to-left. (2, 5) becomes (1, 2, 5); then (3, 1, 5) and (1, 2, 5) broadcast to (3, 2, 5)."
            },
            {
                "id": "pt-q2",
                "question": "Does PyTorch tensor broadcasting allocate duplicate memory copies of the expanded dimension?",
                "options": [
                    "Yes, it creates contiguous in-memory copies for each repetition.",
                    "No, it uses stride 0 along the repeated dimension, referencing the same memory without extra allocation.",
                    "Only on CUDA GPUs, not on CPU tensors.",
                    "Yes, unless .clone() is explicitly disabled."
                ],
                "correct_answer": "No, it uses stride 0 along the repeated dimension, referencing the same memory without extra allocation.",
                "hint": "Think about memory strides and view transformations.",
                "explanation": "Broadcasting sets the stride for the expanded dimension to 0, which points to the same memory addresses without duplicating data."
            }
        ]
    },
    "Docker Multi-Stage Builds": {
        "category": "SYSTEMS",
        "questions": [
            {
                "id": "dk-q1",
                "question": "What is the primary production engineering advantage of using Docker Multi-Stage builds for a FastAPI or Go service?",
                "options": [
                    "It runs multiple containers concurrently inside a single container.",
                    "It keeps compilers, build tools, and dev dependencies out of the final slim runtime image, reducing image size and attack surface.",
                    "It bypasses the need for Docker daemon.",
                    "It automatically creates Kubernetes pod configurations."
                ],
                "correct_answer": "It keeps compilers, build tools, and dev dependencies out of the final slim runtime image, reducing image size and attack surface.",
                "hint": "Think about image size reduction from 1.2 GB to 85 MB.",
                "explanation": "Multi-stage builds allow copying only compiled artifacts or dependencies into a clean alpine/distroless runner stage, drastically reducing CVE vulnerability surface and image size."
            },
            {
                "id": "dk-q2",
                "question": "In a Dockerfile, which syntax correctly copies artifacts from a previous build stage named 'builder'?",
                "options": [
                    "COPY --from=builder /app/dist /app",
                    "IMPORT /app/dist FROM builder",
                    "PULL builder:/app/dist",
                    "FETCH --stage=builder /app"
                ],
                "correct_answer": "COPY --from=builder /app/dist /app",
                "hint": "Check the --from flag on the standard COPY directive.",
                "explanation": "COPY --from=<stage_name> copies files from a named prior stage into the current layer."
            }
        ]
    },
    "FastAPI Async Endpoints": {
        "category": "BACKEND",
        "questions": [
            {
                "id": "fa-q1",
                "question": "When defining `async def route()` in FastAPI, what happens if you execute a synchronous blocking operation like `time.sleep(5)` inside it?",
                "options": [
                    "FastAPI automatically offloads it to a background threadpool.",
                    "It blocks the entire single-threaded asyncio event loop, stalling all other concurrent client requests.",
                    "It raises an AsyncExecutionException.",
                    "The operating system creates a new worker process."
                ],
                "correct_answer": "It blocks the entire single-threaded asyncio event loop, stalling all other concurrent client requests.",
                "hint": "async def runs on the main event loop thread.",
                "explanation": "Blocking operations inside an `async def` function block the asyncio event loop. For blocking tasks, use standard `def` (which FastAPI offloads to threadpool) or `anyio.to_thread.run_sync`."
            },
            {
                "id": "fa-q2",
                "question": "How does Pydantic v2 in FastAPI validate incoming request JSON bodies at runtime?",
                "options": [
                    "Through manual regex parsing in Python bytecode.",
                    "Through a high-performance compiled Rust core (pydantic-core) enforcing type safety and schema validation.",
                    "By querying SQLite schemas.",
                    "Through browser-side JavaScript verification."
                ],
                "correct_answer": "Through a high-performance compiled Rust core (pydantic-core) enforcing type safety and schema validation.",
                "hint": "Pydantic v2 was rewritten in a compiled systems language.",
                "explanation": "Pydantic v2 is powered by pydantic-core compiled in Rust, providing 5x-20x faster JSON validation and strict type casting."
            }
        ]
    },
    "SQL Window Functions": {
        "category": "DATA",
        "questions": [
            {
                "id": "sql-q1",
                "question": "What is the key difference between ROW_NUMBER(), RANK(), and DENSE_RANK() when two rows have identical values?",
                "options": [
                    "There is no difference; they are aliases.",
                    "ROW_NUMBER assigns distinct consecutive integers; RANK skips ranks after ties (1, 2, 2, 4); DENSE_RANK does not skip ranks (1, 2, 2, 3).",
                    "DENSE_RANK only works on integer primary keys.",
                    "RANK sorts in descending order while DENSE_RANK sorts in ascending order."
                ],
                "correct_answer": "ROW_NUMBER assigns distinct consecutive integers; RANK skips ranks after ties (1, 2, 2, 4); DENSE_RANK does not skip ranks (1, 2, 2, 3).",
                "hint": "Consider how ties are numbered: 1, 2, 2, 4 vs 1, 2, 2, 3.",
                "explanation": "RANK() leaves gaps corresponding to the number of tied rows, whereas DENSE_RANK() increments immediately without gaps."
            },
            {
                "id": "sql-q2",
                "question": "Does a SQL Window Function using `OVER (PARTITION BY department_id)` collapse multiple rows into a single summary row like `GROUP BY` does?",
                "options": [
                    "Yes, it always collapses rows into a single record per partition.",
                    "No, window functions preserve individual row identity while calculating aggregate metrics across the partition.",
                    "Only when combined with HAVING clauses.",
                    "Yes, but only in MySQL, not in PostgreSQL."
                ],
                "correct_answer": "No, window functions preserve individual row identity while calculating aggregate metrics across the partition.",
                "hint": "Think about calculating running totals alongside individual transactions.",
                "explanation": "Window functions retain all original input rows while broadcasting the window calculation across each row."
            }
        ]
    },
    "Python OOP & Metaclasses": {
        "category": "LANGUAGES",
        "questions": [
            {
                "id": "py-q1",
                "question": "What is a Python Metaclass fundamentally?",
                "options": [
                    "A subclass of object that cannot be instantiated.",
                    "A class of a class; it defines how a class itself is constructed and instantiated.",
                    "An internal CPython garbage collection hook.",
                    "A decorator used exclusively for asynchronous methods."
                ],
                "correct_answer": "A class of a class; it defines how a class itself is constructed and instantiated.",
                "hint": "Just as an object is an instance of a class, a class is an instance of a metaclass (like `type`).",
                "explanation": "In Python, classes are objects. A metaclass defines the rules and construction pipeline for creating classes, inheriting typically from `type`."
            },
            {
                "id": "py-q2",
                "question": "What is the primary runtime efficiency benefit of declaring `__slots__ = ('x', 'y')` in a Python class?",
                "options": [
                    "It converts the class to C++ at runtime.",
                    "It eliminates the per-instance `__dict__`, substantially reducing memory footprint when instantiating millions of objects.",
                    "It prevents the class from being garbage collected.",
                    "It makes all attributes public and immutable."
                ],
                "correct_answer": "It eliminates the per-instance `__dict__`, substantially reducing memory footprint when instantiating millions of objects.",
                "hint": "Standard Python objects allocate a dictionary per instance.",
                "explanation": "__slots__ replaces the dynamic __dict__ dictionary with a fixed-size compact array of pointers, saving ~60% memory per instance."
            }
        ]
    }
}

# Generic fallback questions if a custom concept is queried
GENERIC_CONCEPT_QUESTIONS = [
    {
        "id": "gen-q1",
        "question": "When applying this concept in production, what is the most important trade-off to evaluate?",
        "options": [
            "Balancing computational complexity / latency with maintainability and fault tolerance.",
            "Ignoring unit test coverage in favor of rapid deployment.",
            "Always choosing the most complex architectural pattern regardless of scale.",
            "Hardcoding credentials directly into source control."
        ],
        "correct_answer": "Balancing computational complexity / latency with maintainability and fault tolerance.",
        "hint": "Think about standard engineering design principles.",
        "explanation": "Production engineering always balances computational efficiency, latency budgets, and long-term system maintainability."
    },
    {
        "id": "gen-q2",
        "question": "How does spaced retrieval practice reinforce neural retention for this concept?",
        "options": [
            "By passively reading documentation repeatedly.",
            "By actively retrieving concepts from memory near the decay threshold, strengthening synaptic connections.",
            "By cramming right before an assessment.",
            "Memory does not decay over time."
        ],
        "correct_answer": "By actively retrieving concepts from memory near the decay threshold, strengthening synaptic connections.",
        "hint": "Think about the Ebbinghaus forgetting curve and active recall.",
        "explanation": "Active retrieval forces cognitive effort, which significantly increases memory stability and halts exponential decay."
    }
]

class LearningDecayEngine:
    @staticmethod
    def calculate_current_retention(stability_days: float, last_reviewed_iso: str) -> tuple[float, float, str]:
        """
        Calculates Ebbinghaus retention: R(t) = exp(-t / S) * 100
        Returns (retention_pct, elapsed_days, decay_status)
        """
        try:
            last_dt = datetime.datetime.fromisoformat(last_reviewed_iso)
            if last_dt.tzinfo is not None:
                last_dt = last_dt.replace(tzinfo=None)
        except Exception:
            last_dt = datetime.datetime.now() - datetime.timedelta(days=2)

        elapsed_seconds = max(0.0, (datetime.datetime.now() - last_dt).total_seconds())
        elapsed_days = elapsed_seconds / 86400.0

        s = max(0.5, float(stability_days))
        retention = math.exp(-elapsed_days / s) * 100.0
        retention = round(max(5.0, min(100.0, retention)), 1)

        if retention < 60.0:
            status = "CRITICAL"
        elif retention < 75.0:
            status = "WARNING"
        elif retention < 90.0:
            status = "OPTIMAL"
        else:
            status = "MASTERED"

        return retention, round(elapsed_days, 1), status

    @staticmethod
    def get_scheduled_retest_interval_days(repetition_count: int, is_weak: bool) -> int:
        """
        Spaced review schedule:
        If weak: retest in 1 day.
        Repetition 1: 2 days.
        Repetition 2: 7 days.
        Repetition 3: 14 days.
        Repetition 4+: 30 days.
        """
        if is_weak:
            return 1
        if repetition_count <= 1:
            return 2
        elif repetition_count == 2:
            return 7
        elif repetition_count == 3:
            return 14
        else:
            return 30

    @classmethod
    def get_decay_status(cls, user_id: str) -> LearningDecayStatusResponse:
        """Fetch all user decay concepts, calculate live retention, scheduled retests, and weak topics."""
        DatabaseManager.seed_default_learning_decay_if_empty(user_id)
        records = DatabaseManager.get_learning_decay_records(user_id)

        all_concepts: List[LearningDecayConcept] = []
        urgent_queue: List[LearningDecayConcept] = []
        weak_topics: List[str] = []

        critical_count = 0
        warning_count = 0
        mastered_count = 0
        total_retention = 0.0

        for r in records:
            retention, elapsed_days, status = cls.calculate_current_retention(
                stability_days=r.get("stability_days", 3.0),
                last_reviewed_iso=r.get("last_reviewed_at", datetime.datetime.now().isoformat())
            )

            reps = int(r.get("repetition_count", 1))
            is_weak = retention < 60.0 or r.get("is_weak", 0) == 1
            if is_weak and r["concept_name"] not in weak_topics:
                weak_topics.append(r["concept_name"])

            interval_days = cls.get_scheduled_retest_interval_days(reps, is_weak)
            next_date = (datetime.datetime.now() + datetime.timedelta(days=interval_days)).strftime("%d %b")

            rec_action = f"Next revision scheduled: in {interval_days} days ({next_date})"
            if status == "CRITICAL":
                critical_count += 1
                rec_action = f"🚨 Immediate recall quiz required today! (Retention {retention}% < 60%)"
            elif status == "WARNING":
                warning_count += 1
                rec_action = f"⚠️ Retention dipping. Practice 2-question drill within 24h ({next_date})"
            elif status == "OPTIMAL":
                rec_action = f"✅ Memory trace strong. Spaced retest scheduled in {interval_days} days ({next_date})"
            else:
                mastered_count += 1
                rec_action = f"🏆 Long-term retention established. Periodic booster in {interval_days} days ({next_date})"

            concept_obj = LearningDecayConcept(
                concept_name=r["concept_name"],
                category=r.get("category", "GENERAL"),
                stability_days=round(r.get("stability_days", 3.0), 1),
                repetition_count=reps,
                last_reviewed_at=r.get("last_reviewed_at", ""),
                retention_pct=retention,
                decay_status=status,
                days_since_review=elapsed_days,
                recommended_action=rec_action,
                next_scheduled_review=next_date,
                next_scheduled_days=interval_days,
                is_weak_topic=is_weak
            )
            all_concepts.append(concept_obj)
            total_retention += retention

            if status in ["CRITICAL", "WARNING"]:
                urgent_queue.append(concept_obj)

        urgent_queue.sort(key=lambda c: c.retention_pct)
        all_concepts.sort(key=lambda c: c.retention_pct)

        overall_score = round(total_retention / max(1, len(all_concepts)), 1)

        return LearningDecayStatusResponse(
            overall_retention_score=overall_score,
            critical_concepts_count=critical_count,
            warning_concepts_count=warning_count,
            mastered_concepts_count=mastered_count,
            weak_topics_list=weak_topics,
            urgent_review_queue=urgent_queue,
            all_concepts=all_concepts
        )

    @classmethod
    def get_concept_quiz(cls, concept_name: str) -> ConceptQuizResponse:
        """Returns 2-question conceptual quiz for the specified topic."""
        bank_entry = CONCEPT_QUIZ_BANK.get(concept_name)
        if not bank_entry:
            # Check case-insensitive
            for key, val in CONCEPT_QUIZ_BANK.items():
                if key.lower() == concept_name.lower():
                    bank_entry = val
                    concept_name = key
                    break

        if bank_entry:
            cat = bank_entry.get("category", "CORE_CS")
            raw_qs = bank_entry.get("questions", [])
        else:
            cat = "GENERAL"
            raw_qs = GENERIC_CONCEPT_QUESTIONS

        quiz_questions = [
            ConceptQuizQuestion(
                id=q["id"],
                question=q["question"],
                options=q["options"],
                hint=q.get("hint")
            )
            for q in raw_qs
        ]

        return ConceptQuizResponse(
            concept_name=concept_name,
            category=cat,
            questions=quiz_questions
        )

    @classmethod
    def submit_concept_quiz(cls, user_id: str, req: SubmitConceptQuizRequest) -> ConceptQuizEvaluationResponse:
        """Evaluates quiz, recalculates Ebbinghaus stability, schedules retest, and updates database."""
        concept_name = req.concept_name or req.concept_id or "General CS Concept"
        bank_entry = CONCEPT_QUIZ_BANK.get(concept_name)
        if not bank_entry:
            for key, val in CONCEPT_QUIZ_BANK.items():
                if key.lower() == concept_name.lower():
                    bank_entry = val
                    concept_name = key
                    break

        questions_ref = bank_entry.get("questions", []) if bank_entry else GENERIC_CONCEPT_QUESTIONS

        # Normalize user answers dictionary from either user_answers or answers list
        answers_dict = dict(req.user_answers or {})
        if not answers_dict and req.answers:
            for item in req.answers:
                if isinstance(item, dict):
                    qid = item.get("question_id") or item.get("id")
                    ans = item.get("selected_answer") or item.get("answer") or ""
                    if qid:
                        answers_dict[qid] = ans

        correct_count = 0
        total_questions = len(questions_ref)
        explanations = []

        for q in questions_ref:
            qid = q["id"]
            user_ans = answers_dict.get(qid, "").strip()
            correct_ans = q["correct_answer"].strip()
            is_correct = user_ans == correct_ans
            if is_correct:
                correct_count += 1
            explanations.append({
                "question_id": qid,
                "question": q["question"],
                "user_answer": user_ans,
                "correct_answer": correct_ans,
                "is_correct": is_correct,
                "explanation": q.get("explanation", "")
            })

        score_pct = int(round((correct_count / max(1, total_questions)) * 100))
        passed = score_pct >= 70

        # Review concept and boost/penalize stability
        review_result = cls.review_concept(user_id, concept_name, performance_score=score_pct / 100.0)

        # Spaced repetition schedule based on performance and repetitions
        reps = review_result.get("repetitions", 1)
        next_days = cls.get_scheduled_retest_interval_days(reps, is_weak=not passed)
        next_date = (datetime.datetime.now() + datetime.timedelta(days=next_days)).strftime("%d %b")

        return ConceptQuizEvaluationResponse(
            concept_name=concept_name,
            score_pct=score_pct,
            passed=passed,
            new_retention_pct=100.0 if passed else 60.0,
            new_stability_days=review_result.get("new_stability_days", 3.0),
            next_review_days=next_days,
            next_review_date=next_date,
            is_weak_topic=not passed,
            explanations=explanations,
            question_evaluations=explanations
        )

    @classmethod
    def review_concept(cls, user_id: str, concept_name: str, performance_score: float = 1.0) -> Dict[str, Any]:
        """Record that user reviewed/tested a concept. Boosts stability S and resets elapsed days to 0."""
        records = DatabaseManager.get_learning_decay_records(user_id)
        matching = next((r for r in records if r["concept_name"].lower() == concept_name.lower()), None)

        now_iso = datetime.datetime.now().isoformat()

        if matching:
            old_s = float(matching.get("stability_days", 3.0))
            old_reps = int(matching.get("repetition_count", 1))
            cat = matching.get("category", "GENERAL")

            if performance_score >= 0.7:
                multiplier = 1.5 + 0.25 * min(old_reps, 6)
                new_s = round(old_s * multiplier, 1)
                new_reps = old_reps + 1
            else:
                new_s = max(1.0, round(old_s * 0.75, 1))
                new_reps = old_reps

            new_retention = 100.0 if performance_score >= 0.7 else 60.0
            new_status = "MASTERED" if new_reps >= 4 else "OPTIMAL"

            DatabaseManager.upsert_learning_decay_concept(
                user_id=user_id,
                concept_name=matching["concept_name"],
                category=cat,
                stability_days=new_s,
                repetition_count=new_reps,
                retention_pct=new_retention,
                decay_status=new_status,
                last_reviewed_at=now_iso
            )
        else:
            new_s = 3.5
            new_reps = 1
            new_retention = 100.0 if performance_score >= 0.7 else 60.0
            new_status = "OPTIMAL"
            DatabaseManager.upsert_learning_decay_concept(
                user_id=user_id,
                concept_name=concept_name,
                category="AI_ML",
                stability_days=new_s,
                repetition_count=new_reps,
                retention_pct=new_retention,
                decay_status=new_status,
                last_reviewed_at=now_iso
            )

        DatabaseManager.record_completed_activity(
            user_id=user_id,
            activity_type="CONCEPT_REVISION",
            activity_title=f"Spaced Revision: {concept_name}",
            metadata={"performance_score": performance_score, "concept_name": concept_name}
        )

        return {
            "concept_name": concept_name,
            "status": "REVIEWED",
            "new_retention_pct": 100.0 if performance_score >= 0.7 else 60.0,
            "new_stability_days": new_s,
            "repetitions": new_reps
        }
