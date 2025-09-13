"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SSOCallback() {
  const router = useRouter();

  useEffect(() => {
    // Get the redirect URL from the query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect_url');
    
    // Small delay to ensure Clerk has processed the authentication
    const timer = setTimeout(() => {
      if (redirectUrl) {
        // Decode and redirect to the intended URL
        const decodedUrl = decodeURIComponent(redirectUrl);
        router.push(decodedUrl);
      } else {
        // Default redirect to backlog
        router.push('/project/backlog');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
