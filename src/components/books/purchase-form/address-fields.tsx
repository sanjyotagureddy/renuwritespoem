export default function AddressFields() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs text-white/60">
            Full Name *
          </label>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-white/60">
            Email *
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs text-white/60">
          Phone *
        </label>
        <input
          name="phone"
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          maxLength={15}
          className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs text-white/60">
          Address *
        </label>
        <textarea
          name="address"
          required
          rows={2}
          className="w-full resize-none rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs text-white/60">
            City *
          </label>
          <input
            name="city"
            required
            className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-white/60">
            State *
          </label>
          <input
            name="state"
            required
            className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-white/60">
            Pincode *
          </label>
          <input
            name="pincode"
            required
            pattern="\d{6}"
            maxLength={6}
            inputMode="numeric"
            autoComplete="postal-code"
            className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
          />
        </div>
      </div>
    </div>
  );
}
