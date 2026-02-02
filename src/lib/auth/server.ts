import { headers } from 'next/headers';

import { auth } from './shared';

export { auth, type Session } from './shared';

export async function getSession() {
    return auth.api.getSession({
        headers: await headers(),
    });
}
