'use strict';

var MetadorSession = function() {

};

MetadorSession.prototype = {
    timeOut: 0,
    dialogTimeout: 60,
    interval: null,

    setTimeout: function(timeout) {
        var self = this;

        clearInterval(self.interval);
        $('.-js-timeout-wrapper').hide();
        this.timeOut = parseInt(timeout);

        if (this.timeOut <= 0) return;

        self.interval = setInterval(function () {
            if (self.timeOut === self.dialogTimeout){
                $('.-js-timeout-wrapper').show();
            } else if (self.timeOut <= 0){
                clearInterval(self.interval);
                window.location = $('.-js-timeout-dialog').attr('data-logout-path');
            }

            self.timeOut--;
        }, 1000);
    }
};

var parseResponse = function (data) {
    if (typeof data.methods === 'undefined') {
        return false;
    }

    $(data.methods).each(function (index, params) {
        if(typeof window[params.class][params.method] === 'function'){
            window[params.class][params.method](params.argument);
        }
    });
};

var session = new MetadorSession();

session.setTimeout(Metador.maxlifetime);

$('.-js-timeout-dialog-heartbeat').on('click', function () {
    $.ajax({
        'url': $(this).closest('.-js-timeout-dialog').attr('data-heartbeat-path'),
        'type': 'GET',
        'dataType': 'json'
    }).done(function(data){
        parseResponse(data);
    });
});
