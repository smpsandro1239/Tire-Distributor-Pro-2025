import { prisma as db } from '@tire-distributor/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const data = await request.json();

    // Find or create loyalty program for tenant
    let loyaltyProgram = await db.loyaltyProgram.findUnique({
      where: { tenantId: params.tenantId },
    });

    if (!loyaltyProgram) {
      loyaltyProgram = await db.loyaltyProgram.create({
        data: {
          tenantId: params.tenantId,
          name: 'Programa de Fidelidade',
          pointsPerEuro: 1,
          euroPerPoint: 0.01,
          bronzeThreshold: 0,
          silverThreshold: 1000,
          goldThreshold: 5000,
          birthdayBonus: 100,
          referralBonus: 500,
          isActive: true,
        },
      });
    }

    // Check if customer already exists
    const existingCustomer = await db.loyaltyCustomer.findUnique({
      where: {
        programId_email: {
          programId: loyaltyProgram.id,
          email: data.email,
        },
      },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Cliente já cadastrado no programa' },
        { status: 400 }
      );
    }

    // Create new loyalty customer
    const customer = await db.loyaltyCustomer.create({
      data: {
        programId: loyaltyProgram.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        birthday: data.birthday ? new Date(data.birthday) : null,
        totalPoints: 0,
        usedPoints: 0,
        availablePoints: 0,
        currentTier: 'BRONZE',
      },
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    console.error('Error joining loyalty program:', error);
    return NextResponse.json(
      { error: 'Erro ao cadastrar no programa' },
      { status: 500 }
    );
  }
}
