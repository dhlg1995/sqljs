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

export class Treg{
    userid;
    fullname;
    dept;
    role;
    email;
    sex;
    isadmin;
    place;
    
    constructor(userid,fullname,dept,role,email,sex,isadmin,place){
        this.userid=userid;
        this.fullname=fullname;
        this.dept=dept;
        this.role=role;
        this.email=email;
        this.sex=sex;
        this.isadmin=isadmin;
        this.place=place;
    }

    async getTregByUserId(_userid){
        await sql.connect(config);        
        let z = await sql.query(`select * from T_REG where userid='${_userid}'`)
        
        let reg = new Treg();
        reg.userid=_userid;
        reg.fullname=z.recordset[0].fullname;
        reg.dept=z.recordset[0].dept;
        reg.role=z.recordset[0].role;
        reg.email=z.recordset[0].email;
        reg.sex=z.recordset[0].sex;
        reg.isadmin=z.recordset[0].isadmin;
        reg.place=z.recordset[0].place;   
        return reg;  
    }
    checkSex(_sex){
        if(_sex==true) return 'Mr.'
        return 'Ms.';
    }

}