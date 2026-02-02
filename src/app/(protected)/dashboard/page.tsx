import { SignOutButton } from '@/components/sign-out-button';
import { getSession } from '@/lib/auth/server';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const session = await getSession();

    if (!session?.user) {
        return void redirect('/login');
    }

    if (session.user.role === UserRole.ADMIN) {
        return void redirect('/admin');
    }

    return (
        <div className="flex min-h-svh flex-col bg-background">
            <header className="border-b">
                <div className="container flex h-16 items-center justify-between px-4">
                    <h1 className="text-xl font-semibold">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                            {session.user.name || session.user.email}
                        </span>
                        <SignOutButton />
                    </div>
                </div>
            </header>
        </div>
    );
}
