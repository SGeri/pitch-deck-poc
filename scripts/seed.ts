import { UserRole } from '@prisma/client';
import 'dotenv/config';

import { auth } from '../src/lib/auth/shared';
import { prisma } from '../src/lib/db';

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is required`);
    }
    return value;
}

const SEED_MEMBER_EMAIL = requireEnv('SEED_MEMBER_EMAIL');
const SEED_MEMBER_PASSWORD = requireEnv('SEED_MEMBER_PASSWORD');
const SEED_MEMBER_NAME = process.env.SEED_MEMBER_NAME || 'Test Member';

const SEED_ADMIN_EMAIL = requireEnv('SEED_ADMIN_EMAIL');
const SEED_ADMIN_PASSWORD = requireEnv('SEED_ADMIN_PASSWORD');
const SEED_ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Test Admin';

async function seed() {
    console.log('🌱 Starting database seed...\n');

    console.log(`Creating member user: ${SEED_MEMBER_EMAIL}`);
    const existingMember = await prisma.user.findUnique({
        where: { email: SEED_MEMBER_EMAIL },
    });

    if (existingMember) {
        console.log('  → Member user already exists, skipping...');
    } else {
        await auth.api.signUpEmail({
            body: {
                email: SEED_MEMBER_EMAIL,
                password: SEED_MEMBER_PASSWORD,
                name: SEED_MEMBER_NAME,
                role: UserRole.MEMBER,
            },
        });
        console.log('  ✓ Member user created');
    }

    console.log(`Creating admin user: ${SEED_ADMIN_EMAIL}`);
    const existingAdmin = await prisma.user.findUnique({
        where: { email: SEED_ADMIN_EMAIL },
    });

    if (existingAdmin) {
        console.log('  → Admin user already exists, skipping...');
    } else {
        await auth.api.signUpEmail({
            body: {
                email: SEED_ADMIN_EMAIL,
                password: SEED_ADMIN_PASSWORD,
                name: SEED_ADMIN_NAME,
                role: UserRole.ADMIN,
            },
        });
        console.log('  ✓ Admin user created');
    }

    console.log('\n✅ Seed completed!');
}

seed()
    .catch((error) => {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
