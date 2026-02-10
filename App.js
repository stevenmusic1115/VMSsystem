// 主要應用程式邏輯

// 從 Google Sheets 讀取資料
async function fetchStudentData(phone) {
    // 如果是測試模式，使用假資料
    if (CONFIG.TEST_MODE) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = CONFIG.DEMO_DATA[phone];
                if (data) {
                    resolve({ success: true, students: data });
                } else {
                    resolve({ success: false, error: '找不到與此手機號碼相關的學生' });
                }
            }, 500); // 模擬網路延遲
        });
    }

    // 正式模式：從 Google Sheets API 讀取
    if (!CONFIG.SHEET_ID || !CONFIG.API_KEY) {
        return { 
            success: false, 
            error: '請先在 config.js 中設定 SHEET_ID 和 API_KEY' 
        };
    }

    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${CONFIG.SHEET_NAME}?key=${CONFIG.API_KEY}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (!data.values || data.values.length < 2) {
            return { success: false, error: '找不到學生資料' };
        }

        const headers = data.values[0];
        const rows = data.values.slice(1);
        
        // 解析資料
        const students = [];
        const normalizedPhone = normalizePhone(phone);

        for (const row of rows) {
            const studentPhone = normalizePhone(row[1] || ''); // Contact 在 B 欄
            
            if (studentPhone === normalizedPhone) {
                const payments = [];
                const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                               'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                
                // 解析每個月的繳費記錄 (從 I 欄開始，每月佔兩欄)
                for (let m = 0; m < 12; m++) {
                    const receiptCol = 8 + (m * 2);
                    const amountCol = receiptCol + 1;
                    
                    if (row[amountCol]) {
                        payments.push({
                            month: months[m],
                            receiptNo: row[receiptCol] || '',
                            amount: parseFloat(row[amountCol]) || 0,
                            isPaid: !!(row[receiptCol] && row[amountCol])
                        });
                    }
                }

                students.push({
                    studentNo: row[0] || '',
                    contact: row[1] || '',
                    studentName: row[2] || '',
                    age: parseInt(row[3]) || 0,
                    grade: row[4] || '',
                    instrument: row[7] || '',
                    payments
                });
            }
        }

        if (students.length === 0) {
            return { success: false, error: '找不到與此手機號碼相關的學生' };
        }

        return { success: true, students };

    } catch (error) {
        console.error('Error fetching data:', error);
        return { success: false, error: '系統錯誤，請稍後再試' };
    }
}

// 顯示學生資訊
function displayStudentInfo(students) {
    const container = document.getElementById('studentInfo');
    container.innerHTML = '';

    students.forEach(student => {
        const card = document.createElement('div');
        card.className = 'student-card';
        
        card.innerHTML = `
            <div class="student-header">
                <div class="student-name">${student.studentName}</div>
                <div class="student-no">${student.studentNo}</div>
            </div>
            
            <div class="info-row">
                <span class="info-label">樂器</span>
                <span class="info-value">${student.instrument}</span>
            </div>
            <div class="info-row">
                <span class="info-label">年齡</span>
                <span class="info-value">${student.age} 歲</span>
            </div>
            <div class="info-row">
                <span class="info-label">年級</span>
                <span class="info-value">${student.grade}</span>
            </div>

            <h3 style="margin-top: 20px; margin-bottom: 10px; color: #333;">繳費記錄</h3>
            <table class="payment-table">
                <thead>
                    <tr>
                        <th>月份</th>
                        <th>金額</th>
                        <th>收據編號</th>
                        <th>狀態</th>
                    </tr>
                </thead>
                <tbody>
                    ${student.payments.map(payment => `
                        <tr>
                            <td>${payment.month}</td>
                            <td>$${payment.amount}</td>
                            <td>${payment.receiptNo || '-'}</td>
                            <td>
                                <span class="status-badge ${payment.isPaid ? 'status-paid' : 'status-unpaid'}">
                                    ${payment.isPaid ? '已繳費' : '未繳費'}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.appendChild(card);
    });
}

// 處理登入表單
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const phone = document.getElementById('phone').value;
    const errorMsg = document.getElementById('errorMsg');
    const loginPage = document.getElementById('loginPage');
    const dashboardPage = document.getElementById('dashboardPage');

    // 驗證手機號碼
    if (!validatePhone(phone)) {
        errorMsg.textContent = '請輸入有效的手機號碼（格式：09xxxxxxxx）';
        errorMsg.classList.remove('hidden');
        return;
    }

    // 隱藏錯誤訊息
    errorMsg.classList.add('hidden');

    // 顯示載入中
    const btn = e.target.querySelector('.btn');
    const originalText = btn.textContent;
    btn.textContent = '查詢中...';
    btn.disabled = true;

    // 查詢資料
    const result = await fetchStudentData(phone);

    // 恢復按鈕
    btn.textContent = originalText;
    btn.disabled = false;

    if (result.success) {
        // 儲存到 localStorage
        localStorage.setItem('currentPhone', phone);
        localStorage.setItem('students', JSON.stringify(result.students));

        // 顯示學生資訊
        displayStudentInfo(result.students);

        // 切換頁面
        loginPage.classList.add('hidden');
        dashboardPage.classList.remove('hidden');
    } else {
        errorMsg.textContent = result.error;
        errorMsg.classList.remove('hidden');
    }
});

// 登出功能
function logout() {
    localStorage.removeItem('currentPhone');
    localStorage.removeItem('students');
    
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('dashboardPage').classList.add('hidden');
    document.getElementById('phone').value = '';
}

// 頁面載入時檢查是否已登入
window.addEventListener('load', () => {
    const students = localStorage.getItem('students');
    if (students) {
        try {
            const data = JSON.parse(students);
            displayStudentInfo(data);
            document.getElementById('loginPage').classList.add('hidden');
            document.getElementById('dashboardPage').classList.remove('hidden');
        } catch (e) {
            localStorage.removeItem('students');
        }
    }
});
