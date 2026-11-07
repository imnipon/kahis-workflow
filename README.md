# KAHIS Clinical Workflow Explorer 🏥🐾

> **Interactive Animated Blueprint Guide for KAHIS Exam Card & Veterinary Outpatient Clinical Workflow**  
> Inspired by [Protocol Explorer](https://protocol-explorer-alpha.vercel.app/) with isometric vector graphics, dual UI/Scene views, sequence swimlanes, and real-time transaction event logs.

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 Overview (ภาพรวมโครงการ)

**KAHIS Clinical Workflow Explorer** เป็นเว็บแอปพลิเคชันจำลองกระบวนการให้บริการตรวจรักษาทางสัตวแพทย์และระบบสารสนเทศโรงพยาบาลสัตว์ (KAHIS EMR & Exam Card) ในรูปแบบ **Interactive 3D Blueprint Schematic**

ระบบถูกออกแบบมาเพื่อให้สัตวแพทย์, นิสิตฝึกงาน, และทีมพัฒนาระบบเข้าใจขั้นตอนการทำงานจริง (Physical Clinical Process) ควบคู่กับหน้าจอโปรแกรมคอมพิวเตอร์ (EMR Wireframes) ในทุกมิติ

---

## 🗺️ Clinical Workflow: กระบวนการตรวจรักษา 9 ขั้นตอน

```
[1. พาสัตว์เลี้ยงมา] ──> [2. ค้นหาประวัติ/HN] ──> [3. บันทึก Check-in] ──> [4. นั่งรอเรียกคิว]
                                                                                │
                                                                                ▼
[9. ชำระเงิน & รับยา] <── [8. เภสัชกรจัดยา] <── [7. บันทึก EMR/สั่งยา] <── [5. เข้าห้องตรวจพบหมอ]
                                                       │
                                                [6. ตรวจร่างกาย VPE]
```

| Step | ขั้นตอน (TH) | Clinical Stage (EN) | จุดบริการ (Station) | ผู้เกี่ยวข้อง (Actor) | หน้าจอระบบ (UI Blueprint) |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **01** | เจ้าของสัตว์พาสัตว์มา | Patient Arrival | `REGISTRATION` | เจ้าของสัตว์ | ฉากเจ้าของอุ้มสัตว์เลี้ยง |
| **02** | ติดต่อลงทะเบียน | Registration & HN Search | `REGISTRATION` | จนท. เวชระเบียน | `search.jpg` (Search UI) |
| **03** | บันทึก Check-in | Check-in & Queue Issuance | `REGISTRATION` | จนท. เวชระเบียน | `checkin.jpg` (Check-in UI) |
| **04** | รอตรวจที่จุดรอตรวจ | Waiting Area & Triage | `WAITING` | เจ้าของสัตว์ | ฉากโซนรอเรียกคิว |
| **05** | เรียกเข้าห้องตรวจ | Consultation & History | `OPD_EXAM` | สัตวแพทย์ | `examcard.jpg` (Exam Card 65:35) |
| **06** | ตรวจร่างกายและระบบ | Physical Exam & VPE | `OPD_EXAM` | สัตวแพทย์ | `vpe.jpg`, `vpe-table.jpg` |
| **07** | บันทึก EMR & สั่งยา | SOAP & Medication Order | `OPD_EXAM` | สัตวแพทย์ | `assessment.jpg`, `plan.jpg`, `order.jpg` |
| **08** | เภสัชกรรมจัดยา | Rx Preparation & Dispensing | `PHARMACY` | เภสัชกร | `order.jpg` (Rx Dispensing Queue) |
| **09** | ชำระเงินและรับยา | Cashier Payment & Discharge | `CASHIER` | จนท. การเงิน / เภสัช | ใบเสร็จและสรุปการรักษา |

---

## 🎯 Key Features (คุณสมบัติเด่น)

1. **4-Panel Blueprint Layout**:
   - **Sidebar**: เมนูเลือกขั้นตอน พร้อม Checkmark แสดงความก้าวหน้า
   - **Canvas**: หน้าจอแสดงผล 3D Axonometric Map พร้อมแอนิเมชันลำแสงหางดาวตก
   - **Facts Panel**: ลิ้นชักรายละเอียด Actor, สถานที่, และ UI Action Triggers
   - **Action Log**: ตารางบันทึกเหตุการณ์และ Payload สำคัญแบบ Real-time
2. **3 Switchable Canvas Views**:
   - `FLOW`: ผังสถานี 3D Isometric SVG แสดงการเคลื่อนที่ของคิวและเคส
   - `UI & SCENE`: แสดงภาพวาดลายเส้นบรรยากาศจริง ควบคู่กับ Blueprint Wireframe ของหน้าจอระบบ
   - `SEQUENCE`: แผนภาพกระบวนการ Swimlane ระหว่างบทบาทต่างๆ
3. **Playback Engine & Shortcuts**:
   - เล่นต่อเนื่องอัตโนมัติ (Play / Pause) หรือกด `Space`
   - ปรับสปีดได้ `0.5x`, `1.0x`, `2.0x`
   - คีย์ลัด: `←` / `→` (เลื่อนขั้นตอน), `R` (รีเซ็ต), `1` / `2` / `3` (สลับมุมมอง)
4. **Lightbox Modal**: คลิกที่ภาพ Wireframe หรือ Scene เพื่อเปิดดูภาพความละเอียดสูงแบบเต็มจอ

---

## 🚀 Getting Started (วิธีติดตั้งและเปิดใช้งาน)

### ข้อกำหนดเบื้องต้น
- Node.js 18.18+ หรือ 20+
- npm หรือ pnpm

### ติดตั้ง Dependencies
```bash
# ติดตั้งแพ็กเกจ
npm install
```

### เปิดเซิร์ฟเวอร์สำหรับพัฒนา (Development Server)
```bash
npm run dev
```
เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

### ตรวจสอบความถูกต้องและสร้าง Production Build
```bash
# ตรวจสอบว่าไม่มี Unicode Emoji ในโค้ด
npm run check-icons

# ตรวจสอบ TypeScript & Build
npm run build

# สำรองข้อมูลโครงการแบบคลีนสำหรับ Google Drive
npm run backup
```

---

## 📁 Project Structure (โครงสร้างไฟล์)

```
kahis-workflow/
├── app/
│   ├── globals.css              # Blueprint base theme and Tailwind setup
│   ├── layout.tsx               # Root layout with metadata
│   └── page.tsx                 # Root page mounting ExplorerShell
├── components/
│   └── workflow-explorer/
│       ├── BlueprintStyles.css  # Protocol Explorer design tokens
│       ├── ExplorerShell.tsx    # 4-panel grid layout and playback engine
│       └── IsometricCanvas.tsx  # SVG 3D map, UI/Scene viewer, and modal
├── lib/
│   └── workflow-explorer/
│       └── workflow-data.ts     # Station coordinates, lanes, and 9-step dataset
├── public/
│   └── images/
│       └── blueprint/           # 17 Minimalist line-art scenes & UI wireframes
├── scripts/
│   ├── backup-clean.ps1         # Clean zip backup script
│   └── check-no-emoji.mjs       # Emoji validation linter
├── .agent/
│   └── rules/rule.md            # Agent rules and backup reminder
└── package.json
```

---

## 👤 Author & Maintainer

- **Developer**: imnipon ([@imnipon](https://github.com/imnipon))
- **Email**: nipon.w@live.ku.th
- **Repository**: [https://github.com/imnipon/kahis-workflow.git](https://github.com/imnipon/kahis-workflow.git)
