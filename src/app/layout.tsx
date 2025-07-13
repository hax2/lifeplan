import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // This path is relative and correct
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"], display: 'swap' });

export const metadata: Metadata = {
  title: "Samer's Dashboard",
  description: "A minimalist, intelligent life management application for clarity and control.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="bottom-center" toastOptions={{
          className: 'bg-gray-800 text-white',
        }}/>
        {children}
      </body>
    </html>
  );
}