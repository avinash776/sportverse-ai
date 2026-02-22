# ==================================================
# SportVerse AI – Coach Agent  (Gemini-powered)
# ==================================================
# Receives structured pose / performance data from the
# video pipeline, calls Gemini to produce personalised,
# dynamic coaching feedback with rich formatting.
# ==================================================

from typing import Dict, Any
from agents.gemini_client import ask_gemini_json


def generate_coaching_feedback(
    analysis_data: Dict[str, Any],
    sport: str,
    skill_level: str,
) -> Dict[str, Any]:
    """
    Given the numerical analysis produced by the video pipeline,
    call Gemini to generate human-readable coaching feedback
    with symbols, icons, and structured data for user-friendly display.
    """

    prompt = f"""You are an elite {sport} coach AI. A player ({skill_level} level) just had their training video analysed by computer vision.

Here is the structured analysis data extracted from their video:
```json
{__import__('json').dumps(analysis_data, indent=2)}
```

Based on this data, generate a comprehensive and USER-FRIENDLY coaching report. Use emoji symbols to make it visually engaging and easy to understand.

Return ONLY valid JSON (no markdown fences) with exactly this structure:
{{
  "summary": "2-3 sentence overall assessment with emoji like 🎯 🏆",
  "overall_rating": "A+ / A / B+ / B / C+ / C / D based on overall score",
  "performance_level": "Elite / Advanced / Intermediate / Developing / Beginner",
  "strengths": [
    {{
      "title": "💪 Strength title",
      "description": "Detailed explanation referencing actual scores",
      "icon": "💪"
    }}
  ],
  "areas_to_improve": [
    {{
      "title": "🎯 Area title",
      "description": "What needs improvement and why",
      "priority": "high / medium / low",
      "icon": "🎯",
      "current_score": 65,
      "target_score": 80
    }}
  ],
  "specific_drills": [
    {{
      "name": "🏋️ Drill name",
      "duration": "15 mins",
      "description": "Step-by-step instructions for the drill",
      "difficulty": "⭐⭐⭐ (3/5)",
      "sets_reps": "3 sets x 10 reps",
      "focus_area": "posture / technique / timing / consistency / balance",
      "icon": "🏋️",
      "equipment": "None / Cones / Ball / etc."
    }}
  ],
  "technique_tips": [
    {{
      "title": "📌 Tip title",
      "description": "Specific technical adjustment to make",
      "before": "❌ What you're doing wrong",
      "after": "✅ What you should do instead",
      "icon": "📌"
    }}
  ],
  "progress_milestones": [
    {{
      "milestone": "🏅 Milestone description",
      "timeline": "1-2 weeks",
      "indicator": "How the player will know they've achieved it"
    }}
  ],
  "recovery_advice": {{
    "title": "🧘 Recovery & Injury Prevention",
    "tips": ["tip 1 with emoji", "tip 2 with emoji", "tip 3 with emoji"],
    "rest_days_recommended": 2
  }},
  "nutrition_quick_tips": [
    "🥗 Pre-training: ...",
    "🍌 Post-training: ...",
    "💧 Hydration: ..."
  ],
  "motivation": "🔥 A short personalised motivational message referencing their actual performance"
}}

IMPORTANT RULES:
- Make ALL advice specific to {sport} and {skill_level} level
- Reference ACTUAL scores and angles from the analysis data (e.g., "Your posture score of 72 shows...")
- Use emoji symbols throughout for visual appeal (🎯 💪 🏋️ ⭐ 🏆 ✅ ❌ 📌 🔥 🥇 etc.)
- Give at least 3 strengths, 3 areas to improve, 4 drills, 3 technique tips, 3 milestones
- Difficulty should use star ratings (⭐ to ⭐⭐⭐⭐⭐)
- Be encouraging but honest. Never use generic placeholder text."""

    return ask_gemini_json(prompt)


def generate_video_training_plan(
    analysis_data: Dict[str, Any],
    sport: str,
    skill_level: str,
) -> Dict[str, Any]:
    """
    After video analysis, generate a follow-up training plan
    that directly addresses the weaknesses found, with rich formatting.
    """

    prompt = f"""You are an AI sports coach for {sport}. Based on the following video analysis data for a {skill_level} player:

```json
{__import__('json').dumps(analysis_data, indent=2)}
```

Create a targeted 1-week training plan to address the weaknesses found. Make it USER-FRIENDLY with emoji symbols and clear structure.

Return ONLY valid JSON:
{{
  "overview": "📋 Brief paragraph summarising the plan focus with emoji",
  "plan_difficulty": "⭐⭐⭐ (3/5)",
  "estimated_improvement": "Estimated score improvement after 1 week",
  "weekly_schedule": {{
    "monday": {{
      "theme": "💪 Day Theme (e.g., Strength & Technique)",
      "total_duration": "60 mins",
      "activities": [
        {{
          "activity": "🏏 Activity name with emoji",
          "duration": "15 mins",
          "description": "Detailed instructions",
          "focus_area": "posture / technique / timing",
          "intensity": "🟢 Low / 🟡 Medium / 🔴 High",
          "sets_reps": "3x10 or continuous",
          "rest_between": "30 sec"
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
  "key_focus_areas": [
    {{
      "area": "🎯 Focus area name",
      "why": "Why this matters based on analysis",
      "target_improvement": "+10 points in posture score"
    }}
  ],
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
  ],
  "nutrition_plan": {{
    "pre_workout": "🥗 What to eat before training",
    "post_workout": "🍌 What to eat after training",
    "hydration": "💧 Daily water intake recommendation",
    "supplements": "💊 Optional supplement suggestions"
  }},
  "weekly_targets": [
    {{
      "target": "🎯 Specific measurable target",
      "metric": "What to measure",
      "current": "Current value from analysis",
      "goal": "Target value by end of week"
    }}
  ],
  "motivational_message": "🏆 Personalised motivational message referencing their specific scores and potential"
}}

IMPORTANT: Reference actual scores from the data. Tailor intensity to {skill_level} level. Use emoji symbols throughout. Every day must have the full activities array structure."""

    return ask_gemini_json(prompt)
