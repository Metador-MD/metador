'use strict';

var MetadorSession = function() {

};

MetadorSession.prototype = {
    timeOut: 0,
    dialogTimeout: 1430,

    getTimeOut: function() {
        return this.timeOut;
    },

    setTimeOut: function(timeout) {

        var self = this;
        this.timeOut = parseInt(timeout);

        if (this.timeOut === 0) return;

        var interval = setInterval(function () {
            console.log(self.timeOut);

            if(self.timeOut === self.dialogTimeout){
                $('.-js-timeout-wrapper').show();
            }

            if(self.timeOut === 1420){
                clearInterval(interval);
                //window.location = $('.-js-timeout-dialog').attr('data-logout-path');
            }

            self.timeOut--;
        }, 1000);
    }
};

window.logout = function () {
    alert('penis');
};



var parseResponse = function (data) {
    $(data.functions).each(function (index, func) {
        console.log(index);
        console.log(func);
        //data.functions[settings.functionName](t.parentNode.id);

        if (typeof window[session]['test'] == "function") {
            //window[session.test](5000);
            window['session']['setTimeOut']()
        }

        if( typeof func === 'function'){
            func();
        }
    });
};

var session = new MetadorSession();
session.setTimeOut(Metador.maxlifetime);

window.session.test = function (time) {
    alert('test' + time);
};


$('.-js-timeout-dialog-heartbeat').on('click', function () {
    $.ajax({
        'url': $(this).closest('.-js-timeout-dialog').attr('data-heartbeat-path'),
        'type': 'GET',
        'dataType': 'json'
    })
    .done(function(data){
        console.log(data);
        parseResponse(data);
    });
});
