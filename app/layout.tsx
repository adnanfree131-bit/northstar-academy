import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Northstar Academy | School Management",
  description: "Complete school management system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.min.css"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-mono/style.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#fafafa] antialiased">
        <Sidebar />
        <div className="pl-[260px]">
          <Header />
          <main className="min-h-[calc(100vh-4rem)] p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
