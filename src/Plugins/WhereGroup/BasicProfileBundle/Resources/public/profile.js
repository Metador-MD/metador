'use strict';

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
    }
};

var metadata = new MetadataForm();

$(".-js-user-input").change(function() {
    metadata.enableSubmitButton();
});

window.onbeforeunload = function () {
    if (metadata.getUserinput()) {
        return 'Möchten Sie diese Seite wirklich verlassen? Nicht gespeicherte Daten gehen hierbei verloren!';
    }
};

// Ajax form submit
$('form').ajaxForm({
    target: '#metadata-form',
    dataType: 'json',
    beforeSubmit: function() {
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
