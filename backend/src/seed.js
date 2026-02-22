// ==================================================
// SportVerse AI - Database Seeder (MongoDB)
// ==================================================
// Run with: npm run seed
// Creates demo users, posts, groups, and sample data
// ==================================================

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDatabase, disconnectDatabase } = require('./config/database');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const Group = require('./models/Group');
const Message = require('./models/Message');
const Tournament = require('./models/Tournament');
const Event = require('./models/Event');
const Video = require('./models/Video');
const TrainingPlan = require('./models/TrainingPlan');

async function seed() {
  console.log('🌱 Seeding MongoDB database...\n');

  await connectDatabase();

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    Group.deleteMany({}),
    Message.deleteMany({}),
    Tournament.deleteMany({}),
    Event.deleteMany({}),
    Video.deleteMany({}),
    TrainingPlan.deleteMany({}),
  ]);
  console.log('🗑️  Cleared all collections');

  // ---- Create Users ----
  const password_hash = await bcrypt.hash('password123', 10);

  const usersData = [
    {
      email: 'player@demo.com', name: 'Alex Johnson', role: 'player',
      sport: 'cricket', position: 'Batsman', skill_level: 'intermediate',
      bio: 'Passionate cricketer looking to improve my game', location: 'Mumbai, India',
      achievements: ['District Level Tournament Winner', 'Best Batsman Award 2025'],
      skills: ['batting', 'fielding', 'spin bowling'],
      performance_stats: { totalAnalyses: 5, latestScore: 72, avgScore: 68 },
      password_hash,
    },
    {
      email: 'coach@demo.com', name: 'Coach Sarah Williams', role: 'coach',
      sport: 'cricket', position: 'Head Coach', skill_level: 'advanced',
      bio: 'Professional cricket coach with 10+ years experience', location: 'Delhi, India',
      coach_verified: true,
      achievements: ['BCCI Level 2 Certified', 'Coached 3 state-level teams'],
      skills: ['coaching', 'strategy', 'team management'],
      password_hash,
    },
    {
      email: 'player2@demo.com', name: 'Raj Patel', role: 'player',
      sport: 'football', position: 'Midfielder', skill_level: 'beginner',
      bio: 'Football enthusiast starting my training journey', location: 'Bangalore, India',
      achievements: [],
      skills: ['dribbling', 'passing'],
      performance_stats: { totalAnalyses: 2, latestScore: 58 },
      password_hash,
    },
    {
      email: 'player3@demo.com', name: 'Priya Sharma', role: 'player',
      sport: 'badminton', position: 'Singles Player', skill_level: 'advanced',
      bio: 'State-level badminton player training for nationals', location: 'Hyderabad, India',
      achievements: ['State Championship Runner-up 2025', 'District Champion 2024'],
      skills: ['smash', 'footwork', 'net play', 'endurance'],
      performance_stats: { totalAnalyses: 12, latestScore: 85, avgScore: 80 },
      password_hash,
    },
    {
      email: 'coach2@demo.com', name: 'Coach Mike Thompson', role: 'coach',
      sport: 'football', position: 'Fitness Coach', skill_level: 'advanced',
      bio: 'Sports fitness specialist and football coach', location: 'Pune, India',
      coach_verified: true,
      achievements: ['AFC B License', 'ISL Fitness Consultant'],
      skills: ['fitness', 'tactics', 'youth development'],
      password_hash,
    },
  ];

  const users = await User.insertMany(usersData);
  console.log(`✅ Created ${users.length} users`);

  // ---- Create Posts ----
  const postsData = [
    { user: 0, type: 'general', title: '🏏 Just completed my first AI analysis!', content: 'The feedback was incredibly detailed. My batting stance needs improvement but footwork is solid!', sport: 'cricket' },
    { user: 2, type: 'looking_for_players', title: '⚽ Looking for players in Bangalore', content: 'Starting a weekend football group. Need 6 more players for 5-a-side matches every Saturday!', sport: 'football', location: 'Bangalore' },
    { user: 3, type: 'general', title: '🏸 Training tips for smash improvement', content: 'Been working on my jumping smash for 2 weeks. Key things: wrist snap, timing, and body rotation.', sport: 'badminton' },
    { user: 1, type: 'announcement', title: '📢 Summer Cricket Camp 2026', content: 'Registrations open for our 2-week summer camp. Ages 12-18 welcome. Professional coaching & video analysis included!', sport: 'cricket', location: 'Delhi' },
    { user: 4, type: 'event', title: '📅 Football Fitness Workshop', content: 'Free fitness assessment and training session this Sunday. All levels welcome!', sport: 'football', location: 'Pune' },
    { user: 0, type: 'general', title: 'How do you guys warm up?', content: 'Looking for a good pre-match warmup routine for cricket. What works for you?', sport: 'cricket' },
    { user: 3, type: 'looking_for_players', title: '🏸 Looking for doubles partner', content: 'Searching for an advanced level doubles partner for upcoming district tournament in March.', sport: 'badminton', location: 'Hyderabad' },
  ];

  const posts = await Post.insertMany(postsData.map(p => ({
    user_id: users[p.user]._id,
    type: p.type,
    title: p.title,
    content: p.content,
    sport: p.sport,
    location: p.location || null,
    likes: Math.floor(Math.random() * 20),
  })));
  console.log(`✅ Created ${posts.length} posts`);

  // ---- Create Groups ----
  const groupsData = [
    { name: 'Mumbai Cricket Club', description: 'Local cricket enthusiasts in Mumbai', sport: 'cricket', creator: 0 },
    { name: 'Bangalore FC Fans', description: 'Football fans and players in Bangalore', sport: 'football', creator: 2 },
    { name: 'Shuttlers Hub', description: 'Badminton players across India', sport: 'badminton', creator: 3 },
    { name: 'Fitness Warriors', description: 'Cross-sport fitness group', sport: null, creator: 4 },
  ];

  const groups = [];
  for (const g of groupsData) {
    const otherUsers = users.filter((_, i) => i !== g.creator);
    const members = [
      { user_id: users[g.creator]._id, role: 'admin' },
      ...otherUsers.slice(0, 2).map(u => ({ user_id: u._id, role: 'member' })),
    ];

    const group = await Group.create({
      name: g.name,
      description: g.description,
      sport: g.sport,
      creator_id: users[g.creator]._id,
      members,
    });
    groups.push(group);
  }
  console.log(`✅ Created ${groups.length} groups`);

  // ---- Create Tournaments ----
  const tournamentsData = [
    { coach: 1, name: 'Spring Cricket Cup 2026', sport: 'cricket', location: 'Delhi Sports Complex', status: 'upcoming' },
    { coach: 4, name: 'Pune Football League', sport: 'football', location: 'Pune Stadium', status: 'upcoming' },
  ];

  const tournaments = await Tournament.insertMany(tournamentsData.map(t => ({
    coach_id: users[t.coach]._id,
    name: t.name,
    sport: t.sport,
    location: t.location,
    status: t.status,
    start_date: new Date('2026-04-01'),
    end_date: new Date('2026-04-15'),
  })));
  console.log(`✅ Created ${tournaments.length} tournaments`);

  // ---- Create Events ----
  const eventsData = [
    { coach: 1, title: 'Cricket Net Practice Session', sport: 'cricket', type: 'training', location: 'Delhi Indoor Stadium' },
    { coach: 4, title: 'Weekend Football Bootcamp', sport: 'football', type: 'workshop', location: 'Pune Ground' },
  ];

  const events = await Event.insertMany(eventsData.map(e => ({
    coach_id: users[e.coach]._id,
    title: e.title,
    sport: e.sport,
    location: e.location,
    event_type: e.type,
    event_date: new Date('2026-03-15'),
  })));
  console.log(`✅ Created ${events.length} events`);

  console.log('\n🎉 MongoDB database seeded successfully!');
  console.log('\n📧 Demo Accounts:');
  console.log('   Player: player@demo.com / password123');
  console.log('   Coach:  coach@demo.com / password123');
  console.log('   Player: player2@demo.com / password123\n');

  await disconnectDatabase();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
