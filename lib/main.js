const data = require('self').data;
const { PageMod } = require('page-mod');
const prefs = require("simple-prefs");

/** Using prefList list temporarily till Bug 709382 gets fixed
    Bug 709382 – require("simple-prefs").prefs should be iterable
    https://bugzilla.mozilla.org/show_bug.cgi?id=709382
**/
let prefList = ['bg_color', 'light_color', 'disable_toolbar'];

// Declaring the preferences object
let prefs_obj = {};
// Setting preferences listeners and initializing preferences object
for(let i=0; i<prefList.length; i++) {
    prefs.on(prefList[i], function(pref) { prefs_obj[pref] = prefs.prefs[pref]; });
    prefs_obj[prefList[i]] = prefs.prefs[prefList[i]];
}

let ImageViewer = PageMod({
    include: /.*/,
    contentScriptWhen: 'start',
    contentScriptFile: [data.url('js/jquery.min.js'), data.url('js/IVPlus.js')],
    contentStyleFile: data.url("css/IVPlus.css"),
    // contentStyle is built dynamically here to include absolute URLs
    // for the files referenced by these CSS rules.
    // This workaround is needed because we can't use relative URLs
    // in contentStyleFile or contentStyle.
    contentStyle: '@media not print {' +
                  '.ImgViewerPlusBody #minimize { background: url(' + data.url('img/logo.png') + ') no-repeat; }' +
                  '.ImgViewerPlusBody #zoom-in { background: url(' + data.url('img/zoom-in.png') + ') no-repeat; }' +
                  '.ImgViewerPlusBody #zoom-out { background: url(' + data.url('img/zoom-out.png') + ') no-repeat; }' +
                  '.ImgViewerPlusBody #reset-zoom { background: url(' + data.url('img/reset-zoom.png') + ') no-repeat; }' +
                  '.ImgViewerPlusBody #rotate-ccw { background: url(' + data.url('img/rotate-ccw.png') + ') no-repeat; }' +
                  '.ImgViewerPlusBody #rotate-cw { background: url(' + data.url('img/rotate-cw.png') + ') no-repeat; }' +
                  '.ImgViewerPlusBody #reset-img { background: url(' + data.url('img/reset.png') + ') no-repeat; }' +
                  '.ImgViewerPlusBody #lights { background: url(' + data.url('img/light-bulb.png') + ') no-repeat; }' +
                  '.ImgViewerPlusBody #nav-up { background: url(' + data.url('img/navigation-up.png') + ') no-repeat; }' +
                  '.ImgViewerPlusBody #nav-right { background: url(' + data.url('img/navigation-right.png') + ') no-repeat; }' +
                  '.ImgViewerPlusBody #nav-down { background: url(' + data.url('img/navigation-down.png') + ') no-repeat; }' +
                  '.ImgViewerPlusBody #nav-left { background: url(' + data.url('img/navigation-left.png') + ') no-repeat; }' +
                  '.ImgViewerPlusBody #nav-reset { background: url(' + data.url('img/compass.png') + ') no-repeat; }' +
                  '}',
    onAttach: function onAttach(worker) {
                worker.port.on('send prefs_obj', function() {
                    worker.port.emit('prefs', prefs_obj);
                });
              }
});

exports.main = function (options, callbacks) {
    if (options.loadReason === 'upgrade') {
        require("tabs").open(data.url("release-notes.html"));
    }
};
