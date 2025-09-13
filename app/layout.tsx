import { ClerkProvider } from "@clerk/nextjs";
import { type Metadata } from "next";
import { siteConfig } from "@/config/site";
import "@/styles/globals.css";
import Toaster from "@/components/toast";
import QueryProvider from "@/utils/provider";
import { AuthModalProvider } from "@/context/use-auth-modal";
import { SelectedProjectProvider } from "@/context/use-selected-project-context";
import { ClientClerkProvider } from "@/components/providers/clerk-provider";
import { AuthModal } from "@/components/modals/auth";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Jira",
    "Next.js",
    "React",
    "Tailwind CSS",
    "Server Components",
    "Radix UI",
    "Clerk",
    "TanStack",
  ],
  authors: [
    {
      name: "Kanishk Mittal",
      url: "https://millionairethinking.co.uk",
    },
  ],
  creator: "Sebastian Fernandez",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <head />
      <body>
        <ClientClerkProvider>  {/* Authentication context */}
          <QueryProvider>      {/* Data fetching context */}
            <SelectedProjectProvider>  {/* Project selection context */}
              <AuthModalProvider>  {/* Modal state context */}
                <AuthModal />      {/*  Modal component */}
                {/* Toast notifications */}
                <Toaster            
                  position="bottom-left"
                  reverseOrder={false}
                  containerStyle={{
                    height: "92vh",
                    marginLeft: "3vw",
                  }}
                />
                {children}        {/* All your app pages */}
              </AuthModalProvider>
            </SelectedProjectProvider>
          </QueryProvider>
        </ClientClerkProvider>
      </body>
    </html>
  );
};

export default RootLayout;
