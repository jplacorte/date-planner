import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';
import { DateProvider } from '../context/DateContext';
import SmoothScroll from '../components/SmoothScroll';

const sansFont = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const serifFont = Playfair_Display({
  variable: '--font-serif',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Phillip's Date Planner",
  description: "Romantic date planner, bucket list curator, and memory scrapbook for Phillip.",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sansFont.variable} ${serifFont.variable} dark`} data-theme="dusk" suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased overflow-x-hidden transition-colors duration-700" suppressHydrationWarning>
        <SmoothScroll>
          <DateProvider>
            {children}
          </DateProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
