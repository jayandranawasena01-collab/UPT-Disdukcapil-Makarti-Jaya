import React, { useState, useMemo } from "react";
import { ServiceType, PelayananRecord } from "../types";
import { KELURAHAN_LIST, SERVICE_LABELS } from "../data";

interface ManajemenDataProps {
  pelayananDB: Record<ServiceType, PelayananRecord[]>;
  onDelete: (service: ServiceType, rowNumber: number) => void;
  onUpdate: (service: ServiceType, rowNumber: number, updated: { tanggal: string; nama: string; noDokumen: string; nik: string; kelurahan: string }) => void;
}

export default function ManajemenData({ pelayananDB, onDelete, onUpdate }: ManajemenDataProps) {
  const [filterService, setFilterService] = useState<ServiceType>("Penerbitan KK");
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<PelayananRecord | null>(null);
  const [editTanggal, setEditTanggal] = useState("");
  const [editNama, setEditNama] = useState("");
  const [editNoDokumen, setEditNoDokumen] = useState("");
  const [editNik, setEditNik] = useState("");
  const [editKelurahan, setEditKelurahan] = useState("");

  // Filter computation
  const filteredData = useMemo(() => {
    const list = pelayananDB[filterService] || [];
    return list.filter((item) => {
      if (filterStart && item.tanggal < filterStart) return false;
      if (filterEnd && item.tanggal > filterEnd) return false;
      return true;
    });
  }, [pelayananDB, filterService, filterStart, filterEnd]);

  // Document label in grid
  const docLabelHeader = useMemo(() => {
    if (filterService === "Penerbitan KK") return "No Kartu Keluarga";
    if (filterService === "Aktivasi IKD") return "Nomor HP / Kode Aktivasi";
    if (filterService.includes("Akta")) return "No Akta";
    return "No Referensi";
  }, [filterService]);

  // Open Edit Modal safely
  const handleOpenEdit = (rec: PelayananRecord) => {
    setEditingRecord(rec);
    setEditTanggal(rec.tanggal);
    setEditNama(rec.nama);
    setEditNoDokumen(rec.noDokumen);
    setEditNik(rec.nik);
    setEditKelurahan(rec.kelurahan);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    if (editNik.length !== 16) {
      alert("NIK harus berupa 16 digit angka.");
      return;
    }

    onUpdate(filterService, editingRecord.rowNumber, {
      tanggal: editTanggal,
      nama: editNama.toUpperCase(),
      noDokumen: editNoDokumen,
      nik: editNik,
      kelurahan: editKelurahan.toUpperCase()
    });

    setEditingRecord(null);
  };

  const handleDeleteClick = (rowNumber: number, name: string) => {
    if (window.confirm(`Hapus permanen data pelayanan atas nama "${name}"?`)) {
      onDelete(filterService, rowNumber);
    }
  };

  // CSV Generator for clean Excel Exports
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }

    const headers = ["No", "Tanggal Input", "Nama Lengkap Pemohon", docLabelHeader, "NIK", "Kelurahan/Desa"];
    const rows = filteredData.map((item, idx) => [
      idx + 1,
      item.tanggal,
      item.nama,
      item.noDokumen,
      item.nik,
      item.kelurahan
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Database_${filterService.replace(/\s+/g, "_")}_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp Batch Sender - matches backup script logic perfectly
  const handleKirimWhatsApp = () => {
    if (filteredData.length === 0) {
      alert("Tidak ada data untuk dikirim.");
      return;
    }

    const d = new Date();
    const tglWA = `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
    
    let waMessage = `*REKAPITULASI PELAYANAN: ${filterService.toUpperCase()}*\n`;
    waMessage += `Tanggal Sesi: ${tglWA}\n`;
    waMessage += `=========================\n\n`;

    filteredData.forEach((item, idx) => {
      waMessage += `${idx + 1}. [${item.tanggal}] - NIK: *${item.nik}* - NAMA: *${item.nama}* - REF/HP: _${item.noDokumen}_\n`;
    });

    const targetNumber = "6285789703965";
    const waUrl = `https://api.whatsapp.com/send?phone=${targetNumber}&text=${encodeURIComponent(waMessage.trim())}`;
    
    if (window.confirm("Format data rekap siap dikirim ke administrator. Lanjutkan membuka WhatsApp?")) {
      window.open(waUrl, "_blank");
    }
  };

  return (
    <div id="sec-manage" className="animate-fade-in relative z-10">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
          Manajemen Database Pelayanan
        </h2>
        <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">
          Eksplorasi, perbarui, dan hapus data operasional yang tersimpan di sistem.
        </p>
      </div>

      {/* Filter Box */}
      <div className="bg-white rounded-[1.5rem] p-5 sm:p-6 mb-6 sm:mb-8 shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Kategori Layanan
            </label>
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value as ServiceType)}
              className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {Object.entries(SERVICE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Mulai Tanggal
            </label>
            <input
              type="date"
              value={filterStart}
              onChange={(e) => setFilterStart(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div className="md:col-span-4">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={filterEnd}
              onChange={(e) => setFilterEnd(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-100">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <h3 className="font-extrabold text-slate-800 text-base sm:text-lg flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-sm">
              📋
            </div>
            <span>Database: {filterService}</span>
          </h3>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleKirimWhatsApp}
              className="flex-1 sm:flex-none justify-center bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              📞 Kirim WA Batch
            </button>
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-none justify-center bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              📄 Ekspor Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm text-left text-slate-600 whitespace-nowrap">
            <thead className="text-[11px] sm:text-xs text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4 font-bold">No</th>
                <th className="px-5 py-4 font-bold">Tanggal</th>
                <th className="px-5 py-4 font-bold">Nama Pemohon</th>
                <th className="px-5 py-4 font-bold">{docLabelHeader}</th>
                <th className="px-5 py-4 font-bold">NIK</th>
                <th className="px-5 py-4 font-bold">Kelurahan</th>
                <th className="px-5 py-4 font-bold text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400 font-medium">
                    📂 Tidak ada data ditemukan pada kriteria filter ini.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-medium">{index + 1}</td>
                    <td className="px-5 py-4 font-mono text-xs">{item.tanggal}</td>
                    <td className="px-5 py-4 font-bold text-slate-800 uppercase">{item.nama}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-600">{item.noDokumen}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{item.nik}</td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-600 uppercase">{item.kelurahan}</td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 w-8 h-8 rounded-lg transition-all flex items-center justify-center cursor-pointer"
                          title="Perbarui"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item.rowNumber, item.nama)}
                          className="text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 w-8 h-8 rounded-lg transition-all flex items-center justify-center cursor-pointer"
                          title="Hapus"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Record Modal Dialog - absolute precision React state */}
      {editingRecord && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center backdrop-blur-sm px-4">
          <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-xl mx-auto overflow-hidden animate-scale-in">
            <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm">
                  ✏️
                </span> 
                Perbarui Data Pelayanan
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-rose-500 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tanggal</label>
                  <input
                    type="date"
                    value={editTanggal}
                    onChange={(e) => setEditTanggal(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nama Pemohon</label>
                  <input
                    type="text"
                    value={editNama}
                    onChange={(e) => setEditNama(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium focus:outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{docLabelHeader}</label>
                    <input
                      type="text"
                      value={editNoDokumen}
                      onChange={(e) => setEditNoDokumen(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">NIK Pemohon</label>
                    <input
                      type="text"
                      value={editNik}
                      onChange={(e) => setEditNik(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium focus:outline-none font-mono"
                      maxLength={16}
                      pattern="\d{16}"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kelurahan/Desa</label>
                  <select
                    value={editKelurahan}
                    onChange={(e) => setEditKelurahan(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium focus:outline-none"
                    required
                  >
                    {KELURAHAN_LIST.map((desa) => (
                      <option key={desa} value={desa}>
                        {desa.charAt(0) + desa.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingRecord(null)}
                    className="w-full sm:w-auto px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-md transition-all cursor-pointer"
                  >
                    💾 Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
