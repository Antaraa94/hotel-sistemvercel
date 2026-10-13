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

export default function Home() {
  const [todayStr, setTodayStr] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    checkInDate: '',
    checkOutDate: '',
  });
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Dohvaćanje soba i postavljanje današnjeg datuma tek na klijentu
  const fetchRooms = async () => {
    try {
      const res = await fetch('https://hotel-backend-hita.onrender.com/api/rooms');
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (err) {
      console.error('Greška pri dohvatu soba:', err);
    }
  };

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
    fetchRooms();
  }, []);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    try {
      const res = await fetch('https://hotel-backend-hita.onrender.com/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          ...formData,
        }),
      });

      if (res.ok) {
        setMessage({ text: 'Rezervacija uspješno kreirana!', isError: false });
        setSelectedRoom(null);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          checkInDate: '',
          checkOutDate: '',
        });
      } else {
        const errorText = await res.text();
        setMessage({ text: errorText || 'Greška pri rezervaciji (provjeri datume ili zauzetost).', isError: true });
      }
    } catch {
      setMessage({ text: 'Neuspješno slanje zahtjeva na server.', isError: true });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8 text-slate-800">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Hotel Management & Booking</h1>
            <p className="text-sm text-slate-500">Sustav za rezervacije soba</p>
          </div>
          <Link
            href="/dashboard"
            className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
          >
            Recepcijski Dashboard →
          </Link>
        </header>

        {message && (
          <div
            className={`p-4 mb-6 rounded-md font-medium ${
              message.isError ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Popis Soba */}
          <section className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Dostupne sobe</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`p-5 rounded-lg border bg-white shadow-sm transition hover:shadow-md ${
                    selectedRoom?.id === room.id ? 'ring-2 ring-blue-600 border-blue-600' : 'border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-lg font-bold text-slate-900">Soba {room.roomNumber}</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {room.type}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 mb-4">
                    {room.pricePerNight} <span className="text-sm font-normal text-slate-500">€ / noć</span>
                  </p>
                  <button
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full py-2 px-4 rounded font-medium text-sm transition ${
                      selectedRoom?.id === room.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    }`}
                  >
                    {selectedRoom?.id === room.id ? 'Odabrana' : 'Odaberi za rezervaciju'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Forma za Rezervaciju */}
          <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-fit">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Nova rezervacija</h2>
            {selectedRoom ? (
              <form onSubmit={handleBooking} className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800">
                  Rezervirate: <strong>Soba {selectedRoom.roomNumber}</strong> ({selectedRoom.type})
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Ime</label>
                  <input
                    required
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Prezime</label>
                  <input
                    required
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Email</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Broj telefona</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Prijava</label>
                    <input
                      required
                      type="date"
                      min={todayStr || undefined}
                      value={formData.checkInDate}
                      onChange={(e) => {
                        const newCheckIn = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          checkInDate: newCheckIn,
                          checkOutDate: prev.checkOutDate && prev.checkOutDate <= newCheckIn ? '' : prev.checkOutDate,
                        }));
                      }}
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Odjava</label>
                    <input
                      required
                      type="date"
                      min={formData.checkInDate || todayStr || undefined}
                      value={formData.checkOutDate}
                      onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-medium py-2.5 rounded shadow hover:bg-blue-700 transition"
                >
                  Potvrdi rezervaciju
                </button>
              </form>
            ) : (
              <p className="text-sm text-slate-500">Odaberite sobu s popisa s lijeve strane za unos podataka.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
