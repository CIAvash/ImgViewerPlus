self.port.on('style', function(path) {
    $('head').append('<link href="' + path + 'css/IVPlus.css" rel="stylesheet" type="text/css" />');
    $('<style media="not print">' +
      '#minimize { background: url(' + path + 'img/logo.png) no-repeat; }' +
      '#zoom-in { background: url(' + path + 'img/zoom-in.png) no-repeat; }' +
      '#zoom-out { background: url(' + path + 'img/zoom-out.png) no-repeat; }' +
      '#reset-zoom { background: url(' + path + 'img/reset-zoom.png) no-repeat; }' +
      '#rotate-ccw { background: url(' + path + 'img/rotate-ccw.png) no-repeat; }' +
      '#rotate-cw { background: url(' + path + 'img/rotate-cw.png) no-repeat; }' +
      '#reset-img { background: url(' + path + 'img/reset.png) no-repeat; }' +
      '#lights { background: url(' + path + 'img/light-bulb.png) no-repeat; }' +
      '#nav-up { background: url(' + path + 'img/navigation-up.png) no-repeat; }' +
      '#nav-right { background: url(' + path + 'img/navigation-right.png) no-repeat; }' +
      '#nav-down { background: url(' + path + 'img/navigation-down.png) no-repeat; }' +
      '#nav-left { background: url(' + path + 'img/navigation-left.png) no-repeat; }' +
      '#nav-reset { background: url(' + path + 'img/compass.png) no-repeat; }' +
      '</style>').appendTo('head');
});
