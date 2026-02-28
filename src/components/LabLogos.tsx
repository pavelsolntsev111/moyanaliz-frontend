import Image from "next/image";

export default function LabLogos() {
  return (
    <div className="mt-10">
      <p className="text-center text-sm text-muted mb-5">
        Расшифровываем и поясняем анализы:
      </p>
      <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
        {/* INVITRO */}
        <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default">
          <svg width="140" height="36" viewBox="0 0 140 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text
              x="0"
              y="27"
              fontFamily="Arial, Helvetica, sans-serif"
              fontWeight="bold"
              fontSize="28"
              letterSpacing="1"
              fill="#00AEAE"
            >
              INVITRO
            </text>
          </svg>
        </div>

        {/* Гемотест */}
        <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default flex items-center gap-1.5">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Blood drop */}
            <path
              d="M14 2C14 2 6 13 6 18a8 8 0 0 0 16 0c0-5-8-16-8-16z"
              fill="#E31E24"
            />
            <path
              d="M14 4C14 4 8 12.5 8 17a6 6 0 0 0 12 0c0-4.5-6-13-6-13z"
              fill="#E31E24"
            />
            <ellipse cx="11" cy="18" rx="2" ry="2.5" fill="#fff" opacity="0.3" />
          </svg>
          <svg width="120" height="28" viewBox="0 0 120 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text
              x="0"
              y="22"
              fontFamily="Arial, Helvetica, sans-serif"
              fontWeight="bold"
              fontSize="22"
              fill="#E31E24"
            >
              Гемотест
            </text>
          </svg>
        </div>

        {/* KDL */}
        <div className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default">
          <Image
            src="/logos/kdl.jpeg"
            alt="KDL"
            width={100}
            height={36}
            className="object-contain h-9 w-auto"
          />
        </div>
      </div>
      <p className="text-center text-xs text-muted mt-4">
        а также любые другие лаборатории
      </p>
    </div>
  );
}
