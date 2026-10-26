/**
 * ============================================================================
 * AVM SCHOOL MARKSHEET PORTAL - 100% MOBILE RESPONSIVE ENGINE
 * ============================================================================
 */

// Subject configurations with bilingual labels & max marks
const EVALUATION_SUBJECTS = [
  { id: "hindi", name: "Hindi (हिंदी)", type: "standard", max: { firstTest: 10, secondTest: 10, halfYearly: 70, thirdTest: 10, annualExam: 100 } },
  { id: "english", name: "English (अंग्रेजी)", type: "standard", max: { firstTest: 10, secondTest: 10, halfYearly: 70, thirdTest: 10, annualExam: 100 } },
  { id: "sanskrit", name: "Sanskart (संस्कृत)", type: "standard", max: { firstTest: 10, secondTest: 10, halfYearly: 70, thirdTest: 10, annualExam: 100 } },
  { id: "science", name: "Science (विज्ञान)", type: "standard", max: { firstTest: 10, secondTest: 10, halfYearly: 70, thirdTest: 10, annualExam: 100 } },
  { id: "maths", name: "Mathematics (गणित)", type: "standard", max: { firstTest: 10, secondTest: 10, halfYearly: 70, thirdTest: 10, annualExam: 100 } },
  { id: "socialScience", name: "Social Science (सामाजिक विज्ञान)", type: "standard", max: { firstTest: 10, secondTest: 10, halfYearly: 70, thirdTest: 10, annualExam: 100 } },
  {
    id: "physicalEducation",
    name: "Physical & Health Ed. (शारीरिक शिक्षा)",
    type: "dual",
    theoMax: { firstTest: 10, secondTest: 10, halfYearly: 25, thirdTest: 15, annualExam: 70 },
    pracMax: { firstTest: 8, secondTest: 7, halfYearly: 10, thirdTest: 10, annualExam: 30 }
  },
  {
    id: "itConcept",
    name: "Concept of IT (सूचना प्रौद्योगिकी)",
    type: "dual",
    theoMax: { firstTest: 10, secondTest: 10, halfYearly: 50, thirdTest: 10, annualExam: 70 },
    pracMax: { firstTest: 0, secondTest: 0, halfYearly: 20, thirdTest: 0, annualExam: 30 }
  },
  { id: "supw", name: "SUPW & Social Service (स.उ.उ.का.)", type: "standard", max: { firstTest: 25, secondTest: 0, halfYearly: 45, thirdTest: 0, annualExam: 30 } },
  { id: "artEducation", name: "Art Education (कला शिक्षा)", type: "standard", max: { firstTest: 25, secondTest: 0, halfYearly: 60, thirdTest: 0, annualExam: 15 } }
];

// Fallback staff directory matching school records (used offline or when live sheet endpoint is syncing)
const FALLBACK_STAFF_LIST = [
  { id: "AVM-T01", name: "Ten Singh", designation: "Headmaster", mobile: "7737681970", aadhaar: "445104551553", subject: "Administration" },
  { id: "AVM-T02", name: "Kapil Inania", designation: "Computer Teacher", mobile: "9828522814", aadhaar: "284148579207", subject: "Computer / IT" },
  { id: "AVM-T03", name: "Radha Kishan Upadhyay", designation: "Teacher", mobile: "9413257085", aadhaar: "622232154638", subject: "General" },
  { id: "AVM-T04", name: "Pooja Parihar", designation: "Mathematics Teacher", mobile: "7014322413", aadhaar: "794903185318", subject: "Mathematics" },
  { id: "AVM-T05", name: "Arjun Lal Nagariya", designation: "Teacher", mobile: "9004237691", aadhaar: "470046144821", subject: "General" },
  { id: "AVM-T06", name: "Bhavana Pareek", designation: "Teacher", mobile: "8003771825", aadhaar: "400277485222", subject: "General" },
  { id: "AVM-T07", name: "Annapurna Pareek", designation: "Teacher", mobile: "9001204531", aadhaar: "389416332692", subject: "Hindi / Sanskrit" },
  { id: "AVM-T08", name: "Jyoti Pareek", designation: "Teacher", mobile: "8949033224", aadhaar: "482708361987", subject: "Commerce / General" },
  { id: "AVM-T09", name: "Mahesh Kumar", designation: "Teacher", mobile: "9521852209", aadhaar: "671077109901", subject: "General" },
  { id: "AVM-T10", name: "Indra Prajapat", designation: "Teacher", mobile: "7976189889", aadhaar: "353819340484", subject: "General" },
  { id: "AVM-T11", name: "Priyanka Parihar", designation: "Teacher", mobile: "9001625383", aadhaar: "263003666793", subject: "General" },
  { id: "AVM-T12", name: "Anita", designation: "Teacher", mobile: "7976288053", aadhaar: "674245388061", subject: "General" },
  { id: "AVM-T13", name: "Reena Sharma", designation: "Secondary Teacher", mobile: "7976198976", aadhaar: "272661410969", subject: "Secondary" },
  { id: "AVM-T14", name: "Jaishree Dave", designation: "Teacher", mobile: "9413087191", aadhaar: "434366729226", subject: "General" },
  { id: "AVM-T15", name: "Vikash", designation: "Teacher", mobile: "9166928204", aadhaar: "289208127591", subject: "General" }
];

// Application State
const state = {
  apiUrl: localStorage.getItem("avm_apps_script_url") || "https://script.google.com/macros/s/AKfycbxMI5ujCVBMt9rcD2-Oow_rncqX1qgHYREhhkuibJrDpcUcrhGgVfkmtnfkBboOhXIXew/exec",
  isConnected: false,
  currentTeacher: null,
  classesList: [],
  currentClass: "9th",
  currentExam: "firstTest",
  examLabels: {
    firstTest: "1st Periodic Test",
    secondTest: "2nd Periodic Test",
    halfYearly: "Half-Yearly Exam",
    thirdTest: "3rd Periodic Test",
    annualExam: "Annual Exam"
  },
  students: [],
  selectedStudent: null,
  activeFilter: {
    search: "",
    gender: "all",
    category: "all"
  },
  currentView: window.innerWidth <= 768 ? "cards" : "table"
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  setupViewMode();
  setupEventListeners();
  checkTeacherAuth();
  preloadForensics();
});

/**
 * Check Teacher Authentication State
 */
function checkTeacherAuth() {
  const saved = localStorage.getItem("avm_logged_teacher");
  if (saved) {
    try {
      state.currentTeacher = JSON.parse(saved);
      showTeacherBanner(true);
      showTeacherLoginScreen(false);
      initConnection();
      return true;
    } catch (e) {
      localStorage.removeItem("avm_logged_teacher");
    }
  }

  state.currentTeacher = null;
  showTeacherBanner(false);
  showTeacherLoginScreen(true);
  return false;
}

/**
 * Display / Hide Verified Teacher Banner
 */
function showTeacherBanner(show) {
  const banner = document.getElementById("teacherBanner");
  if (!banner) return;

  if (show && state.currentTeacher) {
    banner.style.display = "flex";
    const nameEl = document.getElementById("teacherBannerName");
    const idEl = document.getElementById("teacherBadgeId");
    const roleEl = document.getElementById("teacherBannerRole");
    const avatarEl = document.getElementById("teacherAvatar");

    if (nameEl) nameEl.textContent = state.currentTeacher.name;
    if (idEl) idEl.textContent = state.currentTeacher.id;
    if (roleEl) roleEl.textContent = state.currentTeacher.designation || "Teacher";

    if (avatarEl) {
      const parts = state.currentTeacher.name.trim().split(/\s+/);
      const initials = parts.length > 1 
        ? (parts[0][0] + parts[1][0]).toUpperCase() 
        : parts[0].substring(0, 2).toUpperCase();
      avatarEl.textContent = initials || "AV";
    }
  } else {
    banner.style.display = "none";
  }
}

/**
 * Display / Hide Teacher Login Card
 */
function showTeacherLoginScreen(show) {
  const loginCard = document.getElementById("teacherLoginScreen");
  const liveContent = document.getElementById("liveContentContainer");
  const disconnected = document.getElementById("disconnectedScreen");
  const loading = document.getElementById("loadingScreen");

  if (!loginCard) return;

  if (show) {
    loginCard.style.display = "flex";
    if (liveContent) liveContent.style.display = "none";
    if (disconnected) disconnected.style.display = "none";
    if (loading) loading.style.display = "none";
  } else {
    loginCard.style.display = "none";
  }
}

/**
 * Setup View Mode (Cards vs Table)
 */
function setupViewMode() {
  const cardsBtn = document.getElementById("viewCardsBtn");
  const tableBtn = document.getElementById("viewTableBtn");
  const cardsBox = document.getElementById("studentCardsContainer");
  const tableBox = document.getElementById("studentTableContainer");

  function setView(view) {
    // If mobile screen, enforce cards view for 100% zero-overflow mobile experience
    if (window.innerWidth < 768) {
      view = "cards";
    }
    state.currentView = view;
    if (view === "cards") {
      if (cardsBtn) cardsBtn.classList.add("active");
      if (tableBtn) tableBtn.classList.remove("active");
      if (cardsBox) cardsBox.style.display = "flex";
      if (tableBox) tableBox.style.display = "none";
    } else {
      if (cardsBtn) cardsBtn.classList.remove("active");
      if (tableBtn) tableBtn.classList.add("active");
      if (cardsBox) cardsBox.style.display = "none";
      if (tableBox) tableBox.style.display = "block";
    }
  }

  if (window.innerWidth < 768) {
    state.currentView = "cards";
  }
  setView(state.currentView);

  if (cardsBtn) cardsBtn.addEventListener("click", () => setView("cards"));
  if (tableBtn) tableBtn.addEventListener("click", () => setView("table"));

  window.addEventListener("resize", () => {
    if (window.innerWidth < 768 && state.currentView !== "cards") {
      setView("cards");
    }
  });
}

/**
 * Initialize connection with Google Sheet
 */
async function initConnection() {
  if (!state.currentTeacher) {
    showTeacherLoginScreen(true);
    return;
  }

  if (!state.apiUrl) {
    showDisconnectedScreen("Please configure your Google Apps Script Web App URL.");
    return;
  }

  showLoadingScreen(true);

  try {
    // 1. Load classes available in sheet
    await loadAvailableClasses();

    // 2. Load student roster for active class
    await loadClassStudents(state.currentClass);

    state.isConnected = true;
    updateConnectionUI(true);
    showDisconnectedScreen(false);

  } catch (err) {
    console.warn("Connection error:", err);
    state.isConnected = false;
    updateConnectionUI(false);
    showDisconnectedScreen("Could not reach Google Sheet: " + err.message);
  } finally {
    showLoadingScreen(false);
  }
}

/**
 * Load Available Classes
 */
async function loadAvailableClasses() {
  try {
    const res = await fetch(`${state.apiUrl}?action=getClasses`);
    const json = await res.json();
    if (json.status === "success" && Array.isArray(json.data)) {
      state.classesList = json.data;
    } else {
      generateDefaultClasses();
    }
  } catch (e) {
    generateDefaultClasses();
  }
  renderClassPills();
}

function generateDefaultClasses() {
  state.classesList = [];
  for (let i = 1; i <= 10; i++) {
    const isNine = (i === 9);
    state.classesList.push({
      classNum: i,
      tabName: (i === 1 ? "1st" : i === 2 ? "2nd" : i === 3 ? "3rd" : i + "th"),
      hasSheet: true,
      studentCount: isNine ? 18 : 0,
      isReady: isNine
    });
  }
}

/**
 * Render Horizontal Class Carousel
 */
function renderClassPills() {
  const container = document.getElementById("classPillsContainer");
  container.innerHTML = "";

  state.classesList.forEach(cls => {
    const btn = document.createElement("button");
    const isCurrent = (cls.tabName === state.currentClass || String(cls.classNum) === state.currentClass || cls.tabName.toLowerCase() === state.currentClass.toLowerCase());
    const hasData = cls.studentCount > 0;

    btn.className = `class-chip-item ${isCurrent ? "active" : ""} ${!hasData ? "empty-tab" : ""}`;
    btn.dataset.tabName = cls.tabName;

    btn.innerHTML = `
      <span class="chip-class-name">Class ${cls.classNum}</span>
      <span class="chip-student-count">${hasData ? cls.studentCount + " Students" : "Empty"}</span>
    `;

    btn.addEventListener("click", async () => {
      if (state.currentClass === cls.tabName) return;

      document.querySelectorAll(".class-chip-item").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      state.currentClass = cls.tabName;
      await loadClassStudents(cls.tabName);
    });

    container.appendChild(btn);
  });

  const subtitle = document.getElementById("classCountSubtitle");
  if (subtitle) {
    const activeObj = state.classesList.find(c => c.tabName === state.currentClass);
    if (activeObj && activeObj.studentCount > 0) {
      subtitle.textContent = `Class ${activeObj.classNum} • ${activeObj.studentCount} Students in Sheet`;
    } else {
      subtitle.textContent = `Showing Class ${state.currentClass}`;
    }
  }
}

/**
 * Load Students for Class from Google Sheet
 */
async function loadClassStudents(className) {
  showLoadingScreen(true);
  try {
    const res = await fetch(`${state.apiUrl}?action=getStudents&className=${encodeURIComponent(className)}`);
    const json = await res.json();

    if (json.status === "success" && json.data) {
      const rawStudents = json.data.students || [];

      // Map raw sheet data to model
      state.students = rawStudents.map(convertSheetStudentToModel);

      // Recalculate ranks across sheet data
      recalculateAllRanks();

      // Update class pill count dynamically
      const targetClass = state.classesList.find(c => c.tabName === className);
      if (targetClass) {
        targetClass.studentCount = state.students.length;
        targetClass.isReady = state.students.length > 0;
        renderClassPills();
      }

      renderRoster();
      updateStats();
    } else {
      throw new Error(json.message || "Failed to load class");
    }
  } catch (err) {
    console.error("Fetch error for class", className, err);
    state.students = [];
    renderRoster();
    updateStats();
    showToast(`Error fetching ${className}: ${err.message}`, "error");
  } finally {
    showLoadingScreen(false);
  }
}

/**
 * Convert sheet student row to UI model
 */
function convertSheetStudentToModel(st) {
  const marks = {
    firstTest: {},
    secondTest: {},
    halfYearly: {},
    thirdTest: {},
    annualExam: {}
  };

  const exams = ['firstTest', 'secondTest', 'halfYearly', 'thirdTest', 'annualExam'];

  if (st.subjects) {
    Object.keys(st.subjects).forEach(subjId => {
      const subj = st.subjects[subjId];
      exams.forEach(exKey => {
        if (subj[exKey]) {
          if (subj.type === 'standard') {
            const val = subj[exKey].obt;
            marks[exKey][subjId] = (val !== undefined && val !== null && val !== '') ? String(val) : '';
          } else {
            const tVal = subj[exKey].theoObt;
            const pVal = subj[exKey].pracObt;
            marks[exKey][`${subjId}_theo`] = (tVal !== undefined && tVal !== null && tVal !== '') ? String(tVal) : '';
            marks[exKey][`${subjId}_prac`] = (pVal !== undefined && pVal !== null && pVal !== '') ? String(pVal) : '';
          }
        }
      });
    });
  }

  return {
    rowNumber: st.rowNumber,
    sno: st.sno,
    session: st.session || "2026-27",
    nicId: st.nicId || "",
    srNo: st.srNo || "",
    rollNo: st.rollNo || "",
    adharNo: st.adharNo || "",
    className: st.className || state.currentClass,
    studentName: st.studentName || "",
    fatherName: st.fatherName || "",
    motherName: st.motherName || "",
    dob: st.dob || "",
    gender: st.gender || "",
    category: st.category || "",
    positions: st.positions || { firstPeriodic: "", secondPeriodic: "", halfYearly: "", thirdPeriodic: "", finalPosition: "" },
    subjects: st.subjects || {},
    marks: marks
  };
}

/**
 * Render Student Roster (Cards on Mobile, Table on Desktop)
 */
function renderRoster() {
  const cardsContainer = document.getElementById("studentCardsContainer");
  const tableBody = document.getElementById("studentsTableBody");
  const emptyFilter = document.getElementById("emptyState");
  const classNotice = document.getElementById("classEmptyNotice");

  cardsContainer.innerHTML = "";
  tableBody.innerHTML = "";

  // 1. If class in sheet is empty
  if (state.students.length === 0) {
    cardsContainer.style.display = "none";
    document.getElementById("studentTableContainer").style.display = "none";
    emptyFilter.style.display = "none";
    classNotice.style.display = "block";
    document.getElementById("classEmptyTitle").textContent = `${state.currentClass} — No Students in Google Sheet`;
    document.getElementById("rosterCountBadge").textContent = `0 Students`;
    return;
  }

  classNotice.style.display = "none";
  if (state.currentView === "cards") {
    cardsContainer.style.display = "flex";
  } else {
    document.getElementById("studentTableContainer").style.display = "block";
  }

  const filtered = getFilteredStudents();

  if (filtered.length === 0) {
    emptyFilter.style.display = "block";
    document.getElementById("rosterCountBadge").textContent = `0 of ${state.students.length} Students`;
    return;
  }

  emptyFilter.style.display = "none";
  document.getElementById("rosterCountBadge").textContent = `${filtered.length} of ${state.students.length} Students`;

  const examKey = state.currentExam;

  filtered.forEach(student => {
    const examScoreData = calculateStudentExamScore(student, examKey);
    const hasEnteredMarks = examScoreData.hasMarks;
    const rankVal = getStudentRankForExam(student, examKey);

    // Format Rank Badge
    let rankTagClass = "";
    let rankTagText = "—";
    if (rankVal) {
      if (rankVal === 1) { rankTagClass = "gold"; rankTagText = "🥇 Rank #1"; }
      else if (rankVal === 2) { rankTagClass = "silver"; rankTagText = "🥈 Rank #2"; }
      else if (rankVal === 3) { rankTagClass = "bronze"; rankTagText = "🥉 Rank #3"; }
      else { rankTagText = `Rank #${rankVal}`; }
    }

    const isFemale = (student.gender || "").toLowerCase() === "female";
    const avatarGender = isFemale ? "female" : "male";
    const initials = student.studentName.substring(0, 2).toUpperCase();

    // ==========================================
    // 1. BUILD MOBILE CARD (High-End Touch Layout)
    // ==========================================
    const card = document.createElement("div");
    card.className = "student-card-item";
    card.innerHTML = `
      <div class="card-header-bar">
        <div class="card-student-details">
          <div class="card-avatar ${avatarGender}">${initials}</div>
          <div class="card-name-group">
            <span class="card-primary-name">${escapeHtml(student.studentName)}</span>
            <span class="card-sub-father">Father: ${escapeHtml(student.fatherName || "—")}</span>
          </div>
        </div>
        <span class="card-position-pill ${rankTagClass}">${rankTagText}</span>
      </div>

      <div class="card-chips-flow">
        <span class="mini-chip sr">SR: ${escapeHtml(student.srNo || "—")}</span>
        <span class="mini-chip nic">NIC: ${escapeHtml(student.nicId || "—")}</span>
        ${student.rollNo ? `<span class="mini-chip roll">Roll: ${escapeHtml(student.rollNo)}</span>` : ''}
        ${student.adharNo ? `<span class="mini-chip adhar">Aadhar: ${escapeHtml(student.adharNo)}</span>` : ''}
        <span class="mini-chip cat">${escapeHtml(student.category || "GEN")}</span>
        <span class="mini-chip dob">${escapeHtml(student.dob || "—")}</span>
      </div>

      <div class="card-score-status-box">
        <div style="display:flex; flex-direction:column;">
          <span class="score-title-tag">${state.examLabels[examKey]}</span>
          ${hasEnteredMarks 
            ? `<span class="score-large-bold">${examScoreData.obtained} <small style="font-size:0.75rem; color:#64748b;">/ ${examScoreData.max}</small> <span style="font-size:0.8rem; color:#059669;">(${examScoreData.percentage}%)</span></span>` 
            : `<span class="score-pending-chip">⏳ Marks Pending</span>`
          }
        </div>
        <div>
          ${hasEnteredMarks 
            ? `<span class="grade-badge grade-${examScoreData.grade.toLowerCase().replace("+", "-plus")}">Grade ${examScoreData.grade}</span>`
            : `<span style="font-size:0.75rem; color:#94a3b8; font-weight:700;">Not Graded</span>`
          }
        </div>
      </div>

      <button type="button" class="touch-btn primary btn-card-action" onclick="openMarksModal(${student.sno})">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        <span>${hasEnteredMarks ? "Update Marks" : "Enter Marks"}</span>
      </button>
    `;
    cardsContainer.appendChild(card);

    // ==========================================
    // 2. BUILD DESKTOP TABLE ROW
    // ==========================================
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-weight:700; color:#64748b;">${student.sno}</td>
      <td>
        <strong style="color:#0f172a; font-size:0.92rem;">${escapeHtml(student.studentName)}</strong>
        <div style="font-size:0.75rem; color:#64748b;">F: ${escapeHtml(student.fatherName || "—")}</div>
      </td>
      <td>
        <span style="font-family:monospace; font-weight:700; font-size:0.82rem;">${escapeHtml(student.srNo || "—")}</span>
        <div style="font-size:0.72rem; color:#94a3b8;">${escapeHtml(student.nicId || "—")}</div>
      </td>
      <td>
        <span style="font-family:monospace; font-weight:700; font-size:0.82rem; color:#0369a1;">
          ${student.rollNo ? escapeHtml(student.rollNo) : '<span style="color:#cbd5e1;">—</span>'}
        </span>
      </td>
      <td>
        <span style="font-family:monospace; font-size:0.8rem; color:#475569;">
          ${student.adharNo ? escapeHtml(student.adharNo) : '<span style="color:#cbd5e1;">—</span>'}
        </span>
      </td>
      <td>
        <span style="font-size:0.75rem; font-weight:700; background:#ede9fe; color:#5b21b6; padding:2px 7px; border-radius:999px;">
          ${escapeHtml(student.category || "GEN")}
        </span>
      </td>
      <td>
        ${hasEnteredMarks 
          ? `<strong>${examScoreData.obtained}</strong> <small style="color:#64748b;">/ ${examScoreData.max}</small> (${examScoreData.percentage}%)`
          : `<span style="color:#d97706; font-size:0.78rem; font-weight:700;">Pending</span>`
        }
      </td>
      <td>
        <strong>${hasEnteredMarks ? examScoreData.obtained : "—"}</strong>
      </td>
      <td>
        <span class="card-position-pill ${rankTagClass}">${rankTagText}</span>
      </td>
      <td style="text-align: center;">
        <button class="touch-btn primary" style="font-size:0.78rem; padding:6px 12px; min-height:36px;" onclick="openMarksModal(${student.sno})">
          <span>${hasEnteredMarks ? "Update" : "Enter"}</span>
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

/**
 * Filter students
 */
function getFilteredStudents() {
  return state.students.filter(student => {
    const q = state.activeFilter.search;
    if (q) {
      const matchName = (student.studentName || "").toLowerCase().includes(q);
      const matchFather = (student.fatherName || "").toLowerCase().includes(q);
      const matchSr = (student.srNo || "").toLowerCase().includes(q);
      const matchNic = (student.nicId || "").toLowerCase().includes(q);
      const matchRoll = (student.rollNo || "").toLowerCase().includes(q);
      const matchAdhar = (student.adharNo || "").toLowerCase().includes(q);
      if (!matchName && !matchFather && !matchSr && !matchNic && !matchRoll && !matchAdhar) return false;
    }

    if (state.activeFilter.gender !== "all" && student.gender !== state.activeFilter.gender) return false;
    if (state.activeFilter.category !== "all" && student.category !== state.activeFilter.category) return false;

    return true;
  });
}

/**
 * Calculate Student Exam Score
 */
function calculateStudentExamScore(student, examKey) {
  let obtained = 0;
  let max = 0;
  let hasMarks = false;

  const marksObj = student.marks && student.marks[examKey] ? student.marks[examKey] : {};

  EVALUATION_SUBJECTS.forEach(subj => {
    if (subj.type === "standard") {
      const maxMarks = subj.max[examKey] || 0;
      max += maxMarks;

      const val = marksObj[subj.id];
      if (val !== undefined && val !== "" && !isNaN(val)) {
        obtained += Number(val);
        hasMarks = true;
      }
    } else {
      const tMax = subj.theoMax[examKey] || 0;
      const pMax = subj.pracMax[examKey] || 0;
      max += (tMax + pMax);

      const tVal = marksObj[`${subj.id}_theo`];
      const pVal = marksObj[`${subj.id}_prac`];

      if (tVal !== undefined && tVal !== "" && !isNaN(tVal)) {
        obtained += Number(tVal);
        hasMarks = true;
      }
      if (pVal !== undefined && pVal !== "" && !isNaN(pVal)) {
        obtained += Number(pVal);
        hasMarks = true;
      }
    }
  });

  const percentage = max > 0 ? ((obtained / max) * 100).toFixed(1) : "0.0";
  const grade = computeGrade(Number(percentage));

  return { obtained, max, hasMarks, percentage, grade };
}

function computeGrade(pct) {
  if (pct >= 91) return "A+";
  if (pct >= 75) return "A";
  if (pct >= 60) return "B";
  if (pct >= 45) return "C";
  if (pct >= 33) return "D";
  return "E";
}

/**
 * Recalculate Ranks across loaded students
 */
function recalculateAllRanks() {
  const exams = ["firstTest", "secondTest", "halfYearly", "thirdTest", "annualExam"];

  exams.forEach(examKey => {
    const scores = state.students.map((st, idx) => {
      const sc = calculateStudentExamScore(st, examKey);
      return { index: idx, score: sc.obtained, hasMarks: sc.hasMarks };
    });

    const active = scores.filter(s => s.hasMarks);
    active.sort((a, b) => b.score - a.score);

    const rankMap = {};
    let curRank = 1;
    for (let i = 0; i < active.length; i++) {
      if (i > 0 && active[i].score < active[i - 1].score) {
        curRank = i + 1;
      }
      rankMap[active[i].index] = curRank;
    }

    scores.forEach(s => {
      const posField = examKey === "firstTest" ? "firstPeriodic" :
                       examKey === "secondTest" ? "secondPeriodic" :
                       examKey === "halfYearly" ? "halfYearly" :
                       examKey === "thirdTest" ? "thirdPeriodic" : "finalPosition";

      if (!state.students[s.index].positions) state.students[s.index].positions = {};
      state.students[s.index].positions[posField] = rankMap[s.index] !== undefined ? rankMap[s.index] : "";
    });
  });
}

function getStudentRankForExam(student, examKey) {
  if (!student.positions) return "";
  if (examKey === "firstTest") return student.positions.firstPeriodic || "";
  if (examKey === "secondTest") return student.positions.secondPeriodic || "";
  if (examKey === "halfYearly") return student.positions.halfYearly || "";
  if (examKey === "thirdTest") return student.positions.thirdPeriodic || "";
  if (examKey === "annualExam") return student.positions.finalPosition || "";
  return "";
}

/**
 * Update Stats Summary Cards
 */
function updateStats() {
  const total = state.students.length;
  document.getElementById("totalStudentsCount").textContent = total;

  let enteredCount = 0;
  let topStudent = null;
  let topScore = -1;

  state.students.forEach(st => {
    const sc = calculateStudentExamScore(st, state.currentExam);
    if (sc.hasMarks) {
      enteredCount++;
      if (sc.obtained > topScore) {
        topScore = sc.obtained;
        topStudent = st;
      }
    }
  });

  document.getElementById("marksEnteredCount").textContent = enteredCount;
  document.getElementById("marksPendingCount").textContent = total - enteredCount;

  if (topStudent && topScore >= 0) {
    document.getElementById("classTopperName").textContent = `${topStudent.studentName} (${topScore} M)`;
  } else {
    document.getElementById("classTopperName").textContent = "—";
  }
}

/**
 * Open Marks Entry Modal
 */
window.openMarksModal = function(sno) {
  const student = state.students.find(s => s.sno === sno);
  if (!student) return;

  state.selectedStudent = student;

  // Populate Read-Only Demographics
  document.getElementById("modalStudentName").textContent = student.studentName;
  document.getElementById("modalSrNo").textContent = student.srNo || "—";
  document.getElementById("modalNicId").textContent = student.nicId || "—";
  document.getElementById("modalRollNo").textContent = student.rollNo || "—";
  document.getElementById("modalAdharNo").textContent = student.adharNo || "—";
  document.getElementById("modalFatherName").textContent = student.fatherName || "—";
  document.getElementById("modalMotherName").textContent = student.motherName || "—";
  document.getElementById("modalDob").textContent = student.dob || "—";
  document.getElementById("modalGender").textContent = student.gender || "—";
  document.getElementById("modalCategory").textContent = student.category || "—";
  document.getElementById("modalClass").textContent = `Class ${student.className || state.currentClass}`;

  // Populate Verified Teacher Editor signoff
  if (state.currentTeacher) {
    const tNameEl = document.getElementById("modalTeacherName");
    const tIdEl = document.getElementById("modalTeacherId");
    const tRoleEl = document.getElementById("modalTeacherRole");
    if (tNameEl) tNameEl.textContent = state.currentTeacher.name;
    if (tIdEl) tIdEl.textContent = state.currentTeacher.id;
    if (tRoleEl) tRoleEl.textContent = state.currentTeacher.designation ? `(${state.currentTeacher.designation})` : "";
  }

  document.getElementById("modalExamBadge").textContent = state.examLabels[state.currentExam];

  const currentRank = getStudentRankForExam(student, state.currentExam);
  document.getElementById("modalHeaderRankBadge").textContent = currentRank ? `Rank #${currentRank}` : "Rank #—";

  // Build Subjects Touch Form
  buildSubjectsForm(student, state.currentExam);
  updateModalNavButtons();

  document.getElementById("marksModal").style.display = "flex";
  document.body.style.overflow = "hidden"; // Prevent background scroll on phones
};

function closeMarksModal() {
  document.getElementById("marksModal").style.display = "none";
  document.body.style.overflow = "auto";
  state.selectedStudent = null;
}

/**
 * Build Subject Inputs in Modal
 */
function buildSubjectsForm(student, examKey) {
  const container = document.getElementById("subjectsEntryContainer");
  container.innerHTML = "";

  const currentMarks = student.marks && student.marks[examKey] ? student.marks[examKey] : {};

  EVALUATION_SUBJECTS.forEach(subj => {
    const card = document.createElement("div");
    card.className = "touch-subject-input-card";
    card.id = `card_${subj.id}`;

    if (subj.type === "standard") {
      const maxMarks = subj.max[examKey] || 0;
      const curVal = currentMarks[subj.id] !== undefined ? currentMarks[subj.id] : "";

      card.innerHTML = `
        <div class="subject-header-row">
          <span class="subject-title-bold">${escapeHtml(subj.name)}</span>
          <span class="subject-max-limit-pill">Max Marks: ${maxMarks}</span>
        </div>
        <input type="number" 
               inputmode="decimal"
               pattern="[0-9]*"
               class="mobile-mark-field mark-input" 
               id="input_${subj.id}"
               data-subject="${subj.id}"
               data-max="${maxMarks}"
               placeholder="0 to ${maxMarks}"
               min="0" 
               max="${maxMarks}" 
               value="${curVal}">
        <span class="field-error-feedback" id="err_${subj.id}" style="display:none;"></span>
      `;
    } else {
      // Dual Theory + Practical
      const tMax = subj.theoMax[examKey] || 0;
      const pMax = subj.pracMax[examKey] || 0;
      const curTheo = currentMarks[`${subj.id}_theo`] !== undefined ? currentMarks[`${subj.id}_theo`] : "";
      const curPrac = currentMarks[`${subj.id}_prac`] !== undefined ? currentMarks[`${subj.id}_prac`] : "";

      card.innerHTML = `
        <div class="subject-header-row">
          <span class="subject-title-bold">${escapeHtml(subj.name)}</span>
          <span class="subject-max-limit-pill">Theory: ${tMax} | Prac: ${pMax}</span>
        </div>
        <div class="dual-fields-mobile-row">
          <div class="dual-field-col">
            <span class="dual-field-lbl">Theory <span>(Max ${tMax})</span></span>
            <input type="number" 
                   inputmode="decimal"
                   pattern="[0-9]*"
                   class="mobile-mark-field mark-input" 
                   id="input_${subj.id}_theo"
                   data-subject="${subj.id}_theo"
                   data-max="${tMax}"
                   placeholder="0 - ${tMax}"
                   min="0" 
                   max="${tMax}" 
                   value="${curTheo}">
            <span class="field-error-feedback" id="err_${subj.id}_theo" style="display:none;"></span>
          </div>
          <div class="dual-field-col">
            <span class="dual-field-lbl">Practical <span>(Max ${pMax})</span></span>
            <input type="number" 
                   inputmode="decimal"
                   pattern="[0-9]*"
                   class="mobile-mark-field mark-input" 
                   id="input_${subj.id}_prac"
                   data-subject="${subj.id}_prac"
                   data-max="${pMax}"
                   placeholder="${pMax === 0 ? 'N/A' : '0 - ' + pMax}"
                   min="0" 
                   max="${pMax}" 
                   value="${pMax === 0 ? '0' : curPrac}"
                   ${pMax === 0 ? 'disabled' : ''}>
            <span class="field-error-feedback" id="err_${subj.id}_prac" style="display:none;"></span>
          </div>
        </div>
      `;
    }

    container.appendChild(card);
  });

  // Attach live calculation & validation
  container.querySelectorAll(".mark-input").forEach(input => {
    input.addEventListener("input", validateAndCalculate);
  });

  validateAndCalculate();
}

/**
 * Live Validation: Marks <= Maximum Marks
 */
function validateAndCalculate() {
  const container = document.getElementById("subjectsEntryContainer");
  const inputs = container.querySelectorAll(".mark-input");

  let hasError = false;
  let totalObtained = 0;
  let totalMax = 0;
  let enteredAny = false;

  inputs.forEach(inp => {
    const max = Number(inp.dataset.max);
    const rawVal = inp.value.trim();
    const errSpan = document.getElementById(`err_${inp.dataset.subject}`);
    const parentCard = inp.closest(".touch-subject-input-card");

    totalMax += max;

    if (rawVal === "") {
      inp.classList.remove("field-error");
      if (errSpan) errSpan.style.display = "none";
      if (parentCard) parentCard.classList.remove("error-highlight");
      return;
    }

    const num = Number(rawVal);
    enteredAny = true;

    // Strict validation
    if (num > max) {
      hasError = true;
      inp.classList.add("field-error");
      if (parentCard) parentCard.classList.add("error-highlight");
      if (errSpan) {
        errSpan.textContent = `⚠️ Cannot exceed ${max} marks! (अधिकतम अंक ${max})`;
        errSpan.style.display = "block";
      }
    } else if (num < 0) {
      hasError = true;
      inp.classList.add("field-error");
      if (parentCard) parentCard.classList.add("error-highlight");
      if (errSpan) {
        errSpan.textContent = `⚠️ Marks cannot be negative`;
        errSpan.style.display = "block";
      }
    } else {
      inp.classList.remove("field-error");
      if (parentCard) parentCard.classList.remove("error-highlight");
      if (errSpan) errSpan.style.display = "none";
      totalObtained += num;
    }
  });

  const saveBtn = document.getElementById("saveMarksBtn");
  const errorBanner = document.getElementById("formErrorBanner");

  if (hasError) {
    saveBtn.disabled = true;
    errorBanner.style.display = "flex";
  } else {
    saveBtn.disabled = false;
    errorBanner.style.display = "none";
  }

  // Update Summary Bar
  document.getElementById("summaryExamTotal").innerHTML = `${totalObtained} <small id="summaryExamMax">/ ${totalMax}</small>`;
  const pct = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : "0.0";
  document.getElementById("summaryExamPercent").textContent = `${pct}%`;

  const grade = computeGrade(Number(pct));
  const gradeBadge = document.getElementById("summaryExamGrade");
  gradeBadge.textContent = grade;
  gradeBadge.className = `grade-badge grade-${grade.toLowerCase().replace("+", "-plus")}`;

  if (enteredAny && !hasError && state.selectedStudent) {
    const proj = estimateProjectedRank(state.selectedStudent.sno, totalObtained, state.currentExam);
    document.getElementById("summaryProjectedRank").textContent = `Rank #${proj}`;
  } else {
    document.getElementById("summaryProjectedRank").textContent = `Rank #—`;
  }
}

function estimateProjectedRank(studentSno, inputScore, examKey) {
  const scores = state.students.map(st => {
    if (st.sno === studentSno) return inputScore;
    const sc = calculateStudentExamScore(st, examKey);
    return sc.hasMarks ? sc.obtained : -1;
  });

  scores.sort((a, b) => b - a);
  const rank = scores.indexOf(inputScore) + 1;
  return rank > 0 ? rank : 1;
}

/**
 * Modal Navigation: Prev / Next Student
 */
function updateModalNavButtons() {
  if (!state.selectedStudent) return;
  const curIdx = state.students.findIndex(s => s.sno === state.selectedStudent.sno);
  document.getElementById("prevStudentBtn").disabled = (curIdx <= 0);
  document.getElementById("nextStudentBtn").disabled = (curIdx >= state.students.length - 1);
}

function navigatePrevStudent() {
  if (!state.selectedStudent) return;
  const curIdx = state.students.findIndex(s => s.sno === state.selectedStudent.sno);
  if (curIdx > 0) openMarksModal(state.students[curIdx - 1].sno);
}

function navigateNextStudent() {
  if (!state.selectedStudent) return;
  const curIdx = state.students.findIndex(s => s.sno === state.selectedStudent.sno);
  if (curIdx < state.students.length - 1) openMarksModal(state.students[curIdx + 1].sno);
}

// Pre-cached Forensic Telemetry
let cachedForensics = {
  ip: "",
  isp: "",
  location: "",
  localIp: "",
  fingerprint: "",
  battery: "",
  mac: "",
  uuid: ""
};

/**
 * Preload security forensics in background
 */
async function preloadForensics() {
  getOrCreateDeviceMac();
  getDeviceUniqueId();
  fetchNetworkIpAndLocation();
  computeDeviceFingerprint();
  getBatteryStatus();
}

/**
 * Generates or retrieves a persistent Hardware MAC-format Identifier
 */
function getOrCreateDeviceMac() {
  let mac = localStorage.getItem("avm_device_mac");
  if (!mac) {
    const bytes = [];
    for (let i = 0; i < 6; i++) {
      let b = Math.floor(Math.random() * 256).toString(16).toUpperCase();
      if (b.length === 1) b = "0" + b;
      bytes.push(b);
    }
    // Set locally administered unicast bit
    bytes[0] = (parseInt(bytes[0], 16) | 2).toString(16).toUpperCase().padStart(2, "0");
    mac = bytes.join(":");
    localStorage.setItem("avm_device_mac", mac);
  }
  cachedForensics.mac = mac;
  return mac;
}

/**
 * Generates or retrieves a persistent Unique Device UUID
 */
function getDeviceUniqueId() {
  let uuid = localStorage.getItem("avm_device_uuid");
  if (!uuid) {
    uuid = "DEV-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    localStorage.setItem("avm_device_uuid", uuid);
  }
  cachedForensics.uuid = uuid;
  return uuid;
}

/**
 * Computes Hardware Fingerprint (FingerprintJS library or WebGL/Canvas hash fallback)
 */
async function computeDeviceFingerprint() {
  try {
    if (window.FingerprintJS) {
      const fp = await window.FingerprintJS.load();
      const result = await fp.get();
      if (result && result.visitorId) {
        cachedForensics.fingerprint = "FP-" + result.visitorId.toUpperCase();
        return cachedForensics.fingerprint;
      }
    }
  } catch (e) {}

  // Fallback hardware hash
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    let gpu = "GPU-NA";
    if (gl) {
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      if (dbg) gpu = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
    }
    const raw = [navigator.userAgent, screen.width, screen.height, navigator.hardwareConcurrency, gpu].join("|");
    let h = 0;
    for (let i = 0; i < raw.length; i++) {
      h = ((h << 5) - h) + raw.charCodeAt(i);
      h |= 0;
    }
    const hashStr = Math.abs(h).toString(16).toUpperCase().padStart(8, "0");
    cachedForensics.fingerprint = "FP-" + hashStr;
    return cachedForensics.fingerprint;
  } catch (e) {
    cachedForensics.fingerprint = "FP-STATIC";
    return cachedForensics.fingerprint;
  }
}

/**
 * Fetches Public IP, ISP, City, and State via trusted IP APIs
 */
async function fetchNetworkIpAndLocation() {
  if (cachedForensics.ip && cachedForensics.location) return;

  // Try ipapi.co (rich city, region, ISP)
  try {
    const res = await fetch("https://ipapi.co/json/", { cache: "force-cache" });
    const data = await res.json();
    if (data && data.ip) {
      cachedForensics.ip = data.ip;
      cachedForensics.isp = data.org || data.asn || "Internet Provider";
      cachedForensics.location = `${data.city || ""}, ${data.region || ""}, ${data.country_code || ""}`.replace(/^,\s*|,\s*$/g, "");
      return;
    }
  } catch (e) {}

  // Fallback 1: api.ipify.org
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    if (data && data.ip) {
      cachedForensics.ip = data.ip;
      cachedForensics.isp = "Network Carrier";
      cachedForensics.location = "India (Network)";
      return;
    }
  } catch (e) {}

  if (!cachedForensics.ip) {
    cachedForensics.ip = "Direct WebApp Connection";
    cachedForensics.isp = "Mobile / Broadband";
    cachedForensics.location = "India";
  }
}

/**
 * Get Battery Level & Status (if supported by browser)
 */
async function getBatteryStatus() {
  try {
    if (navigator.getBattery) {
      const b = await navigator.getBattery();
      const pct = Math.round(b.level * 100);
      const charging = b.charging ? "⚡ Charging" : "🔋 On Battery";
      cachedForensics.battery = `${pct}% (${charging})`;
      return cachedForensics.battery;
    }
  } catch (e) {}
  cachedForensics.battery = "Normal";
  return cachedForensics.battery;
}

/**
 * Complete Device Telemetry & Security Forensics
 * Direct pick - no user prompt required.
 */
async function getFullAuditForensics() {
  const ua = navigator.userAgent || "";
  let deviceName = "Unknown Device";
  let osName = "Unknown OS";
  let browserName = "Browser";

  // 1. Detect Phone / Tablet / Computer Device
  if (/iPhone/i.test(ua)) {
    const match = ua.match(/iPhone OS ([0-9_]+)/i);
    const ver = match ? match[1].replace(/_/g, ".") : "";
    deviceName = "Apple iPhone";
    osName = ver ? `iOS ${ver}` : "iOS";
  } else if (/iPad/i.test(ua)) {
    deviceName = "Apple iPad";
    osName = "iPadOS";
  } else if (/Android/i.test(ua)) {
    const androidVer = (ua.match(/Android\s([0-9.]+)/i) || [])[1] || "";
    osName = androidVer ? `Android ${androidVer}` : "Android";

    if (/SM-|Samsung/i.test(ua)) {
      const model = (ua.match(/SM-[A-Z0-9]+/i) || [])[0] || "Galaxy";
      deviceName = `Samsung ${model}`;
    } else if (/Redmi|Mi\s|Xiaomi|POCO/i.test(ua)) {
      const model = (ua.match(/(?:Redmi|POCO|Mi)\s*[\w\s]+/i) || [])[0] || "Xiaomi/Redmi";
      deviceName = model.trim();
    } else if (/OnePlus/i.test(ua)) {
      const model = (ua.match(/OnePlus[\w\s]+/i) || [])[0] || "OnePlus";
      deviceName = model.trim();
    } else if (/Vivo|V2\d{3}/i.test(ua)) {
      deviceName = "Vivo Mobile";
    } else if (/Oppo|CPH\d{4}/i.test(ua)) {
      deviceName = "Oppo Mobile";
    } else if (/Realme|RMX\d{4}/i.test(ua)) {
      deviceName = "Realme Mobile";
    } else if (/Pixel\s\d+/i.test(ua)) {
      const model = (ua.match(/Pixel\s\d+[\w\s]*/i) || [])[0] || "Google Pixel";
      deviceName = model.trim();
    } else if (/Motorola|moto/i.test(ua)) {
      deviceName = "Motorola Mobile";
    } else {
      const modelMatch = ua.match(/;\s*([A-Za-z0-9\s_-]+)\s*Build\//i);
      deviceName = (modelMatch && modelMatch[1]) ? modelMatch[1].trim() : "Android Phone";
    }
  } else if (/Windows NT 10.0/i.test(ua)) {
    deviceName = "Windows PC";
    osName = "Windows 10/11";
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    deviceName = "Apple Mac";
    osName = "macOS";
  } else if (/Linux/i.test(ua)) {
    deviceName = "Linux PC";
    osName = "Linux";
  }

  // 2. Detect Browser
  if (/Edg\//i.test(ua)) {
    browserName = "Edge";
  } else if (/Chrome\//i.test(ua)) {
    browserName = "Chrome";
  } else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) {
    browserName = "Safari";
  } else if (/Firefox\//i.test(ua)) {
    browserName = "Firefox";
  } else if (/SamsungBrowser\//i.test(ua)) {
    browserName = "Samsung Internet";
  }

  // 3. Ensure network & hardware details are ready
  const mac = getOrCreateDeviceMac();
  const uuid = getDeviceUniqueId();
  if (!cachedForensics.fingerprint) await computeDeviceFingerprint();
  if (!cachedForensics.ip) await fetchNetworkIpAndLocation();
  if (!cachedForensics.battery) await getBatteryStatus();

  const now = new Date();
  const timestampIST = now.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const cores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores` : "Multi-core";
  const ram = navigator.deviceMemory ? `${navigator.deviceMemory} GB RAM` : "";
  const dpr = window.devicePixelRatio ? `@${window.devicePixelRatio.toFixed(1)}x` : "";
  const screenSpecs = `${window.innerWidth}x${window.innerHeight} (${screen.width}x${screen.height} ${dpr}) | ${cores}${ram ? ' | ' + ram : ''}`;

  const storedEmail = localStorage.getItem("avm_teacher_email") || "";
  const teacher = state.currentTeacher;
  const teacherEmail = storedEmail || (teacher ? `${teacher.name.toLowerCase().replace(/\s+/g, ".")}@avmschool.in` : "teacher@avmschool.in");

  return {
    device: `${deviceName} (${osName}, ${browserName})`,
    phoneModel: deviceName,
    os: osName,
    browser: browserName,
    macAddress: mac,
    deviceId: uuid,
    fingerprint: cachedForensics.fingerprint,
    ip: cachedForensics.ip || "Direct WebApp Session",
    isp: cachedForensics.isp || "Telecom/Broadband",
    location: cachedForensics.location || "India",
    specs: screenSpecs,
    battery: cachedForensics.battery || "Normal",
    timestamp: timestampIST,
    email: teacherEmail,
    teacherName: teacher ? teacher.name : "Authorized Staff",
    teacherId: teacher ? teacher.id : "AVM-T01",
    teacherDesignation: teacher ? teacher.designation : "Teacher",
    teacherMobile: teacher ? teacher.mobile : ""
  };
}

/**
 * Save Marks Directly to Google Sheet with Comprehensive Forensic Audit
 */
async function handleSaveMarks() {
  if (!state.selectedStudent) return;

  const saveBtn = document.getElementById("saveMarksBtn");
  const saveBtnText = document.getElementById("saveBtnText");
  const originalText = saveBtnText.textContent;

  saveBtn.disabled = true;
  saveBtnText.textContent = "Saving to Google Sheet...";

  const container = document.getElementById("subjectsEntryContainer");
  const inputs = container.querySelectorAll(".mark-input");
  const examKey = state.currentExam;

  if (!state.selectedStudent.marks) state.selectedStudent.marks = {};
  if (!state.selectedStudent.marks[examKey]) state.selectedStudent.marks[examKey] = {};

  const enteredMarksMap = {};

  inputs.forEach(inp => {
    const key = inp.dataset.subject;
    const val = inp.value.trim();
    state.selectedStudent.marks[examKey][key] = val;
    enteredMarksMap[key] = val;
  });

  const appsScriptPayload = formatMarksForAppsScript(enteredMarksMap);
  const auditInfo = await getFullAuditForensics();

  try {
    const res = await fetch(state.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "saveMarks",
        className: state.currentClass,
        studentId: state.selectedStudent.rowNumber,
        examKey: examKey,
        marks: appsScriptPayload,
        audit: auditInfo
      })
    });

    const data = await res.json();
    if (data.status === "error") {
      throw new Error(data.message || "Error saving marks");
    }

    showToast(`✅ Marks saved for ${state.selectedStudent.studentName}! Complete security audit & MAC logged in Google Sheet.`, "success");
    closeMarksModal();

    // Reload sheet data in background
    loadClassStudents(state.currentClass);

  } catch (err) {
    console.error("Save error:", err);
    showToast(`Save failed: ${err.message}`, "error");
  } finally {
    saveBtn.disabled = false;
    saveBtnText.textContent = originalText;
  }
}

function formatMarksForAppsScript(flatMarks) {
  const map = {};
  EVALUATION_SUBJECTS.forEach(subj => {
    if (subj.type === "standard") {
      const v = flatMarks[subj.id];
      map[subj.id] = {
        obt: (v !== undefined && v !== null && String(v).trim() !== "") ? String(v).trim() : ""
      };
    } else {
      const tv = flatMarks[`${subj.id}_theo`];
      const pv = flatMarks[`${subj.id}_prac`];
      map[subj.id] = {
        theoObt: (tv !== undefined && tv !== null && String(tv).trim() !== "") ? String(tv).trim() : "",
        pracObt: (pv !== undefined && pv !== null && String(pv).trim() !== "") ? String(pv).trim() : ""
      };
    }
  });
  return map;
}

/**
 * Setup Event Listeners
 */
function setupEventListeners() {
  // Exam tabs
  document.querySelectorAll(".exam-touch-chip").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".exam-touch-chip").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      state.currentExam = tab.dataset.exam;

      document.getElementById("currentExamBadge").textContent = state.examLabels[state.currentExam];
      document.getElementById("examHeaderName").textContent = `${state.examLabels[state.currentExam]} Marks`;

      renderRoster();
      updateStats();
    });
  });

  // Search input
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("searchClearBtn");

  searchInput.addEventListener("input", (e) => {
    state.activeFilter.search = e.target.value.trim().toLowerCase();
    clearBtn.style.display = state.activeFilter.search ? "block" : "none";
    renderRoster();
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    state.activeFilter.search = "";
    clearBtn.style.display = "none";
    renderRoster();
    searchInput.focus();
  });

  // Filters
  document.getElementById("genderFilter").addEventListener("change", (e) => {
    state.activeFilter.gender = e.target.value;
    renderRoster();
  });

  document.getElementById("categoryFilter").addEventListener("change", (e) => {
    state.activeFilter.category = e.target.value;
    renderRoster();
  });

  // Refresh Sync Button
  document.getElementById("refreshBtn").addEventListener("click", async () => {
    showToast("Syncing all classes & roster with Google Sheet...", "warning");
    await loadAvailableClasses();
    await loadClassStudents(state.currentClass);
    showToast("Synced live data with Google Sheet!", "success");
  });

  // Settings Modal
  document.getElementById("settingsBtn").addEventListener("click", openSettingsModal);
  document.getElementById("connectSheetBtn").addEventListener("click", openSettingsModal);
  document.getElementById("settingsCloseBtn").addEventListener("click", closeSettingsModal);
  document.getElementById("saveSettingsBtn").addEventListener("click", saveSettings);
  document.getElementById("testConnectionBtn").addEventListener("click", testConnection);

  // Teacher Authentication Form & Logout
  const teacherForm = document.getElementById("teacherLoginForm");
  if (teacherForm) {
    teacherForm.addEventListener("submit", handleTeacherLogin);
  }

  const teacherLogoutBtn = document.getElementById("teacherLogoutBtn");
  if (teacherLogoutBtn) {
    teacherLogoutBtn.addEventListener("click", handleTeacherLogout);
  }

  // Return to Class 9 from empty notice
  document.getElementById("returnToClass9Btn").addEventListener("click", () => {
    state.currentClass = "9th";
    renderClassPills();
    loadClassStudents("9th");
  });

  // Marks Entry Modal
  document.getElementById("modalCloseBtn").addEventListener("click", closeMarksModal);
  document.getElementById("prevStudentBtn").addEventListener("click", navigatePrevStudent);
  document.getElementById("nextStudentBtn").addEventListener("click", navigateNextStudent);
  document.getElementById("saveMarksBtn").addEventListener("click", handleSaveMarks);

  // Close modals on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMarksModal();
      closeSettingsModal();
    }
  });
}

/**
 * Handle Teacher Login with case-insensitive name & 10-digit mobile verification
 */
async function handleTeacherLogin(e) {
  if (e) e.preventDefault();

  const nameInput = document.getElementById("loginTeacherName");
  const mobileInput = document.getElementById("loginTeacherMobile");
  const alertBox = document.getElementById("loginAlertBox");
  const submitBtn = document.getElementById("loginSubmitBtn");

  const rawName = (nameInput ? nameInput.value : "").trim();
  const rawMobile = (mobileInput ? mobileInput.value : "").trim();

  alertBox.style.display = "none";
  alertBox.className = "login-alert-banner";

  if (!rawName) {
    alertBox.textContent = "Please enter your Teacher Name.";
    alertBox.classList.add("error");
    alertBox.style.display = "block";
    nameInput.focus();
    return;
  }

  const cleanMobile = rawMobile.replace(/\D/g, "").slice(-10);
  if (cleanMobile.length < 10) {
    alertBox.textContent = "Please enter a valid 10-digit Mobile Number.";
    alertBox.classList.add("error");
    alertBox.style.display = "block";
    mobileInput.focus();
    return;
  }

  const originalBtnHtml = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span>Verifying with School Records...</span>`;

  let verifiedTeacher = null;

  // 1. Live Google Sheets verification via Web App API
  if (state.apiUrl) {
    try {
      const queryUrl = `${state.apiUrl}?action=verifyTeacher&name=${encodeURIComponent(rawName)}&mobile=${encodeURIComponent(cleanMobile)}`;
      const res = await fetch(queryUrl);
      const json = await res.json();
      if (json.status === "success" && json.teacher) {
        verifiedTeacher = json.teacher;
      }
    } catch (err) {
      console.warn("Apps Script teacher verification endpoint error or offline fallback:", err);
    }
  }

  // 2. Direct Fallback: match against school staff directory (case-insensitive & space-tolerant)
  if (!verifiedTeacher) {
    const normInputName = rawName.toLowerCase().replace(/\s+/g, " ");
    const matched = FALLBACK_STAFF_LIST.find(s => {
      const sMobile = s.mobile.replace(/\D/g, "").slice(-10);
      const sName = s.name.toLowerCase().replace(/\s+/g, " ");
      const mobileOk = (sMobile === cleanMobile);
      const nameOk = (sName === normInputName || sName.includes(normInputName) || normInputName.includes(sName));
      return mobileOk && nameOk;
    });

    if (matched) {
      verifiedTeacher = {
        id: matched.id,
        name: matched.name,
        designation: matched.designation,
        mobile: matched.mobile,
        subject: matched.subject
      };
    }
  }

  submitBtn.disabled = false;
  submitBtn.innerHTML = originalBtnHtml;

  if (!verifiedTeacher) {
    alertBox.textContent = "Teacher record not found. Please verify your Name and 10-digit Mobile Number against the school staff sheet.";
    alertBox.classList.add("error");
    alertBox.style.display = "block";
    return;
  }

  // Successful Login
  state.currentTeacher = verifiedTeacher;
  localStorage.setItem("avm_logged_teacher", JSON.stringify(verifiedTeacher));

  showToast(`Welcome, ${verifiedTeacher.name}! Authenticated as ${verifiedTeacher.id}`, "success");
  showTeacherLoginScreen(false);
  showTeacherBanner(true);

  // Initialize data connection
  initConnection();
}

/**
 * Handle Teacher Logout / Switch User
 */
function handleTeacherLogout() {
  const teacherName = state.currentTeacher ? state.currentTeacher.name : "Teacher";
  if (!confirm(`Switch teacher? You will be signed out from (${teacherName}).`)) {
    return;
  }

  localStorage.removeItem("avm_logged_teacher");
  state.currentTeacher = null;
  showTeacherBanner(false);
  showTeacherLoginScreen(true);
  showToast("Signed out. Please log in with your Teacher credentials.", "warning");
}

/**
 * Screen State Toggles
 */
function showLoadingScreen(show) {
  const el = document.getElementById("loadingScreen");
  if (!el) return;
  if (!state.currentTeacher) {
    el.style.display = "none";
    return;
  }
  el.style.display = show ? "flex" : "none";
}

function showDisconnectedScreen(errorMsg) {
  const screen = document.getElementById("disconnectedScreen");
  const liveContent = document.getElementById("liveContentContainer");

  if (!state.currentTeacher) {
    screen.style.display = "none";
    liveContent.style.display = "none";
    return;
  }

  if (errorMsg) {
    screen.style.display = "flex";
    liveContent.style.display = "none";
  } else {
    screen.style.display = "none";
    liveContent.style.display = "block";
  }
}

function updateConnectionUI(connected) {
  const pill = document.getElementById("connectionStatus");
  if (!pill) return;
  if (connected) {
    pill.className = "live-status-pill connected";
    pill.querySelector(".status-lbl").textContent = "Live";
  } else {
    pill.className = "live-status-pill disconnected";
    pill.querySelector(".status-lbl").textContent = "Offline";
  }
}

/**
 * Settings Modal
 */
function openSettingsModal() {
  document.getElementById("scriptUrlInput").value = state.apiUrl;
  const statusCard = document.getElementById("settingsTestStatus");
  statusCard.innerHTML = state.isConnected 
    ? `<span style="color:#059669;">● Connected to Google Sheet</span>`
    : `<span style="color:#dc2626;">● Disconnected from Google Sheet</span>`;
  document.getElementById("settingsModal").style.display = "flex";
}

function closeSettingsModal() {
  document.getElementById("settingsModal").style.display = "none";
}

async function saveSettings() {
  const url = document.getElementById("scriptUrlInput").value.trim();
  state.apiUrl = url;
  localStorage.setItem("avm_apps_script_url", url);
  closeSettingsModal();

  showToast("Connecting to Google Sheet...", "warning");
  await initConnection();
}

async function testConnection() {
  const url = document.getElementById("scriptUrlInput").value.trim();
  const statusBox = document.getElementById("settingsTestStatus");

  if (!url) {
    statusBox.innerHTML = `<span style="color:#dc2626;">Please enter Web App URL</span>`;
    return;
  }

  statusBox.innerHTML = `<span>Pinging Google Apps Script...</span>`;
  try {
    const res = await fetch(`${url}?action=ping`);
    const data = await res.json();
    if (data.status === "success") {
      statusBox.innerHTML = `<span style="color:#059669;">✅ Connection Successful!</span>`;
    } else {
      statusBox.innerHTML = `<span style="color:#dc2626;">Error: ${data.message}</span>`;
    }
  } catch (err) {
    statusBox.innerHTML = `<span style="color:#dc2626;">Failed: ${err.message}. Make sure Web App access is set to "Anyone".</span>`;
  }
}

/**
 * Toast Notifications
 */
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-20px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
