import { DOC_REQUIREMENTS } from "../data";

export default function Persyaratan() {
  // Configured colors for cards
  const themeClasses: Record<string, { bg: string; text: string; iconBg: string; border: string; btn: string }> = {
    blue: {
      bg: "bg-blue-50/40",
      text: "text-blue-800",
      iconBg: "bg-blue-100",
      border: "border-blue-100",
      btn: "bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600"
    },
    purple: {
      bg: "bg-purple-50/40",
      text: "text-purple-800",
      iconBg: "bg-purple-100",
      border: "border-purple-100",
      btn: "bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-600"
    },
    rose: {
      bg: "bg-rose-50/40",
      text: "text-rose-800",
      iconBg: "bg-rose-100",
      border: "border-rose-100",
      btn: "bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600"
    },
    emerald: {
      bg: "bg-emerald-50/40",
      text: "text-emerald-800",
      iconBg: "bg-emerald-100",
      border: "border-emerald-100",
      btn: "bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600"
    },
    amber: {
      bg: "bg-amber-50/40",
      text: "text-amber-800",
      iconBg: "bg-amber-100",
      border: "border-amber-100",
      btn: "bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-600"
    },
    cyan: {
      bg: "bg-cyan-50/40",
      text: "text-cyan-800",
      iconBg: "bg-cyan-100",
      border: "border-cyan-100",
      btn: "bg-cyan-50 hover:bg-cyan-600 hover:text-white text-cyan-600"
    }
  };

  const getTheme = (color: string) => themeClasses[color] || themeClasses.blue;

  return (
    <div id="sec-persyaratan" className="animate-fade-in relative z-10">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-sans">
          Persyaratan Dokumen & Formulir
        </h2>
        <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base">
          Informasi kelengkapan berkas resmi dan tautan pengunduhan formulir pendaftaran UPTD Dukcapil.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        {DOC_REQUIREMENTS.map((doc, index) => {
          const style = getTheme(doc.color);
          return (
            <div
              key={doc.id}
              className={`bg-white rounded-[1.5rem] p-5 sm:p-6 shadow-sm border ${style.border} flex flex-col justify-between hover:shadow-md hover:scale-[1.01] transition-all duration-300`}
            >
              <div>
                <div className="flex items-center gap-4 mb-4 pb-3 border-b border-dashed border-slate-200">
                  <div className={`w-12 h-12 rounded-xl ${style.iconBg} flex items-center justify-center text-xl shadow-sm shrink-0`}>
                    {doc.id === "KK" ? "👥" : doc.id === "AKL" ? "👶" : doc.id === "AKM" ? "💀" : doc.id === "SKPWNI" ? "✈️" : doc.id === "AKW" ? "💍" : "📱"}
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-800">{doc.title}</h3>
                </div>

                <ul className="list-decimal pl-5 text-sm space-y-2.5 mb-6 text-slate-600 font-medium">
                  {doc.requirements.map((req, i) => (
                    <li key={i} className="leading-relaxed">
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={doc.formLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center py-3.5 rounded-xl border border-transparent font-bold text-sm shadow-sm transition-all duration-300 ${style.btn} cursor-pointer`}
              >
                📥 {doc.formLabel}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
