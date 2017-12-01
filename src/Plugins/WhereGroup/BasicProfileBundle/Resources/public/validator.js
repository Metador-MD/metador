'use strict';

var Validator = function() {};

Validator.prototype = {
    isValid: false,
    validation: [],

    /**
     *
     * @returns {boolean}
     */
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

    /**
     *
     * @param assert
     * @param value
     * @returns {*}
     */
    assert: function(assert, value) {
        var regex = ".*";

        if (assert === 'notBlank') {
            regex = "^.+$";
        } else if (assert === 'url') {
            regex = "^(https?|ftp):\\/\\/(((([a-z]|\\d|-|\\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\\da-f]{2})|[!\\$&'\\(\\)\\*\\+,;=]|:)*@)?(((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5]))|((([a-z]|\\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\\d|-|\\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\\d|-|\\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\\.?)(:\\d*)?)(\\/((([a-z]|\\d|-|\\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\\da-f]{2})|[!\\$&'\\(\\)\\*\\+,;=]|:|@)+(\\/(([a-z]|\\d|-|\\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\\da-f]{2})|[!\\$&'\\(\\)\\*\\+,;=]|:|@)*)*)?)?(\\?((([a-z]|\\d|-|\\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\\da-f]{2})|[!\\$&'\\(\\)\\*\\+,;=]|:|@)|[\uE000-\uF8FF]|\\/|\\?)*)?(\\#((([a-z]|\\d|-|\\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\\da-f]{2})|[!\\$&'\\(\\)\\*\\+,;=]|:|@)|\\/|\\?)*)?$";
        }

        return this.assertRegex(regex, value);
    },

    /**
     *
     * @param regex
     * @param value
     */
    assertRegex: function(regex, value) {
        if (value === null) {
            return false;
        }

        return value.match(new RegExp(regex, "i"));
    },

    /**
     *
     * @param item
     * @returns {boolean}
     */
    validate: function(item) {
        var self = this;
        var valid = true;
        var key = $(item).attr('id');
        var objKey = $(item).attr('data-obj-id');
        var sources = $(item).attr('data-validator-source');
        var errorCount = 0;

        if (sources) {
            sources = sources.split(',');
        }

        // No validation rules
        if (typeof validation[objKey] === 'undefined') {
            return true;
        }

        jQuery.each(validation[objKey], function(index, rule) {
            var node   = $(item).prop('nodeName');
            var string = $(item).val();

            if (node === 'TEXTAREA') {
                string = $(item).text();
            }

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

    /**
     *
     * @param item
     * @param valid
     * @param message
     * @returns {boolean}
     */
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

    /**
     *
     * @param item
     * @param message
     */
    itemValid: function(item, message) {
        this.setItemStatus(item, true, message);
    },

    /**
     *
     * @param item
     * @param message
     */
    itemInvalid: function(item, message) {
        this.setItemStatus(item, false, message);
    },

    /**
     *
     * @param count
     * @param source
     */
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
