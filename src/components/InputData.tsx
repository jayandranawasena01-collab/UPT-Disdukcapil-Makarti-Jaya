import React, { useState, useMemo } from "react";
import { ServiceType, PelayananRecord } from "../types";
import { KELURAHAN_LIST, SERVICE_LABELS } from "../data";

interface InputDataProps {
  onSave: (service: ServiceType, record: { tanggal: string; nama: string; noDokumen: string; nik: string; kelurahan: string }) => void;
  pelayananDB: Record<ServiceType, PelayananRecord[]>;
}

export default function InputData({ onSave, pelayananDB }: InputDataProps) {
  const [service, setService] = useState<ServiceType | "">("");
  const [tanggal, setTanggal] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [nama, setNama] = useState("");
  const [noDokumen, setNoDokumen] = useState("");
  const [nik, setNik] = useState("");
  const [kelurahan, setKelurahan] = useState("");

  // Label configuration based on the chosen service type
  const docLabel = useMemo(() => {
    if (!service) return "No Dokumen / Referensi";
    if (service === "Penerbitan KK") return "Nomor Kartu Keluarga (KK)";
    if (service === "SKP WNI") return "Nomor SKPWNI / Referensi";
    if (service === "Penerbitan Akta Kelahiran") return "Nomor Akta Kelahiran";
    if (service === "Penerbitan Akta Kematian") return "Nomor Akta Kematian";
    if (service === "Penerbitan Akta Perkawinan") return "Nomor Akta Perkawinan";
    if (service === "Rekam KTP-EL") return "Nomor Resi / Referensi Perekaman";
    if (service === "Aktivasi IKD") return "Nomor HP / Kode Aktivasi";
    return "No Dokumen";
  }, [service]);

  const docPlaceholder = useMemo(() => {
    if (service === "Aktivasi IKD") return "Contoh: 0812XXX atau Kode Aktivasi";
    return "Ketik nomor dokumen pendukung";
  }, [service]);

  // Handle saving
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) {
      alert("Silahkan pilih jenis pelayanan terlebih dahulu.");
      return;
    }
    if (nik.length !== 16) {
      alert("Format NIK harus tepat 16 digit angka.");
      return;
    }

    onSave(service as ServiceType, {
      tanggal,
      nama: nama.toUpperCase(),
      noDokumen,
      nik,
      kelurahan: kelurahan.toUpperCase()
    });

    // Reset inputs but keep date and service for faster entry loop
    setNama("");
    setNoDokumen("");
    setNik("");
    setKelurahan("");
  };

  // Compile history of today's inputs
  const currentHistory = useMemo(() => {
    const combined: (PelayananRecord & { serviceName: string })[] = [];
    (Object.keys(pelayananDB) as ServiceType[]).forEach((key) => {
      const list = pelayananDB[key] || [];
      list.forEach((item) => {
        if (item.tanggal === tanggal) {
          combined.push({
            ...item,
            serviceName: key
          });
        }
      });
    });

    // Sort by largest rowNumber / newest
    return combined.sort((a, b) => b.rowNumber - a.rowNumber);
  }, [pelayananDB, tanggal]);

  return (
    <div id="sec-input" className="animate-fade-in relative z-10">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
          Registrasi Pelayanan Baru
        </h2>
        <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">
          Catat pemohon baru langsung ke dalam database pelayanan UPTD Dukcapil.
        </p>
      </div>

      {/* Main input card */}
      <div className="bg-white rounded-[1.5rem] p-6 sm:p-8 shadow-sm border border-slate-100 max-w-4xl relative overflow-hidden mb-6 sm:mb-8">
        {/* Aksen baris gradien atas */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-amber-500"></div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Pilih Jenis Pelayanan
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value as ServiceType)}
                className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:outline-none"
                required
              >
                <option value="" disabled>-- Pilih Layanan --</option>
                {Object.entries(SERVICE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Tanggal Input/Proses
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Nama Lengkap Pemohon
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm font-medium focus:outline-none text-slate-800"
                placeholder="Sesuaikan dengan KTP/KK"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                {docLabel}
              </label>
              <input
                type="text"
                value={noDokumen}
                onChange={(e) => setNoDokumen(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm font-medium focus:outline-none text-slate-800"
                placeholder={docPlaceholder}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                NIK Pemohon (16 Digit)
              </label>
              <input
                type="text"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm font-medium focus:outline-none text-slate-800 font-mono"
                placeholder="Masukkan 16 digit NIK"
                maxLength={16}
                pattern="\d{16}"
                title="Format NIK wajib berupa 16 digit angka."
                required
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Kelurahan / Desa Domisili
              </label>
              <select
                value={kelurahan}
                onChange={(e) => setKelurahan(e.target.value)}
                className="w-full pl-4 pr-10 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all shadow-sm focus:outline-none"
                required
              >
                <option value="" disabled>-- Pilih Kelurahan/Desa --</option>
                {KELURAHAN_LIST.map((desa) => (
                  <option key={desa} value={desa}>
                    {desa.charAt(0) + desa.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setNama("");
                setNoDokumen("");
                setNik("");
                setKelurahan("");
              }}
              className="px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Reset Form
            </button>
            <button
              type="submit"
              className="px-8 py-3 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              💾 Simpan Registrasi
            </button>
          </div>
        </form>
      </div>

      {/* Daily Input History list block */}
      <div className="bg-white rounded-[1.5rem] p-5 sm:p-6 max-w-4xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-800 text-base sm:text-lg flex items-center gap-2">
            🕒 Riwayat Registrasi Terkini
          </h3>
          <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-blue-100">
            {tanggal}
          </span>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm text-left text-slate-600 whitespace-nowrap">
            <thead className="text-[10px] sm:text-[11px] text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold w-12 text-center">No</th>
                <th className="px-4 py-3 font-bold">Nama Pemohon</th>
                <th className="px-4 py-3 font-bold">NIK</th>
                <th className="px-4 py-3 font-bold">No Referensi/Telp</th>
                <th className="px-4 py-3 font-bold text-right">Layanan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400 font-medium">
                    Belum ada data diinput pada tanggal pilihan ini.
                  </td>
                </tr>
              ) : (
                currentHistory.map((item, index) => (
                  <tr key={item.id + index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-center">{index + 1}</td>
                    <td className="px-4 py-3 font-bold text-slate-800 uppercase">{item.nama}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{item.nik}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{item.noDokumen}</td>
                    <td className="px-4 py-3 text-right text-xs font-semibold text-blue-600">
                      {SERVICE_LABELS[item.serviceName as ServiceType] || item.serviceName}
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
