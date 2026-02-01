'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { signOut } from '@/lib/auth/client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SignOutButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function handleSignOut() {
        setIsLoading(true);
        await signOut();
        router.push('/login');
        router.refresh();
    }

    return (
        <Button variant="outline" onClick={handleSignOut} disabled={isLoading}>
            {isLoading ? <Spinner /> : <LogOut className="size-4" />}
            Sign out
        </Button>
    );
}
