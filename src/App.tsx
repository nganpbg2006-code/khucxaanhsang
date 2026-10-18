/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MediumType, MediumInfo, LaserColor, LaserConfig } from './types/optics';
import { MEDIA_PRESETS, LASER_CONFIGS, calculateRefraction } from './utils/optics';
import { Language } from './utils/translations';
import { Header } from './components/Header';
import { SimulationCanvas } from './components/SimulationCanvas';
import { SimulationControls } from './components/SimulationControls';
import { InteractiveTheory } from './components/InteractiveTheory';
import { RealWorldPhenomenaModal } from './components/RealWorldPhenomenaModal';
import { ChallengeMode } from './components/ChallengeMode';
import { AiExerciseGenerator } from './components/AiExerciseGenerator';

export default function App() {
  // Navigation & Language
  const [activeTab, setActiveTab] = useState<'simulation' | 'challenges' | 'aiGenerator'>('simulation');
  const [lang, setLang] = useState<Language>('vi');
  const [isPhenomenaModalOpen, setIsPhenomenaModalOpen] = useState<boolean>(false);

  // Optics Simulation States
  const [medium1, setMedium1] = useState<MediumInfo>(MEDIA_PRESETS.air);
  const [medium2, setMedium2] = useState<MediumInfo>(MEDIA_PRESETS.water);
  const [customN1, setCustomN1] = useState<number>(1.0);
  const [customN2, setCustomN2] = useState<number>(1.333);
  const [incidentAngle, setIncidentAngle] = useState<number>(30); // Test 1 benchmark

  // Laser & Optics Bench Overlays
  const [laserActive, setLaserActive] = useState<boolean>(true);
  const [laserConfig, setLaserConfig] = useState<LaserConfig>(LASER_CONFIGS.red);
  const [beamMode, setBeamMode] = useState<'ray' | 'wave'>('ray');
  const [showProtractor, setShowProtractor] = useState<boolean>(false);
  const [showNormal, setShowNormal] = useState<boolean>(true);
  const [showAngles, setShowAngles] = useState<boolean>(true);
  const [showIntensityProbe, setShowIntensityProbe] = useState<boolean>(false);

  // Compute live physics
  const physics = calculateRefraction(medium1.n, medium2.n, incidentAngle);

  // Handlers for media changes
  const handleMedium1Change = (type: MediumType, customN?: number) => {
    if (type === 'custom') {
      const nVal = customN !== undefined ? customN : customN1;
      setCustomN1(nVal);
      setMedium1({
        ...MEDIA_PRESETS.custom,
        n: nVal,
      });
    } else {
      setMedium1(MEDIA_PRESETS[type]);
    }
  };

  const handleMedium2Change = (type: MediumType, customN?: number) => {
    if (type === 'custom') {
      const nVal = customN !== undefined ? customN : customN2;
      setCustomN2(nVal);
      setMedium2({
        ...MEDIA_PRESETS.custom,
        n: nVal,
      });
    } else {
      setMedium2(MEDIA_PRESETS[type]);
    }
  };

  // Swap media (Light reversibility)
  const handleSwapMedia = () => {
    const temp1 = { ...medium1 };
    const temp2 = { ...medium2 };
    setMedium1(temp2);
    setMedium2(temp1);
  };

  // Apply a scenario preset
  const handleApplyPreset = (
    n1: number,
    n2: number,
    i: number,
    m1?: MediumType,
    m2?: MediumType
  ) => {
    setActiveTab('simulation');
    setIncidentAngle(i);
    setLaserActive(true);

    if (m1 && MEDIA_PRESETS[m1]) {
      setMedium1(MEDIA_PRESETS[m1]);
    } else {
      setCustomN1(n1);
      setMedium1({
        ...MEDIA_PRESETS.custom,
        nameVi: `Môi trường 1 (n = ${n1.toFixed(2)})`,
        nameEn: `Medium 1 (n = ${n1.toFixed(2)})`,
        n: n1,
      });
    }

    if (m2 && MEDIA_PRESETS[m2]) {
      setMedium2(MEDIA_PRESETS[m2]);
    } else {
      setCustomN2(n2);
      setMedium2({
        ...MEDIA_PRESETS.custom,
        nameVi: `Môi trường 2 (n = ${n2.toFixed(2)})`,
        nameEn: `Medium 2 (n = ${n2.toFixed(2)})`,
        n: n2,
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        lang={lang}
        onLanguageToggle={() => setLang((l) => (l === 'vi' ? 'en' : 'vi'))}
        onOpenPhenomenaModal={() => setIsPhenomenaModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-8">
        {/* TAB 1: Simulation & Interactive Theory */}
        {activeTab === 'simulation' && (
          <div className="space-y-8 animate-fade-in">
            {/* Simulation Canvas (occupies major central focus) */}
            <div className="w-full">
              <SimulationCanvas
                physics={physics}
                medium1={medium1}
                medium2={medium2}
                laserConfig={laserConfig}
                laserActive={laserActive}
                beamMode={beamMode}
                showProtractor={showProtractor}
                showNormal={showNormal}
                showAngles={showAngles}
                showIntensityProbe={showIntensityProbe}
                lang={lang}
                onAngleChange={setIncidentAngle}
              />
            </div>

            {/* Controls Panel */}
            <SimulationControls
              medium1={medium1}
              medium2={medium2}
              customN1={customN1}
              customN2={customN2}
              incidentAngle={incidentAngle}
              laserActive={laserActive}
              laserConfig={laserConfig}
              beamMode={beamMode}
              showProtractor={showProtractor}
              showNormal={showNormal}
              showAngles={showAngles}
              showIntensityProbe={showIntensityProbe}
              physics={physics}
              lang={lang}
              onMedium1Change={handleMedium1Change}
              onMedium2Change={handleMedium2Change}
              onSwapMedia={handleSwapMedia}
              onAngleChange={setIncidentAngle}
              onLaserActiveChange={setLaserActive}
              onLaserColorChange={(c) => setLaserConfig(LASER_CONFIGS[c])}
              onBeamModeChange={setBeamMode}
              onToggleProtractor={() => setShowProtractor((p) => !p)}
              onToggleNormal={() => setShowNormal((n) => !n)}
              onToggleAngles={() => setShowAngles((a) => !a)}
              onToggleIntensityProbe={() => setShowIntensityProbe((i) => !i)}
              onApplyPreset={handleApplyPreset}
            />

            {/* Interactive Theory & Live Snell Formula Step-by-Step */}
            <InteractiveTheory
              physics={physics}
              medium1={medium1}
              medium2={medium2}
              lang={lang}
              onOpenPhenomenaModal={() => setIsPhenomenaModalOpen(true)}
            />
          </div>
        )}

        {/* TAB 2: Challenge Mode (Khu vực Thử thách KHTN 9) */}
        {activeTab === 'challenges' && (
          <ChallengeMode
            lang={lang}
            onLoadSimulationPreset={handleApplyPreset}
          />
        )}

        {/* TAB 3: AI Exercise Generator (Tạo bài tập AI) */}
        {activeTab === 'aiGenerator' && (
          <AiExerciseGenerator
            lang={lang}
            onLoadSimulationPreset={handleApplyPreset}
          />
        )}
      </main>

      {/* Real-World Optical Phenomena Modal */}
      <RealWorldPhenomenaModal
        isOpen={isPhenomenaModalOpen}
        onClose={() => setIsPhenomenaModalOpen(false)}
        lang={lang}
        onApplyPreset={handleApplyPreset}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500 space-y-1">
        <p>
          {lang === 'vi'
            ? 'Mô phỏng Thí nghiệm & Học tập Khúc xạ ánh sáng • Khoa học Tự nhiên 9 (Bài 5)'
            : 'Interactive Refraction Simulation & Smart Learning • Natural Sciences Grade 9'}
        </p>
        <p className="text-slate-600">
          {lang === 'vi'
            ? 'Chuẩn chương trình Giáo dục phổ thông 2018 • Tích hợp Định luật Snell, Góc tới hạn & AI Phân hóa'
            : 'Vietnamese General Education Curriculum 2018 • Snell\'s Law, Critical Angle & AI Differentiation'}
        </p>
      </footer>
    </div>
  );
}
