import {
  CriterionInfo,
  JudgeCriteriaMap,
  JudgeId,
  JudgeInfo,
  PerformanceItem,
  ScoringConfig,
} from '../types/scoring';

export const SCHOOL_NAME = 'Liên đội Trường THCS Lê Hữu Lập';
export const EVENT_TITLE =
  'Hội thi Văn nghệ Chào mừng kỷ niệm 44 năm Ngày Nhà giáo Việt Nam';
export const EVENT_DATE_RANGE = '20/11/1982 – 20/11/2026';
export const EVENT_LOCATION_DATE = 'Hậu Lộc, ngày 16 tháng 11 năm 2026';
export const SECRETARY_NAME = 'Nguyễn Thu Phương';

export const CRITERIA: CriterionInfo[] = [
  {
    id: 'chu_de',
    stt: 1,
    name: 'Chủ đề',
    shortName: 'Chủ đề',
    description:
      'Ca ngợi về Đảng, Bác Hồ, quê hương đất nước, tình bạn bè, thầy cô và mái trường (Chủ đề ca ngợi thầy cô +3đ).',
    maxPoints: 15,
    bonusNote: 'CĐ ca ngợi thầy cô +3đ',
  },
  {
    id: 'trang_phuc',
    stt: 2,
    name: 'Trang phục, đạo cụ',
    shortName: 'Trang phục & ĐC',
    description: 'Phù hợp lứa tuổi học sinh, đúng thể loại, đạo cụ phù hợp với thể loại.',
    maxPoints: 25,
  },
  {
    id: 'dan_dung',
    stt: 3,
    name: 'Dàn dựng',
    shortName: 'Dàn dựng',
    description: 'Mức độ đồng đều, động tác khó phù hợp lời ca và kỹ thuật biểu diễn.',
    maxPoints: 25,
    subCriteria: [
      { label: 'Mức độ đồng đều', maxPoints: 10 },
      { label: 'Nhiều động tác khó, phù hợp lời ca', maxPoints: 10 },
      {
        label: 'Kỹ thuật biểu diễn người múa (động tác chuẩn, thể hiện sắc thái trên nét mặt và động tác)',
        maxPoints: 5,
      },
    ],
  },
  {
    id: 'hat',
    stt: 4,
    name: 'Hát',
    shortName: 'Hát',
    description: 'Sắc thái biểu cảm, đúng giai điệu và đúng tone, nhịp, phách.',
    maxPoints: 15,
    subCriteria: [
      { label: 'Thể hiện được sắc thái trên nét mặt phù hợp với bài', maxPoints: 5 },
      { label: 'Đúng giai điệu', maxPoints: 5 },
      { label: 'Đúng tone, nhịp, phách', maxPoints: 5 },
    ],
  },
  {
    id: 'file_nhac',
    stt: 5,
    name: 'File nhạc',
    shortName: 'File nhạc',
    description: 'Chất lượng âm thanh tốt không có tạp âm.',
    maxPoints: 10,
  },
  {
    id: 'ky_luat',
    stt: 6,
    name: 'Kỷ luật sân khấu',
    shortName: 'Kỷ luật SK',
    description:
      'Không được chạy qua lại sân khấu trong khi biểu diễn, đạo cụ múa xong không được vứt trên sân khấu.',
    maxPoints: 10,
  },
];

export const JUDGES: JudgeInfo[] = [
  {
    id: 'gk1',
    shortLabel: 'GK1',
    fullName: 'Lê Thị Hoa',
    role: 'Trưởng ban Giám khảo',
    isChair: true,
  },
  {
    id: 'gk2',
    shortLabel: 'GK2',
    fullName: 'Lê Huy Hùng',
    role: 'Ủy viên Ban Giám khảo',
  },
  {
    id: 'gk3',
    shortLabel: 'GK3',
    fullName: 'Nguyễn Thị Hoa',
    role: 'Ủy viên Ban Giám khảo',
  },
  {
    id: 'gk4',
    shortLabel: 'GK4',
    fullName: 'Chung Minh Cường',
    role: 'Ủy viên Ban Giám khảo',
  },
  {
    id: 'gk5',
    shortLabel: 'GK5',
    fullName: 'Nguyễn Thị Nga',
    role: 'Ủy viên Ban Giám khảo',
  },
];

// Default balanced assignment of the 6 criteria (100 points total) across the 5 judges
export const DEFAULT_JUDGE_CRITERIA: JudgeCriteriaMap = {
  gk1: ['chu_de'],
  gk2: ['trang_phuc'],
  gk3: ['dan_dung'],
  gk4: ['hat'],
  gk5: ['file_nhac', 'ky_luat'],
};

export const DEFAULT_CONFIG: ScoringConfig = {
  tieBreakByChair: true,
  requireAllJudgesToRank: false,
  judgeCriteria: DEFAULT_JUDGE_CRITERIA,
};

// Exact performance order from Danh sách thứ tự biểu diễn (16/11/2026) + row 12 for 9A1
export const INITIAL_PERFORMANCES: PerformanceItem[] = [
  {
    id: 'tm-01',
    stt: 1,
    className: '8A3',
    performanceName: 'Em là cô giáo vùng cao + sáo mèo',
    isTeacherTheme: true,
    scores: { gk1: null, gk2: null, gk3: null, gk4: null, gk5: null },
  },
  {
    id: 'tm-02',
    stt: 2,
    className: '6A2',
    performanceName: 'Thầy cô là tất cả - Thầy cô cho em những ước mơ',
    isTeacherTheme: true,
    scores: { gk1: null, gk2: null, gk3: null, gk4: null, gk5: null },
  },
  {
    id: 'tm-03',
    stt: 3,
    className: '8A2',
    performanceName: 'Lá thư gửi thầy',
    isTeacherTheme: true,
    scores: { gk1: null, gk2: null, gk3: null, gk4: null, gk5: null },
  },
  {
    id: 'tm-04',
    stt: 4,
    className: '8A1',
    performanceName: 'Cõng chữ về bản - Người giáo viên nhân dân',
    isTeacherTheme: true,
    scores: { gk1: null, gk2: null, gk3: null, gk4: null, gk5: null },
  },
  {
    id: 'tm-05',
    stt: 5,
    className: '6A3',
    performanceName: 'Người gieo mầm xanh',
    isTeacherTheme: true,
    scores: { gk1: null, gk2: null, gk3: null, gk4: null, gk5: null },
  },
  {
    id: 'tm-06',
    stt: 6,
    className: '9A3',
    performanceName: 'Bài ca người GV nhân dân + Viết tiếp câu chuyện hòa bình',
    isTeacherTheme: true,
    scores: { gk1: null, gk2: null, gk3: null, gk4: null, gk5: null },
  },
  {
    id: 'tm-07',
    stt: 7,
    className: '7A2',
    performanceName: 'Nấu ăn cho em & Cõng chữ về bản',
    isTeacherTheme: true,
    scores: { gk1: null, gk2: null, gk3: null, gk4: null, gk5: null },
  },
  {
    id: 'tm-08',
    stt: 8,
    className: '7A1',
    performanceName: 'Bụi phấn - Người gieo mầm xanh',
    isTeacherTheme: true,
    scores: { gk1: null, gk2: null, gk3: null, gk4: null, gk5: null },
  },
  {
    id: 'tm-09',
    stt: 9,
    className: '7A3',
    performanceName: 'Em là cô giáo vùng cao - Cõng chữ về bản',
    isTeacherTheme: true,
    scores: { gk1: null, gk2: null, gk3: null, gk4: null, gk5: null },
  },
  {
    id: 'tm-10',
    stt: 10,
    className: '6A1',
    performanceName: 'Cõng chữ về bản và Bài ca người giáo viên nhân dân',
    isTeacherTheme: true,
    scores: { gk1: null, gk2: null, gk3: null, gk4: null, gk5: null },
  },
  {
    id: 'tm-11',
    stt: 11,
    className: '9A2',
    performanceName: 'Việt Nam thịnh vượng sáng ngời',
    isTeacherTheme: false,
    scores: { gk1: null, gk2: null, gk3: null, gk4: null, gk5: null },
  },
  {
    id: 'tm-12',
    stt: 12,
    className: '9A1',
    performanceName: '',
    isTeacherTheme: false,
    scores: { gk1: null, gk2: null, gk3: null, gk4: null, gk5: null },
  },
];

// Normalized 0-1 ratios per performance for realistic sample generation regardless of criteria assignment
export const SAMPLE_RATIO_BY_STT: Record<number, Record<JudgeId, number>> = {
  1: { gk1: 0.94, gk2: 0.92, gk3: 0.94, gk4: 0.9, gk5: 0.95 },
  2: { gk1: 0.86, gk2: 0.84, gk3: 0.82, gk4: 0.86, gk5: 0.88 },
  3: { gk1: 0.9, gk2: 0.88, gk3: 0.86, gk4: 0.88, gk5: 0.9 },
  4: { gk1: 0.96, gk2: 0.94, gk3: 0.96, gk4: 0.94, gk5: 0.95 },
  5: { gk1: 0.82, gk2: 0.8, gk3: 0.82, gk4: 0.8, gk5: 0.85 },
  6: { gk1: 0.98, gk2: 0.96, gk3: 0.98, gk4: 0.96, gk5: 0.98 },
  7: { gk1: 0.88, gk2: 0.86, gk3: 0.88, gk4: 0.84, gk5: 0.9 },
  8: { gk1: 0.84, gk2: 0.82, gk3: 0.84, gk4: 0.82, gk5: 0.85 },
  9: { gk1: 0.91, gk2: 0.9, gk3: 0.9, gk4: 0.88, gk5: 0.92 },
  10: { gk1: 0.8, gk2: 0.78, gk3: 0.8, gk4: 0.82, gk5: 0.85 },
  11: { gk1: 0.92, gk2: 0.92, gk3: 0.92, gk4: 0.92, gk5: 0.95 },
  12: { gk1: 0.85, gk2: 0.84, gk3: 0.85, gk4: 0.86, gk5: 0.88 },
};
