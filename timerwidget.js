var timerWidget = (function () {
    'use strict';

    var START = -0.5*Math.PI;

    var _buttons = {
        'mPlus': null,
        'mMinus': null,
        'sPlus': null,
        'sMinus': null
    };

    var _w, _h, _r,
        _canva = null,
        _ctx = null,
        _toGo = 0,
        _time = 0,
        _interval = null,
        _state = 0,
        _endTime = NaN;

    var toggle = function () {
        if(!_state) {
            _start();
        } else {
            _pause();
        };
    };

    var setTime = function (val) {
        if(val<0) {
            val = 0;
        }
        _pause();
        _toGo = val*1000;
        _time = _toGo;
        _endTime = Date.now() + _time;
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

    var _drawTriangle = function (c, dir) {
        var x0 = c[0],
            x1 = c[0]+c[2]/2,
            x2 = c[0]+c[2],
            y0 = c[1],
            y1 = c[1]+c[3],
            tmp, savedStyle;

        _ctx.beginPath();
        savedStyle = _ctx.fillStyle;
        _ctx.fillStyle = '#777';
        if(dir<0) { // down
            tmp = y1;
            y1 = y0;
            y0 = tmp;
        }
        _ctx.moveTo(x0, y1);
        _ctx.lineTo(x2, y1);
        _ctx.lineTo(x1, y0);
        _ctx.lineTo(x0, y1);
        _ctx.fill();
        _ctx.fillStyle = savedStyle;
    };

    var _showProgress = function () {
        var end,
            percent = 100*_toGo/_time,
            end = START + percent*2*Math.PI/100;

        if (_toGo==0) {
            end=START + 2*Math.PI;
        }

        _ctx.clearRect(0, 0, _w, _h);
        _ctx.beginPath();
        _ctx.arc(_w/2, _h/2, _r, START, end, false);
        _ctx.stroke();

        _ctx.fillText(_formatTime(_toGo), _w/2, _h/2);

        _drawTriangle(_buttons['mPlus'], 1);
        _drawTriangle(_buttons['sPlus'], 1);
        _drawTriangle(_buttons['mMinus'], -1);
        _drawTriangle(_buttons['sMinus'], -1);
    };

    var _formatTime = function (val) {
        var conv = Math.round(val/1000),
            s = conv%60,
            m = Math.floor(conv/60),
            r = "";

        if (m>999) {
            r="++";
        } else if(m>9) {
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
        _showProgress();
        _pause();
        _canva.dispatchEvent(new Event('finished'));
        setTime(Math.round(_time/1000));
    };

    var _tick = function () {
        _toGo = _endTime - Date.now();
        if(_toGo>0) {
            _showProgress(_toGo);
        } else {
            _toGo=0;
            _end();
        }
    };

    var _in = function (n, x, y) {
        return x>_buttons[n][0] && x<_buttons[n][0]+_buttons[n][2] &&
               y>_buttons[n][1] && y<_buttons[n][1]+_buttons[n][3];

    };

    var _click = function (e) {
        var x = e.pageX - _canva.offsetLeft,
            y = e.pageY - _canva.offsetTop,
            n = 0;

        if (_interval) {
            clearInterval(_interval);
            _interval=null;
        }

        if (_in('mPlus', x, y)) {
            n=1000*60;
        }
        else if(_in('mMinus', x, y)) {
            n=-1000*60;
        }
        else if(_in('sPlus', x, y)) {
            n=1000;
        }
        else if(_in('sMinus', x, y)) {
            n=-1000;
        } else {
            toggle();
            return;
        }
        setTime(Math.round((_toGo+n)/1000));

        _pause();
    };

    var _start = function () {
        _state = 1;
        if(_interval) {
            clearInterval(_interval);
        }
        _interval = setInterval(_tick, 1000);
        _endTime = Date.now() + _toGo;
        _tick();
    };

    var _pause = function () {
        _state = 0;
        _toGo = _endTime - Date.now();
        if(!_interval) {
            return;
        }

        clearInterval(_interval);
        _interval = null;
    };

    var _calcButtons = function (size) {
        var coords = {
            'mPlus':  [-1/3, -0.5],
            'mMinus': [-1/3, +0.5],
            'sPlus':  [+1/3, -0.5],
            'sMinus': [+1/3, +0.5]
        }, c;

        for (c in coords) {
            if (!coords.hasOwnProperty(c)) {
                continue;
            }
            _buttons[c] = [
                _w/2 - size/2 + coords[c][0]*_r,
                _h/2 - size/2 + coords[c][1]*_r,
                size, size
            ];
        }
    };

    var _recalc = function () {
        _w = _canva.width;
        _h = _canva.height;
        _r = Math.min(_w, _h)*0.4
        _calcButtons(_r*2/5);
        setWidth(_r/6);
        setColor('#a22');
    };

    var _init = function (c) {
        _canva = c;
        _ctx = _canva.getContext("2d");
        _ctx.textBaseline = "middle";

        _recalc();

        _canva.addEventListener("click", _click);
    };

    var redraw = function () {
        _recalc();
        _showProgress();
    };

    return function (c) {
        _init(c);
        return {
            'setColor': setColor,
            'setWidth': setWidth,
            'toggle' : toggle,
            'setTime': setTime,
            'redraw': redraw
        };
    };
})();
