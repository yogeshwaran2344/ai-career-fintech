import math
import datetime
from typing import Dict, Any, List, Optional
from database import DatabaseManager
from models import LearningDecayConcept, LearningDecayStatusResponse

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
        # Ebbinghaus exponential decay
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

    @classmethod
    def get_decay_status(cls, user_id: str) -> LearningDecayStatusResponse:
        """Fetch all user decay concepts, calculate live retention, and return queue."""
        # Ensure default concepts seeded if empty
        DatabaseManager.seed_default_learning_decay_if_empty(user_id)
        records = DatabaseManager.get_learning_decay_records(user_id)

        all_concepts: List[LearningDecayConcept] = []
        urgent_queue: List[LearningDecayConcept] = []

        critical_count = 0
        warning_count = 0
        mastered_count = 0
        total_retention = 0.0

        for r in records:
            retention, elapsed_days, status = cls.calculate_current_retention(
                stability_days=r.get("stability_days", 3.0),
                last_reviewed_iso=r.get("last_reviewed_at", datetime.datetime.now().isoformat())
            )

            rec_action = "Routine spaced practice"
            if status == "CRITICAL":
                critical_count += 1
                rec_action = "🚨 Immediate revision required today to prevent memory loss"
            elif status == "WARNING":
                warning_count += 1
                rec_action = "⚠️ Solve 3-5 drill problems within 24 hours"
            elif status == "OPTIMAL":
                rec_action = "✅ Memory trace strong; scheduled for spaced booster"
            else:
                mastered_count += 1
                rec_action = "🏆 Long-term retention established; periodic check"

            concept_obj = LearningDecayConcept(
                concept_name=r["concept_name"],
                category=r.get("category", "GENERAL"),
                stability_days=round(r.get("stability_days", 3.0), 1),
                repetition_count=r.get("repetition_count", 1),
                last_reviewed_at=r.get("last_reviewed_at", ""),
                retention_pct=retention,
                decay_status=status,
                days_since_review=elapsed_days,
                recommended_action=rec_action
            )
            all_concepts.append(concept_obj)
            total_retention += retention

            if status in ["CRITICAL", "WARNING"]:
                urgent_queue.append(concept_obj)

        # Sort urgent queue by retention ascending (most critical first)
        urgent_queue.sort(key=lambda c: c.retention_pct)
        all_concepts.sort(key=lambda c: c.retention_pct)

        overall_score = round(total_retention / max(1, len(all_concepts)), 1)

        return LearningDecayStatusResponse(
            overall_retention_score=overall_score,
            critical_concepts_count=critical_count,
            warning_concepts_count=warning_count,
            mastered_concepts_count=mastered_count,
            urgent_review_queue=urgent_queue,
            all_concepts=all_concepts
        )

    @classmethod
    def review_concept(cls, user_id: str, concept_name: str, performance_score: float = 1.0) -> Dict[str, Any]:
        """
        Record that user reviewed/tested a concept.
        Boosts stability S and resets elapsed days to 0.
        """
        records = DatabaseManager.get_learning_decay_records(user_id)
        matching = next((r for r in records if r["concept_name"].lower() == concept_name.lower()), None)

        now_iso = datetime.datetime.now().isoformat()

        if matching:
            old_s = float(matching.get("stability_days", 3.0))
            old_reps = int(matching.get("repetition_count", 1))
            cat = matching.get("category", "GENERAL")

            if performance_score >= 0.7:
                # Successful recall: increase memory stability
                multiplier = 1.5 + 0.25 * min(old_reps, 6)
                new_s = round(old_s * multiplier, 1)
                new_reps = old_reps + 1
            else:
                # Failed recall: stability drops slightly, restart interval
                new_s = max(1.0, round(old_s * 0.75, 1))
                new_reps = old_reps

            new_retention = 100.0
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
            # Brand new concept review
            new_s = 3.5
            new_reps = 1
            new_retention = 100.0
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

        # Log activity
        DatabaseManager.record_completed_activity(
            user_id=user_id,
            activity_type="CONCEPT_REVISION",
            activity_title=f"Spaced Revision: {concept_name}",
            metadata={"performance_score": performance_score, "concept_name": concept_name}
        )

        return {
            "concept_name": concept_name,
            "status": "REVIEWED",
            "new_retention_pct": 100.0,
            "new_stability_days": new_s,
            "repetitions": new_reps
        }
