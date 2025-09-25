import { prisma as db } from '@tire-distributor/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tireId = searchParams.get('tireId');
    const tenantId = searchParams.get('tenantId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {
      approved: true,
    };

    if (tireId) {
      where.tireId = tireId;
    }

    if (tenantId) {
      where.tenantId = tenantId;
    }

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        include: {
          tire: {
            select: {
              name: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.review.count({ where }),
    ]);

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      avgRating: Math.round(avgRating * 10) / 10,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar avaliações' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const review = await db.review.create({
      data: {
        tenantId: data.tenantId,
        tireId: data.tireId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        rating: parseInt(data.rating),
        title: data.title,
        comment: data.comment,
        verified: false, // Will be verified later
        approved: false, // Needs moderation
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Erro ao criar avaliação' },
      { status: 500 }
    );
  }
}
