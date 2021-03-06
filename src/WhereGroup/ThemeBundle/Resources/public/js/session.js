'use strict';

var Session = function() {};
var isAnonymus = (Configuration.maxlifetime|0) <= 0;

Session.prototype = {
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

        if (isAnonymus || this.timeOut <= 0) return;

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

var session = new Session();

session.setDialogTime(Configuration.settings.session_timeout_popup);
session.setTimeout(Configuration.maxlifetime);

$(document).on('click', '.-js-timeout-dialog-heartbeat', function () {
    $.ajax({
        'url': $(this).closest('.-js-timeout-dialog').attr('data-heartbeat-path'),
        'type': 'GET',
        'dataType': 'json'
    }).done(function(data) {
        if (!data || !data.METADOR) {
            $('.-js-timeout-dialog-logout').click();
            return true;
        }

        session.windowUnload = true;
        metador.parseResponse(data);
    });
});
