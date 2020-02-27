'use strict';

var BackgroundProcess = function() {};

BackgroundProcess.prototype = {
    interval: 5000,

    changeSpinnerIcon: function(form, add = true, handle = null) {
        const iconElement = $(form).find('[data-bg-process-icon]');

        if (add) {
            $(form).attr('data-handle', handle);
            iconElement
                .removeClass(iconElement.attr('data-bg-process-icon'))
                .addClass('icon-spinner');
            return;
        }

        $(form).removeAttr('data-handle');
        iconElement
            .removeClass('icon-spinner')
            .addClass(iconElement.attr('data-bg-process-icon'));
    },

    addSpinnerIcon: function(form, handle) {
        this.changeSpinnerIcon(form, true, handle);
    },

    removeSpinnerIcon: function(form) {
        this.changeSpinnerIcon(form, false);
    },

    checkStatus: function() {
        const self = this;

        $('form[data-bg-process]').each(function() {
            const handle = $(this).attr('data-bg-process');

            $.ajax({
                'url': Configuration.basedir + 'process/' + handle,
                'type': 'GET',
                'dataType': 'json',
                'success': function(data) {
                    if (data && typeof data.process !== 'undefined' && data.process === true) {
                        self.addSpinnerIcon(this, handle);
                    }
                }
            });
        });
    },

    init: function()
    {
        const self = this;

        $('form[data-bg-process]').ajaxForm({
            target: this,
            dataType: 'json',
            success: function(data, statusText, xhr, form) {
                if (data && data.handle ) {
                    self.addSpinnerIcon(form, data.handle);
                }
                metador.parseResponse(data);
            }
        });

        setInterval(function() {
            $('form[data-bg-process][data-handle]').each(function () {
                const form = this;
                const handle = $(form).data('handle');

                if (handle === '') {
                    return;
                }

                $.ajax({
                    'url': Configuration.basedir + 'process/' + handle,
                    'type': 'GET',
                    'dataType': 'json',
                    'success': function(data) {
                        if (data && typeof data.process !== 'undefined' && !data.process) {
                            self.removeSpinnerIcon(form);
                        }
                        metador.parseResponse(data);
                    }
                });
            })
        }, this.interval);

        this.checkStatus();
    }
};

const backgroundProcess = new BackgroundProcess();

$(document).ready(function() {
    backgroundProcess.init();
});

