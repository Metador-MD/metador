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
                window.location = $('.-js-timeout-dialog').attr('data-logut-path');
            }

            self.timeOut--;
        }, 1000);
    }
};

var session = new MetadorSession();
session.setTimeOut(Metador.maxlifetime);
