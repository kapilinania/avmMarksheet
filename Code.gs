/**
 * ============================================================================
 * AVM SCHOOL MARKSHEET MANAGEMENT SYSTEM - GOOGLE APPS SCRIPT
 * ============================================================================
 * 
 * Complete API for Google Sheets:
 * - Scans and supports Class 1 to 10 sheets automatically.
 * - Extracts all student details (A-M) and all subject marks (including Maths).
 * - Dynamic Subject Column Detection (finds Maths wherever inserted in headers).
 * - Automatic Audit Logging (Cell Comments, End of Class Sheet Columns, & 'Information Sheet' Tab).
 * - Auto-detects Editor Phone/Device, Date/Time (IST), and Email without asking the user.
 * - Validates Marks <= Maximum Marks.
 * - Computes Totals, Grades, and Class Positions (First, Second, Half-Yearly, Third, Final).
 * ============================================================================
 */

const CONFIG = {
  COLUMNS: {
    SNO: 1,             // A
    SESSION: 2,         // B
    NIC_ID: 3,          // C
    SR_NO: 4,           // D
    ROLL_NO: 5,         // E
    ADHAR_NO: 6,        // F
    CLASS_NAME: 7,      // G
    STUDENT_NAME: 8,    // H
    FATHER_NAME: 9,     // I
    MOTHER_NAME: 10,    // J
    DOB: 11,            // K
    GENDER: 12,         // L
    CATEGORY: 13        // M
  },

  SUBJECT_TEMPLATES: [
    {
      id: 'hindi',
      name: 'Hindi',
      keywords: ['hindi', 'हिन्दी', 'हिंदी'],
      type: 'standard',
      defaultMax: { firstTest: 10, secondTest: 10, halfYearly: 70, thirdTest: 10, annualExam: 100, total: 200 }
    },
    {
      id: 'english',
      name: 'English',
      keywords: ['english', 'अंग्रेजी'],
      type: 'standard',
      defaultMax: { firstTest: 10, secondTest: 10, halfYearly: 70, thirdTest: 10, annualExam: 100, total: 200 }
    },
    {
      id: 'sanskrit',
      name: 'Sanskart',
      keywords: ['sanskart', 'sanskrit', 'संस्कृत'],
      type: 'standard',
      defaultMax: { firstTest: 10, secondTest: 10, halfYearly: 70, thirdTest: 10, annualExam: 100, total: 200 }
    },
    {
      id: 'science',
      name: 'Science',
      keywords: ['science', 'विज्ञान'],
      excludeKeywords: ['social'],
      type: 'standard',
      defaultMax: { firstTest: 10, secondTest: 10, halfYearly: 70, thirdTest: 10, annualExam: 100, total: 200 }
    },
    {
      id: 'maths',
      name: 'Mathematics',
      keywords: ['math', 'maths', 'mathematics', 'गणित'],
      type: 'standard',
      defaultMax: { firstTest: 10, secondTest: 10, halfYearly: 70, thirdTest: 10, annualExam: 100, total: 200 }
    },
    {
      id: 'socialScience',
      name: 'Social Science',
      keywords: ['social science', 'social', 'सामाजिक विज्ञान', 'sst'],
      type: 'standard',
      defaultMax: { firstTest: 10, secondTest: 10, halfYearly: 70, thirdTest: 10, annualExam: 100, total: 200 }
    },
    {
      id: 'physicalEducation',
      name: 'Physical and Health Education',
      keywords: ['physical', 'health education', 'phe', 'शारीरिक शिक्षा', 'health'],
      type: 'theory_practical',
      defaultMax: {
        firstTest: { theo: 10, prac: 8 },
        secondTest: { theo: 10, prac: 7 },
        halfYearly: { theo: 25, prac: 10 },
        thirdTest: { theo: 15, prac: 10 },
        annualExam: { theo: 70, prac: 30 },
        total: 200
      }
    },
    {
      id: 'itConcept',
      name: 'Concept of Information Technology',
      keywords: ['information technology', 'concept of info', 'it concept', 'it', 'सूचना प्रौद्योगिकी', 'computer'],
      type: 'theory_practical',
      defaultMax: {
        firstTest: { theo: 10, prac: 0 },
        secondTest: { theo: 10, prac: 0 },
        halfYearly: { theo: 50, prac: 20 },
        thirdTest: { theo: 10, prac: 0 },
        annualExam: { theo: 70, prac: 30 },
        total: 200
      }
    },
    {
      id: 'supw',
      name: 'Socially Useful Productive Work and Social Service',
      keywords: ['supw', 'socially useful', 'स.उ.उ.का', 'productive work'],
      type: 'standard',
      defaultMax: { firstTest: 25, secondTest: 0, halfYearly: 45, thirdTest: 0, annualExam: 30, total: 100 }
    },
    {
      id: 'artEducation',
      name: 'Art Education',
      keywords: ['art education', 'art', 'कला शिक्षा', 'drawing'],
      type: 'standard',
      defaultMax: { firstTest: 25, secondTest: 0, halfYearly: 60, thirdTest: 0, annualExam: 15, total: 100 }
    }
  ]
};

/**
 * Handle GET requests
 */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getStudents';
    const className = (e && e.parameter && e.parameter.className) ? e.parameter.className : '9th';

    if (action === 'getClasses') {
      const classes = getAvailableClasses();
      return createJsonResponse({ status: 'success', data: classes });
    }

    if (action === 'getStudents') {
      const result = getStudentsData(className);
      return createJsonResponse({ status: 'success', data: result });
    }

    if (action === 'verifyTeacher') {
      const name = (e && e.parameter && e.parameter.name) ? e.parameter.name : '';
      const mobile = (e && e.parameter && e.parameter.mobile) ? e.parameter.mobile : '';
      const result = verifyTeacher(name, mobile);
      return createJsonResponse(result);
    }

    if (action === 'sendTeacherOtp') {
      const name = (e && e.parameter && e.parameter.name) ? e.parameter.name : '';
      const email = (e && e.parameter && e.parameter.email) ? e.parameter.email : '';
      const result = sendTeacherOtp(name, email);
      return createJsonResponse(result);
    }

    if (action === 'verifyTeacherOtp') {
      const email = (e && e.parameter && e.parameter.email) ? e.parameter.email : '';
      const otp = (e && e.parameter && e.parameter.otp) ? e.parameter.otp : '';
      const result = verifyTeacherOtp(email, otp);
      return createJsonResponse(result);
    }

    if (action === 'getStaffList') {
      const staff = getStaffMembers();
      return createJsonResponse({ status: 'success', data: staff });
    }

    if (action === 'ping') {
      return createJsonResponse({ status: 'success', message: 'AVM Marksheet API Online' });
    }

    return createJsonResponse({ status: 'error', message: 'Unknown action: ' + action });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Handle POST requests
 */
function doPost(e) {
  try {
    let payload;
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      payload = e.parameter;
    } else {
      payload = {};
    }

    const action = payload.action || 'saveMarks';
    const className = payload.className || '9th';

    if (action === 'saveMarks') {
      const result = saveStudentMarks(className, payload.studentId, payload.examKey, payload.marks, payload.audit);
      return createJsonResponse(result);
    }

    if (action === 'verifyTeacher') {
      const name = payload.name || payload.employeeName || '';
      const mobile = payload.mobile || payload.mobileNumber || '';
      const result = verifyTeacher(name, mobile);
      return createJsonResponse(result);
    }

    if (action === 'sendTeacherOtp') {
      const name = payload.name || payload.employeeName || '';
      const email = payload.email || payload.emailId || '';
      const result = sendTeacherOtp(name, email);
      return createJsonResponse(result);
    }

    if (action === 'verifyTeacherOtp') {
      const email = payload.email || payload.emailId || '';
      const otp = payload.otp || '';
      const result = verifyTeacherOtp(email, otp);
      return createJsonResponse(result);
    }

    if (action === 'recalculateRanks') {
      const sheet = getSheetByClass(className);
      const layout = resolveSheetLayout(sheet);
      recalculateAllClassPositions(sheet, layout);
      return createJsonResponse({ status: 'success', message: 'Class positions recalculated successfully' });
    }

    return createJsonResponse({ status: 'error', message: 'Unknown action: ' + action });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Get all available class tabs in the workbook and check student count
 */
function getAvailableClasses() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  const classesList = [];

  for (let c = 1; c <= 10; c++) {
    const classNum = c;
    const tabVariants = [
      c + 'th', c + 'st', c + 'nd', c + 'rd',
      String(c),
      'Class ' + c,
      'class ' + c
    ];

    let foundSheet = null;
    for (let i = 0; i < sheets.length; i++) {
      const sName = sheets[i].getName().trim().toLowerCase();
      // Skip system sheets
      if (sName === 'information sheet' || sName === 'audit log') continue;

      for (let v = 0; v < tabVariants.length; v++) {
        if (sName === tabVariants[v].toLowerCase()) {
          foundSheet = sheets[i];
          break;
        }
      }
      if (foundSheet) break;
    }

    let studentCount = 0;
    let sheetName = c + (c === 1 ? 'st' : c === 2 ? 'nd' : c === 3 ? 'rd' : 'th');

    if (foundSheet) {
      sheetName = foundSheet.getName();
      const lastRow = foundSheet.getLastRow();
      const startRow = getDataStartRow(foundSheet);
      if (lastRow >= startRow) {
        const names = foundSheet.getRange(startRow, CONFIG.COLUMNS.STUDENT_NAME, lastRow - startRow + 1, 1).getValues();
        for (let k = 0; k < names.length; k++) {
          const val = (names[k][0] || '').toString().trim();
          if (val && !val.toLowerCase().includes('student') && !val.toLowerCase().includes('name')) {
            studentCount++;
          }
        }
      }
    }

    classesList.push({
      classNum: classNum,
      tabName: sheetName,
      hasSheet: !!foundSheet,
      studentCount: studentCount,
      isReady: studentCount > 0
    });
  }

  return classesList;
}

/**
 * Helper: Find start row of data (Row 3 for Hardik Gehlot or Row 4)
 */
function getDataStartRow(sheet) {
  const row3Val = (sheet.getRange(3, CONFIG.COLUMNS.STUDENT_NAME).getValue() || '').toString().trim();
  if (row3Val && !row3Val.toLowerCase().includes('name') && !row3Val.toLowerCase().includes('student')) {
    return 3;
  }
  return 4;
}

/**
 * Find sheet by class name
 */
function getSheetByClass(className) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(className);
  if (!sheet) {
    const normalized = className.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
    const sheets = ss.getSheets();
    for (let i = 0; i < sheets.length; i++) {
      const sName = sheets[i].getName().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (sName === normalized || sName === normalized + 'th' || sName === 'class' + normalized) {
        sheet = sheets[i];
        break;
      }
    }
  }
  if (!sheet) {
    throw new Error('Sheet tab for "' + className + '" not found in Google Sheet.');
  }
  return sheet;
}

/**
 * DYNAMIC HEADER DETECTION
 * Dynamically detects exact start column for every subject from Row 1 and Row 2.
 * Prevents any subject column collision (e.g. Sanskart vs Art, Science vs Social Science).
 */
function resolveSheetLayout(sheet) {
  const lastCol = Math.max(sheet.getLastColumn(), 200);
  const row1Values = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const row2Values = sheet.getRange(2, 1, 1, lastCol).getValues()[0];

  function findCol(keywords, excludeKeywords) {
    for (let c = 13; c < row1Values.length; c++) {
      const v1 = (row1Values[c] || '').toString().trim().toLowerCase();
      const v2 = (row2Values[c] || '').toString().trim().toLowerCase();
      const text = v1 + ' ' + v2;
      if (!text.trim()) continue;

      let match = false;
      for (let k = 0; k < keywords.length; k++) {
        if (text.includes(keywords[k])) {
          match = true;
          break;
        }
      }

      if (match && excludeKeywords) {
        for (let e = 0; e < excludeKeywords.length; e++) {
          if (text.includes(excludeKeywords[e])) {
            match = false;
            break;
          }
        }
      }

      if (match) {
        return c + 1; // 1-indexed column
      }
    }
    return -1;
  }

  // 1. Detect dynamic column positions
  const colHindi = findCol(['hindi', 'हिन्दी', 'हिंदी']);
  const colEnglish = findCol(['english', 'अंग्रेजी']);
  const colSanskrit = findCol(['sanskrit', 'sanskart', 'संस्कृत']);
  const colScience = findCol(['science', 'विज्ञान'], ['social', 'सामाजिक']);
  const colMaths = findCol(['math', 'maths', 'mathematics', 'गणित']);
  const colSocial = findCol(['social science', 'social', 'सामाजिक', 'sst']);
  const colPHE = findCol(['physical and health', 'physical', 'health education', 'phe', 'शारीरिक']);
  const colIT = findCol(['concept of information', 'information technology', 'it concept', 'सूचना']);
  const colSUPW = findCol(['socially useful', 'productive work', 'supw', 'स.उ.उ.का']);
  const colArt = findCol(['art education', 'कला शिक्षा', 'drawing'], ['sanskart', 'sanskrit']);
  const colPos = findCol(['class position', 'final position', 'position', 'स्थान']);

  // 2. Safe Fallbacks: Original verified spreadsheet columns
  const baseHindi = colHindi !== -1 ? colHindi : 14;
  const baseEnglish = colEnglish !== -1 ? colEnglish : 27;
  const baseSanskrit = colSanskrit !== -1 ? colSanskrit : 40;
  const baseScience = colScience !== -1 ? colScience : 53;
  const baseSocial = colSocial !== -1 ? colSocial : 66;
  const basePHE = colPHE !== -1 ? colPHE : 79;
  const baseIT = colIT !== -1 ? colIT : 102;
  const baseSUPW = colSUPW !== -1 ? colSUPW : 125;
  const baseArt = colArt !== -1 ? colArt : 138;
  const basePos = colPos !== -1 ? colPos : 151;

  // Maths placement: If found in headers, use exact column; otherwise safe offset at 156
  const baseMaths = colMaths !== -1 ? colMaths : (basePos + 5);

  const subjectConfigs = [
    { id: 'hindi', name: 'Hindi', type: 'standard', startCol: baseHindi, defaultMax: { firstTest: 10, secondTest: 10, halfYearly: 70, thirdTest: 10, annualExam: 100, total: 200 } },
    { id: 'english', name: 'English', type: 'standard', startCol: baseEnglish, defaultMax: { firstTest: 10, secondTest: 10, halfYearly: 70, thirdTest: 10, annualExam: 100, total: 200 } },
    { id: 'sanskrit', name: 'Sanskart', type: 'standard', startCol: baseSanskrit, defaultMax: { firstTest: 10, secondTest: 10, halfYearly: 70, thirdTest: 10, annualExam: 100, total: 200 } },
    { id: 'science', name: 'Science', type: 'standard', startCol: baseScience, defaultMax: { firstTest: 10, secondTest: 10, halfYearly: 70, thirdTest: 10, annualExam: 100, total: 200 } },
    { id: 'maths', name: 'Mathematics', type: 'standard', startCol: baseMaths, defaultMax: { firstTest: 10, secondTest: 10, halfYearly: 70, thirdTest: 10, annualExam: 100, total: 200 } },
    { id: 'socialScience', name: 'Social Science', type: 'standard', startCol: baseSocial, defaultMax: { firstTest: 10, secondTest: 10, halfYearly: 70, thirdTest: 10, annualExam: 100, total: 200 } },
    {
      id: 'physicalEducation',
      name: 'Physical and Health Education',
      type: 'theory_practical',
      startCol: basePHE,
      defaultMax: { firstTest: { theo: 10, prac: 8 }, secondTest: { theo: 10, prac: 7 }, halfYearly: { theo: 25, prac: 10 }, thirdTest: { theo: 15, prac: 10 }, annualExam: { theo: 70, prac: 30 }, total: 200 }
    },
    {
      id: 'itConcept',
      name: 'Concept of Information Technology',
      type: 'theory_practical',
      startCol: baseIT,
      defaultMax: { firstTest: { theo: 10, prac: 0 }, secondTest: { theo: 10, prac: 0 }, halfYearly: { theo: 50, prac: 20 }, thirdTest: { theo: 10, prac: 0 }, annualExam: { theo: 70, prac: 30 }, total: 200 }
    },
    { id: 'supw', name: 'Socially Useful Productive Work and Social Service', type: 'standard', startCol: baseSUPW, defaultMax: { firstTest: 25, secondTest: 0, halfYearly: 45, thirdTest: 0, annualExam: 30, total: 100 } },
    { id: 'artEducation', name: 'Art Education', type: 'standard', startCol: baseArt, defaultMax: { firstTest: 25, secondTest: 0, halfYearly: 60, thirdTest: 0, annualExam: 15, total: 100 } }
  ];

  const subjects = [];
  subjectConfigs.forEach(function(s) {
    const isStd = (s.type === 'standard');
    const startCol = s.startCol;

    const subjDef = {
      id: s.id,
      name: s.name,
      type: s.type,
      startCol: startCol,
      defaultMax: s.defaultMax,
      cols: {}
    };

    if (isStd) {
      subjDef.cols = {
        firstTest:  { max: startCol,     obt: startCol + 1 },
        secondTest: { max: startCol + 2, obt: startCol + 3 },
        halfYearly: { max: startCol + 4, obt: startCol + 5 },
        thirdTest:  { max: startCol + 6, obt: startCol + 7 },
        annualExam: { max: startCol + 8, obt: startCol + 9 },
        totalMarks: { max: startCol + 10, obt: startCol + 11 },
        grade: startCol + 12
      };
    } else {
      subjDef.cols = {
        firstTest:  { theoMax: startCol,      theoObt: startCol + 1,  pracMax: startCol + 2,  pracObt: startCol + 3 },
        secondTest: { theoMax: startCol + 4,  theoObt: startCol + 5,  pracMax: startCol + 6,  pracObt: startCol + 7 },
        halfYearly: { theoMax: startCol + 8,  theoObt: startCol + 9,  pracMax: startCol + 10, pracObt: startCol + 11 },
        thirdTest:  { theoMax: startCol + 12, theoObt: startCol + 13, pracMax: startCol + 14, pracObt: startCol + 15 },
        annualExam: { theoMax: startCol + 16, theoObt: startCol + 17, pracMax: startCol + 18, pracObt: startCol + 19 },
        totalMarks: { max: startCol + 20, obt: startCol + 21 },
        grade: startCol + 22
      };
    }
    subjects.push(subjDef);
  });

  const positions = {
    firstTest: basePos,
    secondTest: basePos + 1,
    halfYearly: basePos + 2,
    thirdTest: basePos + 3,
    final: basePos + 4
  };

  // 4. Locate or define End-of-Sheet Audit Columns
  let auditCol = -1;
  for (let c = basePos + 5; c < row1Values.length; c++) {
    const val1 = (row1Values[c] || '').toString().toLowerCase();
    if (val1.includes('audit') || val1.includes('last modified')) {
      auditCol = c + 1;
      break;
    }
  }
  if (auditCol === -1) {
    auditCol = Math.max(basePos + 6, baseMaths + 14);
  }

  const auditColumns = {
    startCol: auditCol,
    lastModified: auditCol,
    modifiedBy: auditCol + 1,
    device: auditCol + 2,
    macAddress: auditCol + 3,
    deviceId: auditCol + 4,
    ipLocation: auditCol + 5,
    specs: auditCol + 6,
    changesSummary: auditCol + 7
  };

  return {
    subjects: subjects,
    positions: positions,
    auditColumns: auditColumns,
    maxCol: Math.max(lastCol, auditCol + 8)
  };
}

/**
 * Fetch all students from sheet with all subject marks (including Maths)
 */
function getStudentsData(className) {
  const sheet = getSheetByClass(className);
  const layout = resolveSheetLayout(sheet);
  const startRow = getDataStartRow(sheet);
  const lastRow = sheet.getLastRow();
  const lastCol = layout.maxCol;

  if (lastRow < startRow) {
    return { students: [], count: 0, className: className };
  }

  const numRows = lastRow - startRow + 1;
  const values = sheet.getRange(startRow, 1, numRows, lastCol).getValues();
  const students = [];

  for (let r = 0; r < values.length; r++) {
    const row = values[r];
    const rowNumber = startRow + r;

    const studentName = (row[CONFIG.COLUMNS.STUDENT_NAME - 1] || '').toString().trim();
    if (!studentName || studentName.toLowerCase().includes('student')) continue;

    const student = {
      rowNumber: rowNumber,
      sno: row[CONFIG.COLUMNS.SNO - 1] || (students.length + 1),
      session: (row[CONFIG.COLUMNS.SESSION - 1] || '').toString(),
      nicId: (row[CONFIG.COLUMNS.NIC_ID - 1] || '').toString(),
      srNo: (row[CONFIG.COLUMNS.SR_NO - 1] || '').toString().trim(),
      rollNo: formatCleanId(row[CONFIG.COLUMNS.ROLL_NO - 1]),
      adharNo: formatCleanId(row[CONFIG.COLUMNS.ADHAR_NO - 1]),
      className: (row[CONFIG.COLUMNS.CLASS_NAME - 1] || className).toString(),
      studentName: studentName,
      fatherName: (row[CONFIG.COLUMNS.FATHER_NAME - 1] || '').toString(),
      motherName: (row[CONFIG.COLUMNS.MOTHER_NAME - 1] || '').toString(),
      dob: formatDate(row[CONFIG.COLUMNS.DOB - 1]),
      gender: (row[CONFIG.COLUMNS.GENDER - 1] || '').toString(),
      category: (row[CONFIG.COLUMNS.CATEGORY - 1] || '').toString(),

      positions: {
        firstPeriodic: row[layout.positions.firstTest - 1] !== '' ? row[layout.positions.firstTest - 1] : '',
        secondPeriodic: row[layout.positions.secondTest - 1] !== '' ? row[layout.positions.secondTest - 1] : '',
        halfYearly: row[layout.positions.halfYearly - 1] !== '' ? row[layout.positions.halfYearly - 1] : '',
        thirdPeriodic: row[layout.positions.thirdTest - 1] !== '' ? row[layout.positions.thirdTest - 1] : '',
        finalPosition: row[layout.positions.final - 1] !== '' ? row[layout.positions.final - 1] : ''
      },

      subjects: {}
    };

    layout.subjects.forEach(function(subj) {
      student.subjects[subj.id] = {
        name: subj.name,
        type: subj.type,
        firstTest:  extractExamMarks(row, subj, 'firstTest'),
        secondTest: extractExamMarks(row, subj, 'secondTest'),
        halfYearly: extractExamMarks(row, subj, 'halfYearly'),
        thirdTest:  extractExamMarks(row, subj, 'thirdTest'),
        annualExam: extractExamMarks(row, subj, 'annualExam'),
        totalMarks: {
          max: getSafeNumericMax(row[subj.cols.totalMarks.max - 1], subj.defaultMax ? subj.defaultMax.total : 200),
          obt: row[subj.cols.totalMarks.obt - 1] !== '' ? row[subj.cols.totalMarks.obt - 1] : ''
        },
        grade: (row[subj.cols.grade - 1] || '').toString()
      };
    });

    students.push(student);
  }

  return {
    className: className,
    count: students.length,
    students: students
  };
}

function extractExamMarks(row, subj, examKey) {
  const colDef = subj.cols[examKey];
  if (!colDef) return {};

  if (subj.type === 'standard') {
    const defaultVal = subj.defaultMax ? subj.defaultMax[examKey] : 10;
    return {
      max: getSafeNumericMax(row[colDef.max - 1], defaultVal),
      obt: row[colDef.obt - 1] !== '' ? row[colDef.obt - 1] : ''
    };
  } else {
    const defaultTheo = (subj.defaultMax && subj.defaultMax[examKey]) ? subj.defaultMax[examKey].theo : 10;
    const defaultPrac = (subj.defaultMax && subj.defaultMax[examKey]) ? subj.defaultMax[examKey].prac : 0;
    return {
      theoMax: getSafeNumericMax(row[colDef.theoMax - 1], defaultTheo),
      theoObt: row[colDef.theoObt - 1] !== '' ? row[colDef.theoObt - 1] : '',
      pracMax: getSafeNumericMax(row[colDef.pracMax - 1], defaultPrac),
      pracObt: row[colDef.pracObt - 1] !== '' ? row[colDef.pracObt - 1] : ''
    };
  }
}

function getSafeNumericMax(cellVal, fallbackVal) {
  if (typeof cellVal === 'number' && !isNaN(cellVal) && cellVal >= 0) return cellVal;
  const p = Number(cellVal);
  if (!isNaN(p) && p >= 0 && cellVal !== '') return p;
  return fallbackVal;
}

/**
 * SAVE STUDENT MARKS
 * With Cell Comment Audit, End-of-Sheet Row Audit, and 'Information Sheet' tab logging.
 * Direct pick - no user input required.
 */
function saveStudentMarks(className, studentId, examKey, marksMap, clientAudit) {
  const sheet = getSheetByClass(className);
  const layout = resolveSheetLayout(sheet);
  const startRow = getDataStartRow(sheet);
  const lastRow = sheet.getLastRow();
  const lastCol = layout.maxCol;

  if (lastRow < startRow) {
    return { status: 'error', message: 'No students found in sheet' };
  }

  const numRows = lastRow - startRow + 1;
  const values = sheet.getRange(startRow, 1, numRows, lastCol).getValues();

  let targetRowIdx = -1;
  for (let i = 0; i < values.length; i++) {
    const rNum = startRow + i;
    const nicId = (values[i][CONFIG.COLUMNS.NIC_ID - 1] || '').toString();
    const srNo = (values[i][CONFIG.COLUMNS.SR_NO - 1] || '').toString();

    if (studentId == rNum || studentId == nicId || studentId == srNo) {
      targetRowIdx = i;
      break;
    }
  }

  if (targetRowIdx === -1) {
    return { status: 'error', message: 'Student not found in sheet: ' + studentId };
  }

  const studentRow = values[targetRowIdx];
  const actualSheetRow = startRow + targetRowIdx;
  const studentName = (studentRow[CONFIG.COLUMNS.STUDENT_NAME - 1] || '').toString();
  const studentSrNo = (studentRow[CONFIG.COLUMNS.SR_NO - 1] || '').toString();

  // 1. Prepare Telemetry / Audit Details (Direct Pick - No User Input)
  const audit = clientAudit || {};
  const deviceInfo = audit.device || 'Mobile Browser';
  const phoneModel = audit.phoneModel || deviceInfo;
  const macAddress = audit.macAddress || 'N/A';
  const deviceId = audit.deviceId || 'N/A';
  const ipAddress = audit.ip || 'Direct WebApp Session';
  const ispName = audit.isp || '';
  const locationInfo = audit.location || 'India';
  const hardwareSpecs = audit.specs || 'Standard Screen';
  const batteryStatus = audit.battery || 'Normal';
  const securityToken = audit.fingerprint || 'FP-TOKEN';
  const timestampIST = audit.timestamp || Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd-MMM-yyyy hh:mm:ss a');
  
  // Teacher credentials from verified login
  const teacherName = audit.teacherName || audit.editorName || '';
  const teacherId = audit.teacherId || '';
  const teacherDesignation = audit.teacherDesignation || audit.designation || '';

  // Resolve editor email: active user session, effective user, or client-provided identity
  let editorEmail = '';
  try {
    editorEmail = Session.getActiveUser().getEmail();
  } catch (e) {}
  if (!editorEmail) {
    try {
      editorEmail = Session.getEffectiveUser().getEmail();
    } catch (e) {}
  }
  if (!editorEmail && audit.email) {
    editorEmail = audit.email;
  }
  if (!editorEmail) {
    editorEmail = 'Teacher (Mobile Web App)';
  }

  const modifiedChanges = [];

  // 2. Process each subject's marks
  layout.subjects.forEach(function(subj) {
    const input = marksMap[subj.id];
    if (!input) return;
    const colDef = subj.cols[examKey];
    if (!colDef) return;

    if (subj.type === 'standard') {
      const defaultMax = subj.defaultMax ? subj.defaultMax[examKey] : 100;
      const maxMarks = getSafeNumericMax(studentRow[colDef.max - 1], defaultMax);
      let rawVal = input.obt;

      if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '') {
        let obtMarks = Number(rawVal);
        if (!isNaN(obtMarks)) {
          if (obtMarks > maxMarks) obtMarks = maxMarks;
          if (obtMarks < 0) obtMarks = 0;

          const prevVal = studentRow[colDef.obt - 1];

          // ALWAYS WRITE VALUE DIRECTLY TO GOOGLE SHEET
          sheet.getRange(actualSheetRow, colDef.obt).setValue(obtMarks);
          studentRow[colDef.obt - 1] = obtMarks;

          // Add cell comment / note with FULL forensic audit trail
          addCellAuditNote(sheet.getRange(actualSheetRow, colDef.obt), timestampIST, (prevVal !== '' && prevVal !== null) ? prevVal : '-', obtMarks, audit, examKey, subj.name, editorEmail, teacherName, teacherId, teacherDesignation);

          modifiedChanges.push({
            subject: subj.name,
            prevMarks: (prevVal !== '' && prevVal !== null) ? prevVal : '-',
            newMarks: obtMarks
          });
        }
      } else {
        const prevVal = studentRow[colDef.obt - 1];
        if (prevVal !== '' && prevVal !== null) {
          sheet.getRange(actualSheetRow, colDef.obt).setValue('');
          studentRow[colDef.obt - 1] = '';
          addCellAuditNote(sheet.getRange(actualSheetRow, colDef.obt), timestampIST, prevVal, 'Cleared', audit, examKey, subj.name, editorEmail, teacherName, teacherId, teacherDesignation);
          modifiedChanges.push({
            subject: subj.name,
            prevMarks: prevVal,
            newMarks: 'Cleared'
          });
        }
      }
    } else {
      // Dual Theory + Practical
      const defaultTheo = (subj.defaultMax && subj.defaultMax[examKey]) ? subj.defaultMax[examKey].theo : 0;
      const defaultPrac = (subj.defaultMax && subj.defaultMax[examKey]) ? subj.defaultMax[examKey].prac : 0;
      const theoMax = getSafeNumericMax(studentRow[colDef.theoMax - 1], defaultTheo);
      const pracMax = getSafeNumericMax(studentRow[colDef.pracMax - 1], defaultPrac);

      let rawTheo = input.theoObt;
      let rawPrac = input.pracObt;

      // Update Theory
      if (rawTheo !== undefined && rawTheo !== null && String(rawTheo).trim() !== '') {
        let theoObt = Number(rawTheo);
        if (!isNaN(theoObt)) {
          if (theoObt > theoMax) theoObt = theoMax;
          if (theoObt < 0) theoObt = 0;

          const prevTheo = studentRow[colDef.theoObt - 1];

          // ALWAYS WRITE DIRECTLY TO GOOGLE SHEET
          sheet.getRange(actualSheetRow, colDef.theoObt).setValue(theoObt);
          studentRow[colDef.theoObt - 1] = theoObt;

          addCellAuditNote(sheet.getRange(actualSheetRow, colDef.theoObt), timestampIST, (prevTheo !== '' && prevTheo !== null) ? prevTheo : '-', theoObt, audit, examKey + ' (Theory)', subj.name, editorEmail, teacherName, teacherId, teacherDesignation);
          modifiedChanges.push({
            subject: subj.name + ' (Theory)',
            prevMarks: (prevTheo !== '' && prevTheo !== null) ? prevTheo : '-',
            newMarks: theoObt
          });
        }
      } else {
        const prevTheo = studentRow[colDef.theoObt - 1];
        if (prevTheo !== '' && prevTheo !== null) {
          sheet.getRange(actualSheetRow, colDef.theoObt).setValue('');
          studentRow[colDef.theoObt - 1] = '';
          addCellAuditNote(sheet.getRange(actualSheetRow, colDef.theoObt), timestampIST, prevTheo, 'Cleared', audit, examKey + ' (Theory)', subj.name, editorEmail, teacherName, teacherId, teacherDesignation);
        }
      }

      // Update Practical
      if (rawPrac !== undefined && rawPrac !== null && String(rawPrac).trim() !== '') {
        let pracObt = Number(rawPrac);
        if (!isNaN(pracObt)) {
          if (pracObt > pracMax) pracObt = pracMax;
          if (pracObt < 0) pracObt = 0;

          const prevPrac = studentRow[colDef.pracObt - 1];

          // ALWAYS WRITE DIRECTLY TO GOOGLE SHEET
          sheet.getRange(actualSheetRow, colDef.pracObt).setValue(pracObt);
          studentRow[colDef.pracObt - 1] = pracObt;

          addCellAuditNote(sheet.getRange(actualSheetRow, colDef.pracObt), timestampIST, (prevPrac !== '' && prevPrac !== null) ? prevPrac : '-', pracObt, audit, examKey + ' (Practical)', subj.name, editorEmail, teacherName, teacherId, teacherDesignation);
          modifiedChanges.push({
            subject: subj.name + ' (Practical)',
            prevMarks: (prevPrac !== '' && prevPrac !== null) ? prevPrac : '-',
            newMarks: pracObt
          });
        }
      } else {
        const prevPrac = studentRow[colDef.pracObt - 1];
        if (prevPrac !== '' && prevPrac !== null) {
          sheet.getRange(actualSheetRow, colDef.pracObt).setValue('');
          studentRow[colDef.pracObt - 1] = '';
          addCellAuditNote(sheet.getRange(actualSheetRow, colDef.pracObt), timestampIST, prevPrac, 'Cleared', audit, examKey + ' (Practical)', subj.name, editorEmail, teacherName, teacherId, teacherDesignation);
        }
      }
    }
  });

  // 3. Update Totals & Grades for all subjects
  updateStudentTotalsAndGrades(sheet, actualSheetRow, studentRow, layout);

  // 4. Recalculate Class Positions across the entire class
  recalculateAllClassPositions(sheet, layout);

  // 5. Update End-of-Sheet Row Audit Columns (8 Columns)
  const changesSummary = modifiedChanges.length > 0 
    ? modifiedChanges.map(function(m) { return m.subject + ': ' + m.newMarks; }).join('; ')
    : 'Marks Verified/Saved';

  const teacherAuditSummary = teacherName 
    ? (teacherName + (teacherId ? ' [' + teacherId + ']' : '') + (teacherDesignation ? ' (' + teacherDesignation + ')' : ''))
    : editorEmail;

  ensureAuditHeadersExist(sheet, layout);
  sheet.getRange(actualSheetRow, layout.auditColumns.startCol, 1, 8).setValues([
    [
      timestampIST,
      teacherAuditSummary,
      editorEmail,
      phoneModel,
      macAddress,
      deviceId,
      ipAddress + (ispName ? ' (' + ispName + ')' : '') + ' [' + locationInfo + ']',
      changesSummary
    ]
  ]);

  // 6. Log to 'Information Sheet' tab (Full Forensic Columns)
  if (modifiedChanges.length > 0) {
    logToInformationSheet(SpreadsheetApp.getActiveSpreadsheet(), {
      timestamp: timestampIST,
      className: className,
      teacherName: teacherName,
      teacherId: teacherId,
      teacherDesignation: teacherDesignation,
      srNo: studentSrNo,
      studentName: studentName,
      examKey: examKey,
      device: phoneModel,
      macAddress: macAddress,
      deviceId: deviceId,
      ip: ipAddress + (ispName ? ' (' + ispName + ')' : ''),
      location: locationInfo,
      fingerprint: securityToken,
      specs: hardwareSpecs + ' | ' + batteryStatus,
      email: editorEmail,
      changes: modifiedChanges
    });
  }

  SpreadsheetApp.flush();

  return {
    status: 'success',
    message: 'Marks saved! Full forensic audit (MAC, IP, Device ID, Cell Comments) logged.',
    rowNumber: actualSheetRow,
    changesCount: modifiedChanges.length,
    macAddress: macAddress,
    deviceId: deviceId,
    ip: ipAddress
  };
}

/**
 * Add / Append Complete Forensic Cell Note (Comment) to Sheet
 */
function addCellAuditNote(cell, timestamp, prevVal, newVal, audit, examName, subjName, email, teacherName, teacherId, designation) {
  try {
    const existingNote = cell.getNote() || '';
    const teacherDisplay = teacherName 
      ? (teacherName + (teacherId ? ' [' + teacherId + ']' : '') + (designation ? ' (' + designation + ')' : ''))
      : 'Authorized Staff';

    const noteLines = [
      '[' + timestamp + ']',
      'Teacher: ' + teacherDisplay,
      'Subject: ' + subjName + ' (' + examName + ')',
      'Marks: ' + prevVal + ' ➔ ' + newVal,
      '----------------------------------------',
      'Phone/Device: ' + (audit.phoneModel || audit.device || 'Mobile Device'),
      'Device ID: ' + (audit.deviceId || 'DEV-N/A') + (audit.fingerprint ? ' (' + audit.fingerprint + ')' : ''),
      'Editor Email: ' + email,
      'MAC Address: ' + (audit.macAddress || 'N/A'),
      'IP Address: ' + (audit.ip || 'Direct WebApp') + (audit.isp ? ' (' + audit.isp + ')' : ''),
      'Location: ' + (audit.location || 'India'),
      'Hardware Specs: ' + (audit.specs || 'Standard Screen'),
      'Battery Status: ' + (audit.battery || 'Normal')
    ];

    const newNote = noteLines.join('\n');
    const fullNote = existingNote ? (existingNote + '\n========================================\n' + newNote) : newNote;
    cell.setNote(fullNote);
  } catch (err) {
    Logger.log('Note setting error: ' + err);
  }
}

/**
 * Ensure 8 Audit Columns Header exists at the end of the class sheet
 */
function ensureAuditHeadersExist(sheet, layout) {
  try {
    const headerCell = sheet.getRange(1, layout.auditColumns.startCol).getValue();
    if (!headerCell || !headerCell.toString().toLowerCase().includes('audit')) {
      const headers = [
        'Audit: Last Modified (IST)',
        'Audit: Teacher Name & ID',
        'Audit: Editor Email',
        'Audit: Phone / Device Model',
        'Audit: MAC Address',
        'Audit: Device UUID',
        'Audit: IP & Location',
        'Audit: Changes Summary'
      ];
      sheet.getRange(1, layout.auditColumns.startCol, 1, headers.length).setValues([headers])
        .setBackground('#1e3a8a')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
    }
  } catch (e) {}
}

/**
 * Append complete audit entries to dedicated 'Information Sheet' tab (Full Forensic Columns)
 */
function logToInformationSheet(ss, data) {
  try {
    let infoSheet = ss.getSheetByName('Information Sheet');
    const headers = [
      'Timestamp (IST)',
      'Class',
      'Teacher Name',
      'Teacher ID',
      'Teacher Designation',
      'Student SR No.',
      'Student Name',
      'Exam Name',
      'Subject',
      'Previous Marks',
      'New Marks Entered',
      'Device / Phone Model',
      'MAC Address',
      'Device UUID',
      'IP Address & ISP',
      'Location (City/State)',
      'Security Fingerprint',
      'Hardware Specs & Battery',
      'Editor Email ID'
    ];

    if (!infoSheet) {
      infoSheet = ss.insertSheet('Information Sheet');
      infoSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      infoSheet.getRange(1, 1, 1, headers.length)
        .setBackground('#1e3a8a')
        .setFontColor('#ffffff')
        .setFontWeight('bold')
        .setHorizontalAlignment('center');
      infoSheet.setFrozenRows(1);
    } else {
      const col3Header = infoSheet.getRange(1, 3).getValue();
      if (!col3Header || !String(col3Header).toLowerCase().includes('teacher')) {
        infoSheet.getRange(1, 1, 1, headers.length).setValues([headers])
          .setBackground('#1e3a8a')
          .setFontColor('#ffffff')
          .setFontWeight('bold')
          .setHorizontalAlignment('center');
        infoSheet.setFrozenRows(1);
      }
    }

    const examLabels = {
      firstTest: '1st Periodic Test',
      secondTest: '2nd Periodic Test',
      halfYearly: 'Half-Yearly Examination',
      thirdTest: '3rd Periodic Test',
      annualExam: 'Annual Examination'
    };
    const examDisplayName = examLabels[data.examKey] || data.examKey;

    const rowsToAppend = [];
    data.changes.forEach(function(c) {
      rowsToAppend.push([
        data.timestamp,
        data.className,
        data.teacherName || 'Authorized Staff',
        data.teacherId || 'TCH-001',
        data.teacherDesignation || '',
        data.srNo,
        data.studentName,
        examDisplayName,
        c.subject,
        c.prevMarks,
        c.newMarks,
        data.device,
        data.macAddress,
        data.deviceId,
        data.ip,
        data.location,
        data.fingerprint,
        data.specs,
        data.email
      ]);
    });

    if (rowsToAppend.length > 0) {
      const nextRow = infoSheet.getLastRow() + 1;
      infoSheet.getRange(nextRow, 1, rowsToAppend.length, headers.length).setValues(rowsToAppend);
    }
  } catch (err) {
    Logger.log('Information Sheet write error: ' + err);
  }
}

/**
 * Update totals and grades for each subject
 */
function updateStudentTotalsAndGrades(sheet, actualSheetRow, rowValues, layout) {
  layout.subjects.forEach(function(subj) {
    let totalObt = 0;
    let hasAnyMarks = false;
    const exams = ['firstTest', 'secondTest', 'halfYearly', 'thirdTest', 'annualExam'];

    exams.forEach(function(exKey) {
      const colDef = subj.cols[exKey];
      if (subj.type === 'standard') {
        const val = rowValues[colDef.obt - 1];
        if (val !== '' && val !== null && !isNaN(val)) {
          totalObt += Number(val);
          hasAnyMarks = true;
        }
      } else {
        const tVal = rowValues[colDef.theoObt - 1];
        const pVal = rowValues[colDef.pracObt - 1];
        if (tVal !== '' && tVal !== null && !isNaN(tVal)) {
          totalObt += Number(tVal);
          hasAnyMarks = true;
        }
        if (pVal !== '' && pVal !== null && !isNaN(pVal)) {
          totalObt += Number(pVal);
          hasAnyMarks = true;
        }
      }
    });

    if (hasAnyMarks) {
      sheet.getRange(actualSheetRow, subj.cols.totalMarks.obt).setValue(totalObt);
      rowValues[subj.cols.totalMarks.obt - 1] = totalObt;

      const totalMax = getSafeNumericMax(rowValues[subj.cols.totalMarks.max - 1], (subj.defaultMax ? subj.defaultMax.total : 200));
      const percentage = (totalObt / totalMax) * 100;
      const grade = computeGrade(percentage);

      sheet.getRange(actualSheetRow, subj.cols.grade).setValue(grade);
      rowValues[subj.cols.grade - 1] = grade;
    } else {
      sheet.getRange(actualSheetRow, subj.cols.totalMarks.obt).setValue('');
      sheet.getRange(actualSheetRow, subj.cols.grade).setValue('');
    }
  });
}

function computeGrade(percentage) {
  if (percentage >= 91) return 'A+';
  if (percentage >= 75) return 'A';
  if (percentage >= 60) return 'B';
  if (percentage >= 45) return 'C';
  if (percentage >= 33) return 'D';
  return 'E';
}

/**
 * Recalculate Class Positions (Columns EU to EY or dynamically located)
 */
function recalculateAllClassPositions(sheet, layout) {
  if (!layout) layout = resolveSheetLayout(sheet);
  const startRow = getDataStartRow(sheet);
  const lastRow = sheet.getLastRow();
  const lastCol = layout.maxCol;

  if (lastRow < startRow) return;

  const numRows = lastRow - startRow + 1;
  const values = sheet.getRange(startRow, 1, numRows, lastCol).getValues();

  const firstTestScores = [];
  const secondTestScores = [];
  const halfYearlyScores = [];
  const thirdTestScores = [];
  const finalScores = [];

  for (let r = 0; r < values.length; r++) {
    const row = values[r];
    const studentName = (row[CONFIG.COLUMNS.STUDENT_NAME - 1] || '').toString().trim();
    if (!studentName || studentName.toLowerCase().includes('student')) continue;

    let firstTotal = 0, hasFirst = false;
    let secondTotal = 0, hasSecond = false;
    let halfTotal = 0, hasHalf = false;
    let thirdTotal = 0, hasThird = false;
    let overallTotal = 0, hasAny = false;

    layout.subjects.forEach(function(subj) {
      const f1 = getExamScoreFromRow(row, subj, 'firstTest');
      if (f1.hasScore) { firstTotal += f1.score; hasFirst = true; }

      const f2 = getExamScoreFromRow(row, subj, 'secondTest');
      if (f2.hasScore) { secondTotal += f2.score; hasSecond = true; }

      const fh = getExamScoreFromRow(row, subj, 'halfYearly');
      if (fh.hasScore) { halfTotal += fh.score; hasHalf = true; }

      const f3 = getExamScoreFromRow(row, subj, 'thirdTest');
      if (f3.hasScore) { thirdTotal += f3.score; hasThird = true; }

      const totVal = row[subj.cols.totalMarks.obt - 1];
      if (totVal !== '' && totVal !== null && !isNaN(totVal)) {
        overallTotal += Number(totVal);
        hasAny = true;
      }
    });

    firstTestScores.push({ index: r, score: firstTotal, hasMarks: hasFirst });
    secondTestScores.push({ index: r, score: secondTotal, hasMarks: hasSecond });
    halfYearlyScores.push({ index: r, score: halfTotal, hasMarks: hasHalf });
    thirdTestScores.push({ index: r, score: thirdTotal, hasMarks: hasThird });
    finalScores.push({ index: r, score: overallTotal, hasMarks: hasAny });
  }

  const firstRanks = assignRanks(firstTestScores);
  const secondRanks = assignRanks(secondTestScores);
  const halfRanks = assignRanks(halfYearlyScores);
  const thirdRanks = assignRanks(thirdTestScores);
  const finalRanks = assignRanks(finalScores);

  const rankUpdates = [];
  for (let r = 0; r < values.length; r++) {
    rankUpdates.push([
      firstRanks[r] !== undefined ? firstRanks[r] : '',
      secondRanks[r] !== undefined ? secondRanks[r] : '',
      halfRanks[r] !== undefined ? halfRanks[r] : '',
      thirdRanks[r] !== undefined ? thirdRanks[r] : '',
      finalRanks[r] !== undefined ? finalRanks[r] : ''
    ]);
  }

  sheet.getRange(startRow, layout.positions.firstTest, rankUpdates.length, 5).setValues(rankUpdates);
}

function assignRanks(scoreList) {
  const active = scoreList.filter(function(item) { return item.hasMarks; });
  active.sort(function(a, b) { return b.score - a.score; });

  const ranksMap = {};
  let currentRank = 1;
  for (let i = 0; i < active.length; i++) {
    if (i > 0 && active[i].score < active[i - 1].score) {
      currentRank = i + 1;
    }
    ranksMap[active[i].index] = currentRank;
  }

  const result = {};
  scoreList.forEach(function(item) {
    result[item.index] = ranksMap[item.index] !== undefined ? ranksMap[item.index] : '';
  });
  return result;
}

function getExamScoreFromRow(row, subj, examKey) {
  const colDef = subj.cols[examKey];
  let sum = 0;
  let hasScore = false;

  if (subj.type === 'standard') {
    const val = row[colDef.obt - 1];
    if (val !== '' && val !== null && !isNaN(val)) {
      sum += Number(val);
      hasScore = true;
    }
  } else {
    const tVal = row[colDef.theoObt - 1];
    const pVal = row[colDef.pracObt - 1];
    if (tVal !== '' && tVal !== null && !isNaN(tVal)) {
      sum += Number(tVal);
      hasScore = true;
    }
    if (pVal !== '' && pVal !== null && !isNaN(pVal)) {
      sum += Number(pVal);
      hasScore = true;
    }
  }
  return { score: sum, hasScore: hasScore };
}

function formatDate(d) {
  if (!d) return '';
  if (d instanceof Date) {
    const day = ('0' + d.getDate()).slice(-2);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const year = d.getFullYear();
    return day + '/' + month + '/' + year;
  }
  return d.toString();
}

function formatCleanId(val) {
  if (val === null || val === undefined) return '';
  let str = val.toString().trim();
  if (typeof val === 'number') {
    str = val.toLocaleString('fullwide', { useGrouping: false });
  }
  return str;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ============================================================================
 * TEACHER / STAFF AUTHENTICATION & DIRECT SHEET INTEGRATION
 * ============================================================================
 */

/**
 * Automatically locate Staff/Teacher sheet regardless of tab name
 */
function getStaffSheet(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();

  // 1. Check common tab name variants ('Teacher List' is primary)
  const candidates = [
    'teacher list', 'teachers list', 'staff list',
    'staff', 'teacher', 'teachers', 'employee', 'employees',
    'staff details', 'teacher details', 'staff data',
    'faculty', 'faculty list', 'karmchari'
  ];

  for (let i = 0; i < sheets.length; i++) {
    const sName = sheets[i].getName().trim().toLowerCase();
    for (let c = 0; c < candidates.length; c++) {
      if (sName === candidates[c] || sName.includes(candidates[c])) {
        return sheets[i];
      }
    }
  }

  // 2. Scan Row 1 headers of all non-class sheets
  for (let i = 0; i < sheets.length; i++) {
    const s = sheets[i];
    const sName = s.getName().trim().toLowerCase();
    if (sName === 'information sheet' || sName === 'audit log' || sName.match(/^(1st|2nd|3rd|[4-9]th|10th)$/i)) continue;

    if (s.getLastRow() >= 1 && s.getLastColumn() >= 5) {
      const firstRowVals = s.getRange(1, 1, 1, Math.min(s.getLastColumn(), 25)).getValues()[0];
      const joined = firstRowVals.map(function(v) { return String(v || '').toLowerCase(); }).join(' ');
      if (joined.includes('employee name') || (joined.includes('designation') && (joined.includes('mobile') || joined.includes('email')))) {
        return s;
      }
    }
  }

  return null;
}

/**
 * Dynamically map column positions from the Staff Sheet header row
 */
function resolveStaffLayout(sheet) {
  const lastCol = Math.max(sheet.getLastColumn(), 20);
  const headerVals = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  let cols = {
    designation: 1,
    aadhaar: 2,
    name: 3,
    fatherName: 4,
    email: 5,
    teacherId: 6,
    husbandName: 7,
    dob: 8,
    gender: 9,
    category: 10,
    mobile: 14,
    subject: 19
  };

  headerVals.forEach(function(val, idx) {
    const colNum = idx + 1;
    const h = String(val || '').toLowerCase().trim();
    if (!h) return;

    if (h.includes('employee name') || (h.includes('name') && !h.includes('father') && !h.includes('husband'))) {
      cols.name = colNum;
    } else if (h.includes('email')) {
      cols.email = colNum;
    } else if (h.includes('teacher id') || h.includes('teacher_id') || h.includes('empid') || h.includes('emp id') || h.includes('staff id')) {
      cols.teacherId = colNum;
    } else if (h.includes('mobile') || h.includes('phone') || h.includes('contact')) {
      cols.mobile = colNum;
    } else if (h.includes('designation') || h.includes('post')) {
      cols.designation = colNum;
    } else if (h.includes('aadhaar') || h.includes('aadhar')) {
      cols.aadhaar = colNum;
    } else if (h.includes('father')) {
      cols.fatherName = colNum;
    } else if (h.includes('husband')) {
      cols.husbandName = colNum;
    } else if (h.includes('subject')) {
      cols.subject = colNum;
    }
  });

  return cols;
}

/**
 * Get all staff members with assigned/detected Teacher IDs
 */
function getStaffMembers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getStaffSheet(ss);
  if (!sheet) return [];

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const layout = resolveStaffLayout(sheet);
  const lastCol = sheet.getLastColumn();
  const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

  const staff = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const name = String(row[layout.name - 1] || '').trim();
    if (!name || name.toLowerCase().includes('employee name') || name.toLowerCase().includes('total')) continue;

    let email = layout.email > 0 ? String(row[layout.email - 1] || '').trim() : '';
    let mobile = layout.mobile > 0 ? String(row[layout.mobile - 1] || '').trim() : '';
    if (typeof row[layout.mobile - 1] === 'number') {
      mobile = row[layout.mobile - 1].toLocaleString('fullwide', { useGrouping: false });
    }

    let aadhaar = layout.aadhaar > 0 ? String(row[layout.aadhaar - 1] || '').trim() : '';
    if (typeof row[layout.aadhaar - 1] === 'number') {
      aadhaar = row[layout.aadhaar - 1].toLocaleString('fullwide', { useGrouping: false });
    }

    let designation = layout.designation > 0 ? String(row[layout.designation - 1] || '').trim() : 'Teacher';
    let subject = layout.subject > 0 ? String(row[layout.subject - 1] || '').trim() : '';

    // If teacher ID column exists in sheet, read it (e.g. AVM26K01, AVM26K02...)
    let teacherId = '';
    if (layout.teacherId > 0) {
      teacherId = String(row[layout.teacherId - 1] || '').trim();
    }
    // Auto-generate consistent teacher ID if not present: AVM26K01, AVM26K02...
    if (!teacherId) {
      const padNum = (i + 1) < 10 ? ('0' + (i + 1)) : String(i + 1);
      teacherId = 'AVM26K' + padNum;
    }

    staff.push({
      teacherId: teacherId,
      employeeName: name,
      email: email,
      mobileNumber: mobile,
      designation: designation || 'Teacher',
      currentSubject: subject,
      aadhaarNumber: aadhaar,
      rowIndex: i + 2
    });
  }

  return staff;
}

/**
 * ONE-CLICK AUTHORIZATION FUNCTION
 * Run this function ONCE inside the Apps Script editor to authorize email sending permissions.
 * 
 * Steps:
 * 1. Select 'authorizeEmailSending' in the toolbar dropdown at the top of Apps Script editor.
 * 2. Click 'Run'.
 * 3. In the popup: Click 'Review permissions' -> Select your Google Account -> Click 'Advanced' -> Click 'Go to project (unsafe)' -> Click 'Allow'.
 */
function authorizeEmailSending() {
  const userEmail = Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail() || 'avmsoorsagar93@gmail.com';
  Logger.log('Authorizing email sending for: ' + userEmail);
  MailApp.sendEmail({
    to: userEmail,
    subject: '✅ AVM School Portal - Email Permissions Authorized',
    htmlBody: '<p>Great! Email permissions have been successfully authorized. Your Marksheet Portal can now send OTP emails to teachers.</p>'
  });
  return 'Authorization successful!';
}

/**
 * Send 6-Digit Random OTP to Teacher Email
 * Sender account: avmsoorsagar93@gmail.com
 */
function sendTeacherOtp(inputName, inputEmail) {
  try {
    const rawName = String(inputName || '').trim();
    const rawEmail = String(inputEmail || '').trim().toLowerCase();

    if (!rawName || !rawEmail) {
      return {
        status: 'error',
        message: 'Unauthorized login. Please enter both Teacher Name and Email ID. Please connect with admin.'
      };
    }

    const normInputName = rawName.toLowerCase().replace(/\s+/g, ' ');
    // Clean user or sheet typos (like .om instead of .com)
    const cleanInputEmail = rawEmail.replace(/@gmail\.om$/i, '@gmail.com');

    const staffList = getStaffMembers();
    if (!staffList || staffList.length === 0) {
      return {
        status: 'error',
        message: 'Unauthorized login. Staff records not found in Google Sheet. Please connect with admin.'
      };
    }

    let matchedStaff = null;
    for (let i = 0; i < staffList.length; i++) {
      const s = staffList[i];
      const sName = String(s.employeeName || '').toLowerCase().replace(/\s+/g, ' ');
      let sEmail = String(s.email || '').toLowerCase().trim();
      sEmail = sEmail.replace(/@gmail\.om$/i, '@gmail.com');

      if (!sEmail) continue;

      const nameMatch = (sName === normInputName || sName.includes(normInputName) || normInputName.includes(sName));
      const emailMatch = (sEmail === cleanInputEmail);

      if (nameMatch && emailMatch) {
        matchedStaff = s;
        break;
      }
    }

    if (!matchedStaff) {
      return {
        status: 'error',
        message: 'Unauthorized login. Teacher Name and Email ID do not match school records. Please connect with admin.'
      };
    }

    // Generate random 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Cache OTP for 10 minutes (600 seconds)
    const cache = CacheService.getScriptCache();
    const cacheKey = 'OTP_' + cleanInputEmail;
    const otpPayload = JSON.stringify({
      otp: otp,
      name: matchedStaff.employeeName,
      teacherId: matchedStaff.teacherId,
      designation: matchedStaff.designation,
      email: cleanInputEmail,
      timestamp: Date.now()
    });
    cache.put(cacheKey, otpPayload, 600);

    // Also persist in PropertiesService as backup
    try {
      PropertiesService.getScriptProperties().setProperty(cacheKey, otpPayload);
    } catch (e) {}

    // Send Email from avmsoorsagar93@gmail.com
    const schoolEmail = 'avmsoorsagar93@gmail.com';
    const emailSubject = '🔐 AVM Marksheet Portal - Login OTP: ' + otp;
    const htmlBody = 
      '<div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1.5px solid #bfdbfe; border-radius: 12px; background: #ffffff;">' +
        '<div style="text-align: center; margin-bottom: 20px;">' +
          '<h2 style="color: #1e3a8a; margin: 0 0 4px; font-size: 22px;">Adarsh Vidya Mandir (AVM)</h2>' +
          '<p style="color: #64748b; font-size: 13px; margin: 0;">Soorsagar, Jodhpur • School Marksheet & Evaluation Portal</p>' +
        '</div>' +
        '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />' +
        '<p style="font-size: 15px; color: #334155; margin: 0 0 10px;">Dear <strong>' + matchedStaff.employeeName + '</strong> (' + matchedStaff.teacherId + '),</p>' +
        '<p style="font-size: 14px; color: #475569; line-height: 1.5; margin: 0 0 16px;">You have requested to log in to the <strong>AVM Marksheet Portal</strong>. Use the 6-digit OTP below to authenticate your session:</p>' +
        '<div style="background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 10px; padding: 18px; text-align: center; margin: 20px 0;">' +
          '<span style="font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #1e3a8a;">' + otp + '</span>' +
          '<p style="font-size: 12px; color: #64748b; margin: 8px 0 0;">⏱️ Valid for 10 minutes only. Do NOT share this OTP with anyone.</p>' +
        '</div>' +
        '<p style="font-size: 13px; color: #64748b; line-height: 1.4; margin: 0 0 16px;">If you did not request this login, please immediately contact the school administrator at <strong>' + schoolEmail + '</strong>.</p>' +
        '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />' +
        '<p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">Automated security notification sent from ' + schoolEmail + '</p>' +
      '</div>';

    try {
      MailApp.sendEmail({
        to: cleanInputEmail,
        replyTo: schoolEmail,
        subject: emailSubject,
        htmlBody: htmlBody,
        name: 'AVM School Soorsagar (' + schoolEmail + ')'
      });
    } catch (mailErr) {
      try {
        GmailApp.sendEmail(cleanInputEmail, emailSubject, '', {
          htmlBody: htmlBody,
          replyTo: schoolEmail,
          name: 'AVM School Soorsagar (' + schoolEmail + ')'
        });
      } catch (gmailErr) {
        throw new Error('Email permission required in Apps Script. In Apps Script Editor, select "authorizeEmailSending" from the top dropdown, click "Run", and click "Allow". (Detail: ' + mailErr.toString() + ')');
      }
    }

    return {
      status: 'success',
      message: 'OTP sent successfully to your registered email address (' + maskEmail(cleanInputEmail) + ').',
      email: cleanInputEmail,
      emailMasked: maskEmail(cleanInputEmail)
    };
  } catch (err) {
    return {
      status: 'error',
      message: err.message || ('Error sending OTP email: ' + err.toString())
    };
  }
}

/**
 * Verify Teacher 6-Digit OTP
 */
function verifyTeacherOtp(inputEmail, inputOtp) {
  try {
    const rawEmail = String(inputEmail || '').trim().toLowerCase();
    const cleanEmail = rawEmail.replace(/@gmail\.om$/i, '@gmail.com');
    const cleanOtp = String(inputOtp || '').trim().replace(/\D/g, '');

    if (!cleanOtp || cleanOtp.length !== 6) {
      return {
        status: 'error',
        message: 'Unauthorized login. Invalid OTP. Please connect with admin.'
      };
    }

    let storedJson = null;

    // 1. Direct Cache lookup with cleanEmail (if real email provided)
    if (cleanEmail && !cleanEmail.includes('*')) {
      storedJson = CacheService.getScriptCache().get('OTP_' + cleanEmail);
      if (!storedJson) {
        try {
          storedJson = PropertiesService.getScriptProperties().getProperty('OTP_' + cleanEmail);
        } catch (e) {}
      }
    }

    // 2. Persistent Multi-Store Fallback: Search all active OTP records
    // Handles masked emails (with ***), case differences, or transient cache drops
    if (!storedJson) {
      try {
        const props = PropertiesService.getScriptProperties().getProperties();
        for (let k in props) {
          if (k.indexOf('OTP_') === 0) {
            try {
              const data = JSON.parse(props[k]);
              const timeDiff = Date.now() - (data.timestamp || 0);
              // Valid within 15 minutes (900,000 ms)
              if (timeDiff < 900000) {
                if (String(data.otp).trim() === cleanOtp) {
                  // If OTP matches, accept it!
                  storedJson = props[k];
                  try {
                    PropertiesService.getScriptProperties().deleteProperty(k);
                  } catch (e) {}
                  break;
                }
              } else {
                // Expired OTP cleanup
                PropertiesService.getScriptProperties().deleteProperty(k);
              }
            } catch (pErr) {}
          }
        }
      } catch (e) {}
    }

    if (!storedJson) {
      return {
        status: 'error',
        message: 'Unauthorized login. Invalid OTP. Please connect with admin.'
      };
    }

    const storedData = JSON.parse(storedJson);

    // Final sanity check
    if (String(storedData.otp).trim() !== cleanOtp) {
      return {
        status: 'error',
        message: 'Unauthorized login. Invalid OTP. Please connect with admin.'
      };
    }

    // Clean up cache & properties
    try {
      CacheService.getScriptCache().remove('OTP_' + storedData.email);
      PropertiesService.getScriptProperties().deleteProperty('OTP_' + storedData.email);
    } catch (e) {}

    // Locate complete profile from staff sheet
    const staffList = getStaffMembers();
    let teacher = null;
    const targetEmail = (storedData.email || cleanEmail).toLowerCase().trim().replace(/@gmail\.om$/i, '@gmail.com');

    for (let i = 0; i < staffList.length; i++) {
      let sEmail = String(staffList[i].email || '').toLowerCase().trim().replace(/@gmail\.om$/i, '@gmail.com');
      let sId = String(staffList[i].teacherId || '').toLowerCase().trim();
      let sName = String(staffList[i].employeeName || '').toLowerCase().trim();

      if ((sEmail && sEmail === targetEmail) || 
          (storedData.teacherId && sId === String(storedData.teacherId).toLowerCase().trim()) ||
          (storedData.name && sName === String(storedData.name).toLowerCase().trim())) {
        teacher = staffList[i];
        break;
      }
    }

    if (!teacher) {
      teacher = {
        teacherId: storedData.teacherId || 'AVM26K01',
        employeeName: storedData.name,
        designation: storedData.designation || 'Teacher',
        email: targetEmail,
        aadhaarNumber: ''
      };
    }

    return {
      status: 'success',
      teacher: {
        id: teacher.teacherId,
        name: teacher.employeeName,
        designation: teacher.designation,
        email: teacher.email,
        mobile: teacher.mobileNumber,
        subject: teacher.currentSubject,
        aadhaarMasked: maskAadhaar(teacher.aadhaarNumber)
      }
    };
  } catch (err) {
    return {
      status: 'error',
      message: 'Unauthorized login. Invalid OTP. Please connect with admin.'
    };
  }
}

/**
 * Verify Teacher (Mobile fallback)
 */
function verifyTeacher(inputName, inputMobile) {
  try {
    const rawName = String(inputName || '').trim();
    const rawMobile = String(inputMobile || '').trim();

    if (!rawName || !rawMobile) {
      return {
        status: 'error',
        message: 'Unauthorized login. Please enter both Name and Mobile Number. Please connect with admin.'
      };
    }

    const normInputName = rawName.toLowerCase().replace(/\s+/g, ' ');
    const normInputMobile = rawMobile.replace(/\D/g, '').slice(-10);

    const staffList = getStaffMembers();
    if (!staffList || staffList.length === 0) {
      return {
        status: 'error',
        message: 'Unauthorized login. Staff records not found. Please connect with admin.'
      };
    }

    let matchedStaff = null;
    for (let i = 0; i < staffList.length; i++) {
      const s = staffList[i];
      const sMobile = String(s.mobileNumber || '').replace(/\D/g, '').slice(-10);
      const sName = String(s.employeeName || '').toLowerCase().replace(/\s+/g, ' ');

      if (sMobile !== normInputMobile) continue;

      if (sName === normInputName || sName.includes(normInputName) || normInputName.includes(sName)) {
        matchedStaff = s;
        break;
      }
    }

    if (!matchedStaff) {
      return {
        status: 'error',
        message: 'Unauthorized login. Details do not match school records. Please connect with admin.'
      };
    }

    return {
      status: 'success',
      teacher: {
        id: matchedStaff.teacherId,
        name: matchedStaff.employeeName,
        designation: matchedStaff.designation,
        email: matchedStaff.email,
        mobile: matchedStaff.mobileNumber,
        subject: matchedStaff.currentSubject,
        aadhaarMasked: maskAadhaar(matchedStaff.aadhaarNumber)
      }
    };
  } catch (err) {
    return {
      status: 'error',
      message: 'Unauthorized login: ' + err.toString()
    };
  }
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return 'email';
  const parts = email.split('@');
  const user = parts[0];
  const domain = parts[1];
  if (user.length <= 2) return user[0] + '***@' + domain;
  return user.slice(0, 2) + '***' + user.slice(-1) + '@' + domain;
}

function maskAadhaar(val) {
  const digits = String(val || '').replace(/\D/g, '');
  if (digits.length >= 4) {
    return 'XXXX-XXXX-' + digits.slice(-4);
  }
  return digits ? 'XXXX-XXXX' : '—';
}
