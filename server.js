const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('.'));

const dbPath = path.join(__dirname, 'database.json');

function readDB() {
    if (!fs.existsSync(dbPath)) {
        const locations = [
            { id: 'DEV-01', loc: 'مصفى كربلاء' },
            { id: 'DEV-02', loc: 'بلدية الهندية' },
            { id: 'DEV-03', loc: 'بلدية الجدول الغربي' },
            { id: 'DEV-04', loc: 'زراعة كربلاء' },
            { id: 'DEV-05', loc: 'جامعة كربلاء' },
            { id: 'DEV-06', loc: 'مجاري كربلاء' },
            { id: 'DEV-07', loc: 'ناحية الخيرات' },
            { id: 'DEV-08', loc: 'بلدية كربلاء' }
        ];

        const transactions = [];
        locations.forEach(target => {
            const baseAmountMonth5 = Math.floor(Math.random() * 300000000) + 100000000; 
            const baseAmountMonth6 = Math.floor(Math.random() * 300000000) + 100000000; 
            for(let k=0; k<50; k++) {
                transactions.push({ location: target.loc, amount: baseAmountMonth5 / 50, status: 'ناجحة', created_at: `2026-05-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}` });
                transactions.push({ location: target.loc, amount: baseAmountMonth6 / 50, status: 'ناجحة', created_at: `2026-06-${String(Math.floor(Math.random() * 22) + 1).padStart(2, '0')}` });
            }
        });

        const initialData = { users: [{ username: 'admin', password: '123' }], transactions: transactions };
        fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf8');
        return initialData;
    }
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

readDB();

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const dbData = readDB();
    const user = dbData.users.find(u => u.username === username && u.password === password);
    if (user) res.json({ success: true });
    else res.status(401).json({ success: false });
});

app.get('/api/month-comparison', (req, res) => {
    const dbData = readDB();
    const comparisonData = {};
    dbData.transactions.filter(t => t.status === 'ناجحة').forEach(t => {
        if (!comparisonData[t.location]) comparisonData[t.location] = { location: t.location, currentMonth: 0, lastMonth: 0 };
        if (t.created_at.startsWith('2026-06')) comparisonData[t.location].currentMonth += t.amount;
        else if (t.created_at.startsWith('2026-05')) comparisonData[t.location].lastMonth += t.amount;
    });
    res.json(Object.values(comparisonData).map(row => ({
        ...row,
        predictedNextMonth: Math.round(row.currentMonth * 1.05),
        predictedChange: "5.0",
        aiRecommendation: "أداء مستقر، يرجى الاستمرار بنفس الوتيرة."
    })));
});

app.get('/api/accounting-report', (req, res) => {
    const dbData = readDB();
    const accountingSummary = {};
    dbData.transactions.filter(t => t.status === 'ناجحة' && t.created_at.startsWith('2026-06')).forEach(t => {
        if (!accountingSummary[t.location]) accountingSummary[t.location] = { location: t.location, totalCollected: 0 };
        accountingSummary[t.location].totalCollected += t.amount;
    });
    res.json(Object.values(accountingSummary).map(row => {
        const comm = row.totalCollected * 0.02;
        return {
            location: row.location,
            totalCollected: Math.round(row.totalCollected),
            commission: Math.round(comm),
            tax: Math.round(comm * 0.05),
            discrepancy: Math.floor(Math.random() * 10000) - 5000,
            bankTransferred: Math.round(row.totalCollected - comm)
        };
    }));
});

// السطر المحدث أدناه هو الذي سيجعل المنصة متاحة لأي جهاز في الشبكة
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('📊 المنصة جاهزة لاستقبال الاتصالات من أي جهاز!');
});