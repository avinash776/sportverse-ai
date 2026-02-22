// ==================================================
// SportVerse AI - Sport Images Utility
// ==================================================
// Maps sports and activities to relevant Unsplash images
// for visual aid alongside AI training output.
// ==================================================

// High-quality sport images from Unsplash (free to use)
const SPORT_IMAGES = {
  cricket: [
    { url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=250&fit=crop', caption: 'Cricket Batting Practice' },
    { url: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=400&h=250&fit=crop', caption: 'Cricket Bowling Action' },
    { url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=250&fit=crop', caption: 'Cricket Match Training' },
    { url: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=400&h=250&fit=crop', caption: 'Cricket Field Practice' },
  ],
  football: [
    { url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=250&fit=crop', caption: 'Football Training Drills' },
    { url: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=250&fit=crop', caption: 'Football Match Action' },
    { url: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400&h=250&fit=crop', caption: 'Football Dribbling Skills' },
    { url: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=250&fit=crop', caption: 'Football Fitness Training' },
  ],
  badminton: [
    { url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=250&fit=crop', caption: 'Badminton Smash Technique' },
    { url: 'https://images.unsplash.com/photo-1613918431703-aa50889e3be4?w=400&h=250&fit=crop', caption: 'Badminton Court Practice' },
    { url: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=400&h=250&fit=crop', caption: 'Badminton Footwork Drills' },
    { url: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?w=400&h=250&fit=crop', caption: 'Racket Sports Training' },
  ],
  tennis: [
    { url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=250&fit=crop', caption: 'Tennis Serve Practice' },
    { url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400&h=250&fit=crop', caption: 'Tennis Court Training' },
    { url: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=250&fit=crop', caption: 'Tennis Forehand Technique' },
    { url: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=400&h=250&fit=crop', caption: 'Tennis Fitness Drills' },
  ],
  basketball: [
    { url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=250&fit=crop', caption: 'Basketball Shooting Form' },
    { url: 'https://images.unsplash.com/photo-1559692048-79a3f837883d?w=400&h=250&fit=crop', caption: 'Basketball Dribbling Drills' },
    { url: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400&h=250&fit=crop', caption: 'Basketball Court Practice' },
    { url: 'https://images.unsplash.com/photo-1504450758481-7338bbe75005?w=400&h=250&fit=crop', caption: 'Basketball Team Training' },
  ],
};

// Activity-specific images (for drills, exercises)
const ACTIVITY_IMAGES = {
  warmup: { url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=250&fit=crop', caption: 'Warm-up & Stretching' },
  cardio: { url: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&h=250&fit=crop', caption: 'Cardio & Endurance' },
  strength: { url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=250&fit=crop', caption: 'Strength Training' },
  flexibility: { url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop', caption: 'Flexibility & Yoga' },
  agility: { url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=250&fit=crop', caption: 'Speed & Agility' },
  recovery: { url: 'https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=400&h=250&fit=crop', caption: 'Recovery & Rest' },
  nutrition: { url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=250&fit=crop', caption: 'Sports Nutrition' },
  mental: { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop', caption: 'Mental Conditioning' },
};

/**
 * Get sport-specific images for a given sport
 * @param {string} sport - Sport name (cricket, football, etc.)
 * @param {number} count - Number of images to return
 * @returns {Array} Array of { url, caption } objects
 */
export function getSportImages(sport, count = 2) {
  const images = SPORT_IMAGES[sport?.toLowerCase()] || SPORT_IMAGES.cricket;
  // Shuffle and pick
  const shuffled = [...images].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get activity-type image based on keywords in the activity text
 * @param {string} text - Activity/drill description
 * @returns {{ url: string, caption: string }}
 */
export function getActivityImage(text) {
  const lower = (text || '').toLowerCase();
  if (lower.includes('warm') || lower.includes('stretch')) return ACTIVITY_IMAGES.warmup;
  if (lower.includes('run') || lower.includes('cardio') || lower.includes('endurance') || lower.includes('stamina')) return ACTIVITY_IMAGES.cardio;
  if (lower.includes('strength') || lower.includes('weight') || lower.includes('lift') || lower.includes('push') || lower.includes('squat')) return ACTIVITY_IMAGES.strength;
  if (lower.includes('flex') || lower.includes('yoga') || lower.includes('mobility')) return ACTIVITY_IMAGES.flexibility;
  if (lower.includes('agility') || lower.includes('speed') || lower.includes('sprint') || lower.includes('ladder')) return ACTIVITY_IMAGES.agility;
  if (lower.includes('rest') || lower.includes('recovery') || lower.includes('cool')) return ACTIVITY_IMAGES.recovery;
  if (lower.includes('nutrition') || lower.includes('diet') || lower.includes('meal') || lower.includes('food')) return ACTIVITY_IMAGES.nutrition;
  if (lower.includes('mental') || lower.includes('meditat') || lower.includes('visualiz') || lower.includes('focus')) return ACTIVITY_IMAGES.mental;
  return null;
}

/**
 * All activity images for displaying in training plan section
 */
export function getAllActivityImages() {
  return Object.values(ACTIVITY_IMAGES);
}

export default SPORT_IMAGES;
