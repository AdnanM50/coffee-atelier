import type { Metadata } from 'next';
import {
  Cinzel_Decorative,
  Cormorant_Garamond,
  JetBrains_Mono,
  Playfair_Display,
  Plus_Jakarta_Sans,
} from 'next/font/google';
import { AppShell } from '@/components/AppShell';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const cinzel = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-cinzel',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'AETHER & CREMA — Atelier de Torréfaction & Barista Sanctuary',
    template: '%s | AETHER & CREMA',
  },
  description:
    'From misty volcanic mountain farms to 9-bar extraction—experience our 1,000-frame scroll-scrubbed coffee origin chronicle and specialty barista sanctuary.',
  openGraph: {
    title: 'AETHER & CREMA — Atelier de Torréfaction & Barista Sanctuary',
    description:
      'Specialty coffee atelier featuring a 1,000-frame farm-to-shop cinema scroll experience, thermodynamic brew lab, and bespoke barista menu.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontVariables = [
    plusJakarta.variable,
    cormorant.variable,
    playfair.variable,
    cinzel.variable,
    jetbrainsMono.variable,
  ].join(' ');

  return (
    <html lang="en" className={fontVariables}>
      <body className="bg-[#FAF7F2] text-[#23140D] antialiased selection:bg-[#23140D] selection:text-[#FAF7F2]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
