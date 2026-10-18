/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MediumType, MediumInfo, LaserColor, LaserConfig } from './types/optics';
import { MEDIA_PRESETS, LASER_CONFIGS, calculateRefraction360 } from './utils/optics';
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
  const [n1Value, setN1Value] = useState<number>(1.000);
  const [n2Value, setN2Value] = useState<number>(1.333);

  // Laser 360-degree rotation angle (330° = top-left quadrant, incident angle i = 30°)
  const [laserAngle, setLaserAngle] = useState<number>(330);

  // Laser & Optics Bench Overlays
  const [laserActive, setLaserActive] = useState<boolean>(true);
  const [laserConfig, setLaserConfig] = useState<LaserConfig>(LASER_CONFIGS.red);
  const [beamMode, setBeamMode] = useState<'ray' | 'wave'>('ray');
  const [showProtractor, setShowProtractor] = useState<boolean>(false);
  const [showNormal, setShowNormal] = useState<boolean>(true);
  const [showAngles, setShowAngles] = useState<boolean>(true);
  const [showIntensityProbe, setShowIntensityProbe] = useState<boolean>(false);

  // Compute live physics with 360-degree optics engine
  const physics = calculateRefraction360(n1Value, n2Value, laserAngle);

  // Handlers for preset dropdown changes
  const handleMedium1PresetChange = (type: MediumType) => {
    const selected = MEDIA_PRESETS[type];
    setMedium1(selected);
    setN1Value(selected.n);
  };

  const handleMedium2PresetChange = (type: MediumType) => {
    const selected = MEDIA_PRESETS[type];
    setMedium2(selected);
    setN2Value(selected.n);
  };

  // Direct numerical input handlers
  const handleN1Change = (newN: number) => {
    const rounded = Number(newN.toFixed(3));
    setN1Value(rounded);

    // Check if matches any preset
    const matched = Object.values(MEDIA_PRESETS).find(
      (m) => m.id !== 'custom' && Math.abs(m.n - rounded) < 0.005
    );
    if (matched) {
      setMedium1(matched);
    } else {
      setMedium1({
        ...MEDIA_PRESETS.custom,
        nameVi: `Tùy chỉnh (n₁ = ${rounded.toFixed(2)})`,
        nameEn: `Custom (n₁ = ${rounded.toFixed(2)})`,
        n: rounded,
      });
    }
  };

  const handleN2Change = (newN: number) => {
    const rounded = Number(newN.toFixed(3));
    setN2Value(rounded);

    const matched = Object.values(MEDIA_PRESETS).find(
      (m) => m.id !== 'custom' && Math.abs(m.n - rounded) < 0.005
    );
    if (matched) {
      setMedium2(matched);
    } else {
      setMedium2({
        ...MEDIA_PRESETS.custom,
        nameVi: `Tùy chỉnh (n₂ = ${rounded.toFixed(2)})`,
        nameEn: `Custom (n₂ = ${rounded.toFixed(2)})`,
        n: rounded,
      });
    }
  };

  // Swap media (Reverse optical path)
  const handleSwapMedia = () => {
    const tempM1 = { ...medium1 };
    const tempM2 = { ...medium2 };
    const tempN1 = n1Value;
    const tempN2 = n2Value;

    setMedium1(tempM2);
    setMedium2(tempM1);
    setN1Value(tempN2);
    setN2Value(tempN1);
  };

  // Apply scenario preset from challenges or presets bar
  const handleApplyPreset = (
    n1: number,
    n2: number,
    angleOrI: number,
    m1?: MediumType,
    m2?: MediumType
  ) => {
    setActiveTab('simulation');
    setLaserActive(true);

    // If angle is <= 90, interpret as top-left incident angle i (360 - i)
    let rot = angleOrI;
    if (angleOrI <= 89.5) {
      rot = 360 - angleOrI;
    }
    setLaserAngle(rot);

    setN1Value(n1);
    setN2Value(n2);

    if (m1 && MEDIA_PRESETS[m1]) {
      setMedium1(MEDIA_PRESETS[m1]);
    } else {
      handleN1Change(n1);
    }

    if (m2 && MEDIA_PRESETS[m2]) {
      setMedium2(MEDIA_PRESETS[m2]);
    } else {
      handleN2Change(n2);
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
                onLaserAngleChange={setLaserAngle}
              />
            </div>

            {/* Controls Panel with Direct n Inputs & 360° Rotation */}
            <SimulationControls
              medium1={medium1}
              medium2={medium2}
              n1Value={n1Value}
              n2Value={n2Value}
              laserAngle={laserAngle}
              laserActive={laserActive}
              laserConfig={laserConfig}
              beamMode={beamMode}
              showProtractor={showProtractor}
              showNormal={showNormal}
              showAngles={showAngles}
              showIntensityProbe={showIntensityProbe}
              physics={physics}
              lang={lang}
              onMedium1PresetChange={handleMedium1PresetChange}
              onMedium2PresetChange={handleMedium2PresetChange}
              onN1Change={handleN1Change}
              onN2Change={handleN2Change}
              onSwapMedia={handleSwapMedia}
              onLaserAngleChange={setLaserAngle}
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
            ? 'Chuẩn chương trình Giáo dục phổ thông 2018 • Tích hợp Xoay 360°, Nhập Chiết suất Tự do & AI Phân hóa'
            : 'Vietnamese General Education Curriculum 2018 • 360° Rotation, Custom Refractive Index & AI Differentiation'}
        </p>
      </footer>
    </div>
  );
}
