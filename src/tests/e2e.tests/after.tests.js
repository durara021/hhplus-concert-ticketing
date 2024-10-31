const mysql = require('mysql2/promise');

async function resetDatabase() {
    const connection = await mysql.createConnection({
        host: 'localhost',      // 데이터베이스 호스트
        user: 'root',           // 데이터베이스 사용자명
        password: 'qwe124!@$',  // 데이터베이스 비밀번호
        database: 'ticketing'   // 데이터베이스 이름
    });

    try {
        console.log("Resetting database...");

        // 모든 테이블 삭제 쿼리 (테이블을 남기고 데이터만 초기화)
        const [tables] = await connection.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'ticketing';
        `);

        for (let row of tables) {
            const tableName = row['TABLE_NAME'];
            await connection.execute(`TRUNCATE TABLE \`${tableName}\`;`);
            console.log(`Table ${tableName} has been reset.`);
        }

        console.log("Database reset successfully.");

    } catch (error) {
        console.error("Error resetting database:", error);
    } finally {
        await connection.end();
    }
}

resetDatabase().catch(console.error);
