// apps/dashboard/app/api/organizations/create/route.ts - ACHROMATIC ENTERPRISE ORGANIZATION CREATION

import { getServerSession } from '@workspace/auth/server';
import { db, memberships, organizations } from '@workspace/database';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createOrgSchema = z.object({
  name: z.string().min(1).max(64),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
  includeExampleData: z.string().transform(val => val === 'true'),
});

export async function POST(request: NextRequest) {
  try {
    // ✅ Check authentication
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        },
        { status: 401 }
      );
    }

    // ✅ Parse form data
    const formData = await request.formData();
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      includeExampleData: formData.get('includeExampleData') as string,
    };

    const validation = createOrgSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error.issues[0]?.message,
          },
        },
        { status: 400 }
      );
    }

    const { name, slug, includeExampleData } = validation.data;

    // ✅ Check if slug is already taken
    const [existingOrg] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);

    if (existingOrg) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SLUG_EXISTS',
            message: 'This organization name is already taken',
          },
        },
        { status: 409 }
      );
    }

    // ✅ Create organization
    const organizationId = randomUUID();
    const now = new Date();

    const [createdOrg] = await db
      .insert(organizations)
      .values({
        id: organizationId,
        name,
        slug,
        ownerId: session.user.id,
        isActive: true,
        isVerified: true,
        maxMembers: 10,
        maxProjects: 5,
        maxStorage: 1024 * 1024 * 1024, // 1GB
        currentMembers: 1,
        currentProjects: 0,
        currentStorage: 0,
        settings: {
          includeExampleData,
        },
        createdAt: now,
        updatedAt: now,
      })
      .returning({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
      });

    // ✅ CORREÇÃO: Create owner membership com campos obrigatórios
    await db.insert(memberships).values({
      id: randomUUID(),
      userId: session.user.id,
      organizationId,
      role: 'owner',
      permissions: null, // ✅ ADICIONADO: Campo obrigatório
      customPermissions: null, // ✅ ADICIONADO: Campo obrigatório
      invitedBy: null, // ✅ ADICIONADO: Não foi convidado, criou
      invitedAt: null, // ✅ ADICIONADO: Não foi convidado
      joinedAt: now, // ✅ MANTIDO: Data de entrada
      isActive: true,
      metadata: {
        joinMethod: 'creation',
        isFounder: true,
      },
      createdAt: now,
      updatedAt: now, // ✅ ADICIONADO: Campo obrigatório
    });

    return NextResponse.json({
      success: true,
      organization: createdOrg,
      message: 'Organization created successfully',
    });
  } catch (error) {
    console.error('❌ ACHROMATIC: Organization creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SYSTEM_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } },
    { status: 405 }
  );
}
