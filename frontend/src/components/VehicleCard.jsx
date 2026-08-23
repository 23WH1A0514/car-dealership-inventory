export default function VehicleCard({
  vehicle,
  onPurchase,
  isAdmin,
  onDelete
}) {
  const isOutOfStock = vehicle.quantity === 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">

      <div className="flex h-44 items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
        <div className="text-6xl">🚗</div>
      </div>

      <div className="p-5">

        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {vehicle.make} {vehicle.model}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {vehicle.category}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isOutOfStock
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {isOutOfStock
              ? "Out of Stock"
              : `${vehicle.quantity} available`}
          </span>
        </div>

        <p className="mt-4 text-2xl font-bold text-blue-600">
          ${Number(vehicle.price).toLocaleString()}
        </p>

        <div className="mt-5 flex gap-2">

          <button
            onClick={() => onPurchase(vehicle._id)}
            disabled={isOutOfStock}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isOutOfStock ? "Unavailable" : "Purchase"}
          </button>

          {isAdmin && (
            <button
              onClick={() => onDelete(vehicle._id)}
              className="rounded-lg bg-red-100 px-4 py-3 font-semibold text-red-700 hover:bg-red-200"
            >
              Delete
            </button>
          )}

        </div>

      </div>
    </div>
  );
}