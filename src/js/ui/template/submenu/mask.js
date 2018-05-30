export default ({iconStyle: {normal, active}}) => (`
    <ul class="menu">
        <li>
            <div class="button">
                <div>
                    <input type="file" accept="image/*" id="mask-image-file">
                    <svg class="svg_ic-submenu">
                        <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-mask-load" class="normal"/>
                        <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-mask-load" class="active"/>
                    </svg>
                </div>
                <label> Load Mask Image </label>
            </div>
        </li>
        <li class="tui-image-editor-partition only-left-right">
            <div></div>
        </li>
        <li id="mask-apply" class="newline apply">
            <div class="button apply">
                <svg class="svg_ic-menu">
                    <use xlink:href="${normal.path}/${normal.name}.svg#${normal.name}-ic-apply" class="normal"/>
                    <use xlink:href="${active.path}/${active.name}.svg#${active.name}-ic-apply" class="active"/>
                </svg>
                <label>
                    Apply
                </label>
            </div>
        </li>
    </ul>
`);
