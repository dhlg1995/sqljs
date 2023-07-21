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
    

export class lr {
    refno;
    pic;
    reqdate;
    fromdate;
    todate;
    timerange;
    kind;
    substitute;
    days;
    note;

    constructor(refno,pic,reqdate,fromdate,todate,timerange,kind,substitute,days,note) {
      this.refno  = refno;
      this.pic=pic;
      this.fromdate=fromdate;
      this.todate=todate;
      this.timerange=timerange;
      this.kind=kind;
      this.substitute=substitute;
      this.note=note;
      this.reqdate=reqdate;
      this.days=days;
    }


    async minusDaysLeave(_days,_pic,_kind){
        
        await sql.connect(config);
        let qr='';
        let _daysqr=0;
        if(_kind=='al'){
            qr=`select days from T_AL where userid='${_pic}'`
            let _qr = await sql.query(qr);
            _daysqr = Number.parseFloat(_qr.recordset[0].days);
            await sql.query(`update T_AL set days=${_daysqr-_days} where userid='${_pic}'`)
        }
        if(_kind=='ul'){
            qr=`select days from T_UL where userid='${_pic}'`
            let _qr = await sql.query(qr);
            _daysqr = Number.parseFloat(_qr.recordset[0].days);
            await sql.query(`update T_UL set days=${_daysqr-_days} where userid='${_pic}'`)
        }
    }

    async insertLr (_lr){  
        await sql.connect(config);
        var _string=`insert into T_LR (refno,pic,reqdate,fromdate,todate,timerange,kind,substitute,days,note)  values('${_lr.refno}','${_lr.pic}','${_lr.reqdate}','${_lr.fromdate}','${_lr.todate}','${_lr.timerange}','${_lr.kind}','${_lr.substitute}','${_lr.days}','${_lr.note}')`
        await sql.query(_string);
    }   
    async insertLrToTDigsig(){
        try{
        await sql.connect(config);

        var _tmpdate = this.reqdate
        var ret = (_tmpdate.getMonth()+1)+'/' + _tmpdate.getDate()+'/'+_tmpdate.getFullYear()
        var _string=`insert into T_DIGSIG(refno,role,appdate) values('${this.refno}',0,'${ret}')`;
        await sql.query(_string);
        }
        catch(err){
            console.log(err);
        }
    }
    async insertLrToTDigsigRole5(){
        try{
        await sql.connect(config);

        var _tmpdate = this.reqdate
        var ret = (_tmpdate.getMonth()+1)+'/' + _tmpdate.getDate()+'/'+_tmpdate.getFullYear()
        var _string=`insert into T_DIGSIG(refno,role,appdate) values('${this.refno}',5,'${ret}')`;
        await sql.query(_string);
        }
        catch(err){
            console.log(err);
        }
    }
    async insertLrToTDigsigRole4(){
        try{
        await sql.connect(config);

        var _tmpdate = this.reqdate
        var ret = (_tmpdate.getMonth()+1)+'/' + _tmpdate.getDate()+'/'+_tmpdate.getFullYear()
        var _string=`insert into T_DIGSIG(refno,role,appdate) values('${this.refno}',4,'${ret}')`;
        await sql.query(_string);
        }
        catch(err){
            console.log(err);
        }
    }


    async sendMailConfirmLR(_refno,_dept,_place,_userid,_email){
        try{
           
            var maillist=['john.ghl.do@vn.yangming.com'];
            let MDmail=await this.getMDEmailByPicReferences(_userid,_dept,_place);
            let teamleadmail =await this.getTeamLeadEmailByUserId(_userid);
            let _lr =await this.getLrByRefno(_refno);
            let _submail = await this.getEmailByUserId(_lr.substitute);
            let manager_reg =await this.getTRegByEmail(MDmail);

            var textMail=`MD: ${MDmail}+ email: ${_email} + subemail: ${_submail}+ TeamLeadmail: ${teamleadmail}`
          +`\nDear ${this.checkSex(manager_reg.sex)}${manager_reg.fullname}`
          +`\n`
          +`\nPlease confirm the leave request `
          +`\n`
          +`\n•	Applicant Name : ${_lr.pic}`
          +`\n•	From : ${_lr.fromdate}`
          +`\n•	To : ${_lr.todate}`
          +`\n•	Time range : ${_lr.timerange}`
          +`\n•	Total leave days : ${_lr.days} day(s)`
          +`\n•	The reason : ${_lr.note}`
          +`\n•	The action person : ${_lr.substitute}`
          +`\n•	Leave type : ${_lr.kind}`
          +`\n•	The seqNum : ${_lr.refno}`
          +`\n•	Request date : ${_lr.reqdate}` 
          +`\n\n`
          +`Thanks & Best Regards `
          var _mailOptions = {
            from:'john.ghl.do@vn.yangming.com',
            to:maillist,
            subject:'test o365',
            text:textMail
        }
        await _transporter.sendMail(_mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        }
        catch(err){
            console.log("send mail confirm role 5 err: "+err);
        }
    }
    async sendMailRequestLRByRole0(_refno){
        try{
       
        await sql.connect(config);
        let qr = `select * from T_LR where refno='${_refno}'`
        const lrO = await sql.query(qr);
        let _lr= new lr(_refno,lrO.recordset[0].pic,lrO.recordset[0].reqdate,lrO.recordset[0].fromdate,lrO.recordset[0].todate,lrO.recordset[0].timerange,lrO.recordset[0].kind,lrO.recordset[0].substitute,lrO.recordset[0].days,lrO.recordset[0].note)
        let _tmpreg =new  TregModel.Treg();
        let reg =await _tmpreg.getTregByUserId(_lr.pic);

        if(_lr.days>=3||(reg.role==2||reg.role==3||reg.role==4||reg.role==5)){
            let mdMail = await this.getMailMD();
            let md =await this.getTRegByEmail(mdMail);
            let teamLeadMailAdd = await this.getTeamLeadEmailByUserId(_lr.pic);
            let _tmpreg =new  TregModel.Treg();
            let Act =await _tmpreg.getTregByUserId(_lr.pic);           
            let Sub = await _tmpreg.getTregByUserId(_lr.substitute);
            if(teamLeadMailAdd==Act.email) teamLeadMailAdd='';
            var maillist = [
                'john.ghl.do@vn.yangming.com'  
              ];
               var text__=`teamlead: ${teamLeadMailAdd}+ email: ${Act.email} + subemail: ${Sub.email}`
              + `mdmail: ${md.email}`


          +`\n	Dear ${this.checkSex(md.sex)}${md.fullname},`
          +`\n`
          +`\n Please give us Approve or Reject:`
          +`\n`         
          +`\n•	Applicant Name : ${this.checkSex(Act.sex)}${Act.fullname}`
          +`\n•	From : ${_lr.fromdate}`
          +`\n•	To : ${_lr.todate}`
          +`\n•	Time range : ${_lr.timerange}`
          +`\n•	Total leave days : ${_lr.days} day(s)`
          +`\n•	The reason : ${_lr.note}`
          +`\n•	The action person : ${this.checkSex(Sub.sex)}${Sub.fullname}`
          +`\n•	Leave type : ${this.checkKind(_lr.kind)}`
          +`\n•	The seqNum : ${_lr.refno}`
          +`\n•	Request date : ${_lr.reqdate}` 
        
                   
            
            var _mailOptions = {
                from:'john.ghl.do@vn.yangming.com',
                to:maillist,
                subject:'test o365',
                text:text__
              
            }
            await _transporter.sendMail(_mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
            await _lr.insertLrToTDigsig();
            await _lr.minusDaysLeave(_lr.days,_lr.pic,_lr.kind);
            return;
        }
        if(_lr.days<3||(reg.role!=2||reg.role!=3||reg.role!=4||reg.role!=5)){
        let teamLeadMail = await this.getTeamLeadEmailByUserId(_lr.pic);
        let teamLeadReg = await this.getTRegByEmail(teamLeadMail);
        let subreg = await _tmpreg.getTregByUserId(_lr.substitute);
        var maillist = [
            'john.ghl.do@vn.yangming.com'  
          ];

          
          var textMail=`teamlead: ${teamLeadReg.email}+ email: ${reg.email} + subemail: ${subreg.email}`
          +`\n Dear ${this.checkSex(teamLeadReg.sex)}${teamLeadReg.fullname},`
          +`\n              `
          +`\n Please confirm the leave request `
          +`\n              `
          +`\n•	Applicant Name : ${this.checkSex(reg.sex)}${reg.fullname}`
          +`\n•	From : ${_lr.fromdate}`
          +`\n•	To : ${_lr.todate}`
          +`\n•	Time range : ${_lr.timerange}`
          +`\n•	Total leave days : ${_lr.days} day(s)`
          +`\n•	The reason : ${_lr.note}`
          +`\n•	The acting person : ${this.checkSex(subreg.sex)}${subreg.fullname}`
          +`\n•	Leave type : ${this.checkKind(_lr.kind)}`
          +`\n•	The seqNum : ${_lr.refno}`
          +`\n•	Request date : ${_lr.reqdate}` 
        
        var _mailOptions = {
            from:'john.ghl.do@vn.yangming.com',
            to:maillist,
            subject:'test o365',
            text:textMail
        }
        await _transporter.sendMail(_mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        await _lr.insertLrToTDigsig();
        await _lr.minusDaysLeave(_lr.days,_lr.pic,_lr.kind);
        return;
    }   
}
    catch(err){
        console.log(err)
        
    }}
    async sendMailRecall(objectLr){
        try{
           
            var maillist=['john.ghl.do@vn.yangming.com'];
            let regmodel = new TregModel.Treg();
            let reg=await regmodel.getTregByUserId(objectLr.pic);
             
            let MDmail='';            
            let teamleadmail =await this.getTeamLeadEmailByUserId(objectLr.pic);            
            let _submail = await this.getEmailByUserId(objectLr.substitute);
            let mngMail = await this.getMDEmailByPicReferences(objectLr.pic,reg.dept,reg.place);
            if(objectLr.days>=3||reg.role==2||reg.role==3||reg.role==4||reg.role==5){
                MDmail=await this.getMailMD();
            }

        var textMail=` email: ${reg.email} +MD: ${MDmail} + subemail: ${_submail}+ TeamLeadmail: ${teamleadmail} + mngMail : ${mngMail}` 
          +`Dear Sir/Madam,`
          +`\n`
          +`\nPlease be advised the below leave request is recalled :`
          +`\n`
          +`\n•	Applicant Name : ${objectLr.pic}`
          +`\n•	From : ${objectLr.fromdate}`
          +`\n•	To : ${objectLr.todate}`
          +`\n•	Time range : ${objectLr.timerange}`
          +`\n•	Total leave days : ${objectLr.days} day(s)`
          +`\n•	The reason : ${objectLr.note}`
          +`\n•	The action person : ${objectLr.substitute}`
          +`\n•	Leave type : ${objectLr.kind}`
          +`\n•	The seqNum : ${objectLr.refno}`
          +`\n•	Request date : ${objectLr.reqdate}` 

          var _mailOptions = {
            from:'john.ghl.do@vn.yangming.com',
            to:maillist,
            subject:'test o365',
            text:textMail
        }
        await _transporter.sendMail(_mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        })
    }        
        catch(err){
            console.log("send mail Recall err: "+err);
        }
    }

    
    //get Treg By Email
    async getTRegByEmail(_email){
        await sql.connect(config);
        let _t = await sql.query(`select T_reg.userid from T_reg where email='${_email}'`)
        let _reg = _t.recordset[0].userid;
        let _tmp = new TregModel.Treg();
        let ret = await _tmp.getTregByUserId(_reg);
        return ret;
    }
    // get Director email.
    async getMailMD(){
        await sql.connect(config);
        let tmp = await sql.query(`select email from T_REG where (role=1 and place='HCM')`);
        return tmp.recordset[0].email;
    }
    // get MD email to send mail when Leader confirm
    async getMDEmailByPicReferences(_userid,_dept,_place){
        try{           
            let _role=10;
            if(_dept=='ACC'||_dept=='ADM') _role=7;
            if(_place=='HPH'||(_place=='HAN'&&_dept!='ACC')) {
                _role=1;
                _place='HPH';
            }
            if(_dept=='OP'||_dept=='EC') _role=11;
            let qr=`select email from T_REG where role=${_role}`;
            if(_role==1&&_place=='HPH') qr=`select email from T_REG where (role=1 and place='HPH')`
            await sql.connect(config);
            let _t =await sql.query(qr);
            return _t.recordset[0].email;
        }
        catch{
        }
    }
    async getTeamLeadEmailByUserId(_userid){
        
        let emailTeamLead='';
        let _qr1 = `select * from T_reg where userid='${_userid}'`        
        await sql.connect(config);
        let tmp = await sql.query(_qr1);
        // create _tmp dept variable to handle dept and place. 
        let _tmpdept = tmp.recordset[0].dept;
        let _tmpplace = tmp.recordset[0].place;
       

        if(_tmpdept=="IAOCS")  _tmpdept = "IAOMRK";
        if (_tmpdept == "EUOCS") _tmpdept = "EUOMRK";
        if (_tmpdept == "ICS") _tmpdept = "IMRK";
        if (_tmpdept == "USOCS") _tmpdept = "USOMRK";
        if(_tmpdept =='CBCS')_tmpdept='CBMRK'
        if (_tmpplace == "HPH") _tmpdept = "MRK";
        if (_tmpplace == "DNG") _tmpdept = "DNG";
        if (_tmpplace == "HAN") _tmpdept = "HAN";

        let _qr =`select * from T_Reg where dept = '${_tmpdept}' and  (role=4 or role=5 or role=2 or role=3)`;
       
        var _tmpQuery = await sql.query(_qr);
        emailTeamLead = _tmpQuery.recordset[0].email;
       
        return emailTeamLead;
    }
    async getEmailByUserId(_userid){
        let mail ='';
        await sql.connect(config);
        var _ret=await sql.query(`select email from T_Reg where userid='${_userid}'`)
        mail=_ret.recordset[0].email;
        return mail;
    }
    async getLrNeedToBeConfirmed(_userid,_place,dept){
        try{
        let querySQL='';
        if (_place == "HCM")
        {
            if (dept == "IAOCS" || dept == "IAOMRK")
            {
                querySQL = `select T_LR.refno,T_LR.pic,T_LR.reqdate,T_LR.fromdate,T_LR.todate,T_LR.timerange,T_LR.kind,T_LR.substitute,T_LR.days,T_LR.note from T_LR inner join(select refno, Count(refno) as NumberRefno  from T_DIGSIG group by refno having count(refno)= 1) as counRef on T_LR.refno = counRef.refno inner join T_REG on pic = userid and(dept = 'IAOCS' or dept = 'IAOMRK')`;
            }
            if (dept == "CBCS" || dept == "CBMRK")
            {
                querySQL = `select T_LR.refno,T_LR.pic,T_LR.reqdate,T_LR.fromdate,T_LR.todate,T_LR.timerange,T_LR.kind,T_LR.substitute,T_LR.days,T_LR.note from T_LR inner join(select refno, Count(refno) as NumberRefno  from T_DIGSIG group by refno having count(refno)= 1) as counRef on T_LR.refno = counRef.refno inner join T_REG on pic = userid and(dept = 'CBCS' or dept = 'CBMRK')`;
            }
            if (dept == "EUOCS" || dept == "EUOMRK")
            {
                querySQL = `select T_LR.refno,T_LR.pic,T_LR.reqdate,T_LR.fromdate,T_LR.todate,T_LR.timerange,T_LR.kind,T_LR.substitute,T_LR.days,T_LR.note from T_LR inner join(select refno, Count(refno) as NumberRefno  from T_DIGSIG group by refno having count(refno)= 1) as counRef on T_LR.refno = counRef.refno inner join T_REG on pic = userid and(dept = 'EUOCS' or dept = 'EUOMRK')`;
            }
            if (dept == "ICS" || dept == "IMRK")
            {
                querySQL = `select T_LR.refno,T_LR.pic,T_LR.reqdate,T_LR.fromdate,T_LR.todate,T_LR.timerange,T_LR.kind,T_LR.substitute,T_LR.days,T_LR.note from T_LR inner join(select refno, Count(refno) as NumberRefno  from T_DIGSIG group by refno having count(refno)= 1) as counRef on T_LR.refno = counRef.refno inner join T_REG on pic = userid and(dept = 'ICS' or dept = 'IMRK')`;
            }
            if (dept == "USOCS" || dept == "USOMRK")
            {
                querySQL = `select T_LR.refno,T_LR.pic,T_LR.reqdate,T_LR.fromdate,T_LR.todate,T_LR.timerange,T_LR.kind,T_LR.substitute,T_LR.days,T_LR.note from T_LR inner join(select refno, Count(refno) as NumberRefno  from T_DIGSIG group by refno having count(refno)= 1) as counRef on T_LR.refno = counRef.refno inner join T_REG on pic = userid and(dept = 'USOCS' or dept = 'USOMRK')`;
            }
             if(dept=='ACC'||dept=='EC'||dept=='OP'||dept=='ADM'||dept=='IDOC') querySQL = `select T_LR.refno,T_LR.pic,T_LR.reqdate,T_LR.fromdate,T_LR.todate,T_LR.timerange,T_LR.kind,T_LR.substitute,T_LR.days,T_LR.note from T_LR inner join (select refno , Count(refno) as NumberRefno  from T_DIGSIG group by refno having count(refno)=1) as counRef on T_LR.refno=counRef.refno inner join T_REG on pic=userid and  dept=(select dept from T_REG where userid='${_userid}')`

        }
        if (_place!="HCM")
        {
                querySQL = `select T_LR.refno,T_LR.pic,T_LR.reqdate,T_LR.fromdate,T_LR.todate,T_LR.timerange,T_LR.kind,T_LR.substitute,T_LR.days,T_LR.note from T_LR inner join(select refno, Count(refno) as NumberRefno  from T_DIGSIG group by refno having count(refno)= 1) as counRef on T_LR.refno = counRef.refno inner join T_REG on pic = userid and place='${_place}'`;
        }
       
        await sql.connect(config);
        var ret =[];
        var _qr = await sql.query(querySQL);
        await _qr.recordsets[0].map((row)=>{
                ret.push({
                refno: row.refno,
                pic: row.pic,
                reqdate: row.reqdate,
                kind: row.kind,
                days: row.days,
                fromdate: row.fromdate,
                todate: row.todate,
                timerange:row.timerange,
                substitute:row.substitute,
                note: row.note
            })
        })
        
        return ret;
    }
    catch(err){
        console.log("getLrNeedToBeConfirmed error: "+ err);
    }
    }
    async getLrNeedToBeConfirmedAll(){
        try{
            await sql.connect(config);
            var _tmp = await sql.query(`select T_LR.refno,T_LR.pic,T_LR.reqdate,T_LR.fromdate,T_LR.todate,T_LR.timerange,T_LR.kind,T_LR.substitute,T_LR.days,T_LR.note from T_LR inner join (select refno , Count(refno) as NumberRefno  from T_DIGSIG group by refno having count(refno)=1) as counRef on T_LR.refno=counRef.refno inner join T_REG on pic=userid where T_LR.reqdate>2022 order by refno desc`);
            var data=[];
            await _tmp.recordsets[0].map((row)=>{
                data.push({
                refno: row.refno,
                pic: row.pic,
                reqdate: row.reqdate,
                kind: row.kind,
                days: row.days,
                fromdate: row.fromdate,
                todate: row.todate,
                timerange:row.timerange,
                substitute:row.substitute,
                note: row.note
            })
        })
        return data;
        

        }
        catch(err){
            console.log("getLRNeedToBeConfirmedAll err: "+err)
        }
    }
    async getLrByRefno(refno){
        
        
        await sql.connect(config);
        let _tmp =await sql.query(`select * from T_LR where refno='${refno}'`);
    
        let _lr =  new lr(
            _tmp.recordset[0].refno,
            _tmp.recordset[0].pic,
            _tmp.recordset[0].reqdate,
            _tmp.recordset[0].fromdate,
            _tmp.recordset[0].todate,
            _tmp.recordset[0].timerange,
            _tmp.recordset[0].kind,
            _tmp.recordset[0].substitute,
            _tmp.recordset[0].days,
            _tmp.recordset[0].note
        )       
         return  _lr;
    }  
        //method to get LR for object and update after isert
    async getLrAndUpdateSeqnum(){
            let lr ='';
            await sql.connect(config);
            const qr=  await sql.query('select * from T_SEQNUM where seqtype=\'LR\'')
            lr =await ''+qr.recordset[0].seqprefix + qr.recordset[0].nextnum;
            const qr2=  await sql.query('update T_SEQNUM set nextnum=nextnum+1 where seqtype=\'LR\'')
           
            return lr;        
    }
    async getUseridByFullName(_fullname){
            try{
                let userid ='';
                await sql.connect(config);
                const qr= await sql.query(`select userid from T_REG where fullname='${_fullname}'`);
               
                userid=qr.recordset[0].userid;
                return userid
            }
            catch(err){
                console.log("getUseridByFullName LR :"+err);
            }
    }
    async getFullNameByUserId(_userid){
        try{           
            await sql.connect(config);
            const qr= await sql.query(`select fullname from T_REG where userid='${_userid}'`);           
            return qr.recordset[0].fullname;            
        }
        catch(err){
            console.log("getUseridByFullName LR :"+err);
        }

    }
    // get  return applicant name and acting person when load form
    async getListActingPersonAndApplicant(_userid){
        let _tregmodel = new TregModel.Treg();
        let _reg =await _tregmodel.getTregByUserId(_userid);        
        let condition= '';
        if(_reg.place=='DNG'){
        condition=`place = 'DNG'`
        }
        if(_reg.place=='HAN'){
            condition=` place='HAN'`            
        }if(_reg.place=='HPH'){
            condition=`place='HPH'`            
        }if(_reg.place=='HCM'){
                if (_reg.dept == "IAOCS" || _reg.dept == "IAOMRK")
                {
                    condition=`dept='${_reg.dept}'`
                }
                if (_reg.dept == "CBCS" || _reg.dept == "CBMRK")
                {
                    condition=` (dept='CBCS' or dept='CBMRK')`
                }
                if (_reg.dept == "EUOCS" || _reg.dept == "EUOMRK")
                {
                    condition=` dept='${_reg.dept}'`
                }
                if (_reg.dept == "ICS" || _reg.dept == "IMRK")
                {
                    condition=` (dept='ICS' or dept='IMRK')`
                }
                if (_reg.dept == "USOCS" || _reg.dept == "USOMRK")
                {
                    condition=` (dept='USOCS' or dept='USOMRK')`
                }
                 if(_reg.dept=='ACC'||_reg.dept=='EC'||_reg.dept=='OP'||_reg.dept=='ADM'||_reg.dept=='IDOC') condition=` (dept='${_reg.dept}' and place='${_reg.place}')`
        }
        let data=[];
        let _sql=`select T_UL.days as daysUL, T_REG.fullname,T_REG.userid,T_AL.days from T_UL right join T_REG on T_UL.userid=T_REg.userid inner join T_AL on T_REG.userid=T_AL.userid  where ${condition}`;
        await sql.connect(config);
        let z = await sql.query(_sql);        
        await z.recordsets[0].map((row)=>{
            if(row.daysUL==undefined)row.daysUL=0;            
            data.push({
                fullname: row.fullname,
                userid: row.userid,
                days: row.days,
                daysUL:row.daysUL          
        })
    })
    return data;
    }

    checkSex(_sex){
        if(_sex==true) return 'Mr.'
        return 'Ms.';
    }
    checkKind(_kind){
        let ret='';
        switch (_kind) {
            case 'al':
                ret = 'Annual Leave'
                break;
            case 'ul':
                ret = 'Unpaid Leave'
                break;
            case 'wl':
                ret = 'Welfare Leave'
                break;
            case 'bl':
                ret = 'Business Leave'
                break;
            case 'cl':
                ret = 'Compensatory Leave'
                break;
        }
        return ret;
    }
    async checkLrRefnoIsRequested(_refno){
        await sql.connect(config);
        var _isExist =await sql.query(`select * from T_DIGSIG where refno='${_refno}'`);
        if(_isExist.recordset[0]==null){
            return false;
        }
        return true;

    }
    async checkLrRefnoIsConfirmed(_refno){
        await sql.connect(config);
        let z = await sql.query(`select * from T_DIGSIG where (refno='${_refno}'and (role=4 or role=5))`)
        if(z.recordset[0]==null) return false;
        return true;
    }
    async confirmLrByTeamLeader(_refno){
        let _tmp = new lr();
        var refno = _refno.replace(/^\s+|\s+$/gm, '');
        let _lr =await _tmp.getLrByRefno(refno);
        
        let _TReg =new TregModel.Treg();         
        let _regOfLR =await _TReg.getTregByUserId(_lr.pic);
        await _lr.insertLrToTDigsigRole5();
        await _lr.sendMailConfirmLR(refno,_regOfLR.dept,_regOfLR.place,_lr.pic,_regOfLR.email);
        return 'OK';
    }
    async confirmLrByTeamHr(_refno){
        let _tmp = new lr();
        var refno = _refno.replace(/^\s+|\s+$/gm, '');
        let _lr =await _tmp.getLrByRefno(refno);
        
        let _TReg =new TregModel.Treg();         
        let _regOfLR =await _TReg.getTregByUserId(_lr.pic);
        await _lr.insertLrToTDigsigRole4();
        await _lr.sendMailConfirmLR(refno,_regOfLR.dept,_regOfLR.place,_lr.pic,_regOfLR.email);
        return 'OK';
    }
    async recallLR(_refno){
        var refno = _refno.replace(/^\s+|\s+$/gm, '');

        await sql.connect(config);
        let _lr =await this.getLrByRefno(refno);
        await this.sendMailRecall(_lr);
        await sql.query(`delete from T_DIGSIG where refno='${refno}'`)
        await sql.query(`delete from T_LR where refno='${refno}'`)
        return 'Recall OK';
    }


}









