/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { Suspense } from 'react';
import CheckoutClient from './CheckoutClient';

// Keep forcing dynamic rendering in case CheckoutClient relies on client-only hooks
export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            {/* CheckoutClient contains all client-side hooks like useSearchParams */}
            <CheckoutClient />
        </Suspense>
    );
}