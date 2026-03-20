'use client';

import { useState, useEffect, useCallback, useRef, type MutableRefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';

interface Indicator {
  shortName: string;
  name: string;
  description: string;
  flash: 'green' | 'yellow' | 'red';
}

const FAKE_INDICATORS: Indicator[] = [
  { shortName: 'HGB', name: 'Гемоглобин', description: 'Белок в эритроцитах, переносящий кислород к тканям и органам', flash: 'green' },
  { shortName: 'RBC', name: 'Эритроциты', description: 'Красные кровяные клетки, доставляющие кислород по всему организму', flash: 'green' },
  { shortName: 'WBC', name: 'Лейкоциты', description: 'Клетки иммунной системы, защищающие организм от инфекций', flash: 'yellow' },
  { shortName: 'PLT', name: 'Тромбоциты', description: 'Клетки, отвечающие за свёртываемость крови и остановку кровотечений', flash: 'green' },
  { shortName: 'GLU', name: 'Глюкоза', description: 'Основной источник энергии для клеток организма', flash: 'red' },
  { shortName: 'CHOL', name: 'Холестерин общий', description: 'Липид, необходимый для построения клеточных мембран и синтеза гормонов', flash: 'green' },
  { shortName: 'ALT', name: 'АЛТ', description: 'Фермент, находящийся преимущественно в клетках печени', flash: 'yellow' },
  { shortName: 'AST', name: 'АСТ', description: 'Фермент, участвующий в обмене аминокислот в сердце и печени', flash: 'green' },
  { shortName: 'CREA', name: 'Креатинин', description: 'Продукт обмена мышечной ткани, выводимый почками', flash: 'green' },
  { shortName: 'UREA', name: 'Мочевина', description: 'Конечный продукт белкового обмена, отражает функцию почек', flash: 'green' },
  { shortName: 'Fe', name: 'Железо сывороточное', description: 'Микроэлемент, необходимый для образования гемоглобина', flash: 'red' },
  { shortName: 'ESR', name: 'СОЭ', description: 'Неспецифический маркер воспалительных процессов в организме', flash: 'yellow' },
  { shortName: 'TSH', name: 'ТТГ', description: 'Гормон гипофиза, регулирующий функцию щитовидной железы', flash: 'green' },
  { shortName: 'T4', name: 'Тироксин свободный', description: 'Основной гормон щитовидной железы, регулирующий обмен веществ', flash: 'green' },
  { shortName: 'BILI', name: 'Билирубин общий', description: 'Пигмент, образующийся при распаде гемоглобина', flash: 'green' },
  { shortName: 'TP', name: 'Общий белок', description: 'Суммарная концентрация альбуминов и глобулинов в крови', flash: 'green' },
  { shortName: 'K', name: 'Калий', description: 'Электролит, необходимый для работы сердца и мышц', flash: 'green' },
  { shortName: 'Na', name: 'Натрий', description: 'Электролит, регулирующий водно-солевой баланс организма', flash: 'yellow' },
];

const GLOW = {
  green:  { border: '#22c55e', glow: 'rgba(34,197,94,0.20)',  bg: 'rgba(34,197,94,0.03)' },
  yellow: { border: '#eab308', glow: 'rgba(234,179,8,0.20)',  bg: 'rgba(234,179,8,0.03)' },
  red:    { border: '#ef4444', glow: 'rgba(239,68,68,0.22)',   bg: 'rgba(239,68,68,0.03)' },
};

const PRIMARY = '#00b4bc';
const GREEN = '#22c55e';
const YELLOW = '#eab308';
const RED = '#ef4444';

interface PreviewData {
  meta?: {
    total_count?: number;
    out_of_range_count?: number;
  } | null;
  indicators?: Array<{
    status: string;
  }>;
}

interface AnalysisScannerProps {
  isReady: MutableRefObject<boolean>;
  onComplete: () => void;
  preview?: PreviewData | null;
}

export function AnalysisScanner({ isReady, onComplete, preview }: AnalysisScannerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flash, setFlash] = useState<'green' | 'yellow' | 'red' | null>(null);
  const [normalCount, setNormalCount] = useState(0);
  const [abnormalCount, setAbnormalCount] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [checked, setChecked] = useState(0);
  const [fakeProgress, setFakeProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fakeProgressRef = useRef<NodeJS.Timeout | null>(null);
  const readyCheckRef = useRef<NodeJS.Timeout | null>(null);
  const stepRef = useRef(0);
  const previewRef = useRef(preview);
  previewRef.current = preview;

  const indicators = useRef<Indicator[]>(FAKE_INDICATORS).current;

  const advance = useCallback(() => {
    stepRef.current += 1;
    const step = stepRef.current;
    const next = step % indicators.length;
    const ind = indicators[next];

    setCurrentIdx(next);
    setFlash(ind.flash);
    setChecked(Math.min(step + 1, indicators.length));

    setTimeout(() => setFlash(null), 700);
  }, [indicators]);

  useEffect(() => {
    // Init first indicator
    const first = indicators[0];
    setFlash(first.flash);
    setChecked(1);
    setTimeout(() => setFlash(null), 700);

    timerRef.current = setInterval(advance, 800);

    // Slow fake progress to ~85%
    fakeProgressRef.current = setInterval(() => {
      setFakeProgress(prev => {
        if (prev >= 85) return prev;
        return prev + 0.5 + Math.random() * 1.5;
      });
    }, 1000);

    // Check isReady
    readyCheckRef.current = setInterval(() => {
      if (isReady.current) {
        if (readyCheckRef.current) clearInterval(readyCheckRef.current);
        // Reveal real counts from preview
        const p = previewRef.current;
        if (p?.indicators?.length) {
          const realNormal = p.indicators.filter(i => i.status === "normal").length;
          const realAbnormal = p.indicators.length - realNormal;
          setNormalCount(realNormal);
          setAbnormalCount(realAbnormal);
        }
        setRevealed(true);
        // Jump to 100% and complete
        setFakeProgress(100);
        setTimeout(onComplete, 600);
      }
    }, 200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (fakeProgressRef.current) clearInterval(fakeProgressRef.current);
      if (readyCheckRef.current) clearInterval(readyCheckRef.current);
    };
  }, [advance, indicators, isReady, onComplete]);

  const ind = indicators[currentIdx];
  const glowStyle = flash ? GLOW[flash] : null;
  const progressPct = Math.min(Math.round(fakeProgress), 100);
  const borderColor = flash === 'green' ? GREEN : flash === 'yellow' ? YELLOW : flash === 'red' ? RED : 'var(--border)';
  const badgeLabel = flash === 'green' ? 'Норма' : flash === 'yellow' ? 'Внимание' : flash === 'red' ? 'Отклонение' : null;
  const badgeColor = flash === 'green' ? GREEN : flash === 'yellow' ? YELLOW : flash === 'red' ? RED : null;

  return (
    <div className="w-full max-w-2xl mx-auto select-none px-4">
      <div
        style={{
          background: 'var(--border)',
          borderRadius: 16,
          padding: '2px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.06), 0 20px 48px rgba(0,180,188,0.10), 0 0 0 1px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(145deg, var(--card) 0%, var(--background) 100%)',
            borderRadius: '14px',
            padding: '28px 28px 32px',
          }}
        >
          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity size={18} style={{ color: PRIMARY }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.01em' }}>
                Мой Анализ
              </span>
            </div>
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontWeight: 500, textAlign: 'right' }}>
              Среднее время:<br />5–15 секунд
            </span>
          </div>

          {/* Scan title row */}
          <div className="flex items-center gap-3 mb-5">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: PRIMARY,
                boxShadow: `0 4px 14px rgba(0,180,188,0.35)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <line x1="7" y1="12" x2="17" y2="12" />
                </svg>
              </motion.div>
            </div>
            <div>
              <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 15, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                Анализируем результаты
              </p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}>
                Проверяем каждый показатель
              </p>
            </div>
            <div className="ml-auto flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  style={{ width: 5, height: 5, borderRadius: '50%', background: PRIMARY }}
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </div>

          {/* Indicator drum */}
          <div className="mb-5 relative">
            <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted-foreground)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              Показатель
            </p>

            <AnimatePresence>
              {glowStyle && (
                <motion.div
                  key={`ambient-${checked}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    position: 'absolute',
                    inset: -8,
                    borderRadius: 16,
                    background: `radial-gradient(ellipse at center, ${glowStyle.glow} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                    zIndex: 0,
                  }}
                />
              )}
            </AnimatePresence>

            <div
              style={{
                position: 'relative',
                zIndex: 1,
                borderRadius: 8,
                border: `1px solid ${borderColor}`,
                background: glowStyle ? glowStyle.bg : 'var(--card)',
                boxShadow: glowStyle
                  ? `0 0 16px ${glowStyle.glow}`
                  : '0 2px 6px rgba(0,0,0,0.05)',
                transition: 'border-color 0.3s, box-shadow 0.3s, background 0.3s',
                minHeight: 100,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.10em',
                    color: PRIMARY,
                    fontFamily: 'monospace',
                    background: 'rgba(0,180,188,0.10)',
                    padding: '3px 8px',
                    borderRadius: 4,
                  }}
                >
                  {ind.shortName}
                </span>
                {/* Badge removed — just indicator cycling */}
              </div>

              <div style={{ overflow: 'hidden', flex: 1 }}>
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={currentIdx}
                    initial={{ y: 28, opacity: 0, filter: 'blur(6px)' }}
                    animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                    exit={{ y: -28, opacity: 0, filter: 'blur(6px)' }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--foreground)',
                      lineHeight: 1.3,
                      marginBottom: 4,
                    }}>
                      {ind.name}
                    </p>
                    <p style={{
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: 'var(--muted-foreground)',
                      fontWeight: 400,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {ind.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-1.5">
              <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Прогресс
              </span>
              <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                {progressPct}%
              </span>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: 'var(--muted)',
                overflow: 'hidden',
              }}
            >
              <motion.div
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  borderRadius: 3,
                  background: PRIMARY,
                  boxShadow: `0 0 10px rgba(0,180,188,0.40)`,
                }}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
