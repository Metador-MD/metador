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

    isEmpty: function(string) {
        return (string == '');
    },

    isUrl: function(string) {
        return this.assertRegex("^(https?|ftp):\\/\\/(((([a-z]|\\d|-|\\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\\da-f]{2})|[!\\$&'\\(\\)\\*\\+,;=]|:)*@)?(((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5]))|((([a-z]|\\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\\d|-|\\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\\d|-|\\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\\.?)(:\\d*)?)(\\/((([a-z]|\\d|-|\\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\\da-f]{2})|[!\\$&'\\(\\)\\*\\+,;=]|:|@)+(\\/(([a-z]|\\d|-|\\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\\da-f]{2})|[!\\$&'\\(\\)\\*\\+,;=]|:|@)*)*)?)?(\\?((([a-z]|\\d|-|\\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\\da-f]{2})|[!\\$&'\\(\\)\\*\\+,;=]|:|@)|[\uE000-\uF8FF]|\\/|\\?)*)?(\\#((([a-z]|\\d|-|\\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\\da-f]{2})|[!\\$&'\\(\\)\\*\\+,;=]|:|@)|\\/|\\?)*)?$", string);
    },

    allEmpty: function(value, items, item, rule)
    {
        var self   = this;
        var valid  = !self.isEmpty(value);
        var parent = $(item).closest('.' + rule.parent);

        jQuery.each(rule.siblings, function(index, sibling) {
            var item    = parent.find('.-js-user-input[data-obj-id="' + sibling + '"]');
            var value   = item.val();
            items.push(item);

            if (typeof value !== 'undefined' && !self.isEmpty(value) === true) {
                valid = true;
            }
        });

        return !valid;
    },

    /**
     *
     * @param regex
     * @param value
     */
    assertRegex: function(regex, value) {
        if (value === null) {
            return true;
        }

        return value.match(new RegExp(regex, "i"));
    },

    /**
     *
     * @param item
     * @returns {boolean}
     */
    validate: function(item) {
        var self       = this;
        var valid      = true;
        var value      = $(item).val();
        var items      = [];
        var objKey     = $(item).attr('data-obj-id');
        var sources    = $(item).attr('data-validator-source');
        var errorCount = 0;

        items.push($(item));

        if (sources) {
            sources = sources.split(',');
        }

        // No validation rules
        if (typeof validation[objKey] === 'undefined') {
            return true;
        }

        // Check validation rules
        jQuery.each(validation[objKey], function(index, rule) {
            if (rule.frontend === false) {
                return true;
            }

            if (rule.regex && !self.assertRegex(rule.regex, value)
                || rule.assert === 'notBlank' && self.isEmpty(value)
                || rule.assert === 'url' && !self.isUrl(value)
                || rule.assert === 'oneIsMandatory' && self.allEmpty(value, items, item, rule)) {
                self.itemInvalid(items, rule);
                valid = false;
                return false;
            }

            self.itemValid(items, rule);
        });


        jQuery.each(sources, function(index, source) {
            if (typeof self.validation[source] === 'undefined') {
                self.validation[source] = [];
            }

            jQuery.each(items, function(index, item) {
                var key = item.attr('id');
                self.validation[source][key] = true;

                if (valid) {
                    delete self.validation[source][key];
                }
            });

            self.setErrorCount(Object.keys(self.validation[source]).length, source);
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
    itemValid: function(items, rule) {
        var self = this;

        jQuery.each(items, function(index, item) {
            self.setItemStatus(item, true, rule.message);
        });
    },

    /**
     *
     * @param item
     * @param message
     */
    itemInvalid: function(items, rule) {
        var self = this;

        jQuery.each(items, function(index, item) {
            self.setItemStatus(item, false, rule.message);
        });
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
