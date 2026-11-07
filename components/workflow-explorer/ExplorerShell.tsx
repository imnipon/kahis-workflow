"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  WORKFLOWS,
  WorkflowGroup,
  WorkflowItem,
  WorkflowStep
} from "@/lib/workflow-explorer/workflow-data";
import IsometricCanvas from "./IsometricCanvas";
import "./BlueprintStyles.css";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Layers,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  Check
} from "lucide-react";

export default function ExplorerShell() {
  const [selectedGroup, setSelectedGroup] = useState<WorkflowGroup>("all");
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowItem>(WORKFLOWS[0]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"flow" | "scene" | "sequence">("flow");
  const [overviewTab, setOverviewTab] = useState<"step" | "overview">("step");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const currentStep: WorkflowStep = activeWorkflow.steps[currentStepIdx] || activeWorkflow.steps[0];
  const totalSteps = activeWorkflow.steps.length;

  // Controls
  const handleNextStep = useCallback(() => {
    setCurrentStepIdx((prev) => {
      if (prev < totalSteps - 1) return prev + 1;
      setIsPlaying(false);
      return prev;
    });
  }, [totalSteps]);

  const handlePrevStep = useCallback(() => {
    setCurrentStepIdx((prev) => Math.max(0, prev - 1));
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
  }, []);

  const handleTogglePlay = useCallback(() => {
    if (currentStepIdx >= totalSteps - 1) {
      setCurrentStepIdx(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [currentStepIdx, totalSteps]);

  const handleCycleSpeed = () => {
    setPlaybackSpeed((prev) => {
      if (prev === 0.5) return 1;
      if (prev === 1) return 2;
      return 0.5;
    });
  };

  // Playback Timer
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = 2800 / playbackSpeed;
    const timer = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev < totalSteps - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, totalSteps]);

  // Keyboard Shortcuts (Space, Left, Right, R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if focus is in an input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === "Space") {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleNextStep();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrevStep();
      } else if (e.code === "KeyR") {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTogglePlay, handleNextStep, handlePrevStep, handleReset]);

  // Filtered workflows by group
  const filteredWorkflows = WORKFLOWS.filter((wf) => {
    if (selectedGroup === "all") return true;
    return wf.group === selectedGroup;
  });

  return (
    <div className="pe-shell">
      {/* =========================================================================
          1. TOPBAR
          ========================================================================= */}
      <header className="pe-topbar">
        {/* Brand */}
        <div className="pe-brand">
          <div className="pe-logo-frame">
            <span className="corner tl" />
            <span className="corner tr" />
            <span className="corner bl" />
            <span className="corner br" />
            <svg viewBox="0 0 64 64" className="w-5 h-5 text-[#0032a0]" fill="currentColor">
              <g stroke="#ffffff" strokeWidth="2.4" strokeLinejoin="round">
                <path d="M32 3 L58 16.5 L32 30 L6 16.5 Z" />
                <path d="M6 16.5 L32 30 L32 45.5 L6 32 Z" />
                <path d="M58 16.5 L32 30 L32 45.5 L58 32 Z" />
                <path d="M6 32 L32 45.5 L32 61 L6 47.5 Z" />
                <path d="M58 32 L32 45.5 L32 61 L58 47.5 Z" />
              </g>
            </svg>
          </div>
          <div>
            <h1 className="pe-brand-title">KAHIS <em>WORKFLOW EXPLORER</em></h1>
            <p className="pe-brand-sub">LEARN VETERINARY CLINICAL &amp; EMR PROCESSES</p>
          </div>
        </div>

        <span className="pe-topbar-sep" />

        {/* Current Step Tracker */}
        <div className="pe-now">
          <div className="pe-now-label">
            NOW EXPLORING · STEP {currentStep.id} OF {totalSteps}
          </div>
          <div className="pe-now-title">{currentStep.title}</div>
        </div>

        {/* Topbar Tools & GitHub Link */}
        <div className="pe-topbar-tools">
          <a
            href="https://github.com/imnipon/kahis-workflow"
            target="_blank"
            rel="noopener noreferrer"
            className="pe-pill-btn flex items-center gap-1.5 text-xs font-bold text-[#00238a] hover:bg-[#edf4fe]"
            title="GitHub Repository: imnipon/kahis-workflow"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>GITHUB REPO</span>
          </a>

          <span className="pe-pill-btn flex items-center gap-1.5 text-xs font-bold text-[#5a73a8]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>KAHIS v1.0</span>
          </span>
        </div>
      </header>

      {/* =========================================================================
          2. WORKSPACE GRID
          ========================================================================= */}
      <main className="pe-workspace">
        {/* -----------------------------------------------------------------------
            PANEL 1: SIDEBAR (Left 430px, full height)
            ----------------------------------------------------------------------- */}
        <aside className="pe-panel pe-sidebar">
          <div className="pe-panel-head">
            <h2 className="pe-panel-title">CLINICAL WORKFLOWS</h2>
            <span className="text-[10px] font-bold text-[#1f5fe0] bg-[#eef4ff] px-2 py-0.5 rounded border border-[#c9d8f6]">
              {WORKFLOWS.length} FLOWS
            </span>
          </div>

          {/* Category Tabs */}
          <div className="pe-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              onClick={() => setSelectedGroup("all")}
              className={`pe-tab ${selectedGroup === "all" ? "is-active" : ""}`}
            >
              <span>ALL</span>
              <span className="pe-tab-count">2</span>
            </button>
            <button
              type="button"
              role="tab"
              onClick={() => setSelectedGroup("clinical")}
              className={`pe-tab ${selectedGroup === "clinical" ? "is-active" : ""}`}
            >
              <span>SERVICE</span>
              <span className="pe-tab-count">1</span>
            </button>
            <button
              type="button"
              role="tab"
              onClick={() => setSelectedGroup("exam-card")}
              className={`pe-tab ${selectedGroup === "exam-card" ? "is-active" : ""}`}
            >
              <span>EXAM CARD</span>
              <span className="pe-tab-count">1</span>
            </button>
          </div>

          {/* Workflow Header Card */}
          <div className="p-3 pb-0">
            <div className="pe-proto-header">
              <div className="flex items-center justify-between">
                <span className="pe-proto-title">{activeWorkflow.title}</span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  ACTIVE
                </span>
              </div>
              <div className="pe-proto-sub">{activeWorkflow.subtitle}</div>
            </div>
          </div>

          {/* Step List (1 to 9) */}
          <ul className="pe-proto-list">
            {activeWorkflow.steps.map((st, idx) => {
              const isActive = idx === currentStepIdx;
              const isDone = idx < currentStepIdx;
              return (
                <li
                  key={st.id}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStepIdx(idx);
                  }}
                  className={`pe-step-item ${isActive ? "is-active" : ""}`}
                >
                  <div className="pe-step-num flex items-center justify-center">
                    {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : st.id}
                  </div>
                  <div className="pe-step-text">
                    <div className="pe-step-title">{st.title}</div>
                    <div className="pe-step-sub">{st.subtitle}</div>
                  </div>
                  <span
                    className={`pe-legend-dot ${st.badgeColor} shrink-0`}
                    title={`Actor: ${st.actor}`}
                  />
                </li>
              );
            })}
          </ul>
        </aside>

        {/* -----------------------------------------------------------------------
            PANEL 2: SIMULATION (Center-Top, 1fr)
            ----------------------------------------------------------------------- */}
        <section className="pe-panel pe-simulation flex-1">
          <div className="pe-panel-head">
            <div className="pe-sim-view-toggle">
              <button
                type="button"
                onClick={() => setViewMode("flow")}
                className={`pe-pill-btn ${viewMode === "flow" ? "is-active" : ""}`}
              >
                FLOW MAP
              </button>
              <button
                type="button"
                onClick={() => setViewMode("scene")}
                className={`pe-pill-btn ${viewMode === "scene" ? "is-active" : ""}`}
              >
                UI &amp; SCENE
              </button>
              <button
                type="button"
                onClick={() => setViewMode("sequence")}
                className={`pe-pill-btn ${viewMode === "sequence" ? "is-active" : ""}`}
              >
                SEQUENCE
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStepIdx === 0}
                className="pe-pill-btn text-xs px-2 disabled:opacity-30 disabled:cursor-not-allowed"
                title="ย้อนกลับ (←)"
              >
                ‹
              </button>
              <span className="text-[10px] font-bold text-[#5a73a8]">
                {currentStepIdx + 1}/{totalSteps}
              </span>
              <button
                type="button"
                onClick={handleNextStep}
                disabled={currentStepIdx === totalSteps - 1}
                className="pe-pill-btn text-xs px-2 disabled:opacity-30 disabled:cursor-not-allowed"
                title="ถัดไป (→)"
              >
                ›
              </button>
            </div>
          </div>

          <IsometricCanvas
            currentStep={currentStep}
            viewMode={viewMode}
            onSelectStep={(stepId) => setCurrentStepIdx(stepId - 1)}
          />
        </section>

        {/* -----------------------------------------------------------------------
            PANEL 3: OVERVIEW (Right-Top, 340px)
            ----------------------------------------------------------------------- */}
        <section className="pe-panel pe-overview">
          <div className="pe-panel-head">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setOverviewTab("step")}
                className={`pe-pill-btn ${overviewTab === "step" ? "is-active" : ""}`}
              >
                STEP DETAILS
              </button>
              <button
                type="button"
                onClick={() => setOverviewTab("overview")}
                className={`pe-pill-btn ${overviewTab === "overview" ? "is-active" : ""}`}
              >
                OVERVIEW
              </button>
            </div>
          </div>

          <div className="pe-overview-body">
            {overviewTab === "step" ? (
              <div>
                <h3 className="pe-overview-title">{currentStep.explanation.title}</h3>
                <p className="pe-overview-sub">{currentStep.action}</p>

                <div className="pe-facts-list">
                  <div className="pe-fact-row">
                    <span className="pe-fact-label">RESPONSIBLE ACTOR</span>
                    <span className="pe-fact-val">{currentStep.explanation.role}</span>
                  </div>
                  <div className="pe-fact-row">
                    <span className="pe-fact-label">LOCATION</span>
                    <span className="pe-fact-val">{currentStep.explanation.location}</span>
                  </div>
                  <div className="pe-fact-row">
                    <span className="pe-fact-label">KAHIS SYSTEM / MODULE</span>
                    <span className="pe-fact-val">{currentStep.explanation.systemUsed}</span>
                  </div>
                  <div className="pe-fact-row">
                    <span className="pe-fact-label">CLINICAL CONTEXT</span>
                    <span className="pe-fact-val">{currentStep.explanation.clinicalNote}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#e3e9f3]">
                  <span className="text-[10px] font-extrabold text-[#00238a] tracking-wider block mb-2">
                    KEY CLINICAL CHECKPOINTS
                  </span>
                  <div>
                    {currentStep.explanation.keyPoints.map((kp, i) => (
                      <div key={i} className="pe-keypoint-item">
                        <span>{kp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="pe-overview-title">{activeWorkflow.title}</h3>
                <p className="pe-overview-sub">{activeWorkflow.overviewDesc}</p>

                <div className="pe-facts-list">
                  {activeWorkflow.facts.map((f, i) => (
                    <div key={i} className="pe-fact-row">
                      <span className="pe-fact-label">{f.label}</span>
                      <span className="pe-fact-val">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* -----------------------------------------------------------------------
            PANEL 4: PACKETS & WORKFLOW LOG (Bottom, columns 2-3, height 248px)
            ----------------------------------------------------------------------- */}
        <section className="pe-panel pe-packets">
          <div className="pe-packets-head">
            <h2 className="pe-panel-title sm">WORKFLOW ACTION LOG</h2>

            {/* Legend Dots */}
            <div className="pe-legend">
              <span className="pe-legend-item">
                <i className="pe-legend-dot blue" />
                <span>Owner</span>
              </span>
              <span className="pe-legend-item">
                <i className="pe-legend-dot amber" />
                <span>Staff/Reception</span>
              </span>
              <span className="pe-legend-item">
                <i className="pe-legend-dot violet" />
                <span>DVM/Doctor</span>
              </span>
              <span className="pe-legend-item">
                <i className="pe-legend-dot green" />
                <span>System/Call</span>
              </span>
            </div>

            {/* Controls Toolbar */}
            <div className="pe-ctrls">
              <button
                type="button"
                onClick={handleCycleSpeed}
                className="pe-ctrl-btn"
                title="สลับความเร็วการเล่น (0.5x, 1x, 2x)"
              >
                <span>{playbackSpeed}×</span>
              </button>

              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStepIdx === 0}
                className="pe-ctrl-btn disabled:opacity-40"
                title="ย้อนกลับ (←)"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleTogglePlay}
                className="pe-ctrl-btn primary"
                title="เล่น / หยุดชั่วคราว (Space)"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>PLAY</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                disabled={currentStepIdx === totalSteps - 1}
                className="pe-ctrl-btn disabled:opacity-40"
                title="ก้าวไปข้างหน้า 1 ขั้น (→)"
              >
                <span>STEP</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="pe-ctrl-btn"
                title="เริ่มใหม่ (R)"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Action Log Table */}
          <div className="pe-table-wrap">
            <table className="pe-table">
              <thead>
                <tr>
                  <th>NO.</th>
                  <th>TIME</th>
                  <th>ACTOR</th>
                  <th>LOCATION</th>
                  <th>KAHIS MODULE</th>
                  <th>ACTION DESCRIPTION</th>
                  <th>REF CODE</th>
                </tr>
              </thead>
              <tbody>
                {activeWorkflow.steps.map((st, idx) => {
                  const isActive = idx === currentStepIdx;
                  return (
                    <tr
                      key={st.id}
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentStepIdx(idx);
                      }}
                      className={`cursor-pointer transition ${isActive ? "is-active" : ""}`}
                    >
                      <td>
                        <span className="flex items-center gap-1.5 font-bold">
                          <i className={`pe-legend-dot ${st.badgeColor}`} />
                          {st.id}
                        </span>
                      </td>
                      <td className="text-[#5a73a8]">{st.time}</td>
                      <td>{st.actor}</td>
                      <td>{st.target}</td>
                      <td className="font-semibold text-[#00238a]">{st.module}</td>
                      <td>{st.action}</td>
                      <td className="font-mono text-[10px] text-[#1f5fe0]">{st.refCode}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
