// map menu
$('.-js-toggle-map').on('click', function () {
    $(this).toggleClass('active');
    $('.-js-map-dialog').show();
    $('.-js-home').toggleClass('map-enabled');
    Window.metador.metadorMap.updateMap();
});

$('.-js-source').on('click', function () {
    $(this).siblings().removeClass('active');
    $(this).addClass('active');
    $('.-js-profile-menu').removeClass('active');
    $('#' + $(this).attr('data-id')).addClass('active');
});

$('.-js-crs-code').on('change', function () {
    Window.metador.metadorMap.changeCrs($(this).val());
});

$('.-js-draw-type').on('click', function () {
    var $this = $(this);
    Window.metador.metadorMap.drawShapeForSearch(
        $this.val(),
        function (geometry) {
            console.log(geometry);
        }
    );
});

$('.-js-zoom-box').on('click', function () {
    var $this = $(this);
    if ($this.hasClass('success')) {
        $(this).removeClass('success');
        Window.metador.metadorMap.dragZoom(
            false,
            function () {
                $this.removeClass('success');
            }
        );
    } else {
        $(this).addClass('success');
        Window.metador.metadorMap.dragZoom(
            true,
            function () {
                $this.removeClass('success');
            }
        );
    }
});

$('.-js-file-upload').on('change', function (e) {
    $('#file-upload-form').submit();

});

$('#file-upload-form').ajaxForm({
    dataType: 'json',
    success: function (data) {
        metador.parseResponse(data);
        if (data.content) {
            Window.metador.metadorMap.drawGeometryForSearch(data.content);
        }
    },
    error: function (jqXHR, textStatus, errorThrown) {
        metador.displayError(errorThrown);
    }
});

$('#map-menu-load-wms-button').on('click', function () {
    var $input = $('#map-menu-load-wms-input');
    if ($input.val()) {
        $.ajax({
            url: $input.attr('data-url'),
            data: {
                url: encodeURIComponent($input.val())
            }
        }).success(function (data) {
            metador.parseResponse(data);
            Window.metador.metadorMap.addLayerForOptions(data);
        }).error(function (jqXHR, textStatus, errorThrown) {
            metador.displayError(errorThrown);
        });
    } else {
        metador.displayError('Keine GetCapabilities URL eingetragen!');
    }
});
//
// // map side pane
// $(document).on('change', '.-js-map-source-visible', function () {
//     var $this = $(this);
//     Window.metador.metadorMap.setVisible($this.parents('li:first').attr('id'), $this.prop('checked'));
// });
//
// $(document).on('change', '.-js-map-source-opacity', function () {
//     var $this = $(this);
//     Window.metador.metadorMap.setOpacity($this.parents('li:first').attr('id'), $this.val());
// });
//
// // layer drag and drop
// var currentLayer = null;
// var oldPosition = 0;
// addDraggableEventListener($('#dummy-layer').get(0));
//
// function getLayerPosition(layer) {
//     var index = 0;
//     var list = $('.-js-map-layertree ul .-js-draggable');
//     var length = list.length
//     for (var i = 0; i < length; i++) {
//         if (list[i].id === layer.id) {
//             // console.log(length - 1 - i);
//             return length - 1 - i;
//         }
//     }
//
//     return null;
// }
//
// function _handleDragStart(e) {
//     currentLayer = this;
//     oldPosition = getLayerPosition(this);
//
//     e.dataTransfer.effectAllowed = 'move';
//     e.dataTransfer.setData('text/html', this.innerHTML);
//     $(this).addClass("move");
// }
//
// function _handleDragOver(e) {
//     // Necessary. Allows to drop.
//     if (e.preventDefault) {
//         e.preventDefault();
//     }
//
//     e.dataTransfer.dropEffect = 'move';
//     return false;
// }
//
// function _handleDragEnter(e) {
//     if (currentLayer !== this) {
//         $(currentLayer).remove();
//         $(this).before(currentLayer);
//     }
// }
//
// function _handleDragDrop(e) {
//     e.stopPropagation(); // Stops some browsers from redirecting.
//     e.preventDefault();
//     $(this).removeClass("over");
// }
//
// function _handleDragEnd(e) {
//     $(this).removeClass('move');
//     Window.metador.metadorMap.moveLayer(
//         $(currentLayer).attr('id'),
//         oldPosition,
//         getLayerPosition(currentLayer)
//     );
// }
//
// function addDraggableEventListener(layer) {
//
//     if ($(layer).attr('data-draggable') === "true") {
//         layer.addEventListener('dragstart', _handleDragStart, false);
//         layer.addEventListener('dragend', _handleDragEnd, false);
//     }
//
//     layer.addEventListener('dragenter', _handleDragEnter, false);
//     layer.addEventListener('dragover', _handleDragOver, false);
//     layer.addEventListener('drop', _handleDragDrop, false);
// }
//
// function addSource(id, title, visible, opacity) {
//     var maxLength = 16;
//     var select = $('<select></select>')
//         .addClass('input-element medium simple js-map-source-opacity -js-map-source-opacity');
//
//     for (var i = 0; i <= 10; i++) {
//         select.append('<option value="' + (i / 10) + '">' + (i * 10) + ' %</option>');
//     }
//     // TODO: Configuration for draggable Layer
//     var li = $('<li></li>')
//         .attr('id', id)
//         .attr('draggable', "true")
//         .attr('data-draggable', "true")
//         .addClass('draggable -js-draggable');
//
//     addDraggableEventListener(li.get(0), true);
//
//     var ttl = null;
//     if (title.length > maxLength) {
//         ttl = title.substring(0, maxLength);
//         if (ttl.lastIndexOf(' ') > 0) {
//             ttl = ttl.substring(0, ttl.lastIndexOf(' '));
//         }
//     } else {
//         ttl = title;
//     }
//     li.append(
//         $('<input />')
//             .attr('type', 'checkbox')
//             .attr('id', 'chb-' + id)
//             .addClass('check -js-map-source-visible')
//             .prop('checked', visible)
//     ).append(
//         $('<label></label>')
//             .attr('for', 'chb-' + id)
//             .attr('title', title)
//             .addClass('form-label')
//             .text(ttl)
//     ).append(
//         select
//     );
//     select.val(opacity);
//     $('.-js-map-layertree ul').prepend(li);
// }

function createGeoFeature(west, south, east, north, properties) {
    var feature = {
        'type': 'Feature',
        'geometry': {
            'type': 'Polygon',
            'coordinates': [[[west, south], [east, south], [east, north], [west, north], [west, south]]]
        }
    };
    if (properties) {
        for (var key in properties) {
            feature[key] = properties[key];
        }
    }
    return feature;
}

function createGeoCollection(crs, geoFeatures) {
    return {
        'type': 'FeatureCollection',
        'crs': {
            'type': 'name',
            'properties': {
                'name': 'EPSG:4326'
            }
        },
        'features': geoFeatures ? geoFeatures : []
    };
}

function addFeature(geoCollection, geoFeature) {
    geoCollection.features.push(geoFeature);
}

Window.metador.initMap();

/* // show clear features
 // show features
 var hgcollection = {
 'type': 'FeatureCollection',
 'crs': {
 'type': 'name',
 'properties': {
 'name': 'EPSG:3857'
 }
 },
 'features': [{
 'type': 'Feature',
 'geometry': {
 'type': 'Polygon',
 'coordinates': [[[9, 49], [12, 50], [9, 51], [9, 49]]]
 }
 }]
 };
 Window.metador.metadorMap.showFeatures(Window.metador.metadorMap.getHgLayer(), hgcollection);
 // clear features
 Window.metador.metadorMap.clearFeatures(Window.metador.metadorMap.getHgLayer());

 */
