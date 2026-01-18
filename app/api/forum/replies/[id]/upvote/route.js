import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/db/connect';
import Reply from '../../../../../../lib/db/models/Reply';
import { requireAuth } from '../../../../../../lib/auth/session';

export async function POST(request, { params }) {
  try {
    const { user } = await requireAuth();
    const { id } = await params;

    await dbConnect();

    const reply = await Reply.findById(id);

    if (!reply) {
      return NextResponse.json(
        { error: 'Reply not found' },
        { status: 404 }
      );
    }

    const userId = user._id.toString();
    const upvoteIndex = reply.upvotes.findIndex(
      (upvoteId) => upvoteId.toString() === userId
    );

    let action = '';

    if (upvoteIndex > -1) {
      // User has already upvoted, remove upvote
      reply.upvotes.splice(upvoteIndex, 1);
      reply.upvoteCount = Math.max(0, reply.upvoteCount - 1);
      action = 'removed';
    } else {
      // Add upvote
      reply.upvotes.push(user._id);
      reply.upvoteCount += 1;
      action = 'added';
    }

    await reply.save();

    return NextResponse.json({
      success: true,
      action,
      upvoteCount: reply.upvoteCount,
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
