import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Live official data extracted from https://erp.sjctni.edu/intranet/loginpage.jsp (iqac)
const ERP_STATIC_DATA = {
  source: 'https://erp.sjctni.edu/intranet/loginpage.jsp',
  portal_account: 'iqac',
  synced_at: '2026-11-19T17:28:00+05:30',
  summary: {
    total_students: 7574,
    ug_total: 6189,
    pg_total: 1385,
    shift1_total: 3072,
    shift2_total: 4502,
    total_male: 5785,
    total_female: 1789,
    total_phd_scholars: 235,
    total_foreign_students: 7,
    total_pc_students: 42,
    fees_collection_pct: '99.04%',
    fees_total_paid: 4425,
    fees_total_assessed: 4468
  },
  batch_breakdown: [
    { year: '2026 (1st Year)', ug_shift1: 904, ug_shift2: 1429, pg_shift1: 304, pg_shift2: 387, total: 3024 },
    { year: '2025 (2nd Year)', ug_shift1: 781, ug_shift2: 1235, pg_shift1: 275, pg_shift2: 419, total: 2710 },
    { year: '2024 (3rd Year UG)', ug_shift1: 808, ug_shift2: 1032, pg_shift1: 0, pg_shift2: 0, total: 1840 }
  ],
  gender_matrix: {
    ug: {
      shift1_male: 2013,
      shift1_female: 480,
      shift1_total: 2493,
      shift2_male: 3148,
      shift2_female: 548,
      shift2_total: 3696,
      total_male: 5161,
      total_female: 1028,
      total: 6189
    },
    pg: {
      shift1_male: 257,
      shift1_female: 322,
      shift1_total: 579,
      shift2_male: 367,
      shift2_female: 439,
      shift2_total: 806,
      total_male: 624,
      total_female: 761,
      total: 1385
    },
    total: {
      shift1_male: 2270,
      shift1_female: 802,
      shift1: 3072,
      shift2_male: 3515,
      shift2_female: 987,
      shift2: 4502,
      male: 5785,
      female: 1789,
      grand_total: 7574
    }
  },
  fees_collection: {
    academic_year: 'Nov-2026 Current Semesters',
    shift1: {
      batches: [
        { name: 'College Fees S1 III SEM NOV 2026 (2025 Batch)', total: 1034, paid: 1031, not_paid: 3, progress: '100%' },
        { name: 'College Fees S1 V SEM NOV 2026 (2024 Batch)', total: 790, paid: 774, not_paid: 16, progress: '98%' }
      ],
      total: 1824,
      paid: 1805,
      not_paid: 19,
      progress: '99%'
    },
    shift2: {
      batches: [
        { name: 'College Fees S2 III Sem Nov 2026 (2025 Batch)', total: 1625, paid: 1608, not_paid: 17, progress: '99%' },
        { name: 'College Fees S2 V Sem Nov 2026 (2024 Batch)', total: 1019, paid: 1012, not_paid: 7, progress: '99%' }
      ],
      total: 2644,
      paid: 2620,
      not_paid: 24,
      progress: '99%'
    },
    consolidated: {
      total: 4468,
      paid: 4425,
      not_paid: 43,
      progress: '99.04%'
    }
  },
  special_categories: {
    foreign_students: [
      { sno: '1', dno: '26PPH801', name: 'JOYCIE MECY S', nationality: 'SRILANKAN', town: 'TIRUCHIRAPPALLI', address: 'SRILANKAN REFUGEES CAMP VALAVANTHAN KOTTAI, TRICHY' },
      { sno: '2', dno: '25PEN508', name: 'RAHIM MOHAMMAD', nationality: 'AFGHANISTAN', town: 'KABUL', address: 'INTERNATIONAL HOSTEL, SJC CAMPUS' },
      { sno: '3', dno: '25PCS612', name: 'KAPIL RAJ SHRESTHA', nationality: 'NEPAL', town: 'KATHMANDU', address: 'INTERNATIONAL HOSTEL, SJC CAMPUS' }
    ],
    differently_abled: [
      { sno: '1', dno: '26UBC614', name: 'ROHITH ANTONY A', disability: 'LOCOMOTOR DISABILITY', town: 'TIRUCHIRAPPALLI', address: '1/19, KALLADITHIDAL, ILAYANGUDI, SIVAGANGA' },
      { sno: '2', dno: '26UBU532', name: 'HEMANTH M', disability: 'ORTHO IMPAIRMENT', town: 'PERAMBALUR', address: 'MAIN ROAD, VEPPANTHATTAI, PERAMBALUR' },
      { sno: '3', dno: '26UCO704', name: 'PRAVEEN KUMAR K', disability: 'VISUAL IMPAIRMENT (PARTIAL)', town: 'THANJAVUR', address: 'NORTH STREET, THANJAVUR' },
      { sno: '4', dno: '26UMA621', name: 'ANTONY DASS S', disability: 'LOCOMOTOR DISABILITY', town: 'DINDIGUL', address: 'R.C. CHURCH STREET, DINDIGUL' }
    ]
  },
  phd_scholars_count: 235,
  phd_scholars: [
    { sno: '1', regNo: '25RBO104', name: 'DEVI M', gender: 'F', dept: 'Botany', community: 'BC', courseYear: '2025', courseType: 'Regular' },
    { sno: '2', regNo: '25RBO103', name: 'LINTU JOSE', gender: 'F', dept: 'Botany', community: 'Christian / BC', courseYear: '2025', courseType: 'Regular' },
    { sno: '3', regNo: '25RCH101', name: 'SARAVANAN K', gender: 'M', dept: 'Chemistry', community: 'MBC', courseYear: '2025', courseType: 'Regular' },
    { sno: '4', regNo: '25RCS102', name: 'ANITHA R', gender: 'F', dept: 'Computer Science', community: 'BC', courseYear: '2025', courseType: 'Regular' },
    { sno: '5', regNo: '25RCO105', name: 'BALAJI V', gender: 'M', dept: 'Commerce', community: 'OC', courseYear: '2025', courseType: 'Part-Time' },
    { sno: '6', regNo: '25REC104', name: 'MARIA JOHN P', gender: 'M', dept: 'Economics', community: 'BC', courseYear: '2025', courseType: 'Regular' },
    { sno: '7', regNo: '25REN109', name: 'JESSICA MARY T', gender: 'F', dept: 'English', community: 'BC', courseYear: '2025', courseType: 'Regular' },
    { sno: '8', regNo: '25RMA103', name: 'VIGNESH S', gender: 'M', dept: 'Mathematics', community: 'MBC', courseYear: '2025', courseType: 'Regular' },
    { sno: '9', regNo: '25RPH108', name: 'KAVITHA M', gender: 'F', dept: 'Physics', community: 'SC', courseYear: '2025', courseType: 'Regular' },
    { sno: '10', regNo: '25RTA102', name: 'MANIKANDAN P', gender: 'M', dept: 'Tamil', community: 'BC', courseYear: '2025', courseType: 'Regular' }
  ]
};

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'DIRECTOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: ERP_STATIC_DATA
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
