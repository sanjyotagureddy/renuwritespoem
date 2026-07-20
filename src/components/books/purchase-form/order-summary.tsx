type OrderSummaryProps = {
  copies: number;
  setCopies: (copies: number) => void;
  subtotal: number;
  payablePrice: number;
  shippingCharge: number;
  total: number;
};

export default function OrderSummary({
  copies,
  setCopies,
  subtotal,
  payablePrice,
  shippingCharge,
  total,
}: OrderSummaryProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="mb-1.5 block text-xs text-white/60">
            Copies
          </label>
          <select
            value={copies}
            onChange={(e) => setCopies(parseInt(e.target.value, 10))}
            className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col justify-end">
          <p className="mb-1 text-xs text-white/40">Subtotal</p>
          <p className="text-xl font-medium text-white">
            ₹{subtotal.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-white/30">
            ₹{payablePrice.toLocaleString("en-IN")} × {copies}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-white/2 px-4 py-3 text-sm text-white/70 mt-4">
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span>₹{shippingCharge.toLocaleString("en-IN")}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-white">
          <span>Total Payable</span>
          <span>₹{total.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </>
  );
}
