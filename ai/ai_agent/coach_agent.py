# ==================================================
# SportVerse AI - AI Coaching Agent
# ==================================================
# Converts raw analysis metrics into human-readable coaching
# advice. Generates personalized training plans, drill
# suggestions, motivational feedback, and improvement tips.
# ==================================================

import random
from typing import Dict, List, Any


class CoachAgent:
    """
    AI Coaching Agent that interprets performance data and generates
    personalized coaching advice, training plans, and motivational feedback.
    """
    
    # Comprehensive knowledge base for each sport
    SPORT_KNOWLEDGE = {
        'cricket': {
            'name': 'Cricket',
            'positions': ['Batsman', 'Bowler', 'All-rounder', 'Wicketkeeper', 'Fielder'],
            'key_skills': ['batting', 'bowling', 'fielding', 'running between wickets', 'game awareness'],
            'common_mistakes': {
                'batting': [
                    'Head falling over to the off-side',
                    'Not getting to the pitch of the ball',
                    'Closing the bat face too early',
                    'Feet not moving to the ball',
                    'Gripping the bat too tightly'
                ],
                'bowling': [
                    'Front foot no-ball tendency',
                    'Arm not reaching full extension',
                    'Inconsistent release point',
                    'Falling away at the crease',
                    'Not following through properly'
                ],
                'general': [
                    'Poor head position affecting balance',
                    'Weight distribution needs adjustment',
                    'Follow through not completing fully',
                    'Stance too wide/narrow for optimal movement'
                ]
            },
            'drills': {
                'technique': [
                    {'name': 'Shadow Batting', 'duration': '15 mins', 'description': 'Practice batting strokes without a ball, focusing on footwork and body position'},
                    {'name': 'Throwdown Practice', 'duration': '20 mins', 'description': 'Face gentle throws focusing on timing and shot placement'},
                    {'name': 'Net Session', 'duration': '30 mins', 'description': 'Full practice session against bowling machines or bowlers'},
                    {'name': 'Short Catch Drill', 'duration': '10 mins', 'description': 'Quick reflex catching practice for close-in fielding'}
                ],
                'stamina': [
                    {'name': 'Interval Running', 'duration': '20 mins', 'description': 'Alternate between sprints and jogs to build cricket-specific stamina'},
                    {'name': 'Shuttle Runs', 'duration': '15 mins', 'description': 'Quick turns and sprints simulating running between wickets'},
                    {'name': 'Circuit Training', 'duration': '25 mins', 'description': 'Full body workout targeting cricket-specific muscle groups'}
                ],
                'accuracy': [
                    {'name': 'Target Bowling', 'duration': '20 mins', 'description': 'Bowl at specific targets on the pitch'},
                    {'name': 'Placement Batting', 'duration': '20 mins', 'description': 'Hit the ball into designated zones'},
                    {'name': 'Throwing Accuracy', 'duration': '15 mins', 'description': 'Aim throws at single stump from various distances'}
                ],
                'speed': [
                    {'name': 'Agility Ladder', 'duration': '10 mins', 'description': 'Fast footwork patterns for quicker reactions'},
                    {'name': 'Sprint Drills', 'duration': '15 mins', 'description': '20m and 40m sprint repetitions'},
                    {'name': 'Reaction Time', 'duration': '10 mins', 'description': 'Ball drop catches and quick-fire fielding drills'}
                ]
            },
            'resources': [
                {'title': 'Cricket Batting Masterclass', 'url': 'https://youtube.com/results?search_query=cricket+batting+tutorial', 'type': 'video'},
                {'title': 'Fast Bowling Techniques', 'url': 'https://youtube.com/results?search_query=fast+bowling+technique', 'type': 'video'},
                {'title': 'Fielding Excellence Guide', 'url': 'https://youtube.com/results?search_query=cricket+fielding+drills', 'type': 'video'},
                {'title': 'Cricket Fitness Program', 'url': 'https://youtube.com/results?search_query=cricket+fitness+training', 'type': 'video'}
            ]
        },
        'football': {
            'name': 'Football',
            'positions': ['Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Winger'],
            'key_skills': ['dribbling', 'passing', 'shooting', 'tackling', 'positioning'],
            'common_mistakes': {
                'kicking': [
                    'Planting foot too far from ball',
                    'Not following through after the kick',
                    'Looking down instead of at target',
                    'Body leaning too far back',
                    'Kicking with the toe instead of instep'
                ],
                'dribbling': [
                    'Keeping head down too much',
                    'Ball too far from feet',
                    'Only using dominant foot',
                    'Running too fast to maintain control',
                    'Not using body feints'
                ],
                'general': [
                    'Poor first touch control',
                    'Incorrect body positioning',
                    'Weight on wrong foot for quick turns',
                    'Not scanning the field enough'
                ]
            },
            'drills': {
                'technique': [
                    {'name': 'Cone Dribbling', 'duration': '15 mins', 'description': 'Weave through cones using both feet for close ball control'},
                    {'name': 'Wall Passing', 'duration': '15 mins', 'description': 'Pass against a wall alternating feet and distances'},
                    {'name': 'Juggling Practice', 'duration': '10 mins', 'description': 'Keep the ball up using feet, thighs, and head'},
                    {'name': 'Crossing Drill', 'duration': '15 mins', 'description': 'Practice crossing from wide positions'}
                ],
                'stamina': [
                    {'name': 'Fartlek Training', 'duration': '25 mins', 'description': 'Varied pace running simulating match intensity'},
                    {'name': 'Box-to-Box Runs', 'duration': '20 mins', 'description': 'Full pitch runs with recovery walking'},
                    {'name': 'Small Sided Games', 'duration': '20 mins', 'description': '3v3 or 4v4 games in small areas for high intensity'}
                ],
                'accuracy': [
                    {'name': 'Target Shooting', 'duration': '20 mins', 'description': 'Shoot at corner targets from various distances'},
                    {'name': 'Long Pass Practice', 'duration': '15 mins', 'description': 'Hit targets with long-range passes'},
                    {'name': 'Free Kick Practice', 'duration': '15 mins', 'description': 'Bend and power shots over a wall'}
                ],
                'speed': [
                    {'name': 'Sprint Training', 'duration': '15 mins', 'description': '10m, 20m, and 40m sprint repetitions'},
                    {'name': 'Agility Course', 'duration': '15 mins', 'description': 'Quick direction changes with and without the ball'},
                    {'name': 'Speed Dribbling', 'duration': '10 mins', 'description': 'Full-speed dribbling through gates'}
                ]
            },
            'resources': [
                {'title': 'Football Skills Tutorial', 'url': 'https://youtube.com/results?search_query=football+skills+tutorial', 'type': 'video'},
                {'title': 'Tactical Training', 'url': 'https://youtube.com/results?search_query=football+tactics+training', 'type': 'video'},
                {'title': 'Shooting Technique', 'url': 'https://youtube.com/results?search_query=football+shooting+technique', 'type': 'video'},
                {'title': 'Football Fitness', 'url': 'https://youtube.com/results?search_query=football+fitness+program', 'type': 'video'}
            ]
        },
        'badminton': {
            'name': 'Badminton',
            'positions': ['Singles', 'Doubles Front', 'Doubles Back', 'Mixed Doubles'],
            'key_skills': ['footwork', 'smash', 'net play', 'serving', 'endurance'],
            'common_mistakes': {
                'smash': [
                    'Not hitting at the highest point',
                    'Wrist not snapping through the shot',
                    'Body not rotating properly',
                    'Feet not planted before jump',
                    'Following through across the body'
                ],
                'serve': [
                    'Racquet face angle incorrect',
                    'Not watching the shuttle',
                    'Service too high giving opponent attack',
                    'Standing position too far from service line',
                    'Wrist too tight on contact'
                ],
                'general': [
                    'Returning to base position slowly',
                    'Flat-footed movement (not on balls of feet)',
                    'Grip switching not fast enough',
                    'Over-reaching instead of moving feet'
                ]
            },
            'drills': {
                'technique': [
                    {'name': 'Shadow Footwork', 'duration': '15 mins', 'description': 'Move to all six corners of the court without shuttle'},
                    {'name': 'Multi-shuttle Drill', 'duration': '15 mins', 'description': 'Continuous feeding to practice various shots'},
                    {'name': 'Net Kill Practice', 'duration': '10 mins', 'description': 'Quick net shots and net kills'},
                    {'name': 'Clear Rally', 'duration': '15 mins', 'description': 'High clears back and forth for timing'}
                ],
                'stamina': [
                    {'name': 'Court Shuttle Runs', 'duration': '15 mins', 'description': 'Touch all four corners repeatedly'},
                    {'name': 'Jump Rope', 'duration': '10 mins', 'description': 'Continuous skipping for footwork and stamina'},
                    {'name': 'Rally Endurance', 'duration': '20 mins', 'description': 'Long rallies at moderate pace'}
                ],
                'accuracy': [
                    {'name': 'Target Smash', 'duration': '15 mins', 'description': 'Aim smashes at specific court areas'},
                    {'name': 'Drop Shot Practice', 'duration': '15 mins', 'description': 'Precise drops just over the net'},
                    {'name': 'Service Accuracy', 'duration': '10 mins', 'description': 'Hit specific zones with serves'}
                ],
                'speed': [
                    {'name': 'Agility Ladder', 'duration': '10 mins', 'description': 'Quick foot patterns on agility ladder'},
                    {'name': 'Reaction Drill', 'duration': '10 mins', 'description': 'React to random shuttle feeds'},
                    {'name': 'Speed Footwork', 'duration': '15 mins', 'description': 'Fast court coverage practice'}
                ]
            },
            'resources': [
                {'title': 'Badminton Basics', 'url': 'https://youtube.com/results?search_query=badminton+tutorial+beginners', 'type': 'video'},
                {'title': 'Smash Technique', 'url': 'https://youtube.com/results?search_query=badminton+smash+tutorial', 'type': 'video'},
                {'title': 'Footwork Mastery', 'url': 'https://youtube.com/results?search_query=badminton+footwork+training', 'type': 'video'},
                {'title': 'Singles Strategy', 'url': 'https://youtube.com/results?search_query=badminton+singles+strategy', 'type': 'video'}
            ]
        }
    }
    
    MOTIVATIONAL_MESSAGES = [
        "Every champion was once a beginner who refused to give up! 🏆",
        "Progress is progress, no matter how small. Keep pushing! 💪",
        "The only bad workout is the one that didn't happen. Great effort! ⭐",
        "Your dedication today builds tomorrow's success! 🌟",
        "Champions train, losers complain. You're on the right track! 🎯",
        "Small daily improvements lead to staggering long-term results! 📈",
        "The pain of practice is temporary, but the pride of achievement is forever! 🏅",
        "Believe in yourself. You're stronger than you think! 💫"
    ]
    
    def generate_feedback(self, analysis: Dict, sport: str, skill_level: str) -> Dict:
        """
        Generate human-readable coaching feedback from analysis data.
        
        Args:
            analysis: Performance analysis dictionary
            sport: Sport type
            skill_level: Player's skill level
            
        Returns:
            Dictionary with feedback summary, strengths, improvements, and tips
        """
        sport_data = self.SPORT_KNOWLEDGE.get(sport, self.SPORT_KNOWLEDGE['cricket'])
        overall_score = analysis.get('overall_score', 60)
        issues = analysis.get('issues_detected', [])
        
        # Generate summary based on score
        if overall_score >= 80:
            summary = f"Excellent performance! Your {sport_data['name']} technique is impressive. "
            summary += "You show strong fundamentals with only minor areas to fine-tune."
        elif overall_score >= 65:
            summary = f"Good effort! Your {sport_data['name']} technique shows solid foundations. "
            summary += "With focused practice on a few key areas, you can reach the next level."
        elif overall_score >= 50:
            summary = f"Decent start! Your {sport_data['name']} form has promising elements. "
            summary += "Let's work on building stronger fundamentals for consistent improvement."
        else:
            summary = f"Keep going! Every expert started here. Your {sport_data['name']} basics are forming. "
            summary += "Focus on the fundamentals and you'll see rapid improvement."
        
        # Identify strengths (high-scoring joints)
        joint_scores = analysis.get('joint_scores', {})
        strengths = []
        improvements = []
        
        for joint, score in sorted(joint_scores.items(), key=lambda x: x[1], reverse=True):
            readable_name = joint.replace('_', ' ').title()
            if score >= 75:
                strengths.append(f"Strong {readable_name} positioning (Score: {score})")
            elif score < 60:
                improvements.append(f"Work on {readable_name} alignment (Score: {score})")
        
        # Add generic strengths if none detected
        if not strengths:
            strengths = [
                'Good overall body awareness',
                'Showing commitment to practice',
                'Positive movement patterns developing'
            ]
        
        # Generate specific mistakes from issues
        mistakes = []
        for issue in issues[:4]:  # Top 4 issues
            mistakes.append(issue.get('description', 'Technique adjustment needed'))
        
        if not mistakes:
            movement_type = list(sport_data['common_mistakes'].keys())[0]
            mistakes = random.sample(
                sport_data['common_mistakes'].get(movement_type, sport_data['common_mistakes']['general']),
                min(3, len(sport_data['common_mistakes'].get(movement_type, [])))
            )
        
        # Add skill-level appropriate tips
        if not improvements:
            if skill_level == 'beginner':
                improvements = ['Focus on basic stance and form', 'Build consistency in movement', 'Practice regularly']
            elif skill_level == 'intermediate':
                improvements = ['Refine transition movements', 'Increase speed while maintaining form', 'Work on advanced techniques']
            else:
                improvements = ['Fine-tune micro-adjustments', 'Focus on competition readiness', 'Mental preparation exercises']
        
        return {
            'summary': summary,
            'overall_rating': self._get_rating_label(overall_score),
            'strengths': strengths[:5],
            'improvements': improvements[:5],
            'mistakes': mistakes[:4],
            'detailed_tips': self._generate_tips(sport, skill_level, issues),
            'motivation': random.choice(self.MOTIVATIONAL_MESSAGES)
        }
    
    def generate_training_plan_from_analysis(self, analysis: Dict, sport: str, skill_level: str) -> Dict:
        """Generate a training plan based on video analysis results."""
        overall_score = analysis.get('overall_score', 60)
        issues = analysis.get('issues_detected', [])
        
        # Determine primary focus area based on weakest scores
        scores = {
            'technique': analysis.get('technique_score', 60),
            'stamina': analysis.get('timing_score', 60),  # Map timing to stamina
            'accuracy': analysis.get('posture_score', 60),
            'speed': analysis.get('consistency_score', 60)
        }
        
        primary_goal = min(scores, key=scores.get)
        return self.generate_complete_plan(sport, skill_level, primary_goal)
    
    def generate_complete_plan(self, sport: str, skill_level: str, goal: str,
                               user_name: str = 'Athlete', additional_info: str = '') -> Dict:
        """
        Generate a comprehensive, personalized training plan.
        
        Args:
            sport: Sport type
            skill_level: beginner/intermediate/advanced
            goal: Primary training goal (stamina, accuracy, speed, technique)
            user_name: Name of the athlete
            additional_info: Any extra context
            
        Returns:
            Complete training plan with weekly schedule, drills, resources, etc.
        """
        sport_data = self.SPORT_KNOWLEDGE.get(sport, self.SPORT_KNOWLEDGE['cricket'])
        
        # Get goal-specific drills
        goal_drills = sport_data['drills'].get(goal, sport_data['drills']['technique'])
        technique_drills = sport_data['drills']['technique']
        stamina_drills = sport_data['drills']['stamina']
        
        # Adjust intensity based on skill level
        intensity_map = {
            'beginner': {'sessions_per_week': 4, 'session_duration': '45 mins', 'rest_days': 3},
            'intermediate': {'sessions_per_week': 5, 'session_duration': '60 mins', 'rest_days': 2},
            'advanced': {'sessions_per_week': 6, 'session_duration': '75 mins', 'rest_days': 1}
        }
        intensity = intensity_map.get(skill_level, intensity_map['beginner'])
        
        # Build weekly timetable
        weekly_timetable = {
            'monday': {
                'session': f'{goal.title()} Focus',
                'duration': intensity['session_duration'],
                'focus': goal,
                'drills': [d['name'] for d in goal_drills[:2]],
                'intensity': 'medium' if skill_level == 'beginner' else 'high'
            },
            'tuesday': {
                'session': 'Fitness & Conditioning',
                'duration': '40 mins',
                'focus': 'stamina',
                'drills': [d['name'] for d in stamina_drills[:2]],
                'intensity': 'medium'
            },
            'wednesday': {
                'session': 'Technical Skills',
                'duration': intensity['session_duration'],
                'focus': 'technique',
                'drills': [d['name'] for d in technique_drills[:2]],
                'intensity': 'medium-high'
            },
            'thursday': {
                'session': 'Rest & Recovery',
                'duration': '30 mins',
                'focus': 'recovery',
                'drills': ['Light stretching', 'Meditation', 'Video analysis review'],
                'intensity': 'low'
            },
            'friday': {
                'session': f'Intensive {goal.title()} Training',
                'duration': intensity['session_duration'],
                'focus': goal,
                'drills': [d['name'] for d in goal_drills],
                'intensity': 'high'
            },
            'saturday': {
                'session': 'Match Simulation',
                'duration': '90 mins',
                'focus': 'match_practice',
                'drills': ['Warm-up game', 'Full match simulation', 'Post-game debrief'],
                'intensity': 'high'
            },
            'sunday': {
                'session': 'Active Recovery',
                'duration': '25 mins',
                'focus': 'recovery',
                'drills': ['Light jog', 'Yoga / Stretching', 'Mental visualization'],
                'intensity': 'low'
            }
        }
        
        # Warm-up and cooldown routines
        warmup_cooldown = {
            'warmup': [
                {'name': 'Light Jog / Jump Rope', 'duration': '5 mins', 'description': 'Get blood flowing and muscles warm'},
                {'name': 'Dynamic Stretches', 'duration': '5 mins', 'description': 'Leg swings, arm circles, hip rotations'},
                {'name': f'{sport_data["name"]}-Specific Warmup', 'duration': '5 mins', 'description': f'Sport-specific movements at low intensity'}
            ],
            'cooldown': [
                {'name': 'Static Stretches', 'duration': '5 mins', 'description': 'Hold each stretch for 20-30 seconds'},
                {'name': 'Deep Breathing', 'duration': '3 mins', 'description': 'Slow, controlled breathing for recovery'},
                {'name': 'Foam Rolling', 'duration': '5 mins', 'description': 'Self-massage for muscle recovery'}
            ]
        }
        
        # Assemble all drills with details
        all_drills = goal_drills + technique_drills[:2]
        
        # Tips customized to skill level and goal
        tips = self._generate_plan_tips(sport, skill_level, goal)
        
        return {
            'sport': sport,
            'skill_level': skill_level,
            'goal': goal,
            'overview': f"Hi {user_name}! Here's your personalized {sport_data['name']} training plan "
                       f"focused on improving your {goal}. As a {skill_level} player, this plan is "
                       f"designed to gradually build your skills with {intensity['sessions_per_week']} "
                       f"training sessions per week.",
            'weekly_timetable': weekly_timetable,
            'drills': all_drills,
            'resources': sport_data['resources'],
            'warmup_cooldown': warmup_cooldown,
            'tips': tips,
            'nutrition_advice': [
                'Stay hydrated - drink 2-3 liters of water daily',
                'Eat a balanced meal 2-3 hours before training',
                'Include protein within 30 minutes post-training',
                'Complex carbs for sustained energy during sessions',
                'Get 7-9 hours of quality sleep for recovery'
            ],
            'weekly_goals': [
                f'Complete all {intensity["sessions_per_week"]} training sessions',
                f'Focus on {goal} improvement in each session',
                'Track your progress with video analysis',
                'Set 3 small achievable goals for the week'
            ],
            'motivational_message': random.choice(self.MOTIVATIONAL_MESSAGES)
        }
    
    def get_tips(self, sport: str, skill_level: str, area: str) -> List[str]:
        """Get sport-specific coaching tips for a given area."""
        return self._generate_tips(sport, skill_level, [])
    
    def _generate_tips(self, sport: str, skill_level: str, issues: List) -> List[str]:
        """Generate coaching tips based on sport, skill level, and detected issues."""
        sport_data = self.SPORT_KNOWLEDGE.get(sport, self.SPORT_KNOWLEDGE['cricket'])
        tips = []
        
        # Issue-specific tips
        for issue in issues[:3]:
            recommendation = issue.get('recommendation', '')
            if recommendation:
                tips.append(recommendation)
        
        # Skill-level tips
        level_tips = {
            'beginner': [
                f'Focus on learning the basic {sport_data["name"]} fundamentals before speed',
                'Practice each movement slowly and correctly, then gradually increase speed',
                'Watch professional players and try to mimic their form',
                'Don\'t be afraid to make mistakes - they\'re part of the learning process',
                'Record yourself practicing and compare with tutorials'
            ],
            'intermediate': [
                f'Start incorporating more advanced {sport_data["name"]} techniques',
                'Work on consistency - aim for 70% success rate in drills',
                'Analyze your performance videos to identify patterns',
                'Challenge yourself with competitive practice situations',
                'Cross-train to improve overall athleticism'
            ],
            'advanced': [
                f'Focus on micro-adjustments to optimize your {sport_data["name"]} technique',
                'Mental conditioning is as important as physical training at this level',
                'Study opponent patterns and develop counter-strategies',
                'Periodize your training for peak performance timing',
                'Work with a coach for personalized technique refinement'
            ]
        }
        
        tips.extend(random.sample(
            level_tips.get(skill_level, level_tips['beginner']),
            min(3, len(level_tips.get(skill_level, [])))
        ))
        
        return tips
    
    def _generate_plan_tips(self, sport: str, skill_level: str, goal: str) -> List[str]:
        """Generate tips specific to a training plan."""
        goal_tips = {
            'stamina': [
                'Gradually increase training duration by 10% each week',
                'Include interval training for cardiovascular fitness',
                'Monitor your heart rate during sessions',
                'Don\'t skip warm-up - it prevents injury and improves performance',
                'Hydrate well before, during, and after training'
            ],
            'accuracy': [
                'Quality over quantity - focus on form for each repetition',
                'Use targets in your practice sessions for measurable goals',
                'Practice under simulated pressure situations',
                'Slow down and get the technique right before increasing speed',
                'Track your accuracy percentages to measure improvement'
            ],
            'speed': [
                'Explosive training exercises build quick-twitch muscles',
                'Proper footwork is the foundation of speed',
                'Sprint training combined with sport-specific drills',
                'Recovery between speed sessions is crucial',
                'Flexibility training helps in quicker movements'
            ],
            'technique': [
                'Break down complex movements into smaller components',
                'Repetition is key - practice each technique 50+ times per session',
                'Use video analysis to compare your form with professionals',
                'Progressive overload: master basics before advancing',
                'Get regular feedback from experienced players or coaches'
            ]
        }
        
        tips = goal_tips.get(goal, goal_tips['technique'])
        
        # Add one general tip
        tips.append(f'Stay consistent with your {sport} training schedule for best results')
        
        return tips
    
    def _get_rating_label(self, score: int) -> str:
        """Convert numeric score to human-readable rating."""
        if score >= 90:
            return 'Outstanding'
        elif score >= 80:
            return 'Excellent'
        elif score >= 70:
            return 'Good'
        elif score >= 60:
            return 'Average'
        elif score >= 50:
            return 'Needs Improvement'
        else:
            return 'Beginner Level'
