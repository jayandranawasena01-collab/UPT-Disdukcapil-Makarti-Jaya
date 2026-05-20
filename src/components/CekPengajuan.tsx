import React, { useState, useMemo } from "react";
import { BerkasRecord } from "../types";
import { DRIVE_LINKS } from "../data";

interface CekPengajuanProps {
  berkasDB: Record<string, BerkasRecord[]>;
}

export default function CekPengajuan({ berkasDB }: CekPengajuanProps) {
  const [category, setCategory] = useState<"KK" | "AKL" | "AKM" | "SKPWNI" | "AKW" | "IKD">("KK");
  const [filterDoc, setFilterDoc] = useState("");
  const [filterNama, setFilterNama] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const docLabel = useMemo(() => {
    if (category === "KK") return "Nomor Kartu Keluarga (KK)";
    if (category === "AKL") return "Nomor Akta Kelahiran";
    if (category === "AKM") return "Nomor Akta Kematian";
    if (category === "SKPWNI") return "Nomor SKPWNI / Referensi";
    if (category === "AKW") return "Nomor Akta Perkawinan";
    if (category === "IKD") return "Nomor HP Registrasi IKD";
    return "Nomor Referensi";
  }, [category]);

  const searchResults = useMemo(() => {
    if (!hasSearched) return [];
    
    const list = berkasDB[category] || [];
    const searchName = filterNama.toLowerCase().trim();
    const searchDoc = filterDoc.toLowerCase().trim();

    return list.filter((item) => {
      const matchDoc = !searchDoc || (item.noDokumen && item.noDokumen.toLowerCase().includes(searchDoc));
      const matchName = !searchName || (item.nama && item.nama.toLowerCase().includes(searchName));
      return matchDoc && matchName;
    });
  }, [berkasDB, category, filterDoc, filterNama, hasSearched]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filterDoc && !filterNama) {
      alert("Silahkan isi setidaknya filter nomor referensi atau nama pemohon.");
      return;
    }
    setHasSearched(true);
  };

  return (
    <div id="sec-cek-pengajuan" className="animate-fade-in relative z-10">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
          Cek & Lacak Pengajuan Berkas
        </h2>
        <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">
          Verifikasi status berkas pemohon yang telah diupload dan disetujui dalam sistem integrasi.
        </p>
      </div>

      {/* Query panel */}
      <div className="bg-white rounded-[1.5rem] p-5 sm:p-6 mb-6 sm:mb-8 shadow-sm border border-slate-100">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Kategori Berkas
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as any);
                setHasSearched(false);
              }}
              className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="KK">Kartu Keluarga (KK)</option>
              <option value="AKL">Akta Kelahiran (AKL)</option>
              <option value="AKM">Akta Kematian (AKM)</option>
              <option value="SKPWNI">Surat Ket. Pindah (SKPWNI)</option>
              <option value="AKW">Akta Perkawinan (AKW)</option>
              <option value="IKD">Aktivasi IKD (IKD)</option>
            </select>
          </div>
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              {docLabel}
            </label>
            <input
              type="text"
              value={filterDoc}
              onChange={(e) => setFilterDoc(e.target.value)}
              placeholder="Masukkan nomor dokumen..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Nama Lengkap Pemohon
            </label>
            <input
              type="text"
              value={filterNama}
              onChange={(e) => setFilterNama(e.target.value)}
              placeholder="Masukkan nama..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white p-3.5 rounded-xl font-bold shadow-md hover:shadow transition-all flex justify-center items-center gap-2 cursor-pointer text-sm"
            >
              🔍 Cari Berkas
            </button>
          </div>
        </form>
      </div>

      {/* Query lists results */}
      <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-100">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 text-lg">
            📜
          </div>
          <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">
            Hasil Pencarian Pengajuan
          </h3>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm text-left text-slate-600 whitespace-nowrap">
            <thead className="text-[11px] sm:text-xs text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4 font-bold">No</th>
                <th className="px-5 py-4 font-bold">Nama Pemohon / Pemilik</th>
                <th className="px-5 py-4 font-bold">{docLabel}</th>
                <th className="px-5 py-4 font-bold">NIK</th>
                <th className="px-5 py-4 font-bold">Desa</th>
                <th className="px-5 py-4 font-bold">Nama File</th>
                <th className="px-5 py-4 font-bold text-center">Status / Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!hasSearched ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400 font-medium">
                    🔍 Silahkan masukkan kata kunci pencarian di atas untuk memulai.
                  </td>
                </tr>
              ) : searchResults.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-500 font-medium">
                    📂 Tidak ada berkas yang terverifikasi dalam pencarian Anda. Silahkan periksa NIK / Nama kembali.
                  </td>
                </tr>
              ) : (
                searchResults.map((item, index) => (
                  <tr key={item.id + index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-medium">{index + 1}</td>
                    <td className="px-5 py-4 font-bold text-slate-800 uppercase">{item.nama}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{item.noDokumen}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{item.nik}</td>
                    <td className="px-5 py-4 text-xs font-semibold">{item.kelurahan}</td>
                    <td className="px-5 py-4 font-medium max-w-[150px] truncate text-slate-700">
                      📄 {item.fileName}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <a
                        href={item.fileUrl || DRIVE_LINKS[category]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white font-bold px-4 py-2 rounded-lg transition-colors text-xs border border-emerald-200 hover:border-transparent shadow-sm"
                      >
                        📥 Download Berkas
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
