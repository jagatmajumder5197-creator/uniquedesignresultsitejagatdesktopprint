const WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbyOnxQqelRC93Xmx61AHsmX3XsB6u3qKK_LtY0miKigHQGwH2fz75Ho1hxy8YoYYsYWQQ/exec';

let allStudents = [];

const subjects = [
  { name: 'BENGALI', fm: 'FMB', written: 'WTB', oral: 'OLB' },
  { name: 'ENGLISH', fm: 'FME', written: 'WTE', oral: 'OLE' },
  { name: 'MATHEMATICS', fm: 'FMM', written: 'WTM', oral: 'OLM' },
  { name: 'HINDI', fm: 'FMHN', written: 'WTHN', oral: 'OLHN' },
  { name: 'COMPUTER', fm: 'FMCM', written: 'WTCM', oral: 'OLCM' },
  { name: 'GK', fm: 'FMGK', written: 'WTGK', oral: 'OLGK' },
  { name: 'EVS', fm: 'FMEV', written: 'WTEV', oral: 'OLEV' },
  { name: 'LSC', fm: 'FMLSC', written: 'WTLSC', oral: 'OLLSC' },
  { name: 'PSC', fm: 'FMPSC', written: 'WTPSC', oral: 'OLPSC' },
  { name: 'BENG RHYM', fm: 'FMRYMB', written: 'WTRYMB', oral: 'OLRYMB' },
  { name: 'ENG RHYM', fm: 'FMRYME', written: 'WTRYME', oral: 'OLRYME' },
  { name: 'HISTORY', fm: 'FMHS', written: 'WTHS', oral: 'OLHS' },
  { name: 'GEOGRAPHY', fm: 'FMG', written: 'WTG', oral: 'OLG' }
];

const CLASS_ORDER = [
  'NUR_A', 'NUR_B', 'LKG_A', 'LKG_B', 'UKG_A', 'UKG_B',
  'I (A)', 'I (B)', 'II (Two)', 'III (Three)', 'IV (Four)',
  'V (Five)', 'VI (Six)', 'VII (Seven)', 'VIII (Eight)',
  'IX (Nine)', 'X (Ten)'
];

function classSortIndex(cls) {
  const idx = CLASS_ORDER.indexOf(cls);
  return idx === -1 ? CLASS_ORDER.length + 1 : idx;
}

function safeNum(val) {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

window.onload = async () => {
  const loaderWrap = document.getElementById('loaderWrap');
  const errorBox = document.getElementById('errorBox');
  const classSelect = document.getElementById('classSelect');
  const stuSelect = document.getElementById('studentSelect');
  const viewBtn = document.getElementById('viewResultBtn');

  try {
    const response = await fetch(WEB_APP_URL + '?t=' + Date.now(), {
      method: 'GET',
      cache: 'no-store'
    });

    if (!response.ok) throw new Error('Network response was not ok');

    allStudents = await response.json();
    if (!Array.isArray(allStudents)) throw new Error('Invalid JSON Data');

    loaderWrap.classList.add('hidden');
    classSelect.disabled = false;
    stuSelect.disabled = false;
    viewBtn.disabled = false;

    loadClassDropdown();
  } catch (err) {
    console.error('API Error:', err);
    loaderWrap.classList.add('hidden');
    errorBox.classList.remove('hidden');
    errorBox.innerHTML = '<div>Failed to Load Result Data. Please Try Again Later.</div>';
  }
};

function loadClassDropdown() {
  const classSelect = document.getElementById('classSelect');
  classSelect.innerHTML = '<option value="">SELECT CLASS</option>';

  const classes = [...new Set(allStudents.map(s => s.CLASS).filter(Boolean))];
  classes.sort((a, b) => {
    const diff = classSortIndex(a) - classSortIndex(b);
    return diff !== 0 ? diff : String(a).localeCompare(String(b));
  });

  classes.forEach(cls => {
    const option = document.createElement('option');
    option.value = cls;
    option.textContent = cls;
    classSelect.appendChild(option);
  });
}

document.getElementById('classSelect').addEventListener('change', function () {
  const cls = this.value;

  const signatureMap = {
    "NUR_A": "nura.png", "NUR_B": "nurb.png",
    "LKG_A": "lkga.png", "LKG_B": "lkgb.png",
    "UKG_A": "ukga.png", "UKG_B": "ukgb.png",
    "I (A)": "ia.png", "I (B)": "ib.png",
    "II (Two)": "iia.png", "III (Three)": "iiia.png",
    "IV (Four)": "iva.png", "V (Five)": "va.png",
    "VI (Six)": "via.png", "VII (Seven)": "viia.png",
    "VIII (Eight)": "viiia.png", "IX (Nine)": "jagatinfras.png",
    "X (Ten)": "jagatinfras.png"
  };

  const signImg = document.getElementById('classTeacherSign');
  if (signImg) {
    if (cls && signatureMap[cls]) {
      signImg.src = `Images/${signatureMap[cls]}`;
      signImg.style.display = 'block';
    } else {
      signImg.style.display = 'none';
    }
  }

  const studentSelect = document.getElementById('studentSelect');
  studentSelect.innerHTML = '<option value="">SELECT STUDENT</option>';

  if (!cls) return;

  const students = allStudents.filter(s => String(s.CLASS) === String(cls));
  students.sort((a, b) => safeNum(a.ROLL) - safeNum(b.ROLL));

  students.forEach(student => {
    const option = document.createElement('option');
    option.value = student.I_D;
    option.textContent = student.STUDENTS_NAME || 'Unknown';
    studentSelect.appendChild(option);
  });
});

document.getElementById('viewResultBtn').addEventListener('click', showResult);

function showResult() {
  const id = document.getElementById('studentSelect').value;
  if (!id) {
    alert('Please select a student.');
    return;
  }

  const student = allStudents.find(s => String(s.I_D) === String(id));
  if (!student) {
    alert('No result found.');
    return;
  }

  renderResult(student);
  document.getElementById('resultWrapper').scrollIntoView({ behavior: 'smooth' });
}

function getGrade(percent) {
  const p = Number(percent);
  if (p >= 90) return 'AA';
  if (p >= 80) return 'A+';
  if (p >= 60) return 'A';
  if (p >= 45) return 'B+';
  if (p >= 35) return 'B';
  if (p >= 25) return 'C';
  return 'D';
}

function getFmBreakdown(fm, writtenVal, studentClass, subject) {
  if (fm === 100) return { written: 90, oral: 10 };
  if (fm === 25) return { written: '', oral: 25 };

  if (fm === 50) {
    const gkClasses = ['NUR_A', 'NUR_B', 'LKG_A', 'LKG_B'];
    const isGk = (subject === 'GK');

    if (gkClasses.includes(studentClass) && isGk) {
      return { written: '', oral: 50 };
    }

    const hindiClasses = ['UKG_A', 'UKG_B', 'I (A)', 'I (B)'];
    const isHindi = (subject === 'HN' || subject === 'HINDI');

    if (hindiClasses.includes(studentClass) && isHindi) {
      return { written: 40, oral: 10 };
    }

    return { written: 45, oral: 5 };
  }

  return { written: fm, oral: 0 };
}

function calculateRank(cls, studentId) {
  const classStudents = allStudents
    .filter(s => String(s.CLASS) === String(cls))
    .map(s => {
      let total = 0;
      subjects.forEach(sub => {
        const fm = safeNum(s[sub.fm]);
        if (fm > 0) {
          total += safeNum(s[sub.written]) + safeNum(s[sub.oral]);
        }
      });
      return { id: s.I_D, totalMarks: total };
    })
    .sort((a, b) => b.totalMarks - a.totalMarks);

  let rank = 1;
  for (let i = 0; i < classStudents.length; i++) {
    if (i > 0 && classStudents[i].totalMarks < classStudents[i - 1].totalMarks) {
      rank = i + 1;
    }
    if (String(classStudents[i].id) === String(studentId)) return rank;
  }
  return '-';
}

function renderResult(student) {
  document.getElementById('resultWrapper').classList.remove('hidden');

  document.getElementById('studentName').innerText = student.STUDENTS_NAME || '';
  document.getElementById('fatherName').innerText = student.FATHERS_NAME || '';
  document.getElementById('studentClass').innerText = student.CLASS || '';
  document.getElementById('rollNumber').innerText = student.ROLL || '';

  const tbody = document.getElementById('subjectTableBody');
  tbody.innerHTML = '';

  let grandFullMarks = 0;
  let grandObtained = 0;
  let hasFailed = false;
  let rowsHtml = '';

  subjects.forEach(sub => {
    const fm = safeNum(student[sub.fm]);
    if (fm <= 0) return;

    const obtainedWritten = safeNum(student[sub.written]);
    const obtainedOral = safeNum(student[sub.oral]);
    const total = obtainedWritten + obtainedOral;
    const percentage = fm > 0 ? (total / fm) * 100 : 0;
    const grade = getGrade(percentage);

    if (grade === 'D') {
      hasFailed = true;
    }

    grandFullMarks += fm;
    grandObtained += total;

    const fmStructure = getFmBreakdown(fm, student[sub.written], student.CLASS, sub.name);

    rowsHtml += `
      <tr>
        <td><b>${sub.name}</b></td>
        <td>${fmStructure.written}</td>
        <td>${fmStructure.oral}</td>
        <td><b>${fm}</b></td>
        <td class="spacer-col"></td>
        <td>${obtainedWritten}</td>
        <td>${obtainedOral}</td>
        <td><b>${total}</b></td>
        <td>${percentage.toFixed(2)}%</td>
        <td><b>${grade}</b></td>
      </tr>
    `;
  });

  tbody.innerHTML = rowsHtml;

  const grandPercentage = grandFullMarks > 0 ? (grandObtained / grandFullMarks) * 100 : 0;
  const grandGrade = getGrade(grandPercentage);
  const calculatedRank = calculateRank(student.CLASS, student.I_D);

  const artVal = student.ART || student.Art || 'A<sup>+</sup>';
  document.getElementById('artGrade').innerHTML = artVal;

  document.getElementById('grandFullMarks').innerText = grandFullMarks;
  document.getElementById('grandTotal').innerText = grandObtained;
  document.getElementById('grandPercentage').innerText = grandPercentage.toFixed(2) + '%';

  const resultElem = document.getElementById('grandResult');
  resultElem.innerText = hasFailed ? 'Fail' : 'Pass';

  document.getElementById('grandGrade').innerText = grandGrade;
  document.getElementById('grandRank').innerHTML = formatOrdinal(calculatedRank);
}

function formatOrdinal(value) {
  const n = parseInt(value, 10);
  if (isNaN(n) || value === '' || value === '-') return value;

  const lastTwo = n % 100;
  const lastOne = n % 10;

  if (lastTwo >= 11 && lastTwo <= 13) return n + '<sup>th</sup>';
  if (lastOne === 1) return n + '<sup>st</sup>';
  if (lastOne === 2) return n + '<sup>nd</sup>';
  if (lastOne === 3) return n + '<sup>rd</sup>';
  return n + '<sup>th</sup>';
}

function downloadPDF() {
  const element = document.getElementById('marksheet');
  const studentName = document.getElementById('studentName').innerText || 'Student';

  const opt = {
    margin: 0,
    filename: 'Result_' + studentName + '.pdf',
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}
