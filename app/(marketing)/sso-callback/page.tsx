"use client";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading...</p>
      <div id="clerk-captcha" className="mb-3"></div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}







