import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/db/connect';
import Reply from '../../../../../../lib/db/models/Reply';
import Topic from '../../../../../../lib/db/models/Topic';
import { requireAuth } from '../../../../../../lib/auth/session';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    const replies = await Reply.find({ topicId: id })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email');

    const total = await Reply.countDocuments({ topicId: id });

    return NextResponse.json({
      replies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching replies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch replies' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    const { content } = await request.json();

    if (!content || content.trim().length < 5) {
      return NextResponse.json(
        { error: 'Reply must be at least 5 characters' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if topic exists and is not locked
    const topic = await Topic.findById(id);

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    if (topic.isLocked) {
      return NextResponse.json(
        { error: 'This topic is locked and cannot receive new replies' },
        { status: 403 }
      );
    }

    // Create reply
    const reply = await Reply.create({
      topicId: id,
      userId: user._id,
      content: content.trim(),
      organizationName: user.organizationName,
    });

    // Update topic metadata
    topic.replyCount += 1;
    topic.lastActivityAt = new Date();
    topic.lastActivityBy = user._id;
    await topic.save();

    // Populate the created reply
    const populatedReply = await Reply.findById(reply._id)
      .populate('userId', 'name email');

    return NextResponse.json({
      success: true,
      reply: populatedReply,
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'You must be logged in to reply' },
        { status: 401 }
      );
    }

    console.error('Error creating reply:', error);
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    );
  }
}
