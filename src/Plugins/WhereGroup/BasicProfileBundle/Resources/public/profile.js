'use strict';

$('.-js-duplicatable-area').multiForm();
$('.-js-multi-input').multiInput();

var MetadataForm = function() {};

MetadataForm.prototype = {
    userinput: false,
    submitButton: $('.-js-metadata-button'),
    submitButtonStatus: $('.-js-metadata-button-status'),

    setUserinput: function(userinput) {
        this.userinput = userinput;
    },

    getUserinput: function() {
        return this.userinput;
    },

    enableSubmitButton: function() {
        this.setUserinput(true);
        this.submitButton.prop('disabled', false).addClass('success');
        $('.-js-metadata-save').removeClass('disabled');
    },

    disableSubmitButton: function() {
        this.setUserinput(false);
        this.submitButton.prop('disabled', true).removeClass('success');
        $('.-js-metadata-save').addClass('disabled');
        this.submitButtonStatus.toggleClass('icon-download icon-spinner');
    },

    activateSubmitButton: function() {
        this.submitButton.prop('disabled', true);
        $('.-js-metadata-save').addClass('disabled');
        this.submitButtonStatus.toggleClass('icon-download icon-spinner');
    },

    enableTab: function(id) {
        $('[data-mdtab-content]').removeClass('act');
        $('[data-mdtab]').removeClass('act');
        $('[data-mdtab-content="' + id + '"]').addClass('act');
        $('[data-mdtab="' + id + '"]').addClass('act');
    }
};

var metadata = new MetadataForm();

$(document).on('change', '.-js-user-input', function() {
    metadata.enableSubmitButton();
    validator.validate(this);
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
        if ($('input[name="p[public]"]').val() === '1' && $('#validation').val() === '0') {
            $('#validation').closest('.-js-toggle-switch').click();
        }

        if ($('#validation').val() === '1') {
            var abort = form.filter(function ( obj ) {
                return obj.name === 'submit' && obj.value === 'abort';
            });

            if (!validator.validateAll() && abort.length === 0) {
                metador.displayError('Datensatz ist nicht valide und kann daher nicht gespeichert werden.');
                return false;
            }
        }

        metadata.activateSubmitButton();
    },
    success: function(data) {
        if (data && metadata && metadata.id) {
            $('[name="p[_id]"]').val(data.metadata.id);
        }

        if (data && metadata && metadata.uuid) {
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
$(document).on('click', '[data-mdtab]', function() {
    metadata.enableTab($(this).attr('data-mdtab'));
});

// Browser Graphic
$(document).on('change', '.-js-update-preview-image', function() {
    var preview = $('.-js-preview-image');

    preview
        .on('error', function() { preview.attr('src', '/bundles/metadortheme/img/preview.png') })
        .attr('src', $(this).val());
});

$(document).on('click', '.-js-toggle-extended-metadata-settings', function() {
    $('.-js-extended-metadata-settings').toggle();
    $(this).find('span').toggleClass('icon-caret-down icon-caret-up');
});

$(document).on('click', '.-js-toggle-switch', function () {
    metadata.enableSubmitButton();

    var value = $(this).find('.-js-toggle-switch-input').val();

    if (value === '0') {
        $(this).find('.-js-toggle-switch-input').val('1');
        $(this).find('.-js-toggle-switch-icon').removeClass('icon-toggle-off').addClass('icon-toggle-on');
        return;
    }

    $(this).find('.-js-toggle-switch-input').val('0');
    $(this).find('.-js-toggle-switch-icon').removeClass('icon-toggle-on').addClass('icon-toggle-off');
});
