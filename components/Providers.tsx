"use client";

import { ThemeProvider } from "@/components/ThemeProvider";
import { SocketProvider } from "@/components/SocketProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <SocketProvider>
                {children}
            </SocketProvider>
        </ThemeProvider>
    );
}








