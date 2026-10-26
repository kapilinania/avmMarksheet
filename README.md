# 📱 AVM School Marksheet Portal — Mobile Responsive & Audit Trail Edition

> **Adarsh Vidya Mandir (AVM) School** — Complete 100% Zero-Overflow Mobile Responsive Web Application + Google Apps Script (`Code.gs`) for Google Sheets with **Mathematics**, **Cell Comment Audit**, and **Automatic Information Sheet Logging**.

---

## 🌟 What's New in this Update

### 1. 📐 Mathematics (गणित) Subject Added
- Added **Mathematics** alongside Hindi, English, Sanskrit, Science, and Social Science.
- Exam marks scheme:
  - **1st Periodic Test**: Max 10
  - **2nd Periodic Test**: Max 10
  - **Half-Yearly Examination**: Max 70
  - **3rd Periodic Test**: Max 10
  - **Annual Examination**: Max 100
  - **Total Marks**: Max 200 (Grades A+ to E)
- **Dynamic Header Detection**: Google Apps Script automatically inspects Row 1 & 2 headers. Regardless of where Mathematics is inserted in your spreadsheet (after Science, after Social Science, or anywhere else), the system automatically maps the exact columns without breaking existing data or positions!

---

### 2. 🛡️ Comprehensive Security Forensics & Cell-by-Cell Comment
- Integrated **FingerprintJS** and network hardware telemetry into [`index.html`](file:///c:/Users/Kapil/Desktop/avm%20Marksheet/index.html) and [`app.js`](file:///c:/Users/Kapil/Desktop/avm%20Marksheet/app.js).
- If ANY unauthorized person edits a mark, the cell note (comment) in Google Sheets records their **full un-forgeable proof**:
  ```text
  [26-Oct-2026, 08:35:10 AM IST]
  Subject: Science (Half-Yearly Examination)
  Marks Change: 52 ➔ 64
  ----------------------------------------
  Editor Email: teacher@avmschool.in
  Device/Phone: Samsung Galaxy M34 (Android 14, Mobile Chrome)
  MAC Address: E4:5F:01:4B:9C:2A
  Device UUID: DEV-8E2B-4A91
  IP Address: 157.34.120.45 (Reliance Jio Infocomm)
  Location: Jodhpur, Rajasthan, IN
  Security Token: FP-9A7C81D3F02E
  Hardware Specs: 1080x2400 (DPR 2.8) | 8 Cores | 6 GB RAM
  Battery Status: 84% (⚡ Charging)
  ```

---

### 3. 📊 16-Column 'Information Sheet' Forensic Tab (ऑडिट लॉग)
- Automatically creates and manages a dedicated tab named **`'Information Sheet'`** at the end of the workbook.
- Every mark edited anywhere records **16 forensic audit columns**:
  1. **Timestamp (IST)**
  2. **Class**
  3. **Student SR No.**
  4. **Student Name**
  5. **Exam Name**
  6. **Subject**
  7. **Previous Marks**
  8. **New Marks Entered**
  9. **Device / Phone Model**
  10. **MAC Address**
  11. **Device UUID**
  12. **IP Address & ISP**
  13. **Location (City/State)**
  14. **Security Fingerprint Token**
  15. **Hardware Specs & Battery**
  16. **Editor Email ID**

---

### 4. 📝 8-Column Audit at End of Each Class Sheet
- At the end of each class sheet (`9th`, `10th`, etc.), 8 audit columns automatically track the latest edit:
  1. `Audit: Last Modified (IST)`
  2. `Audit: Editor Email`
  3. `Audit: Phone / Device Model`
  4. `Audit: MAC Address`
  5. `Audit: Device UUID`
  6. `Audit: IP & Location`
  7. `Audit: Hardware Specs`
  8. `Audit: Changes Summary`

---

### 5. 🆔 Student Roll No & Aadhar No Integration
- **Direct Extraction from Sheet**: Automatically reads **Roll No** (Column E) and **Aadhar No** (Column F) with large-number formatting to avoid scientific notation.
- **Mobile Cards View**: Displays `Roll: ...` and `Aadhar: ...` badges on student cards if present in the spreadsheet; if absent or blank, keeps the card clean and uncluttered.
- **Desktop Table View**: Added dedicated **Roll No** and **Aadhar No** table columns. If present in sheet, values are displayed; if empty, displayed as blank (`—`).
- **Marks Entry Modal**: Displays Roll No and Aadhar No in the read-only student demographics section.
- **Multi-Field Instant Search**: Teachers can now search students by **Roll No** or **Aadhar No** in addition to Name, Father's Name, SR No, and NIC ID.

---

### 6. 🤖 100% Direct Pick (Zero Prompts to Teacher)
- As requested, **the user is never asked for their device, time, or phone details**.
- The client automatically extracts the phone manufacturer, model, operating system, browser, screen resolution, and local timestamp in the background and sends it securely to Google Apps Script.

---

### 6. 📱 Zero-Horizontal-Scroll Mobile Experience
- **Locked Mobile Card View**: On mobile screens (< 768px), the layout is strictly locked to touch-friendly cards so horizontal table scrolling never occurs.
- **Scroll containment (`overscroll-behavior-x: contain`)**: Swiping class or exam chips never shakes or horizontally wiggles the page.
- **High Touch Ergonomics**: Minimum 44px touch targets, large numeric entry fields (`inputmode="decimal"`), and instant red alert validation if marks exceed maximum.

---

## 🚀 How to Update Google Apps Script (`Code.gs`)

1. Open your Google Spreadsheet **"AvmStudentData"**.
2. Click **Extensions** &rarr; **Apps Script**.
3. Select all code in `Code.gs` and replace with the updated [`Code.gs`](file:///c:/Users/Kapil/Desktop/avm%20Marksheet/Code.gs).
4. Click **Save (Ctrl + S)**.
5. Click **Deploy** &rarr; **Manage Deployments**:
   - Click the **Pencil icon (Edit)** next to your active deployment.
   - Under **Version**, choose **New Version**.
   - Ensure **Execute as**: `Me` and **Who has access**: `Anyone`.
   - Click **Deploy**.
6. The web app is now fully upgraded with Mathematics, Cell Comments, 'Information Sheet', and zero-overflow mobile layout!

---

## 📁 Project Files

| File | Description |
|---|---|
| [`Code.gs`](file:///c:/Users/Kapil/Desktop/avm%20Marksheet/Code.gs) | Google Apps Script: Dynamic header detection, Mathematics, Cell Notes, End of sheet columns, 'Information Sheet' log. |
| [`app.js`](file:///c:/Users/Kapil/Desktop/avm%20Marksheet/app.js) | Frontend engine: Auto-telemetry detector, Mathematics validation, live scores, and Apps Script communication. |
| [`index.html`](file:///c:/Users/Kapil/Desktop/avm%20Marksheet/index.html) | Mobile-first HTML5 interface with zero-overflow viewport and modal bottom sheet. |
| [`style.css`](file:///c:/Users/Kapil/Desktop/avm%20Marksheet/style.css) | Mobile-first CSS: Scroll containment, touch controls, and responsive styling. |
