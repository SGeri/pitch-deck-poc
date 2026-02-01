import { LoginForm } from '@/components/login-form';
import { getSession } from '@/lib/auth/server';
import { UserRole } from '@prisma/client';
import { GalleryVerticalEnd } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
    const session = await getSession();

    if (session?.user) {
        if (session.user.role === UserRole.ADMIN) {
            return void redirect('/admin');
        }

        return void redirect('/dashboard');
    }

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link
                        href="/"
                        className="flex items-center gap-2 font-medium"
                    >
                        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                        Web App Template
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-md">
                        <LoginForm />
                    </div>
                </div>
            </div>
            <div className="bg-muted relative hidden lg:block">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-muted-foreground text-lg">
                        Welcome to Web App Template
                    </div>
                </div>
            </div>
        </div>
    );
}
