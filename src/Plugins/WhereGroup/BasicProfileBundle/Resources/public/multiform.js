;( function( $, window, document, undefined ) {
    "use strict";

    // Create the defaults once
    var pluginName = "multiForm",
        defaults = {
            propertyName: "value"
        };

    // The actual plugin constructor
    function Plugin ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend( Plugin.prototype, {
        init: function() {
            var self = this;

            $(this.element).on('keyup', '.-js-duplicatable-title', function() {
                self.titleChange(this);
                return false;
            });

            $(this.element).on('change', '.-js-duplicatable-title', function() {
                self.titleChange(this);
            });

            $(this.element).on('click', '.-js-duplicatable-area-add', function() {
                self.add();
                return false;
            });

            $(this.element).on('click', '.-js-advanced-select-option', function() {
                self.changeTab($(this).attr('data-tab'));
                return false;
            });

            $(this.element).on('click', '.-js-duplicatable-area-remove', function() {
                self.remove($(this).closest('[data-tab]').attr('data-tab'));
                return false;
            });
        },

        add: function() {
            var count = this.getItemCount(this) + 1;

            var duplicateOptions = $(this.element).find('.-js-advanced-select-options');
            var duplicateContent = $(this.element).find('.-js-duplicatable-content');

            var labelClone = duplicateOptions.children().first().clone();
            var contentClone = duplicateContent.children().first().clone();

            labelClone.attr('data-tab', count).find('.-js-title-label').text('');
            contentClone.attr('data-tab-content', count);
            contentClone.find('.-js-duplicatable-ignore').each(function() {
                $(this).remove();
            });
            contentClone.find('.-js-multi-fieldset').each(function() {
                $(this).multiFieldset();
            });

            this.changeElementNames(contentClone, count, 0);

            duplicateOptions.append(labelClone);
            duplicateContent.append(contentClone);

            this.changeTab(count);
            this.setLabel('');
            this.setItemCount(count);
            this.setTabCountLabel(this.getTabCount());
            metadata.enableSubmitButton();
        },

        remove: function(tabCount) {
            if (this.getTabCount() === 1) {
                this.clearInputValues($(this.element).find('[data-tab-content]'));
                this.setLabel('');
                this.setTabLabel($(this.element).find('[data-tab]').attr('data-tab'), '');
                this.updateTabCountLabel();
                return false;
            }

            $(this.element).find('div[data-tab-content="' + tabCount + '"]').remove();
            $(this.element).find('div[data-tab="' + tabCount + '"]').remove();

            tabCount = $(this.element).find('[data-tab]').first().attr('data-tab');

            this.changeTab(tabCount);
            this.updateTabCountLabel();
            metadata.enableSubmitButton();
        },

        clearInputValues: function(item) {
            var self = this;

            $(item).each(function() {
                // Todo: clear checkbox $(this).prop("tagName");
                if ($(this).children().size() > 0) {
                    self.clearInputValues($(this).children());
                }

                var node = $(this).prop('nodeName');

                // Todo: chane -js-address-uuid to something like -js-remove-readonly
                if ((node === 'SELECT' || node === 'INPUT' || node === 'TEXTAREA')
                    && $(this).val() !== ''
                    && ($(this).is(':not([readonly])') || $(this).hasClass('-js-address-uuid'))
                    && $(this).val() !== '') {
                    $(this).val('');
                }
            });
        },

        titleChange: function(element) {
            var key = $(element).closest('[data-tab-content]').attr('data-tab-content');
            var label = $(element).val();

            this.setLabel(label);
            this.setTabLabel(key, label);
        },

        setLabel: function(label) {
            $(this.element).find('.-js-current-title-label').text(label);
        },

        setTabLabel: function(key, label) {
            $(this.element)
                .find('[data-tab="' + key + '"]')
                .find('.-js-title-label').text(label);
        },

        getItemCount: function() {
            return parseInt($(this.element).attr('data-count'));
        },

        setItemCount: function(count) {
            $(this.element).attr('data-count', count);
        },

        getTabCount: function() {
            return parseInt($(this.element).find('[data-tab]').length);
        },

        setTabCountLabel: function(count) {
            $(this.element).find('.-js-data-count-label').text(count);
        },

        updateTabCountLabel: function() {
            $(this.element).find('.-js-data-count-label').text(this.getTabCount());
        },

        changeTab: function(key) {
            $(this.element).find('.-js-advanced-select-options').children().removeClass('act');
            $(this.element).find('.-js-duplicatable-content').children().removeClass('act');
            $(this.element).find('div[data-tab="' + key + '"]').addClass('act');
            $(this.element).find('div[data-tab-content="' + key + '"]').addClass('act');

            this.setLabel($(this.element).find('[data-tab="' + key + '"]').find('.-js-title-label').text());
        },

        changeElementNames: function(element, count, subCount) {
            var self = this;
            subCount = (typeof subCount === 'undefined') ? 0 : parseInt(subCount);

            element.each(function() {
                var node    = $(this).prop('nodeName');
                var name    = $(this).attr('name');
                var id      = $(this).attr('id');
                var obj_id  = $(this).attr('data-obj-id');

                if ($(this).is(':not([readonly])') || $(this).hasClass('-js-address-uuid') && (node === 'SELECT' || node === 'INPUT' || node === 'TEXTAREA') && $(this).val() !== '') {
                    $(this).val('');
                }

                if(typeof name !== 'undefined' && name !== false) {
                    name = self.replaceCounter(
                        /\[([\d]{1,3})\]/g,
                        "[", "]", count, subCount, name
                    );
                    $(this).attr('name', name);
                }

                if(typeof id !== 'undefined' && id !== false) {
                    id = self.replaceCounter(
                        /_([\d]{1,3})[_]*/g,
                        "_", "_", count, subCount, id
                    );
                    $(this).attr('id', id);
                }

                if(typeof obj_id !== 'undefined' && obj_id !== false) {
                    obj_id = self.replaceCounter(
                        /_([\d]{1,3})[_]*/g,
                        "_", "_", count, subCount, obj_id
                    );
                    $(this).attr('data-obj-id', obj_id);
                }

                if($(this).children().length > 0) {
                    self.changeElementNames($(this).children(), count, subCount);
                }
            });
        },

        replaceCounter: function(split, delimiterStart, delimiterEnd, count, subCount, string) {
            var tokens    = string.split(split);
            var newString = "";
            var counter   = 0;

            for (var i = 0; i < tokens.length; i++) {
                if (tokens[i].match(/^[\d]{1,3}$/)) {

                    if (counter === subCount) {
                        tokens[i] = delimiterStart + count + delimiterEnd;
                    } else {
                        tokens[i] = delimiterStart + tokens[i] + delimiterEnd;
                    }

                    counter++;
                }
                newString += tokens[i];
            }

            return newString;
        }
    } );

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[ pluginName ] = function( options ) {
        return this.each( function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" +
                    pluginName, new Plugin( this, options ) );
            }
        } );
    };

})( jQuery, window, document );
