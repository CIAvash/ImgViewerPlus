if($('head link').attr('href') === 'resource://gre/res/TopLevelImageDocument.css' && $('body').children().length === 1 && $('body').children()[0].tagName.toLowerCase() === 'img') {
    
    self.port.emit('send prefs_obj');
    
    // Getting preferences
    let prefs;
    self.port.on('prefs', function(prefs_obj) {
        prefs = prefs_obj;
        // If color preferences are not hex color codes, use the default values
        color_pattern = /^#(?:[0-9a-f]{3}){1,2}$/i;
        if(!color_pattern.test(prefs['bg_color'])) prefs['bg_color'] = '#222';
        if(!color_pattern.test(prefs['light_color'])) prefs['light_color'] = '#f1f1f1';
        // Setting the preferred background color
        $('body').css('background-color', prefs['bg_color']);

	if(!prefs['disable_toolbar']) {
	    // Adding necessary elements
	    $('body').prepend('<div id="ivp-toolbar" class="pictxt panel">' +
			      ' <div id="minimize" class="button">Minimize</div>' +
			      ' <div id="zoom-in" class="button">Zoom In</div>' +
			      ' <div id="zoom-out" class="button">Zoom out</div>' +
			      ' <div id="reset-zoom" class="button">Reset Zoom</div>' +
			      ' <div id="rotate-ccw" class="button">Rotate Counterclockwise</div>' +
			      ' <div id="rotate-cw" class="button">Rotate Clockwise</div>' +
			      ' <div id="reset-img" class="button">Reset Image</div>' +
			      ' <div id="lights" class="button">Turn on/off the lights</div>' +
			      '</div>'
			     );
	    $('#ivp-toolbar').after('<div id="navigation-container" class="pictxt">' +
				    '<div id="navigation" class="panel">' +
				    '  <div id="nav-up" class="button">Up</div>' +
				    '  <div id="nav-right" class="button">Right</div>' +
				    '  <div id="nav-down" class="button">Down</div>' +
				    '  <div id="nav-left" class="button">Left</div>' +
				    '  <div id="nav-reset" class="button">Reset Position</div>' +
				    '</div>' +
				    '</div>'
				   );

	    $('.panel').hover(
		function() {
		    $(this).stop(true, true).fadeTo("fast", 1);
		},
		function() {
		    $(this).stop(true, true).fadeTo("fast", 0.5);
		}
	    );

	    $('#minimize').click(function() { minimize(); });
	    
	    $('#zoom-in').click(function() { zoom('in'); });
	    $('#zoom-out').click(function() { zoom('out'); });
	    $('#reset-zoom').click(function() { reset_img('scale'); });

	    $('#rotate-ccw').click(function() { rotate('ccw'); });
	    $('#rotate-cw').click(function() { rotate('cw'); });
	    $('#reset-img').click(function() { reset_img(''); });

	    $('#lights').click(function() { light_switch(); });

	    $('#nav-up').click(function() { translate('down'); });
	    $('#nav-right').click(function() { translate('left'); });
	    $('#nav-down').click(function() { translate('up'); });
	    $('#nav-left').click(function() { translate('right'); });
	    $('#nav-reset').click(function() { reset_img('translate'); });
	}
    });
    
    // Using setTimeout to prevent transition on page load
    setTimeout(function(){ $('body').css({'-moz-transition': 'background-color 1s', 'transition': 'background-color 1s'}) }, 100);

    // Scale initialization
    let scale_num = 1;
    let scale_range = 0.2;

    // Rotate initialization
    let rotation_degree = 0;

    // Light initialization
    let lights = 'off';

    // Translate initialization
    let translate_x = 0;
    let translate_y = 0;
    let translate_range = 50;

    $('body').addClass('ImgViewerPlusBody');

    let img = $('img');

    // Clicking the image resets transform's scale and translate functions
    img.click(function() { reset_img('scale'); reset_img('translate'); });

    // Resizing the window resets all transform functions
    $(window).resize(function() { reset_img(''); });

    // Mouse wheel event bindings
    $('html').bind('DOMMouseScroll', function(event) {
        if(!event.altKey && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
            let evt = event.originalEvent;
            evt.detail > 0 ? zoom('out') : zoom('in');
            evt.preventDefault();
        }
    }).bind('mousedown', function(event) {
        if(event.which === 2 && !event.altKey && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
            reset_img('scale');
            event.preventDefault();
        }
    });

    // Declaring keys object and array
    let keys = {length: 0};
    let shortcut_keys = [87, 83, 65, 68, 88, 76, 77, 40, 38, 39, 37];
    let arrow_keys = [40, 38, 39, 37];

    // Capturing keys, using "keys" object to capture multiple keys
    $(document).keydown(function(event) {
        if(!event.altKey && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
            if(!keys[event.which]) {
                keys[event.which] = true;
                keys.length++;
                if(arrow_keys.indexOf(event.which) > -1) event.preventDefault();
            }
            if(shortcut_keys.indexOf(event.which) > -1) process_keys(keys);
        }
    }).keyup(function(event) {
        if(!event.altKey && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
            if(keys[event.which]) {
                keys.length--;
                delete keys[event.which];
            }
        }
    });

    /* Functions */
    
    function process_keys(keys) {
        if(keys.length === 1) {
            if(keys[87]) zoom('in');    // W
            else if(keys[83]) zoom('out');  // S
            else if(keys[65]) rotate('ccw');    // A
            else if(keys[68]) rotate('cw'); // D
            else if(keys[88]) reset_img(''); // X
            else if(keys[76]) light_switch();   // L
            else if(keys[77] && !prefs['disable_toolbar']) minimize();   // M
            else if(keys[40]) translate('up'); // Down
            else if(keys[38]) translate('down');   // Up
            else if(keys[39]) translate('left');   // Right
            else if(keys[37]) translate('right');   // Left
        } else if(keys.length === 2) {
            if(keys[40] && keys[37]) translate('up right');  // Down & Left
            else if(keys[40] && keys[39]) translate('up left');   // Down & Right
            else if(keys[38] && keys[37]) translate('down right');   // Up & Left
            else if(keys[38] && keys[39]) translate('down left');   // Up & Right
       }
    }
    
    function minimize() {
	if(!prefs['disable_toolbar']) {
            $('#navigation').stop(true, true).fadeToggle(0);
            $('#ivp-toolbar').stop(true, true).animate({ height: $('#ivp-toolbar').css("height") === "38px" ? "310px" : "38px" }, "fast");
	}
    }
    
    function light_switch() {
        if(lights === 'off') {
            $('body').css('background-color', prefs['light_color']);
            lights = 'on';
        } else if(lights === 'on') {
            $('body').css('background-color', prefs['bg_color']);
            lights = 'off';
        }
    }

    function reset_img(transform_func) {
        switch(transform_func) {
            case 'scale':
                scale_num = 1;
                break;
            case 'rotate':
                reset_rotate();
                break;
            case 'translate':
                translate_x = 0;
                translate_y = 0;
                break;
            default:
                scale_num = 1;
                reset_rotate();
                translate_x = 0;
                translate_y = 0;
        }
        transform('');
    }

    // "reset_rotate" function does some calculations to determine which way to rotate
    function reset_rotate() {
        let remained_deg = Math.abs(rotation_degree)%360;
        switch(remained_deg) {
            case 0:
                break;
            case 90:
            case 180:
                if(rotation_degree > 0) {
                    rotation_degree -= remained_deg;
                } else if(rotation_degree < 0) {
                    rotation_degree += remained_deg;
                }
                break;
            case 270:
                if(rotation_degree > 0) {
                    rotation_degree += 90;
                } else if(rotation_degree < 0) {
                    rotation_degree -= 90;
                }
                break;
        }
    }

    function zoom(dir) {
        if(dir === 'in') scale_num += scale_range;
        else if(dir === 'out') scale_num -= scale_range;
        transform('scale');
    }

    function rotate(dir) {
        if(dir === 'cw') rotation_degree += 90;
        else if(dir === 'ccw') rotation_degree -= 90;
        transform('rotate');
    }

    // "translate" function determines that in current rotation degree, which direction it should translate
    function translate(dir) {
        let remained_deg = Math.abs(rotation_degree)%360;
        switch(dir) {
            case 'up':
                switch(remained_deg) {
                    case 0:
                        translate_y -= translate_range;
                        break;
                    case 90:
                        rotation_degree > 0 ? translate_x -= translate_range : translate_x += translate_range;
                        break;
                    case 180:
                        translate_y += translate_range;
                        break;
                    case 270:
                        rotation_degree > 0 ? translate_x += translate_range : translate_x -= translate_range;
                        break;
                }
                break;
            case 'down':
                switch(remained_deg) {
                    case 0:
                        translate_y += translate_range;
                        break;
                    case 90:
                        rotation_degree > 0 ? translate_x += translate_range : translate_x -= translate_range;
                        break;
                    case 180:
                        translate_y -= translate_range;
                        break;
                    case 270:
                        rotation_degree > 0 ? translate_x -= translate_range : translate_x += translate_range;
                        break;
                }
                break;
            case 'left':
                switch(remained_deg) {
                    case 0:
                        translate_x -= translate_range;
                        break;
                    case 90:
                        rotation_degree > 0 ? translate_y += translate_range : translate_y -= translate_range;
                        break;
                    case 180:
                        translate_x += translate_range;
                        break;
                    case 270:
                        rotation_degree > 0 ? translate_y -= translate_range : translate_y += translate_range;
                        break;
                }
                break;
            case 'right':
                switch(remained_deg) {
                    case 0:
                        translate_x += translate_range;
                        break;
                    case 90:
                        rotation_degree > 0 ? translate_y -= translate_range : translate_y += translate_range;
                        break;
                    case 180:
                        translate_x -= translate_range;
                        break;
                    case 270:
                        rotation_degree > 0 ? translate_y += translate_range : translate_y -= translate_range;
                        break;
                }
                break;
            case 'up left':
                switch(remained_deg) {
                    case 0:
                        translate_y -= translate_range;
                        translate_x -= translate_range;
                        break;
                    case 90:
                        rotation_degree > 0 ? translate_y += translate_range : translate_y -= translate_range;
                        rotation_degree > 0 ? translate_x -= translate_range : translate_x += translate_range;
                        break;
                    case 180:
                        translate_y += translate_range;
                        translate_x += translate_range;
                        break;
                    case 270:
                        rotation_degree > 0 ? translate_y -= translate_range : translate_y += translate_range;
                        rotation_degree > 0 ? translate_x += translate_range : translate_x -= translate_range;
                        break;
                }
                break;
            case 'up right':
                switch(remained_deg) {
                    case 0:
                        translate_y -= translate_range;
                        translate_x += translate_range;
                        break;
                    case 90:
                        rotation_degree > 0 ? translate_y -= translate_range : translate_y += translate_range;
                        rotation_degree > 0 ? translate_x -= translate_range : translate_x += translate_range;
                        break;
                    case 180:
                        translate_y += translate_range;
                        translate_x -= translate_range;
                        break;
                    case 270:
                        rotation_degree > 0 ? translate_y += translate_range : translate_y -= translate_range;
                        rotation_degree > 0 ? translate_x += translate_range : translate_x -= translate_range;
                        break;
                }
                break;
            case 'down left':
                switch(remained_deg) {
                    case 0:
                        translate_y += translate_range;
                        translate_x -= translate_range;
                        break;
                    case 90:
                        rotation_degree > 0 ? translate_y += translate_range : translate_y -= translate_range;
                        rotation_degree > 0 ? translate_x += translate_range : translate_x -= translate_range;
                        break;
                    case 180:
                        translate_y -= translate_range;
                        translate_x += translate_range;
                        break;
                    case 270:
                        rotation_degree > 0 ? translate_y -= translate_range : translate_y += translate_range;
                        rotation_degree > 0 ? translate_x -= translate_range : translate_x += translate_range;
                        break;
                }
                break;
            case 'down right':
                switch(remained_deg) {
                    case 0:
                        translate_y += translate_range;
                        translate_x += translate_range;
                        break;
                    case 90:
                        rotation_degree > 0 ? translate_y -= translate_range : translate_y += translate_range;
                        rotation_degree > 0 ? translate_x += translate_range : translate_x -= translate_range;
                        break;
                    case 180:
                        translate_y -= translate_range;
                        translate_x -= translate_range;
                        break;
                    case 270:
                        rotation_degree > 0 ? translate_y += translate_range : translate_y -= translate_range;
                        rotation_degree > 0 ? translate_x -= translate_range : translate_x += translate_range;
                        break;
                }
                break;
        }
        transform('translate');
    }

    function transform(transform_func) {
        if(transform_func === 'scale') {
            if(scale_num <= 0) scale_num = scale_range;
        }    
        img.css('-moz-transform', 'scale(' + scale_num + ') rotate(' + rotation_degree + 'deg) translate(' + translate_x + 'px,' + translate_y + 'px)');
        img.css('transform', 'scale(' + scale_num + ') rotate(' + rotation_degree + 'deg) translate(' + translate_x + 'px,' + translate_y + 'px)');
    }
}
