const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Body-parser 설정 (Express 4.16+ 내장 미들웨어 사용)
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// 데이터 파일 초기화 함수
function initDataFile() {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = { jjajang: 0, jjamppong: 0 };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
        console.log('data.json 파일이 생성되었습니다.');
    }
}

// 데이터 읽기 헬퍼 함수
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('데이터 읽기 오류:', err);
        return { jjajang: 0, jjamppong: 0 };
    }
}

// 데이터 쓰기 헬퍼 함수
function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('데이터 쓰기 오류:', err);
    }
}

// 서버 시작 시 파일 초기화 확인
initDataFile();

// API: 현재 투표 현황 조회
app.get('/vote', (req, res) => {
    const data = readData();
    res.json(data);
});

// API: 투표하기
app.post('/vote', (req, res) => {
    const { item } = req.body; // item은 'jjajang' 또는 'jjamppong'이어야 함

    if (!item || (item !== 'jjajang' && item !== 'jjamppong')) {
        return res.status(400).json({ 
            success: false, 
            message: "잘못된 투표 항목입니다. 'jjajang' 또는 'jjamppong'을 선택해주세요." 
        });
    }

    const data = readData();
    data[item] += 1; // 투표 수 증가
    writeData(data); // 파일에 저장

    res.json({ 
        success: true, 
        message: `${item}에 투표하셨습니다.`, 
        currentStatus: data 
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
