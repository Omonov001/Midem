import Image from "next/image";
import Link from "next/link";

function Logo() {
  return (
    <div className="flex w-auto p-2 gap-2 items-center">
      <Link
        href={"/"}
        className="group outline-none flex w-auto p-2 gap-2 items-center"
      >
        <div className="relative">
          {/* Orqa fondagi yorug'lik effekti (faqat dark mode-da yengil nur beradi) */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-300"></div>

          <Image
            src={"/MI.jpg"}
            alt="MIDEM"
            width={50}
            height={50}
            className="relative rounded-full border-2 border-white dark:border-slate-900 object-cover shadow-md transition-transform duration-300 group-active:scale-90"
            priority // Logo bo'lgani uchun tezroq yuklanadi
          />
        </div>

        <div className="flex">
          <h1 className="group flex items-center gap-1 cursor-default select-none">
            {/* Logotip matni */}
            <span
              className="text-2xl font-black tracking-tighter
            /* Ranglar: Light rejimda to'q ko'k, Darkda yorqin havorang */
            bg-gradient-to-r from-blue-800 to-indigo-600 
    dark:from-blue-600 dark:to-indigo-700
    bg-clip-text text-transparent
    /* Effekt: Faqat kompyuterda sichqoncha borganda sekin o'zgaradi */
    transition-all duration-300 group-hover:opacity-80 cursor-pointer"
            >
              Midem
            </span>
          </h1>
        </div>
      </Link>
    </div>
  );
}

export default Logo;
