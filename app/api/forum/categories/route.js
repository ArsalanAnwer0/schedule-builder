import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db/connect';
import Category from '../../../../lib/db/models/Category';
import Topic from '../../../../lib/db/models/Topic';
import { requireAdmin } from '../../../../lib/auth/session';
import { slugify } from '../../../../lib/utils/slugify';

export async function GET() {
  try {
    await dbConnect();

    const categories = await Category.find().sort({ order: 1 });

    // Get topic count for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const topicCount = await Topic.countDocuments({ categoryId: category._id });
        return {
          ...category.toObject(),
          topicCount,
        };
      })
    );

    return NextResponse.json({ categories: categoriesWithCounts });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { user } = await requireAdmin();

    const { name, description, icon, color } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const slug = slugify(name);

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 400 }
      );
    }

    // Get the highest order number
    const highestOrderCategory = await Category.findOne().sort({ order: -1 });
    const order = highestOrderCategory ? highestOrderCategory.order + 1 : 0;

    const category = await Category.create({
      name,
      slug,
      description: description || '',
      icon: icon || '💬',
      color: color || '#14b8a6',
      order,
    });

    return NextResponse.json({
      success: true,
      category: category.toObject(),
    });
  } catch (error) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'Unauthorized' ? 401 : 403 }
      );
    }

    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
