// ⚙️ 系統配置檔案

const CONFIG = {
    // 測試模式（設為 true 時使用假資料）
    TEST_MODE: true,
    
    // 假資料（TEST_MODE = true 時使用）
    DEMO_DATA: {
        '0912345678': [
            {
                studentNo: 'GAG699',
                studentName: '張小明',
                age: 10,
                grade: '國小四年級',
                instrument: 'Acoustic Guitar',
                contact: '0912345678',
                payments: [
                    { month: 'JAN', amount: 1500, receiptNo: 'R2024001', isPaid: true },
                    { month: 'FEB', amount: 1500, receiptNo: 'R2024002', isPaid: true },
                    { month: 'MAR', amount: 1500, receiptNo: '', isPaid: false },
                    { month: 'APR', amount: 1500, receiptNo: '', isPaid: false },
                ]
            }
        ],
        '0987654321': [
            {
                studentNo: 'P720',
                studentName: '李小華',
                age: 12,
                grade: '國小六年級',
                instrument: 'Piano',
                contact: '0987654321',
                payments: [
                    { month: 'JAN', amount: 2000, receiptNo: 'R2024010', isPaid: true },
                    { month: 'FEB', amount: 2000, receiptNo: '', isPaid: false },
                    { month: 'MAR', amount: 2000, receiptNo: '', isPaid: false },
                ]
            },
            {
                studentNo: 'PA619(S)',
                studentName: '李小美',
                age: 9,
                grade: '國小三年級',
                instrument: 'Piano',
                contact: '0987654321',
                payments: [
                    { month: 'JAN', amount: 1800, receiptNo: 'R2024011', isPaid: true },
                    { month: 'FEB', amount: 1800, receiptNo: '', isPaid: false },
                ]
            }
        ]
    },
    
    // === 以下為 Google Sheets 設定（選擇性）===
    // 如果要連接真實的 Google Sheets，請填寫以下資訊並將 TEST_MODE 改為 false
    
    // Google Sheets ID（從網址中取得）
    // 網址格式：https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
    SHEET_ID: '',
    
    // Google API Key（從 Google Cloud Console 取得）
    API_KEY: '',
    
    // Sheet 名稱
    SHEET_NAME: 'Sheet1'
};

// 驗證手機號碼格式
function validatePhone(phone) {
    const cleaned = phone.replace(/[-\s]/g, '');
    return /^09\d{8}$/.test(cleaned);
}

// 格式化手機號碼
function normalizePhone(phone) {
    return phone.replace(/[-\s]/g, '');
}
