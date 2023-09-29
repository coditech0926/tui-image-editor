## 💾 Install

The TOAST UI products can be installed by using the package manager or downloading the source directly.
However, we highly recommend using the package manager.

### Via Package Manager

You can find TOAST UI producs via [npm](https://www.npmjs.com/) and [bower](https://bower.io/) package managers.
Install by using the commands provided by each package manager.
When using npm, be sure [Node.js](https://nodejs.org) is installed in the environment.


#### npm

#### 1. ImageEditor installation
```sh
$ npm install --save tui-image-editor # Latest version
$ npm install --save tui-image-editor@<version> # Specific version
```

##### 2. `fabric.js` installation
And you should add **postInstall** script to your `package.json`. 
_This process will be removed when `fabric.js` updated to v2.7.0 and bundled with TOAST UI ImageEditor together._

```js
{
    // ...
    "scripts": {
        // ...
        "postInstall": "npm install --no-save --no-optional fabric@^1.6.7"
    }
    // ...
}
```

Or you can add `fabric` as dependency.

#### bower

```sh
$ bower install tui-image-editor # Latest version
$ bower install tui-image-editor#<tag> # Specific version
```

### Via Contents Delivery Network (CDN)
TOAST UI products are available over the CDN powered by [TOAST Cloud](https://www.toast.com).

You can use the CDN as below.

```html
<link rel="stylesheet" href="https://uicdn.toast.com/tui-image-editor/latest/tui-image-editor.css">
<script src="https://uicdn.toast.com/tui-image-editor/latest/tui-image-editor.js"></script>
```

If you want to use a specific version, use the tag name instead of `latest` in the URL.

The CDN directory has the following structure.

```
tui-image-editor/
├─ latest/
│  ├─ tui-image-editor.js
│  ├─ tui-image-editor.min.js
│  └─ tui-image-editor.css
├─ v3.1.0/
│  ├─ ...
```

## 🔨 Usage

### HTML

Add the container element where TOAST UI ImageEditor will be created.

``` html
<body>
...
<div id="tui-image-editor"></div>
...
</body>
```

### javascript

Add dependencies & initialize ImageEditor class with given element to make an image editor.

```javascript
var ImageEditor = require('tui-image-editor');
var blackTheme = require('./js/theme/black-theme.js');
var locale_ru_RU = { // override default English locale to your custom
    'Crop': 'Обзрезать',
    'Delete-all': 'Удалить всё'
    // etc...
};
var instance = new ImageEditor(document.querySelector('#tui-image-editor'), {
     includeUI: {
         loadImage: {
             path: 'img/sampleImage.jpg',
             name: 'SampleImage'
         },
         locale: locale_ru_RU,
         theme: blackTheme, // or whiteTheme
         initMenu: 'filter',
         menuBarPosition: 'bottom'
     },
    cssMaxWidth: 700,
    cssMaxHeight: 500,
    selectionStyle: {
        cornerSize: 20,
        rotatingPointOffset: 70
    }
});
```

Or ~ UI

```javascript
var ImageEditor = require('tui-image-editor');
var instance = new ImageEditor(document.querySelector('#tui-image-editor'), {
    cssMaxWidth: 700,
    cssMaxHeight: 500,
    selectionStyle: {
        cornerSize: 20,
        rotatingPointOffset: 70
    }
});
```

### TypeScript
If you using TypeScript, You must `import module = require('module')` on importing.
[`export =` and `import = require()`](https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require)

```typescript
import ImageEditor = require('tui-image-editor');

const instance = new ImageEditor(document.querySelector('#tui-image-editor'), {
    cssMaxWidth: 700,
    cssMaxHeight: 500,
    selectionStyle: {
        cornerSize: 20,
        rotatingPointOffset: 70
    }
});
```
