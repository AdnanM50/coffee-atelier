import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { COFFEES } from '@/data/coffeeData';
import { ProductDetailPage } from '@/views/ProductDetailPage';

export function generateStaticParams() {
  return COFFEES.map((coffee) => ({
    slug: coffee.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const coffee = COFFEES.find((c) => c.slug === slug);
  if (!coffee) {
    return {
      title: 'Coffee Lot Not Found',
    };
  }

  return {
    title: coffee.name,
    description: coffee.subtitle,
  };
}

export default async function ProductDetailRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const coffee = COFFEES.find((c) => c.slug === slug);
  if (!coffee) {
    notFound();
  }

  return <ProductDetailPage slug={slug} />;
}
