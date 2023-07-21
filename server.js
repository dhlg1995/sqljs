
let app = require('crypto-js');
let key ='1234shg@#%9825njhgASKZM__#';
let text='123'






 let encrypted = app.AES.encrypt(text,key).toString();

let dec = app.AES.decrypt(encrypted,key);

var originalText = dec.toString(app.enc.Utf8);
console.log(encrypted);
console.log(dec);
console.log(originalText);
