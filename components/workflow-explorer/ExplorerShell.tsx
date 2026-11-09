"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
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
  ChevronDown,
  Sparkles,
  BookOpen,
  Check,
  X,
  Layers,
  Code2,
  History,
  Compass,
  Maximize2,
  Minimize2
} from "lucide-react";

export default function ExplorerShell() {
  const [selectedGroup, setSelectedGroup] = useState<WorkflowGroup>("clinical");
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>(WORKFLOWS[0].id);
  const activeWorkflow: WorkflowItem =
    WORKFLOWS.find((w) => w.id === activeWorkflowId) || WORKFLOWS[0];
  const setActiveWorkflow = useCallback((wf: WorkflowItem) => {
    setActiveWorkflowId(wf.id);
  }, []);
  const [expandedWorkflowId, setExpandedWorkflowId] = useState<string | null>(WORKFLOWS[0].id);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [animKey, setAnimKey] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"flow" | "scene">("flow");
  const [overviewTab, setOverviewTab] = useState<"step" | "overview">("step");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isManualOpen, setIsManualOpen] = useState<boolean>(false);
  const [isCanvasFullscreen, setIsCanvasFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isCanvasFullscreen) {
        setIsCanvasFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCanvasFullscreen]);

  const fallbackStep: WorkflowStep = WORKFLOWS[0].steps[0];
  const currentStep: WorkflowStep =
    activeWorkflow.steps[currentStepIdx] || activeWorkflow.steps[0] || fallbackStep;
  const totalSteps = activeWorkflow.steps.length;

  // Controls
  const handleNextStep = useCallback(() => {
    setCurrentStepIdx((prev) => {
      if (prev < totalSteps - 1) {
        setAnimKey((k) => k + 1);
        return prev + 1;
      }
      setIsPlaying(false);
      return prev;
    });
  }, [totalSteps]);

  const handlePrevStep = useCallback(() => {
    setCurrentStepIdx((prev) => {
      setAnimKey((k) => k + 1);
      return Math.max(0, prev - 1);
    });
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIdx(0);
    setAnimKey((k) => k + 1);
  }, []);

  const handleTogglePlay = useCallback(() => {
    setAnimKey((k) => k + 1);
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
    const isStep3 = activeWorkflow.steps[currentStepIdx]?.id === 3;
    const intervalMs = (isStep3 ? 4600 : 2800) / playbackSpeed;
    const timer = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev < totalSteps - 1) {
          setAnimKey((k) => k + 1);
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, totalSteps, currentStepIdx, activeWorkflow]);

  // Keyboard Shortcuts (Space, Left, Right, R, M)
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
      } else if (e.code === "KeyM") {
        e.preventDefault();
        setIsManualOpen((prev) => !prev);
      } else if (e.code === "Escape") {
        setIsManualOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTogglePlay, handleNextStep, handlePrevStep, handleReset]);

  // Filtered workflows by group
  const filteredWorkflows = WORKFLOWS.filter((wf) => wf.group === selectedGroup);
  const activeServiceCount = WORKFLOWS.filter(
    (wf) => wf.group === "clinical" && wf.status === "active"
  ).length;
  const activeExamCardCount = WORKFLOWS.filter(
    (wf) => wf.group === "exam-card" && wf.status === "active"
  ).length;

  return (
    <div className="pe-shell">
      {/* =========================================================================
          1. TOPBAR
          ========================================================================= */}
      <header className="pe-topbar">
        {/* Brand with Official Logo Icon */}
        <div className="pe-brand">
          <div className="pe-logo-frame">
            <span className="corner tl" />
            <span className="corner tr" />
            <span className="corner bl" />
            <span className="corner br" />
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-[1px]">
              <Image
                src="/images/logo_icon/logo_favicon.png"
                alt="KAHIS Logo"
                fill
                sizes="50px"
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div>
            <h1 className="pe-brand-title">
              KAHIS <em>WORKFLOW EXPLORER</em>
            </h1>
            <p className="pe-brand-sub">LEARN VETERINARY CLINICAL &amp; EMR PROCESSES</p>
          </div>
        </div>

        <span className="pe-topbar-sep" />

        {/* Current Step Tracker */}
        <div className="pe-now">
          <div className="pe-now-label">
            NOW EXPLORING · {activeWorkflow.title.toUpperCase()} · STEP{" "}
            {totalSteps > 0 ? currentStep.id : 0} OF {totalSteps}
          </div>
          <div className="pe-now-title">
            {totalSteps > 0 ? currentStep.title : activeWorkflow.subtitle}
          </div>
        </div>

        {/* Topbar Tools: MANUAL Button & Version Badge */}
        <div className="pe-topbar-tools">
          <button
            type="button"
            onClick={() => setIsManualOpen(true)}
            className="pe-menu-btn cursor-pointer"
            title="เปิดคู่มือการใช้งานและเอกสารสถาปัตยกรรม (Manual v1.0)"
          >
            <BookOpen className="w-4 h-4 text-[#b4531a]" />
            <span>MANUAL v1.0</span>
          </button>

          <span className="pe-menu-btn text-[#7a5a40]">
            <Sparkles className="w-4 h-4 text-[#d98a00]" />
            <span>KAHIS v1.0</span>
          </span>
        </div>
      </header>

      {/* =========================================================================
          2. WORKSPACE GRID
          ========================================================================= */}
      <main className="pe-workspace">
        {/* -----------------------------------------------------------------------
            PANEL 1: SIDEBAR (Left 445px, full height)
            ----------------------------------------------------------------------- */}
        <aside className="pe-panel pe-sidebar">
          <div className="pe-panel-head">
            <h2 className="pe-panel-title">CLINICAL WORKFLOWS</h2>
            <span className="text-[11px] font-extrabold tracking-wider text-[#b4531a] bg-[#f5e3c8] px-2.5 py-0.5 rounded-xs border border-[#d8c6aa]">
              {selectedGroup === "clinical" ? `${activeServiceCount} ACTIVE` : "0 FLOWS"}
            </span>
          </div>

          {/* Category Tabs (Only 2 Tabs: SERVICE 1 & EXAM CARD 0) */}
          <div className="pe-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              onClick={() => {
                setSelectedGroup("clinical");
              }}
              className={`pe-tab ${selectedGroup === "clinical" ? "is-active" : ""}`}
            >
              <span>SERVICE</span>
              <span className="pe-tab-count">{activeServiceCount}</span>
            </button>
            <button
              type="button"
              role="tab"
              onClick={() => {
                setSelectedGroup("exam-card");
              }}
              className={`pe-tab ${selectedGroup === "exam-card" ? "is-active" : ""}`}
            >
              <span>EXAM CARD</span>
              <span className="pe-tab-count">{activeExamCardCount}</span>
            </button>
          </div>

          {selectedGroup === "clinical" ? (
            <ul className="pe-proto-list">
              {filteredWorkflows.map((wf) => {
                const isSelectedWf = wf.id === activeWorkflow.id;
                const isExpanded = expandedWorkflowId === wf.id;

                return (
                  <li key={wf.id} className="mb-2">
                    {/* Protocol Explorer Accordion Row (like HTTP >, HTTPS >, TCP >) */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        if (activeWorkflow.id !== wf.id) {
                          setActiveWorkflow(wf);
                          setCurrentStepIdx(0);
                          setExpandedWorkflowId(wf.id);
                        } else {
                          setExpandedWorkflowId((prev) => (prev === wf.id ? null : wf.id));
                        }
                      }}
                      className={`pe-proto-header w-full text-left cursor-pointer transition flex items-center justify-between gap-2 ${
                        isSelectedWf
                          ? "border-[#b4531a] bg-[#f6ebd4]"
                          : "border-[#d8c6aa] bg-[#fcf8ee] hover:bg-[#f4ebd9]"
                      }`}
                      style={{ margin: 0 }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="pe-proto-title truncate">{wf.title}</span>
                          <span
                            className={`text-[10px] font-extrabold tracking-wider px-1.5 py-0.5 rounded-xs border shrink-0 ${
                              wf.status === "active"
                                ? "bg-[#dfece3] text-[#1f7a4c] border-[#b8d4c2]"
                                : "bg-[#efe4ca] text-[#7a5a40] border-[#d8c6aa]"
                            }`}
                          >
                            {wf.status === "active" ? `${wf.steps.length}` : "0"}
                          </span>
                        </div>
                        <div className="pe-proto-sub truncate mt-0.5">{wf.subtitle}</div>
                      </div>
                      <span
                        className="text-[14px] font-extrabold text-[#4a2e1b] shrink-0 px-1"
                        aria-hidden="true"
                      >
                        {isExpanded ? "▾" : "▸"}
                      </span>
                    </button>

                    {/* Expanded Steps under Selected Protocol Item */}
                    {isExpanded && (
                      <div className="mt-1.5 pl-2 border-l-2 border-[#d8c6aa] space-y-1">
                        {wf.steps.length > 0 ? (
                          wf.steps.map((st, idx) => {
                            const isActive = isSelectedWf && idx === currentStepIdx;
                            const isDone = isSelectedWf && idx < currentStepIdx;
                            return (
                              <div
                                key={st.id}
                                onClick={() => {
                                  setIsPlaying(false);
                                  if (!isSelectedWf) setActiveWorkflow(wf);
                                  setCurrentStepIdx(idx);
                                  setAnimKey((k) => k + 1);
                                }}
                                className={`pe-step-item ${isActive ? "is-active" : ""}`}
                              >
                                <div className="pe-step-num flex items-center justify-center">
                                  {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : st.id}
                                </div>
                                <div className="pe-step-text">
                                  <div className="pe-step-title" title={st.title}>{st.title}</div>
                                  <div className="pe-step-sub" title={st.subtitle}>{st.subtitle}</div>
                                </div>
                                <span
                                  className={`pe-legend-dot ${st.badgeColor} shrink-0`}
                                  title={`Actor: ${st.actor}`}
                                />
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-3 bg-[#f9f3e5] border border-dashed border-[#a68664] rounded-xs text-left space-y-1.5">
                            <div className="text-[11px] font-extrabold text-[#7a5a40]">
                              EMPTY WORKFLOW (0 STEPS)
                            </div>
                            <p className="text-[12px] text-[#7a5a40] m-0 leading-relaxed">
                              ยังไม่ได้กำหนดขั้นตอนการไหลสำหรับแผนกฉุกเฉิน ER
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-5 m-3 bg-[#f9f3e5] border border-dashed border-[#a68664] rounded-xs text-center space-y-2.5">
              <div className="inline-block px-2.5 py-0.5 bg-[#efe4ca] text-[#7a5a40] text-[11px] font-extrabold rounded-xs">
                EXAM CARD WORKFLOWS (0)
              </div>
              <div className="text-[14px] font-extrabold text-[#331e10]">
                ยังไม่มีรายการ Workflow ในหมวด Exam Card
              </div>
              <p className="text-[12.5px] text-[#7a5a40] m-0 leading-relaxed">
                ขณะนี้เปิดใช้งานเฉพาะหมวด <strong>SERVICE (1)</strong> สามารถคลิกกลับไปที่แท็บ{" "}
                <strong>SERVICE</strong> เพื่อดู General Patient Service Journey
              </p>
              <button
                type="button"
                onClick={() => setSelectedGroup("clinical")}
                className="mt-1 px-3 py-1.5 bg-[#b4531a] text-[#fcf8ee] text-[12px] font-extrabold rounded-xs border-0 cursor-pointer hover:bg-[#331e10] transition"
              >
                ไปที่แท็บ SERVICE (1)
              </button>
            </div>
          )}
        </aside>

        {/* -----------------------------------------------------------------------
            PANEL 2: SIMULATION (Center-Top, 1fr)
            ----------------------------------------------------------------------- */}
        <section className={`pe-panel pe-simulation flex-1 ${isCanvasFullscreen ? "is-fullscreen" : ""}`}>
          {/* BAR 1: DISPLAY BAR */}
          <div className="pe-panel-head">
            {/* 1. Left: View Mode Toggle */}
            <div className="pe-sim-view-toggle">
              <button
                type="button"
                onClick={() => setViewMode("flow")}
                className={`pe-pill-btn ${viewMode === "flow" ? "is-active" : ""}`}
                title="ดูแผนผังการไหล Isometric Multi-Lane (FLOW MAP)"
              >
                FLOW MAP
              </button>
              <button
                type="button"
                onClick={() => setViewMode("scene")}
                className={`pe-pill-btn ${viewMode === "scene" ? "is-active" : ""}`}
                title="ดูหน้าจอ KAHIS UI และฉากจำลอง (UI & SCENE)"
              >
                UI &amp; SCENE
              </button>
            </div>

            {/* 2. Middle: LANES Legend (ระหว่าง [flow][ui] กับ [step][fullscreen]) */}
            <div className="pe-head-lanes flex items-center gap-2.5 px-3 py-1 rounded bg-[#f4ebd9]/80 border border-[#d8c6aa]/70">
              <span className="text-[10.5px] font-extrabold text-[#331e10] tracking-wider">
                LANES:
              </span>
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#8c5828]"
                title="เส้นทางการเคลื่อนที่ของผู้ป่วยและเจ้าของ (Pet & Owner Movement)"
              >
                <span className="w-3.5 h-1 bg-[#8c5828] rounded-full inline-block" />
                <span className="pe-lane-label">Pet &amp; Owner</span>
              </span>
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#16a34a]"
                title="เส้นทางข้อมูลและสถานะในระบบ KAHIS (System Data Flow)"
              >
                <span className="w-3.5 h-0.5 border-b-2 border-dashed border-[#16a34a] inline-block" />
                <span className="pe-lane-label">System Flow</span>
              </span>
            </div>

            {/* 3. Right: Step Navigation & Full Screen */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStepIdx === 0}
                className="pe-pill-btn text-sm px-2.5 disabled:opacity-35 disabled:cursor-not-allowed"
                title="ย้อนกลับ (←)"
              >
                ‹
              </button>
              <span className="text-[12.5px] font-extrabold text-[#7a5a40] px-1">
                {currentStepIdx + 1}/{totalSteps}
              </span>
              <button
                type="button"
                onClick={handleNextStep}
                disabled={currentStepIdx === totalSteps - 1}
                className="pe-pill-btn text-sm px-2.5 disabled:opacity-35 disabled:cursor-not-allowed"
                title="ถัดไป (→)"
              >
                ›
              </button>
              <button
                type="button"
                onClick={() => setIsCanvasFullscreen((prev) => !prev)}
                className={`pe-pill-btn ${isCanvasFullscreen ? "is-active text-[#b4531a]" : ""}`}
                title={isCanvasFullscreen ? "ออกจากโหมดเต็มจอ (Esc)" : "แสดงแผนภาพเต็มหน้าจอ (Full Screen)"}
              >
                {isCanvasFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 mr-1 inline" />
                    <span>EXIT FULL</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 mr-1 inline" />
                    <span>FULL SCREEN</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <IsometricCanvas
            currentStep={currentStep}
            viewMode={viewMode}
            playbackSpeed={playbackSpeed}
            animKey={animKey}
            onSelectStep={(stepId) => {
              setCurrentStepIdx(stepId - 1);
              setAnimKey((k) => k + 1);
            }}
            onSwitchView={(mode) => setViewMode(mode)}
          />
        </section>

        {/* -----------------------------------------------------------------------
            PANEL 3: OVERVIEW (Right-Top, 348px)
            ----------------------------------------------------------------------- */}
        <section className="pe-panel pe-overview">
          <div className="pe-panel-head">
            <div className="flex gap-1.5">
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

                <div className="mt-4 pt-3 border-t border-[#e8dcc6]">
                  <span className="text-[12px] font-extrabold text-[#331e10] tracking-wider block mb-2">
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
                <i className="pe-legend-dot owner" />
                <span>Pet &amp; Owner</span>
              </span>
              <span className="pe-legend-item">
                <i className="pe-legend-dot staff" />
                <span>Staff</span>
              </span>
              <span className="pe-legend-item">
                <i className="pe-legend-dot dvm" />
                <span>DVM</span>
              </span>
              <span className="pe-legend-item">
                <i className="pe-legend-dot sideflow" />
                <span>Sideflow</span>
              </span>
              <span className="pe-legend-item">
                <i className="pe-legend-dot system" />
                <span>System</span>
              </span>
              <span className="pe-legend-item">
                <i className="pe-legend-dot alarm" />
                <span>Alarm</span>
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
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleTogglePlay}
                className="pe-ctrl-btn primary"
                title="เล่น / หยุดชั่วคราว (Space)"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
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
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="pe-ctrl-btn"
                title="เริ่มใหม่ (R)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action Log Table */}
          <div className="pe-table-wrap">
            <table className="pe-table">
              <thead>
                <tr>
                  <th>NO.</th>
                  <th>ACTOR</th>
                  <th>LOCATION</th>
                  <th>KAHIS MODULE</th>
                  <th>OUTPUT</th>
                  <th>ACTION DESCRIPTION</th>
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
                        setAnimKey((k) => k + 1);
                      }}
                      className={`cursor-pointer transition ${isActive ? "is-active" : ""}`}
                    >
                      <td>
                        <span className="flex items-center gap-2 font-bold">
                          <i className={`pe-legend-dot ${st.badgeColor}`} />
                          {st.id}
                        </span>
                      </td>
                      <td>{st.actor}</td>
                      <td>{st.target}</td>
                      <td className="font-bold text-[#331e10]">{st.module}</td>
                      <td>
                        <span
                          className={`inline-block px-2 py-0.5 text-[11.5px] font-extrabold rounded-xs border ${
                            st.output === "data"
                              ? "bg-[#f3ead6] text-[#6b4c35] border-[#d8c6aa]"
                              : "bg-[#fcf5eb] text-[#b4531a] border-[#d99b66]"
                          }`}
                        >
                          {st.output}
                        </span>
                      </td>
                      <td>{st.action}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* =========================================================================
          3. FULL MANUAL & ARCHITECTURE MODAL (คู่มือระบบ v1.0)
          ========================================================================= */}
      {isManualOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#1e120a]/70 backdrop-blur-xs flex items-center justify-center p-4 md:p-8"
          onClick={() => setIsManualOpen(false)}
        >
          <div
            className="bg-[#fcf8ee] rounded-md shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-[#a68664]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="h-14 px-5 bg-[#331e10] text-[#fcf8ee] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-[#f4b305]" />
                <div>
                  <h3 className="text-[16px] font-extrabold tracking-wide m-0">
                    KAHIS WORKFLOW EXPLORER · คู่มือระบบ &amp; สถาปัตยกรรม (v1.0)
                  </h3>
                  <p className="text-[11px] text-[#dec8a4] m-0">
                    Interactive Blueprint &amp; EMR Outpatient Care Process Manual
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManualOpen(false)}
                className="text-[#fcf8ee]/80 hover:text-[#fcf8ee] p-1.5 rounded-xs hover:bg-white/10 transition cursor-pointer flex items-center justify-center"
                title="ปิดหน้าต่าง (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 flex-1 overflow-y-auto bg-[#f9f3e5] text-[#4a2e1b] text-[13.5px] leading-relaxed space-y-6">
              {/* Card 1: Overview */}
              <div className="p-4 bg-[#fcf8ee] border border-[#d8c6aa] rounded-xs shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Compass className="w-4 h-4 text-[#b4531a]" />
                  <h4 className="text-[15px] font-extrabold text-[#331e10] m-0">
                    1. ภาพรวมและวัตถุประสงค์ (Overview &amp; Purpose)
                  </h4>
                </div>
                <p className="m-0 text-[#5c4028]">
                  <strong>KAHIS Clinical Workflow Explorer v1.0</strong> เป็นเว็บแอปพลิเคชันจำลองกระบวนการให้บริการตรวจรักษาทางสัตวแพทย์และระบบสารสนเทศโรงพยาบาลสัตว์ (KAHIS EMR &amp; Exam Card) ในรูปแบบ <strong>Interactive 3D Blueprint Schematic</strong> โดยจำลอง 9 ขั้นตอนของคลินิกผู้ป่วยนอก (OPD Service Journey) ควบคู่กับภาพวาดบรรยากาศคลินิก (Minimalist Line-Art 1:1) และพิมพ์เขียวหน้าจอระบบจริง
                </p>
              </div>

              {/* Card 2: UI Architecture Diagram */}
              <div className="p-4 bg-[#fcf8ee] border border-[#d8c6aa] rounded-xs shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-4 h-4 text-[#b4531a]" />
                  <h4 className="text-[15px] font-extrabold text-[#331e10] m-0">
                    2. แผนผังโครงสร้าง UI (UI Architecture Diagram)
                  </h4>
                </div>
                <pre className="p-3 bg-[#f3ead6] border border-[#d8c6aa] rounded-xs font-mono text-[11px] leading-tight overflow-x-auto text-[#331e10]">
{`┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. TOPBAR (.pe-topbar)                                                                           │
│  [Logo Frame: logo_favicon.png] [Brand Title / Sub] │ [Now Tracker: Step] │ [MANUAL v1.0 / Ver]  │
├──────────────────────────────┬─────────────────────────────────────────────────┬─────────────────┤
│ 2. SIDEBAR (.pe-sidebar)     │ 3. SIMULATION PANEL (.pe-simulation)            │ 4. OVERVIEW     │
│                              │    (Isometric Multi-Stream Canvas)              │    (.pe-overview│
│ • Panel Head & Tab Counts    │ • Head: [View Switcher: FLOW MAP / UI & SCENE]  │ • Tabs: STEP /  │
│ • Category: [ALL/SERVICE/EC] │ ┌─────────────────────────────────────────────┐ │   OVERVIEW      │
│ • Active Workflow Card       │ │ A. 13-NODE HOSPITAL FLOW MAP (3 Streams)    │ │ • Facts Card    │
│ • 9-Step List with Checks    │ │ B. PERSISTENT PET & OWNER + DYNAMIC PACKETS │ │ • Checkpoints   │
│                              │ │ C. INLINE CTA -> INSPECT UI & SCENE         │ │                 │
│                              │ └─────────────────────────────────────────────┘ │                 │
├──────────────────────────────┴─────────────────────────────────────────────────┴─────────────────┤
│ 5. WORKFLOW ACTION LOG / PACKETS PANEL (.pe-packets)                                             │
│ • Controls: [Speed 0.5x-2x] [Prev] [Play/Pause] [Step] [Reset] │ Legend: 6 Role/Status Dots      │
│ • Action Log Table: Step, Time, Actor, Location, KAHIS Module, Action Description, Ref Code      │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘`}
                </pre>
              </div>

              {/* Card 3: Button & Controls Action Directory */}
              <div className="p-4 bg-[#fcf8ee] border border-[#d8c6aa] rounded-xs shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-4 h-4 text-[#b4531a]" />
                  <h4 className="text-[15px] font-extrabold text-[#331e10] m-0">
                    3. รายละเอียดส่วนประกอบ ปุ่มควบคุม และโครงสร้าง 13 สถานี (Controls &amp; Node Directory)
                  </h4>
                </div>
                <div className="space-y-3 text-[12.5px] text-[#5c4028]">
                  <div className="bg-[#f9f3e5] p-2.5 rounded border border-[#e8dcc6]">
                    <strong className="text-[#331e10] block mb-1">โครงสร้างสถานีบริการและแผนกในโรงพยาบาล (13 Nodes &amp; 3 Streams):</strong>
                    <ul className="list-disc pl-4 space-y-1 m-0">
                      <li><strong>เส้นทางหลัก (Main Flow)</strong>: Entrance &gt; Registration &gt; Waiting Hall &gt; Exam Room (General: Zone A ห้อง 1,2,3 และ Zone B ห้อง 1,2,3) &gt; Tx Room &gt; Rx Room &gt; Cashier &gt; Pharmacy &gt; Exit</li>
                      <li><strong>แผนกตรวจคลินิก (Exam Departments)</strong>: General (Zone A/B), ER (ฉุกเฉิน), Sp. Clinic (คลินิกเฉพาะทาง), Surgery (ห้องผ่าตัด)</li>
                      <li><strong>หน่วยสนับสนุน (Support Units)</strong>: Registration, Tx Room (จัดยาฉีด/ฉีดยา/หัตถการ), Rx Room (จัดยานำกลับ), Xray/USG (เอกซเรย์และอัลตราซาวด์), Cashier (เก็บเงิน/Discharge Case), Pharmacy (จ่ายยา)</li>
                      <li><strong>3 เส้นทางการไหล (Multi-Stream Lanes)</strong>: แยกเส้นทางเคลื่อนที่ของ (1) Pet &amp; Owner ซึ่งแสดงจุดตำแหน่งตลอดเวลา, (2) Exam Card &amp; Sideflow และ (3) System Automation (เช่น หมอกดเรียกคิวระบบเปลี่ยนจอ/ส่งเสียง และหลังเก็บเงินระบบ Discharge Case เปลี่ยน Visit No. เป็น Inactive)</li>
                    </ul>
                  </div>

                  <div className="bg-[#f9f3e5] p-2.5 rounded border border-[#e8dcc6]">
                    <strong className="text-[#331e10] block mb-1">แผงควบคุมการเล่น (Playback Toolbar ด้านล่าง):</strong>
                    <ul className="list-disc pl-4 space-y-1 m-0">
                      <li><strong>ปุ่ม Speed (0.5× / 1× / 2×)</strong>: ปรับความเร็วรอบของแอนิเมชันการ์ดวิ่งและเวลาเปลี่ยนสเต็ปอัตโนมัติ (Action: สลับความเร็ว 0.5 เท่า, 1 เท่า, หรือ 2 เท่า)</li>
                      <li><strong>ปุ่มย้อนกลับ (‹)</strong>: ถอยหลัง 1 ขั้นตอน (Action: ลด currentStepIdx ทีละ 1, คีย์ลัด: <code className="bg-[#efe4ca] px-1 rounded">←</code>)</li>
                      <li><strong>ปุ่ม PLAY / PAUSE</strong>: เริ่มเล่นจำลองกระบวนการต่อเนื่อง 9 ขั้นตอน หรือหยุดชั่วคราว (Action: toggle playback timer, คีย์ลัด: <code className="bg-[#efe4ca] px-1 rounded">Space</code>)</li>
                      <li><strong>ปุ่ม STEP (›)</strong>: เดินหน้าทีละ 1 ขั้นตอนเพื่อวิเคราะห์อย่างละเอียด (Action: เพิ่ม currentStepIdx ทีละ 1, คีย์ลัด: <code className="bg-[#efe4ca] px-1 rounded">→</code>)</li>
                      <li><strong>ปุ่ม Reset (↺)</strong>: รีเซ็ตวงจรทั้งหมดกลับสู่ขั้นตอนที่ 1 พร้อมหยุดเล่นอัตโนมัติ (Action: reset step index to 0, คีย์ลัด: <code className="bg-[#efe4ca] px-1 rounded">R</code>)</li>
                      <li><strong>แถวตาราง Action Log</strong>: คลิกที่แถวเหตุการณ์ใดๆ เพื่อกระโดดไปยังขั้นตอนและสถานีนั้นทันที (Action: jumps to selected step)</li>
                    </ul>
                  </div>

                  <div className="bg-[#f9f3e5] p-2.5 rounded border border-[#e8dcc6]">
                    <strong className="text-[#331e10] block mb-1">มุมมอง Canvas แบบ Non-Modal และระบบกล้อง (Views &amp; Camera):</strong>
                    <ul className="list-disc pl-4 space-y-1 m-0">
                      <li><strong>ปุ่ม FLOW MAP</strong>: แสดงแผนผัง 13 สถานี พร้อมจุด Pet &amp; Owner ที่แสดงค้างตลอดเวลา และแอนิเมชันการ์ด Packet + ป้าย Callout Note ผุดขึ้นตามจังหวะ Action แบบเดียวกับ Protocol Explorer</li>
                      <li><strong>ระบบกล้อง CAMERA (STEP ZOOM vs FULL MAP)</strong>:
                        <ul className="list-disc pl-4 mt-1 space-y-0.5">
                          <li><strong>STEP ZOOM</strong>: ซูมและจัดมุมกล้องติดตามสถานีที่กำลังมี Action อัตโนมัติ พร้อมคัดกรองเฉพาะสถานีที่เกี่ยวข้องในแต่ละขั้นตอน</li>
                          <li><strong>FULL MAP (Zoom &amp; Pan)</strong>: แสดงผังครบทั้ง 13 สถานีและกรอบโซนโรงพยาบาล สามารถใช้<strong>ล้อเมาส์หมุนเพื่อซูมเข้า/ออก</strong> ณ ตำแหน่งเมาส์ (100% - 600%), <strong>คลิกเมาส์ซ้ายค้างแล้วลากเพื่อเลื่อนผัง (Pan)</strong> รวมถึงปุ่ม <code>+</code>, <code>−</code>, <code>RESET</code> โดยมุมกล้องจะคงตำแหน่งเดิมไว้ไม่ดีดกลับเมื่อเปลี่ยนสเต็ป</li>
                        </ul>
                      </li>
                      <li><strong>ปุ่มแนะนำดูหน้าจอ (Inspect UI &amp; Scene CTA)</strong>: แถบปุ่มด้านล่างใน FLOW MAP สำหรับกดสลับเข้าไปดูรายละเอียดหน้าจอระบบ KAHIS ในแท็บ UI &amp; SCENE โดยไม่ต้องเด้ง Modal ทับหน้าจอ</li>
                      <li><strong>ปุ่ม UI &amp; SCENE</strong>: มุมมองตรวจสอบหน้าจอ KAHIS EMR Wireframe คู่กับฉากคลินิก รองรับโหมด Split View, Full UI Screen, Full Clinic Scene และปุ่มซูม 100%-200% ภายใน Panel</li>
                    </ul>
                  </div>

                  <div className="bg-[#f9f3e5] p-2.5 rounded border border-[#e8dcc6]">
                    <strong className="text-[#331e10] block mb-1">แผงรายการและลิ้นชักข้อมูล (Sidebar &amp; Overview):</strong>
                    <ul className="list-disc pl-4 space-y-1 m-0">
                      <li><strong>แท็บหมวดหมู่ (ALL / SERVICE / EXAM CARD)</strong>: กรองชุดเวิร์กโฟลว์ตามขอบเขตงาน เช่น การบริการผู้ป่วยนอก หรือเจาะลึกแบบฟอร์มตรวจร่างกาย</li>
                      <li><strong>รายการขั้นตอน 1 - 9</strong>: คลิกเลือกดูขั้นตอนใดก็ได้ พร้อมสัญลักษณ์ Checkmark เมื่อขั้นตอนนั้นผ่านไปแล้ว</li>
                      <li><strong>แท็บ STEP DETAILS</strong>: ลิ้นชักแจกแจงบทบาทผู้รับผิดชอบ, สถานที่, ระบบ KAHIS ที่ใช้, บริบทคลินิก, และ Clinical Checkpoints</li>
                      <li><strong>แท็บ OVERVIEW</strong>: สรุปภาพรวมเชิงสถิติ ขอบเขต และจุดเชื่อมโยงของทั้ง Workflow</li>
                      <li><strong>ปุ่ม MANUAL v1.0 (Topbar)</strong>: เปิดหน้าต่างคู่มือสถาปัตยกรรมและวิธีใช้งานนี้ (Action: toggle manual modal, คีย์ลัด: <code className="bg-[#efe4ca] px-1 rounded">M</code>)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Card 4: Legend Dots Color Matrix */}
              <div className="p-4 bg-[#fcf8ee] border border-[#d8c6aa] rounded-xs shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#b4531a]" />
                  <h4 className="text-[15px] font-extrabold text-[#331e10] m-0">
                    4. ความหมายของจุดสีระบุสถานะและบทบาท (Legend Dots Matrix)
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-[12.5px]">
                  <div className="p-2 bg-[#f9f3e5] rounded border border-[#e8dcc6] flex items-start gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#8c5828] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#331e10]">Pet &amp; Owner (สีน้ำตาลทอง):</strong>
                      <div className="text-[11.5px] text-[#7a5a40]">เจ้าของสัตว์และสัตว์เลี้ยง ในขั้นตอนเดินทางมาถึง พักคอย และรับสัตว์กลับ</div>
                    </div>
                  </div>
                  <div className="p-2 bg-[#f9f3e5] rounded border border-[#e8dcc6] flex items-start gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#d97706] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#331e10]">Staff (สีเหลืองอำพัน):</strong>
                      <div className="text-[11.5px] text-[#7a5a40]">เจ้าหน้าที่เวชระเบียน, เจ้าหน้าที่ห้องยา และการเงิน ในการทำประวัติ จัดยา และรับชำระ</div>
                    </div>
                  </div>
                  <div className="p-2 bg-[#f9f3e5] rounded border border-[#e8dcc6] flex items-start gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#0284c7] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#331e10]">DVM (สีฟ้า):</strong>
                      <div className="text-[11.5px] text-[#7a5a40]">สัตวแพทย์ผู้ตรวจ ในขั้นตอนตรวจร่างกาย บันทึกเวชระเบียน วินิจฉัย และสั่งการรักษา</div>
                    </div>
                  </div>
                  <div className="p-2 bg-[#f9f3e5] rounded border border-[#e8dcc6] flex items-start gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#8b5cf6] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#331e10]">Sideflow (สีม่วง):</strong>
                      <div className="text-[11.5px] text-[#7a5a40]">กระบวนการแยกย่อยคู่ขนาน เช่น ส่งตรวจห้องแล็บ ส่งเอกซเรย์ หรือหัตถการพิเศษ</div>
                    </div>
                  </div>
                  <div className="p-2 bg-[#f9f3e5] rounded border border-[#e8dcc6] flex items-start gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#16a34a] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#331e10]">System (สีเขียว):</strong>
                      <div className="text-[11.5px] text-[#7a5a40]">ระบบอัตโนมัติ การเรียกคิวเข้าห้องตรวจ การเชื่อมโยงข้อมูล EMR และการออกใบเสร็จ</div>
                    </div>
                  </div>
                  <div className="p-2 bg-[#f9f3e5] rounded border border-[#e8dcc6] flex items-start gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#ea580c] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#331e10]">Alarm (สีส้ม):</strong>
                      <div className="text-[11.5px] text-[#7a5a40]">สัญญาณเตือนเหตุฉุกเฉิน เคสวิกฤต (Triage Red) แพ้ยา หรือข้อควรระวังสำคัญ</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 5: Fullstack & Techniques */}
              <div className="p-4 bg-[#fcf8ee] border border-[#d8c6aa] rounded-xs shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <Code2 className="w-4 h-4 text-[#b4531a]" />
                  <h4 className="text-[15px] font-extrabold text-[#331e10] m-0">
                    5. สถาปัตยกรรม Fullstack และเทคนิคการสร้าง (Techniques &amp; Engineering)
                  </h4>
                </div>
                <ul className="list-disc pl-5 space-y-1.5 text-[#5c4028] m-0">
                  <li><strong>Next.js 15.5+ &amp; React 19</strong>: พัฒนาด้วย TypeScript 5.7 แบบ Type-Safe 100% ประมวลผลแบบ Client-side Interactive Simulation</li>
                  <li><strong>Pure SVG 3D Isometric Math &amp; 13 Nodes</strong>: วาดแท่นสถานี 3 มิติ 13 จุดด้วยสมการระนาบ Polygon (Top, Left, Right Face) โดยไม่ต้องพึ่งพา 3D Library หนักๆ</li>
                  <li><strong>Dynamic SVG Camera &amp; Interactive Zoom/Pan</strong>: สถาปัตยกรรมกล้องผ่าน SVG <code>viewBox</code> แบบ 2 โหมด: โหมด STEP ZOOM เคลื่อนกล้องอัตโนมัติแบบ Cubic Ease-out (620ms) และโหมด FULL MAP ที่รองรับ Wheel Zoom รอบพิกัดเมาส์จริง พร้อม Drag-to-Pan ชดเชย Letterbox Offset และจำกัด Bounding Clamp ปลอดภัย</li>
                  <li><strong>Traveling Token &amp; Trailing Comet Tail</strong>: แอนิเมชันลูกแก้วเคลื่อนที่ระหว่างสถานีพร้อมแสงหางดาวตก 3 ระดับ Opacity และแท็ก Ref Code</li>
                  <li><strong>Dual Font Stack Parity</strong>: ใช้ <strong>Iosevka</strong> (Self-hosted 6 weights) สำหรับตัวเลข/รหัส/ภาษาอังกฤษ และ <strong>IBM Plex Sans Thai Looped</strong> สำหรับภาษาไทย</li>
                  <li><strong>Warm Earth-Tone Palette</strong>: ชุดสีโทนกระดาษสีเหลืองอุ่น (Parchment #F6EFE0) ผสานหมึกสีน้ำตาลเข้ม (Sepia #4A2E1B / Umber #331E10) เพื่อความสบายตา</li>
                </ul>
              </div>

              {/* Card 6: History */}
              <div className="p-4 bg-[#fcf8ee] border border-[#d8c6aa] rounded-xs shadow-xs">
                <div className="flex items-center gap-2 mb-2">
                  <History className="w-4 h-4 text-[#b4531a]" />
                  <h4 className="text-[15px] font-extrabold text-[#331e10] m-0">
                    6. ประวัติการปรับปรุงระบบ (Change History &amp; Evolution)
                  </h4>
                </div>
                <div className="space-y-2 text-[12.5px]">
                  <div className="border-l-2 border-[#b4531a] pl-3">
                    <strong className="text-[#b4531a]">Version 1.1.0 (Current)</strong>: เพิ่มระบบ Interactive Zoom &amp; Pan บนโหมด FULL MAP (ล้อเมาส์ซูม 100%–600%, คลิกลากเลื่อนผัง, ปุ่ม +, −, RESET), กล้องคงตำแหน่งไม่ดีดกลับเมื่อเล่น Step, คำนวณพิกัดชดเชย Letterbox แม่นยำ
                  </div>
                  <div className="border-l-2 border-[#a68664] pl-3">
                    <strong className="text-[#7a5a40]">Version 1.0.0</strong>: ปรับจุดสีสถานะใหม่ 6 สี (DVM ฟ้า, Sideflow ม่วง, Alarm ส้ม, Pet &amp; Owner, Staff, System), ปรับขนาดและชนิดฟอนต์เทียบเท่า Protocol Explorer, ฝังฟอนต์ Iosevka + IBM Plex Sans Thai Looped, เปลี่ยนระบบสีเป็น Warm Earth-Tone &amp; Brown Ink, ปรับโลโก้เต็มกรอบ และเพิ่มสารบรรณปุ่มในคู่มือระบบ
                  </div>
                  <div className="border-l-2 border-[#a68664] pl-3">
                    <strong className="text-[#7a5a40]">Version 0.5.0</strong>: เพิ่มโมดูล Lightbox Modal ขยายภาพเต็มจอ, ผนวกภาพวาด Minimalist Line-Art 17 ภาพ และผังเชื่อมต่อ KAHIS EMR Wireframe 7 หน้าจอ
                  </div>
                  <div className="border-l-2 border-[#d8c6aa] pl-3">
                    <strong className="text-[#9c7b5e]">Version 0.1.0</strong>: Prototype แผนผัง 4-Panel Grid, 5 สถานีบริการ และกระบวนการตรวจรักษา 9 ขั้นตอน
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="h-12 px-5 bg-[#f3ead6] border-t border-[#d8c6aa] flex items-center justify-between text-xs text-[#5c4028]">
              <span>KAHIS Clinical Workflow Explorer · Version 1.0 (Release)</span>
              <button
                type="button"
                onClick={() => setIsManualOpen(false)}
                className="px-4 py-1.5 bg-[#fcf8ee] border border-[#a68664] rounded-xs font-extrabold text-[#331e10] hover:bg-[#efe4ca] cursor-pointer"
              >
                ปิดคู่มือ (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
