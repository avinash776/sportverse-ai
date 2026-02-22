# ==================================================
# SportVerse AI – Feature Extractor
# ==================================================
# Takes raw pose data and computes higher-level sport
# performance features: posture quality, balance,
# timing consistency, technique scores.
# ==================================================

import numpy as np
from typing import Dict, Any


# Ideal angle ranges per sport / movement (degrees)
IDEAL_ANGLES: Dict[str, Dict[str, tuple]] = {
    "cricket": {
        "right_elbow": (120, 160), "left_elbow": (100, 145),
        "right_shoulder": (60, 120), "left_shoulder": (50, 110),
        "right_knee": (120, 165), "left_knee": (110, 155),
        "right_hip": (140, 175), "left_hip": (135, 170),
    },
    "football": {
        "right_knee": (80, 140), "left_knee": (80, 140),
        "right_hip": (120, 170), "left_hip": (120, 170),
        "right_shoulder": (40, 100), "left_shoulder": (40, 100),
        "right_elbow": (80, 160), "left_elbow": (80, 160),
    },
    "badminton": {
        "right_elbow": (100, 175), "left_elbow": (90, 160),
        "right_shoulder": (80, 170), "left_shoulder": (60, 140),
        "right_knee": (110, 165), "left_knee": (100, 155),
        "right_hip": (130, 175), "left_hip": (125, 170),
    },
}


def extract_features(pose_data: dict, sport: str) -> dict:
    """
    Compute performance features from raw pose data.

    Returns a dict with:
      - posture_score, technique_score, timing_score, consistency_score,
        balance_score, overall_score  (all 0-100)
      - angle_deviations: per-joint information
      - detected_issues: list of human-readable issues
    """
    frames = pose_data.get("frames", [])
    summary = pose_data.get("summary", {})
    angle_stats = summary.get("angle_statistics", {})

    ideals = IDEAL_ANGLES.get(sport, IDEAL_ANGLES["cricket"])

    # --- per-joint deviation scoring ---
    joint_scores = {}
    deviations = {}
    for joint, (lo, hi) in ideals.items():
        stat = angle_stats.get(joint)
        if not stat:
            continue
        mean = stat["mean"]
        mid = (lo + hi) / 2
        half_range = (hi - lo) / 2
        dev = abs(mean - mid)
        score = max(0, 100 - (dev / half_range) * 50)
        joint_scores[joint] = round(score, 1)
        deviations[joint] = {
            "measured_mean": mean,
            "ideal_range": f"{lo}–{hi}",
            "deviation": round(dev, 1),
            "score": round(score, 1),
        }

    # --- aggregate scores ---
    scores = list(joint_scores.values()) or [50]
    posture_score = round(float(np.mean(scores)), 1)

    # Technique: penalise joints that are far outside ideal
    tech_vals = [min(s, 100) for s in scores]
    technique_score = round(float(np.percentile(tech_vals, 25) * 0.4 + np.mean(tech_vals) * 0.6), 1)

    # Consistency: lower std → more consistent
    stds = [s["std"] for s in angle_stats.values()]
    if stds:
        avg_std = float(np.mean(stds))
        consistency_score = round(max(0, 100 - avg_std * 3), 1)
    else:
        consistency_score = 50.0

    # Balance: compare left/right symmetry
    balance_diffs = []
    for side in ["elbow", "shoulder", "knee", "hip"]:
        left = angle_stats.get(f"left_{side}", {}).get("mean")
        right = angle_stats.get(f"right_{side}", {}).get("mean")
        if left is not None and right is not None:
            balance_diffs.append(abs(left - right))
    if balance_diffs:
        balance_score = round(max(0, 100 - float(np.mean(balance_diffs)) * 2), 1)
    else:
        balance_score = 50.0

    # Timing: stability of angles across frames
    timing_vals = []
    for f in frames:
        fr_scores = []
        for joint, (lo, hi) in ideals.items():
            v = f["angles"].get(joint, 0)
            if lo <= v <= hi:
                fr_scores.append(100)
            else:
                dev = min(abs(v - lo), abs(v - hi))
                fr_scores.append(max(0, 100 - dev * 2))
        timing_vals.append(float(np.mean(fr_scores)) if fr_scores else 50)
    timing_score = round(float(np.mean(timing_vals)), 1) if timing_vals else 50.0

    overall_score = round(
        posture_score * 0.25
        + technique_score * 0.25
        + consistency_score * 0.20
        + balance_score * 0.15
        + timing_score * 0.15,
        1,
    )

    # --- detect issues ---
    issues = []
    for joint, info in deviations.items():
        if info["score"] < 60:
            issues.append(
                f"{joint.replace('_', ' ').title()} angle "
                f"(avg {info['measured_mean']}°) is outside ideal range {info['ideal_range']}°"
            )
    if consistency_score < 60:
        issues.append("Movement consistency is low – focus on repeating the same motion pattern")
    if balance_score < 60:
        issues.append("Left/right body balance is uneven – work on symmetry drills")

    return {
        "posture_score": posture_score,
        "technique_score": technique_score,
        "timing_score": timing_score,
        "consistency_score": consistency_score,
        "balance_score": balance_score,
        "overall_score": overall_score,
        "angle_deviations": deviations,
        "detected_issues": issues,
        "sport": sport,
        "frames_analysed": len(frames),
    }
