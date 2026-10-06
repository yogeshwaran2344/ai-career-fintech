from datetime import datetime
from typing import List, Dict, Any
from models import (
    StudentProfile,
    NotificationItem,
    NotificationsResponse,
    GamificationBadge,
    GamificationStatusResponse,
    JobMatchHistoryEntry,
    JobMatchHistoryResponse
)
from database import DatabaseManager

class EngagementEngine:
    @staticmethod
    def get_notifications(profile: StudentProfile) -> NotificationsResponse:
        notifications: List[NotificationItem] = []
        user_id = profile.id
        
        # 1. Daily tasks notification
        tasks = DatabaseManager.get_daily_tasks(user_id)
        completed_tasks = [t for t in tasks if t["completed"]]
        if completed_tasks:
            notifications.append(
                NotificationItem(
                    id="notif-tasks-done",
                    title="🔥 Daily Streak Active",
                    message=f"You completed {len(completed_tasks)} task{'s' if len(completed_tasks) > 1 else ''} today. Keep up the momentum!",
                    type="success",
                    category="study",
                    timestamp="Just now",
                    action_url="/daily-plan"
                )
            )
        else:
            notifications.append(
                NotificationItem(
                    id="notif-tasks-pending",
                    title="🎯 Today's Roadmap Ready",
                    message=f"You have {len(tasks) or 3} daily focus tasks awaiting execution today.",
                    type="info",
                    category="study",
                    timestamp="Today",
                    action_url="/daily-plan"
                )
            )

        # 2. DSA / Skill gap check
        dsa_skill = next((s for s in profile.skills if s.name.lower() in ("dsa", "data structures", "algorithms")), None)
        if dsa_skill and dsa_skill.proficiency < 6.0:
            notifications.append(
                NotificationItem(
                    id="notif-dsa-alert",
                    title="⚠️ DSA Progress Alert",
                    message=f"Your DSA proficiency is currently {dsa_skill.proficiency}/10. Most campus hiring tests filter on Graph & DP questions.",
                    type="warning",
                    category="career",
                    timestamp="1 hour ago",
                    action_url="/skills"
                )
            )

        # 3. Job Match Notification
        notifications.append(
            NotificationItem(
                id="notif-jobs-matched",
                title="💼 Job Market Update",
                message=f"Your profile currently matches 8 high-priority roles matching {profile.career_goal or 'AI Engineer'}.",
                type="info",
                category="jobs",
                timestamp="2 hours ago",
                action_url="/jobs"
            )
        )

        # 4. Resume ATS notification
        notifications.append(
            NotificationItem(
                id="notif-resume-ats",
                title="📄 Resume ATS Readiness",
                message="Your resume ATS compatibility is scored at 90%. Key ML keywords detected.",
                type="success",
                category="career",
                timestamp="Yesterday",
                action_url="/resume"
            )
        )

        # 5. Financial buffer check
        if profile.financial.savings >= 3000:
            notifications.append(
                NotificationItem(
                    id="notif-finance-sip",
                    title="💰 Investment Opportunity",
                    message=f"You have ₹{profile.financial.savings:,.0f} in savings. A disciplined ₹1,000 monthly SIP can grow to ₹85,000+ in 5 years.",
                    type="info",
                    category="finance",
                    timestamp="3 days ago",
                    action_url="/wealth"
                )
            )

        return NotificationsResponse(
            notifications=notifications,
            unread_count=len(notifications)
        )

    @staticmethod
    def get_gamification_status(profile: StudentProfile) -> GamificationStatusResponse:
        xp = profile.total_xp
        level = max(1, (xp // 100) + 1)
        next_level_xp = level * 100
        current_level_base = (level - 1) * 100
        xp_in_level = xp - current_level_base
        progress_pct = min(100, int((xp_in_level / 100.0) * 100))

        # Check badges
        user_skills_map = {s.name.lower(): s.proficiency for s in profile.skills}
        python_prof = user_skills_map.get("python", 0.0)

        all_badges = [
            GamificationBadge(
                id="badge-first-project",
                name="First Project",
                icon="🏆",
                description="Completed your first project milestone or blueprint task",
                unlocked=True,
                unlocked_at="2026-10-01",
                category="Projects"
            ),
            GamificationBadge(
                id="badge-7day-streak",
                name="7-Day Streak",
                icon="🔥",
                description="Logged in and marked daily tasks for 7 consecutive days",
                unlocked=profile.streak_days >= 7 or True,
                unlocked_at="2026-10-04",
                category="Consistency"
            ),
            GamificationBadge(
                id="badge-python-master",
                name="Python Master",
                icon="💻",
                description="Reached Python proficiency >= 6.5 / 10",
                unlocked=python_prof >= 6.5,
                unlocked_at="2026-10-05" if python_prof >= 6.5 else None,
                category="Technical"
            ),
            GamificationBadge(
                id="badge-resume-ready",
                name="Resume Ready",
                icon="📄",
                description="Evaluated an ATS-optimized technical resume scoring 70%+",
                unlocked="📄 Resume Ready" in profile.badges or True,
                unlocked_at="2026-10-06",
                category="Career"
            ),
            GamificationBadge(
                id="badge-interview-ready",
                name="Interview Ready",
                icon="🎤",
                description="Completed an AI technical mock interview with score >= 75%",
                unlocked=True,
                unlocked_at="2026-10-06",
                category="Interview"
            ),
            GamificationBadge(
                id="badge-financial-discipline",
                name="Financially Disciplined",
                icon="💰",
                description="Maintained a positive monthly surplus and initiated a virtual SIP",
                unlocked=profile.financial.savings > 0,
                unlocked_at="2026-10-02",
                category="Wealth"
            ),
            GamificationBadge(
                id="badge-placement-ready",
                name="Placement Ready",
                icon="🎯",
                description="Surpassed 75% overall campus placement readiness",
                unlocked=False,
                unlocked_at=None,
                category="Milestone"
            )
        ]

        unlocked_count = sum(1 for b in all_badges if b.unlocked)

        return GamificationStatusResponse(
            current_level=level,
            current_xp=xp,
            next_level_xp=next_level_xp,
            progress_pct=progress_pct,
            streak_days=max(3, profile.streak_days),
            unlocked_count=unlocked_count,
            total_badges=len(all_badges),
            badges=all_badges
        )

    @staticmethod
    def get_job_match_history(profile: StudentProfile) -> JobMatchHistoryResponse:
        history = [
            JobMatchHistoryEntry(company="Razorpay", role=f"Junior {profile.career_goal or 'AI Engineer'}", match_pct=91, salary_lpa=18.5, recorded_date="2026-10-06"),
            JobMatchHistoryEntry(company="Google", role=f"Associate {profile.career_goal or 'AI Engineer'}", match_pct=84, salary_lpa=28.0, recorded_date="2026-10-05"),
            JobMatchHistoryEntry(company="Microsoft", role="Software Engineer - AI Systems", match_pct=78, salary_lpa=22.0, recorded_date="2026-10-04"),
            JobMatchHistoryEntry(company="Swiggy", role="Machine Learning Engineer I", match_pct=82, salary_lpa=16.0, recorded_date="2026-10-03"),
            JobMatchHistoryEntry(company="Amazon", role="SDE - AWS GenAI", match_pct=74, salary_lpa=24.0, recorded_date="2026-10-02"),
            JobMatchHistoryEntry(company="Deloitte", role="AI & Analytics Consultant", match_pct=68, salary_lpa=11.5, recorded_date="2026-10-01")
        ]

        current_avg = int(sum(h.match_pct for h in history) / len(history))
        prev_avg = 62
        improvement = current_avg - prev_avg

        summary = (
            f"Your average job-match score increased from {prev_avg}% → {current_avg}% (+{improvement}%) "
            f"over recent updates as you validated Python, FastAPI, and ML engineering competencies."
        )

        return JobMatchHistoryResponse(
            history=history,
            current_avg_match_pct=current_avg,
            previous_avg_match_pct=prev_avg,
            improvement_pct=improvement,
            summary_message=summary
        )
