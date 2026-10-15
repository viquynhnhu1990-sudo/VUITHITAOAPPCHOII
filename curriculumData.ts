import { GradeLevel, TermPeriod, SubjectRule, User, SchoolSettings, Matrix, Exam, Question } from '../types';

export const PERIOD_NAMES: Record<TermPeriod, string> = {
  mid_term_1: 'Giữa Học kỳ I',
  end_term_1: 'Cuối Học kỳ I',
  mid_term_2: 'Giữa Học kỳ II',
  end_term_2: 'Cuối Năm học (Cuối HKII)',
};

export const COGNITIVE_LEVEL_NAMES = {
  1: 'Mức 1: Nhận biết, nhắc lại, mô tả, áp dụng trực tiếp',
  2: 'Mức 2: Kết nối, sắp xếp kiến thức để giải quyết vấn đề tương tự',
  3: 'Mức 3: Vận dụng giải quyết vấn đề mới hoặc phản hồi hợp lý',
};

// Cấu hình quy định kiểm tra định kỳ bằng điểm số theo Thông tư 27/2020/TT-BGDĐT
export const CURRICULUM_SUBJECT_RULES: SubjectRule[] = [
  {
    id: 'toan',
    name: 'Toán',
    gradesAllowed: [1, 2, 3, 4, 5],
    periodsAllowed: {
      1: ['end_term_1', 'end_term_2'],
      2: ['end_term_1', 'end_term_2'],
      3: ['end_term_1', 'end_term_2'],
      4: ['mid_term_1', 'end_term_1', 'mid_term_2', 'end_term_2'],
      5: ['mid_term_1', 'end_term_1', 'mid_term_2', 'end_term_2'],
    },
    defaultDurationMin: 40,
    notes: 'Toán lớp 1, 2, 3 chỉ kiểm tra định kỳ cuối HKI và cuối năm. Toán lớp 4, 5 có thêm giữa HKI và giữa HKII.',
  },
  {
    id: 'tieng_viet',
    name: 'Tiếng Việt',
    gradesAllowed: [1, 2, 3, 4, 5],
    periodsAllowed: {
      1: ['end_term_1', 'end_term_2'],
      2: ['end_term_1', 'end_term_2'],
      3: ['end_term_1', 'end_term_2'],
      4: ['mid_term_1', 'end_term_1', 'mid_term_2', 'end_term_2'],
      5: ['mid_term_1', 'end_term_1', 'mid_term_2', 'end_term_2'],
    },
    defaultDurationMin: 40,
    notes: 'Gồm 2 phần: Đọc (Đọc thành tiếng + Đọc hiểu) và Viết (Chính tả + Đoạn văn/Bài văn).',
  },
  {
    id: 'ngoai_ngu_1',
    name: 'Ngoại ngữ 1 (Tiếng Anh)',
    gradesAllowed: [3, 4, 5],
    periodsAllowed: {
      1: [],
      2: [],
      3: ['end_term_1', 'end_term_2'],
      4: ['end_term_1', 'end_term_2'],
      5: ['end_term_1', 'end_term_2'],
    },
    defaultDurationMin: 35,
    notes: 'Môn bắt buộc từ lớp 3 theo CT GDPT 2018. Kiểm tra cuối HKI và cuối năm.',
  },
  {
    id: 'tin_hoc',
    name: 'Tin học',
    gradesAllowed: [3, 4, 5],
    periodsAllowed: {
      1: [],
      2: [],
      3: ['end_term_1', 'end_term_2'],
      4: ['end_term_1', 'end_term_2'],
      5: ['end_term_1', 'end_term_2'],
    },
    defaultDurationMin: 35,
    requiresPracticalPart: true,
    notes: 'Từ lớp 3. Gồm phần lý thuyết và nhiệm vụ thực hành trên máy.',
  },
  {
    id: 'cong_nghe',
    name: 'Công nghệ',
    gradesAllowed: [3, 4, 5],
    periodsAllowed: {
      1: [],
      2: [],
      3: ['end_term_1', 'end_term_2'],
      4: ['end_term_1', 'end_term_2'],
      5: ['end_term_1', 'end_term_2'],
    },
    defaultDurationMin: 35,
    notes: 'Từ lớp 3. Phân môn độc lập với Tin học trong kế hoạch kiểm tra định kỳ.',
  },
  {
    id: 'khoa_hoc',
    name: 'Khoa học',
    gradesAllowed: [4, 5],
    periodsAllowed: {
      1: [],
      2: [],
      3: [],
      4: ['end_term_1', 'end_term_2'],
      5: ['end_term_1', 'end_term_2'],
    },
    defaultDurationMin: 35,
    notes: 'Bắt đầu từ lớp 4. Không có ở lớp 1, 2, 3 (ở lớp 1-3 là Tự nhiên và Xã hội - đánh giá nhận xét).',
  },
  {
    id: 'lich_su_dia_li',
    name: 'Lịch sử và Địa lí',
    gradesAllowed: [4, 5],
    periodsAllowed: {
      1: [],
      2: [],
      3: [],
      4: ['end_term_1', 'end_term_2'],
      5: ['end_term_1', 'end_term_2'],
    },
    defaultDurationMin: 35,
    notes: 'Bắt đầu từ lớp 4. Kiểm tra cuối HKI và cuối năm. Thường chia đều phân môn Lịch sử (5đ) và Địa lí (5đ).',
  },
];

export function validateExamEligibility(
  grade: GradeLevel,
  subjectName: string,
  period: TermPeriod
): { isValid: boolean; reason?: string } {
  const rule = CURRICULUM_SUBJECT_RULES.find(
    (r) => r.name.toLowerCase() === subjectName.toLowerCase() || r.id === subjectName.toLowerCase()
  );

  if (!rule) {
    return {
      isValid: false,
      reason: `Môn học "${subjectName}" không nằm trong danh mục các môn có bài kiểm tra định kỳ bằng điểm số theo Thông tư 27/2020/TT-BGDĐT.`,
    };
  }

  if (!rule.gradesAllowed.includes(grade)) {
    return {
      isValid: false,
      reason: `Môn ${rule.name} không tổ chức kiểm tra ở Lớp ${grade} (Theo CT GDPT 2018, môn này chỉ áp dụng từ Lớp ${Math.min(...rule.gradesAllowed)}).`,
    };
  }

  const allowedPeriods = rule.periodsAllowed[grade] || [];
  if (!allowedPeriods.includes(period)) {
    if (period === 'mid_term_1' || period === 'mid_term_2') {
      return {
        isValid: false,
        reason: `Theo Thông tư 27, bài kiểm tra định kỳ Giữa kỳ (Giữa HKI & Giữa HKII) CHỈ áp dụng cho môn Toán và Tiếng Việt của Lớp 4 và Lớp 5. Môn ${rule.name} ở Lớp ${grade} không có bài kiểm tra giữa kỳ bằng điểm số.`,
      };
    }
    return {
      isValid: false,
      reason: `Môn ${rule.name} Lớp ${grade} không có bài kiểm tra ở thời điểm ${PERIOD_NAMES[period]}.`,
    };
  }

  return { isValid: true };
}

// Ngân hàng chuẩn mạch kiến thức & yêu cầu cần đạt theo GDPT 2018
export interface TopicOutcomeTemplate {
  grade: GradeLevel;
  subject: string;
  topicName: string;
  period: TermPeriod;
  lessons: string[];
  outcomes: {
    level1: string[];
    level2: string[];
    level3: string[];
  };
}

export const TOPIC_TEMPLATES: TopicOutcomeTemplate[] = [
  // LỚP 1: TOÁN CUỐI HKI
  {
    grade: 1,
    subject: 'Toán',
    topicName: 'Số và phép tính trong phạm vi 10',
    period: 'end_term_1',
    lessons: ['Các số từ 0 đến 10', 'Phép cộng trong phạm vi 10', 'Phép trừ trong phạm vi 10'],
    outcomes: {
      level1: ['Đọc, đếm, viết được các số trong phạm vi 10.', 'Thực hiện được phép cộng, trừ đơn giản không nhớ trong phạm vi 10.'],
      level2: ['So sánh được các số trong phạm vi 10, sắp xếp thứ tự các số.', 'Tìm thành phần chưa biết đơn giản trong phép cộng, trừ.'],
      level3: ['Vận dụng phép tính giải quyết tình huống thực tế gắn liền với tranh ảnh.'],
    },
  },
  {
    grade: 1,
    subject: 'Toán',
    topicName: 'Hình học và đo lường trực quan',
    period: 'end_term_1',
    lessons: ['Hình vuông, hình tròn, hình tam giác, hình chữ nhật', 'Vị trí và định hướng không gian'],
    outcomes: {
      level1: ['Nhận biết và gọi đúng tên hình vuông, tròn, tam giác, chữ nhật qua vật thật, hình vẽ.'],
      level2: ['Phân loại được các hình phẳng đơn giản theo đặc điểm nhận dạng.'],
      level3: ['Ghép được các hình đơn giản để tạo thành hình mới theo yêu cầu.'],
    },
  },

  // LỚP 2: TIẾNG VIỆT CUỐI NĂM
  {
    grade: 2,
    subject: 'Tiếng Việt',
    topicName: 'Đọc hiểu văn bản và từ ngữ',
    period: 'end_term_2',
    lessons: ['Chủ điểm Bạn bè bốn phương', 'Từ chỉ đặc điểm, hoạt động', 'Dấu câu: dấu chấm, dấu phẩy, dấu chấm hỏi'],
    outcomes: {
      level1: ['Đọc đúng, rành mạch đoạn văn; nhận biết các chi tiết hiển ngôn trong bài đọc.'],
      level2: ['Hiểu ý nghĩa của chi tiết nổi bật; tìm được từ chỉ sự vật, hoạt động, đặc điểm theo yêu cầu.'],
      level3: ['Liên hệ nội dung bài đọc với bản thân; đặt câu có sử dụng từ ngữ và dấu câu phù hợp.'],
    },
  },
  {
    grade: 2,
    subject: 'Tiếng Việt',
    topicName: 'Viết chính tả và đoạn văn ngắn',
    period: 'end_term_2',
    lessons: ['Chính tả phân biệt c/k, g/gh, ng/ngh', 'Viết đoạn văn 4-5 câu kể về một người bạn hoặc việc làm tốt'],
    outcomes: {
      level1: ['Viết đúng đoạn chính tả 40-50 chữ, chữ viết rõ ràng, đúng quy tắc chính tả cơ bản.'],
      level2: ['Phân biệt đúng các cặp phụ âm dễ lẫn; sắp xếp câu thành đoạn văn hợp lý.'],
      level3: ['Viết đoạn văn ngắn 4-5 câu mạch lạc, thể hiện tình cảm, suy nghĩ chân thực.'],
    },
  },

  // LỚP 3: TIN HỌC CUỐI HKI
  {
    grade: 3,
    subject: 'Tin học',
    topicName: 'Máy tính và em - Thông tin xung quanh ta',
    period: 'end_term_1',
    lessons: ['Thông tin và quyết định', 'Các bộ phận của máy tính', 'Bàn phím và chuột máy tính'],
    outcomes: {
      level1: ['Nhận biết được 4 bộ phận cơ bản của máy tính để bàn (thân máy, màn hình, bàn phím, chuột).', 'Nêu được ví dụ về thông tin thu nhận qua các giác quan.'],
      level2: ['Biết cách cầm chuột đúng cách và thực hiện các thao tác nháy chuột, kéo thả.', 'Nhận biết được biểu tượng phần mềm trên màn hình nền.'],
      level3: ['Vận dụng kiến thức chọn tư thế ngồi máy tính đúng và thao tác an toàn khi sử dụng thiết bị điện tử.'],
    },
  },
  {
    grade: 3,
    subject: 'Tin học',
    topicName: 'Luyện tập thao tác bàn phím và phần mềm học tập',
    period: 'end_term_1',
    lessons: ['Hàng phím cơ sở và cách đặt tay', 'Phần mềm tập gõ RapidTyping hoặc Paint'],
    outcomes: {
      level1: ['Xác định được hai phím có gờ F và J trên hàng phím cơ sở.'],
      level2: ['Đặt đúng vị trí 10 ngón tay trên hàng phím cơ sở khi chuẩn bị gõ.'],
      level3: ['Thực hiện gõ được các từ đơn giản hoặc vẽ hình học cơ bản trong phần mềm tập vẽ.'],
    },
  },

  // LỚP 4: TOÁN GIỮA HKI
  {
    grade: 4,
    subject: 'Toán',
    topicName: 'Số có nhiều chữ số và phép tính cộng trừ',
    period: 'mid_term_1',
    lessons: ['Các số có sáu chữ số', 'Hàng và lớp', 'Làm tròn số đến hàng trăm nghìn', 'Phép cộng và phép trừ có nhớ'],
    outcomes: {
      level1: ['Đọc, viết, xác định được giá trị theo vị trí của các chữ số trong số có đến sáu chữ số.', 'Thực hiện được phép cộng, trừ các số có đến sáu chữ số (có nhớ không quá 2 lượt).'],
      level2: ['So sánh, sắp xếp thứ tự các số có nhiều chữ số; làm tròn số theo yêu cầu.', 'Tìm thành phần chưa biết của phép tính; tính giá trị của biểu thức chứa chữ đơn giản.'],
      level3: ['Giải bài toán thực tế có hai đến ba bước tính liên quan đến số tự nhiên, tính giá trị trung bình.'],
    },
  },
  {
    grade: 4,
    subject: 'Toán',
    topicName: 'Hình học và đơn vị đo thời gian, khối lượng',
    period: 'mid_term_1',
    lessons: ['Góc nhọn, góc tù, góc bẹt', 'Hai đường thẳng vuông góc, song song', 'Yến, tạ, tấn', 'Giây, thế kỉ'],
    outcomes: {
      level1: ['Nhận biết được góc vuông, góc nhọn, góc tù, góc bẹt bằng ê-ke hoặc mắt thường.', 'Nhận biết các đơn vị đo tạ, tấn, yến, giây, thế kỉ.'],
      level2: ['Chuyển đổi được giữa các đơn vị đo thời gian, khối lượng đã học.', 'Nhận biết hai đường thẳng vuông góc, hai đường thẳng song song trong hình vẽ.'],
      level3: ['Vận dụng đơn vị đo và yếu tố hình học để giải bài toán thực tế liên quan đến cuộc sống hằng ngày.'],
    },
  },

  // LỚP 5: KHOA HỌC CUỐI NĂM
  {
    grade: 5,
    subject: 'Khoa học',
    topicName: 'Năng lượng và sự biến đổi',
    period: 'end_term_2',
    lessons: ['Năng lượng mặt trời, gió và nước chảy', 'Năng lượng điện và sử dụng điện an toàn', 'Sự biến đổi hóa học'],
    outcomes: {
      level1: ['Kể tên được một số nguồn năng lượng thông dụng trong đời sống.', 'Nêu được quy tắc an toàn và tiết kiệm khi sử dụng điện.'],
      level2: ['Phân biệt được hiện tượng biến đổi vật lí và hiện tượng biến đổi hóa học qua ví dụ cụ thể.', 'Giải thích vai trò của năng lượng sạch (mặt trời, gió) trong bảo vệ môi trường.'],
      level3: ['Đề xuất và thực hiện được các biện pháp tiết kiệm điện, bảo vệ môi trường tại gia đình và trường học.'],
    },
  },
  {
    grade: 5,
    subject: 'Khoa học',
    topicName: 'Sinh vật và môi trường sống',
    period: 'end_term_2',
    lessons: ['Sự sinh sản của thực vật và động vật', 'Môi trường và tài nguyên thiên nhiên', 'Tác động của con người đến môi trường'],
    outcomes: {
      level1: ['Nêu được các bộ phận chính của hoa thụ phấn.', 'Kể tên một số loài động vật đẻ trứng và đẻ con.'],
      level2: ['Mô tả được sơ đồ chuỗi thức ăn đơn giản trong tự nhiên.', 'Phân tích được hậu quả của việc ô nhiễm nguồn nước hoặc chặt phá rừng.'],
      level3: ['Tham gia và vận động mọi người xung quanh hành động bảo vệ đa dạng sinh học và giữ gìn vệ sinh môi trường.'],
    },
  },
];

// Danh sách người dùng khởi tạo
export const SEED_USERS: User[] = [
  {
    id: 'user_admin',
    name: 'Nguyễn Văn Quản',
    email: 'quantri@thchuvanan.edu.vn',
    role: 'admin',
    title: 'Quản trị viên Hệ thống',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  },
  {
    id: 'user_principal',
    name: 'Trần Thị Thu Hiệu',
    email: 'hieutruong@thchuvanan.edu.vn',
    role: 'principal',
    title: 'Phó Hiệu trưởng phụ trách Chuyên môn',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  },
  {
    id: 'user_dept_head',
    name: 'Lê Hoàng Anh',
    email: 'to_truong_k4@thchuvanan.edu.vn',
    role: 'dept_head',
    departmentId: 'to_4_5',
    gradeAssigned: 4,
    title: 'Tổ trưởng Chuyên môn Khối 4 & 5',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
  },
  {
    id: 'user_teacher',
    name: 'Phạm Thu Hà',
    email: 'gv_ha@thchuvanan.edu.vn',
    role: 'teacher',
    departmentId: 'to_4_5',
    gradeAssigned: 4,
    title: 'Giáo viên Khối 4 (Chủ nhiệm 4A1)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  },
];

export const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: 'TRƯỜNG TIỂU HỌC CHU VĂN AN',
  governingBody: 'PHÒNG GIÁO DỤC VÀ ĐÀO TẠO QUẬN BA ĐÌNH',
  address: 'Số 130 Thụy Khuê, Tây Hồ, Hà Nội',
  principalName: 'Trần Thị Thu Hiệu',
  academicYear: '2024-2025',
  currentTerm: 'HK1',
  allowCustomDecimals: false,
  strictTT27Enforcement: true,
  departments: [
    { id: 'to_1', name: 'Tổ Chuyên môn Khối 1', headTeacher: 'Vũ Minh Hạnh' },
    { id: 'to_2_3', name: 'Tổ Chuyên môn Khối 2 - 3', headTeacher: 'Nguyễn Bích Ngọc' },
    { id: 'to_4_5', name: 'Tổ Chuyên môn Khối 4 - 5', headTeacher: 'Lê Hoàng Anh' },
    { id: 'to_nk', name: 'Tổ Bộ môn Ngoại ngữ & Tin học', headTeacher: 'Trịnh Thanh Tùng' },
  ],
};

// Dữ liệu ma trận mẫu ban đầu (Toán Lớp 4 Giữa HKI - Được xác nhận)
export const SEED_MATRICES: Matrix[] = [
  {
    id: 'mat_toan_4_ghk1',
    code: 'MT-TOAN4-GHK1-01',
    title: 'Ma trận Đề kiểm tra định kỳ môn Toán Lớp 4 - Giữa HKI',
    schoolName: 'TRƯỜNG TIỂU HỌC CHU VĂN AN',
    academicYear: '2024-2025',
    term: 'HK1',
    period: 'mid_term_1',
    grade: 4,
    className: 'Khối 4',
    subject: 'Toán',
    textbook: 'Kết Nối Tri Thức',
    creatorId: 'user_teacher',
    creatorName: 'Phạm Thu Hà',
    department: 'Tổ Chuyên môn Khối 4 - 5',
    durationMinutes: 40,
    examForm: 'Tự luận kết hợp trắc nghiệm',
    totalScore: 10,
    status: 'approved',
    version: 'v1.0',
    cells: [
      {
        id: 'cell_1',
        topicId: 'topic_1',
        topicName: 'Số có nhiều chữ số. Phép cộng và phép trừ',
        outcome: 'Đọc, viết, so sánh số có sáu chữ số; thực hiện phép cộng, trừ các số tự nhiên.',
        sourceRef: 'SGK Toán 4 - Kết Nối Tri Thức, tr.10-38',
        level1Count: 2,
        level1Points: 2.0,
        level1Type: 'multiple_choice',
        level2Count: 1,
        level2Points: 1.0,
        level2Type: 'multiple_choice',
        level3Count: 1,
        level3Points: 1.5,
        level3Type: 'essay',
        totalQuestions: 4,
        totalPoints: 4.5,
      },
      {
        id: 'cell_2',
        topicId: 'topic_2',
        topicName: 'Hình học (Góc nhọn, góc tù, đường vuông góc, song song)',
        outcome: 'Nhận biết các loại góc; nhận biết hai đường thẳng vuông góc, song song.',
        sourceRef: 'SGK Toán 4, tr.42-56',
        level1Count: 1,
        level1Points: 1.0,
        level1Type: 'multiple_choice',
        level2Count: 1,
        level2Points: 1.0,
        level2Type: 'multiple_choice',
        level3Count: 0,
        level3Points: 0,
        level3Type: 'short_answer',
        totalQuestions: 2,
        totalPoints: 2.0,
      },
      {
        id: 'cell_3',
        topicId: 'topic_3',
        topicName: 'Đo lường (Yến, tạ, tấn, giây, thế kỉ)',
        outcome: 'Chuyển đổi và thực hiện phép tính với các đơn vị đo thời gian, khối lượng.',
        sourceRef: 'SGK Toán 4, tr.60-72',
        level1Count: 1,
        level1Points: 1.0,
        level1Type: 'multiple_choice',
        level2Count: 1,
        level2Points: 1.0,
        level2Type: 'short_answer',
        level3Count: 0,
        level3Points: 0,
        level3Type: 'short_answer',
        totalQuestions: 2,
        totalPoints: 2.0,
      },
      {
        id: 'cell_4',
        topicId: 'topic_4',
        topicName: 'Giải toán thực tế có lời văn',
        outcome: 'Vận dụng kiến thức giải bài toán thực tế có nhiều bước tính, tìm số trung bình cộng.',
        sourceRef: 'SGK Toán 4, tr.75-80',
        level1Count: 0,
        level1Points: 0,
        level1Type: 'essay',
        level2Count: 0,
        level2Points: 0,
        level2Type: 'essay',
        level3Count: 1,
        level3Points: 1.5,
        level3Type: 'essay',
        totalQuestions: 1,
        totalPoints: 1.5,
      },
    ],
    createdAt: '2024-10-10T08:00:00Z',
    updatedAt: '2024-10-12T14:30:00Z',
    approvedBy: 'Lê Hoàng Anh',
    approvalComment: 'Ma trận cân đối, đúng tỷ lệ 40% - 30% - 30% và đúng chuẩn TT 27.',
    approvedAt: '2024-10-12T16:00:00Z',
  },
];

// Seed Exam từ ma trận trên
export const SEED_EXAMS: Exam[] = [
  {
    id: 'exam_toan_4_ghk1_01',
    code: 'DE-TOAN4-GHK1-101',
    title: 'Đề kiểm tra định kỳ Giữa Học kỳ I - Môn Toán Lớp 4 (Mã đề 101)',
    matrixId: 'mat_toan_4_ghk1',
    matrixCode: 'MT-TOAN4-GHK1-01',
    schoolName: 'TRƯỜNG TIỂU HỌC CHU VĂN AN',
    academicYear: '2024-2025',
    term: 'HK1',
    period: 'mid_term_1',
    grade: 4,
    subject: 'Toán',
    textbook: 'Kết Nối Tri Thức',
    durationMinutes: 40,
    creatorId: 'user_teacher',
    creatorName: 'Phạm Thu Hà',
    department: 'Tổ Chuyên môn Khối 4 - 5',
    status: 'approved',
    version: 'v1.0',
    questions: [
      {
        id: 'q1',
        matrixCellId: 'cell_1',
        code: 'Câu 1',
        subject: 'Toán',
        grade: 4,
        topic: 'Số có nhiều chữ số',
        outcome: 'Xác định giá trị chữ số theo vị trí',
        level: 1,
        type: 'multiple_choice',
        content: 'Chữ số 7 trong số 572 841 có giá trị là:',
        options: [
          { key: 'A', text: '70 000', isCorrect: true },
          { key: 'B', text: '7 000', isCorrect: false },
          { key: 'C', text: '700', isCorrect: false },
          { key: 'D', text: '70', isCorrect: false },
        ],
        correctAnswer: 'A',
        rubric: 'Khoanh vào A. Cho 1.0 điểm.',
        points: 1.0,
        reviewStatus: 'verified',
        isLocked: true,
      },
      {
        id: 'q2',
        matrixCellId: 'cell_1',
        code: 'Câu 2',
        subject: 'Toán',
        grade: 4,
        topic: 'Số có nhiều chữ số',
        outcome: 'Đọc và viết số tự nhiên',
        level: 1,
        type: 'multiple_choice',
        content: 'Số "Bốn trăm linh năm nghìn sáu trăm ba mươi mốt" được viết là:',
        options: [
          { key: 'A', text: '405 631', isCorrect: true },
          { key: 'B', text: '450 631', isCorrect: false },
          { key: 'C', text: '405 613', isCorrect: false },
          { key: 'D', text: '400 563', isCorrect: false },
        ],
        correctAnswer: 'A',
        rubric: 'Khoanh vào A. Cho 1.0 điểm.',
        points: 1.0,
        reviewStatus: 'verified',
      },
      {
        id: 'q3',
        matrixCellId: 'cell_2',
        code: 'Câu 3',
        subject: 'Toán',
        grade: 4,
        topic: 'Hình học',
        outcome: 'Nhận biết các loại góc',
        level: 1,
        type: 'multiple_choice',
        content: 'Góc nào dưới đây lớn hơn góc vuông nhưng bé hơn góc bẹt?',
        options: [
          { key: 'A', text: 'Góc nhọn', isCorrect: false },
          { key: 'B', text: 'Góc tù', isCorrect: true },
          { key: 'C', text: 'Góc vuông', isCorrect: false },
          { key: 'D', text: 'Góc bẹt', isCorrect: false },
        ],
        correctAnswer: 'B',
        rubric: 'Khoanh vào B. Cho 1.0 điểm.',
        points: 1.0,
        reviewStatus: 'verified',
      },
      {
        id: 'q4',
        matrixCellId: 'cell_3',
        code: 'Câu 4',
        subject: 'Toán',
        grade: 4,
        topic: 'Đo lường',
        outcome: 'Đơn vị đo khối lượng',
        level: 1,
        type: 'multiple_choice',
        content: '5 tạ 30 kg = ........ kg. Số thích hợp điền vào chỗ chấm là:',
        options: [
          { key: 'A', text: '530', isCorrect: true },
          { key: 'B', text: '5 030', isCorrect: false },
          { key: 'C', text: '53', isCorrect: false },
          { key: 'D', text: '503', isCorrect: false },
        ],
        correctAnswer: 'A',
        rubric: 'Khoanh vào A (1 tạ = 100 kg, 5 tạ 30 kg = 530 kg). Cho 1.0 điểm.',
        points: 1.0,
        reviewStatus: 'verified',
      },
      {
        id: 'q5',
        matrixCellId: 'cell_1',
        code: 'Câu 5',
        subject: 'Toán',
        grade: 4,
        topic: 'Phép tính',
        outcome: 'Tính giá trị biểu thức chứa chữ',
        level: 2,
        type: 'multiple_choice',
        content: 'Với a = 250 và b = 150 thì giá trị của biểu thức 1 000 - (a + b) là:',
        options: [
          { key: 'A', text: '600', isCorrect: true },
          { key: 'B', text: '500', isCorrect: false },
          { key: 'C', text: '700', isCorrect: false },
          { key: 'D', text: '400', isCorrect: false },
        ],
        correctAnswer: 'A',
        rubric: 'Khoanh vào A (1000 - 400 = 600). Cho 1.0 điểm.',
        points: 1.0,
        reviewStatus: 'verified',
      },
      {
        id: 'q6',
        matrixCellId: 'cell_2',
        code: 'Câu 6',
        subject: 'Toán',
        grade: 4,
        topic: 'Hình học',
        outcome: 'Quan hệ song song và vuông góc',
        level: 2,
        type: 'multiple_choice',
        content: 'Trong hình chữ nhật ABCD, cặp cạnh nào dưới đây song song với nhau?',
        options: [
          { key: 'A', text: 'AB và CD', isCorrect: true },
          { key: 'B', text: 'AB và BC', isCorrect: false },
          { key: 'C', text: 'AD và CD', isCorrect: false },
          { key: 'D', text: 'AB và AD', isCorrect: false },
        ],
        correctAnswer: 'A',
        rubric: 'Khoanh vào A. Cho 1.0 điểm.',
        points: 1.0,
        reviewStatus: 'verified',
      },
      {
        id: 'q7',
        matrixCellId: 'cell_3',
        code: 'Câu 7',
        subject: 'Toán',
        grade: 4,
        topic: 'Đo lường thời gian',
        outcome: 'Xác định thế kỉ',
        level: 2,
        type: 'short_answer',
        content: 'Năm 1010, vua Lý Thái Tổ dời đô về Thăng Long. Năm đó thuộc thế kỉ thứ mấy?',
        correctAnswer: 'Thế kỉ XI (Thế kỉ thứ 11)',
        rubric: 'Ghi đúng "Thế kỉ XI" hoặc "Thế kỉ 11". Cho 1.0 điểm.',
        points: 1.0,
        reviewStatus: 'verified',
      },
      {
        id: 'q8',
        matrixCellId: 'cell_1',
        code: 'Câu 8',
        subject: 'Toán',
        grade: 4,
        topic: 'Đặt tính rồi tính',
        outcome: 'Thực hiện phép cộng trừ số tự nhiên',
        level: 3,
        type: 'essay',
        content: 'Đặt tính rồi tính:\na) 438 529 + 247 185\nb) 852 640 - 364 218',
        correctAnswer: 'a) 685 714; b) 488 422',
        rubric: 'Đặt tính thẳng cột và tính đúng kết quả câu a (0.75 điểm). Đặt tính thẳng cột và tính đúng câu b (0.75 điểm). Tổng 1.5 điểm.',
        points: 1.5,
        reviewStatus: 'verified',
      },
      {
        id: 'q9',
        matrixCellId: 'cell_4',
        code: 'Câu 9',
        subject: 'Toán',
        grade: 4,
        topic: 'Giải toán thực tế',
        outcome: 'Giải bài toán có lời văn liên quan đến số trung bình cộng',
        level: 3,
        type: 'essay',
        content: 'Khối lớp Bốn quyên góp được 280 quyển vở, khối lớp Năm quyên góp được nhiều hơn khối lớp Bốn 60 quyển vở. Hỏi trung bình mỗi khối lớp quyên góp được bao nhiêu quyển vở?',
        correctAnswer: 'Khối 5 quyên góp: 280 + 60 = 340 (quyển). Trung bình mỗi khối: (280 + 340) : 2 = 310 (quyển). Đáp số: 310 quyển vở.',
        rubric: '- Tìm được số vở khối Năm: 280 + 60 = 340 quyển (0.5đ)\n- Tìm được số vở trung bình: (280 + 340) : 2 = 310 quyển (0.75đ)\n- Ghi đúng đáp số kèm tên đơn vị (0.25đ). Tổng 1.5 điểm.',
        points: 1.5,
        reviewStatus: 'verified',
      },
    ],
    variants: [
      {
        variantCode: 'A',
        questions: [],
      },
    ],
    qualityReport: {
      id: 'rep_toan_4',
      examId: 'exam_toan_4_ghk1_01',
      inspectedAt: '2024-10-12T15:00:00Z',
      inspector: 'AI Hệ Thống (Gemini 3.8)',
      score: 98,
      passedCount: 19,
      warningCount: 1,
      criticalCount: 0,
      unverifiableCount: 0,
      summary: 'Đề kiểm tra tuân thủ tuyệt đối quy định Thông tư 27/2020/TT-BGDĐT. Tổng điểm 10.0 chẵn, cấu trúc 40% Mức 1 - 30% Mức 2 - 30% Mức 3. Barem chấm chi tiết.',
      canProceedToApproval: true,
      items: [
        { id: 1, title: 'Đúng chương trình và khối lớp', category: 'legal', status: 'passed', message: 'Môn Toán lớp 4 đúng chuẩn GDPT 2018.' },
        { id: 2, title: 'Đúng phạm vi đã dạy', category: 'pedagogical', status: 'passed', message: 'Nằm trong khung phân phối chương trình tuần 1-9.' },
        { id: 3, title: 'Đúng yêu cầu cần đạt', category: 'pedagogical', status: 'passed', message: 'Tất cả 9 câu hỏi đều bám sát năng lực Toán học.' },
        { id: 4, title: 'Đúng 3 mức độ Thông tư 27', category: 'pedagogical', status: 'passed', message: 'Mức 1: 5.0đ, Mức 2: 2.0đ, Mức 3: 3.0đ.' },
        { id: 5, title: 'Khớp ma trận 100%', category: 'content', status: 'passed', message: 'Tất cả mã ô ma trận đều có câu hỏi tương ứng.' },
        { id: 6, title: 'Đúng tổng số câu', category: 'content', status: 'passed', message: '9 câu (7 trắc nghiệm/ngắn, 2 tự luận).' },
        { id: 7, title: 'Đúng tổng điểm 10.0', category: 'legal', status: 'passed', message: 'Tổng điểm chính xác 10.0, không có điểm thập phân lẻ ở tổng.' },
        { id: 8, title: 'Phép tính và kết quả chính xác', category: 'content', status: 'passed', message: 'Toàn bộ đáp số tính toán đã được kiểm tra chéo chính xác.' },
        { id: 9, title: 'Câu trắc nghiệm có 1 đáp án duy nhất', category: 'content', status: 'passed', message: 'Mỗi câu trắc nghiệm chỉ có duy nhất 1 phương án đúng.' },
        { id: 10, title: 'Không có nhiều đáp án đúng ngoài dự kiến', category: 'content', status: 'passed', message: 'Không phát hiện phương án gây tranh cãi.' },
        { id: 11, title: 'Không có 2 phương án trùng nghĩa', category: 'content', status: 'passed', message: 'Các phương án nhiễu độc lập, hợp lý.' },
        { id: 12, title: 'Không có câu hỏi trùng lặp', category: 'content', status: 'passed', message: 'Độ đa dạng tốt giữa các mạch kiến thức.' },
        { id: 13, title: 'Chính tả, ngữ pháp tiếng Việt', category: 'presentation', status: 'passed', message: 'Văn phong chuẩn xác, không lỗi chính tả.' },
        { id: 14, title: 'Ngôn ngữ phù hợp học sinh tiểu học', category: 'presentation', status: 'passed', message: 'Thuật ngữ quen thuộc với lứa tuổi 9-10 tuổi.' },
        { id: 15, title: 'Hình ảnh / tính trực quan', category: 'presentation', status: 'passed', message: 'Mô tả hình học tường minh.' },
        { id: 16, title: 'Thời lượng phù hợp độ tuổi', category: 'pedagogical', status: 'passed', message: 'Ước lượng thời gian làm bài 32-35 phút / thời lượng 40 phút.' },
        { id: 17, title: 'Đáp án khớp đề bài', category: 'content', status: 'passed', message: 'Đáp án hoàn toàn trùng khớp với nội dung dẫn.' },
        { id: 18, title: 'Hướng dẫn chấm đủ và rõ', category: 'pedagogical', status: 'passed', message: 'Barem chi tiết từng bước 0.25đ / 0.5đ / 0.75đ.' },
        { id: 19, title: 'Không lộ đáp án trong đề học sinh', category: 'legal', status: 'passed', message: 'Bản đề học sinh tách biệt hoàn toàn với đáp án.' },
        { id: 20, title: 'Căn cứ tài liệu thực tế', category: 'legal', status: 'warning', message: 'Cần giáo viên đối chiếu thêm số trang SGK của bộ sách nếu trường đổi ấn bản mới.' },
      ],
    },
    createdAt: '2024-10-12T14:40:00Z',
    updatedAt: '2024-10-12T16:15:00Z',
    approvedBy: 'Trần Thị Thu Hiệu',
    approvalComment: 'Đề bài đạt chuẩn cao, ngôn từ trong sáng, duyệt phát hành làm đề kiểm tra chính thức.',
    approvedAt: '2024-10-13T09:00:00Z',
    publishedAt: '2024-10-13T09:00:00Z',
  },
];
