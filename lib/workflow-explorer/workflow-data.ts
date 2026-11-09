export type WorkflowGroup = 'clinical' | 'exam-card';

export type RoleTone = 'owner' | 'staff' | 'dvm' | 'sideflow' | 'system' | 'alarm';

export interface UIWireframeItem {
  id: string;
  title: string;
  image: string;
  tag: string;
  badgeLabel?: string;
}

export interface AnimatedPacketSpec {
  id: string;
  stream: 'owner' | 'exam-card' | 'system' | 'sideflow';
  tone: RoleTone;
  laneId: string;
  fromNode: string;
  toNode: string;
  tag: string;
  title: string;
  lines?: string[];
  fields: Array<{ k: string; v: string }>;
  stopOffsetX?: number;
  stopOffsetY?: number;
}

export interface StationNoteSpec {
  id: string;
  nodeId: string;
  tone: RoleTone;
  roleLabel: string;
  title: string;
  detail: string;
  offsetY?: number;
  offsetX?: number;
}

export interface WorkflowStep {
  id: number;
  title: string;
  titleEn: string;
  subtitle: string;
  actor: string;
  actorType: RoleTone;
  target: string;
  module: string;
  output: string;
  action: string;
  refCode: string;
  time: string;
  fromNode: string;
  toNode: string;
  laneId: string;
  activeLanes: string[];
  badgeColor: RoleTone;
  // Persistent Pet & Owner state for this step
  petOwner: {
    fromNode: string;
    toNode: string;
    statusLabel: string;
    subZone?: string;
  };
  // Dynamic moving packets (Exam Card, System signals, Sideflow orders)
  packets: AnimatedPacketSpec[];
  // Dynamic station action callouts (.note style from protocol-explorer)
  stationNotes: StationNoteSpec[];
  characterImage?: string;
  characterTitle?: string;
  uiPromptLabel: string;
  uiWireframes: UIWireframeItem[];
  explanation: {
    title: string;
    role: string;
    location: string;
    systemUsed: string;
    clinicalNote: string;
    keyPoints: string[];
  };
}

export interface WorkflowItem {
  id: string;
  title: string;
  titleEn: string;
  subtitle: string;
  group: WorkflowGroup;
  status: 'active' | 'coming-soon';
  totalSteps: number;
  overviewDesc: string;
  facts: Array<{ label: string; value: string }>;
  steps: WorkflowStep[];
}

export interface StationNode {
  id: string;
  label: string;
  labelTh: string;
  code: string;
  category: 'main' | 'department' | 'support';
  categoryLabel: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  zones?: Array<{
    zoneTitle: string;
    rooms: string[];
  }>;
}

export interface StationLane {
  id: string;
  from: string;
  to: string;
  stream: 'owner' | 'exam-card' | 'system' | 'sideflow';
  d: string;
  label?: string;
}

// ============================================================================
// 13 สถานีในผังโรงพยาบาลสัตว์ KAHIS (Main Spine + Clinical Depts + Support Units)
// ============================================================================
export const STATIONS: Record<string, StationNode> = {
  entrance: {
    id: 'entrance',
    label: 'ENTRANCE',
    labelTh: 'ทางเข้า / กรอกใบคัดกรอง',
    code: '',
    category: 'main',
    categoryLabel: 'MAIN FLOW',
    x: 85,
    y: 310
  },
  registration: {
    id: 'registration',
    label: 'REGISTRATION',
    labelTh: 'เวชระเบียน / ทำประวัติ',
    code: '',
    category: 'support',
    categoryLabel: 'SUPPORT UNIT',
    x: 225,
    y: 310
  },
  waitingHall: {
    id: 'waitingHall',
    label: 'WAITING ZONE',
    labelTh: 'โถงพักคอย / จอเรียกคิว',
    code: '',
    category: 'main',
    categoryLabel: 'MAIN FLOW',
    x: 365,
    y: 310
  },
  examEr: {
    id: 'examEr',
    label: 'ER',
    labelTh: 'ห้องฉุกเฉินและวิกฤต',
    code: '',
    category: 'department',
    categoryLabel: 'EXAM DEPT',
    x: 365,
    y: 145
  },
  examSp: {
    id: 'examSp',
    label: 'SP. CLINIC',
    labelTh: 'คลินิกเฉพาะทาง',
    code: '',
    category: 'department',
    categoryLabel: 'EXAM DEPT',
    x: 555,
    y: 145
  },
  surgery: {
    id: 'surgery',
    label: 'SURGERY',
    labelTh: 'ศัลยกรรม',
    code: '',
    category: 'department',
    categoryLabel: 'EXAM DEPT',
    x: 735,
    y: 145
  },
  examGeneral: {
    id: 'examGeneral',
    label: 'EXAM ROOM (GENERAL)',
    labelTh: 'ห้องตรวจทั่วไป',
    code: '',
    category: 'department',
    categoryLabel: 'EXAM DEPT',
    x: 555,
    y: 310,
    width: 64,
    height: 30,
    zones: [
      { zoneTitle: 'ZONE A', rooms: ['A1', 'A2', 'A3'] },
      { zoneTitle: 'ZONE B', rooms: ['B1', 'B2', 'B3'] }
    ]
  },
  xrayUsg: {
    id: 'xrayUsg',
    label: 'XRAY / USG',
    labelTh: 'เอกซเรย์และอัลตราซาวด์',
    code: '',
    category: 'support',
    categoryLabel: 'SUPPORT UNIT',
    x: 555,
    y: 485
  },
  txRoom: {
    id: 'txRoom',
    label: 'TX ROOM',
    labelTh: 'จัดยาฉีด / ฉีดยา / หัตถการ',
    code: '',
    category: 'support',
    categoryLabel: 'SUPPORT UNIT',
    x: 735,
    y: 485
  },
  rxRoom: {
    id: 'rxRoom',
    label: 'RX ROOM',
    labelTh: 'ห้องจัดยานำกลับ',
    code: '',
    category: 'support',
    categoryLabel: 'SUPPORT UNIT',
    x: 905,
    y: 170
  },
  cashier: {
    id: 'cashier',
    label: 'CASHIER',
    labelTh: 'เก็บเงิน / ใบเสร็จ / check-out',
    code: '',
    category: 'support',
    categoryLabel: 'SUPPORT UNIT',
    x: 905,
    y: 485
  },
  pharmacy: {
    id: 'pharmacy',
    label: 'PHARMACY',
    labelTh: 'ห้องจ่ายยา / รับยา',
    code: '',
    category: 'support',
    categoryLabel: 'SUPPORT UNIT',
    x: 905,
    y: 310
  },
  exit: {
    id: 'exit',
    label: 'EXIT',
    labelTh: 'ทางออก / เสร็จสิ้นการรักษา',
    code: '',
    category: 'main',
    categoryLabel: 'MAIN FLOW',
    x: 1055,
    y: 310
  }
};

// ============================================================================
// Multi-Stream Lanes (แยกเส้นทางตามประเภทการไหล: Pet & Owner, Exam Card, System, Sideflow)
// ============================================================================
export const STATION_LANES: StationLane[] = [
  // --- STREAM 1: PET & OWNER PHYSICAL WALKWAY LANES (Solid/Warm Brown) ---
  {
    id: 'owner:entrance>registration',
    from: 'entrance',
    to: 'registration',
    stream: 'owner',
    d: 'M 139 310 L 171 310'
  },
  {
    id: 'owner:registration>waitingHall',
    from: 'registration',
    to: 'waitingHall',
    stream: 'owner',
    d: 'M 279 310 L 311 310'
  },
  {
    id: 'owner:waitingHall>examGeneral',
    from: 'waitingHall',
    to: 'examGeneral',
    stream: 'owner',
    d: 'M 419 310 L 480 310'
  },
  {
    id: 'owner:examGeneral>txRoom',
    from: 'examGeneral',
    to: 'txRoom',
    stream: 'owner',
    d: 'M 642 338 L 686 458'
  },
  {
    id: 'owner:txRoom>cashier',
    from: 'txRoom',
    to: 'cashier',
    stream: 'owner',
    d: 'M 789 485 L 851 485'
  },
  {
    id: 'owner:cashier>pharmacy',
    from: 'cashier',
    to: 'pharmacy',
    stream: 'owner',
    d: 'M 915 452 L 915 374'
  },
  {
    id: 'owner:pharmacy>exit',
    from: 'pharmacy',
    to: 'exit',
    stream: 'owner',
    d: 'M 959 310 L 1001 310'
  },

  // --- STREAM 2: EXAM CARD & CLINICAL ORDER LANES (Parallel Offset Dashed Lanes) ---
  {
    id: 'card:registration>examGeneral',
    from: 'registration',
    to: 'examGeneral',
    stream: 'exam-card',
    d: 'M 275 292 Q 380 248 480 292'
  },
  {
    id: 'card:examGeneral>txRoom',
    from: 'examGeneral',
    to: 'txRoom',
    stream: 'exam-card',
    d: 'M 652 328 L 702 448'
  },
  {
    id: 'card:txRoom>rxRoom',
    from: 'txRoom',
    to: 'rxRoom',
    stream: 'exam-card',
    d: 'M 752 452 Q 805 280 852 168'
  },
  {
    id: 'card:rxRoom>pharmacy',
    from: 'rxRoom',
    to: 'pharmacy',
    stream: 'exam-card',
    d: 'M 925 228 L 925 276'
  },
  {
    id: 'card:rxRoom>cashier',
    from: 'rxRoom',
    to: 'cashier',
    stream: 'exam-card',
    d: 'M 955 228 L 955 452'
  },

  // --- STREAM 3: SIDEFLOW & SPECIALTY LANES (Purple Parallel Lanes) ---
  {
    id: 'sideflow:examGeneral>xrayUsg',
    from: 'examGeneral',
    to: 'xrayUsg',
    stream: 'sideflow',
    d: 'M 542 418 L 542 452'
  },
  {
    id: 'sideflow:xrayUsg>examGeneral',
    from: 'xrayUsg',
    to: 'examGeneral',
    stream: 'sideflow',
    d: 'M 568 452 L 568 418'
  },
  {
    id: 'sideflow:registration>examEr',
    from: 'registration',
    to: 'examEr',
    stream: 'sideflow',
    d: 'M 260 275 L 314 138'
  },
  {
    id: 'sideflow:waitingHall>examEr',
    from: 'waitingHall',
    to: 'examEr',
    stream: 'sideflow',
    d: 'M 365 276 L 365 208'
  },
  {
    id: 'sideflow:waitingHall>examSp',
    from: 'waitingHall',
    to: 'examSp',
    stream: 'sideflow',
    d: 'M 405 275 L 502 138'
  },
  {
    id: 'sideflow:examGeneral>surgery',
    from: 'examGeneral',
    to: 'surgery',
    stream: 'sideflow',
    d: 'M 595 270 L 682 138'
  },

  // --- STREAM 4: SYSTEM AUTOMATED CONTROL LANES (Green Dotted Signal Lanes) ---
  {
    id: 'system:examGeneral>waitingHall',
    from: 'examGeneral',
    to: 'waitingHall',
    stream: 'system',
    d: 'M 480 322 L 420 322'
  },
  {
    id: 'system:cashier>pharmacy',
    from: 'cashier',
    to: 'pharmacy',
    stream: 'system',
    d: 'M 890 452 L 890 374'
  },
  {
    id: 'system:cashier>registration',
    from: 'cashier',
    to: 'registration',
    stream: 'system',
    d: 'M 860 500 Q 545 575 235 374'
  }
];


// Step where each lane first appears in the clinical journey
export const LANE_MIN_STEP: Record<string, number> = {
  'owner:entrance>registration': 1,
  'owner:registration>waitingHall': 2,
  'card:registration>examGeneral': 2,
  'sideflow:registration>examEr': 2,
  'system:examGeneral>waitingHall': 3,
  'owner:waitingHall>examGeneral': 3,
  'sideflow:waitingHall>examEr': 3,
  'sideflow:waitingHall>examSp': 3,
  'sideflow:examGeneral>surgery': 4,
  'sideflow:examGeneral>xrayUsg': 5,
  'sideflow:xrayUsg>examGeneral': 5,
  'owner:examGeneral>txRoom': 6,
  'card:examGeneral>txRoom': 6,
  'card:txRoom>rxRoom': 7,
  'owner:txRoom>cashier': 7,
  'card:rxRoom>cashier': 8,
  'system:cashier>pharmacy': 8,
  'system:cashier>registration': 8,
  'card:rxRoom>pharmacy': 9,
  'owner:cashier>pharmacy': 9,
  'owner:pharmacy>exit': 9
};

// ============================================================================
// WORKFLOWS (9 ขั้นตอน ครอบคลุมการเคลื่อนที่ของ Pet & Owner, Exam Card และ System)
// ============================================================================
export const WORKFLOWS: WorkflowItem[] = [
  {
    id: 'service-journey',
    title: 'Patient Service Journey',
    titleEn: 'General OPD, Exam Card & System Flow',
    subtitle: 'ผังบริการและเวชระเบียนผู้ป่วยนอก 9 ขั้นตอน',
    group: 'clinical',
    status: 'active',
    totalSteps: 9,
    overviewDesc:
      'จำลองการทำงานแบบ Multi-Stream ของโรงพยาบาลสัตว์ KAHIS แยกเส้นทางการเดินของเจ้าของและสัตว์เลี้ยง (Pet & Owner) ที่แสดงตำแหน่งตลอดเวลา ออกจากเส้นทางการไหลของใบตรวจ (Exam Card), การส่งตรวจพิเศษ (Sideflow Xray/USG) และการทำงานอัตโนมัติของระบบ (System Queue Call & Case Discharge)',
    facts: [
      { label: 'MAIN FLOW', value: 'Entrance > Reg > Waiting > Exam > Tx > Rx > Cashier > Pharm > Exit' },
      { label: 'EXAM DEPTS', value: 'General (Zone A 1-3, Zone B 1-3), ER, Sp. Clinic, Surgery' },
      { label: 'SUPPORT UNITS', value: 'Registration, Tx, Rx, Xray/USG, Cashier, Pharmacy' },
      { label: '3 ACTIVE STREAMS', value: '1) Pet & Owner  2) Exam Card  3) KAHIS System' },
      { label: 'SYSTEM AUTOMATION', value: 'Queue Screen/Audio Call & Auto Case Discharge (Visit Inactive)' }
    ],
    steps: [
      {
        id: 1,
        title: '1. ทางเข้า & คัดกรอง (Entrance)',
        titleEn: 'Arrival & Initial Triage',
        subtitle: 'สัตว์ป่วยเข้าจุดลงทะเบียน คัดกรองทั่วไป/ฉุกเฉิน',
        actor: 'Pet & Owner / Staff',
        actorType: 'owner',
        target: 'Registration (เวชระเบียน)',
        module: 'ENTRANCE / TRIAGE',
        output: 'data',
        action: 'เจ้าของพาสัตว์เลี้ยงจาก Entrance เข้าติดต่อจุด Registration (คัดกรองเบื้องต้น)',
        refCode: 'ARRIV-GATE01',
        time: '0.000s',
        fromNode: 'entrance',
        toNode: 'registration',
        laneId: 'owner:entrance>registration',
        activeLanes: ['owner:entrance>registration'],
        badgeColor: 'owner',
        petOwner: {
          fromNode: 'entrance',
          toNode: 'registration',
          statusLabel: 'เดินเข้าสู่จุดเวชระเบียน (Registration)'
        },
        packets: [
          {
            id: 'pkt-step1-owner',
            stream: 'owner',
            tone: 'owner',
            laneId: 'owner:entrance>registration',
            fromNode: 'entrance',
            toNode: 'registration',
            tag: 'PET & OWNER',
            title: 'HN 65008888 (Poodle)',
            fields: [
              { k: 'FROM', v: 'Entrance' },
              { k: 'TO', v: 'Registration' }
            ]
          }
        ],
        stationNotes: [
          {
            id: 'note-step1-alarm',
            nodeId: 'entrance',
            tone: 'alarm',
            roleLabel: 'ALARM',
            title: 'ER Fast-Track',
            detail: 'เคสวิกฤต ส่งตรง ER',
            offsetX: -28,
            offsetY: -66
          },
          {
            id: 'note-step1-staff',
            nodeId: 'registration',
            tone: 'staff',
            roleLabel: 'STAFF',
            title: 'Triage & Search',
            detail: 'ค้นหา HN / คัดกรอง',
            offsetX: 32,
            offsetY: -66
          }
        ],
        characterImage: '/images/blueprint/pet.png',
        characterTitle: 'เจ้าของสัตว์อุ้มสุนัขพุดเดิ้ล (HN 65008888) เข้าจุดลงทะเบียน',
        uiPromptLabel: 'ดูหน้าจอค้นหาเวชระเบียน (Search HN UI)',
        uiWireframes: [
          {
            id: 'search-ui',
            title: 'Search HN Wireframe (2D Blueprint)',
            image: '/images/blueprint/search.jpg',
            tag: 'SEARCH UI',
            badgeLabel: 'KAHIS Search Module'
          }
        ],
        explanation: {
          title: 'การเดินทางมาถึงและคัดกรองแยกแผนก (Entrance > Registration)',
          role: 'Pet & Owner และเจ้าหน้าที่คัดกรอง (Staff)',
          location: 'Entrance เชื่อมต่อไปยัง Registration',
          systemUsed: 'KAHIS Search HN & Triage Check',
          clinicalNote:
            'จุดแสดงตำแหน่ง Pet & Owner เริ่มต้นที่ Entrance และเคลื่อนที่ไปยัง Registration โดยมีเจ้าหน้าที่คอยคัดกรอง หากสัตว์มีภาวะฉุกเฉินจะมีสัญญาณ Alarm ส่งแยกเข้าแผนก ER ทันที',
          keyPoints: [
            'ค้นหาประวัติด้วย HN, ชื่อสัตว์ หรือชื่อเจ้าของที่เคาน์เตอร์ Registration',
            'คัดกรองแผนกตรวจ: General (ทั่วไป), ER (ฉุกเฉิน), Sp. Clinic (เฉพาะทาง)',
            'จุดสีน้ำตาล Pet & Owner แสดงตำแหน่งจริงของสัตว์และเจ้าของบนแผนผังตลอดเวลา'
          ]
        }
      },
      {
        id: 2,
        title: '2. ออกคิว & ใบตรวจ (Check-in)',
        titleEn: 'Check-in, Visit No. Active & Exam Card Dispatch',
        subtitle: 'เปิด Visit No. ส่งคิวเข้าแผนก เคสรอที่โถงคอย',
        actor: 'Staff / System',
        actorType: 'staff',
        target: 'Waiting Hall & Exam Room',
        module: 'CHECK-IN / VISIT ACTIVE',
        output: 'Q slip',
        action: 'ออก Visit No. (Active) ส่ง Exam Card เข้าห้องตรวจ ส่วน Pet & Owner ไปรอที่ Waiting Hall',
        refCode: 'VN-690315-ACT',
        time: '0.018s',
        fromNode: 'registration',
        toNode: 'waitingHall',
        laneId: 'owner:registration>waitingHall',
        activeLanes: ['owner:registration>waitingHall', 'card:registration>examGeneral'],
        badgeColor: 'staff',
        petOwner: {
          fromNode: 'registration',
          toNode: 'waitingHall',
          statusLabel: 'นั่งรอเรียกคิวที่ Waiting Hall (คิว WA001)'
        },
        packets: [
          {
            id: 'pkt-step2-owner',
            stream: 'owner',
            tone: 'owner',
            laneId: 'owner:registration>waitingHall',
            fromNode: 'registration',
            toNode: 'waitingHall',
            tag: 'PET & OWNER',
            title: 'Queue WA001 -> Waiting',
            fields: [
              { k: 'WEIGHT', v: '0.89 kg' },
              { k: 'WAIT AT', v: 'Waiting Hall' }
            ]
          },
          {
            id: 'pkt-step2-card',
            stream: 'system',
            tone: 'system',
            laneId: 'card:registration>examGeneral',
            fromNode: 'registration',
            toNode: 'examGeneral',
            tag: 'CHECK-IN LIST',
            title: 'Zone A > Check-in List',
            lines: ['Zone A > Check-in List', 'Zone B > Check-in List'],
            fields: [
              { k: 'VISIT NO', v: 'ACTIVE' },
              { k: 'TARGET', v: 'Zone A & Zone B' }
            ],
            stopOffsetX: 22,
            stopOffsetY: -68
          }
        ],
        stationNotes: [
          {
            id: 'note-step2-staff',
            nodeId: 'registration',
            tone: 'staff',
            roleLabel: 'STAFF',
            title: 'Check-in',
            detail: 'บันทึก นน. อาการ Q no',
            offsetX: -32,
            offsetY: -66
          },
          {
            id: 'note-step2-sys',
            nodeId: 'waitingHall',
            tone: 'system',
            roleLabel: 'SYS',
            title: 'Check-in Q',
            detail: 'Sent data to station Q list',
            offsetX: 0,
            offsetY: -66
          }
        ],
        characterImage: '/images/blueprint/registration.png',
        characterTitle: 'เจ้าหน้าที่เวชระเบียนลงทะเบียน Check-in และออกคิวตรวจ',
        uiPromptLabel: 'ดูหน้าจอลงทะเบียน Check-in (Check-in Modal UI)',
        uiWireframes: [
          {
            id: 'checkin-ui',
            title: 'Check-in Modal Wireframe',
            image: '/images/blueprint/checkin.jpg',
            tag: 'CHECK-IN UI',
            badgeLabel: 'Registration & Queue'
          },
          {
            id: 'search-ui-2',
            title: 'Search HN Wireframe',
            image: '/images/blueprint/search.jpg',
            tag: 'SEARCH UI',
            badgeLabel: 'Patient Lookup'
          }
        ],
        explanation: {
          title: 'การแยกเส้นทางระหว่าง Pet & Owner และ Exam Card',
          role: 'เจ้าหน้าที่เวชระเบียน (Staff) & ระบบ KAHIS (System)',
          location: 'Registration -> Waiting Hall & Exam Room (General)',
          systemUsed: 'KAHIS Check-in & Queue Dispatcher',
          clinicalNote:
            'ในขั้นนี้จะเห็นเส้นทางวิ่งพร้อมกัน 2 เส้น: (1) Pet & Owner เดินจาก Registration ไปนั่งรอที่ Waiting Hall และ (2) ระบบส่ง Exam Card อิเล็กทรอนิกส์วิ่งตรงเข้าสู่คิวห้องตรวจ Exam Room (General - Zone A) พร้อมเปิดสถานะ Visit No. เป็น Active',
          keyPoints: [
            'Staff บันทึกน้ำหนักสัตว์ อาการสำคัญ และเลือกแผนกตรวจ (General / Sp. Clinic / ER)',
            'System สร้างหมายเลข Visit No. สถานะ ACTIVE',
            'Exam Card ถูกส่งเข้า Worklist ของห้องตรวจทันทีโดยไม่ต้องถือแฟ้มกระดาษ'
          ]
        }
      },
      {
        id: 3,
        title: '3. เรียกคิว (DVM Call)',
        titleEn: 'DVM Queue Call & System Audio/Display Broadcast',
        subtitle: 'หมอกดเรียกคิว จอและเสียงประกาศ เคสเข้าห้องตรวจ',
        actor: 'DVM / System / Owner',
        actorType: 'system',
        target: 'Exam Room (General - Zone A #1)',
        module: 'QUEUE CALL / DISPLAY & AUDIO',
        output: 'data',
        action: 'สัตวแพทย์กด Call Queue -> ระบบเปลี่ยนหน้าจอ TV + ส่งเสียงเรียก -> Pet & Owner เข้าห้องตรวจ Zone A #1',
        refCode: 'CALL-ZONE-A1',
        time: '0.035s',
        fromNode: 'waitingHall',
        toNode: 'examGeneral',
        laneId: 'owner:waitingHall>examGeneral',
        activeLanes: ['system:examGeneral>waitingHall', 'owner:waitingHall>examGeneral'],
        badgeColor: 'system',
        petOwner: {
          fromNode: 'waitingHall',
          toNode: 'examGeneral',
          statusLabel: 'เดินเข้าห้องตรวจ Exam Room (General · Zone A ห้อง 1)',
          subZone: 'A1'
        },
        packets: [
          {
            id: 'pkt-step3-sys',
            stream: 'system',
            tone: 'system',
            laneId: 'system:examGeneral>waitingHall',
            fromNode: 'examGeneral',
            toNode: 'waitingHall',
            tag: 'SYSTEM CALL',
            title: 'TV Display + Audio Call',
            fields: [
              { k: 'QUEUE', v: 'WA001' },
              { k: 'ROOM', v: 'Zone A - No. 1' }
            ],
            stopOffsetX: 0,
            stopOffsetY: 102
          },
          {
            id: 'pkt-step3-owner',
            stream: 'owner',
            tone: 'owner',
            laneId: 'owner:waitingHall>examGeneral',
            fromNode: 'waitingHall',
            toNode: 'examGeneral',
            tag: 'PET & OWNER',
            title: 'Enter Zone A - No. 1',
            fields: [
              { k: 'DEPT', v: 'General Exam' },
              { k: 'ZONE', v: 'Zone A (#1)' }
            ]
          }
        ],
        stationNotes: [
          {
            id: 'note-step3-sys',
            nodeId: 'waitingHall',
            tone: 'system',
            roleLabel: 'SYSTEM',
            title: 'Queue Display',
            detail: 'ขึ้นจอ TV + เสียงเรียกคิว',
            offsetX: -14,
            offsetY: -68
          },
          {
            id: 'note-step3-dvm',
            nodeId: 'examGeneral',
            tone: 'dvm',
            roleLabel: 'DVM',
            title: 'Call Queue',
            detail: 'กดเรียกคิวเข้า Zone A #1',
            offsetX: 14,
            offsetY: -68
          }
        ],
        characterImage: '/images/blueprint/examination-1.png',
        characterTitle: 'ระบบประกาศเรียกคิวเข้าห้องตรวจ General (Zone A ห้อง 1)',
        uiPromptLabel: 'ดูหน้าจอตรวจสัญญาณชีพ (VPE UI)',
        uiWireframes: [
          {
            id: 'vpe-form-preview',
            title: 'Vital Sign & Physical Exam Form',
            image: '/images/blueprint/vpe.jpg',
            tag: 'VPE FORM UI',
            badgeLabel: 'Room Zone A-1 Ready'
          }
        ],
        explanation: {
          title: 'สัตวแพทย์กดเรียกคิว และระบบเปลี่ยนหน้าจอพร้อมเสียงประกาศอัตโนมัติ',
          role: 'สัตวแพทย์ (DVM), ระบบเรียกคิวอัจฉริยะ (System) & Pet Owner',
          location: 'Exam Room (General: Zone A 1,2,3 / Zone B 1,2,3) <-> Waiting Hall',
          systemUsed: 'KAHIS Queue Call & Digital Signage Audio Server',
          clinicalNote:
            'เมื่อสัตวแพทย์ในห้องตรวจ Exam Room (General - Zone A ห้อง 1) กดปุ่มเรียกคิว สัญญาณ System สีเขียวจะวิ่งย้อนไปยัง Waiting Hall เพื่ออัปเดตหน้าจอ TV และส่งเสียงพูดเรียกคิวอัตโนมัติ จากนั้น Pet & Owner จึงเดินเข้าสู่ห้องตรวจ Zone A ห้อง 1',
          keyPoints: [
            'รองรับห้องตรวจ General แบ่งเป็น Zone A (ห้อง 1, 2, 3) และ Zone B (ห้อง 1, 2, 3)',
            'สัญญาณ System ทำงานอัตโนมัติทันทีที่หมอกดเรียกคิว',
            'เจ้าของและสัตว์เลี้ยงเคลื่อนที่จาก Waiting Hall เข้าสู่ Exam Room (Zone A #1)'
          ]
        }
      },
      {
        id: 4,
        title: '4. ตรวจรักษา (Examination)',
        titleEn: 'Clinical Examination & Exam Card 65:35 Documentation',
        subtitle: 'หมอตรวจร่างกาย วัดสัญญาณชีพ และบันทึก Exam Card',
        actor: 'DVM (สัตวแพทย์)',
        actorType: 'dvm',
        target: 'Exam Room (Zone A #1)',
        module: 'EXAM CARD 65:35 / VPE',
        output: 'data',
        action: 'ตรวจร่างกายวัดสัญญาณชีพ บันทึกผลลง Exam Card และสั่งตรวจเพิ่มเติม',
        refCode: 'EC-6535-A1',
        time: '0.052s',
        fromNode: 'examGeneral',
        toNode: 'examGeneral',
        laneId: '',
        activeLanes: [],
        badgeColor: 'dvm',
        petOwner: {
          fromNode: 'examGeneral',
          toNode: 'examGeneral',
          statusLabel: 'กำลังรับการตรวจใน Exam Room (Zone A ห้อง 1)',
          subZone: 'A1'
        },
        packets: [],
        stationNotes: [
          {
            id: 'note-step4-dvm',
            nodeId: 'examGeneral',
            tone: 'dvm',
            roleLabel: 'DVM',
            title: 'Exam Card',
            detail: 'บันทึก VPE & Diagnosis',
            offsetX: -92,
            offsetY: -58
          },
          {
            id: 'note-step4-alarm',
            nodeId: 'examGeneral',
            tone: 'alarm',
            roleLabel: 'ALARM',
            title: 'Clinical Alert',
            detail: 'เตือนแพ้ยา / Vital ผิดปกติ',
            offsetX: 92,
            offsetY: -58
          }
        ],
        characterImage: '/images/blueprint/dvm-comp.png',
        characterTitle: 'สัตวแพทย์ตรวจร่างกายและบันทึก Exam Card 65:35 ในห้องตรวจ Zone A #1',
        uiPromptLabel: 'ดูหน้าจอ Exam Card 65:35 & Assessment (6 หน้าจอ)',
        uiWireframes: [
          {
            id: 'examcard-editor',
            title: 'Subjective & Systematic Exam Card Editor',
            image: '/images/blueprint/examcard.jpg',
            tag: 'EXAM CARD 65:35',
            badgeLabel: 'Core 65:35 Form'
          },
          {
            id: 'vpe-form',
            title: 'Vital Sign & Physical Exam Form',
            image: '/images/blueprint/vpe.jpg',
            tag: 'VPE FORM',
            badgeLabel: 'Core Vital Signs'
          },
          {
            id: 'vpe-table',
            title: 'Patient Vital History Table',
            image: '/images/blueprint/vpe-table.jpg',
            tag: 'VPE TABLE',
            badgeLabel: 'Longitudinal Vitals'
          },
          {
            id: 'assessment-editor',
            title: 'Assessment & Problem Diagnosis Terms (PDT)',
            image: '/images/blueprint/assessment.jpg',
            tag: 'ASSESSMENT',
            badgeLabel: 'Diagnostic Synthesis'
          },
          {
            id: 'assessment-concept',
            title: 'SNOMED CT Concept Search',
            image: '/images/blueprint/assessment-concept.jpg',
            tag: 'SNOMED CT',
            badgeLabel: 'Standard Terminology'
          },
          {
            id: 'assessment-table',
            title: 'Assessment Longitudinal Table',
            image: '/images/blueprint/assessment-table.jpg',
            tag: 'DIAG HISTORY',
            badgeLabel: 'Historical Diagnoses'
          }
        ],
        explanation: {
          title: 'การตรวจร่างกายและบันทึก Exam Card ภายในห้องตรวจ (Zone A ห้อง 1)',
          role: 'สัตวแพทย์ประจำห้องตรวจ (DVM)',
          location: 'Exam Room (General - Zone A ห้อง 1)',
          systemUsed: 'KAHIS Exam Card 65:35, VPE & SNOMED CT Assessment',
          clinicalNote:
            'ขณะที่ Pet & Owner อยู่ภายในห้องตรวจ Zone A ห้อง 1 สัตวแพทย์จะทำการตรวจร่างกาย วัดสัญญาณชีพ และบันทึกข้อมูลลงใน Exam Card ดีไซน์ 65:35 พร้อมระบบแจ้งเตือน Alarm หากมีประวัติแพ้ยาหรือค่า Vital Signs เกินเกณฑ์',
          keyPoints: [
            'บันทึก Subjective & Objective 26 หัวข้อ พร้อม Live Summary ด้านขวา',
            'เปรียบเทียบตารางสัญญาณชีพย้อนหลัง (VPE Longitudinal Table)',
            'ระบุคำวินิจฉัยมาตรฐาน SNOMED CT และวางแผนการรักษา'
          ]
        }
      },
      {
        id: 5,
        title: '5. เอกซเรย์ & ซาวด์ (X-Ray/USG)',
        titleEn: 'Diagnostic Imaging Sideflow (X-ray & Ultrasonography)',
        subtitle: 'ส่งตรวจหน่วยรังสี และส่งผลกลับห้องตรวจ',
        actor: 'Sideflow (DVM & Imaging Staff)',
        actorType: 'sideflow',
        target: 'Xray / USG (Support Unit)',
        module: 'SIDEFLOW / XRAY & USG',
        output: 'Order slip',
        action: 'ส่งใบสั่งตรวจและพาสัตว์ไปเอกซเรย์/อัลตราซาวด์ที่หน่วย Xray/USG ก่อนกลับมาประเมินผล',
        refCode: 'IMG-XRAY-USG',
        time: '0.068s',
        fromNode: 'examGeneral',
        toNode: 'xrayUsg',
        laneId: 'sideflow:examGeneral>xrayUsg',
        activeLanes: [
          'sideflow:examGeneral>xrayUsg',
          'sideflow:xrayUsg>examGeneral'
        ],
        badgeColor: 'sideflow',
        petOwner: {
          fromNode: 'examGeneral',
          toNode: 'xrayUsg',
          statusLabel: 'พาสัตว์ไปตรวจพิเศษที่ห้อง Xray / USG (Sideflow)'
        },
        packets: [
          {
            id: 'pkt-step5-sideflow-out',
            stream: 'sideflow',
            tone: 'sideflow',
            laneId: 'sideflow:examGeneral>xrayUsg',
            fromNode: 'examGeneral',
            toNode: 'xrayUsg',
            tag: 'SIDEFLOW ORDER',
            title: 'X-ray & USG Request',
            fields: [
              { k: 'EXAM CARD', v: 'Attached' },
              { k: 'STUDY', v: 'Abd USG + Thorax' }
            ],
            stopOffsetX: 98,
            stopOffsetY: -62
          },
          {
            id: 'pkt-step5-sideflow-back',
            stream: 'sideflow',
            tone: 'sideflow',
            laneId: 'sideflow:xrayUsg>examGeneral',
            fromNode: 'xrayUsg',
            toNode: 'examGeneral',
            tag: 'IMAGING RESULT',
            title: 'DICOM & USG Report',
            fields: [
              { k: 'STATUS', v: 'Verified' },
              { k: 'RETURN', v: 'Zone A (#1)' }
            ],
            stopOffsetX: 98,
            stopOffsetY: -68
          }
        ],
        stationNotes: [
          {
            id: 'note-step5-sideflow',
            nodeId: 'xrayUsg',
            tone: 'sideflow',
            roleLabel: 'SIDEFLOW',
            title: 'Xray / USG',
            detail: 'ตรวจภาพวินิจฉัย + ส่งผล',
            offsetX: -90,
            offsetY: -62
          },
          {
            id: 'note-step5-dvm',
            nodeId: 'examGeneral',
            tone: 'dvm',
            roleLabel: 'DVM',
            title: 'Review Plan',
            detail: 'อ่านผลภาพ & สรุปแผน',
            offsetX: -90,
            offsetY: -68
          }
        ],
        characterImage: '/images/blueprint/examination-1.png',
        characterTitle: 'การส่งตรวจทางรังสีวินิจฉัยและอัลตราซาวด์ (Xray / USG Sideflow)',
        uiPromptLabel: 'ดูหน้าจอวางแผนการตรวจรักษา (Plan UI)',
        uiWireframes: [
          {
            id: 'plan-editor',
            title: 'Plan Editor (Diagnostic & Imaging Orders)',
            image: '/images/blueprint/plan.jpg',
            tag: 'PLAN EDITOR',
            badgeLabel: 'Diagnostic Orders'
          },
          {
            id: 'plan-table',
            title: 'All Patient Plans History Table',
            image: '/images/blueprint/plan-table.jpg',
            tag: 'PLAN TABLE',
            badgeLabel: 'Plan Tracking'
          }
        ],
        explanation: {
          title: 'กระบวนการ Sideflow: ส่งตรวจ Xray และ Ultrasonography',
          role: 'สัตวแพทย์ (DVM) และเจ้าหน้าที่รังสีวินิจฉัย (Xray/USG Support Unit)',
          location: 'Exam Room (General) <-> Xray / USG',
          systemUsed: 'KAHIS Plan Module & PACS / Ultrasound Reporting',
          clinicalNote:
            'ในกรณีที่ต้องตรวจวินิจฉัยเพิ่มเติมด้วยภาพถ่ายรังสี (X-ray) หรืออัลตราซาวด์ (Ultrasonography) จะเกิดเส้นทาง Sideflow สีม่วงเชื่อมระหว่าง Exam Room และหน่วยสนับสนุน Xray/USG โดยทั้งตัวสัตว์และข้อมูล Exam Card จะเชื่อมโยงกันแบบไป-กลับ',
          keyPoints: [
            'สั่งตรวจผ่านโมดูล Plan ส่งใบสั่งอิเล็กทรอนิกส์ไปยังห้อง Xray/USG',
            'รองรับการส่งต่อข้ามแผนก เช่น ส่งต่อห้องผ่าตัด (Surgery) หรือคลินิกเฉพาะทาง (Sp. Clinic)',
            'ผลตรวจเชื่อมกลับเข้าสู่ Exam Card เพื่อให้หมอสรุปแผนการรักษาขั้นถัดไป'
          ]
        }
      },
      {
        id: 6,
        title: '6. ห้องหัตถการ (Tx Room)',
        titleEn: 'Treatment Room: Injectable Meds Prep & Procedures',
        subtitle: 'ส่ง order จัดยา ดำเนินการ บันทึกผล ส่งกลับห้องตรวจ',
        actor: 'DVM / Staff / Owner',
        actorType: 'dvm',
        target: 'Tx Room (ห้องหัตถการ)',
        module: 'TX ROOM / PROCEDURES',
        output: 'Order slip',
        action: 'ส่งคำสั่งหัตถการเข้า Tx Room เจ้าหน้าที่และสัตวแพทย์จัดยาฉีด ฉีดยา และทำแผล/หัตถการ',
        refCode: 'TX-PROC-108',
        time: '0.084s',
        fromNode: 'examGeneral',
        toNode: 'txRoom',
        laneId: 'owner:examGeneral>txRoom',
        activeLanes: ['owner:examGeneral>txRoom', 'card:examGeneral>txRoom'],
        badgeColor: 'dvm',
        petOwner: {
          fromNode: 'examGeneral',
          toNode: 'txRoom',
          statusLabel: 'พาสัตว์เข้ารับการฉีดยาและทำหัตถการที่ Tx Room'
        },
        packets: [
          {
            id: 'pkt-step6-owner',
            stream: 'owner',
            tone: 'owner',
            laneId: 'owner:examGeneral>txRoom',
            fromNode: 'examGeneral',
            toNode: 'txRoom',
            tag: 'PET & OWNER',
            title: 'Move to Tx Room',
            fields: [
              { k: 'STEP', v: 'Injection / Tx' },
              { k: 'STATION', v: 'Tx Room' }
            ]
          },
          {
            id: 'pkt-step6-card',
            stream: 'exam-card',
            tone: 'dvm',
            laneId: 'card:examGeneral>txRoom',
            fromNode: 'examGeneral',
            toNode: 'txRoom',
            tag: 'EXAM CARD & TX',
            title: 'Injectable & Procedure Order',
            fields: [
              { k: 'INJECT', v: 'SC / IV Meds' },
              { k: 'PROC', v: 'Fluid & Wound Care' }
            ],
            stopOffsetX: 0,
            stopOffsetY: -120
          }
        ],
        stationNotes: [
          {
            id: 'note-step6-staff',
            nodeId: 'txRoom',
            tone: 'staff',
            roleLabel: 'STAFF',
            title: 'Prep Tx Meds',
            detail: 'จัดเตรียมยาฉีด / อุปกรณ์',
            offsetX: -90,
            offsetY: -68
          },
          {
            id: 'note-step6-dvm',
            nodeId: 'txRoom',
            tone: 'dvm',
            roleLabel: 'DVM',
            title: 'Injection / Tx',
            detail: 'ฉีดยาและทำหัตถการ',
            offsetX: 90,
            offsetY: -68
          }
        ],
        characterImage: '/images/blueprint/examination-1.png',
        characterTitle: 'การจัดยาฉีด ฉีดยา และทำหัตถการภายใน Tx Room',
        uiPromptLabel: 'ดูหน้าจอสั่งหัตถการและยา (Quick Order Tx UI)',
        uiWireframes: [
          {
            id: 'order-tx-step6',
            title: 'Quick Order Tx & Procedure Cart',
            image: '/images/blueprint/order.jpg',
            tag: 'ORDER TX UI',
            badgeLabel: 'Tx Room Execution'
          }
        ],
        explanation: {
          title: 'การส่งต่อจากห้องตรวจเข้าสู่ Tx Room (จัดยาฉีดและทำหัตถการ)',
          role: 'สัตวแพทย์ (DVM) และเจ้าหน้าที่ห้องหัตถการ (Tx Room Staff)',
          location: 'Exam Room (General) -> Tx Room',
          systemUsed: 'KAHIS Quick Order Tx & Treatment Execution Log',
          clinicalNote:
            'หลังจากตรวจเสร็จ ทั้ง Pet & Owner และใบสั่งใน Exam Card จะเคลื่อนที่มายัง Tx Room ซึ่งเป็นหน่วยสนับสนุนสำหรับจัดเตรียมยาฉีด ฉีดยา ให้สารน้ำ และทำหัตถการให้เรียบร้อยก่อนกลับบ้าน',
          keyPoints: [
            'แยกงานจัดยาฉีดและทำหัตถการไว้ที่ Tx Room อย่างชัดเจน',
            'บันทึกเวลาผู้ฉีดยาและตัดสต็อกเวชภัณฑ์ในห้อง Tx อัตโนมัติ',
            'เมื่อทำหัตถการเสร็จ ข้อมูลใบสั่งยากลับบ้านจะส่งต่อไปยัง Rx Room'
          ]
        }
      },
      {
        id: 7,
        title: '7. จัดยานำกลับ (Rx Prep)',
        titleEn: 'Rx Room Medication Preparation & Billing Transfer',
        subtitle: 'ส่งใบสั่งยาไปห้องจัดยา เจ้าของไปรอที่การเงิน',
        actor: 'Staff (Rx Room) & Pet Owner',
        actorType: 'staff',
        target: 'Rx Room & Cashier',
        module: 'RX PREP / BILLING SYNC',
        output: 'Order slip',
        action: 'ใบสั่งยาวิ่งเข้า Rx Room เพื่อจัดยานำกลับ ส่วน Pet & Owner เดินจาก Tx Room ไปรอชำระเงินที่ Cashier',
        refCode: 'RX-PREP-4350',
        time: '0.098s',
        fromNode: 'txRoom',
        toNode: 'rxRoom',
        laneId: 'card:txRoom>rxRoom',
        activeLanes: ['card:txRoom>rxRoom', 'owner:txRoom>cashier'],
        badgeColor: 'staff',
        petOwner: {
          fromNode: 'txRoom',
          toNode: 'cashier',
          statusLabel: 'เดินจาก Tx Room ไปติดต่อชำระเงินที่ Cashier'
        },
        packets: [
          {
            id: 'pkt-step7-card',
            stream: 'exam-card',
            tone: 'staff',
            laneId: 'card:txRoom>rxRoom',
            fromNode: 'txRoom',
            toNode: 'rxRoom',
            tag: 'EXAM CARD (RX)',
            title: 'Take-Home Meds Order',
            fields: [
              { k: 'UNIT', v: 'Rx Room (จัดยา)' },
              { k: 'ITEMS', v: '4 Prescriptions' }
            ],
            stopOffsetX: 95,
            stopOffsetY: -64
          },
          {
            id: 'pkt-step7-owner',
            stream: 'owner',
            tone: 'owner',
            laneId: 'owner:txRoom>cashier',
            fromNode: 'txRoom',
            toNode: 'cashier',
            tag: 'PET & OWNER',
            title: 'Proceed to Cashier',
            fields: [
              { k: 'FROM', v: 'Tx Room' },
              { k: 'TO', v: 'Cashier' }
            ]
          }
        ],
        stationNotes: [
          {
            id: 'note-step7-rx',
            nodeId: 'rxRoom',
            tone: 'staff',
            roleLabel: 'STAFF (RX)',
            title: 'Prep Rx Meds',
            detail: 'จัดยากลับบ้าน + พิมพ์ฉลาก',
            offsetX: -82,
            offsetY: -64
          },
          {
            id: 'note-step7-cashier',
            nodeId: 'cashier',
            tone: 'system',
            roleLabel: 'SYSTEM',
            title: 'Billing Sync',
            detail: 'Sent charge to Cashier',
            offsetX: 0,
            offsetY: -68
          }
        ],
        characterImage: '/images/blueprint/pharmacy.png',
        characterTitle: 'เจ้าหน้าที่ Rx Room จัดเตรียมยานำกลับและพิมพ์ฉลากยา',
        uiPromptLabel: 'ดูหน้าจอรายการสั่งยา (Medication Order UI)',
        uiWireframes: [
          {
            id: 'order-dispense',
            title: 'Prescribed Order & Medication Cart',
            image: '/images/blueprint/order.jpg',
            tag: 'RX ORDER UI',
            badgeLabel: 'Rx Preparation Queue'
          }
        ],
        explanation: {
          title: 'การทำงานคู่ขนาน: Rx Room จัดยานำกลับ ขณะที่ Pet & Owner เดินไป Cashier',
          role: 'เจ้าหน้าที่จัดยา (Rx Room Staff) และ Pet & Owner',
          location: 'Tx Room -> Rx Room (สำหรับใบสั่งยา) และ Tx Room -> Cashier (สำหรับเจ้าของสัตว์)',
          systemUsed: 'KAHIS Rx Preparation Worklist & Billing Aggregator',
          clinicalNote:
            'จุดเด่นของผัง Multi-Lane: เมื่อเสร็จจาก Tx Room ตัวเจ้าของและสัตว์เลี้ยง (Pet & Owner) จะเดินลงไปยัง Cashier เพื่อชำระเงิน ในขณะที่ข้อมูล Exam Card และใบสั่งยาจะวิ่งขึ้นไปยัง Rx Room เพื่อจัดยานำกลับและส่งไปเตรียมรอส่งมอบที่ Pharmacy เป็นการลดเวลารอคอย',
          keyPoints: [
            'แยกหน่วย Rx Room (ห้องจัดยา/พิมพ์ฉลาก) ออกจาก Pharmacy (ช่องจ่ายยาและอธิบายวิธีใช้)',
            'ตรวจสอบความถูกต้องของขนาดยา (Double-check Dose & Frequency)',
            'รวมค่าใช้จ่ายทุกแผนกส่งเข้าหน้าจอ Cashier อัตโนมัติ'
          ]
        }
      },
      {
        id: 8,
        title: '8. ชำระเงิน (Cashier & Discharge)',
        titleEn: 'Cashier Payment & Automated System Case Discharge',
        subtitle: 'ออกใบเสร็จ ระบบปิดเคส (Inactive) ปลดล็อกคิวรับยา',
        actor: 'Staff (Cashier) / System',
        actorType: 'system',
        target: 'Cashier (การเงิน)',
        module: 'CASHIER / AUTO DISCHARGE',
        output: 'ใบเสร็จ',
        action: 'ชำระเงินออกใบเสร็จ -> ระบบ Discharge Case เปลี่ยน Visit No. เป็น Inactive และปลดล็อกคิวจ่ายยา',
        refCode: 'VN-INACTIVE-OK',
        time: '0.112s',
        fromNode: 'rxRoom',
        toNode: 'cashier',
        laneId: 'card:rxRoom>cashier',
        activeLanes: [
          'card:rxRoom>cashier',
          'system:cashier>pharmacy'
        ],
        badgeColor: 'system',
        petOwner: {
          fromNode: 'cashier',
          toNode: 'cashier',
          statusLabel: 'กำลังชำระเงินและรับใบเสร็จที่ Cashier'
        },
        packets: [
          {
            id: 'pkt-step8-sys-pharm',
            stream: 'system',
            tone: 'system',
            laneId: 'system:cashier>pharmacy',
            fromNode: 'cashier',
            toNode: 'pharmacy',
            tag: 'SYSTEM SIGNAL',
            title: 'Payment OK -> Release Meds',
            fields: [
              { k: 'RECEIPT', v: 'PAID' },
              { k: 'ACTION', v: 'Unlock Pharmacy' }
            ],
            stopOffsetX: 0,
            stopOffsetY: -68
          },
          {
            id: 'pkt-step8-sys-discharge',
            stream: 'exam-card',
            tone: 'staff',
            laneId: 'card:rxRoom>cashier',
            fromNode: 'rxRoom',
            toNode: 'cashier',
            tag: 'BILLING SUMMARY',
            title: 'Invoice -> Cashier',
            fields: [
              { k: 'CASE', v: 'Ready to Pay' },
              { k: 'VISIT NO', v: '-> INACTIVE' }
            ],
            stopOffsetX: -125,
            stopOffsetY: -135
          }
        ],
        stationNotes: [
          {
            id: 'note-step8-staff',
            nodeId: 'cashier',
            tone: 'staff',
            roleLabel: 'STAFF',
            title: 'Payment',
            detail: 'รับชำระเงิน + ออกใบเสร็จ',
            offsetX: -90,
            offsetY: -68
          },
          {
            id: 'note-step8-sys',
            nodeId: 'cashier',
            tone: 'system',
            roleLabel: 'SYSTEM',
            title: 'Auto Discharge',
            detail: 'Visit No -> INACTIVE',
            offsetX: 90,
            offsetY: -68
          }
        ],
        characterImage: '/images/blueprint/cashier.png',
        characterTitle: 'เจ้าหน้าที่การเงินรับชำระเงิน และระบบสั่ง Discharge Case (Visit No. -> Inactive)',
        uiPromptLabel: 'ดูภาพฉากการชำระเงินและปิดเคส (Cashier Scene)',
        uiWireframes: [],
        explanation: {
          title: 'การชำระเงินและการทำงานอัตโนมัติของระบบ (Auto Discharge & Visit No. Inactive)',
          role: 'เจ้าหน้าที่การเงิน (Cashier Staff) & ระบบ KAHIS (System)',
          location: 'Cashier -> Pharmacy & Central Visit Registry',
          systemUsed: 'KAHIS Cashier Billing & Visit Lifecycle Controller',
          clinicalNote:
            'เมื่อเจ้าหน้าที่การเงินบันทึกการรับชำระเงินเรียบร้อย ระบบ KAHIS (จุดสีเขียว System) จะทำงานอัตโนมัติ 2 ส่วนพร้อมกัน: (1) ทำการ Discharge Case ของผู้ป่วยนอกและเปลี่ยนสถานะหมายเลข Visit No. จาก Active เป็น Inactive และ (2) ส่งสัญญาณปลดล็อกใบยาไปยังห้อง Pharmacy',
          keyPoints: [
            'รับชำระค่ารักษาและพิมพ์ใบเสร็จรับเงินอย่างเป็นทางการ',
            'System เปลี่ยนสถานะ Visit No. เป็น INACTIVE (ปิดวงจร Visit ของรอบการรักษานี้)',
            'ส่งสัญญาณแจ้งห้อง Pharmacy ให้ส่งมอบยากลับบ้านได้ทันที'
          ]
        }
      },
      {
        id: 9,
        title: '9. จ่ายยา & กลับบ้าน (Pharmacy & Exit)',
        titleEn: 'Pharmacy Medication Handover & Hospital Exit',
        subtitle: 'รับยาพร้อมคำแนะนำการใช้ยา และเดินทางกลับ',
        actor: 'Pet & Owner / Pharmacist',
        actorType: 'owner',
        target: 'Pharmacy > Exit',
        module: 'PHARMACY DISPENSE / EXIT',
        output: 'จ่ายยา',
        action: 'เจ้าของสัตว์รับยากลับบ้านที่ Pharmacy เภสัชกรอธิบายวิธีใช้ยา และเดินออกทาง Exit',
        refCode: 'EXIT-COMPLETE',
        time: '0.125s',
        fromNode: 'pharmacy',
        toNode: 'exit',
        laneId: 'owner:pharmacy>exit',
        activeLanes: ['owner:cashier>pharmacy', 'card:rxRoom>pharmacy', 'owner:pharmacy>exit'],
        badgeColor: 'owner',
        petOwner: {
          fromNode: 'pharmacy',
          toNode: 'exit',
          statusLabel: 'รับยากลับบ้านที่ Pharmacy และเดินทางออกทาง Exit'
        },
        packets: [
          {
            id: 'pkt-step9-owner',
            stream: 'owner',
            tone: 'owner',
            laneId: 'owner:pharmacy>exit',
            fromNode: 'pharmacy',
            toNode: 'exit',
            tag: 'PET & OWNER',
            title: 'Meds Received -> Exit',
            fields: [
              { k: 'PHARMACY', v: 'Counseling Done' },
              { k: 'VISIT', v: 'Completed' }
            ]
          }
        ],
        stationNotes: [
          {
            id: 'note-step9-pharm',
            nodeId: 'pharmacy',
            tone: 'staff',
            roleLabel: 'STAFF (PHARM)',
            title: 'Dispense Meds',
            detail: 'ส่งมอบยา + แนะนำวิธีใช้',
            offsetX: -25,
            offsetY: -68
          },
          {
            id: 'note-step9-exit',
            nodeId: 'exit',
            tone: 'owner',
            roleLabel: 'PET & OWNER',
            title: 'Completed',
            detail: 'รับยากลับบ้าน (Exit)',
            offsetX: 25,
            offsetY: -68
          }
        ],
        characterImage: '/images/blueprint/pharmacy.png',
        characterTitle: 'เภสัชกรส่งมอบยาที่ห้อง Pharmacy ก่อนที่เจ้าของและสัตว์เลี้ยงจะเดินทางออกทาง Exit',
        uiPromptLabel: 'ดูหน้าจอสรุปรายการสั่งยาและฉากส่งมอบยา (Pharmacy UI & Scene)',
        uiWireframes: [
          {
            id: 'order-final-dispense',
            title: 'Dispensed Medication Summary',
            image: '/images/blueprint/order.jpg',
            tag: 'DISPENSED UI',
            badgeLabel: 'Completed Handover'
          }
        ],
        explanation: {
          title: 'การรับยากลับบ้านที่ Pharmacy และเดินทางออกทาง Exit',
          role: 'เภสัชกร/เจ้าหน้าที่จ่ายยา (Pharmacy Staff) และ Pet & Owner',
          location: 'Cashier -> Pharmacy -> Exit',
          systemUsed: 'KAHIS Pharmacy Handover & Follow-up Appointment',
          clinicalNote:
            'หลังจากชำระเงินและระบบ Discharge Case แล้ว เจ้าของจะพาสัตว์เลี้ยงจาก Cashier มารับยาที่เตรียมไว้แล้วจาก Rx Room ณ ช่องจ่ายยา Pharmacy เภสัชกรตรวจสอบความถูกต้อง แนะนำวิธีการให้ยา และเจ้าของพาสัตว์เลี้ยงเดินออกทาง Exit เป็นอันจบกระบวนการ',
          keyPoints: [
            'ตระกร้ายาที่จัดจาก Rx Room ถูกส่งมารอพร้อมจ่ายที่ Pharmacy',
            'เภสัชกรตรวจสอบใบเสร็จ ยืนยันตัวตนสัตว์ และอธิบายวิธีใช้ยา',
            'Pet & Owner เดินทางออกทาง Exit (สถานะ Visit No. เป็น Inactive สมบูรณ์)'
          ]
        }
      }
    ]
  },
  {
    id: 'er-service-journey',
    title: 'ER Patient Service Journey',
    titleEn: 'Emergency & Critical Care Workflow',
    subtitle: 'กระบวนการรับสัตว์ป่วยฉุกเฉินและวิกฤต (เตรียมเพิ่ม Flow ในระยะถัดไป)',
    group: 'clinical',
    status: 'coming-soon',
    totalSteps: 0,
    overviewDesc:
      'โครงสร้างรองรับเวิร์กโฟลว์แผนกฉุกเฉินและวิกฤต (ER) แสดงการคัดกรองด่วนพิเศษ (Fast-Track Triage), สัญญาณแจ้งเตือน Alarm และการส่งต่อห้องผ่าตัด (Surgery) หรือ ICU โดยยังไม่ได้กำหนดลำดับขั้นตอนในขณะนี้',
    facts: [
      { label: 'DEPARTMENT', value: 'ER (Emergency & Critical Care)' },
      { label: 'TOTAL STEPS', value: '0 Steps (Empty Placeholder)' },
      { label: 'STATUS', value: 'Ready for Flow Definition' }
    ],
    steps: []
  }
];
