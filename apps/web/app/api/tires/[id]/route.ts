import { prisma as db } from '@tire-distributor/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tire = await db.tire.findUnique({
      where: { id: params.id },
    });

    if (!tire) {
      return NextResponse.json(
        { error: 'Pneu não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(tire);
  } catch (error) {
    console.error('Error fetching tire:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pneu' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    const tire = await db.tire.update({
      where: { id: params.id },
      data: {
        name: data.name,
        sku: data.sku,
        description: data.description,
        basePrice: parseFloat(data.basePrice),
        stockQty: parseInt(data.stockQty),
        images: data.images || [],
      },
    });

    return NextResponse.json(tire);
  } catch (error) {
    console.error('Error updating tire:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar pneu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.tire.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tire:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir pneu' },
      { status: 500 }
    );
  }
}
