import React, { useState } from 'react';
import { BloomLevel, GeneratedExercise, MediumType } from '../types/optics';
import { generateProceduralExercise } from '../utils/proceduralGenerator';
import { Language, translations } from '../utils/translations';
import {
  Sparkles,
  Bot,
  FlaskConical,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  History,
  Send,
  Loader2,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface AiExerciseGeneratorProps {
  lang: Language;
  onLoadSimulationPreset: (n1: number, n2: number, i: number, m1?: MediumType, m2?: MediumType) => void;
}

export const AiExerciseGenerator: React.FC<AiExerciseGeneratorProps> = ({
  lang,
  onLoadSimulationPreset,
}) => {
  const t = translations[lang];

  const [level, setLevel] = useState<BloomLevel>('van_dung');
  const [topic, setTopic] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Exercise state
  const [currentExercise, setCurrentExercise] = useState<GeneratedExercise | null>(() =>
    generateProceduralExercise({ level: 'van_dung', lang })
  );
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [history, setHistory] = useState<GeneratedExercise[]>(() =>
    currentExercise ? [currentExercise] : []
  );

  const handleGenerate = async () => {
    setIsLoading(true);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);

    try {
      // Call backend API proxy
      const response = await fetch('/api/generate-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, topic, lang }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.exercise) {
          const newEx: GeneratedExercise = {
            ...data.exercise,
            id: `gemini-${Date.now()}`,
            createdAt: Date.now(),
          };
          setCurrentExercise(newEx);
          setHistory((prev) => [newEx, ...prev.slice(0, 9)]);
          setIsLoading(false);
          return;
        }
      }
      throw new Error('Fallback to procedural generator');
    } catch {
      // Offline / Key fallback
      const fallbackEx = generateProceduralExercise({ level, topic, lang });
      setCurrentExercise(fallbackEx);
      setHistory((prev) => [fallbackEx, ...prev.slice(0, 9)]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (ex: GeneratedExercise) => {
    const text = `[KHTN 9 - Khúc xạ ánh sáng]\nĐề bài: ${ex.question}\n\n` +
      ex.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n') +
      `\n\nĐáp án đúng: ${String.fromCharCode(65 + ex.correctAnswerIndex)}\nLời giải chi tiết:\n${ex.explanation}\n\nGhi nhớ: ${ex.keyTakeaway}`;

    navigator.clipboard.writeText(text);
    setCopiedId(ex.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getLevelLabel = (lvl: BloomLevel) => {
    switch (lvl) {
      case 'nhan_biet':
        return lang === 'vi' ? 'Nhận biết (Bloom 1)' : 'Recognition (Bloom 1)';
      case 'thong_hieu':
        return lang === 'vi' ? 'Thông hiểu (Bloom 2)' : 'Comprehension (Bloom 2)';
      case 'van_dung':
        return lang === 'vi' ? 'Vận dụng (Bloom 3)' : 'Application (Bloom 3)';
      case 'van_dung_cao':
        return lang === 'vi' ? 'Vận dụng cao (Bloom 4)' : 'Advanced (Bloom 4)';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30">
                <Bot className="w-5 h-5 text-cyan-400" />
              </span>
              <h2 className="text-lg md:text-xl font-bold text-slate-100 flex items-center gap-2">
                <span>{t.aiGen.title}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-slate-950">
                  Gemini Powered
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{t.aiGen.subtitle}</p>
          </div>

          <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 max-w-xs">
            {t.aiGen.offlineNote}
          </div>
        </div>
      </div>

      {/* Control Panel: Bloom Level & Topic Focus */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Level selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>{t.aiGen.levelLabel}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao'] as BloomLevel[]).map((lvl) => {
                const isSelected = level === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`p-2.5 rounded-xl text-xs font-semibold text-left transition border ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {getLevelLabel(lvl)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Topic Focus */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>{t.aiGen.topicLabel}</span>
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">{t.aiGen.topics.all}</option>
              <option value="angle_calc">{t.aiGen.topics.angle_calc}</option>
              <option value="refractive_index">{t.aiGen.topics.refractive_index}</option>
              <option value="tir_critical">{t.aiGen.topics.tir_critical}</option>
              <option value="real_life">{t.aiGen.topics.real_life}</option>
            </select>

            {/* Generate Action Button */}
            <div className="pt-2">
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.aiGen.generating}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t.aiGen.generateBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Exercise Card */}
      {currentExercise && (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          {/* Card Top Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {getLevelLabel(currentExercise.level)}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {currentExercise.topic}
              </span>
            </div>

            <button
              onClick={() => handleCopy(currentExercise)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              {copiedId === currentExercise.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{t.aiGen.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.aiGen.copyProblem}</span>
                </>
              )}
            </button>
          </div>

          {/* Problem Statement */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-cyan-400">{currentExercise.title}</h3>
            <p className="text-base md:text-lg font-medium text-slate-100 leading-relaxed whitespace-pre-line">
              {currentExercise.question}
            </p>
          </div>

          {/* Multiple Choice Options */}
          <div className="grid grid-cols-1 gap-3">
            {currentExercise.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrectOpt = idx === currentExercise.correctAnswerIndex;

              let style = 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700';

              if (isAnswerSubmitted) {
                if (isCorrectOpt) {
                  style = 'bg-emerald-500/15 border-emerald-500/60 text-emerald-200 font-semibold shadow-md shadow-emerald-500/10';
                } else if (isSelected) {
                  style = 'bg-rose-500/15 border-rose-500/60 text-rose-200';
                } else {
                  style = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
                }
              } else if (isSelected) {
                style = 'bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10';
              }

              return (
                <button
                  key={`ai-opt-${idx}`}
                  disabled={isAnswerSubmitted}
                  onClick={() => setSelectedAnswer(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition flex items-start gap-3.5 ${style}`}
                >
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    isAnswerSubmitted && isCorrectOpt
                      ? 'bg-emerald-500 text-slate-950'
                      : isAnswerSubmitted && isSelected
                      ? 'bg-rose-500 text-white'
                      : isSelected
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm leading-relaxed flex-1">{opt}</span>
                  {isAnswerSubmitted && isCorrectOpt && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrectOpt && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Test & Simulation Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {!isAnswerSubmitted ? (
              <button
                onClick={() => setIsAnswerSubmitted(true)}
                disabled={selectedAnswer === null}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center gap-2"
              >
                <span>Kiểm tra đáp án</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="text-xs font-semibold flex items-center gap-2">
                {selectedAnswer === currentExercise.correctAnswerIndex ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Chính xác tuyệt đối!
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Chưa chính xác!
                  </span>
                )}
              </div>
            )}

            {/* Load into Simulation */}
            {currentExercise.simulationParams && (
              <button
                onClick={() => {
                  const p = currentExercise.simulationParams;
                  onLoadSimulationPreset(p.n1, p.n2, p.incidentAngle);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition shadow-md"
              >
                <FlaskConical className="w-4 h-4 text-cyan-400" />
                <span>{t.aiGen.testInSim}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Detailed Solution (Visible after answer check or always available) */}
          {isAnswerSubmitted && (
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4 animate-fade-in">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                  {t.aiGen.detailedSolution}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-mono bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  {currentExercise.explanation}
                </p>
              </div>

              <div className="bg-gradient-to-r from-cyan-950/40 to-slate-950 p-3 rounded-xl border border-cyan-800/40 text-xs text-cyan-200 flex items-center gap-2">
                <span className="font-bold text-cyan-400">{t.aiGen.keyRule}</span>
                <span>{currentExercise.keyTakeaway}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History List */}
      {history.length > 1 && (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 border-b border-slate-800 pb-3">
            <History className="w-4 h-4 text-cyan-400" />
            <span>{t.aiGen.historyTitle}</span>
          </div>

          <div className="space-y-2">
            {history.slice(1).map((histEx) => (
              <div
                key={histEx.id}
                onClick={() => {
                  setCurrentExercise(histEx);
                  setSelectedAnswer(null);
                  setIsAnswerSubmitted(false);
                }}
                className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition flex items-center justify-between gap-3 text-xs"
              >
                <div className="truncate flex-1">
                  <span className="text-cyan-400 font-semibold mr-2">[{getLevelLabel(histEx.level)}]</span>
                  <span className="text-slate-300">{histEx.title}</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {new Date(histEx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
