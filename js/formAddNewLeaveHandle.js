function DayHourFunction(_selectedIndex){
    var _dHDays =document.getElementById("dHDay");
    var _dHH1s= document.getElementById("dH1s");
    var _dHH2s= document.getElementById("dH2s");
    var _dHH3s= document.getElementById("dH3s");

    if(_selectedIndex==0){
        _dHDays.hidden=false
        _dHH1s.hidden=true;
        _dHH2s.hidden=true;
        _dHH3s.hidden=true;
    }else if(_selectedIndex==1){
        _dHDays.hidden=true;
        _dHH1s.hidden=false;
        _dHH2s.hidden=false;
        _dHH3s.hidden=false;
    }
}