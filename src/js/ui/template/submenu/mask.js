export default ({iconStyle: {normal, active}}) => (`
    <ul class="tui-image-editor-submenu-item">
        <li>
            <div class="tui-image-editor-button">
                <div>
                    <input type="file" accept="image/*" id="tie-mask-image-file">
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}#${normal.name}-ic-mask-load" class="normal"/>
                        <use xlink:href="${active.path}#${active.name}-ic-mask-load" class="active"/>
                    </svg>
                </div>
                <label> Load Mask Image </label>
            </div>
        </li>
        <li class="tui-image-editor-partition only-left-right">
            <div></div>
        </li>
        <li id="tie-mask-apply" class="tui-image-editor-newline apply" style="margin-top: 22px;margin-bottom: 5px">
            <div class="tui-image-editor-button apply">
                <svg class="svg_ic-menu">
                    <use xlink:href="${normal.path}#${normal.name}-ic-apply" class="normal"/>
                    <use xlink:href="${active.path}#${active.name}-ic-apply" class="active"/>
                </svg>
                <label>
                    Apply
                </label>
            </div>
        </li>
    </ul>
`);
