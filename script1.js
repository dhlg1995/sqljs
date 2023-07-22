//import * as sqlQuery from './sqlQuery.js'
import * as nodemailer from 'nodemailer'
import express from 'express'
var app = express();
// import * as ejss from 'ejs'
// import path from 'path'
// import http from 'http'
import bodyParser from 'body-parser'
import crypto from 'crypto-js'
//import $ from 'jquery'
import  sql from "mssql"
//import * as Session from 'inspector'

import * as lrModel from './Models/lrModel.js'
import * as TregModel from './Models/TregModel.js'
import * as OTModel from './Models/OTModel.js'

/// import sql query js file 
import * as LR from './Query/LR.js'
import  twilio from "twilio";
let key = 'YangMingKey@Encrypt!@#$1234';
var OTTmpList=[];
var OTTMPListFullName=[];
var OTreport=[];
var userFullName = '';
var credentialId = '';
let _reg=[];

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/public/', express.static('./public'));


// config for your database
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
app.get('/', function (req, res) {

    return res.render('formSignin.ejs');

});



app.get('/leave/details', function (req, res) {
    return res.send('OK');
})

app.get('/leave/addnew',async function (req, res) {
    
    var d = new Date();
    var datetime = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    let _t = new lrModel.lr();
    let userFullName =await _t.getFullNameByUserId(credentialId);
    let dataf=await _t.getListActingPersonAndApplicant(credentialId);
            
    return res.render('formAddNewLeave.ejs', { data: dataf, _userid: credentialId, _userFullName: userFullName, dt: datetime });

})


app.post('/leave/insertLeave', async function (req, res) {
    try {
        var _lr = new lrModel.lr();
        _lr.fromdate = req.body.beginningDate; //.getFullYear()+(req.body.beginningDate.getMonth()+1)+req.body.beginningDate.getDate();
        _lr.todate = req.body.endingDate; //.getFullYear()+(req.body.endingDate.getMonth()+1)+req.body.endingDate.getDate();
        _lr.days = req.body.dayHourvalue;
        _lr.timerange = req.body.timeRange;
        _lr.note = req.body.reason;
        let _applicant = req.body.applicanttmp;
        var _userid = await _lr.getUseridByFullName(_applicant);
        _lr.pic = _userid;
        var _refno = await _lr.getLrAndUpdateSeqnum();
        _lr.refno = _refno;
        let _acting = req.body.actingPerson;
        var __substitue = await _lr.getUseridByFullName(_acting);
        _lr.substitute = __substitue;       
        _lr.reqdate = (req.body.reqDateTime);
        _lr.kind= req.body.kindOfLeave;
        
        // switch (_type) {
        //     case 'Annual Leave':
        //         _lr.kind = 'al'
        //         break;
        //     case 'Unpaid Leave':
        //         _lr.kind = 'ul'
        //         break;
        //     case 'Welfare Leave':
        //         _lr.kind = 'wl'
        //         break;
        //     case 'Business Leave':
        //         _lr.kind = 'bl'
        //         break;
        //     case 'Compensatory Leave':
        //         _lr.kind = 'cl'
        //         break;
        // }
       
        await _lr.insertLr(_lr);
        if (_userid == credentialId) {
            res.render('notifyViews\\success.ejs', { userid: credentialId, tmpstring: 'lr' });
            return;
        }
        if (_userid != credentialId) { 
                           
            await _lr.sendMailRequestLRByRole0(_lr.refno);
            res.render('notifyViews\\success.ejs', { userid: credentialId, tmpstring: 'lr' });
            return;
        }
    }
    catch (err) {
        console.log("Insert Leave err: " + err);
    }
})

app.get('/leave/request/:lrrefno', async function (req, res) {
    var lrrefno = req.params.lrrefno;
    var _refno = lrrefno.replace(/^\s+|\s+$/gm, '');
    console.log(_refno);
    let _tmp = await new lrModel.lr();
    let _bool = await _tmp.checkLrRefnoIsRequested(_refno);
    if (_bool == true) {
        return res.send("<h2>LR is exist! <h2><br><br><button onclick=\"myFunction()\">Back</button>"
            + "<script>"
            + "function myFunction(){"
            + `window.location.href=\"/leave/${credentialId}\";}</script>`)
    }
    if (_bool == false) {
        console.log("check inside till true")
        await _tmp.sendMailRequestLRByRole0(_refno);
        res.render('notifyViews\\success.ejs', { userid: credentialId, tmpstring: 'lr' });
    }
})


app.get('/leave/:user', function (req, res) {
    try {

        var username = req.params.user;
        if (username != credentialId) return res.send('error');
        let data = [];


        sql.connect(config, function (err) {
            if (err) throw (err);
            var request = new sql.Request();
            var qr = `select  * from T_LR where pic ='${username}' order by refno desc`;
            request.query(qr, function (err, result) {
                result.recordsets[0].map((row) => {
                    data.push({
                        refno: row.refno,
                        pic: row.pic,
                        reqdate: row.reqdate,
                        kind: row.kind,
                        days: row.days,
                        fromdate: row.fromdate,
                        todate: row.todate,
                        timerange: row.timerange,
                        substitute: row.substitute,
                        note: row.note
                    })
                });
                return res.render('formLeave.ejs', { dataUser: data });
            })
        });
    }
    catch (err) {

    }
})
app.get('/leaveConfirm/:user', async function (req, res) {
    try {
        
        var username = req.params.user;
        if (username != credentialId) return res.send('error');
        let data = [];
        let lr = new lrModel.lr();
        let _Tmmp = new TregModel.Treg();
        await sql.connect(config);
        let reg =await _Tmmp.getTregByUserId(username);
        
        data = await lr.getLrNeedToBeConfirmed(username, reg.place, reg.dept);
        res.render("formLeaveConfirm.ejs", { dataUser: data });
    }
    catch (err) {
        console.log("leaveConfirm/:user error: " + err)
    }
})
app.get('/leaveConfirmAll/:user',async function(req,res){
    try {
        
        
        var username = req.params.user;
        if (username != credentialId) return res.send('error');
        let data = [];
        let lr = new lrModel.lr();
        data = await lr.getLrNeedToBeConfirmedAll();
        //pending
        res.render("formLeaveConfirmAll.ejs", { dataUser: data });
    }
    catch (err) {
        console.log("leaveConfirmAll/:user error: " + err)
    }

})
app.get('/leave/notify/LeaveConfirm/:refno',async function(req,res){
    let _LR = req.params.refno;
    let _lrmodel = new lrModel.lr();
    await sql.connect(config);
    if(await _lrmodel.checkLrRefnoIsConfirmed(_LR)==true){
        res.send(`LR is already confirmed!<br><br><button onclick=\"myFunction()\">Back</button>`
        + "<script>"
        + "function myFunction(){"
        + `window.location.href=\"/leaveConfirm/${credentialId}\";}</script>`)
        return;
    }
    let z = await _lrmodel.confirmLrByTeamLeader(_LR);
    res.send(`<h1>${z}<h1><br><br><button onclick=\"myFunction()\">Back</button>`
    + "<script>"
    + "function myFunction(){"
    + `window.location.href=\"/leaveConfirm/${credentialId}\";}</script>`)
})
app.get('/leave/notify/LeaveConfirmAll/:refno',async function(req,res){
    let _LR = req.params.refno;
    let _lrmodel = new lrModel.lr();
    await sql.connect(config);
    if(await _lrmodel.checkLrRefnoIsConfirmed(_LR)==true){
        res.send(`LR is already confirmed!<br><br><button onclick=\"myFunction()\">Back</button>`
        + "<script>"
        + "function myFunction(){"
        + `window.location.href=\"/leaveConfirm/${credentialId}\";}</script>`)
        return;
    }
    let z = await _lrmodel.confirmLrByTeamHr(_LR);
    res.send(`<h1>${z}<h1><br><br><button onclick=\"myFunction()\">Back</button>`
    + "<script>"
    + "function myFunction(){"
    + `window.location.href=\"/leaveConfirmAll/${credentialId}\";}</script>`)

})
app.get('/leave/recall/:refno',async function(req,res){
    let _lr = new lrModel.lr();
    let param = req.params.refno;
    let z=await _lr.recallLR(param);
    res.send(`<h1>${z}<h1><br><br><button onclick=\"myFunction()\">Back</button>`
    + "<script>"
    + "function myFunction(){"
    + `window.location.href=\"/leaveConfirmAll/${credentialId}\";}</script>`)
})

app.post('/OT/insertOT',async function (req,res){
    let _kind = req.body.radiokind;
    let _fromh = req.body.fromHours;
    let _fromm = req.body.fromMins;
    let _toh = req.body.toHours;
    let _tom = req.body.toMins;
    let _desc = req.body.descriptions;
    let dodate = req.body.doDate;
    let _hour =(_toh-_fromh)+((_tom-_fromm)/60);  
    let _dodate = new Date(dodate)
    let _dt =(_dodate.getFullYear()+'-'+(_dodate.getMonth()+1)+'-'+_dodate.getDate()+' 00:00:00.000');
    let _ot = new OTModel.OT(credentialId,_dt,_fromh,_fromm,_toh,_tom,_kind,_desc,_hour);
    let ref =await  _ot.getOTRefnoAndUpdateTSeqnum();
    _ot.refno=ref;
    await _ot.insertOT(_ot);
    res.render('notifyViews\\success.ejs', { userid: credentialId, tmpstring: 'ot' })
})
app.get('/OT/formNewOT',async (req,res)=>{
    let d = new Date();
    let _date = d.getDate()+'-'+(d.getMonth()+1)+'-'+d.getFullYear();
    res.render("formAddOt.ejs",{fullname:userFullName,date:d.toDateString()});
})
app.get('/OT/:user',async function(req,res){
    let _userid=req.params.user;
    if(_userid!=credentialId){
        res.send("error!");
        return;
    }
    let mod = new OTModel.OT();
    let _data= await mod.getOTByUserid(_userid); 
    res.render("formOT.ejs",{data:_data,fullName:userFullName})
})
app.get('/OT/Request/:refno',async function (req,res){
    //send mail here
    let ot = new OTModel.OT();
    ot.sendMailRequest(req.params.refno,credentialId);
    res.send("REQUESTED!");


})

app.get('/OT/details/:refno',async function(req,res){
    let _ot = new OTModel.OT();
    let _refno=req.params.refno.trim();    
   
    let _data=await _ot.getOTDetailsByRefno(_refno)

    res.render("formOTDetails.ejs",{data:_data,fullName:userFullName});
})
app.post('/OT/details/update',async function(req,res){
    let _ref = req.body._refno;
    let a = req.body.radiokind;
    let b = req.body.fromHours;
    let c = req.body.fromMins;
    let d = req.body.toHours;
    let e = req.body.toMins;
    let f = req.body.descriptions;
    let _ot = new OTModel.OT();
    await _ot.updateOTByRefno(_ref,a,b,c,d,e,f);
    res.render('notifyViews\\success.ejs', { userid: credentialId, tmpstring: 'ot' })
})


app.get('/OTConfirm/:user',async function(req,res){
    try{
    let ot = new OTModel.OT();
    let _data =await ot.getOTNeedtoBeConfirm(credentialId);
    return res.render("formOTConfirm.ejs",{data:_data});
    }
    catch(err)
    {

    }
})
app.get('/OTConfirm/Confirm/:refno',async function(req,res){
    let _o = new OTModel.OT();
    await _o.confirmOT(req.params.refno);
    await _o.sendMailConfirm(req.params.refno)
    res.send("Confirm OK");

    //send mail here!!
})
app.get('/OTConfirm/Delete/:refno',async function(req,res){
    let _ot = new OTModel.OT();
    await _ot.sendMailDelete(req.params.refno);
    await _ot.deleteOt(req.params.refno);
    return res.send("delete OK");
})

app.post('/OTConfirmAll/Search',async function(req,res){
    try{
    let _ot = new OTModel.OT();
    let d = new Date();
    let _month = (req.body.Month)
    let _year = (req.body.Year)
    let fn="";
    let fullname =req.body.FullName
    let _data =await _ot.searchOT(_month,_year,req.body.Status,fullname);
    let lname = await _ot.getListDistinctFullNameSearch(_month,_year,req.body.Status,fullname);
    OTTmpList=_data;   
    OTTMPListFullName=lname;     
    res.render("formOTSearch.ejs",{data:_data,listname:lname,selectt:fn})
    }
    catch(err){
        console.log(err);

    }

})
app.get('/OTConfirmAll/Search/:userFullName',async function(req,res){ 
    let fn = req.params.userFullName;   
    let _data= [];
    await OTTmpList.map((row)=>{
        if(row.fullname==fn)
        _data.push({
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
    OTreport=_data;
    res.render("formOTSearch.ejs",{data:_data,listname:OTTMPListFullName,selectt:fn})

})
app.post('/OTConfirmAll/Preview',async function(req,res){
    res.render("formOTReportReview.ejs",{data:OTreport});
})
app.get('/OTConfirmAll/:user',async function(req,res){
    let _ot = new OTModel.OT(); 
    let d = new Date();
    let _data =await _ot.getOTAdminOfYear(d.getFullYear()-1); 
    let _lFullName =await _ot.getListDistincFullNameOT();       
    let _tus=0
    res.render("formOTConfirmAll.ejs",{data:_data,status:_tus,year:d.getFullYear(),listName:_lFullName})
})


app.get('/testAJAXtest',async (req,res)=>{
    console.log("inside testAJASX");
    await sql.connect(config);
    let a = await sql.query(`select top 20 * from T_ChS order by refno desc`);
    let data = [];
    data = await a.recordsets[0].map((row) => {
         data.push({
            refno: row.refno,
            vendorid:row.vendorid,
            item:row.item,
            keydate:row.keydate           
        })
    });
    await res.send(data);
    return await data;

})

app.get('/main',(req,res)=>{
    res.render('formMain.ejs',{ data: credentialId, T_reg: _reg })
})

app.post('/createPassword', (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var cfirmPassword = req.body.confirmpassword;

    if (cfirmPassword != password) {
        res.send('password not match');
        return;
    }
    let encrypted = crypto.AES.encrypt(password, key).toString();
    sql.connect(config, function (err) {
        if (err) throw (err);
        var request = new sql.Request();
        // query to the database and get the records
        var str = `update T__test set pwd = '${encrypted}' where userid = '${username}'`;
        request.query(str, function (err, result) {
            if (err) {
                throw err;

            }
            res.send('success');
        })
    })
})
app.post('/login', async (req, res) => {
    var username = req.body.username;
    var password = req.body.password;
    var sdt = req.body.sdt;
    var pwddata = '';
    var dec = '';
     var originalText = '';
    // const accountSid = 'AC2fc3b925d283218aed230ff622a41227';
    // const authToken = '15c9ffecd03d93d051952201b36bc379';
    // var client = twilio(accountSid,authToken);
    // var msg='';
    // async function sendOTP(phonenum,otp){
    //     const toPhoneNumb = phonenum;
    //     msg = `Portal OTP is: ${otp}`;
    //     await client.messages.create({
    //         body:msg,
    //         to: toPhoneNumb,
    //         from:'+1 234 272 3881'
    //     })};
   
    // await sendOTP(sdt, '191817');
    await sql.connect(config)
    // query to the database and get the records
    var str = `select  * from T__test where userid='${username}'`;
    let  reg = new TregModel.Treg();
    let result = await sql.query(str);
    pwddata = result.recordset[0].pwd;
    dec = crypto.AES.decrypt(pwddata, key);
   originalText = dec.toString(crypto.enc.Utf8);
    
    if (password == originalText) {
        var params = username;
        credentialId = username;
        _reg = await reg.getTregByUserId(credentialId);
        userFullName = _reg.fullname;
        return res.render('formMain.ejs', { data: params, T_reg: _reg });
    }
    else {
        res.send('Login failed');
    }
})
app.get('/createnewpassword', function (req, res) {
    return res.render('formCreatePassword.ejs')
})

app.get('/Order/:userid',async (req,res)=>{
    
})




//---
app.get('/test', function (req, res) {

    // connect to your database
    let data = [];
    sql.connect(config, function (err) {

        if (err) console.log(err);
        // create Request object
        var request = new sql.Request();
        // query to the database and get the records
        request.query('select TOP 50 * from T_LR order by refno desc', function (err, result) {
            result.recordsets[0].map((row) => {
                data.push({
                    refno: row.refno,
                    pic: row.pic,
                    reqdate: row.reqdate,
                    kind: row.kind,
                    days: row.days,
                    fromdate: row.fromdate,
                    todate: row.todate
                })
            });


            return res.render('f1.ejs', { dataUser: data });
        })


    }


    );

}

);
//test function import and use method from another file. Just TEST
app.get('/testtest', async (req, res) => {
    const z = await LR.testInsertLR();
    res.send(z);
})


app.get('/localtariff',(req,res)=>{

})

app.listen(80, '0.0.0.0', () => {
    console.log('Node.JS server is running on port: 80');
})