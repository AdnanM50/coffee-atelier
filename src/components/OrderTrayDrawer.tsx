'use client';

import { useState } from 'react';
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useRouter } from '../context/RouterContext';

export function OrderTrayDrawer() {
  const {
    trayItems,
    isTrayOpen,
    setIsTrayOpen,
    updateTrayQty,
    removeFromTray,
    clearTray,
    traySubtotal,
    navigate,
  } = useRouter();
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  if (!isTrayOpen) return null;

  const handleCheckout = () => {
    setOrderSubmitted(true);
    setTimeout(() => {
      clearTray();
      setOrderSubmitted(false);
      setIsTrayOpen(false);
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <div
        className="fixed inset-0 bg-[#23140D]/45 backdrop-blur-sm"
        onClick={() => setIsTrayOpen(false)}
      />
      <aside
        aria-label="Barista Order Tray"
        className="relative z-10 w-full max-w-md bg-[#FAF7F2] text-[#23140D] border-l border-[#23140D]/15 h-full flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-[#23140D]/10 bg-white flex items-center justify-between">
          <div>
            <p className="font-mono-telemetry text-[11px] tracking-[0.22em] text-[#B0672B] uppercase font-semibold">
              Flagship Espresso Bar
            </p>
            <h2 className="font-display text-3xl text-[#23140D] font-semibold mt-1">Barista Order Tray</h2>
          </div>
          <button
            onClick={() => setIsTrayOpen(false)}
            aria-label="Close Barista Order Tray"
            className="w-10 h-10 rounded-full border border-[#23140D]/20 flex items-center justify-center text-[#23140D] hover:bg-[#23140D] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {orderSubmitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-[#2D5A3F]/15 border border-[#2D5A3F] flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-[#2D5A3F]" />
              </div>
              <h3 className="font-display text-3xl text-[#23140D]">Ticket Sent to Barista Bar</h3>
              <p className="text-sm text-[#23140D]/70 mt-2 max-w-xs">
                Mateo &amp; team are dialing your espresso &amp; pour-overs now. Estimated ready time: 6 minutes.
              </p>
            </div>
          ) : trayItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="w-12 h-12 text-[#B0672B]/50 mb-4" />
              <h3 className="font-display text-2xl text-[#23140D] font-semibold">Your Tasting Tray is Empty</h3>
              <p className="text-sm text-[#23140D]/65 mt-2 max-w-xs">
                Explore our full catalog of espresso classics, manual pour-overs, cold brews, and micro-lot whole beans.
              </p>
              <button
                onClick={() => {
                  setIsTrayOpen(false);
                  navigate('/products');
                }}
                className="mt-6 px-6 py-3 rounded-full bg-[#23140D] text-white font-semibold text-sm hover:bg-[#3A2218] transition-colors"
              >
                Browse Every Coffee
              </button>
            </div>
          ) : (
            trayItems.map((item) => (
              <div
                key={item.uid}
                className="rounded-2xl bg-white border border-[#23140D]/12 p-4 space-y-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <button
                      onClick={() => {
                        setIsTrayOpen(false);
                        navigate(`/products/${item.coffee.slug}`);
                      }}
                      className="font-display text-xl font-semibold text-[#23140D] hover:text-[#B0672B] transition-colors text-left"
                    >
                      {item.coffee.name}
                    </button>
                    <p className="font-mono-telemetry text-[11px] text-[#B0672B] mt-0.5 font-medium">
                      {item.customization.sizeLabel} · {item.customization.milkOrBase}
                    </p>
                    <p className="text-xs text-[#23140D]/60 mt-1">
                      {item.customization.originNote}
                      {item.customization.extraShots > 0
                        ? ` · +${item.customization.extraShots} Extra Shot`
                        : ''}
                      {` · ${item.customization.grindLabel}`}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromTray(item.uid)}
                    aria-label={`Remove ${item.coffee.name}`}
                    className="text-[#23140D]/40 hover:text-[#A62B2B] transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#23140D]/10">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#FAF7F2] border border-[#23140D]/15 px-2 py-1">
                    <button
                      onClick={() => updateTrayQty(item.uid, -1)}
                      aria-label="Decrease quantity"
                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#23140D]/10"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono-telemetry text-xs w-5 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateTrayQty(item.uid, 1)}
                      aria-label="Increase quantity"
                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#23140D]/10"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="font-mono-telemetry text-sm font-semibold text-[#23140D]">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {trayItems.length > 0 && !orderSubmitted && (
          <div className="p-6 border-t border-[#23140D]/12 bg-white space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#23140D]/70 font-medium">Atelier Preparation Subtotal</span>
              <span className="font-mono-telemetry text-lg font-semibold text-[#23140D]">
                ${traySubtotal.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 rounded-full bg-[#23140D] text-white font-semibold text-sm hover:bg-[#3A2218] transition-colors shadow-lg"
            >
              Transmit Order to Barista Bar
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
