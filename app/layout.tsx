import type { Metadata } from 'next';
import { Poppins, Inter, Nunito } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-body',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['800', '900'],
  variable: '--font-logo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Waya — Relational Study Partner',
  description:
    'Learn any academic concept through what you love. Waya is an AI study partner that builds your knowledge map, one synthesis at a time.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" className={`${poppins.variable} ${inter.variable} ${nunito.variable}`}>
      <body className="font-body bg-bg-primary text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
