'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Room {
  id: number;
  roomNumber: string;
  type: string;
  pricePerNight: number;
  status: string;
}

interface Reservation {
  id: number;
  room: { id: number; roomNumber: string; type: string };
  guest: { firstName: string; lastName: string; email: string };
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: string;
}

interface OrderItem {
  id: number;
  itemName: string;
  price: number;
}

export default function ReceptionDashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  const fetchRooms = async () => {
    try {
      const res = await fetch('https://hotel-backend-hita.onrender.com/api/rooms');
      if (res.ok) setRooms(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await fetch('https://hotel-backend-hita.onrender.com/api/reservations');
      if (res.ok) setReservations(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOrders = async (resId: number) => {
    try {
      const res = await fetch(`https://hotel-backend-hita.onrender.com/api/pos/orders/${resId}`);
      if (res.ok) setOrders(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchReservations();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    await fetch(`https://hotel-backend-hita.onrender.com/api/reservations/${id}/status?status=${newStatus}`, {
      method: 'PATCH',
    });
    fetchReservations();
    fetchRooms();
    if (selectedRes?.id === id) {
      setSelectedRes((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRes) return;

    const res = await fetch('https://hotel-backend-hita.onrender.com/api/pos/charge-to-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reservationId: selectedRes.id,
        itemName,
        price: parseFloat(itemPrice),
      }),
    });

    if (res.ok) {
      setItemName('');
      setItemPrice('');
      fetchOrders(selectedRes.id);
    } else {
      alert('Gost mora biti u statusu CHECKED_IN za dodavanje stavki na račun!');
    }
  };

  const selectReservationDetails = (r: Reservation) => {
    setSelectedRes(r);
    fetchOrders(r.id);
  };

  const totalExtra = orders.reduce((sum, item) => sum + item.price, 0);

  // Statistika za vrh ekrana
  const activeCheckIns = reservations.filter((r) => r.status === 'CHECKED_IN').length;
  const totalRevenue = reservations.reduce((sum, r) => sum + r.totalPrice, 0);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigacija i Zaglavlje */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-5 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <h1 className="text-2xl font-bold tracking-tight text-white">PMS & POS Control Center</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Nadzorna ploča recepcije, statusa soba i zaduženja</p>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-lg transition"
          >
            ← Otvori Booking za goste
          </Link>
        </header>

        {/* Brza statistika (KPI kartice) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Ukupno soba</p>
            <p className="text-2xl font-black text-white mt-1">{rooms.length}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Aktivnih prijava (Gosti u sobama)</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{activeCheckIns}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Ukupna vrijednost noćenja</p>
            <p className="text-2xl font-black text-blue-400 mt-1">{totalRevenue} €</p>
          </div>
        </div>

        {/* Room Grid (Status Soba uživo) */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Mreža soba & Domaćinstvo (Housekeeping)
            </h2>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Slobodno</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Zauzeto</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {rooms.map((room) => {
              const isOccupied = reservations.some(
                (r) => r.room.roomNumber === room.roomNumber && r.status === 'CHECKED_IN'
              );
              return (
                <div
                  key={room.id}
                  className={`p-4 rounded-lg border transition ${
                    isOccupied
                      ? 'bg-blue-950/40 border-blue-600/60 text-blue-200'
                      : 'bg-slate-800/60 border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-base font-bold">Soba {room.roomNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isOccupied ? 'bg-blue-600 text-white' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {isOccupied ? 'ZAUZETO' : 'SLOBODNO'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{room.type} • {room.pricePerNight} €/noć</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Donji dio: Tablica rezervacija i POS panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Rezervacije */}
          <div className="lg:col-span-2 bg-slate-900 rounded-xl p-5 border border-slate-800">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">
              Aktivne i arhivirane rezervacije
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase">
                    <th className="pb-3">Soba</th>
                    <th className="pb-3">Gost</th>
                    <th className="pb-3">Period boravka</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Akcija</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reservations.map((r) => (
                    <tr
                      key={r.id}
                      onClick={() => selectReservationDetails(r)}
                      className={`cursor-pointer hover:bg-slate-800/50 transition ${
                        selectedRes?.id === r.id ? 'bg-slate-800/80 ring-1 ring-blue-500/50' : ''
                      }`}
                    >
                      <td className="py-3.5 font-bold text-blue-400">{r.room.roomNumber}</td>
                      <td className="py-3.5 font-medium">{r.guest.firstName} {r.guest.lastName}</td>
                      <td className="py-3.5 text-xs text-slate-400">{r.checkInDate} → {r.checkOutDate}</td>
                      <td className="py-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wide ${
                            r.status === 'CHECKED_IN'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : r.status === 'CHECKED_OUT'
                              ? 'bg-slate-800 text-slate-500'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-2">
                        {r.status === 'CONFIRMED' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(r.id, 'CHECKED_IN');
                            }}
                            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded font-medium transition"
                          >
                            Check-in
                          </button>
                        )}
                        {r.status === 'CHECKED_IN' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(r.id, 'CHECKED_OUT');
                            }}
                            className="text-xs bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded font-medium transition"
                          >
                            Check-out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* POS panel zaduženja */}
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 h-fit">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">
              POS Zaduženje na sobu
            </h2>

            {selectedRes ? (
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 text-xs space-y-1.5">
                  <p><span className="text-slate-500">Gost:</span> <span className="font-semibold text-slate-200">{selectedRes.guest.firstName} {selectedRes.guest.lastName}</span></p>
                  <p><span className="text-slate-500">Broj sobe:</span> <span className="font-semibold text-slate-200">{selectedRes.room.roomNumber} ({selectedRes.room.type})</span></p>
                  <p><span className="text-slate-500">Trošak noćenja:</span> {selectedRes.totalPrice} €</p>
                  <p><span className="text-slate-500">Restoran / Bar / Spa:</span> {totalExtra} €</p>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
                    <span>UKUPNO ZA NAPLATU:</span>
                    <span className="text-emerald-400 text-base">{selectedRes.totalPrice + totalExtra} €</span>
                  </div>
                </div>

                {selectedRes.status === 'CHECKED_IN' ? (
                  <form onSubmit={handleAddOrder} className="space-y-3 pt-1">
                    <p className="text-xs font-semibold text-slate-400">Nova narudžba na račun sobe:</p>
                    <input
                      type="text"
                      placeholder="Artikl (npr. Aperol Spritz, Masaža, Doručak)"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Iznos u €"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded text-xs transition"
                    >
                      Potvrdi i dodaj na sobu
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-amber-500 bg-amber-950/30 p-2.5 rounded border border-amber-900/50">
                    Stavke se mogu dodavati samo gostima koji su trenutno u sobi (status: CHECKED_IN).
                  </p>
                )}

                <div className="pt-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Pojedinačne stavke računa:</h3>
                  {orders.length === 0 ? (
                    <p className="text-xs text-slate-600 italic">Nema evidentiranih vanjskih troškova.</p>
                  ) : (
                    <ul className="divide-y divide-slate-800 text-xs">
                      {orders.map((o) => (
                        <li key={o.id} className="py-2 flex justify-between items-center">
                          <span className="text-slate-300">{o.itemName}</span>
                          <span className="font-semibold text-slate-100">{o.price.toFixed(2)} €</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Odaberite rezervaciju iz tablice za detalje računa.</p>
            )}
          </div>

        </div>

      </div>
    </main>
  );
}
