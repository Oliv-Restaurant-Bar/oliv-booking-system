import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "OLIV Restaurant & Bar - Group Bookings",
  description: "Book your group event at OLIV Restaurant & Bar. Perfect for special occasions, corporate events, and celebrations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
