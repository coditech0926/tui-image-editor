/**
 * mobile.js
 * @author NHN Ent. FE Development Team <dl_javascript@nhnent.com>
 * @fileoverview
 */
/* eslint-disable vars-on-top */
'use strict';

var MAX_RESOLUTION = 1024 * 1024 * 4; // 4MP (Mega Pixel)

var supportingFileAPI = !!(window.File && window.FileList && window.FileReader);
var rImageType = /data:(image\/.+);base64,/;
var demension = getClientDimension();

// Selector of image editor controls
var submenuClass = '.submenu';
var hiddenmenuClass = '.hiddenmenu';

var $controls = $('.tui-image-editor-controls');
var $menuButtons = $controls.find('.menu-button');
var $submenuButtons = $controls.find('.submenu-button');
var $btnShowMenu = $controls.find('.btn-prev');

var $subMenus = $controls.find(submenuClass);
var $hiddenMenus = $controls.find(hiddenmenuClass);

// Image editor controls - top menu buttons
var $inputImage = $('#input-image-file');
var $btnDownload = $('#btn-download');
var $btnUndo = $('#btn-undo');
var $btnRedo = $('#btn-redo');
var $btnRemoveActiveObject = $('#btn-remove-active-object');

// Image editor controls - bottom menu buttons
var $btnCrop = $('#btn-crop');
var $btnAddText = $('#btn-add-text');

// Image editor controls - bottom submenu buttons
var $btnApplyCrop = $('#btn-apply-crop');
var $btnFlipX = $('#btn-flip-x');
var $btnFlipY = $('#btn-flip-y');
var $btnRotateClockwise = $('#btn-rotate-clockwise');
var $btnRotateCounterClockWise = $('#btn-rotate-counter-clockwise');
var $btnAddArrowIcon = $('#btn-add-arrow-icon');
var $btnAddCancelIcon = $('#btn-add-cancel-icon');
var $btnAddCustomIcon = $('#btn-add-custom-icon');
var $btnFreeDrawing = $('#btn-free-drawing');
var $btnLineDrawing = $('#btn-line-drawing');

var $btnChangeTextStyle = $('.btn-change-text-style');

// Image editor controls - etc.
var $inputTextSizeRange = $('#input-text-size-range');
var $inputBrushWidthRange = $('#input-brush-range');
var $inputText = $('#input-text');

// Colorpicker
var iconColorpicker = tui.component.colorpicker.create({
    container: $('#tui-icon-color-picker')[0],
    color: '#000000'
});

var textColorpicker = tui.component.colorpicker.create({
    container: $('#tui-text-color-picker')[0],
    color: '#000000'
});

var brushColorpicker = tui.component.colorpicker.create({
    container: $('#tui-brush-color-picker')[0],
    color: '#000000'
});

// Create image editor
var imageEditor = new tui.component.ImageEditor('.tui-image-editor canvas', {
    cssMaxWidth: demension.w,
    cssMaxHeight: demension.w,
    selectionStyle: {
        cornerSize: 50,
        rotatingPointOffset: 100
    }
});

function hexToRGBa(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    var a = alpha || 1;

    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
}

function base64ToBlob(data) {
    var mimeString = '';
    var raw, uInt8Array, i, rawLength;

    raw = data.replace(rImageType, function(header, imageType) {
        mimeString = imageType;

        return '';
    });

    raw = atob(raw);
    rawLength = raw.length;
    uInt8Array = new Uint8Array(rawLength); // eslint-disable-line

    for (i = 0; i < rawLength; i += 1) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: mimeString});
}

function getBrushSettings() {
    var brushWidth = $inputBrushWidthRange.val();
    var brushColor = brushColorpicker.getColor();

    return {
        width: brushWidth,
        color: hexToRGBa(brushColor, 0.5)
    };
}

function getClientDimension() {
    var width = document.documentElement.clientWidth;
    var height = document.documentElement.clientHeight;

    return {
        w: width,
        h: height
    };
}

// Bind custom event of image editor
imageEditor.on({
    endCropping: function() {
        $subMenus.removeClass('show');
        $hiddenMenus.removeClass('show');
    },
    emptyUndoStack: function() {
        $btnUndo.addClass('disabled');
    },
    emptyRedoStack: function() {
        $btnRedo.addClass('disabled');
    },
    pushUndoStack: function() {
        $btnUndo.removeClass('disabled');
    },
    pushRedoStack: function() {
        $btnRedo.removeClass('disabled');
    },
    activateText: function(obj) {
        $subMenus.eq(3).addClass('show');

        if (obj.type === 'select') {
            $inputText.val(obj.text);
        }
    }
});

// Attach image editor custom events
imageEditor.once('loadImage', function() {
    imageEditor.clearUndoStack();
});

// Image editor controls action
$menuButtons.on('click', function() {
    $(this).parent().find(submenuClass).addClass('show');
});

$submenuButtons.on('click', function() {
    var $hiddenMenu = $(this).parent().find(hiddenmenuClass);

    $hiddenMenus.removeClass('show');

    if ($hiddenMenu.length) {
        $hiddenMenu.addClass('show');
    }
});

$btnShowMenu.on('click', function() {
    $subMenus.removeClass('show');
    $hiddenMenus.removeClass('show');

    imageEditor.endAll();
});

// Image load action
$inputImage.on('change', function(event) {
    var file;
    var img;
    var resolution;

    if (!supportingFileAPI) {
        alert('This browser does not support file-api');
    }

    file = event.target.files[0];

    if (file) {
        img = new Image();

        img.onload = function() {
            resolution = this.width * this.height * 4;

            if (resolution < MAX_RESOLUTION) {
                imageEditor.loadImageFromFile(file);
            } else {
                alert('Loaded image\'s resolution is too large!\nIt can\'t be loaded!');
            }

            URL.revokeObjectURL(file);
        };

        img.src = URL.createObjectURL(file);
    }
});

// Undo action
$btnUndo.on('click', function() {
    imageEditor.undo();
});

// Redo action
$btnRedo.on('click', function() {
    imageEditor.redo();
});

// Remove active object action
$btnRemoveActiveObject.on('click', function() {
    imageEditor.removeActiveObject();
});

// Download action
$btnDownload.on('click', function() {
    var imageName = imageEditor.getImageName();
    var dataURL = imageEditor.toDataURL();
    var blob, type, w;

    if (supportingFileAPI) {
        blob = base64ToBlob(dataURL);
        type = blob.type.split('/')[1];
        if (imageName.split('.').pop() !== type) {
            imageName += '.' + type;
        }

        // Library: FileSaver - saveAs
        saveAs(blob, imageName); // eslint-disable-line
    } else {
        alert('This browser needs a file-server');
        w = window.open();
        w.document.body.innerHTML = '<img src=' + dataURL + '>';
    }
});

// Crop menu action
$btnCrop.on('click', function() {
    imageEditor.startCropping();
});

$btnApplyCrop.on('click', function() {
    imageEditor.endCropping(true);
});

// Orientation menu action
$btnRotateClockwise.on('click', function() {
    imageEditor.rotate(90);
});

$btnRotateCounterClockWise.on('click', function() {
    imageEditor.rotate(-90);
});

$btnFlipX.on('click', function() {
    imageEditor.flipX();
});

$btnFlipY.on('click', function() {
    imageEditor.flipY();
});

// Icon menu action
$btnAddArrowIcon.on('click', function() {
    imageEditor.addIcon('arrow');
});

$btnAddCancelIcon.on('click', function() {
    imageEditor.addIcon('cancel');
});

$btnAddCustomIcon.on('click', function() {
    imageEditor.addIcon('customArrow');
});

iconColorpicker.on('selectColor', function(event) {
    imageEditor.changeIconColor(event.color);
});

// Text menu action
$btnAddText.on('click', function() {
    var initText = 'Text';

    imageEditor.startTextMode();
    imageEditor.addText(initText, {
        styles: {
            fontSize: parseInt($inputTextSizeRange.val(), 10)
        }
    });

    $inputText.focus().val(initText);
});

$btnChangeTextStyle.on('click', function() {
    var styleType = $(this).attr('data-style-type');
    var styleObj = {};
    var styleObjKey;

    switch (styleType) {
        case 'bold':
            styleObjKey = 'fontWeight';
            break;
        case 'italic':
            styleObjKey = 'fontStyle';
            break;
        case 'underline':
            styleObjKey = 'textDecoration';
            break;
        case 'left':
            styleObjKey = 'textAlign';
            break;
        case 'center':
            styleObjKey = 'textAlign';
            break;
        case 'right':
            styleObjKey = 'textAlign';
            break;
        default:
            styleObjKey = '';
    }

    styleObj[styleObjKey] = styleType;

    imageEditor.changeTextStyle(styleObj);
});

$inputText.on('keyup', function() {
    var currentText = $(this).val();
    imageEditor.changeText(currentText);
});

$inputTextSizeRange.on('change', function() {
    imageEditor.changeTextStyle({
        fontSize: parseInt($(this).val(), 10)
    });
});

textColorpicker.on('selectColor', function(event) {
    imageEditor.changeTextStyle({
        fill: event.color
    });
});

// Draw line menu action
$btnFreeDrawing.on('click', function() {
    var settings = getBrushSettings();

    imageEditor.endAll();
    imageEditor.startFreeDrawing(settings);
});

$btnLineDrawing.on('click', function() {
    var settings = getBrushSettings();

    imageEditor.endAll();
    imageEditor.startLineDrawing(settings);
});

$inputBrushWidthRange.on('change', function() {
    imageEditor.setBrush({
        width: parseInt(this.value, 10)
    });
});

brushColorpicker.on('selectColor', function(event) {
    imageEditor.setBrush({
        color: hexToRGBa(event.color, 0.5)
    });
});

// Load sample image
imageEditor.loadImageFromURL('img/sampleImage.jpg', 'SampleImage');

// Add custom icon
imageEditor.registerIcons({
    customArrow: 'M 60 0 L 120 60 H 90 L 75 45 V 180 H 45 V 45 L 30 60 H 0 Z'
});
