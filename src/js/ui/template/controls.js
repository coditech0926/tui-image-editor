export default ({biImage, iconStyle: {normal, hover, disabled}, loadButtonStyle, downloadButtonStyle}) => (`
    <div class="tui-image-editor-controls">
        <div class="tui-image-editor-controls-logo">
            <img src="${biImage}" />
        </div>
        <ul class="tui-image-editor-menu">
            <li id="tie-btn-undo" class="tui-image-editor-item" title="Undo">
                <svg class="svg_ic-menu">
                    <use xlink:href="${normal.path}#${normal.name}-ic-undo" class="enabled"/>
                    <use xlink:href="${disabled.path}#${disabled.name}-ic-undo" class="normal"/>
                    <use xlink:href="${hover.path}#${hover.name}-ic-undo" class="hover"/>
                </svg>
            </li>
            <li id="tie-btn-redo" class="tui-image-editor-item" title="Redo">
                <svg class="svg_ic-menu">
                    <use xlink:href="${normal.path}#${normal.name}-ic-redo" class="enabled"/>
                    <use xlink:href="${disabled.path}#${disabled.name}-ic-redo" class="normal"/>
                    <use xlink:href="${hover.path}#${hover.name}-ic-redo" class="hover"/>
                </svg>
            </li>
            <li id="tie-btn-reset" class="tui-image-editor-item" title="Reset">
                <svg class="svg_ic-menu">
                    <use xlink:href="${normal.path}#${normal.name}-ic-reset" class="enabled"/>
                    <use xlink:href="${disabled.path}#${disabled.name}-ic-reset" class="normal"/>
                    <use xlink:href="${hover.path}#${hover.name}-ic-reset" class="hover"/>
                </svg>
            </li>
            <li class="tui-image-editor-item">
                <div class="tui-image-editor-icpartition"></div>
            </li>
            <li id="tie-btn-delete" class="tui-image-editor-item" title="Delete">
                <svg class="svg_ic-menu">
                    <use xlink:href="${normal.path}#${normal.name}-ic-delete" class="enabled"/>
                    <use xlink:href="${disabled.path}#${disabled.name}-ic-delete" class="normal"/>
                    <use xlink:href="${hover.path}#${hover.name}-ic-delete" class="hover"/>
                </svg>
            </li>
            <li id="tie-btn-delete-all" class="tui-image-editor-item" title="Delete-all">
                <svg class="svg_ic-menu">
                    <use xlink:href="${normal.path}#${normal.name}-ic-delete-all" class="enabled"/>
                    <use xlink:href="${disabled.path}#${disabled.name}-ic-delete-all" class="normal"/>
                    <use xlink:href="${hover.path}#${hover.name}-ic-delete-all" class="hover"/>
                </svg>
            </li>
            <li class="tui-image-editor-item">
                <div class="tui-image-editor-icpartition"></div>
            </li>
        </ul>

        <div class="tui-image-editor-controls-buttons">
            <button style="${loadButtonStyle}">
                Load
                <input type="file" class="tui-image-editor-load-btn" />
            </button>
            <button class="tui-image-editor-download-btn" style="${downloadButtonStyle}">
                Download
            </button>
        </div>
    </div>
`);
