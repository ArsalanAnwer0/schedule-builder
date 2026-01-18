import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/db/connect';
import Topic from '../../../../../lib/db/models/Topic';
import Reply from '../../../../../lib/db/models/Reply';
import { requireAuth, getSession } from '../../../../../lib/auth/session';

export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = await params;

    const topic = await Topic.findById(id)
      .populate('userId', 'name email')
      .populate('categoryId', 'name color slug')
      .populate('lastActivityBy', 'name');

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    // Increment view count
    topic.viewCount += 1;
    await topic.save();

    return NextResponse.json({ topic });
  } catch (error) {
    console.error('Error fetching topic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topic' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    await dbConnect();

    const topic = await Topic.findById(id);

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    // Check permissions: must be author or admin
    const isAuthor = topic.userId.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this topic' },
        { status: 403 }
      );
    }

    const { title, content, tags, isPinned, isLocked } = await request.json();

    // Update allowed fields
    if (title !== undefined && title.trim().length >= 5) {
      topic.title = title.trim();
    }

    if (content !== undefined && content.trim().length >= 10) {
      topic.content = content.trim();
    }

    if (tags !== undefined) {
      topic.tags = tags;
    }

    // Only admins can pin/lock topics
    if (isAdmin) {
      if (isPinned !== undefined) {
        topic.isPinned = isPinned;
      }
      if (isLocked !== undefined) {
        topic.isLocked = isLocked;
      }
    }

    await topic.save();

    const updatedTopic = await Topic.findById(id)
      .populate('userId', 'name email')
      .populate('categoryId', 'name color slug')
      .populate('lastActivityBy', 'name');

    return NextResponse.json({
      success: true,
      topic: updatedTopic,
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'You must be logged in to edit a topic' },
        { status: 401 }
      );
    }

    console.error('Error updating topic:', error);
    return NextResponse.json(
      { error: 'Failed to update topic' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    await dbConnect();

    const topic = await Topic.findById(id);

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    // Check permissions: must be author or admin
    const isAuthor = topic.userId.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this topic' },
        { status: 403 }
      );
    }

    // Delete all replies associated with this topic
    await Reply.deleteMany({ topicId: id });

    // Delete the topic
    await Topic.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Topic deleted successfully',
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'You must be logged in to delete a topic' },
        { status: 401 }
      );
    }

    console.error('Error deleting topic:', error);
    return NextResponse.json(
      { error: 'Failed to delete topic' },
      { status: 500 }
    );
  }
}
