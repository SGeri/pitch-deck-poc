import { Button } from '@/components/ui/button';
import { getSession } from '@/lib/auth/server';
import { GalleryVerticalEnd } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function HomePage() {
    const session = await getSession();

    if (session?.user) {
        if (session.user.role === 'ADMIN') {
            return void redirect('/admin');
        }

        return void redirect('/dashboard');
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-background p-6">
            <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                    <GalleryVerticalEnd className="size-5" />
                </div>
                <span className="text-2xl font-semibold">Web App Template</span>
            </div>
            <p className="text-muted-foreground text-center max-w-md">
                Welcome to Web App Template. Please sign in to continue.
            </p>
            <Button asChild>
                <Link href="/login">Sign in</Link>
            </Button>
        </div>
    );
}
