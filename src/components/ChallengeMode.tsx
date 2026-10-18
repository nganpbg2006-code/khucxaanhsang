import React, { useState } from 'react';
import { ChallengeQuestion, BloomLevel, MediumType } from '../types/optics';
import { CHALLENGE_QUESTIONS } from '../data/challenges';
import { Language, translations } from '../utils/translations';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  FlaskConical,
  Flame,
  Award,
  Filter,
  RefreshCw,
} from 'lucide-react';

interface ChallengeModeProps {
  lang: Language;
  onLoadSimulationPreset: (n1: number, n2: number, i: number, m1: MediumType, m2: MediumType) => void;
}

export const ChallengeMode: React.FC<ChallengeModeProps> = ({
  lang,
  onLoadSimulationPreset,
}) => {
  const t = translations[lang];

  const [activeFilter, setActiveFilter] = useState<'all' | BloomLevel>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});

  // Filter questions
  const filteredQuestions = CHALLENGE_QUESTIONS.filter(
    (q) => activeFilter === 'all' || q.level === activeFilter
  );

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0];
  const qId = currentQ?.id;
  const isSubmitted = !!submittedQuestions[qId];
  const selectedOpt = selectedAnswers[qId];
  const isCorrect = isSubmitted && selectedOpt === currentQ?.correctIndex;

  // Statistics calculation
  const totalCompleted = Object.keys(submittedQuestions).length;
  let correctCount = 0;
  Object.keys(submittedQuestions).forEach((id) => {
    const q = CHALLENGE_QUESTIONS.find((item) => item.id === id);
    if (q && selectedAnswers[id] === q.correctIndex) {
      correctCount++;
    }
  });

  const accuracy = totalCompleted > 0 ? Math.round((correctCount / totalCompleted) * 100) : 0;

  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: idx }));
  };

  const handleSubmit = () => {
    if (selectedOpt === undefined) return;
    setSubmittedQuestions((prev) => ({ ...prev, [qId]: true }));
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleResetChallenge = () => {
    if (confirm(lang === 'vi' ? 'Bạn có muốn làm lại từ đầu?' : 'Reset all progress?')) {
      setSelectedAnswers({});
      setSubmittedQuestions({});
      setCurrentIndex(0);
    }
  };

  const getLevelBadge = (level: BloomLevel) => {
    switch (level) {
      case 'nhan_biet':
        return {
          label: lang === 'vi' ? 'Nhận biết' : 'Recognition',
          className: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
        };
      case 'thong_hieu':
        return {
          label: lang === 'vi' ? 'Thông hiểu' : 'Comprehension',
          className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        };
      case 'van_dung':
        return {
          label: lang === 'vi' ? 'Vận dụng' : 'Application',
          className: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        };
      case 'van_dung_cao':
        return {
          label: lang === 'vi' ? 'Vận dụng cao' : 'Advanced',
          className: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header & Stats Banner */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Trophy className="w-5 h-5" />
              </span>
              <h2 className="text-lg md:text-xl font-bold text-slate-100">{t.challenges.title}</h2>
            </div>
            <p className="text-xs text-slate-400">{t.challenges.subtitle}</p>
          </div>

          <button
            onClick={handleResetChallenge}
            className="flex items-center gap-1.5 self-start md:self-auto px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{lang === 'vi' ? 'Làm lại toàn bộ' : 'Reset All'}</span>
          </button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">{t.challenges.statsQuestions}</div>
              <div className="text-base font-bold font-mono text-slate-100">
                {totalCompleted}/{CHALLENGE_QUESTIONS.length}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">{t.challenges.statsCorrect}</div>
              <div className="text-base font-bold font-mono text-emerald-400">
                {correctCount}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">{t.challenges.statsAccuracy}</div>
              <div className="text-base font-bold font-mono text-purple-400">
                {accuracy}%
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">{lang === 'vi' ? 'Tiến độ hoàn thành' : 'Progress'}</div>
              <div className="text-base font-bold font-mono text-amber-400">
                {Math.round((totalCompleted / CHALLENGE_QUESTIONS.length) * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        <button
          onClick={() => {
            setActiveFilter('all');
            setCurrentIndex(0);
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
            activeFilter === 'all'
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          {t.challenges.filterAll} ({CHALLENGE_QUESTIONS.length})
        </button>

        {(['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao'] as BloomLevel[]).map((lvl) => {
          const badge = getLevelBadge(lvl);
          const count = CHALLENGE_QUESTIONS.filter((q) => q.level === lvl).length;
          const isActive = activeFilter === lvl;
          return (
            <button
              key={lvl}
              onClick={() => {
                setActiveFilter(lvl);
                setCurrentIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {badge.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Question Card */}
      {currentQ ? (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          {/* Question Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getLevelBadge(currentQ.level).className}`}>
                {getLevelBadge(currentQ.level).label}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {currentQ.topic}
              </span>
            </div>

            <div className="text-xs font-mono font-bold text-slate-400">
              {t.challenges.questionNumber} {currentIndex + 1} {t.challenges.of} {filteredQuestions.length}
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-cyan-400">
              {lang === 'vi' ? currentQ.titleVi : currentQ.titleEn}
            </h3>
            <p className="text-base md:text-lg font-medium text-slate-100 leading-relaxed">
              {lang === 'vi' ? currentQ.questionVi : currentQ.questionEn}
            </p>
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-1 gap-3">
            {(lang === 'vi' ? currentQ.optionsVi : currentQ.optionsEn).map((optionText, idx) => {
              const isSelected = selectedOpt === idx;
              const isOptionCorrect = idx === currentQ.correctIndex;

              let cardStyle = 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950';

              if (isSubmitted) {
                if (isOptionCorrect) {
                  cardStyle = 'bg-emerald-500/15 border-emerald-500/60 text-emerald-200 font-semibold shadow-md shadow-emerald-500/10';
                } else if (isSelected) {
                  cardStyle = 'bg-rose-500/15 border-rose-500/60 text-rose-200';
                } else {
                  cardStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
                }
              } else if (isSelected) {
                cardStyle = 'bg-cyan-500/15 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10';
              }

              return (
                <button
                  key={`opt-${idx}`}
                  disabled={isSubmitted}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition flex items-start gap-3.5 ${cardStyle}`}
                >
                  <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    isSubmitted && isOptionCorrect
                      ? 'bg-emerald-500 text-slate-950'
                      : isSubmitted && isSelected
                      ? 'bg-rose-500 text-white'
                      : isSelected
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm leading-relaxed flex-1">{optionText}</span>
                  {isSubmitted && isOptionCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {isSubmitted && isSelected && !isOptionCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition"
                title={t.challenges.prevQuestion}
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === filteredQuestions.length - 1}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition"
                title={t.challenges.nextQuestion}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={selectedOpt === undefined}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center gap-2"
              >
                <span>{t.challenges.checkAnswer}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {currentQ.simulationPreset && (
                  <button
                    onClick={() => {
                      const p = currentQ.simulationPreset!;
                      onLoadSimulationPreset(p.n1, p.n2, p.incidentAngle, p.medium1, p.medium2);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition shadow-md"
                  >
                    <FlaskConical className="w-4 h-4 text-cyan-400" />
                    <span>{t.challenges.loadIntoLab}</span>
                  </button>
                )}

                <button
                  onClick={handleNext}
                  disabled={currentIndex === filteredQuestions.length - 1}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
                >
                  <span>{t.challenges.nextQuestion}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Explanation Box when Submitted */}
          {isSubmitted && (
            <div className={`p-5 rounded-2xl border space-y-3 animate-fade-in ${
              isCorrect
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
            }`}>
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-sm text-emerald-300">{t.challenges.correctToast}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span className="font-bold text-sm text-rose-300">{t.challenges.wrongToast}</span>
                  </>
                )}
              </div>

              <div className="pt-1 text-xs text-slate-300 leading-relaxed space-y-2">
                <div className="font-bold text-slate-200">{t.challenges.showExplanation}:</div>
                <p>{lang === 'vi' ? currentQ.explanationVi : currentQ.explanationEn}</p>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
