import { db } from '@repo/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Find loyalty program for tenant
    const loyaltyProgram = await db.loyaltyProgram.findUnique({
      where: { tenantId: params.tenantId },
    });

    if (!loyaltyProgram) {
      return NextResponse.json(
        { error: 'Programa de fidelidade não encontrado' },
        { status: 404 }
      );
    }

    // Find customer in loyalty program
    const customer = await db.loyaltyCustomer.findUnique({
      where: {
        programId_email: {
          programId: loyaltyProgram.id,
          email: email,
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Cliente não encontrado no programa' },
        { status: 404 }
      );
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Error fetching loyalty customer:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cliente' },
      { status: 500 }
    );
  }
}
