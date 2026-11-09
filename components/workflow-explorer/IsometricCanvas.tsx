"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  STATIONS,
  STATION_LANES,
  LANE_MIN_STEP,
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
  ChevronRight,
  Play,
  Pause,
  RotateCcw
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
  // 8. Rx Room: Soft pastel rose pink (ห้องจัดยานำกลับ ใช้กล่องสีชมพูพาสเทล)
  rxRoom: {
    top: "#fdf2f8",
    topActive: "#fce7f3",
    left: "#fbcfe8",
    leftActive: "#f9a8d4",
    right: "#f9a8d4",
    rightActive: "#f472b6",
    stroke: "#ec4899",
    strokeActive: "#db2777",
    textTitle: "#831843",
    textSubtitle: "#9d174d"
  },
  // 9. Cashier: Deep royal fuchsia / magenta (เก็บเงิน/ใบเสร็จ ใช้กล่องสีชมพูเข้มฟูเชีย)
  cashier: {
    top: "#fdf4ff",
    topActive: "#fae8ff",
    left: "#f5d0fe",
    leftActive: "#f0abfc",
    right: "#f0abfc",
    rightActive: "#e879f9",
    stroke: "#c026d3",
    strokeActive: "#a21caf",
    textTitle: "#701a75",
    textSubtitle: "#86198f"
  },
  // 10. Pharmacy: Vibrant rose pink (ห้องจ่ายยา ใช้กล่องสีชมพูกุหลาบสดใส)
  pharmacy: {
    top: "#fff1f2",
    topActive: "#ffe4e6",
    left: "#fecdd3",
    leftActive: "#fda4af",
    right: "#fda4af",
    rightActive: "#fb7185",
    stroke: "#f43f5e",
    strokeActive: "#e11d48",
    textTitle: "#881337",
    textSubtitle: "#9f1239"
  },
  // 10.5. Waiting Zone (Rx, Cashier): Warm cream with rose accents
  waitingRxCashier: {
    top: "#fff7ed",
    topActive: "#ffedd5",
    left: "#fed7aa",
    leftActive: "#fdba74",
    right: "#fbcfe8",
    rightActive: "#f9a8d4",
    stroke: "#f43f5e",
    strokeActive: "#e11d48",
    textTitle: "#881337",
    textSubtitle: "#9f1239"
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

interface SubWindowRole {
  tag: string;
  tone: RoleTone;
}

interface SubWindowSpec {
  id: string;
  stepId: number;
  phase: number;
  clearOnPhase?: number;
  roleTone?: RoleTone;
  roleTag?: string;
  roles?: SubWindowRole[];
  text: string;
  lines?: string[];
  anchorNode: string;
  stackSide: "right" | "left" | "top" | "custom";
  stackIndex: number;
  customX?: number;
  customY?: number;
}

const STEP_SUBWINDOWS: SubWindowSpec[] = [
  // --- STEP 4: 4 windows on right of examGeneral ---
  {
    id: "s4-1",
    stepId: 4,
    phase: 1,
    roleTone: "dvm",
    roleTag: "[DVM]",
    text: "ดูประวัติและ Pet's Note",
    anchorNode: "examGeneral",
    stackSide: "right",
    stackIndex: 0
  },
  {
    id: "s4-2",
    stepId: 4,
    phase: 2,
    roleTone: "dvm",
    roleTag: "[DVM]",
    text: "บันทึกข้อมูลการตรวจ",
    anchorNode: "examGeneral",
    stackSide: "right",
    stackIndex: 1
  },
  {
    id: "s4-3",
    stepId: 4,
    phase: 3,
    roles: [
      { tag: "[DVM]", tone: "dvm" },
      { tag: "[STAFF]", tone: "staff" }
    ],
    text: "บันทึกข้อมูล VPE",
    anchorNode: "examGeneral",
    stackSide: "right",
    stackIndex: 2
  },
  {
    id: "s4-4",
    stepId: 4,
    phase: 4,
    roleTone: "dvm",
    roleTag: "[DVM]",
    text: "บันทึกข้อมูล Assessment",
    anchorNode: "examGeneral",
    stackSide: "right",
    stackIndex: 3
  },

  // --- STEP 5: Xray / USG (Phased Stack) ---
  {
    id: "s5-1",
    stepId: 5,
    phase: 2,
    clearOnPhase: 10,
    roleTone: "dvm",
    roleTag: "[DVM]",
    text: "order Xray / USG",
    anchorNode: "examGeneral",
    stackSide: "right",
    stackIndex: 0
  },
  {
    id: "s5-2",
    stepId: 5,
    phase: 3,
    clearOnPhase: 10,
    roleTone: "system",
    roleTag: "[SYSTEM]",
    text: "send Q > Xray/USG list",
    anchorNode: "examGeneral",
    stackSide: "right",
    stackIndex: 1
  },
  {
    id: "s5-3",
    stepId: 5,
    phase: 4,
    clearOnPhase: 10,
    roleTone: "owner",
    roleTag: "[PET]",
    text: "ไปรอเรียกที่จุดบริการ Xray/USG",
    lines: ["ไปรอเรียกที่", "จุดบริการ Xray/USG"],
    anchorNode: "examGeneral",
    stackSide: "custom",
    customX: 649,
    customY: 268,
    stackIndex: 2
  },
  {
    id: "s5-4",
    stepId: 5,
    phase: 5,
    roleTone: "staff",
    roleTag: "[STAFF]",
    text: "ตรวจสอบ order และ เรียก",
    anchorNode: "xrayUsg",
    stackSide: "left",
    stackIndex: 0
  },
  {
    id: "s5-5",
    stepId: 5,
    phase: 6,
    roleTone: "owner",
    roleTag: "[PET&OWNER]",
    text: "เข้ารับบริการ",
    anchorNode: "xrayUsg",
    stackSide: "left",
    stackIndex: 1
  },
  {
    id: "s5-6",
    stepId: 5,
    phase: 7,
    roleTone: "staff",
    roleTag: "[STAFF]",
    text: "ปฏิบัติงานรังสี / USG",
    anchorNode: "xrayUsg",
    stackSide: "left",
    stackIndex: 2
  },
  {
    id: "s5-7",
    stepId: 5,
    phase: 8,
    roleTone: "owner",
    roleTag: "[PET]",
    text: "กลับห้องตรวจ",
    anchorNode: "xrayUsg",
    stackSide: "left",
    stackIndex: 3
  },
  {
    id: "s5-8",
    stepId: 5,
    phase: 9,
    roleTone: "system",
    roleTag: "[SYSTEM]",
    text: "บันทึกรายการหัตถการ&ยา",
    anchorNode: "xrayUsg",
    stackSide: "left",
    stackIndex: 4
  },
  {
    id: "s5-9",
    stepId: 5,
    phase: 11,
    roleTone: "dvm",
    roleTag: "[DVM]",
    text: "รับผลและเรียกเคส",
    anchorNode: "examGeneral",
    stackSide: "right",
    stackIndex: 0
  },
  {
    id: "s5-10",
    stepId: 5,
    phase: 12,
    roleTone: "owner",
    roleTag: "[PET]",
    text: "เข้าตรวจต่อ",
    anchorNode: "examGeneral",
    stackSide: "right",
    stackIndex: 1
  },

  // --- STEP 6: Tx Room (Injection / Procedures) ---
  {
    id: "s6-1",
    stepId: 6,
    phase: 2,
    clearOnPhase: 10,
    roleTone: "dvm",
    roleTag: "[DVM]",
    text: "order ฉีดยา & ทำหัตถการ",
    anchorNode: "examGeneral",
    stackSide: "right",
    stackIndex: 0
  },
  {
    id: "s6-2",
    stepId: 6,
    phase: 3,
    clearOnPhase: 10,
    roleTone: "system",
    roleTag: "[SYSTEM]",
    text: "send Q > Tx list",
    anchorNode: "examGeneral",
    stackSide: "right",
    stackIndex: 1
  },
  {
    id: "s6-3",
    stepId: 6,
    phase: 4,
    clearOnPhase: 10,
    roleTone: "owner",
    roleTag: "[PET]",
    text: "ไปรอเรียกที่จุดบริการ Tx Room",
    lines: ["ไปรอเรียกที่", "จุดบริการ Tx Room"],
    anchorNode: "examGeneral",
    stackSide: "custom",
    customX: 649,
    customY: 268,
    stackIndex: 2
  },
  {
    id: "s6-4",
    stepId: 6,
    phase: 5,
    roleTone: "staff",
    roleTag: "[STAFF]",
    text: "ตรวจสอบ order และ เรียก",
    anchorNode: "txRoom",
    stackSide: "left",
    stackIndex: 0
  },
  {
    id: "s6-5",
    stepId: 6,
    phase: 6,
    roleTone: "owner",
    roleTag: "[PET&OWNER]",
    text: "เข้ารับบริการ",
    anchorNode: "txRoom",
    stackSide: "left",
    stackIndex: 1
  },
  {
    id: "s6-6",
    stepId: 6,
    phase: 7,
    roleTone: "staff",
    roleTag: "[STAFF]",
    text: "ทำหัตถการ & ยาฉีด",
    anchorNode: "txRoom",
    stackSide: "left",
    stackIndex: 2
  },
  {
    id: "s6-7",
    stepId: 6,
    phase: 8,
    roleTone: "owner",
    roleTag: "[PET]",
    text: "กลับห้องตรวจ",
    anchorNode: "txRoom",
    stackSide: "left",
    stackIndex: 3
  },
  {
    id: "s6-8",
    stepId: 6,
    phase: 9,
    roleTone: "system",
    roleTag: "[SYSTEM]",
    text: "บันทึกรายการหัตถการ&ยา",
    anchorNode: "txRoom",
    stackSide: "left",
    stackIndex: 4
  },
  {
    id: "s6-9",
    stepId: 6,
    phase: 11,
    roleTone: "dvm",
    roleTag: "[DVM]",
    text: "ตรวจประเมินผลหลังหัตถการ",
    anchorNode: "examGeneral",
    stackSide: "right",
    stackIndex: 0
  },
  {
    id: "s6-10",
    stepId: 6,
    phase: 12,
    roleTone: "owner",
    roleTag: "[PET]",
    text: "เข้าตรวจต่อ",
    anchorNode: "examGeneral",
    stackSide: "right",
    stackIndex: 1
  },

  // --- STEP 7: Take-Home Meds & Waiting Zone ---
  {
    id: "s7-1",
    stepId: 7,
    phase: 2,
    roleTone: "dvm",
    roleTag: "[DVM]",
    text: "สั่งยานำกลับ",
    anchorNode: "examGeneral",
    stackSide: "right",
    stackIndex: 0
  },
  {
    id: "s7-2",
    stepId: 7,
    phase: 3,
    roleTone: "system",
    roleTag: "[SYS]",
    text: "ส่งข้อมูลไปยังห้อง Rx เพื่อจัดยา",
    anchorNode: "examGeneral",
    stackSide: "right",
    stackIndex: 1
  },
  {
    id: "s7-5",
    stepId: 7,
    phase: 4,
    roleTone: "owner",
    roleTag: "[PET]",
    text: "ไปรอที่ Waiting Zone (Rx, Cashier)",
    lines: ["ไปรอที่ Waiting Zone", "(Rx, Cashier)"],
    anchorNode: "waitingRxCashier",
    stackSide: "custom",
    customX: 735,
    customY: 375,
    stackIndex: 0
  },
  {
    id: "s7-3a",
    stepId: 7,
    phase: 5,
    roleTone: "staff",
    roleTag: "[STAFF]",
    text: "จัดยานำกลับตาม order",
    anchorNode: "rxRoom",
    stackSide: "left",
    stackIndex: 0
  },
  {
    id: "s7-3b",
    stepId: 7,
    phase: 6,
    roleTone: "staff",
    roleTag: "[STAFF]",
    text: "ลงข้อมูลยานำกลับ",
    anchorNode: "rxRoom",
    stackSide: "left",
    stackIndex: 1
  },
  {
    id: "s7-4",
    stepId: 7,
    phase: 7,
    roleTone: "system",
    roleTag: "[SYSTEM]",
    text: "สรุปข้อมูลส่งการเงิน",
    anchorNode: "rxRoom",
    stackSide: "left",
    stackIndex: 2
  },

  // --- STEP 8: Cashier Payment & Receipt ---
  {
    id: "s8-1",
    stepId: 8,
    phase: 1,
    roleTone: "staff",
    roleTag: "[STAFF]",
    text: "ตรวจสอบข้อมูลค่ารักษา",
    anchorNode: "cashier",
    stackSide: "custom",
    customX: 665,
    customY: 400,
    stackIndex: 0
  },
  {
    id: "s8-2",
    stepId: 8,
    phase: 2,
    roleTone: "system",
    roleTag: "[SYSTEM]",
    text: "Calling คิวชำระเงิน",
    anchorNode: "cashier",
    stackSide: "custom",
    customX: 665,
    customY: 425,
    stackIndex: 1
  },
  {
    id: "s8-3",
    stepId: 8,
    phase: 3,
    roleTone: "owner",
    roleTag: "[PET]",
    text: "ไปชำระเงินที่ Cashier",
    anchorNode: "cashier",
    stackSide: "custom",
    customX: 665,
    customY: 450,
    stackIndex: 2
  },
  {
    id: "s8-4",
    stepId: 8,
    phase: 4,
    roleTone: "owner",
    roleTag: "[PET]",
    text: "ได้รับใบเสร็จ (Discharged)",
    anchorNode: "cashier",
    stackSide: "custom",
    customX: 665,
    customY: 475,
    stackIndex: 3
  },
  {
    id: "s8-5",
    stepId: 8,
    phase: 6,
    roleTone: "owner",
    roleTag: "[PET]",
    text: "ยื่นใบเสร็จที่ Pharmacy",
    anchorNode: "waitingRxCashier",
    stackSide: "custom",
    customX: 600,
    customY: 285,
    stackIndex: 0
  },
  {
    id: "s8-6",
    stepId: 8,
    phase: 7,
    roleTone: "owner",
    roleTag: "[PET]",
    text: "รอเรียกรับยาที่ Waiting Zone",
    anchorNode: "waitingRxCashier",
    stackSide: "custom",
    customX: 600,
    customY: 312,
    stackIndex: 0
  },

  // --- STEP 9: Pharmacy Handover & Exit ---
  {
    id: "s9-1",
    stepId: 9,
    phase: 1,
    roleTone: "staff",
    roleTag: "[STAFF]",
    text: "Calling เรียกคิวรับยา",
    anchorNode: "pharmacy",
    stackSide: "custom",
    customX: 710,
    customY: 220,
    stackIndex: 0
  },
  {
    id: "s9-2",
    stepId: 9,
    phase: 2,
    roleTone: "owner",
    roleTag: "[PET]",
    text: "มารับยา และ เซ็นต์รับ",
    anchorNode: "pharmacy",
    stackSide: "custom",
    customX: 710,
    customY: 245,
    stackIndex: 1
  },
  {
    id: "s9-3",
    stepId: 9,
    phase: 3,
    roleTone: "system",
    roleTag: "[SYS]",
    text: "บันทึกข้อมูลการจ่ายยา",
    anchorNode: "pharmacy",
    stackSide: "custom",
    customX: 710,
    customY: 270,
    stackIndex: 2
  },
  {
    id: "s9-4",
    stepId: 9,
    phase: 4,
    roleTone: "owner",
    roleTag: "[PET]",
    text: "เสร็จสิ้น เดินทางกลับ (Exit)",
    anchorNode: "exit",
    stackSide: "custom",
    customX: 1115,
    customY: 246,
    stackIndex: 0
  }
];

function getSubWindowPos(sw: SubWindowSpec): { x: number; y: number } {
  if (sw.stackSide === "custom" && sw.customX !== undefined && sw.customY !== undefined) {
    return { x: sw.customX, y: sw.customY };
  }
  const st = STATIONS[sw.anchorNode];
  if (!st) return { x: 0, y: 0 };
  if (sw.stackSide === "right") {
    return {
      x: st.x + 94,
      y: st.y - 105 + sw.stackIndex * 25
    };
  } else if (sw.stackSide === "left") {
    return {
      x: st.x - 95,
      y: st.y - 82 + sw.stackIndex * 25
    };
  } else if (sw.stackSide === "top") {
    return {
      x: st.x,
      y: st.y - 64 + sw.stackIndex * 25
    };
  }
  return { x: st.x, y: st.y - 60 };
}

function getStepFocusNodeIds(step: WorkflowStep): Set<string> {
  const ids = new Set<string>([
    step.fromNode,
    step.toNode,
    step.petOwner.fromNode,
    step.petOwner.toNode,
    ...step.stationNotes.map((n) => n.nodeId),
    ...step.packets.flatMap((p) => [p.fromNode, p.toNode])
  ]);
  if (step.id === 5) {
    ids.add("examGeneral");
    ids.add("xrayUsg");
  }
  if (step.id === 6) {
    ids.add("examGeneral");
    ids.add("txRoom");
  }
  if (step.id === 7) {
    ids.add("examGeneral");
    ids.add("waitingRxCashier");
    ids.add("rxRoom");
  }
  if (step.id === 8) {
    ids.add("waitingRxCashier");
    ids.add("cashier");
    ids.add("pharmacy");
  }
  if (step.id === 9) {
    ids.add("waitingRxCashier");
    ids.add("pharmacy");
    ids.add("exit");
  }
  return ids;
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

  STEP_SUBWINDOWS.filter((sub) => sub.stepId === step.id).forEach((sub) => {
    const pos = getSubWindowPos(sub);
    minX = Math.min(minX, pos.x - 88);
    maxX = Math.max(maxX, pos.x + 88);
    minY = Math.min(minY, pos.y - 14);
    maxY = Math.max(maxY, pos.y + 14);
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
  onSelectStep,
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
  const [step3PetArrived, setStep3PetArrived] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [petOverridePos, setPetOverridePos] = useState<{ x: number; y: number; statusText: string } | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  isPausedRef.current = isPaused;
  const [stepReplayKey, setStepReplayKey] = useState<number>(0);
  const rafRef = useRef<number | null>(null);

  const handleTogglePause = () => {
    setIsPaused((p) => !p);
  };

  const handleRerunStep = () => {
    setIsPaused(false);
    setStepReplayKey((k) => k + 1);
  };

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

  // Reset wireframe tab & step3 state when step changes
  useEffect(() => {
    setSelectedWireframeIdx(0);
    setZoomLevel(1);
    setIsPaused(false);
    setStep3PetArrived(false);
    setAnimProgress(0);
    setPacketProgress(0);
    setStep3PacketVisible(false);
    setStep3GreenLaneActive(false);
    setCurrentPhase(0);
    setPetOverridePos(null);
    if (currentStep.uiWireframes.length === 0 && sceneLayout === "ui-only") {
      setSceneLayout("split");
    }
  }, [currentStep.id, currentStep.uiWireframes.length, sceneLayout]);

  // Smooth RAF animation for Persistent Pet & Owner + Moving Packets + Sub-steps
  useEffect(() => {
    let lastTs: number | null = null;
    let elapsed = 0;
    const isStep3 = currentStep.id === 3;

    // Reset progress and states on step change or replay
    setAnimProgress(0);
    setPacketProgress(0);
    setStep3PetArrived(false);
    setStep3PacketVisible(false);
    setStep3GreenLaneActive(false);
    setCurrentPhase(0);
    setPetOverridePos(null);

    // Standard step durations
    const transitionDuration = 1800 / playbackSpeed;
    const packetDuration = 1900 / playbackSpeed;

    // Step 3 phased timeline durations (scaled by playbackSpeed) - generous pacing with 2.0s initial linger
    const tCallQueue = 2000 / playbackSpeed;
    const tSignalArrive = 4000 / playbackSpeed;
    const tPetStart = 5200 / playbackSpeed;
    const tPetArrive = 7600 / playbackSpeed;
    const tFadeOutCall = tPetArrive + 1600 / playbackSpeed;
    const tStep3Total = tFadeOutCall + 1000 / playbackSpeed;

    // Step 4: 4 sequential sub-steps with initial delay 2000ms
    const tSub4 = 1800 / playbackSpeed;
    const tPhase1 = 2000 / playbackSpeed;
    const tPhase2 = tPhase1 + tSub4;
    const tPhase3 = tPhase2 + tSub4;
    const tPhase4 = tPhase3 + tSub4;
    const tStep4Total = tPhase4 + 1200 / playbackSpeed;

    // Step 5: Xray / USG (Initial pause 2000ms, sub-step 1800ms, walk 2500ms)
    const tSub5 = 1800 / playbackSpeed;
    const tWalkOut5 = 2500 / playbackSpeed;
    const tWalkBack5 = 2500 / playbackSpeed;
    const p1_5 = 2000 / playbackSpeed;
    const p2_5 = p1_5 + tSub5;
    const p3_5 = p2_5 + tSub5;
    const p4_5 = p3_5 + tSub5;
    const p5_5 = p4_5 + tWalkOut5;
    const p6_5 = p5_5 + tSub5;
    const p7_5 = p6_5 + tSub5;
    const p8_5 = p7_5 + tSub5;
    const p9_5 = p8_5 + tWalkBack5;
    const p10_5 = p9_5 + tSub5;
    const p11_5 = p10_5 + tSub5;
    const p12_5 = p11_5 + tSub5;
    const tStep5Total = p12_5 + tSub5 + 1000 / playbackSpeed;

    // Step 6: Tx Room (Initial pause 2000ms, sub-step 1800ms, walk 2500ms)
    const tSub6 = 1800 / playbackSpeed;
    const tWalkOut6 = 2500 / playbackSpeed;
    const tWalkBack6 = 2500 / playbackSpeed;
    const p1_6 = 2000 / playbackSpeed;
    const p2_6 = p1_6 + tSub6;
    const p3_6 = p2_6 + tSub6;
    const p4_6 = p3_6 + tSub6;
    const p5_6 = p4_6 + tWalkOut6;
    const p6_6 = p5_6 + tSub6;
    const p7_6 = p6_6 + tSub6;
    const p8_6 = p7_6 + tSub6;
    const p9_6 = p8_6 + tWalkBack6;
    const p10_6 = p9_6 + tSub6;
    const p11_6 = p10_6 + tSub6;
    const p12_6 = p11_6 + tSub6;
    const tStep6Total = p12_6 + tSub6 + 1000 / playbackSpeed;

    // Step 7: Take-Home Meds & Waiting Zone (Initial pause 2000ms, sub-step 1800ms, walk 2500ms)
    const tSub7 = 1800 / playbackSpeed;
    const tWalk7 = 2500 / playbackSpeed;
    const p1_7 = 2000 / playbackSpeed;
    const p2_7 = p1_7 + tSub7;
    const p3_7 = p2_7 + tSub7;
    const p4_7 = p3_7 + tSub7;
    const p5_7 = p4_7 + tWalk7;
    const p6_7 = p5_7 + tSub7;
    const p7_7 = p6_7 + tSub7;
    const tStep7Total = p7_7 + tSub7 + 1000 / playbackSpeed;

    // Step 8: Cashier Calling & Receipt (Initial pause 2000ms, sub-step 1800ms, walk 2400ms)
    const tSub8 = 1800 / playbackSpeed;
    const tWalk8 = 2400 / playbackSpeed;
    const p1_8 = 2000 / playbackSpeed;
    const p2_8 = p1_8 + tSub8;
    const p3_8 = p2_8 + tSub8;
    const p4_8 = p3_8 + tWalk8;
    const p5_8 = p4_8 + tSub8;
    const p6_8 = p5_8 + tSub8;
    const p7_8 = p6_8 + tWalk8;
    const p8_8 = p7_8 + tWalk8;
    const tStep8Total = p8_8 + 1200 / playbackSpeed;

    // Step 9: Pharmacy Dispense & Exit (Initial pause 2000ms, sub-step 1800ms, walk 2400ms)
    const tSub9 = 1800 / playbackSpeed;
    const tWalk9 = 2400 / playbackSpeed;
    const p1_9 = 2000 / playbackSpeed;
    const p2_9 = p1_9 + tSub9;
    const p3_9 = p2_9 + tWalk9;
    const p4_9 = p3_9 + tSub9;
    const p5_9 = p4_9 + tWalk9;
    const tStep9Total = p5_9 + 1200 / playbackSpeed;

    const tick = (timestamp: number) => {
      if (lastTs === null) lastTs = timestamp;
      const delta = timestamp - lastTs;
      lastTs = timestamp;

      if (isPausedRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      elapsed += delta;

      if (isStep3) {
        if (elapsed < tCallQueue) {
          // 1. Show Pet at waiting hall, system queue display, DVM call queue (DVM pulses)
          setAnimProgress(0);
          setPacketProgress(0);
          setStep3PacketVisible(false);
          setStep3GreenLaneActive(false);
          setStep3PulseNode("examGeneral");
          setStep3CustomStatus("นั่งรอเรียกคิวที่ Waiting Hall (คิว WA001) · สัตวแพทย์กดเรียกคิว");
          setStep3PetArrived(false);
        } else if (elapsed < tSignalArrive) {
          // 2. Green arrow & system call moves from exam room to waiting hall
          setAnimProgress(0);
          const frac = Math.min(1, (elapsed - tCallQueue) / (tSignalArrive - tCallQueue));
          setPacketProgress(easeInOutCubic(frac));
          setStep3PacketVisible(true);
          setStep3GreenLaneActive(true);
          setStep3PulseNode(frac > 0.6 ? "waitingHall" : "examGeneral");
          setStep3CustomStatus("ระบบส่งสัญญาณเรียกคิวและเสียงประกาศ WA001 -> โถงพักคอย");
          setStep3PetArrived(false);
        } else if (elapsed < tPetStart) {
          // 2. Pause at waiting hall: TV screen updated, voice announced (Waiting Hall pulses)
          setAnimProgress(0);
          setPacketProgress(1);
          setStep3PacketVisible(true);
          setStep3GreenLaneActive(true);
          setStep3PulseNode("waitingHall");
          setStep3CustomStatus("จอ TV อัปเดตคิว WA001 เข้าตรวจ Zone A ห้อง 1 · เจ้าของเตรียมพาสัตว์เข้าห้อง");
          setStep3PetArrived(false);
        } else if (elapsed < tPetArrive) {
          // 3. Pet & Owner moves to exam room (Keep system call window visible!)
          const petFrac = Math.min(1, (elapsed - tPetStart) / (tPetArrive - tPetStart));
          setAnimProgress(easeInOutCubic(petFrac));
          setPacketProgress(1);
          setStep3PacketVisible(true);
          setStep3GreenLaneActive(petFrac < 0.7);
          setStep3PulseNode(petFrac > 0.65 ? "examGeneral" : "waitingHall");
          setStep3CustomStatus("เดินเข้าห้องตรวจ Exam Room (General · Zone A ห้อง 1)");
          setStep3PetArrived(false);
        } else if (elapsed < tFadeOutCall) {
          // 4. Reached exam room: DVM starts exam, system call stays visible for 1 full second!
          setAnimProgress(1);
          setPacketProgress(1);
          setStep3PacketVisible(true);
          setStep3GreenLaneActive(false);
          setStep3PulseNode("examGeneral");
          setStep3CustomStatus("เข้าห้องตรวจเรียบร้อย (Zone A ห้อง 1) · สัตวแพทย์เริ่มตรวจรักษา");
          setStep3PetArrived(true);
        } else {
          // 5. 1s after DVM started: system call fades out and disappears!
          setAnimProgress(1);
          setPacketProgress(1);
          setStep3PacketVisible(false);
          setStep3GreenLaneActive(false);
          setStep3PulseNode("examGeneral");
          setStep3CustomStatus("สัตวแพทย์เริ่มตรวจรักษาในห้องตรวจ");
          setStep3PetArrived(true);
        }

        if (elapsed < tStep3Total) {
          rafRef.current = requestAnimationFrame(tick);
        }
      } else if (currentStep.id === 4) {
        // Step 4: 4 sequential sub-steps
        setAnimProgress(1);
        setPacketProgress(1);
        setPetOverridePos(null);

        if (elapsed < tPhase1) {
          setCurrentPhase(0);
        } else if (elapsed < tPhase2) {
          setCurrentPhase(1);
        } else if (elapsed < tPhase3) {
          setCurrentPhase(2);
        } else if (elapsed < tPhase4) {
          setCurrentPhase(3);
        } else {
          setCurrentPhase(4);
        }

        if (elapsed < tStep4Total) {
          rafRef.current = requestAnimationFrame(tick);
        }
      } else if (currentStep.id === 5) {
        // Step 5: Xray / USG (12 sub-steps with pet roundtrip and data return)
        const stExam = STATIONS.examGeneral;
        const stXray = STATIONS.xrayUsg;

        if (elapsed < p1_5) {
          setCurrentPhase(0);
          setPetOverridePos(null);
        } else if (elapsed < p2_5) {
          setCurrentPhase(1);
          setPetOverridePos(null);
        } else if (elapsed < p3_5) {
          setCurrentPhase(2);
          setPetOverridePos(null);
        } else if (elapsed < p4_5) {
          setCurrentPhase(3);
          setPetOverridePos(null);
        } else if (elapsed < p5_5) {
          setCurrentPhase(4);
          const f = Math.min(1, (elapsed - p4_5) / (p5_5 - p4_5));
          const eased = easeInOutCubic(f);
          setPetOverridePos({
            x: stExam.x,
            y: stExam.y + (stXray.y - stExam.y) * eased,
            statusText: "พาสัตว์ไปรอเรียกที่จุดบริการ Xray / USG"
          });
        } else if (elapsed < p6_5) {
          setCurrentPhase(5);
          setPetOverridePos({ x: stXray.x, y: stXray.y, statusText: "เจ้าหน้าที่ Xray/USG ตรวจสอบ order และเรียกเคส" });
        } else if (elapsed < p7_5) {
          setCurrentPhase(6);
          setPetOverridePos({ x: stXray.x, y: stXray.y, statusText: "พาสัตว์เข้ารับการตรวจ Xray / USG" });
        } else if (elapsed < p8_5) {
          setCurrentPhase(7);
          setPetOverridePos({ x: stXray.x, y: stXray.y, statusText: "เจ้าหน้าที่ปฏิบัติงานตรวจรังสีวินิจฉัย" });
        } else if (elapsed < p9_5) {
          setCurrentPhase(8);
          const f = Math.min(1, (elapsed - p8_5) / (p9_5 - p8_5));
          const eased = easeInOutCubic(f);
          setPetOverridePos({
            x: stExam.x,
            y: stXray.y + (stExam.y - stXray.y) * eased,
            statusText: "เสร็จสิ้นการตรวจรังสี พาสัตว์กลับห้องตรวจ (Exam Room)"
          });
        } else if (elapsed < p10_5) {
          setCurrentPhase(9);
          setPetOverridePos({ x: stExam.x, y: stExam.y, statusText: "บันทึกผล Xray/USG ลงระบบเรียบร้อย กลับถึงห้องตรวจ" });
        } else if (elapsed < p11_5) {
          setCurrentPhase(10);
          setPetOverridePos({ x: stExam.x, y: stExam.y, statusText: "ส่งผลภาพถ่ายรังสีและรายงานกลับห้องตรวจ (System Data Flow)" });
        } else if (elapsed < p12_5) {
          setCurrentPhase(11);
          setPetOverridePos({ x: stExam.x, y: stExam.y, statusText: "สัตวแพทย์รับผลตรวจและเรียกเข้าห้องตรวจต่อ" });
        } else {
          setCurrentPhase(12);
          setPetOverridePos({ x: stExam.x, y: stExam.y, statusText: "เข้าห้องตรวจต่อ สัตวแพทย์อธิบายผลภาพถ่ายรังสี" });
        }

        if (elapsed < tStep5Total) {
          rafRef.current = requestAnimationFrame(tick);
        }
      } else if (currentStep.id === 6) {
        // Step 6: Tx Room (12 sub-steps with pet roundtrip to txRoom and data return)
        const stExam = STATIONS.examGeneral;
        const stTx = STATIONS.txRoom;

        if (elapsed < p1_6) {
          setCurrentPhase(0);
          setPetOverridePos(null);
        } else if (elapsed < p2_6) {
          setCurrentPhase(1);
          setPetOverridePos(null);
        } else if (elapsed < p3_6) {
          setCurrentPhase(2);
          setPetOverridePos(null);
        } else if (elapsed < p4_6) {
          setCurrentPhase(3);
          setPetOverridePos(null);
        } else if (elapsed < p5_6) {
          setCurrentPhase(4);
          const f = Math.min(1, (elapsed - p4_6) / (p5_6 - p4_6));
          const eased = easeInOutCubic(f);
          setPetOverridePos({
            x: stExam.x + (stTx.x - stExam.x) * eased,
            y: stExam.y + (stTx.y - stExam.y) * eased,
            statusText: "พาสัตว์ไปรอเรียกที่ห้องหัตถการ (Tx Room)"
          });
        } else if (elapsed < p6_6) {
          setCurrentPhase(5);
          setPetOverridePos({ x: stTx.x, y: stTx.y, statusText: "เจ้าหน้าที่ Tx Room ตรวจสอบ order และเรียกเคส" });
        } else if (elapsed < p7_6) {
          setCurrentPhase(6);
          setPetOverridePos({ x: stTx.x, y: stTx.y, statusText: "พาสัตว์เข้ารับบริการฉีดยา / ทำหัตถการ" });
        } else if (elapsed < p8_6) {
          setCurrentPhase(7);
          setPetOverridePos({ x: stTx.x, y: stTx.y, statusText: "เจ้าหน้าที่และสัตวแพทย์จัดยาฉีด ฉีดยา & ทำแผล" });
        } else if (elapsed < p9_6) {
          setCurrentPhase(8);
          const f = Math.min(1, (elapsed - p8_6) / (p9_6 - p8_6));
          const eased = easeInOutCubic(f);
          setPetOverridePos({
            x: stTx.x + (stExam.x - stTx.x) * eased,
            y: stTx.y + (stExam.y - stTx.y) * eased,
            statusText: "ทำหัตถการเสร็จสิ้น พาสัตว์กลับห้องตรวจ (Exam Room)"
          });
        } else if (elapsed < p10_6) {
          setCurrentPhase(9);
          setPetOverridePos({ x: stExam.x, y: stExam.y, statusText: "บันทึกผลรายการหัตถการลงระบบเรียบร้อย กลับถึงห้องตรวจ" });
        } else if (elapsed < p11_6) {
          setCurrentPhase(10);
          setPetOverridePos({ x: stExam.x, y: stExam.y, statusText: "ส่งผลและบันทึกรายการหัตถการกลับห้องตรวจ (System Data Flow)" });
        } else if (elapsed < p12_6) {
          setCurrentPhase(11);
          setPetOverridePos({ x: stExam.x, y: stExam.y, statusText: "สัตวแพทย์ตรวจประเมินผลหลังหัตถการ" });
        } else {
          setCurrentPhase(12);
          setPetOverridePos({ x: stExam.x, y: stExam.y, statusText: "เข้าห้องตรวจต่อ สัตวแพทย์สรุปอาการหลังหัตถการ" });
        }

        if (elapsed < tStep6Total) {
          rafRef.current = requestAnimationFrame(tick);
        }
      } else if (currentStep.id === 7) {
        // Step 7: Take-Home Meds & Waiting Zone (Starts from exam room)
        const stExam = STATIONS.examGeneral;
        const stWait = STATIONS.waitingRxCashier;

        if (elapsed < p1_7) {
          setCurrentPhase(0);
          setPetOverridePos(null);
        } else if (elapsed < p2_7) {
          setCurrentPhase(1);
          setPetOverridePos(null);
        } else if (elapsed < p3_7) {
          setCurrentPhase(2);
          setPetOverridePos(null);
        } else if (elapsed < p4_7) {
          setCurrentPhase(3);
          setPetOverridePos({ x: stExam.x, y: stExam.y, statusText: "ส่งข้อมูลคำสั่งยานำกลับไปยังห้อง Rx เพื่อจัดยา" });
        } else if (elapsed < p5_7) {
          setCurrentPhase(4);
          const f = Math.min(1, (elapsed - p4_7) / (p5_7 - p4_7));
          const eased = easeInOutCubic(f);
          setPetOverridePos({
            x: stExam.x + (stWait.x - stExam.x) * eased,
            y: stExam.y + (stWait.y - stExam.y) * eased,
            statusText: "เดินออกจากห้องตรวจ ไปรอที่ Waiting Zone (Rx, Cashier)"
          });
        } else if (elapsed < p6_7) {
          setCurrentPhase(5);
          setPetOverridePos({
            x: stWait.x,
            y: stWait.y,
            statusText: "เจ้าหน้าที่ห้อง Rx เริ่มจัดยานำกลับตาม order"
          });
        } else if (elapsed < p7_7) {
          setCurrentPhase(6);
          setPetOverridePos({
            x: stWait.x,
            y: stWait.y,
            statusText: "เจ้าหน้าที่ห้อง Rx บันทึกและลงข้อมูลยานำกลับ"
          });
        } else {
          setCurrentPhase(7);
          setPetOverridePos({
            x: stWait.x,
            y: stWait.y,
            statusText: "ระบบรวบรวมค่ารักษาและส่งข้อมูลการเงิน (Billing Summary) · นั่งรอเรียกคิว"
          });
        }

        if (elapsed < tStep7Total) {
          rafRef.current = requestAnimationFrame(tick);
        }
      } else if (currentStep.id === 8) {
        // Step 8: Cashier Calling & Receipt Handover
        const stWait = STATIONS.waitingRxCashier;
        const stCashier = STATIONS.cashier;
        const stPharm = STATIONS.pharmacy;

        if (elapsed < p1_8) {
          setCurrentPhase(0);
          setPetOverridePos({ x: stWait.x, y: stWait.y, statusText: "รอเรียกคิวชำระเงินที่ Waiting Zone" });
        } else if (elapsed < p2_8) {
          setCurrentPhase(1);
          setPetOverridePos({ x: stWait.x, y: stWait.y, statusText: "เจ้าหน้าที่การเงินตรวจสอบข้อมูลค่ารักษา" });
        } else if (elapsed < p3_8) {
          setCurrentPhase(2);
          setPetOverridePos({ x: stWait.x, y: stWait.y, statusText: "ระบบเรียกคิวชำระเงิน (Calling)" });
        } else if (elapsed < p4_8) {
          setCurrentPhase(3);
          const f = Math.min(1, (elapsed - p3_8) / (p4_8 - p3_8));
          const eased = easeInOutCubic(f);
          setPetOverridePos({
            x: stWait.x + (stCashier.x - stWait.x) * eased,
            y: stWait.y + (stCashier.y - stWait.y) * eased,
            statusText: "เดินไปที่จุดชำระเงิน (Cashier)"
          });
        } else if (elapsed < p5_8) {
          setCurrentPhase(4);
          setPetOverridePos({ x: stCashier.x, y: stCashier.y, statusText: "ชำระเงินที่จุด Cashier เรียบร้อย ได้รับใบเสร็จ" });
        } else if (elapsed < p6_8) {
          setCurrentPhase(5);
          setPetOverridePos({ x: stCashier.x, y: stCashier.y, statusText: "ได้รับใบเสร็จ · ระบบส่งสัญญาณการเงินไปห้องยา & เส้นทางไปห้องยาเปิดใช้งาน" });
        } else if (elapsed < p7_8) {
          setCurrentPhase(6);
          const f = Math.min(1, (elapsed - p6_8) / (p7_8 - p6_8));
          const eased = easeInOutCubic(f);
          setPetOverridePos({
            x: stCashier.x,
            y: stCashier.y + (stPharm.y - stCashier.y) * eased,
            statusText: "นำใบเสร็จไปยื่นที่ห้องจ่ายยา (Pharmacy)"
          });
        } else if (elapsed < p8_8) {
          setCurrentPhase(7);
          const f = Math.min(1, (elapsed - p7_8) / (p8_8 - p7_8));
          const eased = easeInOutCubic(f);
          setPetOverridePos({
            x: stPharm.x + (stWait.x - stPharm.x) * eased,
            y: stPharm.y,
            statusText: "ยื่นใบเสร็จที่ห้องยาเรียบร้อย · กลับมารอเรียกที่ Waiting Zone"
          });
        } else {
          setCurrentPhase(7);
          setPetOverridePos({
            x: stWait.x,
            y: stWait.y,
            statusText: "นั่งรอเรียกคิวรับยาที่ Waiting Zone (Rx, Cashier)"
          });
        }

        if (elapsed < tStep8Total) {
          rafRef.current = requestAnimationFrame(tick);
        }
      } else if (currentStep.id === 9) {
        // Step 9: Pharmacy Dispense & Exit
        const stWait = STATIONS.waitingRxCashier;
        const stPharm = STATIONS.pharmacy;
        const stExit = STATIONS.exit;

        if (elapsed < p1_9) {
          setCurrentPhase(0);
          setPetOverridePos({ x: stWait.x, y: stWait.y, statusText: "รอเรียกคิวรับยาที่ Waiting Zone" });
        } else if (elapsed < p2_9) {
          setCurrentPhase(1);
          const f = Math.min(1, (elapsed - p1_9) / (p2_9 - p1_9));
          const eased = easeInOutCubic(f);
          setPetOverridePos({
            x: stWait.x + (stPharm.x - stWait.x) * eased,
            y: stWait.y,
            statusText: "Pharmacy Calling เรียกคิว · เดินไปรับยาที่ห้องยา"
          });
        } else if (elapsed < p3_9) {
          setCurrentPhase(2);
          setPetOverridePos({
            x: stPharm.x,
            y: stPharm.y,
            statusText: "รับยา คำแนะนำการใช้ยา และเซ็นรับยาเรียบร้อย"
          });
        } else if (elapsed < p4_9) {
          setCurrentPhase(3);
          const f = Math.min(1, (elapsed - p3_9) / (p4_9 - p3_9));
          const eased = easeInOutCubic(f);
          setPetOverridePos({
            x: stPharm.x + (stExit.x - stPharm.x) * eased,
            y: stPharm.y,
            statusText: "ระบบปิด Visit (Auto-Discharge) · เดินทางกลับทาง Exit"
          });
        } else {
          setCurrentPhase(4);
          setPetOverridePos({
            x: stExit.x,
            y: stPharm.y,
            statusText: "เสร็จสิ้นการรักษา พาสัตว์เลี้ยงเดินทางกลับบ้านทาง Exit"
          });
        }

        if (elapsed < tStep9Total) {
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
  }, [currentStep.id, playbackSpeed, animKey, stepReplayKey]);

  // Persistent Pet & Owner interpolated coordinates
  const ownerFrom = STATIONS[currentStep.petOwner.fromNode] || STATIONS.entrance;
  const ownerTo = STATIONS[currentStep.petOwner.toNode] || ownerFrom;
  const ownerX = petOverridePos ? petOverridePos.x : (ownerFrom.x + (ownerTo.x - ownerFrom.x) * animProgress);
  const ownerY = petOverridePos ? petOverridePos.y : (ownerFrom.y + (ownerTo.y - ownerFrom.y) * animProgress);

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
          {/* BAR 2: TOOLBAR (Compact 2 rows: Row 1 = Controls / Row 2 = Live Status) */}
          <div className="pe-sim-toolbar shrink-0 bg-[#f4ebd9] border-b border-[#d8c6aa] px-3 py-1 flex flex-col gap-1">
            {/* ROW 1: ACTIONS & CAMERA ZOOM */}
            <div className="flex items-center justify-between gap-2 min-h-[28px]">
              {/* Left: Button to Switch to UI & SCENE + Pause/Resume + Rerun Step */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onSwitchView?.("scene")}
                  className="h-7 px-2.5 bg-[#b4531a] hover:bg-[#331e10] text-[#fcf8ee] text-[11.5px] font-extrabold rounded-xs flex items-center gap-1.5 cursor-pointer transition shrink-0 shadow-2xs border-0"
                  title="สลับไปดูหน้าจอ KAHIS UI และฉากจำลองของขั้นตอนนี้ (UI & SCENE)"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>ดูหน้า UI {currentStep.uiWireframes.length > 0 ? `(${currentStep.uiWireframes.length})` : ""}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={handleTogglePause}
                  className={`h-7 px-2 text-[11px] font-extrabold rounded-xs border cursor-pointer transition flex items-center gap-1 shrink-0 ${
                    isPaused
                      ? "bg-[#16a34a] text-[#ffffff] border-[#16a34a] hover:bg-[#15803d]"
                      : "bg-[#fcf8ee] text-[#4a2e1b] border-[#d8c6aa] hover:bg-[#efe4ca]"
                  }`}
                  title={isPaused ? "เล่นต่อ (Resume)" : "หยุดชั่วคราว (Pause)"}
                >
                  {isPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>เล่นต่อ</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current text-[#d97706]" />
                      <span>หยุด</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleRerunStep}
                  className="h-7 px-2 bg-[#fcf8ee] hover:bg-[#efe4ca] text-[#4a2e1b] text-[11px] font-extrabold rounded-xs border border-[#d8c6aa] flex items-center gap-1 cursor-pointer transition shrink-0"
                  title="เล่นซ้ำขั้นตอนนี้ (Replay current step)"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#b4531a]" />
                  <span>เล่นซ้ำขั้นนี้</span>
                </button>

                {/* PREV / STEP / NEXT NAVIGATION */}
                <div className="flex items-center gap-0.5 border border-[#d8c6aa] bg-[#fcf8ee] rounded-xs px-0.5 shadow-2xs shrink-0">
                  <button
                    type="button"
                    onClick={() => onSelectStep?.(Math.max(1, currentStep.id - 1))}
                    disabled={currentStep.id <= 1}
                    className="h-7 w-6 flex items-center justify-center text-[#4a2e1b] hover:bg-[#efe4ca] disabled:opacity-30 disabled:hover:bg-transparent rounded-xs cursor-pointer transition"
                    title="ขั้นตอนก่อนหน้า (←)"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10.5px] font-extrabold text-[#331e10] px-1 select-none whitespace-nowrap">
                    STEP {currentStep.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectStep?.(Math.min(9, currentStep.id + 1))}
                    disabled={currentStep.id >= 9}
                    className="h-7 w-6 flex items-center justify-center text-[#4a2e1b] hover:bg-[#efe4ca] disabled:opacity-30 disabled:hover:bg-transparent rounded-xs cursor-pointer transition"
                    title="ขั้นตอนถัดไป (→)"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right: Camera Mode & Zoom Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] font-extrabold text-[#7a5a40] mr-1 hidden sm:inline">
                  CAMERA:
                </span>
                <button
                  type="button"
                  onClick={() => setIsAutoZoom(true)}
                  className={`h-7 px-2 text-[11px] font-extrabold rounded-xs border cursor-pointer transition flex items-center gap-1 ${
                    isAutoZoom
                      ? "bg-[#b4531a] text-[#fcf8ee] border-[#b4531a]"
                      : "bg-[#fcf8ee] text-[#4a2e1b] border-[#d8c6aa] hover:bg-[#efe4ca]"
                  }`}
                  title="ซูมและติดตามขั้นตอนอัตโนมัติ (Step Zoom)"
                >
                  <ZoomIn className="w-3 h-3" />
                  <span>STEP ZOOM</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAutoZoom(false)}
                  className={`h-7 px-2 text-[11px] font-extrabold rounded-xs border cursor-pointer transition flex items-center gap-1 ${
                    !isAutoZoom
                      ? "bg-[#331e10] text-[#fcf8ee] border-[#331e10]"
                      : "bg-[#fcf8ee] text-[#4a2e1b] border-[#d8c6aa] hover:bg-[#efe4ca]"
                  }`}
                  title="ดูแผนผังภาพรวมทั้งโรงพยาบาล (Full Map 100%)"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>FULL MAP</span>
                </button>
                {!isAutoZoom && (
                  <div className="flex items-center gap-1 ml-0.5">
                    <button
                      type="button"
                      onClick={() => handleZoomButton(1 / 1.35)}
                      className="h-7 w-7 flex items-center justify-center rounded-xs border border-[#d8c6aa] bg-[#fcf8ee] text-[#4a2e1b] hover:bg-[#efe4ca] cursor-pointer"
                      title="ซูมออก (-)"
                    >
                      <ZoomOut className="w-3 h-3" />
                    </button>
                    <span className="text-[11px] font-extrabold text-[#4a2e1b] min-w-[34px] text-center">
                      {currentZoomPct}%
                    </span>
                    <button
                      type="button"
                      onClick={() => handleZoomButton(1.35)}
                      className="h-7 w-7 flex items-center justify-center rounded-xs border border-[#d8c6aa] bg-[#fcf8ee] text-[#4a2e1b] hover:bg-[#efe4ca] cursor-pointer"
                      title="ซูมเข้า (+)"
                    >
                      <ZoomIn className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={handleResetFullMap}
                      className="h-7 px-2 text-[10.5px] font-extrabold rounded-xs border border-[#d8c6aa] bg-[#fcf8ee] text-[#4a2e1b] hover:bg-[#efe4ca] cursor-pointer"
                      title="รีเซ็ตมุมมองเป็น 100%"
                    >
                      RESET
                    </button>
                  </div>
                )}
                <span className="text-[10px] font-bold text-[#7a5a40] ml-1.5 hidden md:inline">
                  ล้อเมาส์=ซูม · ลาก=เลื่อน
                </span>
              </div>
            </div>

            {/* ROW 2: LIVE STATUS & CONTEXT */}
            <div className="flex items-center justify-between gap-2 text-[12px] min-w-0 pt-0.5 border-t border-[#d8c6aa]/50">
              <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                <span className="px-1.5 py-0.2 text-[10px] font-extrabold tracking-wider bg-[#331e10] text-[#fcf8ee] rounded-xs shrink-0">
                  STEP {currentStep.id} LIVE
                </span>
                <span className="w-2 h-2 rounded-full bg-[#8c5828] inline-block shrink-0" />
                <span
                  className="font-bold text-[#331e10] truncate"
                  title={
                    petOverridePos?.statusText
                      ? petOverridePos.statusText
                      : currentStep.id === 3 && step3CustomStatus
                      ? step3CustomStatus
                      : currentStep.petOwner.statusLabel
                  }
                >
                  Pet &amp; Owner:{" "}
                  <span className="font-medium text-[#5a3a20]">
                    {petOverridePos?.statusText
                      ? petOverridePos.statusText
                      : currentStep.id === 3 && step3CustomStatus
                      ? step3CustomStatus
                      : currentStep.petOwner.statusLabel}
                  </span>
                </span>
              </div>
              {currentStep.uiWireframes.length > 0 && (
                <span className="text-[10.5px] font-bold text-[#1f7a4c] bg-[#dfece3] px-2 py-0.2 rounded-xs border border-[#b8d4c2] shrink-0">
                  {currentStep.module} ({currentStep.uiWireframes.length} หน้าจอ)
                </span>
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

                {/* Vertical Band: Rx & Pharmacy Unit */}
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
                  RX &amp; PHARMACY
                </text>
              </g>
            )}

            {/* =================================================================
                LAYER 1: MULTI-STREAM LANES (<g className="lanes">)
                - Future lanes are strictly hidden (never appear before their process step)
                - In STEP ZOOM mode: only render lanes active in the current step
                - In FULL MAP mode: past completed lanes render as faint static guidelines (opacity 0.18)
                - Stream styling: Pet & Owner (Brown Solid) vs System Data Flow (Green Dashed)
                ================================================================= */}
            <g className="lanes">
              {STATION_LANES.filter((lane) => {
                // Strict check: future lanes never appear before their process step
                const minStep = LANE_MIN_STEP[lane.id] ?? 1;
                if (minStep > currentStep.id) {
                  return false;
                }

                // Owner movement lanes only appear during their active step (past movement paths disappear)
                if (lane.stream === "owner") {
                  if (currentStep.id === 5) {
                    if (lane.id === "owner:examGeneral>xrayUsg") return currentPhase >= 4 && currentPhase <= 7;
                    if (lane.id === "owner:xrayUsg>examGeneral") return currentPhase >= 8 && currentPhase <= 9;
                    return false;
                  }
                  if (currentStep.id === 6) {
                    if (lane.id === "owner:examGeneral>txRoom") return currentPhase >= 4 && currentPhase <= 7;
                    if (lane.id === "owner:txRoom>examGeneral") return currentPhase >= 8 && currentPhase <= 9;
                    return false;
                  }
                  if (currentStep.id === 7) {
                    if (lane.id === "owner:examGeneral>waitingRxCashier") return currentPhase >= 4;
                    return false;
                  }
                  if (currentStep.id === 8) {
                    if (lane.id === "owner:waitingRxCashier>cashier") return currentPhase >= 2 && currentPhase <= 3;
                    if (lane.id === "owner:cashier>pharmacy") return currentPhase >= 5 && currentPhase <= 6;
                    if (lane.id === "owner:pharmacy>waitingRxCashier") return currentPhase >= 7;
                    return false;
                  }
                  if (currentStep.id === 9) {
                    if (lane.id === "owner:waitingRxCashier>pharmacy") return currentPhase <= 2;
                    if (lane.id === "owner:pharmacy>exit") return currentPhase >= 3;
                    return false;
                  }
                  if (lane.id !== currentStep.laneId && !currentStep.activeLanes.includes(lane.id)) {
                    return false;
                  }
                }

                let isActive =
                  Boolean(currentStep.laneId && lane.id === currentStep.laneId) ||
                  currentStep.activeLanes.includes(lane.id);

                // Step 3: green system lane activates only when system signal is sent in Phase 2
                if (currentStep.id === 3 && lane.id === "system:examGeneral>waitingHall") {
                  isActive = step3GreenLaneActive;
                }
                // Step 3: owner walkway lane activates when pet starts walking
                if (currentStep.id === 3 && lane.id === "owner:waitingHall>examGeneral") {
                  isActive = animProgress > 0.02;
                }
                if (currentStep.id === 5) {
                  if (lane.id === "owner:examGeneral>xrayUsg") isActive = currentPhase >= 4 && currentPhase <= 7;
                  if (lane.id === "owner:xrayUsg>examGeneral") isActive = currentPhase >= 8 && currentPhase <= 9;
                  if (lane.id === "system:xrayUsg>examGeneral") isActive = currentPhase >= 10;
                }
                if (currentStep.id === 6) {
                  if (lane.id === "owner:examGeneral>txRoom") isActive = currentPhase >= 4 && currentPhase <= 7;
                  if (lane.id === "owner:txRoom>examGeneral") isActive = currentPhase >= 8 && currentPhase <= 9;
                  if (lane.id === "system:txRoom>examGeneral") isActive = currentPhase >= 10;
                }
                if (currentStep.id === 7) {
                  if (lane.id === "system:examGeneral>rxRoom") isActive = currentPhase >= 3;
                  if (lane.id === "owner:examGeneral>waitingRxCashier") isActive = currentPhase >= 4;
                }
                if (currentStep.id === 8) {
                  if (lane.id === "owner:waitingRxCashier>cashier") isActive = currentPhase >= 2 && currentPhase <= 3;
                  if (lane.id === "owner:cashier>pharmacy") isActive = currentPhase >= 5 && currentPhase <= 6;
                  if (lane.id === "system:cashier>pharmacy") isActive = currentPhase >= 5;
                  if (lane.id === "owner:pharmacy>waitingRxCashier") isActive = currentPhase >= 7;
                }
                if (currentStep.id === 9) {
                  if (lane.id === "owner:waitingRxCashier>pharmacy") isActive = currentPhase <= 2;
                  if (lane.id === "owner:pharmacy>exit") isActive = currentPhase >= 3;
                }

                // In STEP ZOOM: isolate only active lanes for current step
                if (isAutoZoom) {
                  return isActive;
                }
                // In FULL MAP: show lanes reached so far (past ones render faintly, future hidden)
                return true;
              }).map((lane) => {
                let isActive =
                  Boolean(currentStep.laneId && lane.id === currentStep.laneId) ||
                  currentStep.activeLanes.includes(lane.id);

                // Step 3: green system lane activates only when system signal is sent in Phase 2
                if (currentStep.id === 3 && lane.id === "system:examGeneral>waitingHall") {
                  isActive = step3GreenLaneActive;
                }
                // Step 3: owner walkway lane activates when pet starts walking
                if (currentStep.id === 3 && lane.id === "owner:waitingHall>examGeneral") {
                  isActive = animProgress > 0.02;
                }
                if (currentStep.id === 5) {
                  if (lane.id === "owner:examGeneral>xrayUsg") isActive = currentPhase >= 4 && currentPhase <= 7;
                  if (lane.id === "owner:xrayUsg>examGeneral") isActive = currentPhase >= 8 && currentPhase <= 9;
                  if (lane.id === "system:xrayUsg>examGeneral") isActive = currentPhase >= 10;
                }
                if (currentStep.id === 6) {
                  if (lane.id === "owner:examGeneral>txRoom") isActive = currentPhase >= 4 && currentPhase <= 7;
                  if (lane.id === "owner:txRoom>examGeneral") isActive = currentPhase >= 8 && currentPhase <= 9;
                  if (lane.id === "system:txRoom>examGeneral") isActive = currentPhase >= 10;
                }
                if (currentStep.id === 7) {
                  if (lane.id === "system:examGeneral>rxRoom") isActive = currentPhase >= 3;
                  if (lane.id === "owner:examGeneral>waitingRxCashier") isActive = currentPhase >= 4;
                }
                if (currentStep.id === 8) {
                  if (lane.id === "owner:waitingRxCashier>cashier") isActive = currentPhase >= 2 && currentPhase <= 3;
                  if (lane.id === "owner:cashier>pharmacy") isActive = currentPhase >= 5 && currentPhase <= 6;
                  if (lane.id === "system:cashier>pharmacy") isActive = currentPhase >= 5;
                  if (lane.id === "owner:pharmacy>waitingRxCashier") isActive = currentPhase >= 7;
                }
                if (currentStep.id === 9) {
                  if (lane.id === "owner:waitingRxCashier>pharmacy") isActive = currentPhase <= 2;
                  if (lane.id === "owner:pharmacy>exit") isActive = currentPhase >= 3;
                }

                let strokeColor = "#cfbeaa";
                let dashArray = "4 4";
                let marker: string | undefined = undefined;
                let strokeW = isActive ? 2.8 : 1.2;

                if (isActive) {
                  if (lane.stream === "owner") {
                    // 1. Pet & Owner Movement: Brown solid line
                    strokeColor = "#8c5828";
                    dashArray = "none";
                    marker = "url(#arrow-owner)";
                    strokeW = 3.2;
                  } else {
                    // 2. All data streams are System Data Flow: Green dashed line
                    strokeColor = "#16a34a";
                    dashArray = "6 4";
                    marker = "url(#arrow-system)";
                    strokeW = 2.8;
                  }
                }

                const laneOpacity =
                  currentStep.id === 3 && lane.stream === "system" && !step3GreenLaneActive
                    ? 0.08
                    : isActive
                    ? 1
                    : 0.18;

                return (
                  <g key={lane.id}>
                    {isActive && (
                      <path
                        d={lane.d}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={strokeW + 4}
                        opacity="0.18"
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
                  if (pkt.id === "pkt-step5-sideflow-back" && currentPhase < 7) return false;
                  if (pkt.id === "pkt-step6-sideflow-back" && currentPhase < 7) return false;
                  if (pkt.id === "pkt-step8-sys-pharm" && currentPhase < 5) return false;
                  return true;
                })
                .map((pkt) => {
                  const fromSt = STATIONS[pkt.fromNode];
                  const toSt = STATIONS[pkt.toNode];
                  if (!fromSt || !toSt) return null;

                  const hasWire = Boolean(pkt.laneId && pkt.fromNode !== pkt.toNode);

                  // Animate once from source station to destination station stop position (t: 0 -> 1)
                  const startX = fromSt.x;
                  const startY = fromSt.y - 28;
                  const endX = toSt.x + (pkt.stopOffsetX ?? 0);
                  const endY = toSt.y + (pkt.stopOffsetY ?? -68);

                  const cardCenterX = hasWire ? (startX + (endX - startX) * packetProgress) : endX;
                  const cardCenterY = hasWire ? (startY + (endY - startY) * packetProgress) : endY;

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
                      {/* Connector from wire dot to packet card (only when connected by wire) */}
                      {hasWire && (
                        <>
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
                        </>
                      )}

                      {/* Protocol-Explorer Style Compact Packet Card (Support 2-row or 3-row layout) */}
                      {(() => {
                        const hasLines = Boolean(pkt.lines && pkt.lines.length > 0);
                        const cardW = hasLines ? 146 : 126;
                        const cardH = hasLines ? 44 : 29;
                        return (
                          <g transform={`translate(${cardCenterX - cardW / 2}, ${cardCenterY - cardH / 2})`}>
                            <rect
                              x="0"
                              y="0"
                              width={cardW}
                              height={cardH}
                              rx="3"
                              fill={palette.bg}
                              stroke={palette.border}
                              strokeWidth="1.3"
                            />
                            {/* Header Tag Strip */}
                            <rect
                              x="0"
                              y="0"
                              width={cardW}
                              height="14"
                              rx="2.5"
                              fill={palette.badgeBg}
                            />
                            <text
                              x={cardW / 2}
                              y="10.2"
                              textAnchor="middle"
                              fontSize="8.5"
                              fontWeight="800"
                              letterSpacing="0.06em"
                              fill="#ffffff"
                            >
                              {pkt.tag}
                            </text>

                            {/* Body: 2 sub-rows for 3-row card (e.g. Check-in List) or single title */}
                            {hasLines && pkt.lines ? (
                              <>
                                <text
                                  x={cardW / 2}
                                  y="24"
                                  textAnchor="middle"
                                  fontSize="8.6"
                                  fontWeight="800"
                                  fill={palette.text}
                                >
                                  {pkt.lines[0]}
                                </text>
                                <text
                                  x={cardW / 2}
                                  y="36.5"
                                  textAnchor="middle"
                                  fontSize="8.6"
                                  fontWeight="800"
                                  fill={palette.text}
                                >
                                  {pkt.lines[1]}
                                </text>
                              </>
                            ) : (
                              <text
                                x={cardW / 2}
                                y="23.8"
                                textAnchor="middle"
                                fontSize="9"
                                fontWeight="800"
                                fill={palette.text}
                              >
                                {pkt.title}
                              </text>
                            )}
                          </g>
                        );
                      })()}
                    </g>
                  );
                })}
            </g>

            {/* =================================================================
                LAYER 6: DYNAMIC STATION CALLOUT NOTES (<g className="note-layer">)
                ป้ายกำกับ Action ที่ผุดขึ้นมาเหนือสถานีพร้อมจุดสี Staff/DVM/Sideflow/System/Alarm
                ================================================================= */}
            <g className="note-layer">
              {currentStep.stationNotes
                .filter((note) => {
                  if (currentStep.id >= 5 && currentStep.id <= 9) {
                    if (currentStep.id === 7 && note.id === "note-step7-rx") return currentPhase >= 3;
                    if (currentStep.id === 8 && note.id === "note-step8-staff") return true;
                    if (currentStep.id === 8 && note.id === "note-step8-pharm") return currentPhase >= 6;
                    return currentPhase >= 1;
                  }
                  return true;
                })
                .map((note) => {
                const st = STATIONS[note.nodeId];
                if (!st) return null;

                const palette = TONE_PALETTE[note.tone];
                const ny = st.y + (note.offsetY ?? -68);
                const nx = st.x + (note.offsetX ?? 0);

                let noteTitle = note.title;
                let noteDetail = note.detail;
                let noteRoleLabel = note.roleLabel;

                // Step 3 dynamic note switch: after pet enters exam room, DVM Call Queue becomes Exam Process
                if (currentStep.id === 3 && note.id === "note-step3-dvm" && step3PetArrived) {
                  noteTitle = "Exam Process";
                  noteDetail = "เริ่มตรวจรักษา";
                }

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
                        [{noteRoleLabel}] {noteTitle}
                      </text>

                      {/* Action Detail Line */}
                      <text
                        x="-61"
                        y="10"
                        fontSize="8.6"
                        fontWeight="600"
                        fill={palette.text}
                      >
                        {noteDetail}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>

            {/* =================================================================
                LAYER 7: PHASED SUB-WINDOWS (<g className="sub-window-layer">)
                หน้าต่างย่อยสีเขียวมิ้นต์ (#f0fdf4) พร้อมจุดและแท็กตาม Role
                ================================================================= */}
            <g className="sub-window-layer">
              {STEP_SUBWINDOWS.filter((sw) => {
                if (sw.stepId !== currentStep.id) return false;
                if (sw.phase > currentPhase) return false;
                if (sw.clearOnPhase !== undefined && currentPhase >= sw.clearOnPhase) return false;
                return true;
              }).map((sw) => {
                const pos = getSubWindowPos(sw);
                const isMultiLine = Boolean(sw.lines && sw.lines.length > 1);
                const hasMultiRoles = Boolean(sw.roles && sw.roles.length > 0);
                const isS8Left = sw.id === "s8-5" || sw.id === "s8-6";
                const cardW = isS8Left ? 156 : 168;
                const cardH = isMultiLine ? 32 : 20;
                const fontSize = isS8Left ? 7.8 : 8.2;

                const primaryPalette = TONE_PALETTE[sw.roleTone || "dvm"];

                return (
                  <g
                    key={sw.id}
                    className="pe-sub-window"
                    transform={`translate(${pos.x - cardW / 2}, ${pos.y - cardH / 2})`}
                    style={{
                      filter: "drop-shadow(0 2px 5px rgba(22, 101, 52, 0.12))"
                    }}
                  >
                    {/* Mint green sub-window card */}
                    <rect
                      x="0"
                      y="0"
                      width={cardW}
                      height={cardH}
                      rx="3"
                      fill="#f0fdf4"
                      stroke="#86efac"
                      strokeWidth="1.2"
                    />

                    {/* Multi-role dots or single role dot */}
                    {hasMultiRoles && sw.roles ? (
                      <>
                        <circle cx="8" cy={cardH / 2} r="2.8" fill={TONE_PALETTE[sw.roles[0].tone].dot} />
                        <circle cx="15" cy={cardH / 2} r="2.8" fill={TONE_PALETTE[sw.roles[1].tone].dot} />
                      </>
                    ) : (
                      <circle cx="10" cy={isMultiLine ? 10 : cardH / 2} r="3.2" fill={primaryPalette.dot} />
                    )}

                    {/* Text display: multi-line vs multi-role vs single-role */}
                    {isMultiLine && sw.lines ? (
                      <>
                        <text x="18" y="11.5" fontSize={fontSize}>
                          <tspan fontWeight="800" fill={primaryPalette.dot}>
                            {sw.roleTag}{" "}
                          </tspan>
                          <tspan fontWeight="700" fill="#14532d">
                            {sw.lines[0]}
                          </tspan>
                        </text>
                        <text x="18" y="24" fontSize={fontSize} fontWeight="700" fill="#14532d">
                          {sw.lines[1]}
                        </text>
                      </>
                    ) : hasMultiRoles && sw.roles ? (
                      <text x="21" y={cardH / 2 + 3.2} fontSize={fontSize}>
                        <tspan fontWeight="800" fill={TONE_PALETTE[sw.roles[0].tone].dot}>
                          {sw.roles[0].tag}
                        </tspan>
                        <tspan fontWeight="800" fill={TONE_PALETTE[sw.roles[1].tone].dot}>
                          {sw.roles[1].tag}{" "}
                        </tspan>
                        <tspan fontWeight="700" fill="#14532d">
                          {sw.text}
                        </tspan>
                      </text>
                    ) : (
                      <text x="18" y={cardH / 2 + 3.2} fontSize={fontSize}>
                        <tspan fontWeight="800" fill={primaryPalette.dot}>
                          {sw.roleTag}{" "}
                        </tspan>
                        <tspan fontWeight="700" fill="#14532d">
                          {sw.text}
                        </tspan>
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
            </svg>
          </div>

        </div>
      )}

      {/* =========================================================================
          VIEW 2: UI & SCENE VIEWER
          ========================================================================= */}
      {viewMode === "scene" && (
        <div className="relative w-full h-full flex flex-col overflow-hidden bg-[#f6efe0]">
          {/* BAR 2: TOOLBAR FOR UI & SCENE (Exact same height & left-aligned toggle button) */}
          <div className="pe-sim-toolbar shrink-0 bg-[#f4ebd9] border-b border-[#d8c6aa] px-3 py-1 flex flex-col gap-1">
            {/* ROW 1: ACTIONS & VIEW LAYOUT / ZOOM */}
            <div className="flex items-center justify-between gap-2 min-h-[28px]">
              {/* Left: Button to Switch back to FLOW MAP (EXACT SAME POSITION AND DIMENSIONS) */}
              <button
                type="button"
                onClick={() => onSwitchView?.("flow")}
                className="h-7 px-2.5 bg-[#b4531a] hover:bg-[#331e10] text-[#fcf8ee] text-[11.5px] font-extrabold rounded-xs flex items-center gap-1.5 cursor-pointer transition shrink-0 shadow-2xs border-0"
                title="สลับกลับไปดูแผนผังการไหลของเคสและเวชระเบียน (FLOW MAP)"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>กลับหน้า FLOW</span>
                <Layers className="w-3.5 h-3.5" />
              </button>

              {/* Right: Layout Toggle & Zoom Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setSceneLayout("split")}
                  className={`h-7 px-2 text-[11px] font-extrabold rounded-xs border cursor-pointer transition flex items-center gap-1 ${
                    sceneLayout === "split"
                      ? "bg-[#331e10] text-[#fcf8ee] border-[#331e10]"
                      : "bg-[#fcf8ee] text-[#4a2e1b] border-[#d8c6aa] hover:bg-[#efe4ca]"
                  }`}
                  title="แสดงคู่กันทั้งภาพจำลองคลินิกและหน้าจอระบบ KAHIS (Split View)"
                >
                  <Layers className="w-3 h-3" />
                  <span>SPLIT</span>
                </button>
                {currentStep.uiWireframes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSceneLayout("ui-only")}
                    className={`h-7 px-2 text-[11px] font-extrabold rounded-xs border cursor-pointer transition flex items-center gap-1 ${
                      sceneLayout === "ui-only"
                        ? "bg-[#331e10] text-[#fcf8ee] border-[#331e10]"
                        : "bg-[#fcf8ee] text-[#4a2e1b] border-[#d8c6aa] hover:bg-[#efe4ca]"
                    }`}
                    title="ขยายเฉพาะหน้าจอ KAHIS UI เต็มพื้นที่ (Full UI)"
                  >
                    <span>UI ONLY</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSceneLayout("scene-only")}
                  className={`h-7 px-2 text-[11px] font-extrabold rounded-xs border cursor-pointer transition flex items-center gap-1 ${
                    sceneLayout === "scene-only"
                      ? "bg-[#331e10] text-[#fcf8ee] border-[#331e10]"
                      : "bg-[#fcf8ee] text-[#4a2e1b] border-[#d8c6aa] hover:bg-[#efe4ca]"
                  }`}
                  title="ขยายเฉพาะภาพจำลองตัวละครและคลินิก (Clinic Scene)"
                >
                  <span>SCENE ONLY</span>
                </button>

                <div className="h-4 w-px bg-[#d8c6aa] mx-1" />

                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
                  disabled={zoomLevel <= 1}
                  className="h-7 w-7 flex items-center justify-center bg-[#fcf8ee] border border-[#d8c6aa] rounded-xs text-[11px] font-extrabold text-[#331e10] disabled:opacity-40 cursor-pointer"
                  title="ลดขนาดภาพ (-)"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <span className="text-[11px] font-extrabold text-[#4a2e1b] min-w-[34px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2, +(z + 0.25).toFixed(2)))}
                  disabled={zoomLevel >= 2}
                  className="h-7 w-7 flex items-center justify-center bg-[#fcf8ee] border border-[#d8c6aa] rounded-xs text-[11px] font-extrabold text-[#331e10] disabled:opacity-40 cursor-pointer"
                  title="ขยายขนาดภาพ (+)"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* ROW 2: UI INSPECTOR CONTEXT & SCREEN SELECTOR */}
            <div className="flex items-center justify-between gap-2 text-[12px] min-w-0 pt-0.5 border-t border-[#d8c6aa]/50">
              <div className="flex items-center gap-2 min-w-0 truncate">
                <span className="px-1.5 py-0.2 text-[10px] font-extrabold tracking-wider bg-[#1f7a4c] text-[#fcf8ee] rounded-xs shrink-0">
                  STEP {currentStep.id} UI
                </span>
                <span className="font-bold text-[#331e10] truncate" title={currentStep.title}>
                  {currentStep.title}
                </span>
                <span className="text-[#7a5a40] hidden md:inline truncate">
                  · {currentStep.module}
                </span>
              </div>

              {currentStep.uiWireframes.length > 1 && (
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] font-extrabold text-[#b4531a]">
                    SCREEN ({selectedWireframeIdx + 1}/{currentStep.uiWireframes.length}):
                  </span>
                  <select
                    value={selectedWireframeIdx}
                    onChange={(e) => setSelectedWireframeIdx(Number(e.target.value))}
                    className="text-[11px] font-bold bg-[#fcf8ee] border border-[#d8c6aa] rounded-xs px-1.5 py-0.5 text-[#331e10] cursor-pointer"
                  >
                    {currentStep.uiWireframes.map((wf, idx) => (
                      <option key={idx} value={idx}>
                        {idx + 1}. {wf.title}
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
                    className="h-5 w-5 flex items-center justify-center bg-[#f6efe0] hover:bg-[#efe4ca] border border-[#d8c6aa] rounded-xs text-[#331e10] cursor-pointer shrink-0"
                    title="หน้าจอก่อนหน้า"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedWireframeIdx((prev) =>
                        prev < currentStep.uiWireframes.length - 1 ? prev + 1 : 0
                      )
                    }
                    className="h-5 w-5 flex items-center justify-center bg-[#f6efe0] hover:bg-[#efe4ca] border border-[#d8c6aa] rounded-xs text-[#331e10] cursor-pointer shrink-0"
                    title="หน้าจอถัดไป"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* BAR 3: CANVAS VIEW (Content Area with compact padding) */}
          <div
            className={`grid gap-3 flex-1 min-h-0 p-2.5 overflow-hidden ${
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
