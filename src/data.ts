import { PelayananRecord, BerkasRecord, ServiceType } from "./types";

export const KELURAHAN_LIST = [
  "MAKARTI JAYA",
  "DELTA UPANG",
  "TIRTA KENCANA",
  "SUNGAI SEMUT",
  "PENDOWO HARJO",
  "TANJUNG MAS",
  "TANJUNG BARU",
  "PANGESTU",
  "UPANG MAKMUR",
  "PURWOSARI",
  "MUARA BARU",
  "UPANG MULYA"
];

export const SERVICE_LABELS: Record<ServiceType, string> = {
  "Penerbitan KK": "Penerbitan Kartu Keluarga",
  "SKP WNI": "Surat Keterangan Pindah (SKP WNI)",
  "Penerbitan Akta Kelahiran": "Penerbitan Akta Kelahiran",
  "Penerbitan Akta Kematian": "Penerbitan Akta Kematian",
  "Penerbitan Akta Perkawinan": "Penerbitan Akta Perkawinan",
  "Rekam KTP-EL": "Rekam KTP-EL",
  "Aktivasi IKD": "Aktivasi IKD (Identitas Kependudukan Digital)"
};

export const DRIVE_LINKS = {
  "KK": "https://drive.google.com/drive/folders/1L-L5Y2vgd3h_hqTaS7wQPQRa_xMd7_85?usp=drive_link",
  "AKL": "https://drive.google.com/drive/folders/1XmfVougf6J66X1ljBJkDY8PjoiWt6P9v?usp=drive_link",
  "AKM": "https://drive.google.com/drive/folders/1vd8-Jgl1tUxAKhPE1nnFVP0g_V8lAYEi?usp=drive_link",
  "SKPWNI": "https://drive.google.com/drive/folders/1T-d90Tg6XVtc94NTGYMAp-8Jo46JRt5Q?usp=drive_link",
  "AKW": "https://drive.google.com/drive/folders/1o3qCyDCpAVnWGVzfpujF3NHHNd1hse88?usp=drive_link",
  "ARSIP": "https://drive.google.com/my-drive",
  "IKD": "https://drive.google.com/drive/folders/1_xL-i0D93irkqL8BO9TNrEIv4s8qCF6WPzWzalUJWic?usp=drive_link"
};

// Helper generators for dynamic initialization of May 2026 registers that perfectly mirror the spreadsheet counts
function makeKKRecords(): PelayananRecord[] {
  const result: PelayananRecord[] = [];
  const distributions = [
    { date: "2026-05-04", count: 6 },
    { date: "2026-05-05", count: 15 },
    { date: "2026-05-11", count: 10 },
    { date: "2026-05-12", count: 5 },
    { date: "2026-05-13", count: 7 },
    { date: "2026-05-19", count: 12 },
    { date: "2026-05-21", count: 3 }
  ];

  const firstNames = ["PARMIN", "TASWINA", "SUWARNO", "AMINAH", "BUDI", "SITI", "KARTINI", "SLAMET", "SUPARDI", "WIRYO", "SUTANTO", "SUNARNI", "SUMARNO", "RATNA", "EKO", "WIWIK", "HERI", "ROBIAH", "NURUL", "SUGENG"];
  const lastNames = ["KUSUMA", "JAYA", "SAPUTRA", "PRATAMA", "SARI", "HIDAYAT", "ASTUTI", "LESTARI", "WULANDARI", "SUSILO", "STORY", "BAYU", "KRISNA", "NAWASELENA"];

  let idCounter = 1;
  distributions.forEach((dist) => {
    for (let i = 0; i < dist.count; i++) {
      const kelurahan = KELURAHAN_LIST[(idCounter * 4) % KELURAHAN_LIST.length];
      const firstName = firstNames[(idCounter * 7) % firstNames.length];
      const lastName = lastNames[(idCounter * i + 3) % lastNames.length];
      const name = `${firstName} ${lastName}`;
      const nik = "160709" + String(100000 + idCounter).padStart(6, "0") + "0001";
      const docNo = "160709" + String(500000 + idCounter).padStart(6, "0") + "0002";

      result.push({
        id: String(idCounter),
        tanggal: dist.date,
        nama: name,
        noDokumen: docNo,
        nik: nik,
        kelurahan: kelurahan,
        rowNumber: idCounter + 1
      });
      idCounter++;
    }
  });

  return result;
}

function makeSKPRecords(): PelayananRecord[] {
  const result: PelayananRecord[] = [];
  const distributions = [
    { date: "2026-05-08", count: 1 },
    { date: "2026-05-11", count: 3 },
    { date: "2026-05-19", count: 1 },
    { date: "2026-05-20", count: 2 }
  ];

  const firstNames = ["BUDI S", "HARIYANTO", "SURYANI", "TARSUM", "YUDHI", "DEWI", "SARI"];
  const lastNames = ["PRATOMO", "MALIKAH", "BAIHAQQI", "JAYA", "ASTUTI", "RAMADHAN"];

  let idCounter = 1;
  distributions.forEach((dist) => {
    for (let i = 0; i < dist.count; i++) {
      const kelurahan = KELURAHAN_LIST[(idCounter * 3) % KELURAHAN_LIST.length];
      const firstName = firstNames[(idCounter * 5) % firstNames.length];
      const lastName = lastNames[(idCounter * 2 + i) % lastNames.length];
      const name = `${firstName} ${lastName}`;
      const nik = "160709" + String(200000 + idCounter).padStart(6, "0") + "0003";
      const docNo = "SKP-2026-" + String(1000 + idCounter).padStart(4, "0");

      result.push({
        id: String(idCounter),
        tanggal: dist.date,
        nama: name,
        noDokumen: docNo,
        nik: nik,
        kelurahan: kelurahan,
        rowNumber: idCounter + 1
      });
      idCounter++;
    }
  });

  return result;
}

// Initial database seeding if localStorage is empty
export const INITIAL_MOCK_PELAYANAN: Record<ServiceType, PelayananRecord[]> = {
  "Penerbitan KK": makeKKRecords(),
  "SKP WNI": makeSKPRecords(),
  "Penerbitan Akta Kelahiran": [
    { id: "1", tanggal: "2026-05-05", nama: "MUHAMMAD BAIHAQQI", noDokumen: "1607-LU-05012026-0014", nik: "1607090312250001", kelurahan: "MAKARTI JAYA", rowNumber: 2 },
    { id: "2", tanggal: "2026-05-20", nama: "ALBY JAYA", noDokumen: "1607-LU-20052026-0022", nik: "1607090312259999", kelurahan: "MAKARTI JAYA", rowNumber: 3 }
  ],
  "Penerbitan Akta Kematian": [
    { id: "1", tanggal: "2026-05-11", nama: "TARSUM WARDANA", noDokumen: "1607-KM-07012026-0002", nik: "1607091212550001", kelurahan: "MAKARTI JAYA", rowNumber: 2 }
  ],
  "Penerbitan Akta Perkawinan": [],
  "Rekam KTP-EL": [
    { id: "1", tanggal: "2026-05-04", nama: "SITI MALIKAH", noDokumen: "REG-2026-KT01", nik: "1607096222222222", kelurahan: "PENDOWO HARJO", rowNumber: 2 },
    { id: "2", tanggal: "2026-05-12", nama: "BUDI PRATOMO", noDokumen: "REG-2026-KT02", nik: "1607092222222223", kelurahan: "PENDOWO HARJO", rowNumber: 3 }
  ],
  "Aktivasi IKD": [
    { id: "1", tanggal: "2026-05-05", nama: "HARIYANTO SUGIARTO", noDokumen: "IKD-1607090801260001", nik: "1607091204850021", kelurahan: "SUNGAI SEMUT", rowNumber: 2 },
    { id: "2", tanggal: "2026-05-20", nama: "SURYANI ASTUTI", noDokumen: "IKD-1607092005260002", nik: "1607094406910005", kelurahan: "TIRTA KENCANA", rowNumber: 3 }
  ]
};

export const INITIAL_MOCK_BERKAS: Record<string, BerkasRecord[]> = {
  "KK": [
    { id: "1", rowNumber: 1, tanggal: "2026-05-04", nama: "SUWARRE KUSUMA", noDokumen: "1607095000010002", nik: "1607091000010001", kelurahan: "PENDOWO HARJO", fileName: "Scan_KK_Suwarre.pdf", fileSize: "1.2 MB", fileUrl: "https://drive.google.com/file/d/1L-L5Y2vgd3h_hqTaS7wQPQRa_xMd7_85", category: "KK" }
  ],
  "AKL": [
    { id: "1", rowNumber: 1, tanggal: "2026-05-05", nama: "MUHAMMAD BAIHAQQI", noDokumen: "1607-LU-05012026-0014", nik: "1607090312250001", kelurahan: "MAKARTI JAYA", fileName: "Akta_Lahir_Baihaqqi.pdf", fileSize: "0.8 MB", fileUrl: "https://drive.google.com/file/d/1XmfVougf6J66X1ljBJkDY8PjoiWt6P9v", category: "AKL" }
  ],
  "AKM": [],
  "SKPWNI": [],
  "AKW": [],
  "ARSIP": [],
  "IKD": [
    { id: "1", rowNumber: 1, tanggal: "2026-05-20", nama: "SURYANI ASTUTI", noDokumen: "IKD-1607092005260002", nik: "1607094406910005", kelurahan: "TIRTA KENCANA", fileName: "Surat_Aktivasi_IKD_Suryani.pdf", fileSize: "0.9 MB", fileUrl: "https://drive.google.com/drive/folders/1_xL-i0D93irkqL8BO9TNrEIv4s8qCF6WPzWzalUJWic", category: "IKD" }
  ]
};

export const DOC_REQUIREMENTS = [
  {
    id: "KK",
    title: "A. Kartu Keluarga",
    color: "blue",
    requirements: [
      "KK lama yg asli",
      "Fc Buku Nikah",
      "Fc Surat Lahir",
      "Form F.01-01",
      "Fc KTP org tua (jika diperlukan petugas)"
    ],
    formLink: "https://drive.google.com/file/d/100XL-GAyt6VHc_0kpafqWd5EHRLPcazQ/view?usp=drive_link",
    formLabel: "Download Form F.01-01"
  },
  {
    id: "AKL",
    title: "B. Akta Kelahiran",
    color: "purple",
    requirements: [
      "Fc KK",
      "Srt Lahir Asli",
      "Fc Buku Nikah",
      "Formulir lahir diketahui kades/lurah",
      "Fc KTP org tua (jika diperlukan petugas)"
    ],
    formLink: "https://drive.google.com/file/d/10JS7pCryuVxrIj99qG7YG6GJd6Z09pCx/view?usp=drive_link",
    formLabel: "Download Formulir Lahir"
  },
  {
    id: "AKM",
    title: "C. Akta Kematian",
    color: "rose",
    requirements: [
      "Fc KK",
      "Form Kematian",
      "Srt Ket Kematian dr desa",
      "Srt Ket Pemakaman dr desa",
      "KTP asli yang meninggal",
      "Fc KTP yg melapor",
      "Foto Makam",
      "Srt Kematian dri RS / dokter (jika ada)"
    ],
    formLink: "https://drive.google.com/file/d/1sgTWQTJj_EHIGu8KFNCLzuZ-GxTPbp23/view?usp=drive_link",
    formLabel: "Download Formulir Kematian"
  },
  {
    id: "SKPWNI",
    title: "D. SKP WNI (Surat Keterangan Pindah)",
    color: "emerald",
    requirements: [
      "Fc KK",
      "KTP Asli yang pindah",
      "Formulir pindah F-1.08"
    ],
    formLink: "https://drive.google.com/file/d/1oAjPUPxdI4Dxo5PEStCuqfmKMuNE_jQE/view?usp=drive_link",
    formLabel: "Download Form F-1.08"
  },
  {
    id: "AKW",
    title: "E. Akta Perkawinan",
    color: "amber",
    requirements: [
      "Wajib berusia minimal 19 tahun untuk suami-istri",
      "Fc KK suami-istri",
      "Akta Lahir suami-istri",
      "KTP suami-istri",
      "Ijazah suami-istri",
      "Formulir perkawinan",
      "Pas photo latar merah 4x6 (2 lembar)",
      "Srt Ket Pernikahan dari Pemuka Agama",
      "Fc KTP saksi (2 org)",
      "Fc KTP Pemuka Agama yg mengesahkan"
    ],
    formLink: "https://drive.google.com/file/d/1ffdt1BHFpJyBomUl9KN3QvmorkXhfCkW/view?usp=drive_link",
    formLabel: "Download Formulir Perkawinan"
  },
  {
    id: "IKD",
    title: "F. Aktivasi IKD (Identitas Kependudukan Digital)",
    color: "cyan",
    requirements: [
      "Sudah melakukan perekaman KTP-EL atau memiliki KTP-EL fisik",
      "Memiliki Smartphone (Android minimal versi 5.1 atau iOS minimal versi 11.0)",
      "Koneksi Internet stabil untuk pengunduhan berkas",
      "Alamat Email aktif & Nomor HP aktif untuk pendaftaran",
      "Aktivasi langsung menggunakan verifikasi wajah (Face Recognition) di kantor UPTD / Kantor Dukcapil terdekat"
    ],
    formLink: "https://play.google.com/store/apps/details?id=id.go.depdagri.identitas_kependudukan_digital",
    formLabel: "Unduh Aplikasi IKD di Play Store"
  }
];
