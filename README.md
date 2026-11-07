# KAHIS Clinical Workflow Explorer 🏥🐾 (Version 1.0)

> **Interactive Animated Blueprint Guide for KAHIS Exam Card & Veterinary Outpatient Clinical Workflow**  
> Inspired by [Protocol Explorer](https://protocol-explorer-alpha.vercel.app/) with isometric vector graphics, dual UI/Scene views, sequence swimlanes, and real-time transaction event logs.

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Version](https://img.shields.io/badge/Version-1.0.0-emerald.svg)](https://github.com/imnipon/kahis-workflow)

---

## 🌟 Overview (ภาพรวมโครงการ)

**KAHIS Clinical Workflow Explorer (v1.0)** เป็นเว็บแอปพลิเคชันจำลองกระบวนการให้บริการตรวจรักษาทางสัตวแพทย์และระบบสารสนเทศโรงพยาบาลสัตว์ (KAHIS EMR & Exam Card) ในรูปแบบ **Interactive 3D Blueprint Schematic**

ระบบถูกออกแบบมาเพื่อให้สัตวแพทย์, นิสิตฝึกงาน, และทีมพัฒนาระบบเข้าใจขั้นตอนการทำงานจริง (Physical Clinical Process) ควบคู่กับหน้าจอโปรแกรมคอมพิวเตอร์ (EMR Wireframes) ในทุกมิติ ด้วยธีมสี **Warm Earth-Tone & Brown Ink** และฟอนต์ **Iosevka + IBM Plex Sans Thai Looped**

---

## 🗺️ UI Architecture Diagram (แผนผังโครงสร้าง UI ทั้งระบบ)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. TOPBAR (.pe-topbar - Height 72px)                                                                                   │
│  [Logo Frame: logo_favicon.png] [Brand Title / Sub] │ [Now Tracker: Step Indicator] │ [Tools: MANUAL v1.0 / Version]   │
├──────────────────────────────┬──────────────────────────────────────────────────────────┬──────────────────────────────┤
│ 2. SIDEBAR (.pe-sidebar)     │ 3. SIMULATION PANEL (.pe-simulation)                     │ 4. OVERVIEW (.pe-overview)   │
│    (Width: 445px, 100% H)    │    (หรือ Isometric Canvas - 1fr Flexible)                │    (Width: 348px)            │
│                              │                                                          │                              │
│ • Panel Head (Title & Count) │ • Head: [View Switcher: FLOW / SCENE / SEQ] & [Step Nav] │ • Tabs: [STEP] / [OVERVIEW]  │
│ • Category Tabs:             │ ┌──────────────────────────────────────────────────────┐ │ • Step Explanation:          │
│   [ALL] [SERVICE] [EXAM-CARD]│ │ A. FLOW MAP VIEW (Isometric 3D SVG):                 │ │   - Title & Action         │
│ • Active Workflow Header     │ │    - Background Dot Grid (24×24px)                    │ │ • Facts Card List:         │
│ • Step List (1 - 9):         │ │    - Station Nodes (แท่น 3D Isometric 5 สถานี)      │ │   - Responsible Actor      │
│   - Step Number Badge        │ │    - Connection Lanes (เส้นทางประไฟวิ่งเชื่อมต่อ)    │ │   - Location               │
│   - Title & Subtitle         │ │    - Traveling Token (ลูกแก้ว + หางแสงดาวตก) 💫       │ │   - System / Module        │
│   - Actor Color Legend Dot   │ │ B. FLOATING PREVIEW CARD (Asset Snapshot มุมขวาบน)   │ │ • Clinical Checkpoints     │
│                              │ └──────────────────────────────────────────────────────┘ │                              │
├──────────────────────────────┴──────────────────────────────────────────────────────────┴──────────────────────────────┤
│ 5. WORKFLOW ACTION LOG / PACKETS PANEL (.pe-packets - Height 248px)                                                    │
│ • Panel Head: [Panel Title]  │  [Actor Legend Dots]  │  [Playback Toolbar: Speed, Prev, Play/Pause, Step, Reset]      │
│ • Action Log Table: ตารางบันทึกเหตุการณ์ (No., Time, Actor, Location, KAHIS Module, Action Description, Ref Code)       │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Fullstack Architecture & Techniques (สถาปัตยกรรมและเทคนิคการพัฒนา)

1. **Pure SVG 3D Isometric Projection**:
   - คำนวณพิกัดสถานี 5 จุดในโรงพยาบาล (Entrance, Registration, Waiting Hall, Exam Room 10, Pharmacy/Cashier)
   - วาดรูปทรงเรขาคณิต 3 มิติ (Top Face, Left Face, Right Face, Drop Shadow) ด้วย Pure SVG Polygon โดยไม่ต้องพึ่งพา WebGL Library หนักๆ
2. **Dynamic SVG Camera & Interactive Zoom/Pan**:
   - สลับระหว่าง **STEP ZOOM** (ซูม/แพนโฟกัสสถานีเป้าหมายอัตโนมัติ) และ **FULL MAP** (แผนผังโรงพยาบาลครบ 13 จุดพร้อมกรอบโซน)
   - รองรับ **Mouse Wheel Zoom** (100%–600% รอบตำแหน่งเคอร์เซอร์), **Click & Drag Pan** (ลากเลื่อนพร้อมระบบ Bounding Clamp), และปุ่มควบคุม `+`, `−`, `RESET`
3. **Traveling Comet Token & Active Lane Flow**:
   - คำนวณพิกัดกึ่งกลางแบบไดนามิก พร้อมหางแสงดาวตก 3 ระดับความโปร่งแสง และแอนิเมชันเส้นประไฟวิ่ง `laneDash`
3. **Dual Font Stack (Typography Parity)**:
   - ฟอนต์ **`Iosevka`** (Self-hosted woff2 6 น้ำหนัก) สำหรับตัวอักษรภาษาอังกฤษ ตัวเลข และรหัสอ้างอิง
   - ฟอนต์ **`IBM Plex Sans Thai Looped`** สำหรับภาษาไทย มีหัว อ่านง่าย ชัดเจน ถูกต้องตามหลักเวชระเบียน
4. **Warm Earth-Tone & Brown Ink Color Palette**:
   - พื้นหลังหลักโทนกระดาษสีเหลืองอุ่น (`#F6EFE0`), แผงข้อมูล (`#FCF8EE`), หมึกสีน้ำตาลเข้ม (`#4A2E1B` / `#331E10`), และสถานะ Active สีส้มอิฐอำพัน (`#B4531A`)
5. **Playback State Machine & Keyboard Controls**:
   - เล่นอัตโนมัติ (Play/Pause: `Space`), สปีด `0.5x` / `1.0x` / `2.0x`, ก้าวทีละขั้น (`←` / `→`), เริ่มใหม่ (`R`), และเปิดคู่มือระบบ (`M`)

---

## 📜 Version History (ประวัติการปรับปรุงระบบ)

- **v1.1.0 (Current Release)**:
  - เพิ่มระบบ Interactive Zoom & Pan ในโหมด **FULL MAP** รองรับล้อเมาส์ซูมรอบเคอร์เซอร์ (100%–600%) และคลิกลากแพน (Drag-to-Pan)
  - เพิ่มปุ่มควบคุมกล้อง `+`, `−`, `RESET` พร้อมข้อความแนะนำการใช้งานบน Canvas Header
  - เพิ่มระบบ Camera State Persistence แยกอิสระระหว่างโหมด STEP ZOOM และ FULL MAP ไม่ดีดกลับเมื่อเปลี่ยนขั้นตอน
  - ปรับปรุงการคำนวณ SVG Viewport Metric ชดเชย Letterbox Offset และ Bounding Clamp แม่นยำ
- **v1.0.0**:
  - ปรับขนาดและชนิดฟอนต์เทียบเท่า Protocol Explorer 100%
  - ฝังฟอนต์ `Iosevka` (woff2) และ `IBM Plex Sans Thai Looped`
  - ปรับระบบสีเป็น Warm Earth-Tone & Brown Ink ทั่วทั้งระบบ
  - เปลี่ยนโลโก้ทางการและ Favicon เป็น `logo_favicon.png`
  - เพิ่มหน้าต่างคู่มือระบบ (Manual v1.0 Modal) บน Topbar แทนที่ปุ่ม GitHub เดิม
  - ผ่านการตรวจ Emoji Linter (`npm run check-icons`)
- **v0.5.0**:
  - ผนวกโมดูล Lightbox Full-screen Modal สำหรับดู Wireframe และ Scene
  - เชื่อมโยง 17 ภาพ Minimalist Line-Art และ Blueprint Wireframes ของ KAHIS EMR
- **v0.1.0**:
  - โครงสร้าง 4-Panel Grid Architecture เริ่มต้น และโมเดลกระบวนการตรวจรักษา 9 ขั้นตอน

---

## 🗺️ Clinical Workflow: กระบวนการตรวจรักษา 9 ขั้นตอน

| Step | ขั้นตอน (TH) | Clinical Stage (EN) | จุดบริการ (Station) | ผู้เกี่ยวข้อง (Actor) | หน้าจอระบบ (UI Blueprint) |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **01** | เจ้าของสัตว์พาสัตว์มา | Patient Arrival | `ENTRANCE` | เจ้าของสัตว์ | ฉากเจ้าของอุ้มสัตว์เลี้ยง |
| **02** | ติดต่อลงทะเบียน | Registration & HN Search | `REGISTRATION` | จนท. เวชระเบียน | `search.jpg` (Search UI) |
| **03** | บันทึก Check-in | Check-in & Queue Issuance | `REGISTRATION` | จนท. เวชระเบียน | `checkin.jpg` (Check-in UI) |
| **04** | รอตรวจที่จุดรอตรวจ | Waiting Area & Triage | `WAITING HALL` | เจ้าของสัตว์ | ฉากโซนรอเรียกคิว |
| **05** | เรียกเข้าห้องตรวจ | Consultation & History | `EXAM ROOM 10` | สัตวแพทย์ | `examcard.jpg` (Exam Card 65:35) |
| **06** | ตรวจร่างกายและระบบ | Physical Exam & VPE | `EXAM ROOM 10` | สัตวแพทย์ | `vpe.jpg`, `vpe-table.jpg` |
| **07** | บันทึก EMR & สั่งยา | SOAP & Medication Order | `EXAM ROOM 10` | สัตวแพทย์ | `assessment.jpg`, `plan.jpg`, `order.jpg` |
| **08** | เภสัชกรรมจัดยา | Rx Preparation & Dispensing | `PHARMACY` | เภสัชกร | `order.jpg` (Rx Dispensing Queue) |
| **09** | ชำระเงินและรับยา | Cashier Payment & Discharge | `CASHIER` | จนท. การเงิน / เภสัช | ใบเสร็จและสรุปการรักษา |

---

## 🚀 Getting Started & Deployment

```bash
# ติดตั้งแพ็กเกจ
npm install

# ตรวจสอบ Emoji
npm run check-icons

# เปิดเซิร์ฟเวอร์พัฒนา
npm run dev

# สร้าง Production Build
npm run build
```

### การ Deploy บน Vercel:
- **Application Preset**: เลือกเป็น `Next.js`
- **Root Directory**: `./`
- **Environment Variables**: ปล่อยว่าง (ไม่ต้องใส่)
