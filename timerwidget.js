var timerWidget = (function () {
    'use strict';

    var START = -0.5*Math.PI;

    var _w, _h, _r,
        _canva = null,
        _ctx = null,
        _toGo = 0,
        _time = 0,
        _interval = null,
        _state = 0,
        _endTime = NaN;

    var toggle = function () {
        _state = (_state+1)%2;
        if(_state) {
            _start();
        } else {
            _pause();
        };
    };

    var setTime = function (val) {
        _toGo = val*1000;
        _time = _toGo;
        _showProgress(_toGo);
    };

    var setColor = function (val) {
        _ctx.strokeStyle = val;
        _ctx.font = "bold " + 0.4*_r+"px sans";

        _ctx.textBaseline = "middle";
        _ctx.textAlign = "center";
    };

    var setWidth = function (val) {
        _ctx.lineWidth = val;
    };

    var _showProgress = function () {
        var end,
            percent = 100*_toGo/_time,
            end = START + percent*2*Math.PI/100;

        _ctx.clearRect(0, 0, _w, _h);
        _ctx.beginPath();
        _ctx.arc(_w/2, _h/2, _r, START, end, false);
        _ctx.stroke();

        _ctx.fillText(_formatTime(_toGo), _w/2, _h/2);
    };

    var _formatTime = function (val) {
        var s = Math.round(val/1000)%60,
            m = Math.floor(val/60000),
            r = "";

        if (m>99) {
            r="++";
        } else if(m>10) {
            r=""+m;
        } else {
            r="0"+m;
        }

        r+=":";
        if (s<10) {
            r+="0";
        }

        return r+=s;
    };

    var _end = function () {
        alert("END!");
        toggle();
        setTime(_time);
    };

    var _tick = function () {
        _toGo = _endTime - Date.now();
        if(_toGo>0) {
            _showProgress(_toGo);
        } else {
            _end();
        }
    };

    var _click = function (e) {
        var x = e.pageX;
        var y = e.pageY;
        console.log(x, y);

        toggle();
    };

    var _start = function () {
        if(_interval) {
            clearInterval(_interval);
        }
        _interval = setInterval(_tick, 1000);
        _endTime = Date.now() + _toGo;
        _tick();
    };

    var _pause = function () {
        _toGo = _endTime - Date.now();
        if(!_interval) {
            return;
        }

        clearInterval(_interval);
        _interval = null;
    };

    var _init = function (c) {
        _canva = c;
        _w = _canva.width;
        _h = _canva.height;
        _ctx = _canva.getContext("2d");
        _r = Math.min(_w, _h)*0.4

        _canva.addEventListener("click", _click);
        setWidth(_r/6);
        setColor('#a22');
    };

    return function (c) {
        _init(c);
        return {
            'setColor': setColor,
            'setWidth': setWidth,
            'toggle' : toggle,
            'setTime': setTime
        };
    };
})();
