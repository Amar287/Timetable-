// استيراد المكتبات المطلوبة
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

// إنشاء التطبيق
const app = express();
const PORT = 3000;

// إعدادات المجلدات الثابتة ومحرّك العرض EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, ''));
app.use(express.static(path.join(__dirname, '')));
app.use(bodyParser.urlencoded({ extended: true }));

// قائمة الأوقات الزمنية
const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hours = String(Math.floor(i / 2)).padStart(2, '0');
    const minutes = i % 2 === 0 ? '00' : '30';
    return `${hours}:${minutes}`;
});

// مسار الصفحة الرئيسية
app.get('/', (req, res) => {
    res.render('index', { timeOptions });
});

// مسار إنشاء الجدول
app.post("/schedule", (req, res) => {
    const days = req.body.days || [];
    const subjects = req.body.subjects || [];
    const busyTimes = req.body.busyTimes || {};
    const studyDuration = parseInt(req.body.studyDuration, 10) || 90;

    let schedule = {};

    days.forEach(day => {
        let currentTime = new Date("2023-01-01T14:00:00");
        schedule[day] = {};

        subjects.forEach(subject => {
            if (busyTimes[day] && busyTimes[day].start && busyTimes[day].end) {
                const busyStartTime = new Date(`2023-01-01T${busyTimes[day].start}`);
                const busyEndTime = new Date(`2023-01-01T${busyTimes[day].end}`);

                if (currentTime >= busyStartTime && currentTime < busyEndTime) {
                    currentTime = busyEndTime;
                }
            }

            const endTime = new Date(currentTime.getTime() + studyDuration * 60000);
            const sessionTime = `${currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            schedule[day][subject] = sessionTime;
            currentTime = endTime;
        });
    });

    res.render("schedule", { schedule });
});

// تشغيل الخادم
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
