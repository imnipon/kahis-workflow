export type WorkflowGroup = 'all' | 'clinical' | 'exam-card' | 'orders';

export interface UIWireframeItem {
  id: string;
  title: string;
  image: string;
  tag: string;
  badgeLabel?: string;
}

export interface WorkflowStep {
  id: number;
  title: string;
  titleEn: string;
  subtitle: string;
  actor: string;
  actorType: 'owner' | 'staff' | 'dvm' | 'system';
  target: string;
  module: string;
  action: string;
  refCode: string;
  time: string;
  fromNode: string;
  toNode: string;
  laneId: string;
  badgeColor: 'blue' | 'amber' | 'green' | 'violet';
  characterImage?: string;
  characterTitle?: string;
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
  x: number;
  y: number;
  type: 'entrance' | 'counter' | 'waiting' | 'room' | 'pharmacy';
}

export interface StationLane {
  id: string;
  from: string;
  to: string;
  d: string;
  marker?: string;
}

// 5 สถานีหลักในโรงพยาบาลสัตว์ (Isometric Grid Coordinates)
export const STATIONS: Record<string, StationNode> = {
  entrance: {
    id: 'entrance',
    label: 'ENTRANCE',
    labelTh: 'ทางเข้า / จุดคัดกรอง',
    code: 'GATE-01',
    x: 130,
    y: 410,
    type: 'entrance'
  },
  registration: {
    id: 'registration',
    label: 'REGISTRATION',
    labelTh: 'จุดลงทะเบียน / เวชระเบียน',
    code: 'DESK-REG',
    x: 320,
    y: 330,
    type: 'counter'
  },
  waitingHall: {
    id: 'waitingHall',
    label: 'WAITING HALL',
    labelTh: 'โถงรอตรวจผู้ป่วยนอก',
    code: 'AREA-WAIT',
    x: 510,
    y: 410,
    type: 'waiting'
  },
  examRoom: {
    id: 'examRoom',
    label: 'EXAM ROOM 10',
    labelTh: 'ห้องตรวจสัตวแพทย์ 10',
    code: 'ROOM-10',
    x: 690,
    y: 260,
    type: 'room'
  },
  pharmacyCashier: {
    id: 'pharmacyCashier',
    label: 'PHARMACY & CASHIER',
    labelTh: 'ห้องการเงินและจ่ายยานำกลับ',
    code: 'DISP-FIN',
    x: 820,
    y: 410,
    type: 'pharmacy'
  }
};

// เส้นทางประ (Lanes) ระหว่างสถานี
export const STATION_LANES: StationLane[] = [
  {
    id: 'entrance>registration',
    from: 'entrance',
    to: 'registration',
    d: 'M 160 395 L 290 345'
  },
  {
    id: 'registration>waitingHall',
    from: 'registration',
    to: 'waitingHall',
    d: 'M 350 345 L 480 395'
  },
  {
    id: 'waitingHall>examRoom',
    from: 'waitingHall',
    to: 'examRoom',
    d: 'M 535 385 L 665 285'
  },
  {
    id: 'examRoom>pharmacyCashier',
    from: 'examRoom',
    to: 'pharmacyCashier',
    d: 'M 715 285 L 795 385'
  },
  {
    id: 'waitingHall>pharmacyCashier',
    from: 'waitingHall',
    to: 'pharmacyCashier',
    d: 'M 545 410 L 785 410'
  }
];

// รายการ Workflows ทั้งหมด (โดยมี Workflow ที่ 1 พร้อมใช้งานสมบูรณ์)
export const WORKFLOWS: WorkflowItem[] = [
  {
    id: 'service-journey',
    title: 'PATIENT SERVICE JOURNEY',
    titleEn: 'Outpatient Care & EMR Flow',
    subtitle: 'กระบวนการเข้ารับบริการตรวจรักษา 9 ขั้นตอน',
    group: 'clinical',
    status: 'active',
    totalSteps: 9,
    overviewDesc:
      'ภาพรวมวงจรกระบวนการให้บริการตรวจรักษาสัตว์ป่วยนอก (OPD Clinical Journey) ตั้งแต่ก้าวแรกที่เจ้าของสัตว์เดินทางมาถึงโรงพยาบาลสัตว์ การค้นประวัติ/ออกคิว การเข้าห้องตรวจโดยสัตวแพทย์ การบันทึก EMR ผ่านระบบ Exam Card ใหม่ และการสั่งยาพร้อมชำระค่าบริการ',
    facts: [
      { label: 'WORKFLOW', value: 'OPD Service Journey' },
      { label: 'TOTAL STEPS', value: '9 Progressive Steps' },
      { label: 'EMR MODULES', value: 'Search, Check-in, Exam Card, VPE, Assessment, Plan, Order' },
      { label: 'INTEGRATION', value: 'KAHIS Vetroom ↔ Ward CCU' },
      { label: 'ACTORS', value: 'Owner, Receptionist, DVM, Pharmacist, Cashier' }
    ],
    steps: [
      {
        id: 1,
        title: '1. เจ้าของสัตว์พาสัตว์มา',
        titleEn: 'Patient & Owner Arrival',
        subtitle: 'มาถึงโรงพยาบาล เข้าสู่จุดคัดกรองเบื้องต้น',
        actor: 'เจ้าของสัตว์ (Owner)',
        actorType: 'owner',
        target: 'จุดคัดกรอง (Entrance)',
        module: 'GATE-01 / ARRIVAL',
        action: 'พาสัตว์เลี้ยงมาถึงโรงพยาบาลสัตว์ มหาวิทยาลัยเกษตรศาสตร์',
        refCode: 'ARRIV-001',
        time: '0.000s',
        fromNode: 'entrance',
        toNode: 'registration',
        laneId: 'entrance>registration',
        badgeColor: 'blue',
        characterImage: '/images/blueprint/pet.png',
        characterTitle: 'เจ้าของสัตว์อุ้มสุนัขพุดเดิ้ล (HN 65008888)',
        uiWireframes: [],
        explanation: {
          title: 'การเดินทางมาถึงและคัดกรองผู้ป่วย',
          role: 'เจ้าของสัตว์เลี้ยง (Pet Owner) & เจ้าหน้าที่คัดกรอง',
          location: 'บริเวณประตูทางเข้าหลักโรงพยาบาลสัตว์',
          systemUsed: 'ระบบคัดกรองเบื้องต้น (Triage & Walk-in)',
          clinicalNote:
            'เจ้าของพาสัตว์เลี้ยง (เช่น สุนัขพันธุ์ Poodle อายุ 5 ปี) เดินทางมาถึงโรงพยาบาล เข้าสู่จุดต้อนรับเพื่อเตรียมติดต่อทำประวัติหรือค้นหาประวัติเดิม',
          keyPoints: [
            'เตรียมข้อมูลสัตว์เลี้ยง: ชื่อสัตว์, หมายเลขประจำตัวเจ้าของ, บัตรประชาชน',
            'ประเมินความเร่งด่วน: หากมีภาวะวิกฤตจะส่งต่อหน่วยฉุกเฉิน (Emergency) ทันที',
            'เคสทั่วไปเดินต่อไปยังจุดเวชระเบียนเพื่อค้นประวัติ'
          ]
        }
      },
      {
        id: 2,
        title: '2. ติดต่อเจ้าหน้าที่จุดลงทะเบียน',
        titleEn: 'Registration & HN Search',
        subtitle: 'ค้นหาประวัติสัตว์เดิม หรือสร้างประวัติใหม่ในระบบ',
        actor: 'เจ้าหน้าที่เวชระเบียน (Staff)',
        actorType: 'staff',
        target: 'ระบบค้นหาผู้ป่วย (Search HN)',
        module: 'KAHIS SEARCH HN',
        action: 'ค้นหา HN ด้วยชื่อสัตว์, เจ้าของ หรือเบอร์โทรศัพท์',
        refCode: 'SEARCH-65008888',
        time: '0.015s',
        fromNode: 'entrance',
        toNode: 'registration',
        laneId: 'entrance>registration',
        badgeColor: 'amber',
        characterImage: '/images/blueprint/registration.png',
        characterTitle: 'เจ้าหน้าที่เคาน์เตอร์เวชระเบียน',
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
          title: 'ค้นหาเวชระเบียนเดิมในระบบ KAHIS',
          role: 'เจ้าหน้าที่เวชระเบียน (Registration Officer)',
          location: 'เคาน์เตอร์เวชระเบียน (Registration Desk)',
          systemUsed: 'หน้าต่าง Search HN บนระบบ KAHIS',
          clinicalNote:
            'เจ้าหน้าที่ตรวจสอบประวัติเดิมผ่านช่องค้นหา 5 มิติ (HN, ชื่อสัตว์, ชื่อ-สกุลเจ้าของ, รหัสประจำตัว) หากพบประวัติเดิมจะกดปุ่ม [Enter] เพื่อเข้าสู่กระบวนการ Check-in',
          keyPoints: [
            'ช่องค้นหา HN, Pet Name, Owner Name & Surname',
            'แถบแสดงผลลัพธ์ Search Result พร้อมระบุเพศ อายุ สายพันธุ์',
            'ระบบเชื่อมต่อตรงกับฐานข้อมูลส่วนกลางของโรงพยาบาล'
          ]
        }
      },
      {
        id: 3,
        title: '3. เจ้าหน้าที่กรอกข้อมูล Check-in',
        titleEn: 'Check-in & Queue Issuance',
        subtitle: 'บันทึกอาการเบื้องต้น ชั่งน้ำหนัก และออกหมายเลขคิว',
        actor: 'เจ้าหน้าที่เวชระเบียน (Staff)',
        actorType: 'staff',
        target: 'ระบบคิว (Queue Management)',
        module: 'KAHIS CHECK-IN MODAL',
        action: 'ลงทะเบียนเข้าตรวจ เลือกกลุ่มอายุรกรรม (MA) และพิมพ์บัตรคิว',
        refCode: 'QUEUE-WA001',
        time: '0.030s',
        fromNode: 'registration',
        toNode: 'waitingHall',
        laneId: 'registration>waitingHall',
        badgeColor: 'amber',
        characterImage: '/images/blueprint/registration.png',
        characterTitle: 'เจ้าหน้าที่บันทึก Check-in',
        uiWireframes: [
          {
            id: 'checkin-ui',
            title: 'Check-in Modal Wireframe',
            image: '/images/blueprint/checkin.jpg',
            tag: 'CHECK-IN UI',
            badgeLabel: 'Registration & Complaints'
          }
        ],
        explanation: {
          title: 'ลงทะเบียนเข้ารับบริการและบันทึกอาการสำคัญ',
          role: 'เจ้าหน้าที่เวชระเบียน (Registration Staff)',
          location: 'เคาน์เตอร์เวชระเบียน (Registration Desk)',
          systemUsed: 'หน้าต่าง Check-in (ลงทะเบียนเข้ารับบริการ)',
          clinicalNote:
            'บันทึกข้อมูล 3 แผงหลัก: ข้อมูลการลงทะเบียน (กลุ่มอายุรกรรม MA, ชั่งน้ำหนักสัตว์ 0.89 กก.), ตรวจเช็กอาการสำคัญ (Client Complaint เช่น ซึม เบื่ออาหาร อาเจียน) และระบุโรงพยาบาลที่ส่งต่อ',
          keyPoints: [
            'กำหนดประเภทการลงทะเบียน: A : อายุรกรรมทั่วไป (MA)',
            'บันทึกน้ำหนักตัวล่าสุด (Weight kg) และโลเคชั่นรอตรวจ (WA001)',
            'ออกหมายเลขคิวเพื่อให้เจ้าของพาสัตว์ไปนั่งรอหน้าหน่วย'
          ]
        }
      },
      {
        id: 4,
        title: '4. เจ้าของสัตว์พาสัตว์ไปรอที่จุดรอตรวจ',
        titleEn: 'Proceed to Waiting Area',
        subtitle: 'รอเรียกคิวบริเวณโถงพักคอยประจำหน่วยตรวจ',
        actor: 'เจ้าของสัตว์ (Owner)',
        actorType: 'owner',
        target: 'โถงพักคอย (Waiting Area)',
        module: 'WAITING HALL / QUEUE DISP',
        action: 'เจ้าของพาสัตว์เลี้ยงนั่งรอเรียกคิวหน้าห้องตรวจอายุรกรรม',
        refCode: 'WAIT-WA001',
        time: '0.045s',
        fromNode: 'registration',
        toNode: 'waitingHall',
        laneId: 'registration>waitingHall',
        badgeColor: 'blue',
        characterImage: '/images/blueprint/pet.png',
        characterTitle: 'เจ้าของอุ้มสุนัขรอบริเวณโถง',
        uiWireframes: [],
        explanation: {
          title: 'พักคอยและสังเกตอาการบริเวณโถงหน่วยตรวจ',
          role: 'เจ้าของสัตว์เลี้ยง (Pet Owner) & สัตว์ป่วย',
          location: 'โถงพักคอยหน่วยอายุรกรรม (Waiting Hall MA)',
          systemUsed: 'จอแสดงหมายเลขคิวประจำหน่วย (Digital Queue Display)',
          clinicalNote:
            'เจ้าของถือบัตรคิว WA001 นั่งรอเรียกตรวจ โดยจอภาพหน้าห้องตรวจจะแสดงลำดับคิวและสถานะการเรียกแบบเรียลไทม์',
          keyPoints: [
            'นั่งรอในพื้นที่ที่จัดสรรตามประเภทสัตว์เลี้ยง (สุนัข/แมว/สัตว์พิเศษ)',
            'สังเกตสัญญาณชีพเบื้องต้นขณะรอคอย (การหายใจ ระดับความรู้สึกตัว)',
            'เตรียมตัวเข้าห้องตรวจเมื่อหมายเลขคิวปรากฏบนหน้าจอ'
          ]
        }
      },
      {
        id: 5,
        title: '5. เรียกเข้าห้องตรวจ พบหมอ',
        titleEn: 'Queue Calling & Consultation',
        subtitle: 'ระบบเรียกคิวเข้าสู่ห้องตรวจสัตวแพทย์',
        actor: 'ระบบคิว & สัตวแพทย์ (DVM)',
        actorType: 'system',
        target: 'ห้องตรวจ 10 (Exam Room)',
        module: 'QUEUE CALL → ROOM 10',
        action: 'จอเรียกคิวประกาศ "คิว WA001 เชิญห้องตรวจ 10"',
        refCode: 'CALL-ROOM10',
        time: '0.060s',
        fromNode: 'waitingHall',
        toNode: 'examRoom',
        laneId: 'waitingHall>examRoom',
        badgeColor: 'green',
        characterImage: '/images/blueprint/examination-1.png',
        characterTitle: 'สัตวแพทย์ต้อนรับและนำสัตว์ขึ้นโต๊ะตรวจ',
        uiWireframes: [],
        explanation: {
          title: 'เข้าสู่ห้องตรวจเพื่อเริ่มกระบวนการรักษา',
          role: 'สัตวแพทย์ผู้ตรวจ (Attending Veterinarian) & ผู้ช่วย',
          location: 'ห้องตรวจสัตวแพทย์ 10 (Examination Room 10)',
          systemUsed: 'ระบบเรียกคิว KAHIS Queue & Vetroom Specimen',
          clinicalNote:
            'สัตวแพทย์เรียกเคสเข้าห้องตรวจ ต้อนรับเจ้าของสัตว์และนำสุนัขขึ้นบนโต๊ะตรวจร่างกาย เพื่อซักประวัติอย่างละเอียด',
          keyPoints: [
            'ตรวจสอบยืนยันตัวตนสัตว์ป่วย: ชื่อสัตว์, เพศ, อายุ, HN',
            'ซักประวัติประธาน (Chief Complaint) และประวัติเดิม (History Taking)',
            'นำสัตว์ขึ้นโต๊ะตรวจร่างกาย (Examination Table) ในบรรยากาศผ่อนคลาย'
          ]
        }
      },
      {
        id: 6,
        title: '6. หมอตรวจและรักษา',
        titleEn: 'Physical Examination & VPE',
        subtitle: 'ตรวจร่างกายตามระบบ วัดสัญญาณชีพ และบันทึกผล',
        actor: 'สัตวแพทย์ (DVM)',
        actorType: 'dvm',
        target: 'โต๊ะตรวจร่างกาย (Exam Table)',
        module: 'PHYSICAL EXAM & VPE',
        action: 'ตรวจฟังเสียงหัวใจ/ปอด คลำช่องท้อง วัดสัญญาณชีพ และตรวจร่างกาย 20 ระบบ',
        refCode: 'PE-VPE-01',
        time: '0.075s',
        fromNode: 'examRoom',
        toNode: 'examRoom',
        laneId: 'waitingHall>examRoom',
        badgeColor: 'violet',
        characterImage: '/images/blueprint/examination-1.png',
        characterTitle: 'สัตวแพทย์ตรวจร่างกายสุนัขบนโต๊ะตรวจ',
        uiWireframes: [
          {
            id: 'vpe-form',
            title: 'Vital Sign & Physical Exam Form',
            image: '/images/blueprint/vpe.jpg',
            tag: 'VPE FORM UI',
            badgeLabel: 'Core Vital Signs'
          },
          {
            id: 'vpe-table',
            title: 'Patient Vital History Table',
            image: '/images/blueprint/vpe-table.jpg',
            tag: 'VPE TABLE UI',
            badgeLabel: 'Longitudinal Vitals'
          }
        ],
        explanation: {
          title: 'การตรวจร่างกายและการวัดสัญญาณชีพทางสัตวแพทย์',
          role: 'สัตวแพทย์ประจำห้องตรวจ (Clinician)',
          location: 'ห้องตรวจสัตวแพทย์ 10 บนโต๊ะตรวจร่างกาย',
          systemUsed: 'KAHIS VPE & Physical Examination Module',
          clinicalNote:
            'ตรวจร่างกายครบวงจร: สัญญาณชีพหลัก (Temp, HR, RR, Pulse, Weight), ประเมินการขาดน้ำ (Hydration), ตรวจฟังเสียงหัวใจ (Heart Sound), และตรวจสอบระบบร่างกาย 20 ระบบ',
          keyPoints: [
            'ตรวจวัดสัญญาณชีพหลัก Core Vital Signs (HR, RR, Temp, CRT)',
            'เปิดดูตารางเปรียบเทียบสัญญาณชีพย้อนหลัง (VPE Table 17 ครั้ง)',
            'บันทึกจุดสังเกตเฉพาะระบบ (Systematic Physical Examination)'
          ]
        }
      },
      {
        id: 7,
        title: '7. หมอลงข้อมูลการตรวจและสั่งยาใน EMR',
        titleEn: 'EMR Documentation & Orders',
        subtitle: 'บันทึก Exam Card 65:35, ลงผลวินิจฉัย และวางแผนการรักษา',
        actor: 'สัตวแพทย์ (DVM)',
        actorType: 'dvm',
        target: 'ระบบ KAHIS EMR',
        module: 'EXAM CARD / EMR CORE',
        action: 'บันทึก Exam Card, เลือก Diagnosis (SNOMED CT), สั่งแล็บและยาใน EMR',
        refCode: 'EMR-CARD-4331',
        time: '0.090s',
        fromNode: 'examRoom',
        toNode: 'examRoom',
        laneId: 'examRoom>pharmacyCashier',
        badgeColor: 'violet',
        characterImage: '/images/blueprint/dvm-comp.png',
        characterTitle: 'สัตวแพทย์กำลังบันทึกข้อมูลและสั่งงานในคอมพิวเตอร์',
        uiWireframes: [
          {
            id: 'examcard-editor',
            title: 'Subjective & Systematic Exam Card Editor',
            image: '/images/blueprint/examcard.jpg',
            tag: 'EXAM CARD EDITOR',
            badgeLabel: 'Core 65:35 Form'
          },
          {
            id: 'assessment-editor',
            title: 'Assessment & Problem Diagnosis Terms (PDT)',
            image: '/images/blueprint/assessment.jpg',
            tag: 'ASSESSMENT EDITOR',
            badgeLabel: 'Diagnostic Synthesis'
          },
          {
            id: 'assessment-concept',
            title: 'SNOMED CT Concept Search Modal',
            image: '/images/blueprint/assessment-concept.jpg',
            tag: 'CONCEPT SEARCH UI',
            badgeLabel: 'Standard Terminology'
          },
          {
            id: 'assessment-table',
            title: 'Assessment Longitudinal Table',
            image: '/images/blueprint/assessment-table.jpg',
            tag: 'ASSESSMENT TABLE UI',
            badgeLabel: 'Historical Diagnoses'
          },
          {
            id: 'plan-editor',
            title: 'Plan Editor (Hematology & Chemistry)',
            image: '/images/blueprint/plan.jpg',
            tag: 'PLAN EDITOR UI',
            badgeLabel: 'Clinical Orders'
          },
          {
            id: 'plan-table',
            title: 'All Patient Plans History Table',
            image: '/images/blueprint/plan-table.jpg',
            tag: 'PLAN TABLE UI',
            badgeLabel: 'Plan Tracking'
          },
          {
            id: 'order-tx',
            title: 'Quick Order Tx & Medication Cart',
            image: '/images/blueprint/order.jpg',
            tag: 'ORDER TX UI',
            badgeLabel: 'Medication Prescription'
          }
        ],
        explanation: {
          title: 'การบันทึกเวชระเบียนอิเล็กทรอนิกส์ครบวงจรใน EMR',
          role: 'สัตวแพทย์ผู้ทำการรักษา (Veterinarian)',
          location: 'โต๊ะทำงานสัตวแพทย์ หน้าจอคอมพิวเตอร์ KAHIS',
          systemUsed: 'Exam Card Manager 65:35, Assessment PDT, Plan & Order Tx',
          clinicalNote:
            'หัวใจสำคัญของระบบ: สัตวแพทย์กรอกฟอร์มตรวจร่างกาย 26 หัวข้อ, สังเคราะห์ปัญหา/การวินิจฉัยด้วยมาตรฐาน SNOMED CT, สร้างแผนการตรวจทางห้องปฏิบัติการ และสั่งจ่ายยานำกลับผ่านหน้าจอ Quick Order Tx',
          keyPoints: [
            'สัดส่วนใหม่ 65:35: ซ้ายกรอกฟอร์ม 26 ข้อ ขวาแสดง Live Detail Card ทันที',
            'ผูกรหัสการวินิจฉัยสากล SNOMED CT ผ่านหน้าต่างค้นหา Concept Search',
            'สั่งจ่ายยาผ่านตระกร้า Quick Order Tx ส่งคำสั่งตรงเข้าห้องยาทันที'
          ]
        }
      },
      {
        id: 8,
        title: '8. เจ้าหน้าที่รับคำสั่งและจัดยา',
        titleEn: 'Pharmacy Order Verification & Dispensing',
        subtitle: 'ห้องยาตรวจสอบคำสั่งแพทย์ จัดเตรียมยาและฉลากยา',
        actor: 'เภสัชกร / เจ้าหน้าที่ห้องยา (Staff)',
        actorType: 'staff',
        target: 'ห้องยานำกลับ (Pharmacy)',
        module: 'PHARMACY DISPENSARY',
        action: 'ดึงรายการใบสั่งยาจากระบบ ตรวจสอบความถูกต้อง และจัดเตรียมยาพร้อมฉลาก',
        refCode: 'RX-DISP-4350',
        time: '0.105s',
        fromNode: 'examRoom',
        toNode: 'pharmacyCashier',
        laneId: 'examRoom>pharmacyCashier',
        badgeColor: 'amber',
        characterImage: '/images/blueprint/pharmacy.png',
        characterTitle: 'เจ้าหน้าที่ห้องยากำลังตรวจสอบและจัดยา',
        uiWireframes: [
          {
            id: 'order-dispense',
            title: 'Prescribed Order & Medication Cart',
            image: '/images/blueprint/order.jpg',
            tag: 'ORDER TX UI',
            badgeLabel: 'Dispensing Queue'
          }
        ],
        explanation: {
          title: 'การประมวลผลคำสั่งยาและการจัดเตรียมเวชภัณฑ์',
          role: 'เภสัชกรและเจ้าหน้าที่ห้องยา (Pharmacist & Dispensary Technician)',
          location: 'ห้องยาและเวชภัณฑ์ผู้ป่วยนอก (Outpatient Pharmacy)',
          systemUsed: 'ระบบบริหารงานห้องยา KAHIS Rx Center',
          clinicalNote:
            'คำสั่งยาที่สัตวแพทย์ส่งจาก Quick Order Tx จะปรากฏใน Worklist ของห้องยาทันที เจ้าหน้าที่ตรวจสอบขนาดการใช้ยา (Dose, Route, Frequency) จัดยาใส่ซอง และพิมพ์ฉลากคำแนะนำการใช้ยา',
          keyPoints: [
            'คำสั่งยาเชื่อมต่อแบบ Real-time จากห้องตรวจสู่ห้องยา',
            'ระบบตรวจสอบ Double-check ขนาดยาและประวัติการแพ้ยา',
            'เตรียมยาพร้อมส่งมอบเมื่อเจ้าของชำระค่าบริการเรียบร้อย'
          ]
        }
      },
      {
        id: 9,
        title: '9. เจ้าของสัตว์ไปชำระค่าใช้จ่ายและรับยา',
        titleEn: 'Payment, Receipt & Medication Pickup',
        subtitle: 'ชำระค่ารักษา พิมพ์ใบเสร็จ และรับมอบยานำกลับบ้าน',
        actor: 'เจ้าหน้าที่การเงิน & เจ้าของสัตว์ (Cashier & Owner)',
        actorType: 'owner',
        target: 'เคาน์เตอร์การเงินและจ่ายยา (Cashier & Exit)',
        module: 'CASHIER / RECEIPT PRINT',
        action: 'ชำระเงิน รับใบเสร็จรับเงิน และรับยาพร้อมคำแนะนำการป้อนยา',
        refCode: 'PAID-RECEIPT-OK',
        time: '0.120s',
        fromNode: 'pharmacyCashier',
        toNode: 'entrance',
        laneId: 'waitingHall>pharmacyCashier',
        badgeColor: 'green',
        characterImage: '/images/blueprint/cashier.png',
        characterTitle: 'เจ้าหน้าที่การเงินพิมพ์ใบเสร็จและส่งมอบเอกสาร',
        uiWireframes: [],
        explanation: {
          title: 'การชำระเงิน การส่งมอบยา และเสร็จสิ้นกระบวนการรักษา',
          role: 'เจ้าหน้าที่การเงิน (Cashier), เภสัชกร และเจ้าของสัตว์',
          location: 'เคาน์เตอร์การเงินและช่องจ่ายยา (Finance Counter)',
          systemUsed: 'ระบบการเงิน KAHIS Cashier & Receipt Generator',
          clinicalNote:
            'เจ้าของสัตว์ชำระค่ารักษาพยาบาล เจ้าหน้าที่พิมพ์ใบเสร็จรับเงินอย่างเป็นทางการ จากนั้นเจ้าของยื่นใบเสร็จที่ช่องจ่ายยาเพื่อรับยานำกลับบ้านพร้อมคำแนะนำการป้อนยาจากเภสัชกร เป็นอันเสร็จสิ้นกระบวนการ OPD',
          keyPoints: [
            'ออกใบเสร็จรับเงินค่ารักษาพยาบาล (Official Receipt)',
            'ส่งมอบยาและอธิบายวิธีการให้ยา/ข้อควรระวังแก่เจ้าของสัตว์',
            'บันทึกสถานะเคสเป็น "Completed" เสร็จสิ้นการให้บริการ'
          ]
        }
      }
    ]
  },
  {
    id: 'examcard-deepdive',
    title: 'EXAM CARD 65:35 DEEP DIVE',
    titleEn: 'Clinical Documentation Architecture',
    subtitle: 'เจาะลึกการใช้งานแบบฟอร์มตรวจร่างกาย 26 หัวข้อ (Coming Soon)',
    group: 'exam-card',
    status: 'coming-soon',
    totalSteps: 6,
    overviewDesc: 'คู่มือเจาะลึกเฉพาะโมดูล Exam Card ดีไซน์ใหม่ 65:35, แผง Objective 4 คอลัมน์อิสระ และการพิมพ์ Standalone Snapshot',
    facts: [
      { label: 'MODULE', value: 'Exam Card Manager 65:35' },
      { label: 'TOPICS', value: '26 Systematic Exam Topics' },
      { label: 'STATUS', value: 'Preparing in Next Phase' }
    ],
    steps: []
  }
];
