"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  STATIONS,
  STATION_LANES,
  WorkflowStep,
  RoleTone
} from "@/lib/workflow-explorer/workflow-data";
import {
  ArrowRight,
  ArrowLeft,
  Layers,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface IsometricCanvasProps {
  currentStep: WorkflowStep;
  viewMode: "flow" | "scene";
  playbackSpeed?: number;
  animKey?: number;
  onSelectStep?: (stepId: number) => void;
  onSwitchView?: (mode: "flow" | "scene") => void;
}

const FULL_VIEWBOX: [number, number, number, number] = [0, 0, 1150, 565];
const ASPECT = 1150 / 565;

interface StationVisualPalette {
  top: string;
  topActive: string;
  left: string;
  leftActive: string;
  right: string;
  rightActive: string;
  stroke: string;
  strokeActive: string;
  textTitle: string;
  textSubtitle: string;
}

const STATION_PALETTES: Record<string, StationVisualPalette> = {
  // 1. Entrance: Warm brown (สีน้ำตาลเดิม)
  entrance: {
    top: "#fcf6ed",
    topActive: "#fbeed6",
    left: "#e4cdac",
    leftActive: "#dfbe92",
    right: "#dfc5a0",
    rightActive: "#d2a873",
    stroke: "#8c5828",
    strokeActive: "#b4531a",
    textTitle: "#331e10",
    textSubtitle: "#7a5a40"
  },
  // 2. Registration: Darker green tone (เขียวเข้มกว่า sp. clinic / surgery)
  registration: {
    top: "#e6f9ee",
    topActive: "#c7f3d6",
    left: "#86efac",
    leftActive: "#4ade80",
    right: "#6ee7b7",
    rightActive: "#34d399",
    stroke: "#15803d",
    strokeActive: "#14532d",
    textTitle: "#14532d",
    textSubtitle: "#15803d"
  },
  // 3. ER: Orange / Red emergency tone (วางคู่กับ waiting hall)
  examEr: {
    top: "#fef2f2",
    topActive: "#fee2e2",
    left: "#fca5a5",
    leftActive: "#f87171",
    right: "#f87171",
    rightActive: "#ef4444",
    stroke: "#dc2626",
    strokeActive: "#b91c1c",
    textTitle: "#7f1d1d",
    textSubtitle: "#991b1b"
  },
  // 4. Waiting Zone: Light brown (สีน้ำตาลอ่อนกว่า entrance)
  waitingHall: {
    top: "#fffcf7",
    topActive: "#fdf4e4",
    left: "#f3ebd9",
    leftActive: "#ebd8bd",
    right: "#ebdcc7",
    rightActive: "#dec49f",
    stroke: "#bfa688",
    strokeActive: "#b4531a",
    textTitle: "#4a2e1b",
    textSubtitle: "#7a5a40"
  },
  // 5. Exam Room (General): Light blue tone (สีโทนฟ้า)
  examGeneral: {
    top: "#f0f9ff",
    topActive: "#e0f2fe",
    left: "#bae6fd",
    leftActive: "#7dd3fc",
    right: "#93c5fd",
    rightActive: "#60a5fa",
    stroke: "#0284c7",
    strokeActive: "#0369a1",
    textTitle: "#0c4a6e",
    textSubtitle: "#0369a1"
  },
  // 6. SP. Clinic: Deep blue tone (สีฟ้าเข้มกว่า general)
  examSp: {
    top: "#eff6ff",
    topActive: "#dbeafe",
    left: "#93c5fd",
    leftActive: "#60a5fa",
    right: "#60a5fa",
    rightActive: "#3b82f6",
    stroke: "#1d4ed8",
    strokeActive: "#1e40af",
    textTitle: "#1e3a8a",
    textSubtitle: "#1d4ed8"
  },
  // 6b. Surgery: Light green (เขียว อ่อนกว่า register)
  surgery: {
    top: "#f7fee7",
    topActive: "#ecfccb",
    left: "#d9f99d",
    leftActive: "#bef264",
    right: "#bef264",
    rightActive: "#a3e635",
    stroke: "#4d7c0f",
    strokeActive: "#3f6212",
    textTitle: "#365314",
    textSubtitle: "#4d7c0f"
  },
  // 7. Xray / USG: Dark yellow / Amber (สีเหลืองเข้ม)
  xrayUsg: {
    top: "#fefce8",
    topActive: "#fef08a",
    left: "#fde047",
    leftActive: "#facc15",
    right: "#eab308",
    rightActive: "#ca8a04",
    stroke: "#a16207",
    strokeActive: "#854d0e",
    textTitle: "#713f12",
    textSubtitle: "#854d0e"
  },
  // 7b. Tx Room: Light / Pale yellow (สีเหลืองจาง)
  txRoom: {
    top: "#fffef0",
    topActive: "#fef9c3",
    left: "#fef08a",
    leftActive: "#fde047",
    right: "#fde047",
    rightActive: "#facc15",
    stroke: "#ca8a04",
    strokeActive: "#a16207",
    textTitle: "#713f12",
    textSubtitle: "#854d0e"
  },
  // 8. Rx Room: Pale / Light purple (ห้องจัดยานำกลับ ใช้กล่องสีม่วงจาง)
  rxRoom: {
    top: "#faf5ff",
    topActive: "#f3e8ff",
    left: "#e9d5ff",
    leftActive: "#d8b4fe",
    right: "#d8b4fe",
    rightActive: "#c084fc",
    stroke: "#8b5cf6",
    strokeActive: "#7c3aed",
    textTitle: "#4c1d95",
    textSubtitle: "#6d28d9"
  },
  // 9. Cashier: Deep royal purple (เก็บเงิน/ใบเสร็จ/check-out ใช้กล่องสีม่วงเข้ม)
  cashier: {
    top: "#f5f3ff",
    topActive: "#ede9fe",
    left: "#c084fc",
    leftActive: "#a855f7",
    right: "#a855f7",
    rightActive: "#9333ea",
    stroke: "#6b21a8",
    strokeActive: "#581c87",
    textTitle: "#3b0764",
    textSubtitle: "#581c87"
  },
  // 10. Pharmacy: Same purple as rxRoom (วางคู่กับ Rx ใช้สีม่วงเดียวกับ rx)
  pharmacy: {
    top: "#faf5ff",
    topActive: "#f3e8ff",
    left: "#e9d5ff",
    leftActive: "#d8b4fe",
    right: "#d8b4fe",
    rightActive: "#c084fc",
    stroke: "#8b5cf6",
    strokeActive: "#7c3aed",
    textTitle: "#4c1d95",
    textSubtitle: "#6d28d9"
  },
  // 11. Exit: Cool slate / Stone tone (แนวระนาบเดียวกับทางเข้า ด้านขวา ของแมพ)
  exit: {
    top: "#f8fafc",
    topActive: "#f1f5f9",
    left: "#e2e8f0",
    leftActive: "#cbd5e1",
    right: "#cbd5e1",
    rightActive: "#94a3b8",
    stroke: "#475569",
    strokeActive: "#334155",
    textTitle: "#1e293b",
    textSubtitle: "#475569"
  }
};

function getStepFocusNodeIds(step: WorkflowStep): Set<string> {
  return new Set<string>([
    step.fromNode,
    step.toNode,
    step.petOwner.fromNode,
    step.petOwner.toNode,
    ...step.stationNotes.map((n) => n.nodeId),
    ...step.packets.flatMap((p) => [p.fromNode, p.toNode])
  ]);
}

function computeStepCameraBox(
  step: WorkflowStep,
  autoZoom: boolean
): [number, number, number, number] {
  if (!autoZoom) return FULL_VIEWBOX;

  const focusNodeIds = getStepFocusNodeIds(step);

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  focusNodeIds.forEach((id) => {
    const st = STATIONS[id];
    if (!st) return;
    minX = Math.min(minX, st.x - 102);
    maxX = Math.max(maxX, st.x + 102);
    minY = Math.min(minY, st.y - 98);
    maxY = Math.max(maxY, st.y + (st.zones ? 82 : 48));
  });

  step.stationNotes.forEach((note) => {
    const st = STATIONS[note.nodeId];
    if (!st) return;
    const nx = st.x + (note.offsetX ?? 0);
    const ny = st.y + (note.offsetY ?? -68);
    minX = Math.min(minX, nx - 92);
    maxX = Math.max(maxX, nx + 92);
    minY = Math.min(minY, ny - 26);
    maxY = Math.max(maxY, ny + 26);
  });

  step.packets
    .filter((p) => p.stream !== "owner")
    .forEach((pkt) => {
      const toSt = STATIONS[pkt.toNode];
      if (!toSt) return;
      const ex = toSt.x + (pkt.stopOffsetX ?? 0);
      const ey = toSt.y + (pkt.stopOffsetY ?? -68);
      minX = Math.min(minX, ex - 70);
      maxX = Math.max(maxX, ex + 70);
      minY = Math.min(minY, ey - 24);
      maxY = Math.max(maxY, ey + 24);
    });

  if (!isFinite(minX)) return FULL_VIEWBOX;

  const padX = 28;
  const padY = 22;
  let boxW = Math.max(430, maxX - minX + padX * 2);
  let boxH = Math.max(213, maxY - minY + padY * 2);

  if (boxW / boxH > ASPECT) {
    boxH = boxW / ASPECT;
  } else {
    boxW = boxH * ASPECT;
  }

  boxW = Math.min(1140, boxW);
  boxH = Math.min(565, boxH);

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const x = Math.max(-45, Math.min(1160 - boxW, centerX - boxW / 2));
  const y = Math.max(0, Math.min(565 - boxH, centerY - boxH / 2));

  return [x, y, boxW, boxH];
}

// ---- Manual camera (FULL MAP zoom & pan) helpers ----
const MIN_BOX_W = 190; // ~600% max zoom
const MAX_BOX_W = 1150; // full map
const WHEEL_SENSITIVITY = 0.0015;

type CamBox = [number, number, number, number];

function clampCamBox(x: number, y: number, w: number): CamBox {
  const bw = Math.max(MIN_BOX_W, Math.min(MAX_BOX_W, w));
  const bh = bw / ASPECT;
  const cx = Math.max(-45, Math.min(Math.max(-45, 1160 - bw), x));
  const cy = Math.max(0, Math.min(Math.max(0, 565 - bh), y));
  return [cx, cy, bw, bh];
}

// Zoom keeping the world point (px, py) fixed on screen
function zoomCamBox(box: CamBox, factor: number, px: number, py: number): CamBox {
  const newW = Math.max(MIN_BOX_W, Math.min(MAX_BOX_W, box[2] / factor));
  const ratio = newW / box[2];
  return clampCamBox(px - (px - box[0]) * ratio, py - (py - box[1]) * ratio, newW);
}

// SVG uses preserveAspectRatio="xMidYMid meet": compute px -> world unit scale & letterbox offset
function getSvgMetrics(svg: SVGSVGElement, box: CamBox) {
  const rect = svg.getBoundingClientRect();
  const scale = Math.min(rect.width / box[2], rect.height / box[3]) || 1;
  const offX = (rect.width - box[2] * scale) / 2;
  const offY = (rect.height - box[3] * scale) / 2;
  return { rect, scale, offX, offY };
}

const TONE_PALETTE: Record<
  RoleTone,
  { dot: string; bg: string; border: string; text: string; badgeBg: string }
> = {
  owner: {
    dot: "#8c5828",
    bg: "#fcf5eb",
    border: "#8c5828",
    text: "#331e10",
    badgeBg: "#8c5828"
  },
  staff: {
    dot: "#d97706",
    bg: "#fffbeb",
    border: "#d97706",
    text: "#4a2e1b",
    badgeBg: "#d97706"
  },
  dvm: {
    dot: "#0284c7",
    bg: "#f0f9ff",
    border: "#0284c7",
    text: "#0c4a6e",
    badgeBg: "#0284c7"
  },
  sideflow: {
    dot: "#8b5cf6",
    bg: "#f5f3ff",
    border: "#8b5cf6",
    text: "#4c1d95",
    badgeBg: "#8b5cf6"
  },
  system: {
    dot: "#16a34a",
    bg: "#f0fdf4",
    border: "#16a34a",
    text: "#14532d",
    badgeBg: "#16a34a"
  },
  alarm: {
    dot: "#ea580c",
    bg: "#fff7ed",
    border: "#ea580c",
    text: "#7c2d12",
    badgeBg: "#ea580c"
  }
};

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function IsometricCanvas({
  currentStep,
  viewMode,
  playbackSpeed = 1,
  animKey = 0,
  onSwitchView
}: IsometricCanvasProps) {
  const [selectedWireframeIdx, setSelectedWireframeIdx] = useState(0);
  const [sceneLayout, setSceneLayout] = useState<"split" | "ui-only" | "scene-only">("split");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isAutoZoom, setIsAutoZoom] = useState<boolean>(true);
  const [camBox, setCamBox] = useState<[number, number, number, number]>(() =>
    computeStepCameraBox(currentStep, true)
  );
  const camBoxRef = useRef<[number, number, number, number]>(camBox);

  // Animation progress (0 -> 1) driven by requestAnimationFrame (one-shot per step, stops at destination)
  const [animProgress, setAnimProgress] = useState<number>(0);
  const [packetProgress, setPacketProgress] = useState<number>(0);
  const [step3PacketVisible, setStep3PacketVisible] = useState<boolean>(false);
  const [step3GreenLaneActive, setStep3GreenLaneActive] = useState<boolean>(false);
  const [step3PulseNode, setStep3PulseNode] = useState<string>("examGeneral");
  const [step3CustomStatus, setStep3CustomStatus] = useState<string>("");
  const rafRef = useRef<number | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const camRafRef = useRef<number | null>(null);
  const dragRef = useRef<{
    startClientX: number;
    startClientY: number;
    box: CamBox;
    scale: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const cancelCamAnimation = () => {
    if (camRafRef.current !== null) {
      cancelAnimationFrame(camRafRef.current);
      camRafRef.current = null;
    }
  };

  const applyCamBox = (box: CamBox) => {
    camBoxRef.current = box;
    setCamBox(box);
  };

  // In STEP ZOOM mode the camera follows the step. In FULL MAP mode the camera is user-controlled,
  // so step changes must NOT re-run the camera animation (it would reset the user's zoom/pan).
  const camFollowStep: WorkflowStep | null = isAutoZoom ? currentStep : null;

  // Smooth Camera Zoom & Pan interpolation when step (STEP ZOOM) or camera mode changes
  useEffect(() => {
    const startBox: [number, number, number, number] = [...camBoxRef.current];
    const targetBox = camFollowStep
      ? computeStepCameraBox(camFollowStep, true)
      : FULL_VIEWBOX;
    let camStart: number | null = null;
    let camRaf: number | null = null;
    const camDuration = 620;

    const animateCamera = (ts: number) => {
      if (camStart === null) camStart = ts;
      const t = Math.min(1, (ts - camStart) / camDuration);
      const ease = 1 - Math.pow(1 - t, 3);
      const nextBox: [number, number, number, number] = [
        startBox[0] + (targetBox[0] - startBox[0]) * ease,
        startBox[1] + (targetBox[1] - startBox[1]) * ease,
        startBox[2] + (targetBox[2] - startBox[2]) * ease,
        startBox[3] + (targetBox[3] - startBox[3]) * ease
      ];
      camBoxRef.current = nextBox;
      setCamBox(nextBox);
      if (t < 1) {
        camRaf = requestAnimationFrame(animateCamera);
        camRafRef.current = camRaf;
      } else {
        camRafRef.current = null;
      }
    };

    camRaf = requestAnimationFrame(animateCamera);
    camRafRef.current = camRaf;
    return () => {
      if (camRaf !== null) cancelAnimationFrame(camRaf);
      if (camRafRef.current === camRaf) camRafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camFollowStep]);

  // Mouse wheel zoom (FULL MAP only). Native non-passive listener so we can preventDefault page scroll.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || viewMode !== "flow" || isAutoZoom) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cancelCamAnimation();
      const box = camBoxRef.current;
      const { rect, scale, offX, offY } = getSvgMetrics(svg, box);
      const px = box[0] + (e.clientX - rect.left - offX) / scale;
      const py = box[1] + (e.clientY - rect.top - offY) / scale;
      const factor = Math.exp(-e.deltaY * WHEEL_SENSITIVITY);
      applyCamBox(zoomCamBox(box, factor, px, py));
    };

    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, isAutoZoom]);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isAutoZoom || e.button !== 0 || !svgRef.current) return;
    cancelCamAnimation();
    const box = camBoxRef.current;
    const { scale } = getSvgMetrics(svgRef.current, box);
    dragRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      box: [...box],
      scale
    };
    svgRef.current.setPointerCapture(e.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = (e.clientX - d.startClientX) / d.scale;
    const dy = (e.clientY - d.startClientY) / d.scale;
    applyCamBox(clampCamBox(d.box[0] - dx, d.box[1] - dy, d.box[2]));
  };

  const handlePointerEnd = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setIsDragging(false);
    if (svgRef.current?.hasPointerCapture(e.pointerId)) {
      svgRef.current.releasePointerCapture(e.pointerId);
    }
  };

  // Button zoom around the center of the current view
  const handleZoomButton = (factor: number) => {
    cancelCamAnimation();
    const box = camBoxRef.current;
    applyCamBox(zoomCamBox(box, factor, box[0] + box[2] / 2, box[1] + box[3] / 2));
  };

  const handleResetFullMap = () => {
    cancelCamAnimation();
    applyCamBox([...FULL_VIEWBOX]);
  };

  // Reset wireframe tab when step changes
  useEffect(() => {
    setSelectedWireframeIdx(0);
    setZoomLevel(1);
    if (currentStep.uiWireframes.length === 0 && sceneLayout === "ui-only") {
      setSceneLayout("split");
    }
  }, [currentStep.id, currentStep.uiWireframes.length, sceneLayout]);

  // Smooth RAF animation for Persistent Pet & Owner + Moving Packets
  useEffect(() => {
    let startTime: number | null = null;
    const isStep3 = currentStep.id === 3;

    // Standard step durations
    const transitionDuration = 1150 / playbackSpeed;
    const packetDuration = 1250 / playbackSpeed;

    // Step 3 phased timeline durations (scaled by playbackSpeed)
    const tCallQueue = 950 / playbackSpeed;
    const tSignalArrive = 2150 / playbackSpeed;
    const tPetStart = 2600 / playbackSpeed;
    const tPetArrive = 3850 / playbackSpeed;
    const tStep3Total = 4200 / playbackSpeed;

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (isStep3) {
        if (elapsed < tCallQueue) {
          // 1. Show Pet at waiting hall, system queue display, DVM call queue (DVM pulses)
          setAnimProgress(0);
          setPacketProgress(0);
          setStep3PacketVisible(false);
          setStep3GreenLaneActive(false);
          setStep3PulseNode("examGeneral");
          setStep3CustomStatus("นั่งรอเรียกคิวที่ Waiting Hall (คิว WA001) · สัตวแพทย์กดเรียกคิว");
        } else if (elapsed < tSignalArrive) {
          // 2. Green arrow & system call moves from exam room to waiting hall
          setAnimProgress(0);
          const frac = Math.min(1, (elapsed - tCallQueue) / (tSignalArrive - tCallQueue));
          setPacketProgress(easeInOutCubic(frac));
          setStep3PacketVisible(true);
          setStep3GreenLaneActive(true);
          setStep3PulseNode(frac > 0.6 ? "waitingHall" : "examGeneral");
          setStep3CustomStatus("ระบบส่งสัญญาณเรียกคิวและเสียงประกาศ WA001 -> โถงพักคอย");
        } else if (elapsed < tPetStart) {
          // 2. Pause at waiting hall: TV screen updated, voice announced (Waiting Hall pulses)
          setAnimProgress(0);
          setPacketProgress(1);
          setStep3PacketVisible(true);
          setStep3GreenLaneActive(true);
          setStep3PulseNode("waitingHall");
          setStep3CustomStatus("จอ TV อัปเดตคิว WA001 เข้าตรวจ Zone A ห้อง 1 · เจ้าของเตรียมพาสัตว์เข้าห้อง");
        } else if (elapsed < tPetArrive) {
          // 3. Pet & Owner moves to exam room; when reaching, system call disappears
          const petFrac = Math.min(1, (elapsed - tPetStart) / (tPetArrive - tPetStart));
          setAnimProgress(easeInOutCubic(petFrac));
          setPacketProgress(1);
          setStep3PacketVisible(petFrac < 0.88);
          setStep3GreenLaneActive(petFrac < 0.7);
          setStep3PulseNode(petFrac > 0.65 ? "examGeneral" : "waitingHall");
          setStep3CustomStatus("เดินเข้าห้องตรวจ Exam Room (General · Zone A ห้อง 1)");
        } else {
          // 3. Reached exam room: system call gone, exam room pulses
          setAnimProgress(1);
          setPacketProgress(1);
          setStep3PacketVisible(false);
          setStep3GreenLaneActive(false);
          setStep3PulseNode("examGeneral");
          setStep3CustomStatus("เข้าห้องตรวจเรียบร้อย (Zone A ห้อง 1) · สัตวแพทย์เริ่มตรวจ");
        }

        if (elapsed < tStep3Total) {
          rafRef.current = requestAnimationFrame(tick);
        }
      } else {
        const tMove = Math.min(1, elapsed / transitionDuration);
        setAnimProgress(easeInOutCubic(tMove));

        const tPkt = Math.min(1, elapsed / packetDuration);
        setPacketProgress(easeInOutCubic(tPkt));

        if (tMove < 1 || tPkt < 1) {
          rafRef.current = requestAnimationFrame(tick);
        }
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [currentStep.id, playbackSpeed, animKey]);

  // Persistent Pet & Owner interpolated coordinates
  const ownerFrom = STATIONS[currentStep.petOwner.fromNode] || STATIONS.entrance;
  const ownerTo = STATIONS[currentStep.petOwner.toNode] || ownerFrom;
  const ownerX = ownerFrom.x + (ownerTo.x - ownerFrom.x) * animProgress;
  const ownerY = ownerFrom.y + (ownerTo.y - ownerFrom.y) * animProgress;

  // Focused nodes for the active step
  const stepFocusNodeIds = getStepFocusNodeIds(currentStep);

  // Determine which nodes have active pulses in this step (coordinated with action)
  const pulsedNodeIds = currentStep.id === 3
    ? new Set<string>([step3PulseNode])
    : new Set<string>([
        currentStep.fromNode,
        currentStep.toNode,
        currentStep.petOwner.toNode,
        ...currentStep.stationNotes.map((n) => n.nodeId)
      ]);

  const currentZoomPct = Math.round((MAX_BOX_W / camBox[2]) * 100);

  return (
    <div className="pe-sim-container w-full h-full relative flex flex-col">
      {/* =========================================================================
          VIEW 1: FLOW MAP (Protocol-Explorer Style Multi-Lane & Action Animation)
          ========================================================================= */}
      {viewMode === "flow" && (
        <div className="relative w-full h-full flex flex-col overflow-hidden">
          {/* Top Stream Legend Bar + Camera Zoom Controls */}
          <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 px-3.5 py-1.5 bg-[#f4ebd9] border-b border-[#d8c6aa]">
            <div className="flex flex-wrap items-center gap-3.5">
              <span className="text-[11px] font-extrabold text-[#331e10] tracking-wider">
                MULTI-STREAM LANES:
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#4a2e1b]">
                <span className="w-4 h-0.5 bg-[#8c5828] inline-block" />
                Pet &amp; Owner (แสดงตลอด)
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#0c4a6e]">
                <span className="w-4 h-0.5 border-b-2 border-dashed border-[#0284c7] inline-block" />
                Exam Card / Order
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#4c1d95]">
                <span className="w-4 h-0.5 border-b-2 border-dashed border-[#8b5cf6] inline-block" />
                Sideflow (Xray/USG &amp; Depts)
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-[#14532d]">
                <span className="w-4 h-0.5 border-b-2 border-dotted border-[#16a34a] inline-block" />
                System Call &amp; Discharge
              </span>
            </div>

            {/* Camera Zoom Mode Toggle (Auto-Focus vs Full Map) */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold text-[#7a5a40] mr-1">
                CAMERA ({currentZoomPct}%):
              </span>
              <button
                type="button"
                onClick={() => setIsAutoZoom(true)}
                className={`px-2 py-0.5 text-[11px] font-extrabold rounded-xs border cursor-pointer transition flex items-center gap-1 ${
                  isAutoZoom
                    ? "bg-[#b4531a] text-[#fcf8ee] border-[#b4531a]"
                    : "bg-[#fcf8ee] text-[#4a2e1b] border-[#d8c6aa] hover:bg-[#efe4ca]"
                }`}
                title="ซูมและเลื่อนกล้องตามขั้นตอนอัตโนมัติ"
              >
                <ZoomIn className="w-3 h-3" />
                <span>STEP ZOOM</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAutoZoom(false)}
                className={`px-2 py-0.5 text-[11px] font-extrabold rounded-xs border cursor-pointer transition flex items-center gap-1 ${
                  !isAutoZoom
                    ? "bg-[#331e10] text-[#fcf8ee] border-[#331e10]"
                    : "bg-[#fcf8ee] text-[#4a2e1b] border-[#d8c6aa] hover:bg-[#efe4ca]"
                }`}
                title="ดูแผนผังเต็มทั้งโรงพยาบาล (100%)"
              >
                <Maximize2 className="w-3 h-3" />
                <span>FULL MAP</span>
              </button>
              {!isAutoZoom && (
                <>
                  <button
                    type="button"
                    onClick={() => handleZoomButton(1 / 1.35)}
                    className="px-1.5 py-0.5 rounded-xs border border-[#d8c6aa] bg-[#fcf8ee] text-[#4a2e1b] hover:bg-[#efe4ca] cursor-pointer"
                    title="ซูมออก"
                  >
                    <ZoomOut className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleZoomButton(1.35)}
                    className="px-1.5 py-0.5 rounded-xs border border-[#d8c6aa] bg-[#fcf8ee] text-[#4a2e1b] hover:bg-[#efe4ca] cursor-pointer"
                    title="ซูมเข้า"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetFullMap}
                    className="px-2 py-0.5 text-[11px] font-extrabold rounded-xs border border-[#d8c6aa] bg-[#fcf8ee] text-[#4a2e1b] hover:bg-[#efe4ca] cursor-pointer"
                    title="รีเซ็ตมุมมองเป็นแผนผังเต็ม 100%"
                  >
                    RESET
                  </button>
                  <span className="text-[10.5px] font-bold text-[#7a5a40] ml-1">
                    ล้อเมาส์ = ซูม · ลาก = เลื่อน
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Center SVG Canvas with Dynamic Camera viewBox */}
          <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
            <svg
              viewBox={`${camBox[0].toFixed(1)} ${camBox[1].toFixed(1)} ${camBox[2].toFixed(
                1
              )} ${camBox[3].toFixed(1)}`}
              ref={svgRef}
              className="w-full h-full select-none"
              style={{
                maxHeight: "100%",
                touchAction: isAutoZoom ? "auto" : "none",
                cursor: isAutoZoom ? "default" : isDragging ? "grabbing" : "grab"
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
            >
            <defs>
              {/* Arrowhead markers per stream */}
              <marker
                id="arrow-muted"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="5.5"
                markerHeight="5.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#b89f7d" />
              </marker>

              <marker
                id="arrow-owner"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6.5"
                markerHeight="6.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#8c5828" />
              </marker>

              <marker
                id="arrow-card"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6.5"
                markerHeight="6.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284c7" />
              </marker>

              <marker
                id="arrow-sideflow"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6.5"
                markerHeight="6.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#8b5cf6" />
              </marker>

              <marker
                id="arrow-system"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6.5"
                markerHeight="6.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#16a34a" />
              </marker>

              {/* Gradients for 3D Isometric Station Platforms */}
              <linearGradient id="iso-top" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fcf6e8" />
                <stop offset="100%" stopColor="#ead8ba" />
              </linearGradient>

              <linearGradient id="iso-top-active" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fdecc8" />
                <stop offset="100%" stopColor="#e5be86" />
              </linearGradient>

              <linearGradient id="iso-top-dept" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#eef8ff" />
                <stop offset="100%" stopColor="#d4e8f7" />
              </linearGradient>
            </defs>

            {/* Zone Grouping Background Bands (Shown in Full Map mode only so they don't clutter Step Zoom) */}
            {!isAutoZoom && (
              <g opacity="0.6">
                {/* Emergency Care (ER) Box (Paired above Waiting Zone) */}
                <rect
                  x="295"
                  y="65"
                  width="140"
                  height="145"
                  rx="6"
                  fill="#fff5f5"
                  stroke="#f87171"
                  strokeDasharray="4 3"
                />
                <text
                  x="365"
                  y="84"
                  textAnchor="middle"
                  fontSize="9.6"
                  fontWeight="800"
                  letterSpacing="0.06em"
                  fill="#b91c1c"
                >
                  EMERGENCY CARE (ER)
                </text>

                {/* Top Band: Special Clinic & Surgery Departments */}
                <rect
                  x="475"
                  y="65"
                  width="340"
                  height="145"
                  rx="6"
                  fill="#f0f7ff"
                  stroke="#93c5fd"
                  strokeDasharray="5 4"
                />
                <text
                  x="490"
                  y="84"
                  fontSize="9.8"
                  fontWeight="800"
                  letterSpacing="0.06em"
                  fill="#1d4ed8"
                >
                  SPECIAL CLINIC / DEPARTMENTS ZONE (SP. CLINIC &amp; SURGERY)
                </text>

                {/* Bottom Band: Support Zone (XRAY / USG & TX ROOM) */}
                <rect
                  x="475"
                  y="405"
                  width="340"
                  height="145"
                  rx="6"
                  fill="#fefce8"
                  stroke="#facc15"
                  strokeDasharray="5 4"
                />
                <text
                  x="490"
                  y="424"
                  fontSize="9.8"
                  fontWeight="800"
                  letterSpacing="0.06em"
                  fill="#a16207"
                >
                  SUPPORT ZONE (XRAY / USG &amp; TX ROOM)
                </text>

                {/* Vertical Band: Pharmacy & Rx Unit (Vertical Pairing) */}
                <rect
                  x="825"
                  y="90"
                  width="160"
                  height="285"
                  rx="6"
                  fill="#faf5ff"
                  stroke="#d8b4fe"
                  strokeDasharray="5 4"
                />
                <text
                  x="905"
                  y="110"
                  textAnchor="middle"
                  fontSize="9.6"
                  fontWeight="800"
                  letterSpacing="0.05em"
                  fill="#7e22ce"
                >
                  PHARMACY &amp; RX UNIT
                </text>
              </g>
            )}

            {/* =================================================================
                LAYER 1: MULTI-STREAM LANES (<g className="lanes">)
                In STEP ZOOM mode, only render lanes active in or connecting focused stations
                ================================================================= */}
            <g className="lanes">
              {STATION_LANES.filter((lane) => {
                if (!isAutoZoom) return true;
                return (
                  currentStep.activeLanes.includes(lane.id) ||
                  lane.id === currentStep.laneId ||
                  (stepFocusNodeIds.has(lane.from) && stepFocusNodeIds.has(lane.to))
                );
              }).map((lane) => {
                let isActive =
                  currentStep.activeLanes.includes(lane.id) ||
                  lane.id === currentStep.laneId;

                // Step 3: green system lane activates only when system signal is sent in Phase 2
                if (currentStep.id === 3 && lane.stream === "system") {
                  isActive = step3GreenLaneActive;
                }
                // Step 3: owner walkway lane activates when pet starts walking
                if (currentStep.id === 3 && lane.stream === "owner") {
                  isActive = animProgress > 0.02;
                }

                let strokeColor = "#c6b193";
                let dashArray = "4 4";
                let marker = "url(#arrow-muted)";
                let strokeW = isActive ? 2.8 : 1.5;

                if (lane.stream === "owner") {
                  strokeColor = isActive ? "#8c5828" : "#bfa688";
                  dashArray = isActive ? "none" : "6 4";
                  marker = isActive ? "url(#arrow-owner)" : "url(#arrow-muted)";
                  strokeW = isActive ? 3.2 : 1.8;
                } else if (lane.stream === "exam-card") {
                  strokeColor = isActive ? "#0284c7" : "#9db8c9";
                  dashArray = "7 4";
                  marker = isActive ? "url(#arrow-card)" : "url(#arrow-muted)";
                } else if (lane.stream === "sideflow") {
                  strokeColor = isActive ? "#8b5cf6" : "#b9add4";
                  dashArray = "6 4";
                  marker = isActive ? "url(#arrow-sideflow)" : "url(#arrow-muted)";
                } else if (lane.stream === "system") {
                  strokeColor = isActive ? "#16a34a" : "#9ec4ab";
                  dashArray = "3 4";
                  marker = isActive ? "url(#arrow-system)" : "url(#arrow-muted)";
                }

                const laneOpacity =
                  currentStep.id === 3 && lane.stream === "system" && !step3GreenLaneActive
                    ? 0.08
                    : isActive
                    ? 1
                    : 0.55;

                return (
                  <g key={lane.id}>
                    {isActive && (
                      <path
                        d={lane.d}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={strokeW + 4}
                        opacity="0.16"
                      />
                    )}
                    <path
                      d={lane.d}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={strokeW}
                      strokeDasharray={dashArray}
                      markerEnd={marker}
                      opacity={laneOpacity}
                      style={{
                        animation:
                          isActive && dashArray !== "none"
                            ? "laneDash 1s linear infinite"
                            : "none"
                      }}
                    />
                  </g>
                );
              })}
            </g>

            {/* =================================================================
                LAYER 2: STATION PULSE RINGS (<g className="pulse-layer">)
                ================================================================= */}
            <g className="pulse-layer">
              {Array.from(pulsedNodeIds).map((nodeId) => {
                const st = STATIONS[nodeId];
                if (!st) return null;
                const palette = STATION_PALETTES[nodeId] || STATION_PALETTES.entrance;
                const rx = (st.width || 44) + 14;
                const ry = (st.height || 22) + 8;
                return (
                  <g key={`pulse-${nodeId}`} transform={`translate(${st.x}, ${st.y + 8})`}>
                    <ellipse
                      cx="0"
                      cy="0"
                      rx={rx}
                      ry={ry}
                      fill="none"
                      stroke={palette.strokeActive}
                      strokeWidth="2"
                      className="pe-iso-pulse-ring"
                    />
                  </g>
                );
              })}
            </g>

            {/* =================================================================
                LAYER 3: HOSPITAL STATION NODES (<g className="nodes">)
                In STEP ZOOM mode, isolate only the active step's focused stations
                ================================================================= */}
            <g className="nodes">
              {Object.values(STATIONS)
                .filter((st) => (!isAutoZoom ? true : stepFocusNodeIds.has(st.id)))
                .map((st) => {
                  const isActive = pulsedNodeIds.has(st.id);
                  const isOwnerHere =
                    currentStep.petOwner.fromNode === st.id ||
                    currentStep.petOwner.toNode === st.id;

                  const palette = STATION_PALETTES[st.id] || STATION_PALETTES.entrance;

                  const w = st.width || 44;
                  const h = st.height || 22;
                  const depth = st.zones ? 26 : 20;

                  const topFace = `
                    ${st.x},${st.y - h}
                    ${st.x + w},${st.y - h / 2}
                    ${st.x},${st.y}
                    ${st.x - w},${st.y - h / 2}
                  `;
                  const leftFace = `
                    ${st.x - w},${st.y - h / 2}
                    ${st.x},${st.y}
                    ${st.x},${st.y + depth}
                    ${st.x - w},${st.y + depth - h / 2}
                  `;
                  const rightFace = `
                    ${st.x},${st.y}
                    ${st.x + w},${st.y - h / 2}
                    ${st.x + w},${st.y + depth - h / 2}
                    ${st.x},${st.y + depth}
                  `;
                  const shadow = `
                    ${st.x - w - 6},${st.y + depth + 4 - h / 2}
                    ${st.x + 6},${st.y + depth + 4}
                    ${st.x + w + 12},${st.y + depth + 4 - h / 2}
                    ${st.x},${st.y + depth + 4 - h}
                  `;

                  return (
                    <g
                      key={st.id}
                      style={{
                        filter: isActive
                          ? "drop-shadow(0 4px 12px rgba(180, 83, 26, 0.26))"
                          : "none"
                      }}
                    >
                      {/* Shadow */}
                      <polygon points={shadow} fill="rgba(51, 30, 16, 0.08)" />

                      {/* Left Face */}
                      <polygon
                        points={leftFace}
                        fill={isActive ? palette.leftActive : palette.left}
                        stroke={isActive ? palette.strokeActive : palette.stroke}
                        strokeWidth={isActive ? "1.4" : "1.1"}
                      />

                      {/* Right Face */}
                      <polygon
                        points={rightFace}
                        fill={isActive ? palette.rightActive : palette.right}
                        stroke={isActive ? palette.strokeActive : palette.stroke}
                        strokeWidth={isActive ? "1.4" : "1.1"}
                      />

                      {/* Top Face */}
                      <polygon
                        points={topFace}
                        fill={isActive ? palette.topActive : palette.top}
                        stroke={
                          isOwnerHere
                            ? "#8c5828"
                            : isActive
                            ? palette.strokeActive
                            : palette.stroke
                        }
                        strokeWidth={isActive ? "2.2" : "1.3"}
                      />

                      {/* Station English Label cleanly below Platform (Zero [] prefix) */}
                      <text
                        x={st.x}
                        y={st.y + depth + 14}
                        textAnchor="middle"
                        fontSize="10.5"
                        fontWeight="800"
                        letterSpacing="0.03em"
                        fill={isActive ? palette.strokeActive : palette.textTitle}
                      >
                        {st.label}
                      </text>
                      <text
                        x={st.x}
                        y={st.y + depth + 26}
                        textAnchor="middle"
                        fontSize="9.6"
                        fontWeight="600"
                        fill={palette.textSubtitle}
                      >
                        {st.labelTh}
                      </text>

                      {/* Special Sub-Zones inside Exam Room (General): Zone A (1,2,3) & Zone B (1,2,3) */}
                      {st.zones && (
                        <g transform={`translate(${st.x}, ${st.y + depth + 33})`}>
                          <rect
                            x="-86"
                            y="0"
                            width="172"
                            height="38"
                            rx="3"
                            fill="#fcf8ee"
                            stroke={isActive ? "#0284c7" : "#cbb698"}
                            strokeWidth="1.1"
                          />
                          {st.zones.map((z, zIdx) => {
                            const rowY = zIdx === 0 ? 13 : 29;
                            return (
                              <g key={z.zoneTitle}>
                                <text
                                  x="-78"
                                  y={rowY}
                                  fontSize="9.2"
                                  fontWeight="800"
                                  fill="#4a2e1b"
                                >
                                  {z.zoneTitle}:
                                </text>
                                {z.rooms.map((rm, rIdx) => {
                                  const rmX = -26 + rIdx * 34;
                                  const isRoomActive =
                                    currentStep.petOwner.subZone === rm && isActive;
                                  return (
                                    <g key={rm}>
                                      <rect
                                        x={rmX}
                                        y={rowY - 9}
                                        width="28"
                                        height="12"
                                        rx="2"
                                        fill={isRoomActive ? "#0284c7" : "#efe4ca"}
                                        stroke={isRoomActive ? "#0369a1" : "#d8c6aa"}
                                        strokeWidth="0.8"
                                      />
                                      <text
                                        x={rmX + 14}
                                        y={rowY}
                                        textAnchor="middle"
                                        fontSize="8.6"
                                        fontWeight="800"
                                        fill={isRoomActive ? "#ffffff" : "#4a2e1b"}
                                      >
                                        #{rIdx + 1}
                                      </text>
                                    </g>
                                  );
                                })}
                              </g>
                            );
                          })}
                        </g>
                      )}
                    </g>
                  );
                })}
            </g>

            {/* =================================================================
                LAYER 4: PERSISTENT PET & OWNER TOKEN (แสดงตลอดเวลาทุกขั้นตอน)
                ================================================================= */}
            <g
              className="pet-owner-persistent-layer"
              transform={`translate(${ownerX}, ${ownerY - 6})`}
            >
              {/* Outer warm aura ring */}
              <circle r="13" fill="#8c5828" opacity="0.22" />
              <circle
                r="9.5"
                fill="none"
                stroke="#8c5828"
                strokeWidth="1.4"
                strokeDasharray="3 2"
              />
              {/* Core Brown Dot for Pet & Owner */}
              <circle
                r="6.5"
                fill="#8c5828"
                stroke="#fcf8ee"
                strokeWidth="2"
              />
              {/* Persistent Floating Tag (Compact height to never collide with notes above) */}
              <g transform="translate(0, -11)">
                <rect
                  x="-48"
                  y="-15"
                  width="96"
                  height="15"
                  rx="7.5"
                  fill="#331e10"
                  stroke="#8c5828"
                  strokeWidth="1.1"
                />
                <circle cx="-36" cy="-7.5" r="3" fill="#d97706" />
                <text
                  x="4"
                  y="-4.5"
                  textAnchor="middle"
                  fontSize="8.8"
                  fontWeight="800"
                  letterSpacing="0.05em"
                  fill="#fcf8ee"
                >
                  PET &amp; OWNER
                </text>
              </g>
            </g>

            {/* =================================================================
                LAYER 5: ONE-SHOT PACKET CARDS (<g className="packet-layer">)
                เคลื่อนที่ไปยังปลายทางครั้งเดียวแล้วหยุดที่ปลายทาง (ไม่เล่นซ้ำ) และไม่ทับป้ายอื่น
                ================================================================= */}
            <g className="packet-layer">
              {currentStep.packets
                .filter((pkt) => {
                  if (pkt.stream === "owner") return false;
                  if (currentStep.id === 3 && !step3PacketVisible) return false;
                  return true;
                })
                .map((pkt) => {
                  const fromSt = STATIONS[pkt.fromNode];
                  const toSt = STATIONS[pkt.toNode];
                  if (!fromSt || !toSt) return null;

                  // Animate once from source station to destination station stop position (t: 0 -> 1)
                  const startX = fromSt.x;
                  const startY = fromSt.y - 28;
                  const endX = toSt.x + (pkt.stopOffsetX ?? 0);
                  const endY = toSt.y + (pkt.stopOffsetY ?? -68);

                  const cardCenterX = startX + (endX - startX) * packetProgress;
                  const cardCenterY = startY + (endY - startY) * packetProgress;

                  // Wire dot travels along the connection between fromSt and toSt and stops near toSt
                  const wireT = 0.18 + 0.72 * packetProgress;
                  const wireX = fromSt.x + (toSt.x - fromSt.x) * wireT;
                  const wireY = fromSt.y + (toSt.y - fromSt.y) * wireT;

                  const palette = TONE_PALETTE[pkt.tone];

                  return (
                    <g
                      key={pkt.id}
                      style={{
                        filter: "drop-shadow(0 3px 8px rgba(51, 30, 16, 0.16))"
                      }}
                    >
                      {/* Connector from wire dot to packet card */}
                      <line
                        x1={wireX}
                        y1={wireY}
                        x2={cardCenterX}
                        y2={cardCenterY}
                        stroke={palette.border}
                        strokeWidth="1.2"
                        strokeDasharray="2 2"
                      />
                      {/* Leading Dot on the Wire */}
                      <circle
                        cx={wireX}
                        cy={wireY}
                        r="4.5"
                        fill={palette.dot}
                        stroke="#fcf8ee"
                        strokeWidth="1.6"
                      />

                      {/* Protocol-Explorer Style Compact Packet Card (.packet-tag + .packet-title only) */}
                      <g transform={`translate(${cardCenterX - 63}, ${cardCenterY - 14.5})`}>
                        <rect
                          x="0"
                          y="0"
                          width="126"
                          height="29"
                          rx="3"
                          fill={palette.bg}
                          stroke={palette.border}
                          strokeWidth="1.3"
                        />
                        {/* Header Tag Strip */}
                        <rect
                          x="0"
                          y="0"
                          width="126"
                          height="13.5"
                          rx="2.5"
                          fill={palette.badgeBg}
                        />
                        <text
                          x="63"
                          y="9.8"
                          textAnchor="middle"
                          fontSize="8.5"
                          fontWeight="800"
                          letterSpacing="0.06em"
                          fill="#ffffff"
                        >
                          {pkt.tag}
                        </text>

                        {/* Packet Body Title */}
                        <text
                          x="63"
                          y="23.8"
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="800"
                          fill={palette.text}
                        >
                          {pkt.title}
                        </text>
                      </g>
                    </g>
                  );
                })}
            </g>

            {/* =================================================================
                LAYER 6: DYNAMIC STATION CALLOUT NOTES (<g className="note-layer">)
                ป้ายกำกับ Action ที่ผุดขึ้นมาเหนือสถานีพร้อมจุดสี Staff/DVM/Sideflow/System/Alarm
                ================================================================= */}
            <g className="note-layer">
              {currentStep.stationNotes.map((note) => {
                const st = STATIONS[note.nodeId];
                if (!st) return null;

                const palette = TONE_PALETTE[note.tone];
                const ny = st.y + (note.offsetY ?? -68);
                const nx = st.x + (note.offsetX ?? 0);

                return (
                  <g
                    key={note.id}
                    className="pe-note-callout"
                    style={{
                      filter: "drop-shadow(0 4px 10px rgba(51, 30, 16, 0.14))"
                    }}
                  >
                    {/* Connector stem from note box to station platform */}
                    <line
                      x1={nx}
                      y1={ny + 19}
                      x2={st.x}
                      y2={st.y - 16}
                      stroke={palette.border}
                      strokeWidth="1.3"
                      strokeDasharray="2 2"
                    />

                    <g transform={`translate(${nx}, ${ny})`}>
                      {/* Callout Box */}
                      <rect
                        x="-72"
                        y="-18"
                        width="144"
                        height="36"
                        rx="3.5"
                        fill={palette.bg}
                        stroke={palette.border}
                        strokeWidth="1.4"
                      />

                      {/* Role Dot + Role Pill + Title */}
                      <circle cx="-61" cy="-7" r="4" fill={palette.dot} />
                      <text
                        x="-52"
                        y="-3.5"
                        fontSize="8.8"
                        fontWeight="800"
                        letterSpacing="0.03em"
                        fill={palette.badgeBg}
                      >
                        [{note.roleLabel}] {note.title}
                      </text>

                      {/* Action Detail Line */}
                      <text
                        x="-61"
                        y="10"
                        fontSize="8.6"
                        fontWeight="600"
                        fill={palette.text}
                      >
                        {note.detail}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
            </svg>
          </div>

          {/* ===================================================================
              NON-MODAL ACTION BANNER & "INSPECT UI & SCENE" CTA BAR
              (แทนที่การใช้ Modal Popup ด้วยแถบแนะนำให้กดสลับไปดูหน้า UI & SCENE)
              =================================================================== */}
          <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 py-2 bg-[#fcf8ee] border-t border-[#d8c6aa]">
            <div className="flex items-center gap-3 min-w-0">
              <span className="px-2 py-0.5 text-[11px] font-extrabold tracking-wider bg-[#331e10] text-[#fcf8ee] rounded-xs shrink-0">
                STEP {currentStep.id} LIVE STATUS
              </span>
              <div className="flex items-center gap-2 text-[12.5px] font-bold text-[#331e10] truncate">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8c5828] inline-block shrink-0" />
                <span className="truncate">
                  Pet &amp; Owner:{" "}
                  {currentStep.id === 3 && step3CustomStatus
                    ? step3CustomStatus
                    : currentStep.petOwner.statusLabel}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {currentStep.uiWireframes.length > 0 && (
                <span className="text-[11.5px] font-bold text-[#1f7a4c] bg-[#dfece3] px-2 py-0.5 rounded-xs border border-[#b8d4c2]">
                  มีหน้าจอ KAHIS UI ({currentStep.uiWireframes.length} หน้าจอ)
                </span>
              )}
              <button
                type="button"
                onClick={() => onSwitchView?.("scene")}
                className="px-3.5 py-1.5 bg-[#b4531a] hover:bg-[#331e10] text-[#fcf8ee] text-[12.5px] font-extrabold tracking-wide rounded-xs flex items-center gap-1.5 cursor-pointer transition shadow-2xs border-0"
              >
                <Eye className="w-4 h-4" />
                <span>{currentStep.uiPromptLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: UI & SCENE VIEWER (In-Panel Fixed-Height Non-Modal Inspector)
          ========================================================================= */}
      {viewMode === "scene" && (
        <div className="w-full h-full p-4 overflow-hidden bg-[#f6efe0] flex flex-col gap-3">
          {/* Top Bar inside UI & SCENE (Fixed Height) */}
          <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 border-b border-[#d8c6aa] pb-2.5">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => onSwitchView?.("flow")}
                className="px-3 py-1 bg-[#fcf8ee] hover:bg-[#efe4ca] text-[#331e10] border border-[#a68664] rounded-xs text-[12px] font-extrabold flex items-center gap-1.5 cursor-pointer transition shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>กลับไปแผนผัง (FLOW MAP)</span>
              </button>
              <div className="min-w-0">
                <h3 className="text-[15.5px] font-extrabold text-[#331e10] tracking-wide m-0 truncate">
                  UI &amp; SCENE INSPECTOR · STEP {currentStep.id}: {currentStep.title}
                </h3>
                <p className="text-[12px] text-[#7a5a40] m-0 truncate">
                  แสดงหน้าจอระบบ KAHIS EMR และฉากจำลองขนาดคงที่ภายในหน้าต่างเดียว
                </p>
              </div>
            </div>

            {/* In-Panel Layout & Zoom Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setSceneLayout("split")}
                className={`px-2.5 py-1 text-[11.5px] font-extrabold rounded-xs border cursor-pointer transition ${
                  sceneLayout === "split"
                    ? "bg-[#331e10] text-[#fcf8ee] border-[#331e10]"
                    : "bg-[#fcf8ee] text-[#4a2e1b] border-[#d8c6aa]"
                }`}
              >
                <Layers className="w-3.5 h-3.5 inline mr-1" />
                SPLIT VIEW
              </button>
              {currentStep.uiWireframes.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSceneLayout("ui-only")}
                  className={`px-2.5 py-1 text-[11.5px] font-extrabold rounded-xs border cursor-pointer transition ${
                    sceneLayout === "ui-only"
                      ? "bg-[#331e10] text-[#fcf8ee] border-[#331e10]"
                      : "bg-[#fcf8ee] text-[#4a2e1b] border-[#d8c6aa]"
                  }`}
                >
                  FULL UI SCREEN
                </button>
              )}
              <button
                type="button"
                onClick={() => setSceneLayout("scene-only")}
                className={`px-2.5 py-1 text-[11.5px] font-extrabold rounded-xs border cursor-pointer transition ${
                  sceneLayout === "scene-only"
                    ? "bg-[#331e10] text-[#fcf8ee] border-[#331e10]"
                    : "bg-[#fcf8ee] text-[#4a2e1b] border-[#d8c6aa]"
                }`}
              >
                FULL CLINIC SCENE
              </button>

              <div className="h-5 w-px bg-[#d8c6aa] mx-1" />

              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
                disabled={zoomLevel <= 1}
                className="px-2 py-1 bg-[#fcf8ee] border border-[#d8c6aa] rounded-xs text-[11.5px] font-extrabold text-[#331e10] disabled:opacity-40 cursor-pointer"
                title="ลดขนาดภาพ"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11.5px] font-extrabold text-[#4a2e1b] min-w-[42px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(2, +(z + 0.25).toFixed(2)))}
                disabled={zoomLevel >= 2}
                className="px-2 py-1 bg-[#fcf8ee] border border-[#d8c6aa] rounded-xs text-[11.5px] font-extrabold text-[#331e10] disabled:opacity-40 cursor-pointer"
                title="ขยายขนาดภาพในหน้าต่าง"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Main Fixed-Height Content Area (No extra bars shifting height!) */}
          <div
            className={`grid gap-4 flex-1 min-h-0 overflow-hidden ${
              sceneLayout === "split" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {/* Left / Scene Card */}
            {(sceneLayout === "split" || sceneLayout === "scene-only") && (
              <div className="h-full bg-[#fcf8ee] border border-[#d8c6aa] rounded-sm p-3 flex flex-col shadow-xs overflow-hidden">
                <div className="h-8 shrink-0 flex items-center justify-between mb-2 gap-2">
                  <span className="text-[13px] font-extrabold text-[#331e10] tracking-wide truncate">
                    CLINICAL SCENE &amp; ACTOR ACTION
                  </span>
                  <span className="text-[11px] text-[#7c4d3a] bg-[#f3e6dd] px-2 py-0.5 rounded-xs border border-[#d9c0b2] font-bold shrink-0">
                    {currentStep.target}
                  </span>
                </div>
                <div className="flex-1 min-h-0 relative bg-[#f9f3e5] rounded-xs border border-[#e8dcc6] flex items-center justify-center overflow-auto">
                  {currentStep.characterImage ? (
                    <div
                      className="relative w-full h-full transition-transform duration-200"
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: "center center"
                      }}
                    >
                      <Image
                        src={currentStep.characterImage}
                        alt="Character Scene"
                        fill
                        className="object-contain p-2"
                        style={{ mixBlendMode: "multiply" }}
                      />
                    </div>
                  ) : (
                    <div className="text-[13px] text-[#9c7b5e]">
                      ไม่มีภาพประกอบตัวละครในขั้นนี้
                    </div>
                  )}
                </div>
                <div className="h-6 shrink-0 flex items-center justify-center mt-2">
                  <p className="text-[13px] font-bold text-[#4a2e1b] text-center m-0 truncate">
                    {currentStep.characterTitle}
                  </p>
                </div>
              </div>
            )}

            {/* Right / UI Wireframe Card (With In-Header Screen Selector Dropdown + Prev/Next) */}
            {(sceneLayout === "split" || sceneLayout === "ui-only") && (
              <div className="h-full bg-[#fcf8ee] border border-[#d8c6aa] rounded-sm p-3 flex flex-col shadow-xs overflow-hidden">
                <div className="h-8 shrink-0 flex items-center justify-between mb-2 gap-2">
                  {currentStep.uiWireframes.length > 1 ? (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="text-[11.5px] font-extrabold text-[#b4531a] shrink-0">
                        SCREEN ({selectedWireframeIdx + 1}/{currentStep.uiWireframes.length}):
                      </span>
                      <select
                        value={selectedWireframeIdx}
                        onChange={(e) => setSelectedWireframeIdx(Number(e.target.value))}
                        className="flex-1 min-w-0 h-7 px-2 bg-[#f6efe0] border border-[#a68664] rounded-xs text-[12px] font-extrabold text-[#331e10] cursor-pointer focus:outline-none focus:border-[#b4531a]"
                      >
                        {currentStep.uiWireframes.map((wf, idx) => (
                          <option key={wf.id} value={idx}>
                            {idx + 1}. [{wf.tag}] {wf.title}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedWireframeIdx((prev) =>
                            prev > 0 ? prev - 1 : currentStep.uiWireframes.length - 1
                          )
                        }
                        className="h-7 w-7 flex items-center justify-center bg-[#f6efe0] hover:bg-[#efe4ca] border border-[#d8c6aa] rounded-xs text-[#331e10] cursor-pointer shrink-0"
                        title="หน้าจอก่อนหน้า"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedWireframeIdx((prev) =>
                            prev < currentStep.uiWireframes.length - 1 ? prev + 1 : 0
                          )
                        }
                        className="h-7 w-7 flex items-center justify-center bg-[#f6efe0] hover:bg-[#efe4ca] border border-[#d8c6aa] rounded-xs text-[#331e10] cursor-pointer shrink-0"
                        title="หน้าจอถัดไป"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-[13px] font-extrabold text-[#331e10] tracking-wide truncate">
                        {currentStep.uiWireframes[0]?.title || "SYSTEM AUTOMATION & STATUS"}
                      </span>
                      <span className="text-[11px] text-[#1f7a4c] bg-[#dfece3] px-2 py-0.5 rounded-xs border border-[#b8d4c2] font-bold shrink-0">
                        {currentStep.uiWireframes[0]?.tag || currentStep.module}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex-1 min-h-0 relative bg-[#f9f3e5] rounded-xs border border-[#e8dcc6] flex items-center justify-center overflow-auto">
                  {currentStep.uiWireframes.length > 0 ? (
                    <div
                      className="relative w-full h-full transition-transform duration-200"
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: "center center"
                      }}
                    >
                      <Image
                        src={currentStep.uiWireframes[selectedWireframeIdx]?.image}
                        alt="UI Wireframe"
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  ) : (
                    <div className="p-6 max-w-md text-center space-y-2">
                      <div className="inline-block px-3 py-1 rounded-xs bg-[#dfece3] text-[#14532d] text-[12px] font-extrabold border border-[#b8d4c2]">
                        {currentStep.refCode} · {currentStep.module}
                      </div>
                      <p className="text-[14px] font-bold text-[#331e10] m-0">
                        {currentStep.action}
                      </p>
                      <p className="text-[12.5px] text-[#7a5a40] m-0">
                        ขั้นตอนนี้เป็นการทำงานอัตโนมัติของระบบหลังบ้าน (Background System Event) และการเคลื่อนที่ระหว่างสถานี
                      </p>
                    </div>
                  )}
                </div>

                <div className="h-6 shrink-0 flex items-center justify-between mt-2 text-[12px] text-[#7a5a40]">
                  <span className="truncate">
                    โมดูล:{" "}
                    <strong>
                      {currentStep.uiWireframes[selectedWireframeIdx]?.badgeLabel ||
                        currentStep.module}
                    </strong>
                  </span>
                  {currentStep.uiWireframes.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        setSceneLayout((prev) => (prev === "ui-only" ? "split" : "ui-only"))
                      }
                      className="text-[#b4531a] hover:underline font-extrabold bg-transparent border-0 cursor-pointer shrink-0"
                    >
                      {sceneLayout === "ui-only"
                        ? "แสดงคู่กับภาพฉาก (Split View)"
                        : "ขยายเต็มกรอบ Panel (Full UI View)"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Keyframe animations for active lanes & station pulses */}
      <style jsx>{`
        @keyframes laneDash {
          to {
            stroke-dashoffset: -22;
          }
        }
        @keyframes isoPulse {
          0% {
            transform: scale(0.88);
            opacity: 0.75;
          }
          70% {
            transform: scale(1.18);
            opacity: 0.15;
          }
          100% {
            transform: scale(1.25);
            opacity: 0;
          }
        }
        .pe-iso-pulse-ring {
          transform-box: fill-box;
          transform-origin: center;
          animation: isoPulse 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
      `}</style>
    </div>
  );
}
