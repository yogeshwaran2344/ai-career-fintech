import datetime
from typing import List, Dict, Any, Tuple, Optional
from models import StudentProfile, DailyActionPlan, DailyTask, SkillItem
from engines.career_engine import CareerEngine
from database import DatabaseManager

class ProgressEngine:
    @classmethod
    def generate_daily_plan(cls, profile: StudentProfile, target_date: Optional[str] = None) -> DailyActionPlan:
        date_obj = datetime.date.today()
        today_iso = target_date or date_obj.strftime("%Y-%m-%d")
        today_str = date_obj.strftime("%A, %B %d, %Y")
        hours = max(1.0, profile.preferences.study_hours_per_day)
        total_mins = int(hours * 60)
        
        # Check if tasks for this user & date already exist in SQLite
        existing_rows = DatabaseManager.get_daily_tasks(profile.id, today_iso)
        if existing_rows:
            tasks = [
                DailyTask(
                    id=row["id"],
                    subject=row["subject"],
                    topic=row["topic"],
                    duration_minutes=row["duration_minutes"],
                    action_type=row["action_type"],
                    why_today=row["why_today"],
                    completed=(row["completed"] == 1)
                )
                for row in existing_rows
            ]
        else:
            # Analyze current gaps and learning decay to prioritize today's tasks
            gaps = CareerEngine.analyze_skill_gap(profile)
            weak_or_missing = [g for g in gaps if g.status in ["MISSING", "IN_PROGRESS"]]
            
            primary_gap = weak_or_missing[0].skill if len(weak_or_missing) > 0 else "System Design"
            secondary_gap = weak_or_missing[1].skill if len(weak_or_missing) > 1 else "Deep Learning"
            
            # Check urgent forgetting curve / decay concepts
            decay_concept = None
            try:
                from engines.learning_decay_engine import LearningDecayEngine
                decay_summary = LearningDecayEngine.get_decay_status(profile.id)
                if decay_summary.urgent_review_queue:
                    decay_concept = decay_summary.urgent_review_queue[0].concept_name
            except Exception:
                pass

            if total_mins >= 120:  # 2+ hours: 105 mins active study + 15 mins review = 120 mins
                review_topic = f"Spaced Repetition: {decay_concept} (Retention <60%)" if decay_concept else "Review 2 target job postings & 1 behavioral prompt"
                review_why = f"Predicted retention for {decay_concept} is dropping; 15-min active recall resets memory stability." if decay_concept else "Keeps you aligned with real-time 2026-2027 hiring requirements."

                tasks = [
                    DailyTask(
                        id=f"{today_iso}-task-1",
                        subject="DSA & Problem Solving",
                        topic="Binary Search & Two Pointers (NeetCode 150)",
                        duration_minutes=40,
                        action_type="DSA Practice",
                        why_today="Top filter in technical placement rounds; daily consistency builds algorithmic intuition.",
                        completed=False
                    ),
                    DailyTask(
                        id=f"{today_iso}-task-2",
                        subject=f"Core Skill: {primary_gap}",
                        topic=f"{primary_gap} Architecture & Hands-on Implementation",
                        duration_minutes=35,
                        action_type="Learn",
                        why_today=f"Directly bridges your #{1} highest missing gap for {profile.career_goal}.",
                        completed=False
                    ),
                    DailyTask(
                        id=f"{today_iso}-task-3",
                        subject="Portfolio Project",
                        topic=f"Implement REST API endpoints & Dockerfile for {secondary_gap} Capstone",
                        duration_minutes=30,
                        action_type="Code / Project",
                        why_today="Proves hands-on deployment capabilities to recruiters on GitHub.",
                        completed=False
                    ),
                    DailyTask(
                        id=f"{today_iso}-task-4",
                        subject="Review & Spaced Recall",
                        topic=review_topic,
                        duration_minutes=15,
                        action_type="Career / Review",
                        why_today=review_why,
                        completed=False
                    )
                ]
            else:  # 1 hour (60 mins)
                tasks = [
                    DailyTask(
                        id=f"{today_iso}-task-1",
                        subject="DSA Sprint",
                        topic="Solve 1 Medium LeetCode problem",
                        duration_minutes=30,
                        action_type="DSA Practice",
                        why_today="Maintains daily coding streak for campus placement.",
                        completed=False
                    ),
                    DailyTask(
                        id=f"{today_iso}-task-2",
                        subject=f"{primary_gap} Focus",
                        topic=f"Study core {primary_gap} module & implement 1 script",
                        duration_minutes=30,
                        action_type="Learn",
                        why_today=f"Closes your key skill gap for {profile.career_goal}.",
                        completed=False
                    )
                ]

            # Invariant: sum of task duration MUST NEVER exceed total_mins
            plan_sum = sum(t.duration_minutes for t in tasks)
            if plan_sum > total_mins:
                overflow = plan_sum - total_mins
                tasks[0].duration_minutes = max(15, tasks[0].duration_minutes - overflow)

            # Save into persistent SQLite DB
            DatabaseManager.save_daily_tasks(profile.id, today_iso, tasks)
            
        quotes = [
            "Small daily disciplines compound into extraordinary career milestones.",
            "You don't need 10 hours a day; you need 2 focused hours of deliberate practice.",
            "Skill by skill, project by project—your placement readiness is built today."
        ]
        quote = quotes[0]

        return DailyActionPlan(
            date_str=today_str,
            total_estimated_minutes=sum(t.duration_minutes for t in tasks),
            available_hours=hours,
            tasks=tasks,
            motivational_quote=quote
        )

    @classmethod
    def apply_progress_update(cls, profile: StudentProfile, skill_updates: Dict[str, float]) -> Tuple[StudentProfile, Dict[str, Any]]:
        old_pct, old_score, _, old_missing, _ = CareerEngine.calculate_readiness(profile, profile.career_goal)
        
        # Update skills in profile
        existing_skills_map = {s.name.lower(): s for s in profile.skills}
        for skill_name, new_val in skill_updates.items():
            key = skill_name.strip().lower()
            if key in existing_skills_map:
                existing_skills_map[key].proficiency = min(10.0, max(0.0, new_val))
                if new_val >= 7.5:
                    existing_skills_map[key].level = "Advanced"
                elif new_val >= 4.0:
                    existing_skills_map[key].level = "Intermediate"
                else:
                    existing_skills_map[key].level = "Beginner"
            else:
                profile.skills.append(SkillItem(
                    name=skill_name,
                    proficiency=new_val,
                    level="Advanced" if new_val >= 7.5 else ("Intermediate" if new_val >= 4.0 else "Beginner")
                ))
                
        # Grant XP and streak bonus
        profile.total_xp += 100
        if profile.total_xp >= 2000:
            profile.user_level = 9
            profile.level_title = "Placement Master"
        elif profile.total_xp >= 1500:
            profile.user_level = 8
            profile.level_title = "Interview Ready"
            
        new_pct, new_score, new_strong, new_missing, new_partial = CareerEngine.calculate_readiness(profile, profile.career_goal)
        pct_diff = new_pct - old_pct
        
        # Save to SQLite
        DatabaseManager.save_profile(profile)
        
        # Feedback narrative
        if pct_diff > 0:
            if new_missing:
                feedback = (
                    f"🎉 Great progress! Your {profile.career_goal} readiness increased from {old_pct}% to {new_pct}% (+{pct_diff}%). "
                    f"Your strongest growth was in {', '.join(skill_updates.keys())}. {new_missing[0]} is now your largest remaining gap."
                )
            else:
                feedback = (
                    f"🌟 Fantastic achievement! Your {profile.career_goal} readiness reached {new_pct}%. "
                    f"You have mastered all primary core requirements for this role."
                )
        elif pct_diff < 0:
            feedback = f"Profile adjusted: {profile.career_goal} readiness is now {new_pct}%."
        else:
            feedback = f"Progress saved. Current {profile.career_goal} readiness is {new_pct}%."

        update_summary = {
            "previous_readiness_pct": old_pct,
            "new_readiness_pct": new_pct,
            "change_pct": pct_diff,
            "feedback": feedback,
            "top_remaining_gap": new_missing[0] if new_missing else "None (Ready for Interviews!)"
        }
        return profile, update_summary
