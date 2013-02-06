const data = require('sdk/self').data;
const { PageMod } = require('sdk/page-mod');
const prefs = require("sdk/simple-prefs");

/** Using prefList list temporarily till Bug 709382 gets fixed
    Bug 709382 – require("simple-prefs").prefs should be iterable
    https://bugzilla.mozilla.org/show_bug.cgi?id=709382
**/
const prefList = ['bg_color', 'light_color', 'disable_toolbar'];

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
    contentScript: '',
    onAttach: function onAttach(worker) {
        let { tab } = worker;
        if (tab && tab.contentType.indexOf("image/") > -1) {
            let worker2 = tab.attach({
                contentScriptFile: [data.url('js/jquery.min.js'), data.url('js/style.js'), data.url('js/IVPlus.js')]
            });
            worker2.port.emit('prefs', prefs_obj);
            worker2.port.emit('style', data.url());
        }
    }
});

// exports.main = function (options, callbacks) {
//     if (options.loadReason === 'upgrade') {
//         require("tabs").open(data.url("release-notes.html"));
//     }
// };