import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://e-childschoolinfo.moe.go.kr/api/notice';
const API_KEY = process.env.KINDERGARTEN_API_KEY!;

interface ApiResponse {
  status: string;
  kinderInfo?: Record<string, any>[];
}

async function fetchEndpoint(
  endpoint: string,
  sidoCode: string,
  sggCode: string
): Promise<Record<string, any>[]> {
  const url = `${API_BASE}/${endpoint}?key=${API_KEY}&sidoCode=${sidoCode}&sggCode=${sggCode}`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data: ApiResponse = await res.json();
    if (data.status === 'SUCCESS' && Array.isArray(data.kinderInfo)) {
      return data.kinderInfo;
    }
    return [];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sidoCode = searchParams.get('sidoCode');
  const sggCode = searchParams.get('sggCode');

  if (!sidoCode || !sggCode) {
    return NextResponse.json(
      { error: 'sidoCode and sggCode are required' },
      { status: 400 }
    );
  }

  const [basicList, busList, mealList, teacherList, afterSchoolList] =
    await Promise.all([
      fetchEndpoint('basicInfo2.do', sidoCode, sggCode),
      fetchEndpoint('schoolBus.do', sidoCode, sggCode),
      fetchEndpoint('schoolMeal.do', sidoCode, sggCode),
      fetchEndpoint('teachersInfo.do', sidoCode, sggCode),
      fetchEndpoint('afterSchoolPresent.do', sidoCode, sggCode),
    ]);

  // Index supplementary data by kindercode
  const busMap = new Map(busList.map((b) => [b.kindercode, b]));
  const mealMap = new Map(mealList.map((m) => [m.kindercode, m]));
  const teacherMap = new Map(teacherList.map((t) => [t.kindercode, t]));
  const afterSchoolMap = new Map(afterSchoolList.map((a) => [a.kindercode, a]));

  const merged = basicList
    .filter((k) => k.lttdcdnt && k.lngtcdnt) // must have coordinates
    .map((basic) => {
      const code = basic.kindercode;
      const bus = busMap.get(code) || {};
      const meal = mealMap.get(code) || {};
      const teacher = teacherMap.get(code) || {};
      const afterSchool = afterSchoolMap.get(code) || {};

      const ppcnt3 = Number(basic.ppcnt3) || 0;
      const ppcnt4 = Number(basic.ppcnt4) || 0;
      const ppcnt5 = Number(basic.ppcnt5) || 0;
      const mixppcnt = Number(basic.mixppcnt) || 0;
      const shppcnt = Number(basic.shppcnt) || 0;
      const totalStudents = ppcnt3 + ppcnt4 + ppcnt5 + mixppcnt + shppcnt;
      const capacity = Number(basic.prmstfcnt) || 0;

      const drcnt = Number(teacher.drcnt) || 0;
      const adcnt = Number(teacher.adcnt) || 0;
      const gnrl_thcnt = Number(teacher.gnrl_thcnt) || 0;
      const spcn_thcnt = Number(teacher.spcn_thcnt) || 0;
      const etc_emp_cnt = Number(teacher.etc_emp_cnt) || 0;
      const totalTeachers = drcnt + adcnt + gnrl_thcnt + spcn_thcnt;
      const totalStaff = totalTeachers + etc_emp_cnt;

      return {
        kindercode: code,
        name: basic.kindername,
        establish: basic.establish,
        addr: basic.addr,
        telno: basic.telno,
        hpaddr: basic.hpaddr,
        opertime: basic.opertime,
        lat: Number(basic.lttdcdnt),
        lng: Number(basic.lngtcdnt),
        edate: basic.edate,
        rppnname: basic.rppnname,
        rpst_yn: basic.rpst_yn,

        // Class counts
        clcnt3: Number(basic.clcnt3) || 0,
        clcnt4: Number(basic.clcnt4) || 0,
        clcnt5: Number(basic.clcnt5) || 0,
        mixclcnt: Number(basic.mixclcnt) || 0,
        shclcnt: Number(basic.shclcnt) || 0,

        // Student counts
        ppcnt3,
        ppcnt4,
        ppcnt5,
        mixppcnt,
        shppcnt,
        totalStudents,

        // Capacity
        ag3fpcnt: Number(basic.ag3fpcnt) || 0,
        ag4fpcnt: Number(basic.ag4fpcnt) || 0,
        ag5fpcnt: Number(basic.ag5fpcnt) || 0,
        capacity,
        availableSeats: Math.max(0, capacity - totalStudents),

        // Bus
        hasBus: bus.vhcl_oprn_yn === 'Y',
        busCount: Number(bus.opra_vhcnt) || 0,

        // Meal
        mealType: meal.mlsr_oprn_way_tp_cd || '',
        mealCount: Number(meal.al_kpcnt) || 0,
        hasNutritionist: meal.ntrt_tchr_agmt_yn === 'Y',

        // Teachers
        drcnt,
        adcnt,
        gnrl_thcnt,
        spcn_thcnt,
        etc_emp_cnt,
        totalTeachers,
        totalStaff,
        teacherStudentRatio:
          totalTeachers > 0
            ? Math.round((totalStudents / totalTeachers) * 10) / 10
            : 0,

        // After school
        hasAfterSchool: (Number(afterSchool.pm_rrgn_clcnt) || 0) > 0,
        afterSchoolClasses: Number(afterSchool.pm_rrgn_clcnt) || 0,
        afterSchoolTime: afterSchool.oper_time || '',
        afterSchoolStudents: Number(afterSchool.pm_rrgn_ptcn_kpcnt) || 0,
      };
    });

  return NextResponse.json({ data: merged, count: merged.length });
}
