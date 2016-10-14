function getUUID() {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";

    return s.join("");
}

function replaceCounter(split, delimiterStart, delimiterEnd, count, subCount, string) {
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

function changeNames(clone, count, subCount) {
    subCount = (typeof subCount === 'undefined') ? 0 : parseInt(subCount);

    clone.each(function() {
        var name    = $(this).attr('name');
        var id      = $(this).attr('id');
        var obj_id  = $(this).attr('data-obj-id');

        if(typeof name !== 'undefined' && name !== false) {
            name = replaceCounter(
                /\[([\d]{1,3})\]/g,
                "[", "]", count, subCount, name
            );
            $(this).attr('name', name);
        }

        if(typeof id !== 'undefined' && id !== false) {
            id = replaceCounter(
                /_([\d]{1,3})_/g,
                "_", "_", count, subCount, id
            );
            $(this).attr('id', id);
        }

        if(typeof obj_id !== 'undefined' && obj_id !== false) {
            obj_id = replaceCounter(
                /_([\d]{1,3})_/g,
                "_", "_", count, subCount, obj_id
            );
            $(this).attr('data-obj-id', obj_id);
        }

        if($(this).children().size() > 0) {
            changeNames($(this).children(), count, subCount);
        }
    });
}

function addBBOX(w, s, e, n) {
    var result = $('#result_p_bbox');
    var count = result.attr('data-count');

    result.prepend(
        $('<div></div>').append(
            $('<input/>').attr("type", "hidden").attr("name", "p[bbox][" + count + "][nLatitude]").val(n),
            $('<input/>').attr("type", "hidden").attr("name", "p[bbox][" + count + "][eLongitude]").val(e),
            $('<input/>').attr("type", "hidden").attr("name", "p[bbox][" + count + "][sLatitude]").val(s),
            $('<input/>').attr("type", "hidden").attr("name", "p[bbox][" + count + "][wLongitude]").val(w),
            $('<table></table>').append(
                $('<tr></tr>').append(
                    $('<td></td>').html(w),
                    $('<td></td>').html(s),
                    $('<td></td>').html(e),
                    $('<td></td>').html(n)
                )
            ),
            $('<div></div>').addClass("btn cmdDeleteSingleValue").append($('<div></div>').addClass('icon icon-bin2'))
        )
    );

    result.attr('data-count', parseInt(result.attr('data-count')) + 1);
}

function addReferenceSystem(code, codespace, version) {
    var result = $('#result_p_referencesysteminfo');
    var count = result.attr('data-count');

    result.prepend(
        $('<div></div>').append(
            $('<input/>').attr("type", "hidden").attr("name", "p[referencesysteminfo][" + count + "][code]").val(code),
            $('<input/>').attr("type", "hidden").attr("name", "p[referencesysteminfo][" + count + "][codespace]").val(codespace),
            $('<input/>').attr("type", "hidden").attr("name", "p[referencesysteminfo][" + count + "][version]").val(version),
            $('<table></table>').append(
                $('<tr></tr>').append(
                    $('<td></td>').html(code),
                    $('<td></td>').html(codespace),
                    $('<td></td>').html(version)
                )
            ),
            $('<div></div>').addClass("btn cmdDeleteSingleValue").append($('<div></div>').addClass('icon icon-bin2'))
        )
    );

    result.attr('data-count', parseInt(result.attr('data-count')) + 1);
}

$(document).ready(function() {
    // LEFT MENU CLICK
    $('.profile-menu li').click(function() {
        $('.profile-menu > li').removeClass('act');
        $(this).addClass('act');

        $('.metadataFormPages > div').removeClass('act');
        $('.metadataFormPages > div#' + $(this).attr('data-tab')).addClass('act');
    });

    // DATEPICKER
    // TODO: add german months and days
    $(document).on('mousedown', '.datepicker', function() {
        var self = this;
        $(self).Zebra_DatePicker({
            show_icon: false,
            offset:[-177,120],
            onSelect: function() {
                $(self).change();
            }
            //months: ['','']
            //days: ['','']
        });
    });

    $('#bboxSelect').change(function() {
        var bbox = $(this).val().split(' ');

        if(bbox.length === 4) {
            addBBOX(bbox[0], bbox[1], bbox[2], bbox[3]);
            $('#bboxSelect').val('');
        }
    });

    // ADD SINGLE VALUE
    $('.cmdAddSingleValue').click(function() {
        var source = $('#source_' + $(this).attr("data-obj-id"));
        var result = $('#result_' + $(this).attr("data-obj-id"));
        var name = $(this).attr("data-name");

        if(source.val() === "") {
            alert("Eingabe leer.");
            return false;
        }

        result.prepend(
            $('<div></div>').append(
                $('<input/>')
                    .attr("type", "hidden")
                    .attr("name", name)
                    .val(source.val()),
                $('<label></label>')
                    .html(source.val()),
                $('<div></div>')
                    .addClass("btn cmdDeleteSingleValue")
                    .append($('<div></div>').addClass('icon icon-bin2'))
                )
        );

        source.val("");
    });

    // REMOVE SINGLE VALUE
    $(document).on('click', '.cmdDeleteSingleValue', function() {
        if(confirm("Eintrag löschen?")) {
            $(this).parent().remove();
        }
    });

    // DUPLICATEABLE'S
    $(document).on('click', '.duplicatable .duplicate', function() {
        var duplicatable = $(this).closest('.duplicatable');
        var content      = duplicatable.find('.content').eq(0);
        var count        = duplicatable.attr("data-count");

        if(content.children().length > 9) {
            return false;
        }

        var clone = content.find("> .nr" + $(this).prev()
            .attr('data-id'))
            .clone()
            .removeClass()
            .addClass('nr' + (++count) + ' act');

        changeNames(clone, count, duplicatable.attr('data-level'));

        duplicatable.find('> ul').children().removeClass('act');

        duplicatable.find('> ul').find('.duplicate')
            .before($('<li></li>')
            .attr("data-id", count)
            .text(count)
            .addClass('tab act'));

        content.children().removeClass('act');
        content.append(clone);

        duplicatable.attr("data-count", count);
    });

    $(document).on('click', 'div.duplicatable .menu.delete', function() {
        var element = $(this).closest('.duplicatable');
        var list    = element.find('ul').eq(0).find('.act');
        var content = element.find('div.content').eq(0).find('> div.act');

        if(list.attr('data-id') !== 0) {
            list.remove();
            content.remove();

            element.find('ul').eq(0).find('li').eq(0).addClass("act");
            element.find('.content').eq(0).find('div').eq(0).addClass("act");
        } else {
            alert("Das erste Element kann nicht gelöscht werden.");
        }
    });

    $(document).on('click', '.duplicatable ul li.tab', function() {
        var content = $(this).closest('.duplicatable').find('.content').eq(0);

        $(this).siblings().removeClass("act");
        $(this).addClass("act");

        content.children().removeClass('act');
        content.find("> .nr" + $(this).attr('data-id')).addClass('act');
    });

    // GENERATE UUID
    $(document).on('click', '.wizard_p_fileidentifier', function() {
        var ident     = $('#p_fileidentifier');
        var identCode = $('#p_identifier_0_code');
        var uuid      = getUUID();

        if (ident.val() === "" && identCode.val() === "") {
            ident.val(uuid);
            identCode.val(uuid);
        }
    });

    $('#p_uselimitation_b').change(function() {
        $('#result_p_uselimitation').prepend(
            $('<div></div>').append(
                $('<input/>').attr("type", "hidden").attr("name", "p[uselimitation][]").val($(this).val()),
                $('<label></label>')
                    .html($(this).val()),
                $('<div></div>')
                    .addClass("btn cmdDeleteSingleValue")
                    .append($('<div></div>').addClass('icon icon-bin2'))
                )
        );
        $(this).val('');
    });

    $('#add_p_bbox').click(function() {
        addBBOX(
            $('#bboxw').val(),
            $('#bboxs').val(),
            $('#bboxe').val(),
            $('#bboxn').val()
        );

        $('#bboxSelect').val('');
        $('#bboxn').val('');
        $('#bboxe').val('');
        $('#bboxs').val('');
        $('#bboxw').val('');
    });

    $('#add_p_referencesysteminfo').click(function() {
        addReferenceSystem(
            $('#p_referencesysteminfo_code').val(),
            $('#p_referencesysteminfo_codespace').val(),
            $('#p_referencesysteminfo_version').val()
        );

        $('#p_referencesysteminfo_code').val(''),
        $('#p_referencesysteminfo_codespace').val(''),
        $('#p_referencesysteminfo_version').val('')
    });

    if($('#p_browsergraphic').val() !== "") {
        $('#browserGraphic').append(
            $('<img/>').attr('src', $('#p_browsergraphic').val())
        );
    }

    if($('#p_browsergraphic').val() !== "") {
        $('#browserGraphic').append(
            $('<img/>').attr('src', $('#p_browsergraphic').val())
        );
    }

    $('#p_browsergraphic').change(function() {
        var src = $(this).val();

        $('#browserGraphic').children().remove();
        $('#browserGraphic').append(
            $('<img/>').attr('src', src)
        );
    });

    // KEYWORD REPO
    $('.keywordRepo').change(function() {
        $('.keywordRepoValue').removeClass('act');
        $(".keywordRepoValue[data-id='" + $(this).val() + "']").addClass('act');
    });

    $('.keywordRepoValue').change(function(){

        var result = $('#result_p_keyword');
        var dataTitle = $(this).attr('data-title');

        result.prepend(
            $('<div></div>').append(
                $('<input/>').attr("type", "hidden").attr("name", "p[keyword][" + dataTitle + "][date]").val($(this).attr('data-date')),
                $('<input/>').attr("type", "hidden").attr("name", "p[keyword][" + dataTitle + "][type]").val($(this).attr('data-type')),
                $('<input/>').attr("type", "hidden").attr("name", "p[keyword][" + dataTitle + "][value][]").val($(this).val()),
                $('<label></label>').text($(this).attr('data-title') + ' - ' + $(this).val()),
                $('<div></div>').addClass("btn cmdDeleteSingleValue").append($('<div></div>').addClass('icon icon-bin2'))
            )
        );

        $(this).val('');
    });

    $('#add_keyword').click(function() {
        var result = $('#result_p_keyword');
        var $keywordTitle = $('#p_keyword_title');
        var $keywordDate  = $('#p_keyword_date');
        var $keywordType  = $('#p_keyword_type');
        var $keywordValue = $('#p_keyword_value');
        var val = $('#p_keyword_value').val();

        if ($keywordTitle.val() !== '') {
            result.prepend(
                $('<div></div>').append(
                    $('<input/>').attr("type", "hidden").attr("name", "p[keyword][" + $keywordTitle.val() + "][date]").val($keywordDate.val()),
                    $('<input/>').attr("type", "hidden").attr("name", "p[keyword][" + $keywordTitle.val() + "][type]").val($keywordType.val()),
                    $('<input/>').attr("type", "hidden").attr("name", "p[keyword][" + $keywordTitle.val() + "][value][]").val(val),
                    $('<label></label>').text($keywordTitle.val() + ' - ' + val),
                    $('<div></div>').addClass("btn cmdDeleteSingleValue").append($('<div></div>').addClass('icon icon-bin2'))
                )
            );
        } else {
            result.prepend(
                $('<div></div>').append(
                    $('<input/>').attr("type", "hidden").attr("name", "p[keyword][][value][]").val(val),
                    $('<label></label>').text($keywordTitle.val() + ' - ' + val),
                    $('<div></div>').addClass("btn cmdDeleteSingleValue").append($('<div></div>').addClass('icon icon-bin2'))
                )
            );
        }

        $keywordValue.val('');
        $keywordTitle.val('');
        $keywordDate.val('');
        $keywordType.val('');
    });

    // INSPIRE IDENTIFY
    $('#p_keyword_inspire_identified').on('change', function () {
        var selected = $(this).val();
        var result = $('#result_p_keyword');
        var regexInspire = /inspireidentifiziert/;
        var inspireIdentified = false;

        if( selected === "1") {
            var $this = $(this);
            var val = $this.val();
            var dataTitle = $this.attr('data-title');
            //var alreadySet = regexInspire.test("inspireidentifiziert");

            result.find('input').each(function(){
                if ( $(this).val() === "inspireidentifiziert") {
                    //already inspire identified
                    inspireIdentified = true;
                }
            });

            if(!inspireIdentified) {
                result.prepend(
                    $('<div></div>').append(
                        $('<input/>').attr("type", "hidden").attr("name", "p[keyword][][value][]").val( dataTitle ),
                        $('<label></label>').text(dataTitle)
                        //$('<div></div>').addClass("btn cmdDeleteSingleValue").append($('<div></div>').addClass('icon icon-bin2'))
                    )
                );
                $this.val('');
            }
        } else {
            result.find('input').each(function(){
                if ( $(this).val() === "inspireidentifiziert") {
                    $(this).parent().remove();
                }
            });
        }
    });

    $('#wizard_p_otherconstraints').click(function() {
        var dialog = $('<div>');

        dialog.modalDialog({
            title: 'Beschränkungen des öffentlichen Zugangs',
            height: 400,
            html: '<div class="wizard-content" data-target="result_p_otherconstraints"></div>',
            buttons: {
                'abort': {
                    'label': 'Abbrechen', 'type': 'info',
                    'click': function(result) {
                        $(this).modalDialog('close', false);
                    }
                }
            },
            onOpen: function() {
                $('.wizard-content').append(
                    $('#wizard_values_p_otherconstraints').children().clone()
                );
            }
        });

        dialog.modalDialog('open');

        $('.wizard-content-value').click(function() {
            $('#' + $(this).parent().attr('data-target')).prepend(
                $('<div></div>').append(
                    $('<input/>').attr("type", "hidden").attr("name", "p[otherconstraints][]").val($(this).text()),
                    $('<label></label>')
                        .html($(this).text()),
                    $('<div></div>')
                        .addClass("btn cmdDeleteSingleValue")
                        .append($('<div></div>').addClass('icon icon-bin2'))
                    )
            );

            dialog.modalDialog('close');
        });
    });


    $('#wizard_p_dataquality').click(function() {
        var dialog = $('<div>');

        dialog.modalDialog({
            title: 'Übereinstimmung',
            height: 400,
            html: '<div class="wizard-content"></div>',
            buttons: {
                'abort': {
                    'label': 'Abbrechen', 'type': 'info',
                    'click': function(result) {
                        $(this).modalDialog('close', false);
                    }
                }
            },
            onOpen: function() {
                $('.wizard-content').append(
                    $('#wizard_values_p_dataquality').children().clone()
                );
            }
        });

        dialog.modalDialog('open');

        $('.wizard-content-value').click(function() {
            var result = $('#conformity').find('.duplicatable').find('.content div.act');

            result.find('textarea').text($(this).text());

            // Nur .text() hat nicht gereicht. Browserbug?
            result.find('textarea').val($(this).text());
            result.find('div.left').find('input').val($(this).attr('data-date'));
            result.find('div.center').find('select').val($(this).attr('data-type'));
            result.find('div.right').find('select').val($(this).attr('data-result'));

            dialog.modalDialog('close');
        });
    });

    $('#select_p_language').change(function() {
        $('#result_p_language').prepend(
            $('<div></div>').append(
                $('<input/>').attr("type", "hidden").attr("name", "p[language][]").val($(this).val()),
                $('<label></label>')
                    .html($(this).val()),
                $('<div></div>')
                    .addClass("btn cmdDeleteSingleValue")
                    .append($('<div></div>').addClass('icon icon-bin2'))
                )
        );
        $(this).val('');
    });

    $('#select_p_topiccategory').change(function() {
        $('#result_p_topiccategory').prepend(
            $('<div></div>').append(
                $('<input/>').attr("type", "hidden").attr("name", "p[topicCategory][]").val($(this).val()),
                $('<label></label>')
                    .html($(this).val()),
                $('<div></div>')
                    .addClass("btn cmdDeleteSingleValue")
                    .append($('<div></div>').addClass('icon icon-bin2'))
                )
        );
        $(this).val('');
    });

    $('.shareMetadata').click(function() {
        $.ajax({
            url: BASEDIR + "metador/share/",
            type: "POST",
            data: {
                'id': $(this).attr('name'),
                'public': $(this).is(':checked') ? 1 : 0
            }
        });
    });

    $('#wizard_p_coupledresource').click(function() {
        var that = this;
        var dialog = $('<div>');

        dialog.modalDialog({
            title: 'Metadaten',
            height: 300,
            width: 350,
            html: '<div class="wizard-coupled-content"></div>',
            buttons: {
                'abort': {
                    'label': 'Abbrechen', 'type': 'info',
                    'click': function(result) {
                        $(this).modalDialog('close', false);
                    }
                }
            },
            onOpen: function() {
                $('.wizard-coupled-content').append(
                    $('<input />')
                        .attr('id', 'find_coupled_data')
                        .attr('name', 'coupled')
                        .css('width', '100%')
                        .keyup(function() {
                            var find = $(this).val();

                            $.ajax({
                                url: BASEDIR + "metador/service/coupled",
                                type: "get",
                                data: {'find': find},
                                dataType: "json",
                                success:  function(data) {
                                    $('.wizard-content').children().remove();
                                    for(var i in data) {
                                        $('.wizard-content').append(
                                            $('<p></p>')
                                                .addClass('wizard-content-value')
                                                .text(data[i].label)
                                                .attr('data-value', data[i].value)
                                                .click(function() {
                                                    $('#source_p_coupledresource').val(
                                                        $(this).attr('data-value')
                                                    );
                                                    dialog.modalDialog('close', true);
                                                })
                                        );
                                    }
                                }
                            });
                        }),
                    $('<div></div>').addClass('wizard-content')
                ).css('padding', '5px');

                $('#find_coupled_data').focus().keyup();
            }
        });

        dialog.modalDialog('open');
    });

    $('[data-confirm-abort]').click(function() {
        if (!confirm($(this).attr('data-confirm-abort'))) {
            return false;
        }
    });
});
