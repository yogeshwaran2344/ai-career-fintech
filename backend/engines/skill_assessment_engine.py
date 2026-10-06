import uuid
from typing import Dict, List, Any
from models import SkillAssessmentQuestion, SkillAssessmentResult, StudentProfile, SkillItem
from engines.career_engine import CareerEngine

SKILL_QUESTION_BANKS: Dict[str, List[Dict[str, Any]]] = {
    "Python": [
        {
            "id": "py-1",
            "question": "What is the primary difference between a list comprehension and a generator expression in Python?",
            "options": [
                "Generator expressions evaluate lazily and yield values on demand, saving memory.",
                "List comprehensions are slower because they use CPython threads.",
                "Generator expressions can only be iterated over using a while loop.",
                "List comprehensions cannot contain conditional if-else statements."
            ],
            "correct_index": 0,
            "code_snippet": "# Generator vs List Comprehension\n(x**2 for x in range(1000000)) vs [x**2 for x in range(1000000)]",
            "difficulty": "Intermediate"
        },
        {
            "id": "py-2",
            "question": "What happens when you pass a mutable object (like a list) as a default argument in a Python function definition?",
            "options": [
                "A fresh list is created every time the function is called.",
                "The default list is bound at function definition time and shared across all calls.",
                "Python raises a SyntaxError during execution.",
                "The list becomes immutable automatically."
            ],
            "correct_index": 1,
            "code_snippet": "def append_to(val, target_list=[]):\n    target_list.append(val)\n    return target_list",
            "difficulty": "Intermediate"
        },
        {
            "id": "py-3",
            "question": "How does the Python Global Interpreter Lock (GIL) affect multi-threading and CPU-bound workloads?",
            "options": [
                "The GIL allows all CPU threads to run Python bytecode concurrently across all cores.",
                "The GIL prevents multiple native threads from executing Python bytecode simultaneously.",
                "The GIL is only active when working with SQLite databases.",
                "The GIL replaces the garbage collector in Python 3.12+."
            ],
            "correct_index": 1,
            "code_snippet": None,
            "difficulty": "Advanced"
        }
    ],
    "SQL": [
        {
            "id": "sql-1",
            "question": "What is the key difference between WHERE and HAVING clauses in SQL?",
            "options": [
                "WHERE filters rows before aggregation; HAVING filters aggregated groups after GROUP BY.",
                "HAVING is used exclusively with JOIN statements.",
                "WHERE cannot use comparison operators like >= or <.",
                "HAVING executes before WHERE in the SQL query execution lifecycle."
            ],
            "correct_index": 0,
            "code_snippet": "SELECT dept, AVG(salary) FROM employees WHERE active = 1 GROUP BY dept HAVING AVG(salary) > 80000;",
            "difficulty": "Intermediate"
        },
        {
            "id": "sql-2",
            "question": "What does a Window Function (like DENSE_RANK() OVER (PARTITION BY ... ORDER BY ...)) do without collapsing rows?",
            "options": [
                "It deletes duplicate rows in the partition.",
                "It calculates aggregate/ranking metrics across a row set while preserving individual row identity.",
                "It permanently creates a virtual table on the database server.",
                "It converts relational tables into JSON objects."
            ],
            "correct_index": 1,
            "code_snippet": None,
            "difficulty": "Advanced"
        }
    ],
    "Machine Learning": [
        {
            "id": "ml-1",
            "question": "Why is L1 regularization (Lasso) preferred over L2 regularization (Ridge) when feature selection is desired?",
            "options": [
                "L1 regularization drives irrelevant feature coefficients strictly to zero (sparse solutions).",
                "L1 regularization avoids computing gradients entirely.",
                "L2 regularization causes severe underfitting on non-linear datasets.",
                "L1 regularization only works with decision trees."
            ],
            "correct_index": 0,
            "code_snippet": None,
            "difficulty": "Intermediate"
        },
        {
            "id": "ml-2",
            "question": "What is the Bias-Variance tradeoff when increasing model complexity (e.g. deepening a Decision Tree)?",
            "options": [
                "Bias increases and Variance decreases, leading to underfitting.",
                "Bias decreases and Variance increases, leading to potential overfitting on training data.",
                "Both Bias and Variance decrease to zero simultaneously.",
                "Variance remains constant while Bias becomes negative."
            ],
            "correct_index": 1,
            "code_snippet": None,
            "difficulty": "Intermediate"
        }
    ],
    "DSA": [
        {
            "id": "dsa-1",
            "question": "What is the average time complexity of searching and inserting elements in a balanced Hash Map vs a Balanced BST (Red-Black Tree)?",
            "options": [
                "Hash Map: O(1) average; Balanced BST: O(log N) worst/average.",
                "Hash Map: O(N) average; Balanced BST: O(1) average.",
                "Hash Map: O(log N); Balanced BST: O(N^2).",
                "Both have guaranteed O(1) worst-case time complexity."
            ],
            "correct_index": 0,
            "code_snippet": None,
            "difficulty": "Intermediate"
        },
        {
            "id": "dsa-2",
            "question": "When solving the 0/1 Knapsack Problem, what is the state transition relation in Dynamic Programming?",
            "options": [
                "dp[i][w] = max(dp[i-1][w], dp[i-1][w - weight[i]] + val[i])",
                "dp[i][w] = dp[i-1][w] + dp[i][w - 1]",
                "dp[i] = min(dp[i - coin] + 1 for coin in coins)",
                "dp[i][w] = dp[i-1][w] * val[i]"
            ],
            "correct_index": 0,
            "code_snippet": None,
            "difficulty": "Advanced"
        }
    ]
}

# Generic fallback questions for any unlisted skill
GENERIC_SKILL_QUESTIONS = [
    {
        "id": "gen-s1",
        "question": "What is considered a best practice for writing maintainable, production-ready code in this technology?",
        "options": [
            "Writing modular, decoupled components with comprehensive unit tests and type annotations.",
            "Putting all logic inside a single monolithic global function for fast execution.",
            "Disabling all error handling and logging to reduce memory overhead.",
            "Hardcoding credentials and configuration directly into the source repository."
        ],
        "correct_index": 0,
        "code_snippet": None,
        "difficulty": "Intermediate"
    },
    {
        "id": "gen-s2",
        "question": "How do you effectively debug and isolate a high-memory or CPU leak in this framework?",
        "options": [
            "Profiling execution with memory profilers, inspection tools, and identifying uncollected references.",
            "Restarting the server automatically every 5 minutes.",
            "Deleting the database indexes to clear memory buffers.",
            "Ignoring the issue unless user traffic drops by 50%."
        ],
        "correct_index": 0,
        "code_snippet": None,
        "difficulty": "Intermediate"
    }
]

class SkillAssessmentEngine:
    @staticmethod
    def get_questions(skill_name: str) -> List[SkillAssessmentQuestion]:
        # Exact or partial match
        matched_bank = None
        for key in SKILL_QUESTION_BANKS:
            if key.lower() in skill_name.lower() or skill_name.lower() in key.lower():
                matched_bank = SKILL_QUESTION_BANKS[key]
                break

        raw_questions = matched_bank or GENERIC_SKILL_QUESTIONS
        return [
            SkillAssessmentQuestion(
                id=q["id"],
                skill_name=skill_name,
                question=q["question"],
                options=q["options"],
                code_snippet=q.get("code_snippet"),
                difficulty=q.get("difficulty", "Intermediate")
            )
            for q in raw_questions
        ]

    @staticmethod
    def evaluate_assessment(
        skill_name: str,
        user_answers: Dict[str, int],
        profile: StudentProfile
    ) -> SkillAssessmentResult:
        questions = SkillAssessmentEngine.get_questions(skill_name)
        total = len(questions)
        correct_count = 0

        for q in questions:
            # Look up correct index from bank
            matched_q = None
            for key in SKILL_QUESTION_BANKS:
                for item in SKILL_QUESTION_BANKS[key]:
                    if item["id"] == q.id:
                        matched_q = item
                        break
            if not matched_q:
                for item in GENERIC_SKILL_QUESTIONS:
                    if item["id"] == q.id:
                        matched_q = item
                        break

            if matched_q:
                user_choice = user_answers.get(q.id)
                if user_choice == matched_q["correct_index"]:
                    correct_count += 1

        score_pct = int((correct_count / max(1, total)) * 100)
        
        # Calculate new proficiency score (0.0 to 10.0 scale)
        current_prof = 5.0
        for s in profile.skills:
            if s.name.lower() == skill_name.lower():
                current_prof = s.proficiency
                break

        # Weighted update: Verified test score has high integrity
        test_score_prof = round((score_pct / 100.0) * 10.0, 1)
        new_prof = round((current_prof * 0.3) + (test_score_prof * 0.7), 1)
        new_prof = max(1.0, min(9.8, new_prof))

        # Update profile skill
        found = False
        for s in profile.skills:
            if s.name.lower() == skill_name.lower():
                s.proficiency = new_prof
                s.level = "Advanced" if new_prof >= 7.5 else "Intermediate" if new_prof >= 4.0 else "Beginner"
                found = True
                break
        if not found:
            profile.skills.append(SkillItem(
                name=skill_name,
                proficiency=new_prof,
                level="Advanced" if new_prof >= 7.5 else "Intermediate" if new_prof >= 4.0 else "Beginner",
                category="Verified Skill"
            ))

        # Recalculate readiness
        readiness_calc = CareerEngine.calculate_readiness(profile)
        new_readiness = readiness_calc.get("readiness_pct", 50)

        status_text = "Mastered" if score_pct >= 80 else "Proficient" if score_pct >= 50 else "Needs Practice"
        explanation = (
            f"You scored {correct_count}/{total} ({score_pct}%) in the {skill_name} Technical Assessment. "
            f"Your verified proficiency score was updated from {current_prof:.1f} → {new_prof:.1f}/10.0. "
            f"Placement Readiness is now {new_readiness}%."
        )

        return SkillAssessmentResult(
            skill_name=skill_name,
            score=correct_count,
            max_score=total,
            score_pct=score_pct,
            old_proficiency=current_prof,
            new_proficiency=new_prof,
            status=status_text,
            explanation=explanation,
            new_readiness_pct=new_readiness
        )
