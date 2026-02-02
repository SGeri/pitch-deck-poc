import { SignOutButton } from '@/components/sign-out-button';
import { getSession } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
    const session = await getSession();

    if (session?.user.role !== 'ADMIN') {
        return void redirect('/dashboard');
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background p-6">
            <h1 className="text-3xl font-bold">Hello Admin</h1>
            <p className="text-muted-foreground">
                Welcome to the admin panel,{' '}
                {session.user.name || session.user.email}
            </p>
            <SignOutButton />
        </div>
    );
}
