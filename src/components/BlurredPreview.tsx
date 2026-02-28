export default function BlurredPreview() {
  return (
    <div className="relative rounded-xl border border-border overflow-hidden bg-white">
      <div className="blur-[8px] pointer-events-none select-none p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-danger" />
          <div className="text-sm">Гемоглобин (HGB): 118 г/л — Ниже нормы</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-success" />
          <div className="text-sm">Эритроциты (RBC): 4.5 ×10¹²/л — Норма</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <div className="text-sm">СОЭ: 22 мм/ч — Выше нормы</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-success" />
          <div className="text-sm">Лейкоциты (WBC): 6.2 ×10⁹/л — Норма</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-success" />
          <div className="text-sm">Тромбоциты (PLT): 245 ×10⁹/л — Норма</div>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-xl shadow-sm border border-border">
          <svg
            className="w-5 h-5 text-muted mx-auto mb-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
          <span className="text-xs font-medium text-muted">Оплатите для доступа</span>
        </div>
      </div>
    </div>
  );
}
