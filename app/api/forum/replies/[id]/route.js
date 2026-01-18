import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/db/connect';
import Reply from '../../../../../lib/db/models/Reply';
import Topic from '../../../../../lib/db/models/Topic';
import { requireAuth } from '../../../../../lib/auth/session';

export async function PATCH(request, { params }) {
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

    // Check permissions: must be author or admin
    const isAuthor = reply.userId.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this reply' },
        { status: 403 }
      );
    }

    const { content } = await request.json();

    if (!content || content.trim().length < 5) {
      return NextResponse.json(
        { error: 'Reply must be at least 5 characters' },
        { status: 400 }
      );
    }

    reply.content = content.trim();
    reply.isEdited = true;
    reply.editedAt = new Date();
    await reply.save();

    const updatedReply = await Reply.findById(id)
      .populate('userId', 'name email');

    return NextResponse.json({
      success: true,
      reply: updatedReply,
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'You must be logged in to edit a reply' },
        { status: 401 }
      );
    }

    console.error('Error updating reply:', error);
    return NextResponse.json(
      { error: 'Failed to update reply' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
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

    // Check permissions: must be author or admin
    const isAuthor = reply.userId.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this reply' },
        { status: 403 }
      );
    }

    const topicId = reply.topicId;

    // Delete the reply
    await Reply.findByIdAndDelete(id);

    // Update topic reply count
    const topic = await Topic.findById(topicId);
    if (topic) {
      topic.replyCount = Math.max(0, topic.replyCount - 1);
      await topic.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Reply deleted successfully',
    });
  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'You must be logged in to delete a reply' },
        { status: 401 }
      );
    }

    console.error('Error deleting reply:', error);
    return NextResponse.json(
      { error: 'Failed to delete reply' },
      { status: 500 }
    );
  }
}
