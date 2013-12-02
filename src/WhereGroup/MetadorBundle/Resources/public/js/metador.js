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

function changeNames(clone, count) {
    clone.each(function() {
        var name = $(this).attr('name');
        var id = $(this).attr('id');
        var obj_id = $(this).attr('data-obj-id');

        if(typeof name !== 'undefined' && name !== false) {
            name = name.replace(/\[\d\]/g, "[" + count + "]");
            $(this).attr('name', name);
        }

        if(typeof id !== 'undefined' && id !== false) {
            id = id.replace(/_\d_/g, "_" + count + "_");
            $(this).attr('id', id);
        }

        if(typeof obj_id !== 'undefined' && obj_id !== false) {
            obj_id = obj_id.replace(/_\d_/g, "_" + count + "_");
            $(this).attr('data-obj-id', obj_id);
        }

        if($(this).children().size() > 0) {
            changeNames($(this).children(), count);
        }
    });
}

function addBBOX(n, e, s , w) {
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
                    $('<td></td>').html(n),
                    $('<td></td>').html(e),
                    $('<td></td>').html(s),
                    $('<td></td>').html(w)
                )
            ),
            $('<div></div>').addClass("btn cmdDeleteSingleValue").append($('<div></div>').addClass('icon delete'))
        )
    );

    result.attr('data-count', parseInt(result.attr('data-count')) + 1);
}

function disable_GDIDE_Button(element) {
    $(element)
        .text('bitte warten')
        .attr('disabled','disabled')
        .closest('form')
        .submit();
}

function enable_GDIDE_Button() {
    $('.gdi-de-button')
        .text('Download Testbericht (pdf)')
        .removeAttr('disabled');
}

$(document).ready(function() {
    // LEFT MENU CLICK
    $('.secondMenu li').click(function() {
        $('.secondMenu > li').removeClass('act');
        $(this).addClass('act');

        $('.metadataFormPages > div').removeClass('act');
        $('.metadataFormPages > div#' + $(this).attr('data-tab')).addClass('act');
    });


    // SUBMIT CLICK
    $('.metadataFormSubmit').click(function() {
        $('form[name="metadataForm"]').submit();
    });


    $('.gdi-de-button').click(function() {
        disable_GDIDE_Button(this);
        setTimeout("enable_GDIDE_Button()", 10000);
        return true;
    });

    // NOTIFY
    // TODO: change to position absolute.
    // $('.notify').fadeOut(8000, function() {
    //     $('.bottom').html($(this).html());
    // });

    // DATEPICKER
    // TODO: add german months and days
    $('.datepicker').live('mousedown', function() {
        $(this).Zebra_DatePicker({
            show_icon: false,
            offset:[-177,120]
            //months: ['','']
            //days: ['','']
        })
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

        if(source.val() == "") {
            alert("Eingabe leer.")
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
                    .append($('<div></div>').addClass('icon delete'))
                )
        );

        source.val("");
    });

    // REMOVE SINGLE VALUE
    $('.cmdDeleteSingleValue').live('click', function() {
        if(confirm("Eintrag löschen?")) {
            $(this).parent().remove();
        }
    });


    // DUPLICATEABLE'S
    $('div.duplicatable li.duplicate').click(function() {
        var content = $(this).closest('.duplicatable').find('.content');
        var count = $(this).closest('.duplicatable').attr("data-count");

        if(content.children().length > 9) {
            return false;
        }

        var clone = content.find(".nr" + $(this).prev().attr('data-id'))
            .clone().removeClass().addClass('nr' + ++count + ' act');

        changeNames(clone, count);

        $(this).closest('.duplicatable').find('ul').children().removeClass('act');

        $(this).closest('.duplicatable').find('ul').find('.duplicate')
            .before($('<li></li>').attr("data-id", count).text(count).addClass('tab act'));

        content.children().removeClass('act');
        content.append(clone);

        $(this).closest('div.duplicatable').attr("data-count", count);
    });

    $('div.duplicatable .menu.delete').live('click', function() {
        var element = $(this).closest('.duplicatable');
        var list = element.find('ul li.act');
        var content = element.find('div.content div.act');

        if(list.attr('data-id') != 0) {
            list.remove();
            content.remove();

            element.find('ul').find('li').eq(0).addClass("act");
            element.find('div.content div').eq(0).addClass("act");
        } else {
            alert("Das erste Element kann nicht gelöscht werden.");
        }  
    });

    $('.duplicatable ul li.tab').live('click', function() {
        var content = $(this).closest('.duplicatable').find('.content');

        $(this).siblings().removeClass("act");
        $(this).addClass("act");

        content.children().removeClass('act');
        content.find(".nr" + $(this).attr('data-id')).addClass('act');
    });


    // WIZARDS
    $('.wizard_p_fileidentifier').live('click', function() {
        var element_id = $(this).attr('data-obj-id');
        var dialog = $('<div>');

        dialog.modalDialog({
            title: 'UUID generieren',
            height: 200,
            html: '<div class="makeUUID"></div>',
            buttons: {
                'abort': {
                    'label': 'Abbrechen', 'type': 'info',
                    'click': function(result) {
                        $(this).modalDialog('close', false);
                    }
                },
                'ok': {
                    'label': 'Übernehmen', 'type': 'info',
                    'click': function() {
                        $('#' + element_id).val(
                            $('.makeUUID').text()
                        );

                        if($('#p_identifier_0_code').val() == "") {
                            $('#p_identifier_0_code').val($('.makeUUID').text());
                        }

                        $(this).modalDialog('close', true);
                    }
                }
            },
            onOpen: function() {
                $('.makeUUID').html(getUUID());
            }
        });
        dialog.modalDialog('open');
    });

    $('#p_uselimitation_b').change(function() {
        $('#result_p_uselimitation').prepend(
            $('<div></div>').append(
                $('<input/>').attr("type", "hidden").attr("name", "p[uselimitation][]").val($(this).val()),
                $('<label></label>')
                    .html($(this).val()),
                $('<div></div>')
                    .addClass("btn cmdDeleteSingleValue")
                    .append($('<div></div>').addClass('icon delete'))
                )
        );
        $(this).val('');
    });

    $('#add_p_bbox').click(function() {
        addBBOX(
            $('#bboxn').val(), 
            $('#bboxe').val(), 
            $('#bboxs').val(), 
            $('#bboxw').val()
        );

        $('#bboxSelect').val('');
        $('#bboxn').val('');
        $('#bboxe').val('');
        $('#bboxs').val('');
        $('#bboxw').val('');
    });

    if($('#p_browsergraphic').val() != "") {
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


    $('.showHelp').live('click', function() {
        var dialog = $('<div>');
        var id = $(this).attr('data-obj-id');

        $.ajax({
            url: BASEDIR + "metador/help/get",
            data: {"id" : id},
            type: "post",
            dataType: "html",
            success:  function(data) { 
                dialog.modalDialog({
                    title: 'Hilfetext',
                    height: 300,
                    width: 350,
                    html: data,
                    buttons: {
                        'ok': {
                            'label': 'Schließen', 'type': 'info',
                            'click': function() {
                                if($('.helptext').attr("contentEditable")) {
                                    $.ajax({
                                        url: BASEDIR + "metador/help/set",
                                        data: {"id" : id, "html": $('.helptext').html()},
                                        type: "post", dataType: "html"
                                    });
                                }
                                $(this).modalDialog('close', true);
                            }
                        }
                    },
                    onOpen: function() {}
                });

                dialog.modalDialog('open');
            }
        });
    });

    // KEYWORD REPO
    $('.keywordRepo').change(function() {
        $('.keywordRepoValue').removeClass('act');
        $(".keywordRepoValue[data-id='" + $(this).val() + "']").addClass('act');
    });

    $('.keywordRepoValue').change(function() {
        var result = $('#result_p_keyword');

        result.prepend(
            $('<div></div>').append(
                $('<input/>').attr("type", "hidden").attr("name", "p[keyword][" + $(this).attr('data-title') + "][date]").val($(this).attr('data-date')),
                $('<input/>').attr("type", "hidden").attr("name", "p[keyword][" + $(this).attr('data-title') + "][type]").val($(this).attr('data-type')),
                $('<input/>').attr("type", "hidden").attr("name", "p[keyword][" + $(this).attr('data-title') + "][value][]").val($(this).val()),
                $('<label></label>').text($(this).attr('data-title') + ' - ' + $(this).val()),
                $('<div></div>').addClass("btn cmdDeleteSingleValue").append($('<div></div>').addClass('icon delete'))
            )
        );

        $(this).val('');
    });

    $('#add_keyword').click(function() {
        var result = $('#result_p_keyword');

        result.prepend(
            $('<div></div>').append(
                $('<input/>').attr("type", "hidden").attr("name", "p[keyword][" + $('#p_keyword_title').val() + "][date]").val($('#p_keyword_date').val()),
                $('<input/>').attr("type", "hidden").attr("name", "p[keyword][" + $('#p_keyword_title').val() + "][type]").val($('#p_keyword_type').val()),
                $('<input/>').attr("type", "hidden").attr("name", "p[keyword][" + $('#p_keyword_title').val() + "][value][]").val($('#p_keyword_value').val()),
                $('<label></label>').text($('#p_keyword_title').val() + ' - ' + $('#p_keyword_value').val()),
                $('<div></div>').addClass("btn cmdDeleteSingleValue").append($('<div></div>').addClass('icon delete'))
            )
        );

        $('#p_keyword_value').val('');
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
                        .append($('<div></div>').addClass('icon delete'))
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

    function menuAdd(id, url, title, target) {
        var link = $('<a/>').attr('id', id).attr('href', url).text(title);

        if(typeof target != 'undefined') {
            link.attr('target', target);
        }
        
        $('.contentMenu').find('ul').append(
            $('<li></li>').append(link)
        );
    }

    function menuUpdate(id, url) {
        $('#' + id).attr('href', url);
    }

    $('#metadataTable').find('tbody').find('tr').click(function() {
        $('#metadataTable').find('tr').removeClass('act');
        $(this).addClass('act');

        var id = $(this).attr('data-id');
        var controller = $('#metadataTable').attr('data-controller');

        if($('#linkVorlage').length == 0) {
            menuAdd('linkVorlage', BASEDIR + 'metador/' + controller + '/use/' + id, 'neu aus Vorlage');
        } else {
            menuUpdate('linkVorlage', BASEDIR + 'metador/' + controller + '/use/' + id);
        }

        if($('#linkBearbeiten').length == 0) {
            menuAdd('linkBearbeiten', BASEDIR + 'metador/' + controller + '/edit/' + id, 'bearbeiten');
        } else {
            menuUpdate('linkBearbeiten', BASEDIR + 'metador/' + controller + '/edit/' + id);
        }

        if($('#linkXML').length == 0) {
            menuAdd('linkXML', BASEDIR + 'metador/xml/' + $(this).attr('data-id'), 'xml', '_BLANK');
        } else {
            menuUpdate('linkXML', BASEDIR + 'metador/xml/' + id);
        }
    });

    $('[data-id="wizard_responsibleParty"]').click(function() {
        var that = this;
        var dialog = $('<div>');

        dialog.modalDialog({
            title: 'Adresse',
            height: 300,
            width: 350,
            html: '<div class="wizard-content"></div>',
            buttons: {
                'abort': {
                    'label': 'Abbrechen', 'type': 'info',
                    'click': function(result) {
                        $('.resparty-data').unbind('click');
                        $(this).modalDialog('close', false);
                    }
                }
            },
            onOpen: function() {}
        });

        dialog.modalDialog('open');

        $.ajax({
            url: BASEDIR + "metador/address/get",
            type: "post",
            dataType: "json",
            success:  function(data) {
                for(var i in data) {
                    if(data[i].individualName == "")
                        continue;

                    $('.wizard-content').append(
                        $('<div></div>').append(
                            $('<p></p>')
                                .addClass('wizard-content-value')
                                .html(data[i].individualName)
                        )
                        .bind('click', function() {
                            var info = $(this).data('info');
                            var content = $(that).closest('.duplicatable').find('.content').children('div.act');

                            for(i in info) {
                                $('[name*="' + i + '"]', content).val(info[i]);
                            }
                            dialog.modalDialog('close');
                        })
                        .addClass('resparty-data')
                        .data('info', data[i])
                    );
                }
            }
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
                    .append($('<div></div>').addClass('icon delete'))
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
                    .append($('<div></div>').addClass('icon delete'))
                )
        );
        $(this).val('');
    });

    $('.shareMetadata').click(function() {
        $.ajax({
            url: BASEDIR + "metador/share",
            type: "post",
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

});
