'use strict';

var Validator = function() {};

Validator.prototype = {
    isValid: false,
    validation: [],

    validateAll: function() {
        var self = this;
        var isValid = true;

        $(".-js-user-input").each(function () {
            if (!self.validate(this)) {
                isValid = false;
            }
        });

        return isValid;
    },

    assert: function(assert, value) {
        var regex = ".*";

        if (rule.assert === 'notBlank') {
            regex = "^.+$";
        }

        return this.assertRegex(regex, value);
    },

    assertRegex: function(regex, value) {
        return value.match(new RegExp(regex, "i"));
    },

    validate: function(item) {
        var self = this;
        var valid = true;
        var key = $(item).attr('id');
        var objKey = $(item).attr('data-obj-id');
        var tab = $(item).closest('[data-mdtab-content]').attr('data-mdtab-content');

        // No validation rules
        if (typeof validation[objKey] === 'undefined') {
            return true;
        }

        if (typeof this.validation[tab] === 'undefined') {
            this.validation[tab] = [];
        }

        this.validation[tab][key] = true;

        jQuery.each(validation[objKey], function(index, rule) {
            var string = $(item).val();

            if (rule.assert && !self.assert(rule.assert, string) ||
                rule.regex && !self.assertRegex(rule.regex, string)) {

                self.itemInvalid(item, rule.message);
                valid = false;
                return false;
            }

            self.itemValid(item, rule.message);
        });

        if (valid) {
            delete this.validation[tab][key];
        }

        this.setErrorCount(Object.keys(this.validation[tab]).length, tab);

        return valid;
    },

    setItemStatus: function(item, valid, message) {
        var wrapper = $(item).closest('.-js-validation-wrapper');
        var statusIcon = wrapper.find('.-js-validation-icon');
        var defaultIcon = statusIcon.attr('data-validation-icon');

        if (valid === true) {
            wrapper.removeClass('error');

            statusIcon
                .removeClass('icon-exclamation')
                .addClass(defaultIcon)
                .attr('title', '');

                return true;
        }

        wrapper.addClass('error');

        statusIcon
            .addClass('icon-exclamation')
            .removeClass(defaultIcon)
            .attr('title', message);
    },

    itemValid: function(item, message) {
        this.setItemStatus(item, true, message);
    },

    itemInvalid: function(item, message) {
        this.setItemStatus(item, false, message);
    },

    setErrorCount: function(count, tab) {
        if (count > 0) {
            $('[data-mdtab="' + tab + '"]')
                .addClass('error')
                .find('.-js-error-count')
                .text(count);
        } else {
            $('[data-mdtab="' + tab + '"]')
                .removeClass('error')
                .find('.-js-error-count')
                .text('');
        }
    }
}

var validator = new Validator();
