import React from "react";
import Image from "next/image";

export type PaymentQRProps = {
  total: number;
  shippingCharge: number;
};

export default function PaymentQR({ total, shippingCharge }: PaymentQRProps) {
  return (
    <div className="flex flex-col items-center justify-start rounded-2xl border border-white/10 bg-white/2 p-5 lg:sticky lg:top-0">
      <p className="mb-3 text-xs tracking-wider text-white/50 uppercase">
        Pay via UPI
      </p>
      <div className="relative mb-3 aspect-3/4 w-full max-w-[320px] rounded-2xl bg-white p-4">
        <Image
          src="/upi-qr.png"
          alt="UPI QR Code"
          fill
          sizes="(max-width: 1024px) 100vw, 320px"
          className="object-contain p-2"
        />
      </div>
      <p className="mb-1 text-lg font-medium text-white">
        ₹{total.toLocaleString("en-IN")}
      </p>
      <p className="text-center text-[10px] text-white/30">
        Includes ₹{shippingCharge} shipping. Scan to pay, then upload
        the screenshot.
      </p>
    </div>
  );
}
