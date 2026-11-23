import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#23140D] flex items-center justify-center px-6 pt-28 pb-20">
      <div className="max-w-xl text-center space-y-6">
        <p className="font-mono-telemetry text-xs tracking-[0.28em] text-[#B0672B] uppercase font-semibold">
          404 // LOT NOT FOUND
        </p>
        <h1 className="font-fancy-serif text-5xl sm:text-6xl font-bold text-[#23140D] leading-tight">
          This Roast Has
          <span className="block italic font-normal text-[#B0672B] mt-1">Left the Bar</span>
        </h1>
        <p className="text-base text-[#23140D]/70 leading-relaxed">
          The page or single-origin lot you requested could not be found. Return to the origin chronicle or explore our full barista menu.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-[#23140D] text-white text-sm font-semibold hover:bg-[#3A2218] transition-colors"
          >
            Return to Origin Film
          </Link>
          <Link
            href="/products"
            className="px-6 py-3 rounded-full border border-[#23140D]/20 text-[#23140D] text-sm font-semibold hover:bg-[#F2ECE1] transition-colors"
          >
            Browse Every Coffee
          </Link>
        </div>
      </div>
    </div>
  );
}
