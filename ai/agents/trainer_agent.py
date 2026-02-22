# ==================================================
# SportVerse AI – Trainer Agent  (Gemini-powered)
# ==================================================
# Handles the "AI Trainer" module: takes user inputs
# (sport, level, goal, time) and generates a fully
# dynamic training plan via Gemini with rich formatting.
# ==================================================

import json
from typing import Dict, Any
from agents.gemini_client import ask_gemini_json


def generate_training_plan(
    sport: str,
    skill_level: str,
    goal: str,
    user_name: str = "Athlete",
    duration_weeks: int = 4,
    additional_info: str = "",
) -> Dict[str, Any]:
    """
    Generate a fully personalised multi-week training plan
    using Gemini with rich emoji formatting and structured data.
    """

    prompt = f"""You are an elite AI sports coach. Create a highly personalised {duration_weeks}-week training plan with rich visual formatting.

Player profile:
- Name: {user_name}
- Sport: {sport}
- Skill level: {skill_level}
- Primary goal: {goal}
- Additional context: {additional_info or 'None provided'}

Return ONLY valid JSON with this structure:
{{
  "player_name": "{user_name}",
  "sport": "{sport}",
  "skill_level": "{skill_level}",
  "goal": "{goal}",
  "duration_weeks": {duration_weeks},
  "plan_difficulty": "⭐⭐⭐ (3/5)",
  "overview": "🏆 Comprehensive 3-4 sentence plan overview personalised to this player with emoji",
  "weekly_schedule": {{
    "monday": {{
      "theme": "💪 Day Theme",
      "total_duration": "60 mins",
      "activities": [
        {{
          "activity": "🏏 Activity name with emoji",
          "duration": "X mins",
          "description": "Detailed step-by-step instructions",
          "sets": "3 sets",
          "reps": "10 reps",
          "intensity": "🟢 Low / 🟡 Medium / 🔴 High",
          "rest_between": "30 sec",
          "category": "technique / strength / cardio / flexibility"
        }}
      ]
    }},
    "tuesday": {{ ... same structure ... }},
    "wednesday": {{ ... same structure ... }},
    "thursday": {{ ... same structure ... }},
    "friday": {{ ... same structure ... }},
    "saturday": {{ ... same structure ... }},
    "sunday": {{
      "theme": "🧘 Active Recovery",
      "total_duration": "30 mins",
      "activities": [...]
    }}
  }},
  "drills": [
    {{
      "name": "🎯 Drill name with emoji",
      "category": "technique / stamina / speed / accuracy / flexibility",
      "duration": "X mins",
      "description": "Step-by-step how to perform it",
      "difficulty": "⭐⭐⭐ (3/5)",
      "equipment_needed": "list or None",
      "sets_reps": "3x10",
      "benefit": "What this drill improves",
      "icon": "🎯"
    }},
    ... (at least 6 drills)
  ],
  "resources": [
    {{ "title": "📹 Video/article title", "url": "real youtube search URL for the topic", "type": "video / article", "icon": "📹" }},
    ... (at least 4 resources)
  ],
  "warmup_cooldown": {{
    "warmup": [
      {{
        "exercise": "🔥 Warm-up exercise name",
        "duration": "3 mins",
        "description": "How to perform it"
      }}
    ],
    "cooldown": [
      {{
        "exercise": "❄️ Cool-down exercise name",
        "duration": "3 mins",
        "description": "How to perform it"
      }}
    ]
  }},
  "nutrition_plan": {{
    "pre_workout": "🥗 What to eat 1-2hrs before training",
    "post_workout": "🍌 What to eat within 30 mins after training",
    "daily_diet": "🍽️ General daily nutrition advice",
    "hydration": "💧 Water intake recommendation",
    "foods_to_avoid": "🚫 Foods to avoid during training period"
  }},
  "recovery_tips": {{
    "rest_days": "📅 Recommended rest schedule",
    "sleep": "😴 Sleep recommendation",
    "stretching": "🧘 Stretching routine",
    "injury_prevention": "🩹 Key injury prevention tips"
  }},
  "weekly_goals": [
    {{
      "week": 1,
      "goal": "🎯 Week 1 specific measurable goal",
      "focus": "What to focus on this week",
      "milestone": "🏅 How to know you've succeeded"
    }},
    ... (one per week)
  ],
  "progress_tracking": {{
    "metrics_to_track": ["📊 Metric 1", "📊 Metric 2", "📊 Metric 3"],
    "check_in_schedule": "When to evaluate progress",
    "signs_of_improvement": ["✅ Sign 1", "✅ Sign 2", "✅ Sign 3"]
  }},
  "motivational_message": "🔥 Personalised motivational message for {user_name} with emoji"
}}

IMPORTANT:
- Be specific and practical for {sport} at {skill_level} level aiming for {goal}
- Use emoji symbols throughout (🏋️ 💪 🎯 ⭐ 🏆 ✅ 🔥 🥇 📊 etc.)
- Every piece of advice must be tailored, NOT generic
- Each day must have the full object structure with theme, total_duration, activities array
- Include at least 3-4 activities per training day
- Difficulty ratings use star emojis (⭐ to ⭐⭐⭐⭐⭐)
- Do NOT use placeholders like "..." or "etc"."""

    return ask_gemini_json(prompt)


def get_coaching_tips(
    sport: str,
    skill_level: str,
    area: str = "general",
) -> Dict[str, Any]:
    """
    Get focused coaching tips for a specific area with rich formatting.
    """

    prompt = f"""You are an expert {sport} coach. Provide detailed coaching tips for a {skill_level} player who wants to improve their {area} skills.

Return ONLY valid JSON with emoji formatting:
{{
  "area": "{area}",
  "sport": "{sport}",
  "tips": [
    {{
      "title": "📌 Tip title with emoji",
      "description": "Detailed explanation (2-3 sentences)",
      "drill": "🏋️ A specific drill to practice this",
      "common_mistake": "❌ What players usually do wrong",
      "correct_form": "✅ The correct way to do it",
      "difficulty": "⭐⭐⭐ (3/5)",
      "icon": "📌"
    }},
    ... (provide exactly 5 tips)
  ],
  "key_principle": "🎯 The single most important thing to remember",
  "progress_indicators": [
    "✅ Sign of improvement 1",
    "✅ Sign of improvement 2",
    "✅ Sign of improvement 3"
  ],
  "recommended_schedule": "📅 How often to practice this area"
}}"""

    return ask_gemini_json(prompt)
