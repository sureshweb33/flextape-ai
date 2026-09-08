"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/order")
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">FlexTape AI — Admin</h1>
          <p className="text-sm text-slate-500">Mesocare Holistic Pvt Ltd</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 font-semibold text-slate-700">
            Recent Orders
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No orders yet. Create one from the customer app.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.map((o) => (
                <div key={o.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-mono font-medium text-slate-900">{o.orderNumber}</div>
                    <div className="text-sm text-slate-500">{o.selectedDesign?.name} • {o.tapeWidth}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                      {o.paymentStatus}
                    </span>
                    <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full">
                      {o.productionStatus}
                    </span>
                    {o.printFileUrl && (
                      <a
                        href={o.printFileUrl}
                        target="_blank"
                        className="text-sm text-sky-600 hover:underline"
                      >
                        Download PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="mt-4 text-sm text-slate-500">
          This is a minimal demo admin. Full version will have filters, status updates, printer controls, etc.
        </p>
      </div>
    </div>
  );
}
