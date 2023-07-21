import sql from "mssql"
import * as TregModel from './TregModel.js'
import * as nodemailer from 'nodemailer'
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
var _transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    secure: false,
    port: '587',
    tls: {
    ciphers: "SSLv3",
    rejectUnauthorized: false,
    },
    auth: {
    user: 'john.ghl.do@vn.yangming.com',
    pass: 'user@135',
    },
    debug: false,
    logger:false,
});
export class OT {
    refno;
    pic;
    dodate;
    fromhr;
    frommin;
    tohr;
    tomin;
    kind;
    desp;
    hours;

    constructor(pic,dodate,fromhr,frommin,tohr,tomin,kind,desp,hours) {
      
      this.pic=pic;
      this.dodate=dodate,
      this.fromhr=fromhr,
      this.frommin=frommin;
      this.tohr=tohr;
      this.tomin=tomin;
      this.kind=kind;
      this.desp=desp;
      this.hours=hours;      
    }
    async getOTByUserid(_userid){
        await sql.connect(config);
        let z= await sql.query(`select T_OT.refno,T_OT.dodate,T_OT.desp,T_OT.hours from T_OT where T_OT.pic='${_userid}' and T_OT.refno not in (select refno from T_DIGSIG where refno like 'OT%') order by dodate desc`); 
        // portal now: select T_OT.refno,T_OT.dodate,T_OT.desp,T_OT.hours from T_OT inner join T_DIGSIG on T_OT.refno=T_DIGSIG.refno where T_OT.pic='${_userid}' and T_DIGSIG.role=0      
        let data=[];
        await z.recordsets[0].map((row)=>{
            data.push({
                refno:row.refno,
                pic:row.pic,
                dodate:row.dodate,
                fromhr:row.fromhr,
                frommin:row.frommin,
                tohr:row.tohr,
                tomin:row.tomin,
                kind:row.kind,
                desp:row.desp,
                hours:row.hours
            })
        })
        return data;
    }
    async getOTDetailsByRefno(_refno){
        await sql.connect(config);
        let z= await sql.query(`select * from T_OT where refno='${_refno}'`);
         return await z.recordset[0];
    }
    async getOTNeedtoBeConfirm(_userid){
        try{
        await sql.connect(config);
        let reg = new TregModel.Treg();
        let _reg =await reg.getTregByUserId(_userid);
        let d = new Date();
        let _yr = d.getFullYear();
        let yr =(_yr.toString()).substring(2);        
        let query='';
        if (_reg.place == "HCM")
        {
            if (_reg.dept == "IAOCS" || _reg.dept == "IAOMRK")
            {
                query = `select T_OT.refno,T_OT.pic,T_OT.dodate,T_OT.fromhr,T_OT.frommin,T_OT.tohr,T_OT.tomin,T_OT.kind,T_OT.desp,T_OT.hours from T_OT left join T_REG on T_OT.pic=T_REG.userid ` +
                `where(dept = 'IAOCS' or dept='IAOMRK') and T_OT.refno not in (select refno from T_DIGSIG) and refno like 'OT/__${yr}%'`;
            }
            if (_reg.dept == "CBMRK" || _reg.dept == "CBCS")
            {
                query = `select T_OT.refno,T_OT.pic,T_OT.dodate,T_OT.fromhr,T_OT.frommin,T_OT.tohr,T_OT.tomin,T_OT.kind,T_OT.desp,T_OT.hours from T_OT left join T_REG on T_OT.pic=T_REG.userid ` +
                `where(dept = 'CBMRK' or dept='CBCS') and T_OT.refno not in (select refno from T_DIGSIG) and refno like 'OT/__${yr}%'`;
            }
            if (_reg.dept == "USOCS" || _reg.dept == "USOMRK")
            {
                query = `select T_OT.refno,T_OT.pic,T_OT.dodate,T_OT.fromhr,T_OT.frommin,T_OT.tohr,T_OT.tomin,T_OT.kind,T_OT.desp,T_OT.hours from T_OT left join T_REG on T_OT.pic=T_REG.userid ` +
                `where(dept = 'USOCS' or dept='USOMRK') and T_OT.refno not in (select refno from T_DIGSIG) and refno like 'OT/__${yr}%'`;
            }
            if (_reg.dept == "EUOCS" || _reg.dept == "EUOMRK")
            {
                query = `select T_OT.refno,T_OT.pic,T_OT.dodate,T_OT.fromhr,T_OT.frommin,T_OT.tohr,T_OT.tomin,T_OT.kind,T_OT.desp,T_OT.hours from T_OT left join T_REG on T_OT.pic=T_REG.userid ` +
                `where(dept = 'EUOCS' or dept='EUOMRK') and T_OT.refno not in (select refno from T_DIGSIG) and refno like 'OT/__${yr}%'`;
            }
            if (_reg.dept == "ICS" || _reg.dept == "IMRK")
            {
                query = `select T_OT.refno,T_OT.pic,T_OT.dodate,T_OT.fromhr,T_OT.frommin,T_OT.tohr,T_OT.tomin,T_OT.kind,T_OT.desp,T_OT.hours from T_OT left join T_REG on T_OT.pic=T_REG.userid ` +
                `where(dept = 'ICS' or dept='IMRK') and T_OT.refno not in (select refno from T_DIGSIG) and refno like 'OT/__${yr}%'`;
            }
            else
            {
                query = `select T_OT.refno,T_OT.pic,T_OT.dodate,T_OT.fromhr,T_OT.frommin,T_OT.tohr,T_OT.tomin,T_OT.kind,T_OT.desp,T_OT.hours from T_OT left join T_REG on T_OT.pic=T_REG.userid ` +
                `where(dept = '${_reg.dept}') and T_OT.refno not in (select refno from T_DIGSIG) and refno like 'OT/__${yr}%'`;
            }
        }
        if (_reg.place != "HCM")
        {
            query = `select T_OT.refno,T_OT.pic,T_OT.dodate,T_OT.fromhr,T_OT.frommin,T_OT.tohr,T_OT.tomin,T_OT.kind,T_OT.desp,T_OT.hours from T_OT left join T_REG on T_OT.pic=T_REG.userid ` +
             `where(place='${_reg.place}') and T_OT.refno not in (select refno from T_DIGSIG) and refno like 'OT/__${yr}%'`;
        }

        let data=[];
        let z =await sql.query(query);
        await z.recordsets[0].map((row)=>{
            data.push({
                refno:row.refno,
                pic:row.pic,
                dodate:row.dodate,
                fromhr:row.fromhr,
                frommin:row.frommin,
                tohr:row.tohr,
                tomin:row.tomin,
                kind:row.kind,
                desp:row.desp,
                hours:row.hours
            })
        })
        return data;
    }
    catch(err){
        console.log(err);

    }
        
    }
    async getOTAdminOfYear(_year){
        await sql.connect(config);
        let data=[];
        let z= await sql.query(`select T_OT.refno,T_OT.pic,T_OT.dodate,T_OT.fromhr,T_OT.frommin,T_OT.tohr,T_OT.tomin,T_OT.kind,T_OT.desp,T_OT.hours,T_REG.fullname from T_OT inner join (select refno , Count(refno) as Number  from T_DIGSIG group by refno having count(refno)=0) as counRef on T_OT.refno=counRef.refno and dodate>='${_year}' inner join T_REG on pic=userid `)
        await z.recordsets[0].map((row)=>{
            data.push({
                refno:row.refno,
                pic:row.pic,
                dodate:row.dodate,
                fromhr:row.fromhr,
                frommin:row.frommin,
                tohr:row.tohr,
                tomin:row.tomin,
                kind:row.kind,
                desp:row.desp,
                hours:row.hours,
                fullname:row.fullname
            })
        })
        return data;
    }
    async getListDistincFullNameOT(){
        await sql.connect(config);
        let data=[];
        let z= await sql.query(`select fullname from T_REG`)
       
        // let z= await sql.query(`select Distinct T_REG.fullname from T_OT inner join (select refno , Count(refno) as Number  from T_DIGSIG group by refno having count(refno)=1) as counRef on T_OT.refno=counRef.refno and dodate>='${_year}' inner join T_REG on pic=userid `)
        await z.recordsets[0].map((row)=>{
            data.push({                
                fullname:row.fullname
            })
        })
        return data;
    }
    async searchOT(month,year,stt,name){
        let _month='';
        await sql.connect(config);
        if(month.length<2){
            _month='0'+month;
        }
        else(_month=month);
        if(month=='MonthAll') _month='__';
        let _year = year.substring(2);
        let _m_y = _month+ _year;
        let _query='';
        let data=[];
        if(name=='all'){
            if(stt=="Confirmed"){
                _query=`select T_OT.refno,T_OT.pic,T_OT.dodate,T_OT.fromhr,T_OT.frommin,T_OT.tohr,T_OT.tomin,T_OT.kind,T_OT.desp,T_OT.hours,T_REG.fullname,T_REG.dept `+
                `from T_OT inner join (select refno , Count(refno) as Number  from T_DIGSIG group by refno having count(refno)!=0) as counRef on T_OT.refno=counRef.refno and T_OT.refno like 'OT/${_m_y}%' inner join T_REG on pic=userid `
            }
            if(stt=="Unconfirmed"){
                _query=`select T_OT.refno,T_OT.pic,T_OT.dodate,T_OT.fromhr,T_OT.frommin,T_OT.tohr,T_OT.tomin,T_OT.kind,T_OT.desp,T_OT.hours,T_REG.fullname,T_REG.dept `+
                `from T_OT inner join  T_REG on pic=userid where T_OT.refno not in (Select refno from T_DIGSIG) and T_OT.dodate>'${year-1}'`
            }

        }
        if(name!='all'){
            if(stt=="Confirmed"){
                _query=`select T_OT.refno,T_OT.pic,T_OT.dodate,T_OT.fromhr,T_OT.frommin,T_OT.tohr,T_OT.tomin,T_OT.kind,T_OT.desp,T_OT.hours,T_REG.fullname,T_REG.dept `+
                `from T_OT inner join (select refno , Count(refno) as Number  from T_DIGSIG group by refno having count(refno)!=0) as counRef on T_OT.refno=counRef.refno and T_OT.refno like 'OT/${_m_y}%' inner join T_REG on pic=userid where fullname = '${name}'`
            }
            if(stt=="Unconfirmed"){
                _query=`select T_OT.refno,T_OT.pic,T_OT.dodate,T_OT.fromhr,T_OT.frommin,T_OT.tohr,T_OT.tomin,T_OT.kind,T_OT.desp,T_OT.hours,T_REG.fullname,T_REG.dept `+
                `from T_OT inner join (select refno , Count(refno) as Number  from T_DIGSIG group by refno having count(refno)=0) as counRef on T_OT.refno=counRef.refno and T_OT.refno like 'OT/${_m_y}%' inner join T_REG on pic=userid where fullname = '${name}'`
            }
        }
      
        
        let z=await sql.query(_query);
        await z.recordsets[0].map((row)=>{
            data.push({
                refno:row.refno,
                pic:row.pic,
                dodate:row.dodate,
                fromhr:row.fromhr,
                frommin:row.frommin,
                tohr:row.tohr,
                tomin:row.tomin,
                kind:row.kind,
                desp:row.desp,
                hours:row.hours,
                fullname:row.fullname,
                dept:row.dept
            })
        })
        return data;
    }
    async getListDistinctFullNameSearch(month,year,stt,name){
        let _month='';
        await sql.connect(config);
        if(month.length<2){
            _month='0'+month;
        }
        else(_month=month);
        if(month=='MonthAll') _month='__';
        let _year = year.substring(2);
        let _m_y = _month+ _year;
        let _query='';
        let data=[];
        if(name=='all'){
            if(stt=="Confirmed"){
                _query=`select distinct T_REG.fullname `+
                `from T_OT inner join (select refno , Count(refno) as Number  from T_DIGSIG group by refno having count(refno)!=0) as counRef on T_OT.refno=counRef.refno and T_OT.refno like 'OT/${_m_y}%' inner join T_REG on pic=userid `
            }
            if(stt=="Unconfirmed"){
                _query=`select distinct T_REG.fullname `+
                `from T_OT inner join (select refno , Count(refno) as Number  from T_DIGSIG group by refno having count(refno)=0) as counRef on T_OT.refno=counRef.refno and T_OT.refno like 'OT/${_m_y}%' inner join T_REG on pic=userid `
            }

        }
        if(name!='all'){
            if(stt=="Confirmed"){
                _query=`select distinct T_REG.fullname`+
                `from T_OT inner join (select refno , Count(refno) as Number  from T_DIGSIG group by refno having count(refno)!=0) as counRef on T_OT.refno=counRef.refno and T_OT.refno like 'OT/${_m_y}%' inner join T_REG on pic=userid where fullname = '${name}'`
            }
            if(stt=="Unconfirmed"){
                _query=`select distinct T_REG.fullname `+
                `from T_OT inner join (select refno , Count(refno) as Number  from T_DIGSIG group by refno having count(refno)=0) as counRef on T_OT.refno=counRef.refno and T_OT.refno like 'OT/${_m_y}%' inner join T_REG on pic=userid where fullname = '${name}'`
            }
        }
      
        
        let z=await sql.query(_query);
        await z.recordsets[0].map((row)=>{
            data.push({                
                fullname:row.fullname
            })
        })
        return data;
    }

    async updateOTByRefno(_refno,_kind,_fromhr,_frommin,_tohr,_tomin,_description){
    try{        
        let _hour =(_tohr-_fromhr)+((_tomin-_frommin)/60);       
        let query = `update T_OT set kind='${_kind}',fromhr='${_fromhr}',frommin='${_frommin}',tohr='${_tohr}',tomin='${_tomin}',desp='${_description}',hours='${_hour}' where refno='${_refno}'`
        await sql.connect(config);
        await sql.query(query);
    }
    catch(err){
        console.log('update OT error: '+err);
    }
    }
    async getOTRefnoAndUpdateTSeqnum(){
        await sql.connect(config);
        let _seq = await sql.query('select * from T_SEQNUM where seqtype=\'OT\'');
        let prefix = _seq.recordset[0].seqprefix;
        let nextnum =(_seq.recordset[0].nextnum +1).toString();
        let _update = nextnum; 
        let i = nextnum.length;       
        let len = _seq.recordset[0].numlen;        
        while(i<len){
            nextnum='0'+nextnum;
            i=i+1;
        }
        let ref = prefix+nextnum;
        await sql.query(`update T_SEQNUM set nextnum='${_update}' where seqtype='OT'`)
        return ref;
    }
    async insertOT(_ot){
        await sql.connect(config)
        let _sql = `insert into T_OT(refno,pic,dodate,fromhr,frommin,tohr,tomin,kind,desp,hours) values('${_ot.refno}','${_ot.pic}','${_ot.dodate}','${_ot.fromhr}','${_ot.frommin}','${_ot.tohr}','${_ot.tomin}','${_ot.kind}','${_ot.desp}','${_ot.hours}')`    
        await sql.query(_sql)    
    }
    async deleteOt(refno){
        let _refno=refno.trim()
        await sql.connect(config);
        await sql.query(`delete from T_OT where refno='${_refno}'`);
    }
    async confirmOT(_refno)
    {
        let refno=_refno.trim();
        let _d = new Date();
        let y = _d.getFullYear() +'-'+ (_d.getMonth()+1) +'-'+_d.getDate() + ' 00:00:00.000'
        await sql.connect(config);
        await sql.query(`insert into T_DIGSIG(refno,role,appdate) values('${refno}','5','${y}')`);
    }
    async sendMailConfirm(refno){
        let _refno=refno.trim(); 
        var maillist=['john.ghl.do@vn.yangming.com']  
        let ot =await  this.getOTDetailsByRefno(_refno);
        let reg = new TregModel.Treg();
        let _reg =await reg.getTregByUserId(ot.pic);
        var textMail=``+
        `Dear ${reg.checkSex(_reg.sex)}${_reg.fullname},`+
        `\nYour request of the Seqnumber ${_refno} was confirmed`+
        `\nThanks & Best Regards`

        var _mailOptions = {
            from:'john.ghl.do@vn.yangming.com',
            to:maillist,
            subject:`Confirm Overtime Seq: ${_refno}`,
            text:textMail
        }
        _transporter.sendMail(_mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        
    }
    async sendMailDelete(refno){
        let maillist=['john.ghl.do@vn.yangming.com'];
        let _refno=refno.trim();
        let ot =await this.getOTDetailsByRefno(_refno);
        let reg = new TregModel.Treg();
        let _reg =await reg.getTregByUserId(ot.pic);
        var textMail=``+
        `Dear ${reg.checkSex(_reg.sex)}${_reg.fullname},`+
        `\nYour request of the Seqnumber ${_refno} was Rejected`+
        `\nThanks & Best Regards`;

        var _mailOptions = {
            from:'john.ghl.do@vn.yangming.com',
            to:maillist,
            subject:`Reject Overtime Seq: ${_refno}`,
            text:textMail
        }
        _transporter.sendMail(_mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
    async sendMailRequest(refno,_userid){
        let reg = new TregModel.Treg();
        let fname =await reg.getTregByUserId(_userid);
        let maillist=['john.ghl.do@vn.yangming.com'];
        let _refno = refno.trim();
        let textMail=``+
        `Dear Sir/Madam, `+
        `\nPlease confirm Overtime request:`+
        `\n- Seqnumber: ${_refno}`+
        `\n- Applicant: ${fname.fullname}`+
        `\n Thanks & Best Regards`
        var _mailOptions = {
            from:'john.ghl.do@vn.yangming.com',
            to:maillist,
            subject:`Request for Overtime Seq: ${_refno}`,
            text:textMail
        }
        _transporter.sendMail(_mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

    }


}