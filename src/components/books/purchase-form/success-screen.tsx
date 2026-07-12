import React from "react";

export type SuccessScreenProps = {
  titleId: string;
  orderId: string;
  onClose: () => void;
  closeButtonRef: React.RefObject<HTMLButtonElement | null>;
};

export default function SuccessScreen({
  titleId,
  orderId,
  onClose,
  closeButtonRef,
}: SuccessScreenProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-[min(96vw,72rem)] rounded-[2rem] border border-emerald-400/20 bg-[#0f1118] p-6 text-center shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p id={titleId} className="mb-2 text-lg text-emerald-400">
          Order Placed!
        </p>
        <p className="mb-1 text-sm text-white/60">Order ID: {orderId}</p>
        <p className="text-xs text-white/50">
          You will receive a confirmation email shortly. We will verify your
          payment and update you.
        </p>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="mt-4 text-xs text-white/40 underline underline-offset-4 hover:text-white/60"
        >
          Close
        </button>
      </div>
    </div>
  );
}
