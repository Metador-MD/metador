'use strict';

var MetadorSession = function() {};

MetadorSession.prototype = {
    timeOut: 0,
    dialogTime: 60,
    interval: null,
    windowUnload: true,

    setDialogTime: function(time) {
        this.dialogTime = parseInt(time);
    },

    setTimeout: function(timeout) {
        var self = this;

        clearInterval(self.interval);
        $('.-js-timeout-wrapper').hide();
        this.timeOut = parseInt(timeout);

        if (this.timeOut <= 0) return;

        self.interval = setInterval(function () {
            if (self.timeOut <= 0) {
                clearInterval(self.interval);
                window.location = $('.-js-timeout-dialog').attr('data-logout-path');
            }

            if (self.timeOut <= self.dialogTime) {
                self.windowUnload = false;
                $('.-js-timeout-wrapper').show();
            }

            self.timeOut--;
        }, 1000);
    }
};

var session = new MetadorSession();

session.setDialogTime(Configuration.parameters.session_timeout_popup);
session.setTimeout(Configuration.maxlifetime);

$('.-js-timeout-dialog-heartbeat').on('click', function () {
    $.ajax({
        'url': $(this).closest('.-js-timeout-dialog').attr('data-heartbeat-path'),
        'type': 'GET',
        'dataType': 'json'
    }).done(function(data) {
        // Todo: disable check for leaving editor page.
        if (typeof data.METADOR.runMethod === 'undefined') {
            $('.-js-timeout-dialog-logout').click();
            return true;
        }

        session.windowUnload = true;
        metador.parseResponse(data);
    });
});
