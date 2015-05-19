const data = require('sdk/self').data;
const { PageMod } = require('sdk/page-mod');
const prefs = require("sdk/simple-prefs");

// Declaring the preferences object
let prefs_obj = {};
// Setting preferences listeners and initializing preferences object
for (let pref in prefs.prefs) {
    prefs.on(pref, function (pref) { prefs_obj[pref] = prefs.prefs[pref]; });
    prefs_obj[pref] = prefs.prefs[pref];
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