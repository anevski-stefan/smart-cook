import type { Metadata } from "next";
import { Geist } from 'next/font/google';
import "./globals.css";
import Providers from '@/components/Providers';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Smart Cook",
  description: "Your AI-powered cooking assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.className}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
