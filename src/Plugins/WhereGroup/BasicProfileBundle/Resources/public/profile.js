'use strict';

$('.-js-duplicatable-area').multiForm();
$('.-js-multi-input').multiInput();
$('.-js-multi-fieldset').multiFieldset();

var MetadataForm = function() {};

MetadataForm.prototype = {
    userinput: false,
    submitButton: $('.-js-metadata-button'),
    submitButtonStatus: $('.-js-metadata-button-status'),

    /**
     *
     * @param userinput
     */
    setUserinput: function(userinput) {
        this.userinput = userinput;
    },

    /**
     *
     * @returns {boolean}
     */
    getUserinput: function() {
        return this.userinput;
    },

    /**
     *
     */
    enableSubmitButton: function() {
        this.setUserinput(true);
        this.submitButton.prop('disabled', false).addClass('success');
        $('.-js-metadata-save').removeClass('disabled');
    },

    /**
     *
     */
    disableSubmitButton: function() {
        this.setUserinput(false);
        this.submitButton.prop('disabled', true).removeClass('success');
        $('.-js-metadata-save').addClass('disabled');
        this.submitButtonStatus.toggleClass('icon-download icon-spinner');
    },

    /**
     *
     */
    activateSubmitButton: function() {
        this.submitButton.prop('disabled', true);
        $('.-js-metadata-save').addClass('disabled');
        this.submitButtonStatus.toggleClass('icon-download icon-spinner');
    },

    /**
     *
     * @param id
     */
    enableTab: function(id) {
        $('[data-mdtab-content]').removeClass('act');
        $('[data-mdtab]').removeClass('act');
        $('[data-mdtab-content="' + id + '"]').addClass('act');
        $('[data-mdtab="' + id + '"]').addClass('act');
    }
};

var metadata = new MetadataForm();

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
        // Enable validation if metadata public
        if ($('input[name="p[public]"]').val() === '1' && $('#validation').val() === '0') {
            $('#validation').closest('.-js-toggle-switch').click();
        }

        if ($('#validation').val() === '1') {
            var abort = form.filter(function ( obj ) {
                return obj.name === 'submit' && obj.value === 'abort';
            });

            if (abort.length === 0 && !validator.validateAll()) {
                metador.displayError('Datensatz ist nicht valide und kann daher nicht gespeichert werden.');
                return false;
            }
        }

        metadata.activateSubmitButton();
    },
    success: function(data) {
        if (data && data.metadata && data.metadata.id) {
            $('[name="p[_id]"]').val(data.metadata.id);
        }

        if (data && data.metadata && data.metadata.uuid) {
            $('[name="p[fileIdentifier]"]').val(data.metadata.uuid);
            $('[name="p[_uuid]"]').val(data.metadata.uuid);
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
// $(document).on('change', '.-js-update-preview-image', function() {
//     var preview = $('.-js-preview-image');

//     preview
//         .on('error', function() { preview.attr('src', '/bundles/metadortheme/img/preview.png') })
//         .attr('src', $(this).val());
// });

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

$(document).on('click', '.-js-set-fields', function () {
    var fields = $(this).find(":selected").attr('data-fields');
    var parent = $(this).closest('.' + $(this).attr('data-parent'));

    if (typeof fields === 'undefined') {
        return;
    }

    fields = JSON.parse(fields);

    if (typeof fields !== 'object') {
        return;
    }

    $.each(fields, function( index, value ) {
        var item = parent.find('.-js-field-' + index);
        var node = item.prop('nodeName');

        if (node === 'SELECT' || node === 'INPUT') {
            item.val(value).change();
        } else if (node === 'TEXTAREA') {
            item.text(value).change();
        }
    });
});

$(document).on('change', '.-js-change-view', function() {
    var target = $('#' + $(this).find(":selected").attr('data-obj-id'));
    var clearValues = $(this).hasClass('-js-change-view-clear-values');

    target.siblings().each(function() {
        $(this).removeClass('active');

        if (clearValues) {
            $(this).find('input').not('.-js-keep-value').val('');
            $(this).find('select').not('.-js-keep-value').val('');
            $(this).find('textarea').not('.-js-keep-value').val('');
        }
    });
    target.addClass('active');
});

// Menu functions
var enableMenuContent = function(menuContentId) {
    $('[data-menu-content]').removeClass('act');
    $('[data-menu-content="' + menuContentId + '"]').addClass('act');
};

var enableSubMenu = function(menuId, subMenuId) {
    $('[data-submenu-parent]').removeClass('act');
    $('[data-submenu-parent="' + menuId + '"]').addClass('act');

    $('.-js-activate-submenu').removeClass('act');
    $('.-js-activate-submenu[data-submenu="' + subMenuId + '"]').addClass('act');

    enableMenuContent(subMenuId);
};

var enableMenu = function(menuId, subMenuId) {
    $('.-js-activate-menu').removeClass('act');
    $('.-js-activate-menu[data-menu="' + menuId + '"]').addClass('act');

    enableSubMenu(menuId, subMenuId);
};

$(document).on('click', '.-js-activate-menu', function () {
    enableMenu($(this).attr('data-menu'), $(this).attr('data-submenu'));
});

$(document).on('click', '.-js-activate-submenu', function () {
    enableSubMenu($(this).closest('[data-submenu-parent]').attr('data-submenu-parent'), $(this).attr('data-submenu'));
});
