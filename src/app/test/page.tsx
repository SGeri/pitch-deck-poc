'use client';

import { Button } from '@/components/ui/button';

import { testPptxExtraction } from '@/actions/test';

export default function TestPage() {
    const handleTest = async () => {
        const result = await testPptxExtraction();
        console.log('Result:', result);
    };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <Button onClick={handleTest}>Test</Button>
        </div>
    );
}
