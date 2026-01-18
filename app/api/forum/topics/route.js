import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db/connect';
import Topic from '../../../../lib/db/models/Topic';
import { requireAuth, getSession } from '../../../../lib/auth/session';

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const sort = searchParams.get('sort') || 'latest';
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    const query = {};

    if (category) {
      query.categoryId = category;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    let sortOptions = {};
    if (sort === 'top') {
      sortOptions = { isPinned: -1, upvoteCount: -1, lastActivityAt: -1 };
    } else {
      sortOptions = { isPinned: -1, lastActivityAt: -1 };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch topics
    const topics = await Topic.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email')
      .populate('categoryId', 'name color slug')
      .populate('lastActivityBy', 'name');

    const total = await Topic.countDocuments(query);

    return NextResponse.json({
      topics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { user } = await requireAuth();

    const { title, content, categoryId, tags } = await request.json();

    // Validation
    if (!title || title.trim().length < 5) {
      return NextResponse.json(
        { error: 'Title must be at least 5 characters' },
        { status: 400 }
      );
    }

    if (!content || content.trim().length < 10) {
      return NextResponse.json(
        { error: 'Content must be at least 10 characters' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const topic = await Topic.create({
      title: title.trim(),
      content: content.trim(),
      categoryId,
      userId: user._id,
      organizationName: user.organizationName,
      tags: tags || [],
      lastActivityBy: user._id,
    });

    // Populate the created topic
    const populatedTopic = await Topic.findById(topic._id)
      .populate('userId', 'name email')
      .populate('categoryId', 'name color slug')
      .populate('lastActivityBy', 'name');

    return NextResponse.json({
      success: true,
      topic: populatedTopic,
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'You must be logged in to create a topic' },
        { status: 401 }
      );
    }

    console.error('Error creating topic:', error);
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    );
  }
}
