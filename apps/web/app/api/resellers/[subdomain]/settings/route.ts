import { prisma as db } from '@tire-distributor/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  try {
    const reseller = await db.tenant.findUnique({
      where: { subdomain: params.subdomain },
    });

    if (!reseller) {
      return NextResponse.json(
        { error: 'Revendedor não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(reseller);
  } catch (error) {
    console.error('Error fetching reseller settings:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  try {
    const data = await request.json();

    const reseller = await db.tenant.update({
      where: { subdomain: params.subdomain },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        whatsapp: data.whatsapp,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        accentColor: data.accentColor,
        brandName: data.brandName,
        tagline: data.tagline,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        logo: data.logo,
        favicon: data.favicon,
        enableReviews: data.enableReviews,
        enableChat: data.enableChat,
        enableLoyalty: data.enableLoyalty,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(reseller);
  } catch (error) {
    console.error('Error updating reseller settings:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar configurações' },
      { status: 500 }
    );
  }
}
