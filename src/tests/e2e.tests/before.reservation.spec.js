const mysql = require('mysql2/promise');

async function initSeats() {
    // MySQL 데이터베이스 연결 설정
    const connection = await mysql.createConnection({
        host: 'localhost',      // 데이터베이스 호스트
        user: 'root',       // 데이터베이스 사용자명
        password: 'qwe124!@$',   // 데이터베이스 비밀번호
        database: 'ticketing'  // 데이터베이스 이름
    });

    try {
        console.log("Initializing seat...");

        // 콘서트 좌석 생성 쿼리
        const query = `
            INSERT INTO reservation (mainCategory, subCategory, minorCategory) VALUES (1, 1, 1);
        `;

        // 쿼리 실행
        await connection.execute(query);
        console.log("Seat initialized successfully.");

    } catch (error) {
        console.error("Error initializing seat:", error);
    } finally {
        // 연결 종료
        await connection.end();
    }
}

// 스크립트 실행
initSeats().catch(console.error);
