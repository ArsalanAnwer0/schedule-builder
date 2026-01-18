import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/db/connect';
import Topic from '../../../../../../lib/db/models/Topic';
import { requireAuth } from '../../../../../../lib/auth/session';

export async function POST(request, { params }) {
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

    const userId = user._id.toString();
    const upvoteIndex = topic.upvotes.findIndex(
      (upvoteId) => upvoteId.toString() === userId
    );

    let action = '';

    if (upvoteIndex > -1) {
      // User has already upvoted, remove upvote
      topic.upvotes.splice(upvoteIndex, 1);
      topic.upvoteCount = Math.max(0, topic.upvoteCount - 1);
      action = 'removed';
    } else {
      // Add upvote
      topic.upvotes.push(user._id);
      topic.upvoteCount += 1;
      action = 'added';
    }

    await topic.save();

    return NextResponse.json({
      success: true,
      action,
      upvoteCount: topic.upvoteCount,
      hasUpvoted: action === 'added',
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'You must be logged in to upvote' },
        { status: 401 }
      );
    }

    console.error('Error toggling upvote:', error);
    return NextResponse.json(
      { error: 'Failed to toggle upvote' },
      { status: 500 }
    );
  }
}
