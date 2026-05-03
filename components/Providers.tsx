"use client";

import { ThemeProvider } from "@/components/ThemeProvider";
import { SocketProvider } from "@/components/SocketProvider";
import { UserProvider } from "@/components/UserProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SocketProvider>
            <UserProvider>
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </UserProvider>
        </SocketProvider>
    );
}








