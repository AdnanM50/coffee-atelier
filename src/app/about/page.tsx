import type { Metadata } from 'next';
import { AboutPage } from '@/views/AboutPage';

export const metadata: Metadata = {
  title: 'Atelier & Farms',
  description:
    'Explore partner volcanic estates, direct-trade harvests, and the thermodynamic roasting craft behind Aether & Crema.',
};

export default function AboutRoute() {
  return <AboutPage />;
}
