import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google';
import { Source_Code_Pro } from 'next/font/google';

export const metadata: Metadata = {
  title: 'CodeInsightAI',
  description: 'AI-powered code analysis and bug fixing.',
};

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const sourceCodePro = Source_Code_Pro({ subsets: ['latin'], variable: '--font-mono' });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${sourceCodePro.variable}`}>
      <body>
        <main>
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
