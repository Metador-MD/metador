/*

'use strict';

var Duplicatable = function() {};

Duplicatable.prototype = {
    showOptions: function(item) {
        this.getItem(item).find('.-js-advanced-select-options').show();
    },

    getItem: function(item) {
        return $(item).closest('.-js-duplicatable-area');
    },

    getCount: function(item) {
        return parseInt(this.getItem(item).attr('data-count'));
    },

    setCount: function(item, count, label) {
        this.getItem(item).attr('data-count', count);
        this.getItem(item).find('.-js-data-count-label').text(label);
    },

    getItemCount: function(item) {
        return parseInt(this.getItem(item).find('[data-tab]').length);
    },

    getCurrentTabCount: function(item) {
        return $(item).closest('[data-tab-content]').attr('data-tab-content');
    },

    setLabel: function(item, name) {
        this.getItem(item).find('.-js-current-title-label').text(name);
    },

    changeTab: function(item, tabCount) {
        var options = this.getItem(item).find('.-js-advanced-select-options');
        var content = this.getItem(item).find('.-js-duplicatable-content');

        options.children().removeClass('act');
        content.children().removeClass('act');

        options.find('[data-tab="' + tabCount + '"]').addClass('act');
        content.find('[data-tab-content="' + tabCount + '"]').addClass('act');

        this.setLabel(item, options.find('[data-tab="' + tabCount + '"]').find('.-js-title-label').text());
    },

    setTabLabel: function(item, tabCount, name) {
        this.getItem(item).find('[data-tab="' + tabCount + '"]').find('.-js-title-label').text(name);

        if (name !== '' && this.getCurrentTabCount(item) === 0) {
            this.setCount(item, this.getCount(item), '1');
        }
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
    },

    remove: function(item, tabCount) {
        var rootItem = this.getItem(item);
        var itemCount = this.getItemCount(item);

        if (itemCount === 1) {
            tabCount = rootItem.find('[data-tab]').attr('data-tab');

            this.clearInputValues(rootItem);
            this.setTabLabel(rootItem, tabCount, '');
            this.setCount(rootItem, this.getCount(rootItem), '0');

            return false;
        }

        this.getItem(item).find('[data-tab-content="' + tabCount + '"]').remove();
        this.getItem(item).find('[data-tab="' + tabCount + '"]').remove();

        tabCount = rootItem.find('[data-tab]').first().attr('data-tab');

        this.changeTab(rootItem, tabCount);
        this.setCount(rootItem, this.getCount(rootItem), --itemCount);
    },

    clearInputValues: function(item) {
        var self = this;

        $(item).each(function() {
            // Todo: clear checkbox $(this).prop("tagName");

            if ($(this).val() !== '') {
                $(this).val('')
            }

            if ($(this).children().size() > 0) {
                self.clearInputValues($(this).children());
            }
        });
    },

    changeCloneNames: function(clone, count, subCount) {
        var self = this;
        subCount = (typeof subCount === 'undefined') ? 0 : parseInt(subCount);

        clone.each(function() {
            var name    = $(this).attr('name');
            var id      = $(this).attr('id');
            var obj_id  = $(this).attr('data-obj-id');

            if ($(this).val() !== '') {
                $(this).val('')
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
                    /_([\d]{1,3})_/g,
                    "_", "_", count, subCount, id
                );
                $(this).attr('id', id);
            }

            if(typeof obj_id !== 'undefined' && obj_id !== false) {
                obj_id = self.replaceCounter(
                    /_([\d]{1,3})_/g,
                    "_", "_", count, subCount, obj_id
                );
                $(this).attr('data-obj-id', obj_id);
            }

            if($(this).children().size() > 0) {
                self.changeCloneNames($(this).children(), count, subCount);
            }
        });
    },

    init: function() {
        var self = this;

        $(document).on('click', '.-js-advanced-select-option', function() {
            self.changeTab(this, $(this).attr('data-tab'));
        });

        $(document).on('click', '.-js-advanced-select', function() {
            self.showOptions(this);
        });

        $(document).on('keyup', '.-js-duplicatable-title', function() {
            var label = $(this).val();
            self.setLabel(this, label);
            self.setTabLabel(this, self.getCurrentTabCount(this), label);
        });

        $(document).on('click', '.-js-duplicatable-area-add', function() {
            var count = self.getCount(this) + 1;
            var duplicateOptions = $('.-js-advanced-select-options');
            var duplicateContent = $('.-js-duplicatable-content');
            var labelClone = duplicateOptions.children().first().clone();
            var contentClone = duplicateContent.children().first().clone();

            self.setCount(this, count, self.getItemCount(this) + 1);

            labelClone.attr('data-tab', count).find('.-js-title-label').text('');
            contentClone.attr('data-tab-content', count);

            self.changeCloneNames(contentClone, count, 0);

            duplicateOptions.append(labelClone);
            duplicateContent.append(contentClone);

            self.changeTab(this, count);
            self.setLabel(this, '');
        });

        $(document).on('click', '.-js-duplicatable-area-remove', function() {
            var tabCount = $(this).closest('[data-tab]').attr('data-tab');
            self.remove(this, tabCount);
        });
    }
};

var duplicatable = new Duplicatable();

duplicatable.init();
*/
