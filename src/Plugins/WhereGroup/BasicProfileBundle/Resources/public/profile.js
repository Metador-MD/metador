'use strict';

var MetadataForm = function() {};

MetadataForm.prototype = {
    userinput: false,
    submitButton: $('.-js-metadata-button'),
    submitButtonStatus: $('.-js-metadata-button-status'),
    validation: [],

    setUserinput: function(userinput) {
        this.userinput = userinput;
    },

    getUserinput: function() {
        return this.userinput;
    },

    enableSubmitButton: function() {
        this.setUserinput(true);
        this.submitButton.prop('disabled', false).addClass('success');
    },

    disableSubmitButton: function() {
        this.setUserinput(false);
        this.submitButton.prop('disabled', true).removeClass('success');
        this.submitButtonStatus.toggleClass('icon-download icon-spinner');
    },

    activateSubmitButton: function() {
        this.submitButton.prop('disabled', true);
        this.submitButtonStatus.toggleClass('icon-download icon-spinner');
    },

    enableTab: function(id) {
        $('[data-mdtab-content]').removeClass('act');
        $('[data-mdtab]').removeClass('act');
        $('[data-mdtab-content="' + id + '"]').addClass('act');
        $('[data-mdtab="' + id + '"]').addClass('act');
    },

    validate: function(item) {
        var key = $(item).attr('data-obj-id');
        var wrapper = $(item).closest('.-js-validation-wrapper');
        var statusIcon = wrapper.find('.-js-validation-icon');
        var defaultIcon = statusIcon.attr('data-validation-icon');
        var valid = true;
        var tab = $(item).closest('[data-mdtab-content]').attr('data-mdtab-content');

        if (typeof this.validation[tab] === 'undefined') {
            this.validation[tab] = [];
        }

        this.validation[tab][key] = true;

        jQuery.each(validation[key], function(index, value) {
            var string = $(item).val();

            if (string.match(new RegExp(value.regex, "i"))) {
                wrapper.removeClass('error');
                statusIcon
                    .removeClass('icon-exclamation')
                    .addClass(defaultIcon)
                    .attr('title', '');
            } else {
                wrapper.addClass('error');
                statusIcon
                    .addClass('icon-exclamation')
                    .removeClass(defaultIcon)
                    .attr('title', value.message);
                valid = false;
                return false;
            }
        });

        if (valid) {
            delete this.validation[tab][key];
        }

        var errorCount = Object.keys(this.validation[tab]).length;

        if (errorCount > 0) {
            $('[data-mdtab="' + tab + '"]')
                .addClass('error')
                .find('.-js-error-count')
                .text(errorCount);
        } else {
            $('[data-mdtab="' + tab + '"]')
                .removeClass('error')
                .find('.-js-error-count')
                .text('');
        }

        return valid;
    }
};

var metadata = new MetadataForm();

$(".-js-user-input").change(function() {
    metadata.enableSubmitButton();
    metadata.validate(this);
});

window.onbeforeunload = function () {
    if (metadata.getUserinput() && session.windowUnload === true) {
        return 'Möchten Sie diese Seite wirklich verlassen? Nicht gespeicherte Daten gehen hierbei verloren!';
    }
};

// Ajax form submit
$('form').ajaxForm({
    target: '#metadata-form',
    dataType: 'json',
    beforeSubmit: function(form, options) {
        var valid = true;

        $(".-js-user-input").each(function () {
            if (!metadata.validate(this)) {
                valid = false;
            }
        });

        if (!valid) {
            alert('Datensatz ist nicht valide und kann daher nicht gespeichert werden.')
            return false;
        }

        var lock = {
            name: "lock",
            required: false,
            type: "hidden",
            value: "true"
        };

        if (confirm('Klicken Sie ok um den Datensatz nach dem Speichern freizugeben.')) {
            lock.value = "false";
        }

        form.push(lock);

        metadata.activateSubmitButton();
    },
    success: function(data) {
        if (typeof data.metadata.id !== 'undefined') {
            $('[name="p[_id]"]').val(data.metadata.id);
        }

        if (typeof data.metadata.uuid !== 'undefined') {
            $('[name="p[fileIdentifier]"]').val(data.metadata.uuid);
        }

        metador.parseResponse(data);
        metadata.disableSubmitButton();
    },
    error: function() {
        metador.displayError($('#error-messages').attr('data-default'));
        metadata.disableSubmitButton();
    }
});

// Metadata Tab
$('[data-mdtab]').click(function() {
    metadata.enableTab($(this).attr('data-mdtab'));
});
