"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  STATIONS,
  STATION_LANES,
  WorkflowStep,
  UIWireframeItem
} from "@/lib/workflow-explorer/workflow-data";
import { Maximize2, Minimize2, Eye, Sparkles, X } from "lucide-react";

interface IsometricCanvasProps {
  currentStep: WorkflowStep;
  viewMode: "flow" | "scene" | "sequence";
  onSelectStep?: (stepId: number) => void;
}

export default function IsometricCanvas({
  currentStep,
  viewMode,
  onSelectStep
}: IsometricCanvasProps) {
  const [selectedWireframeIdx, setSelectedWireframeIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeWireframe, setActiveWireframe] = useState<UIWireframeItem | null>(null);

  // Reset selected wireframe tab when step changes
  useEffect(() => {
    setSelectedWireframeIdx(0);
  }, [currentStep.id]);

  // Active Station Nodes
  const fromStation = STATIONS[currentStep.fromNode];
  const toStation = STATIONS[currentStep.toNode];

  // Token position calculation
  const tokenX = (fromStation.x + toStation.x) / 2;
  const tokenY = (fromStation.y + toStation.y) / 2;

  return (
    <div className="pe-sim-container w-full h-full relative flex flex-col">
      {/* =========================================================================
          VIEW 1: FLOW MAP (Isometric Hospital Blueprint with Animated Tokens)
          ========================================================================= */}
      {viewMode === "flow" && (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <svg
            viewBox="0 0 960 520"
            className="w-full h-full select-none"
            style={{ maxHeight: "100%" }}
          >
            <defs>
              {/* Arrowhead marker */}
              <marker
                id="lane-arrow"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--line)" />
              </marker>

              <marker
                id="lane-arrow-active"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="var(--active)" />
              </marker>

              {/* Linear Gradients for Isometric Station Faces */}
              <linearGradient id="iso-top" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f4f8ff" />
                <stop offset="100%" stopColor="#e2ebfc" />
              </linearGradient>

              <linearGradient id="iso-top-active" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e0edff" />
                <stop offset="100%" stopColor="#c7dcfb" />
              </linearGradient>
            </defs>

            {/* Background Grid Accent Lines */}
            <g stroke="#e5edfa" strokeWidth="0.8" opacity="0.6">
              <line x1="80" y1="120" x2="880" y2="120" strokeDasharray="4 4" />
              <line x1="80" y1="240" x2="880" y2="240" strokeDasharray="4 4" />
              <line x1="80" y1="360" x2="880" y2="360" strokeDasharray="4 4" />
              <line x1="80" y1="480" x2="880" y2="480" strokeDasharray="4 4" />
            </g>

            {/* Connection Lanes (เส้นทางประเชื่อมระหว่างสถานี) */}
            <g className="lanes">
              {STATION_LANES.map((lane) => {
                const isActive = lane.id === currentStep.laneId;
                return (
                  <g key={lane.id}>
                    {/* Shadow / background line */}
                    <path
                      d={lane.d}
                      fill="none"
                      stroke="#d0def8"
                      strokeWidth={isActive ? "4" : "2"}
                      opacity="0.5"
                    />
                    {/* Animated or dashed foreground line */}
                    <path
                      d={lane.d}
                      fill="none"
                      stroke={isActive ? "var(--active)" : "var(--line)"}
                      strokeWidth={isActive ? "2.5" : "1.5"}
                      strokeDasharray={isActive ? "6 4" : "4 4"}
                      markerEnd={isActive ? "url(#lane-arrow-active)" : "url(#lane-arrow)"}
                      style={{
                        animation: isActive ? "laneDash 1.2s linear infinite" : "none"
                      }}
                    />
                  </g>
                );
              })}
            </g>

            {/* Station Nodes (ผัง 5 สถานีบริการในโรงพยาบาล) */}
            {Object.values(STATIONS).map((st) => {
              const isFrom = st.id === currentStep.fromNode;
              const isTo = st.id === currentStep.toNode;
              const isCurrent = isFrom || isTo;

              // Isometric Box coordinates centered at (st.x, st.y)
              const w = 48;
              const h = 26;
              const topFace = `
                ${st.x},${st.y - h}
                ${st.x + w},${st.y - h / 2}
                ${st.x},${st.y}
                ${st.x - w},${st.y - h / 2}
              `;
              const leftFace = `
                ${st.x - w},${st.y - h / 2}
                ${st.x},${st.y}
                ${st.x},${st.y + 24}
                ${st.x - w},${st.y + 24 - h / 2}
              `;
              const rightFace = `
                ${st.x},${st.y}
                ${st.x + w},${st.y - h / 2}
                ${st.x + w},${st.y + 24 - h / 2}
                ${st.x},${st.y + 24}
              `;
              const shadow = `
                ${st.x - w - 8},${st.y + 28 - h / 2}
                ${st.x + 8},${st.y + 28}
                ${st.x + w + 16},${st.y + 28 - h / 2}
                ${st.x},${st.y + 28 - h}
              `;

              return (
                <g
                  key={st.id}
                  className="cursor-pointer transition-transform duration-300"
                  style={{
                    filter: isCurrent ? "drop-shadow(0 4px 12px rgba(31, 95, 224, 0.25))" : "none"
                  }}
                >
                  {/* Cast shadow under station */}
                  <polygon points={shadow} fill="rgba(11, 43, 134, 0.08)" />

                  {/* Left Face */}
                  <polygon
                    points={leftFace}
                    fill={isCurrent ? "#9cbef2" : "#c4d8f6"}
                    stroke="var(--line)"
                    strokeWidth="1.2"
                  />

                  {/* Right Face */}
                  <polygon
                    points={rightFace}
                    fill={isCurrent ? "#b7d3f8" : "#d8e6fa"}
                    stroke="var(--line)"
                    strokeWidth="1.2"
                  />

                  {/* Top Face */}
                  <polygon
                    points={topFace}
                    fill={isCurrent ? "url(#iso-top-active)" : "url(#iso-top)"}
                    stroke={isCurrent ? "var(--active)" : "var(--line)"}
                    strokeWidth={isCurrent ? "2" : "1.2"}
                  />

                  {/* Station Code Badge */}
                  <rect
                    x={st.x - 30}
                    y={st.y - h - 16}
                    width="60"
                    height="14"
                    rx="2"
                    fill={isCurrent ? "var(--active)" : "#f0f5ff"}
                    stroke={isCurrent ? "var(--active)" : "var(--line-mid)"}
                    strokeWidth="1"
                  />
                  <text
                    x={st.x}
                    y={st.y - h - 6}
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="800"
                    letterSpacing="0.08em"
                    fill={isCurrent ? "#ffffff" : "var(--ink-soft)"}
                  >
                    {st.code}
                  </text>

                  {/* Station Label */}
                  <text
                    x={st.x}
                    y={st.y + 42}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="800"
                    letterSpacing="0.05em"
                    fill={isCurrent ? "var(--ink-strong)" : "var(--ink)"}
                  >
                    {st.label}
                  </text>
                  <text
                    x={st.x}
                    y={st.y + 55}
                    textAnchor="middle"
                    fontSize="9.5"
                    fill="var(--ink-soft)"
                  >
                    {st.labelTh}
                  </text>
                </g>
              );
            })}

            {/* Animated Traveling Token with Trailing Lights */}
            <g transform={`translate(${tokenX}, ${tokenY})`} className="transition-all duration-700">
              {/* Trailing particle 3 */}
              <circle cx="-16" cy="4" r="2.5" fill="var(--active)" opacity="0.25" />
              {/* Trailing particle 2 */}
              <circle cx="-10" cy="2" r="3.5" fill="var(--active)" opacity="0.45" />
              {/* Trailing particle 1 */}
              <circle cx="-4" cy="1" r="5" fill="var(--active)" opacity="0.75" />

              {/* Main Core Token */}
              <circle r="14" fill="var(--active)" opacity="0.18" />
              <circle
                r="7"
                fill="var(--active)"
                stroke="var(--panel)"
                strokeWidth="2.5"
              />

              {/* Floating Token Tag Badge */}
              <g transform="translate(0, -22)">
                <rect
                  x="-45"
                  y="-16"
                  width="90"
                  height="18"
                  rx="3"
                  fill="var(--ink-strong)"
                  stroke="var(--active)"
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="-4"
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="800"
                  letterSpacing="0.06em"
                  fill="#ffffff"
                >
                  {currentStep.refCode}
                </text>
              </g>
            </g>
          </svg>

          {/* Floating Blueprint Asset Preview Card in the Top-Right */}
          <div className="pe-floating-card">
            <div className="flex items-center justify-between mb-1.5">
              <span className="pe-card-badge">STEP {currentStep.id} · ASSET SNAPSHOT</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold bg-transparent border-0 cursor-pointer"
                title="ขยายดูภาพเต็ม"
              >
                <Maximize2 className="w-3 h-3" /> ขยายภาพ
              </button>
            </div>

            {/* Character scene thumbnail */}
            {currentStep.characterImage && (
              <div className="mb-2 p-1.5 bg-white border border-[#c8d6ec] rounded flex items-center gap-2">
                <div className="w-14 h-14 relative shrink-0 bg-[#f8fbff] rounded overflow-hidden border border-[#e2ebfc]">
                  <Image
                    src={currentStep.characterImage}
                    alt="Character"
                    fill
                    className="object-contain p-0.5"
                    style={{ mixBlendMode: "multiply" }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-[10.5px] font-bold text-[#00238a] leading-tight">
                    {currentStep.characterTitle || "ภาพตัวละครและฉาก"}
                  </div>
                  <div className="text-[9px] text-[#5a73a8] mt-0.5">
                    Minimalist Line-Art (1:1)
                  </div>
                </div>
              </div>
            )}

            {/* UI Wireframe thumbnail (if present) */}
            {currentStep.uiWireframes.length > 0 && (
              <div className="p-1.5 bg-white border border-[#c8d6ec] rounded">
                <div className="flex items-center justify-between text-[9.5px] font-bold text-[#00238a] mb-1">
                  <span>{currentStep.uiWireframes[selectedWireframeIdx]?.title}</span>
                  <span className="text-[8.5px] text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">
                    {currentStep.uiWireframes[selectedWireframeIdx]?.tag}
                  </span>
                </div>
                <div
                  className="w-full h-24 relative bg-[#f8fbff] rounded overflow-hidden cursor-pointer hover:border-blue-400 border border-[#e2ebfc] transition"
                  onClick={() => {
                    setActiveWireframe(currentStep.uiWireframes[selectedWireframeIdx]);
                    setIsModalOpen(true);
                  }}
                >
                  <Image
                    src={currentStep.uiWireframes[selectedWireframeIdx]?.image}
                    alt="UI Wireframe"
                    fill
                    className="object-contain p-1"
                  />
                </div>

                {/* Sub-tabs if multiple wireframes available */}
                {currentStep.uiWireframes.length > 1 && (
                  <div className="flex gap-1 mt-1.5 overflow-x-auto pb-0.5">
                    {currentStep.uiWireframes.map((wf, idx) => (
                      <button
                        key={wf.id}
                        type="button"
                        onClick={() => setSelectedWireframeIdx(idx)}
                        className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded shrink-0 transition ${
                          selectedWireframeIdx === idx
                            ? "bg-[#1f5fe0] text-white"
                            : "bg-[#edf4fe] text-[#0032a0] hover:bg-[#dbeafe]"
                        }`}
                      >
                        {wf.tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: UI & SCENE VIEWER (High-Res Side-by-Side Comparison)
          ========================================================================= */}
      {viewMode === "scene" && (
        <div className="w-full h-full p-4 overflow-y-auto bg-[#f8fbff] flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#cbd5e1] pb-2">
            <div>
              <h3 className="text-sm font-bold text-[#00238a] m-0">
                SCENE &amp; UI WIREFRAME ASSETS · STEP {currentStep.id}
              </h3>
              <p className="text-[11px] text-[#5a73a8] m-0">
                ภาพประกอบจริงสไตล์ Minimalist Blueprint ที่ใช้ในกระบวนการนี้
              </p>
            </div>
            {currentStep.uiWireframes.length > 1 && (
              <div className="flex gap-1.5">
                {currentStep.uiWireframes.map((wf, idx) => (
                  <button
                    key={wf.id}
                    type="button"
                    onClick={() => setSelectedWireframeIdx(idx)}
                    className={`text-xs font-bold px-2.5 py-1 rounded border transition ${
                      selectedWireframeIdx === idx
                        ? "bg-[#1f5fe0] text-white border-[#1f5fe0]"
                        : "bg-white text-[#0032a0] border-[#c8d6ec] hover:bg-[#edf4fe]"
                    }`}
                  >
                    {wf.tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[360px]">
            {/* Left: Character scene */}
            <div className="bg-white border border-[#c8d6ec] rounded-lg p-3 flex flex-col shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#00238a]">
                  CHARACTER &amp; CLINIC SCENE
                </span>
                <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-semibold">
                  Isometric 1:1 Vector
                </span>
              </div>
              <div className="flex-1 relative min-h-[280px] bg-[#fbfdff] rounded border border-[#edf2fa] flex items-center justify-center overflow-hidden">
                {currentStep.characterImage ? (
                  <Image
                    src={currentStep.characterImage}
                    alt="Character Scene"
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="text-xs text-[#7d96c6]">ไม่มีภาพประกอบตัวละครในขั้นนี้</div>
                )}
              </div>
              <p className="text-xs font-semibold text-[#0032a0] text-center mt-2 mb-0">
                {currentStep.characterTitle}
              </p>
            </div>

            {/* Right: UI Wireframe */}
            <div className="bg-white border border-[#c8d6ec] rounded-lg p-3 flex flex-col shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#00238a]">
                  {currentStep.uiWireframes[selectedWireframeIdx]?.title || "UI WIREFRAME"}
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                  {currentStep.uiWireframes[selectedWireframeIdx]?.tag || "NO UI REQUIRED"}
                </span>
              </div>
              <div className="flex-1 relative min-h-[280px] bg-[#fbfdff] rounded border border-[#edf2fa] flex items-center justify-center overflow-hidden">
                {currentStep.uiWireframes.length > 0 ? (
                  <Image
                    src={currentStep.uiWireframes[selectedWireframeIdx]?.image}
                    alt="UI Wireframe"
                    fill
                    className="object-contain p-2 cursor-pointer hover:scale-[1.01] transition"
                    onClick={() => {
                      setActiveWireframe(currentStep.uiWireframes[selectedWireframeIdx]);
                      setIsModalOpen(true);
                    }}
                  />
                ) : (
                  <div className="text-center p-6 text-xs text-[#7d96c6]">
                    ขั้นตอนนี้เป็นการเคลื่อนไหวเชิงกายภาพหรือพักคอย ไม่มีหน้าจอ KAHIS EMR โดยตรง
                  </div>
                )}
              </div>
              {currentStep.uiWireframes.length > 0 && (
                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveWireframe(currentStep.uiWireframes[selectedWireframeIdx]);
                      setIsModalOpen(true);
                    }}
                    className="text-xs text-[#1f5fe0] hover:underline font-bold inline-flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> คลิกเพื่อขยายดูภาพหน้าจอขนาดใหญ่
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: SEQUENCE VIEW (Vertical Interaction Timeline)
          ========================================================================= */}
      {viewMode === "sequence" && (
        <div className="w-full h-full p-6 overflow-y-auto bg-white flex flex-col items-center">
          <div className="w-full max-w-2xl border-b border-[#cbd5e1] pb-3 mb-4">
            <h3 className="text-sm font-bold text-[#00238a] m-0">
              SEQUENCE TIMELINE DIAGRAM
            </h3>
            <p className="text-xs text-[#5a73a8] m-0">
              ลำดับการสื่อสารและส่งต่อข้อมูลระหว่างผู้ใช้งานและระบบทั้ง 9 ขั้นตอน
            </p>
          </div>

          <div className="w-full max-w-2xl relative pl-8 border-l-2 border-[#6f94c9] flex flex-col gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((stepNum) => {
              const isCurrent = stepNum === currentStep.id;
              return (
                <div
                  key={stepNum}
                  onClick={() => onSelectStep?.(stepNum)}
                  className={`relative p-3 rounded-lg border cursor-pointer transition ${
                    isCurrent
                      ? "bg-[#eef5ff] border-[#1f5fe0] shadow-sm"
                      : "bg-[#fbfdff] border-[#e2ebfc] hover:bg-[#f4f8ff]"
                  }`}
                >
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[41px] top-4 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                      isCurrent
                        ? "bg-[#1f5fe0] text-white border-white ring-2 ring-[#1f5fe0]"
                        : "bg-white text-[#6f94c9] border-[#6f94c9]"
                    }`}
                  >
                    {stepNum}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#00238a]">
                      STEP {stepNum}: {stepNum === currentStep.id ? currentStep.title : `ขั้นตอนที่ ${stepNum}`}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        isCurrent
                          ? "bg-[#1f5fe0] text-white"
                          : "bg-[#e2ebfc] text-[#0032a0]"
                      }`}
                    >
                      {stepNum === currentStep.id ? currentStep.module : "OPD"}
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] mt-1 mb-0">
                    {stepNum === currentStep.id
                      ? currentStep.action
                      : "คลิกเพื่อดูรายละเอียดของขั้นตอนนี้"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          FULL-SCREEN IMAGE PREVIEW MODAL
          ========================================================================= */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-[#94a3b8]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-12 px-5 bg-[#00238a] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <h4 className="text-sm font-bold tracking-wide m-0">
                  {activeWireframe?.title || currentStep.characterTitle || "Asset Preview"}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition cursor-pointer flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 relative min-h-[500px] bg-[#f8fbff] flex items-center justify-center overflow-auto">
              {activeWireframe ? (
                <div className="relative w-full h-[520px]">
                  <Image
                    src={activeWireframe.image}
                    alt={activeWireframe.title}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : currentStep.characterImage ? (
                <div className="relative w-full h-[520px]">
                  <Image
                    src={currentStep.characterImage}
                    alt={currentStep.characterTitle || "Character"}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : null}
            </div>

            <div className="h-11 px-5 bg-[#f1f5f9] border-t border-[#cbd5e1] flex items-center justify-between text-xs text-[#475569]">
              <span>KAHIS Minimalist Blueprint Design System · 4K Source</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1 bg-white border border-[#cbd5e1] rounded font-semibold text-[#0f172a] hover:bg-[#e2e8f0]"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe animation for active lane */}
      <style jsx>{`
        @keyframes laneDash {
          to {
            stroke-dashoffset: -20;
          }
        }
      `}</style>
    </div>
  );
}
