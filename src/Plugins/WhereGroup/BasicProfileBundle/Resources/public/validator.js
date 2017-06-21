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

        if (assert === 'notBlank') {
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
        var sources = $(item).attr('data-validator-source');

        if (sources) {
            sources = sources.split(',');
        }

        var errorCount = 0;
        // var tab = $(item).closest('[data-mdtab-content]').attr('data-mdtab-content');

        // No validation rules
        if (typeof validation[objKey] === 'undefined') {
            return true;
        }

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

        jQuery.each(sources, function(index, source) {
            if (typeof self.validation[source] === 'undefined') {
                self.validation[source] = [];
            }

            self.validation[source][key] = true;

            if (valid) {
                delete self.validation[source][key];
            }

            errorCount += Object.keys(self.validation[source]).length;


        });

        jQuery.each(sources, function(index, source) {
            self.setErrorCount(errorCount, source);
        });

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

    setErrorCount: function(count, source) {
        if (count > 0) {
            $('#' + source)
                .addClass('error')
                .find('.-js-error-count')
                .text(count);
        } else {
            $('#' + source)
                .removeClass('error')
                .find('.-js-error-count')
                .text('');
        }
    }
};

var validator = new Validator();
