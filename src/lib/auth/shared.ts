import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

import { prisma } from '../db';

export const auth = betterAuth({
    appName: 'Web App Template',
    database: prismaAdapter(prisma, {
        provider: 'postgresql',
        transaction: true,
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        modelName: 'User',
        additionalFields: {
            role: {
                type: 'string',
                required: true,
            },
        },
    },
    session: { modelName: 'Session' },
    account: { modelName: 'Account' },
    verification: { modelName: 'Verification' },
});

export type Session = typeof auth.$Infer.Session;
