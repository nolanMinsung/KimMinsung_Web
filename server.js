const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Body-parser 설정 (HTML Form 데이터 처리를 위해 urlencoded 필수)
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// 데이터 파일 초기화 함수
function initDataFile() {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = { jjajang: 0, jjamppong: 0 };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
        console.log('[알림] data.json 파일이 없어서 새로 생성했습니다.');
    } else {
        console.log('[알림] 기존 data.json 파일을 발견했습니다.');
    }
}

// 데이터 읽기 헬퍼 함수
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('[주의] 데이터 읽기 오류:', err.message);
        return { jjajang: 0, jjamppong: 0 };
    }
}

// 데이터 쓰기 헬퍼 함수
function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('[오류] 데이터 저장 실패:', err);
    }
}

// 서버 시작 시 파일 초기화
initDataFile();

// 1. GET /vote: 투표 페이지 렌더링
app.get('/vote', (req, res) => {
    const html = `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>짜장 vs 짬뽕 투표</title>
        </head>
        <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
            <h1>🍜 오늘의 점심 메뉴는? 🍜</h1>
            <form action="/vote" method="POST">
                <div style="margin: 20px;">
                    <label style="font-size: 1.5rem; margin-right: 20px;">
                        <input type="radio" name="item" value="jjajang" required> 짜장면 ⚫️
                    </label>
                    <label style="font-size: 1.5rem;">
                        <input type="radio" name="item" value="jjamppong"> 짬뽕 🔴
                    </label>
                </div>
                <button type="submit" style="font-size: 1.2rem; padding: 10px 20px; cursor: pointer;">투표하기</button>
            </form>
        </body>
        </html>
    `;
    res.send(html);
});

// 2. POST /vote: 투표 처리 및 리다이렉트
app.post('/vote', (req, res) => {
    const { item } = req.body;

    // 유효성 검사
    if (!item || (item !== 'jjajang' && item !== 'jjamppong')) {
        return res.status(400).send(`
            <script>
                alert("잘못된 접근입니다. 짜장면 또는 짬뽕을 선택해주세요.");
                history.back();
            </script>
        `);
    }

    // 데이터 업데이트
    const data = readData();
    data[item] += 1;
    writeData(data);

    // 결과 페이지로 리다이렉트
    res.redirect('/result');
});

// 3. GET /result: 결과 페이지
app.get('/result', (req, res) => {
    const data = readData();
    const html = `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>투표 결과</title>
        </head>
        <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
            <h1>📊 현재 투표 결과 📊</h1>
            <div style="font-size: 1.5rem; margin: 30px 0;">
                <p>짜장면 ⚫️ : <strong>${data.jjajang}</strong> 표</p>
                <p>짬뽕 🔴 : <strong>${data.jjamppong}</strong> 표</p>
            </div>
            <hr style="width: 50%; margin: 30px auto;">
            <a href="/vote" style="font-size: 1.2rem; text-decoration: none; color: blue;">↩️ 다시 투표하기</a>
        </body>
        </html>
    `;
    res.send(html);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/vote`);
});
