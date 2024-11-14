const mysql = require('mysql2/promise');

async function initSeats() {
    console.time("Total Execution Time"); // 전체 실행 시간 측정 시작
    for (let n = 0; n < 10; n++) {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'qwe124!@$', 
            database: 'ticketing'
        });

        try {
            console.log("Initializing seat...");
            for (let i = n * 5 + 1; i <= n * 5 + 5; i++) {
                // 콘서트 데이터 삽입
                //const concertQuery = `INSERT INTO concert VALUES (?, ?, NOW())`;
                //await connection.execute(concertQuery, [i, `concert${i}`]);
                const ticketPromises = [];
                for (let j = 1; j <= 50; j++) {
                    const concertPlanId = i * 100 + j;
                    //const concertDate = new Date(2024, j % 12, j).toISOString().split('T')[0];
                    //const concertPlanQuery = `INSERT INTO concert_plan VALUES (?, ?, ?, ?, ?, ?)`;
                    //await connection.execute(concertPlanQuery, [concertPlanId, i, concertDate, true, 50, 0]);
                    
                    // 티켓 데이터 배치 처리
                    let ticketQuery = 'INSERT INTO concert_ticket (concertId, concertTicketId, concertPlanId, seatNumber, status) VALUES ';
                    await connection.beginTransaction();
                    for (let k = 0; k < 5000; k++) {
                        const status = 'reservatable';
                        const ticketUniqueId = concertPlanId * 10000 + k;
                        let pointer = ",";
                        if(k == 4999) pointer = "";
                        ticketQuery += `(${n}, ${ticketUniqueId}, ${concertPlanId}, ${k}, '${status}')${pointer}`
                    }
                    ticketPromises.push(connection.execute(ticketQuery));
                    await connection.commit();
                    console.log(`Inserted tickets for concert ${i}, plan ${concertPlanId}`);
                }
                console.time("Each Execution Time"); // 전체 실행 시간 측정 시작
                await Promise.all(ticketPromises);
                console.timeEnd("Each Execution Time"); // 전체 실행 시간 측정 시작
            }

                console.log(`insert Complete`);
        } catch (error) {
            await connection.rollback();
            console.error("Error initializing seat:", error);
        } finally {
            await connection.end();
        }
    }
    console.timeEnd("Total Execution Time"); // 전체 실행 시간 측정 종료
}

// 실행
initSeats().catch(console.error);
