'use strict';

var MetadorSession = function() {

};

MetadorSession.prototype = {
    timeOut: 0,
    dialogTimeout: 1430,
    interval: null,

    getTimeOut: function() {
        return this.timeOut;
    },

    setTimeout: function(timeout) {
        var self = this;
        clearInterval(self.interval);
        $('.-js-timeout-wrapper').hide();
        this.timeOut = parseInt(timeout);

        if (this.timeOut === 0) return;

        self.interval = setInterval(function () {
            console.log(self.timeOut);

            if(self.timeOut === self.dialogTimeout){
                $('.-js-timeout-wrapper').show();
            }

            if(self.timeOut === 1420){
                clearInterval(self.interval);
                window.location = $('.-js-timeout-dialog').attr('data-logout-path');
            }

            self.timeOut--;
        }, 1000);
    }
};

window.logout = function () {
    alert('penis');
};



var parseResponse = function (data) {
    if (typeof data.methods !== 'undefined') {
        $(data.methods).each(function (index, params) {
            console.log(params.class, params.method, params.argument);
            window[params.class][params.method](params.argument);
        });

    }
};

var session = new MetadorSession();
session.setTimeout(Metador.maxlifetime);

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
