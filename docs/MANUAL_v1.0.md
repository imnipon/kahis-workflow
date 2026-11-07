# KAHIS Clinical Workflow Explorer — Technical & Fullstack Manual (Version 1.0) 🏥🐾

> **คู่มือสถาปัตยกรรมระบบ เทคนิคการพัฒนา Fullstack สารบรรณปุ่มควบคุม และประวัติการปรับปรุง**  
> สำหรับระบบจำลองและเรียนรู้กระบวนการตรวจรักษาทางสัตวแพทย์และระบบเวชระเบียน (KAHIS EMR & Exam Card)  
> *แรงบันดาลใจทางสถาปัตยกรรมและ Typography จาก [Protocol Explorer](https://protocol-explorer-alpha.vercel.app/)*

---

## 1. ข้อมูลทั่วไปและอัตลักษณ์ของระบบ (System Identity)

- **ชื่อแอปพลิเคชัน**: KAHIS Clinical Workflow Explorer
- **เวอร์ชัน**: `v1.0.0` (Production Ready)
- **ผู้พัฒนา**: imnipon ([@imnipon](https://github.com/imnipon)) — Email: `nipon.w@live.ku.th`
- **เป้าหมาย**: จำลองกระบวนการตรวจรักษาสัตว์ป่วยนอก 9 ขั้นตอน (OPD Patient Journey) แบบ Interactive ร่วมกับหน้าจอเวชระเบียนอิเล็กทรอนิกส์ (KAHIS EMR Wireframes) และภาพบรรยากาศจำลองคลินิกสัตวแพทย์แบบ Minimalist Line-Art (Isometric 1:1)

---

## 2. แผนผังโครงสร้าง UI ทั้งระบบ (UI Architecture Diagram)

แอปพลิเคชันถูกออกแบบในรูปแบบ **4-Panel Grid Workspace** ที่จัดสัดส่วนแบบ Responsive และทำงานสอดประสานกันแบบ Real-time:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. TOPBAR (.pe-topbar - Height 72px)                                                                                   │
│  [Logo Frame: logo_favicon.png] [Brand Title / Sub] │ [Now Tracker: Step Indicator] │ [Tools: MANUAL v1.0 / Version]   │
├──────────────────────────────┬──────────────────────────────────────────────────────────┬──────────────────────────────┤
│ 2. SIDEBAR (.pe-sidebar)     │ 3. SIMULATION PANEL (.pe-simulation)                     │ 4. OVERVIEW (.pe-overview)   │
│    (Width: 445px, 100% H)    │    (หรือ Isometric Canvas - 1fr Flexible)                │    (Width: 348px)            │
│                              │                                                          │                              │
│ • Panel Head (Title & Count) │ • Head: [View Switcher: FLOW MAP / UI & SCENE] & [Nav]   │ • Tabs: [STEP] / [OVERVIEW]  │
│ • Category Tabs:             │ ┌──────────────────────────────────────────────────────┐ │ • Step Explanation:          │
│   [ALL] [SERVICE] [EXAM-CARD]│ │ A. FLOW MAP VIEW (13-Node Multi-Stream SVG):         │ │   - Title & Action         │
│ • Active Workflow Header     │ │    - 13 Nodes (Main Spine, Exam Depts, Support Units)│ │ • Facts Card List:         │
│ • Step List (1 - 9):         │ │    - Multi-Lane Tracks (Owner / Exam Card / System)  │ │   - Responsible Actor      │
│   - Step Number Badge        │ │    - Persistent Pet & Owner Indicator                │ │   - Location               │
│   - Title & Subtitle         │ │    - Dynamic Packets (.packet-tag) & Notes (.note)   │ │   - System / Module        │
│   - Actor Color Legend Dot   │ │ B. INLINE CTA BANNER -> INSPECT UI & SCENE           │ │ • Clinical Checkpoints     │
│                              │ └──────────────────────────────────────────────────────┘ │                              │
├──────────────────────────────┴──────────────────────────────────────────────────────────┴──────────────────────────────┤
│ 5. WORKFLOW ACTION LOG / PACKETS PANEL (.pe-packets - Height 248px)                                                    │
│ • Panel Head: [Panel Title]  │  [Actor Legend Dots: Pet & Owner/Staff/DVM/Sideflow/System/Alarm]                       │
│ • Playback Toolbar: [Speed 0.5x-2x] [Prev ‹] [Play/Pause] [Step ›] [Reset ↺]                                           │
│ • Action Log Table: ตารางบันทึกเหตุการณ์ (No., Time, Actor, Location, KAHIS Module, Action Description, Ref Code)       │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. สารบรรณส่วนประกอบ ปุ่มควบคุม และ Action การทำงาน (Controls & Actions Directory)

### 3.1 แผงควบคุมการเล่น (Playback Toolbar & Action Log ด้านล่าง)
| ปุ่ม / องค์ประกอบ | สัญลักษณ์ / ข้อความ | ความหมายและหน้าที่ (Meaning) | การกระทำเมื่อคลิก (Action) | คีย์ลัด (Hotkeys) |
| :--- | :---: | :--- | :--- | :---: |
| **Speed Toggle** | `0.5×` / `1×` / `2×` | ปรับความเร็วรอบของแอนิเมชันลูกแก้วและจังหวะเวลาสเต็ป | วนลูปสลับความเร็ว `0.5x` ➔ `1.0x` ➔ `2.0x` | - |
| **Previous Step** | `‹` | ถอยหลังย้อนกลับ 1 ขั้นตอน | ลดตัวชี้สเต็ปปัจจุบัน (`currentStepIdx - 1`) | `←` (Arrow Left) |
| **Play / Pause** | `PLAY` / `PAUSE` | เล่นจำลองกระบวนการทั้ง 9 ขั้นตอนต่อเนื่องอัตโนมัติ | สลับสถานะเล่น/หยุดชั่วคราว (Auto-loop timer) | `Space` |
| **Next Step** | `STEP ›` | ก้าวไปข้างหน้าทีละ 1 ขั้นตอนเพื่อวิเคราะห์อย่างละเอียด | เพิ่มตัวชี้สเต็ปปัจจุบัน (`currentStepIdx + 1`) | `→` (Arrow Right) |
| **Reset** | `↺` | รีเซ็ตวงจรการจำลองทั้งหมด | เริ่มต้นใหม่ที่ขั้นตอนที่ 1 และหยุดเล่นอัตโนมัติ | `R` (Key R) |
| **Table Rows** | แถวที่ 1 - 9 | รายการประวัติเหตุการณ์ (Time, Actor, Module, Code) | คลิกเพื่อกระโดดไปยังขั้นตอนและสถานีนั้นทันที | - |

### 3.2 สวิตช์มุมมอง Canvas และระบบกล้อง (View Switcher & Camera Controls ตรงกลาง)
| ปุ่ม / องค์ประกอบ | สัญลักษณ์ / ข้อความ | ความหมายและหน้าที่ | การแสดงผลที่ได้รับ (Action) |
| :--- | :---: | :--- | :--- |
| **Flow Map View** | `FLOW MAP` | แผนผังสถานี 13 จุดและเส้นทาง Multi-Stream | แสดงผัง Isometric 13 สถานี, เส้นทางประไฟวิ่ง, จุด Pet & Owner และแอนิเมชัน Packet |
| **UI & Scene View** | `UI & SCENE` | คลังภาพประกอบ 1:1 Vector และหน้าจอ EMR | แสดงภาพวาดคลินิกจริงคู่กับพิมพ์เขียว Wireframe ความละเอียดสูง |
| **Step Zoom Mode** | `STEP ZOOM` | โหมดกล้องซูมเจาะจงขั้นตอน (Auto Camera) | กล้องเลื่อนและซูมติดตามสถานีที่กำลังเกิด Action โดยอัตโนมัติ (Isolated Focused Nodes) |
| **Full Map Mode** | `FULL MAP` | โหมดแผนผังภาพรวม 100% พร้อม Interactive Zoom & Pan | แสดงผังครบ 13 สถานีพร้อมกรอบโซน โดยเปิดให้ผู้ใช้ ซูมและเลื่อน (Pan) ได้อย่างอิสระ |
| **Zoom In / Out** | `+` / `−` | ปุ่มปรับสเกลขยายแผนผังในโหมด FULL MAP | ซูมเข้า/ออกทีละระดับรอบจุดกึ่งกลางหน้าจอ (ขอบเขต 100% - 600%) |
| **Reset View** | `RESET` | รีเซ็ตมุมกล้องแผนผังภาพรวม | ดีดมุมมองกลับเป็นแผนผังเต็มโรงพยาบาล 100% (ViewBox: 0 0 1150 565) |
| **Mouse Wheel Zoom** | ล้อเมาส์ (Scroll) | ซูมเข้า/ออก ณ ตำแหน่งเคอร์เซอร์เมาส์ (Cursor-centered) | หมุนล้อขึ้นเพื่อซูมเข้า / ลงเพื่อซูมออก ณ จุดที่เมาส์ชี้อยู่ โดยไม่เลื่อนหน้าเว็บ |
| **Click & Drag Pan** | คลิกลากเมาส์ซ้าย | ลากเลื่อนแผนผังสำรวจจุดต่างๆ (Pan) | คลิกลากบนพื้นหลังเพื่อเลื่อนดูแผนกต่างๆ เคอร์เซอร์เปลี่ยนเป็น grab/grabbing พร้อมขอบเขตจำกัดไม่หลุดกรอบ |
| **Canvas Step Nav** | `‹` / `›` | ปุ่มเลื่อนขั้นตอนบนหัว Canvas | ขยับไปยังขั้นตอนก่อนหน้าหรือถัดไปทันที |
| **Inspect UI & Scene CTA** | `ดูหน้าจอตรวจรักษา (STEP X)` ➔ | ทางลัดเข้าสู่หน้าจอ EMR Wireframe และฉากจำลอง | สลับเข้าสู่โหมด UI & SCENE เพื่อเจาะลึกหน้าจอโปรแกรมทันทีโดยไม่เด้ง Modal บัง |
| **Wireframe Tabs** | `EXAM CARD`, `PLAN`... | แท็บสลับหน้าจอพิมพ์เขียวย่อย | แสดงหน้าจอ EMR ย่อยที่มีมากกว่า 1 แบบในขั้นตอนนั้น (เช่น ขั้น 7) |

### 3.3 แผงด้านข้างและลิ้นชักข้อมูล (Sidebar & Overview)
| ปุ่ม / องค์ประกอบ | สัญลักษณ์ / ข้อความ | ความหมายและหน้าที่ | การกระทำเมื่อคลิก (Action) |
| :--- | :---: | :--- | :--- |
| **Category Tabs** | `ALL`, `SERVICE`, `EXAM CARD` | แท็บกรองประเภท Workflow | แสดงเฉพาะขั้นตอนตามสายงานบริการหรือเจาะลึกแบบฟอร์ม |
| **Step Item** | หมายเลข 1 - 9 | เมนูรายการแต่ละขั้นตอนพร้อม Checkmark | เลือกสเต็ปที่ต้องการดู พร้อมซิงค์ทุกแผงในหน้าจอพร้อมกัน |
| **Step Details Tab** | `STEP DETAILS` | ลิ้นชักรายละเอียดขั้นตอนปัจจุบัน | แสดงข้อมูล Actor, Location, KAHIS Module, และ Checkpoints |
| **Overview Tab** | `OVERVIEW` | ลิ้นชักสรุปข้อมูลระดับภาพรวม | แสดง Facts และสถิติภาพรวมของ Workflow ที่เลือก |
| **Manual Button** | `MANUAL v1.0` | ปุ่มเปิดคู่มือระบบทางการบน Topbar | เปิดหน้าต่าง Modal คู่มือฉบับสมบูรณ์ (คีย์ลัด: `M`) |

---

## 4. ระบบจุดสีแสดงสถานะและบทบาท (Legend Dots Matrix)

เพื่อความชัดเจนในการติดตามกระบวนการทำงาน จุดสีระบุบทบาททั้ง 6 สี ถูกกำหนดไว้อย่างเป็นเอกภาพทั่วทั้งระบบ:

| จุดสี (Dot) | บทบาท (Role) | สีที่ใช้ (Color Token) | บริบทการใช้งานในกระบวนการรักษา |
| :---: | :--- | :--- | :--- |
| 🟤 | **Pet & Owner** | สีน้ำตาลทอง (`#8C5828`) | เจ้าของสัตว์และสัตว์เลี้ยง (การเดินทางมาถึง, การนั่งรอคิว, การรับสัตว์กลับ) |
| 🟡 | **Staff** | สีเหลืองอำพัน Amber (`#D97706`) | เจ้าหน้าที่เวชระเบียน, เจ้าหน้าที่ห้องยา และการเงิน ในการบันทึกประวัติ จัดยา และรับชำระ |
| 🔵 | **DVM** | สีฟ้า Sky Blue (`#0284C7`) | สัตวแพทย์ผู้ทำการตรวจรักษา ในขั้นตอนซักประวัติ ตรวจร่างกาย บันทึก EMR และสั่งยา |
| 🟣 | **Sideflow** | สีม่วง Violet (`#8B5CF6`) | กระบวนการแยกย่อยคู่ขนาน เช่น ส่งตรวจห้องแล็บ, ตรวจรังสีวินิจฉัย (X-ray), หรือหัตถการพิเศษ |
| 🟢 | **System** | สีเขียว Emerald (`#16A34A`) | ระบบอัตโนมัติ การประกาศเรียกคิวเข้าห้องตรวจ, การซิงค์ข้อมูล EMR และการออกใบเสร็จ |
| 🟠 | **Alarm** | สีส้มสัญญาณเตือน (`#EA580C`) | การแจ้งเตือนเหตุฉุกเฉิน เคสวิกฤต (Triage Red), อาการแพ้ยา, หรือจุดระวังพิเศษทางคลินิก |

---

## 5. สถาปัตยกรรม Fullstack & Technology Stack

| Layer / มิติ | เทคโนโลยีที่เลือกใช้ | บทบาทหน้าที่และเหตุผลการเลือกใช้ |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15.5+ (App Router)** | รองรับ React Server Components, Fast Refresh, และ Static Export สำหรับ Vercel |
| **Frontend Runtime** | **React 19.0** | Component Architecture, State Management, และ Lifecycle Hooks |
| **Language** | **TypeScript 5.7+** | Type-safe สำหรับโมเดลคลินิก, ข้อมูลสถานี, พิกัด 3D, และ Step Payload |
| **Styling Engine** | **TailwindCSS v4.0 + Custom CSS Tokens** | ดีไซน์โทนกระดาษและหมึกเขียนแบบ Blueprint ผสมผสาน Utility classes |
| **Vector Engine** | **Native Scalable Vector Graphics (SVG)** | วาดผัง 3D Isometric, เส้นทางประเคลื่อนที่, และลำแสงดาวตกโดยไม่ต้องพึ่งพา 3D WebGL library ขนาดใหญ่ |
| **Icon System** | **Lucide React** | ไอคอนเชิงเทคนิค คลีนตา ไร้การใช้ Unicode Emoji ตามข้อกำหนดระบบสากล |
| **Font Pipeline** | **Iosevka (Self-hosted) + IBM Plex Sans Thai Looped** | ระบบ Dual-font stack ที่สลับภาษาไทยและอังกฤษตาม Unicode range อย่างกลมกลืน |

---

## 6. เทคนิคและอัลกอริทึมการพัฒนา (Engineering & Design Techniques)

### 6.1 เทคนิคเรขาคณิต 3 มิติ Isometric ด้วย Pure SVG Polygon
- **จุดพิกัดสถานี**: กำหนดพิกัดกึ่งกลาง `(st.x, st.y)` ของแต่ละสถานี เช่น ทางเข้า `(130, 410)`, ห้องตรวจ `(690, 260)`
- **3D Isometric Box Calculation**:
  - **Top Face**: คำนวณจากรูปทรงข้าวหลามตัด 4 จุด `(x, y - h)`, `(x + w, y - h/2)`, `(x, y)`, `(x - w, y - h/2)`
  - **Left Face & Right Face**: ขยายมิติความสูงลงมาในแนวแกนตั้ง `(y + 24)` เพื่อสร้างความลึกของกล่อง
  - **Drop Shadow**: วาดรูปหลายเหลี่ยมโปร่งแสง `rgba(51, 30, 16, 0.09)` รองรับด้านล่างกล่องเพื่อสร้างมิติการลอยตัว

### 6.2 แอนิเมชันลำแสงหางดาวตก (Traveling Comet Token)
- พิกัดของ Token ถูกคำนวณจากกึ่งกลางเวกเตอร์ระหว่างสถานีต้นทางและปลายทาง:
  $$\text{Token}_X = \frac{X_{\text{from}} + X_{\text{to}}}{2}, \quad \text{Token}_Y = \frac{Y_{\text{from}} + Y_{\text{to}}}{2}$$
- อนุภาคหางดาวตก (Trailing Particles) 3 จุด เรียงตัวตามเวกเตอร์การเคลื่อนที่ พร้อมลดหลั่น Opacity (`0.75` ➔ `0.45` ➔ `0.25`)
- แท็กป้ายรหัสอ้างอิง (`Ref Code Badge`) ลอยอยู่เหนือลูกแก้วเพื่อแสดง Payload เช่น `QUEUE-WA001` หรือ `EMR-CARD-4331`

### 6.3 Dual Typography Engine (Iosevka + IBM Plex Sans Thai Looped)
- **ภาษาอังกฤษและตัวเลข**: ใช้ฟอนต์ **`Iosevka`** (6 น้ำหนัก) ตัวอักษรแคบ สไตล์ Engineering Blueprint เหมือน Protocol Explorer
- **ภาษาไทย**: ใช้ **`IBM Plex Sans Thai Looped`** ฟอนต์ทางการ มีหัว อ่านง่าย ชัดเจน ถูกต้องตามหลักเวชระเบียน
- กำหนดผ่าน Stack:
  ```css
  font-family: "Iosevka", "IBM Plex Sans Thai Looped", ui-monospace, monospace;
  ```

### 6.4 ระบบกล้องอัจฉริยะและการซูมแผนผังแบบมีปฏิสัมพันธ์ (Dynamic SVG Camera Viewport, Wheel Zoom & Drag-to-Pan)
- **สถาปัตยกรรมกล้องผ่าน SVG `viewBox`**: ควบคุมมุมมองผ่าน State พิกัดกล่อง `camBox = [x, y, width, height]` ขนาดพื้นฐาน $1150 \times 565$ อัตราส่วน $1150 / 565 \approx 2.035$
- **โหมด STEP ZOOM (Auto-Guided Tracking)**:
  - คำนวณขอบเขตล้อมรอบสถานีเป้าหมาย (`computeStepCameraBox`) ในแต่ละขั้นตอน
  - แอนิเมชันกล้องเคลื่อนที่แบบ Cubic Ease-out ($t = 1 - (1-t)^3$) เป็นเวลา 620ms
  - ซ่อนสถานีและเส้นทางที่ไม่เกี่ยวข้องเพื่อลด Cognitive Load ของผู้ใช้งาน
- **โหมด FULL MAP (Interactive Free Exploration)**:
  - แสดงสถานีครบ 13 จุดพร้อมกรอบสีจัดกลุ่มโซน (ER, Special Clinic/Surgery, Support Zone, Pharmacy & Rx)
  - **Cursor-Centered Wheel Zoom**: แปลงพิกัด Client Pixel สู่พิกัดแผนผังโลก SVG โดยชดเชย Aspect Ratio Letterbox (`preserveAspectRatio="xMidYMid meet"`) ทำให้ตำแหน่งจุดใต้เมาส์คงที่ขณะซูม
  - **Drag-to-Pan with Bounding Clamp**: คลิกลากเมาส์เพื่อเลื่อนแผนผัง โดยแปลงระยะทางลากตามสเกลจริง พร้อมระบบ `clampCamBox` ป้องกันไม่ให้มุมมองหลุดออกจากขอบเขต $X \in [-45, 1160]$, $Y \in [0, 565]$ และจำกัดระดับการซูมที่ 100%–600%
  - **Camera State Persistence**: ล็อกตำแหน่งกล้องไว้ไม่ให้กระตุกหรือดีดกลับเป็นค่าเริ่มต้นเมื่อกด Play/Step ถัดไป ช่วยให้ตรวจสอบสถานะขั้นตอนที่กำลังรันอยู่ ณ บริเวณที่ซูมเจาะลึกได้อย่างต่อเนื่อง
  - **Gesture Conflict Prevention**: ยกเลิกแอนิเมชันกล้องอัตโนมัติทันทีที่ผู้ใช้สัมผัสหรือสั่งการ (Cancel RAF) และใช้ Native Non-passive Wheel Listener ป้องกันการเลื่อนหลุดของหน้าเว็บหลัก

---

## 7. ประวัติการปรับปรุงและวิวัฒนาการระบบ (Change History & Evolution)

- **v1.1.0 (Interactive Camera & Full Map Zoom/Pan - Current Release)**:
  - เพิ่มระบบ Interactive Zoom & Pan ในโหมด **FULL MAP** รองรับล้อเมาส์ซูมรอบเคอร์เซอร์ (100%–600%) และคลิกลากแพน (Drag-to-Pan)
  - เพิ่มปุ่มเครื่องมือควบคุมกล้อง `+`, `−`, `RESET` พร้อมแถบแนะนำคำสั่งบน Canvas Header
  - เพิ่มระบบ Camera State Persistence แยกอิสระระหว่างโหมด STEP ZOOM และ FULL MAP ไม่ดีดกลับเมื่อเปลี่ยนขั้นตอน
  - ปรับความแม่นยำในการคำนวณ SVG Viewport Metric ชดเชย Letterbox Offset และจำกัดขอบเขต Bounding Clamp ไม่ให้หลุดกรอบ
- **v1.0.0**:
  - ปรับระบบจุดสีแสดงบทบาทใหม่ 6 สี (DVM ฟ้า, Sideflow ม่วง, Alarm ส้ม, Pet & Owner, Staff, System)
  - ปรับสเกลขนาดและชนิดฟอนต์เทียบเท่า Protocol Explorer 100%
  - ฝังฟอนต์ `Iosevka` (woff2) และ `IBM Plex Sans Thai Looped`
  - ปรับระบบสีเป็น Warm Earth-Tone & Brown Ink ทั่วทั้งระบบ
  - เปลี่ยนตราสัญลักษณ์โลโก้และ Favicon เป็น `logo_favicon.png` เต็มกรอบสี่เหลี่ยม
  - เพิ่มสารบรรณปุ่มควบคุมและคู่มือระบบ (Manual v1.0 Modal) บน Topbar
  - ผ่านการตรวจ Emoji Linter (`npm run check-icons`)
- **v0.5.0**:
  - ผนวกโมดูล Lightbox Full-screen Modal สำหรับดู Wireframe และ Scene
  - เชื่อมโยง 17 ภาพ Minimalist Line-Art และ Blueprint Wireframes ของ KAHIS EMR
- **v0.1.0**:
  - โครงสร้าง 4-Panel Grid Architecture เริ่มต้น และโมเดลกระบวนการตรวจรักษา 9 ขั้นตอน
