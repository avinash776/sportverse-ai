// ==================================================
// SportVerse AI - Community Routes (MongoDB)
// ==================================================

const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Group = require('../models/Group');
const { authenticateToken } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

// ---- Posts ----

// Create a new post
router.post('/posts', authenticateToken, uploadImage.single('image'), async (req, res) => {
  try {
    const { title, content, type = 'general', sport, location, event_date, max_players } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const image = req.file ? `/uploads/images/${req.file.filename}` : null;

    const post = await Post.create({
      user_id: req.user._id,
      type,
      title,
      content,
      sport: sport || null,
      location: location || null,
      event_date: event_date || null,
      max_players: max_players || null,
      image,
    });

    const populated = await Post.findById(post._id)
      .populate('user_id', 'name avatar role');

    const result = populated.toJSON();
    result.author_name = result.user_id?.name;
    result.author_avatar = result.user_id?.avatar;
    result.author_role = result.user_id?.role;

    res.status(201).json({ message: 'Post created', post: result });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get all posts (with filters)
router.get('/posts', async (req, res) => {
  try {
    const { type, sport, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (sport) filter.sport = sport;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('user_id', 'name avatar role')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Post.countDocuments(filter),
    ]);

    // Add comment counts and flatten author info
    const postIds = posts.map(p => p._id);
    const commentCounts = await Comment.aggregate([
      { $match: { post_id: { $in: postIds } } },
      { $group: { _id: '$post_id', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    commentCounts.forEach(c => { countMap[c._id.toString()] = c.count; });

    const result = posts.map(p => ({
      ...p,
      id: p._id,
      author_name: p.user_id?.name,
      author_avatar: p.user_id?.avatar,
      author_role: p.user_id?.role,
      comment_count: countMap[p._id.toString()] || 0,
    }));

    res.json({ posts: result, total, page: parseInt(page) });
  } catch (error) {
    console.error('Fetch posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post with comments
router.get('/posts/:postId', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('user_id', 'name avatar role')
      .lean();

    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comments = await Comment.find({ post_id: post._id })
      .populate('user_id', 'name avatar')
      .sort({ created_at: 1 })
      .lean();

    const formattedComments = comments.map(c => ({
      ...c,
      id: c._id,
      author_name: c.user_id?.name,
      author_avatar: c.user_id?.avatar,
    }));

    res.json({
      post: {
        ...post,
        id: post._id,
        author_name: post.user_id?.name,
        author_avatar: post.user_id?.avatar,
        author_role: post.user_id?.role,
      },
      comments: formattedComments,
    });
  } catch (error) {
    console.error('Fetch post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Like/unlike a post
router.post('/posts/:postId/like', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const userId = req.user._id;
    const idx = post.liked_by.findIndex(id => id.toString() === userId.toString());

    if (idx !== -1) {
      post.liked_by.splice(idx, 1);
      post.likes = Math.max(0, post.likes - 1);
      await post.save();
      res.json({ message: 'Post unliked', liked: false });
    } else {
      post.liked_by.push(userId);
      post.likes += 1;
      await post.save();
      res.json({ message: 'Post liked', liked: true });
    }
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: 'Failed to like/unlike post' });
  }
});

// Add comment to a post
router.post('/posts/:postId/comments', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Comment content required' });

    const comment = await Comment.create({
      post_id: req.params.postId,
      user_id: req.user._id,
      content,
    });

    const populated = await Comment.findById(comment._id)
      .populate('user_id', 'name avatar')
      .lean();

    res.status(201).json({
      message: 'Comment added',
      comment: {
        ...populated,
        id: populated._id,
        author_name: populated.user_id?.name,
        author_avatar: populated.user_id?.avatar,
      },
    });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Delete a post (owner only)
router.delete('/posts/:postId', authenticateToken, async (req, res) => {
  try {
    const result = await Post.findOneAndDelete({ _id: req.params.postId, user_id: req.user._id });
    if (!result) return res.status(404).json({ error: 'Post not found or unauthorized' });

    // Also delete comments on this post
    await Comment.deleteMany({ post_id: req.params.postId });

    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// ---- Groups ----

// Create a group
router.post('/groups', authenticateToken, async (req, res) => {
  try {
    const { name, description, sport, is_public = true, max_members = 50 } = req.body;
    if (!name) return res.status(400).json({ error: 'Group name is required' });

    const group = await Group.create({
      name,
      description: description || '',
      sport: sport || null,
      creator_id: req.user._id,
      is_public: is_public,
      max_members,
      members: [{ user_id: req.user._id, role: 'admin' }],
    });

    res.status(201).json({ message: 'Group created', group });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Get all groups
router.get('/groups', async (req, res) => {
  try {
    const { sport, search } = req.query;
    const filter = { is_public: true };
    if (sport) filter.sport = sport;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const groups = await Group.find(filter)
      .populate('creator_id', 'name')
      .sort({ created_at: -1 })
      .lean();

    const result = groups.map(g => ({
      ...g,
      id: g._id,
      creator_name: g.creator_id?.name,
      member_count: g.members ? g.members.length : 0,
    }));

    res.json({ groups: result });
  } catch (error) {
    console.error('Fetch groups error:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Join a group
router.post('/groups/:groupId/join', authenticateToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });

    const already = group.members.some(m => m.user_id.toString() === req.user._id.toString());
    if (already) return res.status(409).json({ error: 'Already a member' });

    if (group.members.length >= group.max_members) {
      return res.status(400).json({ error: 'Group is full' });
    }

    group.members.push({ user_id: req.user._id, role: 'member' });
    await group.save();

    res.json({ message: 'Joined group successfully' });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

// Leave a group
router.post('/groups/:groupId/leave', authenticateToken, async (req, res) => {
  try {
    await Group.findByIdAndUpdate(req.params.groupId, {
      $pull: { members: { user_id: req.user._id } },
    });
    res.json({ message: 'Left group successfully' });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({ error: 'Failed to leave group' });
  }
});

// Get group members
router.get('/groups/:groupId/members', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('members.user_id', 'name avatar sport skill_level')
      .lean();

    if (!group) return res.status(404).json({ error: 'Group not found' });

    const members = group.members.map(m => ({
      id: m.user_id?._id,
      name: m.user_id?.name,
      avatar: m.user_id?.avatar,
      sport: m.user_id?.sport,
      skill_level: m.user_id?.skill_level,
      group_role: m.role,
      joined_at: m.joined_at,
    }));

    res.json({ members });
  } catch (error) {
    console.error('Fetch members error:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

module.exports = router;
