"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  STATIONS,
  STATION_LANES,
  WorkflowStep,
  UIWireframeItem
} from "@/lib/workflow-explorer/workflow-data";
import { Maximize2, Eye, Sparkles, X } from "lucide-react";

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

              {/* Linear Gradients for Isometric Station Faces (Warm Earth Tone) */}
              <linearGradient id="iso-top" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fbf4e3" />
                <stop offset="100%" stopColor="#ead8ba" />
              </linearGradient>

              <linearGradient id="iso-top-active" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f9e6c3" />
                <stop offset="100%" stopColor="#e5be86" />
              </linearGradient>
            </defs>

            {/* Background Grid Accent Lines */}
            <g stroke="#e4d5bc" strokeWidth="0.9" opacity="0.7">
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
                      stroke="#dfd0b6"
                      strokeWidth={isActive ? "4" : "2"}
                      opacity="0.6"
                    />
                    {/* Animated or dashed foreground line */}
                    <path
                      d={lane.d}
                      fill="none"
                      stroke={isActive ? "var(--active)" : "var(--line)"}
                      strokeWidth={isActive ? "2.5" : "1.8"}
                      strokeDasharray={isActive ? "6 4" : "5 4"}
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
                    filter: isCurrent
                      ? "drop-shadow(0 4px 12px rgba(180, 83, 26, 0.25))"
                      : "none"
                  }}
                >
                  {/* Cast shadow under station */}
                  <polygon points={shadow} fill="rgba(51, 30, 16, 0.09)" />

                  {/* Left Face */}
                  <polygon
                    points={leftFace}
                    fill={isCurrent ? "#cfa068" : "#dec8a4"}
                    stroke="var(--line)"
                    strokeWidth="1.2"
                  />

                  {/* Right Face */}
                  <polygon
                    points={rightFace}
                    fill={isCurrent ? "#dfb888" : "#ead8ba"}
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
                    x={st.x - 36}
                    y={st.y - h - 19}
                    width="72"
                    height="17"
                    rx="2"
                    fill={isCurrent ? "var(--active)" : "#f3ead6"}
                    stroke={isCurrent ? "var(--active)" : "var(--line-mid)"}
                    strokeWidth="1"
                  />
                  <text
                    x={st.x}
                    y={st.y - h - 7}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="800"
                    letterSpacing="0.06em"
                    fill={isCurrent ? "#fcf8ee" : "var(--ink-soft)"}
                  >
                    {st.code}
                  </text>

                  {/* Station Label */}
                  <text
                    x={st.x}
                    y={st.y + 44}
                    textAnchor="middle"
                    fontSize="14.5"
                    fontWeight="800"
                    letterSpacing="0.04em"
                    fill={isCurrent ? "var(--ink-strong)" : "var(--ink)"}
                  >
                    {st.label}
                  </text>
                  <text
                    x={st.x}
                    y={st.y + 62}
                    textAnchor="middle"
                    fontSize="13.5"
                    fontWeight="500"
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
                  x="-58"
                  y="-20"
                  width="116"
                  height="22"
                  rx="2.5"
                  fill="var(--ink-strong)"
                  stroke="var(--active)"
                  strokeWidth="1.2"
                />
                <text
                  x="0"
                  y="-5"
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="800"
                  letterSpacing="0.06em"
                  fill="#fcf8ee"
                >
                  {currentStep.refCode}
                </text>
              </g>
            </g>
          </svg>

          {/* Floating Blueprint Asset Preview Card in the Top-Right */}
          <div className="pe-floating-card">
            <div className="flex items-center justify-between mb-2">
              <span className="pe-card-badge">STEP {currentStep.id} · ASSET SNAPSHOT</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-[11.5px] text-[#b4531a] hover:text-[#331e10] flex items-center gap-1 font-extrabold bg-transparent border-0 cursor-pointer"
                title="ขยายดูภาพเต็ม"
              >
                <Maximize2 className="w-3.5 h-3.5" /> ขยายภาพ
              </button>
            </div>

            {/* Character scene thumbnail */}
            {currentStep.characterImage && (
              <div className="mb-2 p-2 bg-[#fcf8ee] border border-[#d8c6aa] rounded-xs flex items-center gap-2.5">
                <div className="w-14 h-14 relative shrink-0 bg-[#f6efe0] rounded-xs overflow-hidden border border-[#e8dcc6]">
                  <Image
                    src={currentStep.characterImage}
                    alt="Character"
                    fill
                    className="object-contain p-0.5"
                    style={{ mixBlendMode: "multiply" }}
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-[#331e10] leading-snug">
                    {currentStep.characterTitle || "ภาพตัวละครและฉาก"}
                  </div>
                  <div className="text-[11px] text-[#7a5a40] mt-0.5">
                    Minimalist Line-Art (1:1)
                  </div>
                </div>
              </div>
            )}

            {/* UI Wireframe thumbnail (if present) */}
            {currentStep.uiWireframes.length > 0 && (
              <div className="p-2 bg-[#fcf8ee] border border-[#d8c6aa] rounded-xs">
                <div className="flex items-center justify-between text-[11.5px] font-bold text-[#331e10] mb-1.5">
                  <span className="truncate pr-1">
                    {currentStep.uiWireframes[selectedWireframeIdx]?.title}
                  </span>
                  <span className="text-[10px] font-extrabold text-[#1f7a4c] bg-[#dfece3] px-1.5 py-0.5 rounded-xs shrink-0">
                    {currentStep.uiWireframes[selectedWireframeIdx]?.tag}
                  </span>
                </div>
                <div
                  className="w-full h-24 relative bg-[#f6efe0] rounded-xs overflow-hidden cursor-pointer hover:border-[#b4531a] border border-[#e8dcc6] transition"
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
                  <div className="flex gap-1 mt-2 overflow-x-auto pb-0.5">
                    {currentStep.uiWireframes.map((wf, idx) => (
                      <button
                        key={wf.id}
                        type="button"
                        onClick={() => setSelectedWireframeIdx(idx)}
                        className={`text-[10.5px] font-extrabold px-2 py-0.5 rounded-xs shrink-0 transition ${
                          selectedWireframeIdx === idx
                            ? "bg-[#b4531a] text-[#fcf8ee]"
                            : "bg-[#efe4ca] text-[#4a2e1b] hover:bg-[#e5d5b5]"
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
        <div className="w-full h-full p-4 overflow-y-auto bg-[#f6efe0] flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#d8c6aa] pb-2.5">
            <div>
              <h3 className="text-[16px] font-extrabold text-[#331e10] tracking-wide m-0">
                SCENE &amp; UI WIREFRAME ASSETS · STEP {currentStep.id}
              </h3>
              <p className="text-[13px] text-[#7a5a40] m-0 mt-0.5">
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
                    className={`text-[12px] font-extrabold px-2.5 py-1 rounded-xs border transition ${
                      selectedWireframeIdx === idx
                        ? "bg-[#b4531a] text-[#fcf8ee] border-[#b4531a]"
                        : "bg-[#fcf8ee] text-[#4a2e1b] border-[#d8c6aa] hover:bg-[#f3ead6]"
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
            <div className="bg-[#fcf8ee] border border-[#d8c6aa] rounded-sm p-3.5 flex flex-col shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13.5px] font-extrabold text-[#331e10] tracking-wide">
                  CHARACTER &amp; CLINIC SCENE
                </span>
                <span className="text-[11px] text-[#7c4d3a] bg-[#f3e6dd] px-2 py-0.5 rounded-xs border border-[#d9c0b2] font-bold">
                  Isometric 1:1 Vector
                </span>
              </div>
              <div className="flex-1 relative min-h-[280px] bg-[#f9f3e5] rounded-xs border border-[#e8dcc6] flex items-center justify-center overflow-hidden">
                {currentStep.characterImage ? (
                  <Image
                    src={currentStep.characterImage}
                    alt="Character Scene"
                    fill
                    className="object-contain p-2"
                    style={{ mixBlendMode: "multiply" }}
                  />
                ) : (
                  <div className="text-[13px] text-[#9c7b5e]">
                    ไม่มีภาพประกอบตัวละครในขั้นนี้
                  </div>
                )}
              </div>
              <p className="text-[13.5px] font-bold text-[#4a2e1b] text-center mt-2.5 mb-0">
                {currentStep.characterTitle}
              </p>
            </div>

            {/* Right: UI Wireframe */}
            <div className="bg-[#fcf8ee] border border-[#d8c6aa] rounded-sm p-3.5 flex flex-col shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13.5px] font-extrabold text-[#331e10] tracking-wide">
                  {currentStep.uiWireframes[selectedWireframeIdx]?.title || "UI WIREFRAME"}
                </span>
                <span className="text-[11px] text-[#1f7a4c] bg-[#dfece3] px-2 py-0.5 rounded-xs border border-[#b8d4c2] font-bold">
                  {currentStep.uiWireframes[selectedWireframeIdx]?.tag || "NO UI REQUIRED"}
                </span>
              </div>
              <div className="flex-1 relative min-h-[280px] bg-[#f9f3e5] rounded-xs border border-[#e8dcc6] flex items-center justify-center overflow-hidden">
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
                  <div className="text-center p-6 text-[13.5px] text-[#7a5a40]">
                    ขั้นตอนนี้เป็นการเคลื่อนไหวเชิงกายภาพหรือพักคอย ไม่มีหน้าจอ KAHIS EMR โดยตรง
                  </div>
                )}
              </div>
              {currentStep.uiWireframes.length > 0 && (
                <div className="text-center mt-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveWireframe(currentStep.uiWireframes[selectedWireframeIdx]);
                      setIsModalOpen(true);
                    }}
                    className="text-[13px] text-[#b4531a] hover:underline font-extrabold inline-flex items-center gap-1.5 bg-transparent border-0 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" /> คลิกเพื่อขยายดูภาพหน้าจอขนาดใหญ่
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
        <div className="w-full h-full p-6 overflow-y-auto bg-[#f9f3e5] flex flex-col items-center">
          <div className="w-full max-w-2xl border-b border-[#d8c6aa] pb-3 mb-4">
            <h3 className="text-[16px] font-extrabold text-[#331e10] tracking-wide m-0">
              SEQUENCE TIMELINE DIAGRAM
            </h3>
            <p className="text-[13.5px] text-[#7a5a40] m-0 mt-0.5">
              ลำดับการสื่อสารและส่งต่อข้อมูลระหว่างผู้ใช้งานและระบบทั้ง 9 ขั้นตอน
            </p>
          </div>

          <div className="w-full max-w-2xl relative pl-8 border-l-2 border-[#a68664] flex flex-col gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((stepNum) => {
              const isCurrent = stepNum === currentStep.id;
              return (
                <div
                  key={stepNum}
                  onClick={() => onSelectStep?.(stepNum)}
                  className={`relative p-3.5 rounded-sm border cursor-pointer transition ${
                    isCurrent
                      ? "bg-[#f5e3c8] border-[#b4531a] shadow-xs"
                      : "bg-[#fcf8ee] border-[#d8c6aa] hover:bg-[#f3ead6]"
                  }`}
                >
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[41px] top-4 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-extrabold border-2 ${
                      isCurrent
                        ? "bg-[#b4531a] text-[#fcf8ee] border-[#fcf8ee] ring-2 ring-[#b4531a]"
                        : "bg-[#fcf8ee] text-[#7a5a40] border-[#a68664]"
                    }`}
                  >
                    {stepNum}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-extrabold text-[#331e10]">
                      STEP {stepNum}:{" "}
                      {stepNum === currentStep.id
                        ? currentStep.title
                        : `ขั้นตอนที่ ${stepNum}`}
                    </span>
                    <span
                      className={`text-[11.5px] font-bold px-2 py-0.5 rounded-xs ${
                        isCurrent
                          ? "bg-[#b4531a] text-[#fcf8ee]"
                          : "bg-[#efe4ca] text-[#4a2e1b]"
                      }`}
                    >
                      {stepNum === currentStep.id ? currentStep.module : "OPD"}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#5c4028] mt-1 mb-0">
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
          className="fixed inset-0 z-50 bg-[#1e120a]/65 backdrop-blur-xs flex items-center justify-center p-6"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-[#fcf8ee] rounded-md shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-[#a68664]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-12 px-5 bg-[#331e10] text-[#fcf8ee] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#f4b305]" />
                <h4 className="text-[15px] font-extrabold tracking-wide m-0">
                  {activeWireframe?.title || currentStep.characterTitle || "Asset Preview"}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#fcf8ee]/80 hover:text-[#fcf8ee] p-1 rounded-xs hover:bg-white/10 transition cursor-pointer flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 relative min-h-[500px] bg-[#f9f3e5] flex items-center justify-center overflow-auto">
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

            <div className="h-11 px-5 bg-[#f3ead6] border-t border-[#d8c6aa] flex items-center justify-between text-[13px] text-[#5c4028]">
              <span>KAHIS Warm Earth-Tone Blueprint Design System · 4K Source</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1 bg-[#fcf8ee] border border-[#a68664] rounded-xs font-bold text-[#331e10] hover:bg-[#efe4ca] cursor-pointer"
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
