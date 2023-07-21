
import sql from "mssql"

var config = {
    user: 'sa',
    password: 'fa11@123',
    server: '192.168.1.186',
    port: 1438,
    database: 'Forms',
    options: {
        encrypt: false,
        trustServerCertificate: true,
    }
};
 
// export async  function  getListFullNameOfTeamMember(_userid){
//     var dataf=[];    
//      sql.connect(config,  function(err){ 
//         if(err) throw(err);
//         var request =  new sql.Request();
//         // query to the database and get the records
       
//         var qr = `select fullname from T_REG where dept=(select dept from T_REG where userid='${_userid}')`;
//        var x =  request.query(qr, function (err, result) {
//             console.log("1");
//             result.recordsets[0].map((row) => {
//                 console.log("2");
//                 dataf.push({
//                     fullname:row.fullname
//                 })
//                 console.log("3");   
//             })
//             console.log("7");
//             console.log("data=>"+dataf)
//        })
// })

// console.log("dataf return=>"+dataf);
// return dataf;
// }


