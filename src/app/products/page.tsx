import type { Metadata } from 'next';
import { ProductsPage } from '@/views/ProductsPage';

export const metadata: Metadata = {
  title: 'Every Coffee',
  description:
    'Browse espresso classics, manual pour-overs, cold signature creations, global heritage brews, and roastery whole-bean lots.',
};

export default function ProductsRoute() {
  return <ProductsPage />;
}
