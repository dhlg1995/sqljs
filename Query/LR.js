
import sql from "mssql"

var config = {
    user: 'sa',
    password: 'fa11@123',
    server: '192.168.1.19',
    //server: '192.168.1.186',
    port: 1438,
    database: 'Forms',
    options: {
        encrypt: false,
        trustServerCertificate: true,
    }
};


export async function addNewLR(){

}

// test function
export async   function testInsertLR(){
    await sql.connect(config);
    const qr=  await sql.query('select TOP 5 * from T_LR order by refno desc')  
    return  qr;
} 
   