var EP = {};
EP.active_toggle = function() {
    $('.active_toggler').click(function(e) {
        e.preventDefault();
        var $this = $(this);
        var data = $this.data();
        var $targets = $(data.selector);
        var $mates = $('.active_toggler').filter(function() {
            if ($(this).data().selector == data.selector) return this;
        });
        $mates.toggleClass(data.toggleClass);
        $targets.toggleClass('active');
        if ($this.attr('href') != '' && $this.attr('href') != '#' && !!data.value) $($this.attr('href')).val(data.value);
    });
};

EP.insert_and_play_video = function(e) {
    e.preventDefault();
    var video_id = $(e.currentTarget).data().videoId;
    /*	TODO: should we show modal in mobile or just open the link?
     *	to disable ytv-modal in mobiles and show regular link uncomment next if statement
     *
     *	if (window.matchMedia('(max-width: 767px)').matches) {
     *		window.location.href = 'https://www.youtube.com/watch?v='+video_id;
     *		return false;
     *	}
     */
    var selector = $(e.currentTarget).data().selector || 'body';
    var on_ready = function(event) { event.target.playVideo(); }
    var on_state_change = function(event) { if (event.data === 0) { $('#youtube_video').remove(); $('.modal.in').modal('hide'); } }
    $('<div>', { class: 'youtube-video', id: 'youtube_video' }).appendTo(selector);
    EP.createPlayerElement(video_id, on_ready, on_state_change);
};

EP.callYouTubeApi = function(callback) {
    //GLOBAL FUNCTION FOR YOUTUBE
    onYouTubeIframeAPIReady = function() {
        $(document).trigger('youTubeReady');
    };
    //GLOBAL FUNCTION FOR YOUTUBE END
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    $(document).on('youTubeReady', callback);
};

EP.createPlayerElement = function(video_id, onReady, onStateChange) {
    EP.player = new YT.Player('youtube_video', {
        height: '315',
        width: '560',
        videoId: video_id,
        playerVars: {
            autoplay: 1,
            theme: 'light',
            showinfo: 0,
            origin: 'http://localhost'
        },
        events: {
            'onReady': onReady,
            'onStateChange': onStateChange
        }
    });
};

EP.validate = function() {
    $.fn.validate = function(onSuccess) {
        var obj = typeof onSuccess == 'object' ? onSuccess : {};
        onSuccess = typeof onSuccess == 'function' ? onSuccess : (function() {
            if ((typeof onSuccess == 'object') && (onSuccess.onSuccess)) {
                return onSuccess.onSuccess;
            } else {
                return function(){};
            }
        }());
        this.each(function() {
            var $form = $(this);
            var init = function() {
                $form[0].reset();
                $form.on('keyup change keydown', 'input,textarea,select', function(e) {
                    var $this = $(this);
                    var $group = $this.parent('.form-group');
                    if (validate($this)) {
                        $group.removeClass('has-error');
                        $group.addClass('has-success');
                    }
                    else {
                        $group.addClass('has-error');
                        $group.removeClass('has-success');
                    }
                });
                var tpShown = function(e) {
                    var $this = $(this);
                    $this.off('shown.bs.tooltip');
                    setTimeout(function() {
                        $this.tooltip('hide');
                        $this.on('shown.bs.tooltip', tpShown);
                    },4000);
                };
                $form.find('input,textarea,select').each(function(i) {
                    var $this = $(this);
                    var data = $this.data();
                    data.maxLength = typeof $this.attr('maxlength') != 'undefined' ? $this.attr('maxlength') : false;
                    $this.tooltip({
                        title: $this.data().invalid,
                        placement: 'top',
                        trigger: 'manual',
                    });
                    $this.on('shown.bs.tooltip', tpShown);
                });
                $form.submit(function(e) {
                    if (validated()) {
                        onSuccess(e);
                    }
                    else {
                        e.preventDefault();
                    }
                });
            };
            var validate = function($this) {
                var type = typeof $this.attr('type') == 'undefined' ? $this[0].tagName.toLowerCase() : $this.attr('type');
                var val = $this.val();
                if ((!$this.prop('required')) && ($this.val() == '')) return true;
                switch (type) {
                    case 'email':
                        var noEmail = val.replace(/[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4}/,'');
                        if ((noEmail) || (!$this.val())) {
                            return false;
                        };
                        break;
                    case 'select':
                        if (!val) return false;
                        break;
                    case 'number': case 'tel': case 'password':
                    if (type==='number' && val.search(/[^0-9]/) > -1) return false;
                    if (type==='tel' && /[^\d\-+*()]/.test(val)) return false;
                    if (type==='password') {
                        if ($this.data().confirms && $($this.data().confirms).val() != val) return false;
                        if (!/^[0-9a-zA-Z@#%&!]+$/.test(val)) return false;
                    }
                    default:
                        var data = $this.data();
                        var maxLength = data.maxLength ? Number(data.maxLength) : $this.val().length+1;
                        var minLength = data.minLength ? Number(data.minLength) : $this.val().length-1;
                        if ((!val) || (val.length > maxLength) || (val.length < minLength)) {
                            return false;
                        }
                }
                for (var key in obj) {
                    if ((key == $this.attr('id')) && (typeof obj[key] == 'function')) return obj[key]($this);
                }
                return true;
            };
            var validated = function() {
                var rtn = (function() {
                    var $elem = $form.find('input,textarea,select');
                    var $this;
                    for (var i=0; i<$elem.length; i++) {
                        $this = $($elem[i]);
                        if (!validate($this)) {
                            onFalse($this);
                            return false;
                        }
                    }
                }());
                return typeof rtn == 'undefined' ? true : false;
            };
            var onFalse = function($this) {
                $this.focus();
                $this.tooltip('show');
            };
            init();
        });
    };
};

EP.mobileBanner = function() {
    var $banner = $('#mobile_banner');
    var $close = $banner.find('.mobile-banner-close-link');
    var $container = $('.container-fluid');
    $close.click(function(e) {
        e.preventDefault();
        $container.animate({ paddingTop: 0 });
        $banner.animate({ top: -100 }, function() {
            $banner.remove();
            $container.finish().removeClass('has-banner').attr('style', '');
        });
    });
};

EP.socialAnimation = function() {
    var $social = $('.social-polygon');
    var $targets = $social.children('div');
    var $subtitles = $('.social-unified .subtitle');
    var delay = $social.data().delay;
    var ms = delay/4;
    var start = function() {
        $($targets[0]).clone().addClass('clone active').css('opacity', 0).appendTo($social);
        $($targets[0]).addClass('cloned').animate({opacity: 0}, ms);
        $social.find('.clone').animate({opacity: 1}, ms);
        var target = $($targets[0]).data().sub;
        $social.trigger('social.change', [target]);
        this.timer = setInterval(function() {
            $targets.each(function(i) {
                var $this = $(this);
                if ($this.hasClass('cloned')) {
                    $social.find('.clone').animate({opacity:0},ms, function() {
                        $(this).remove();
                        $this.removeClass('cloned');
                    });
                    $this.animate({opacity:1}, ms);
                    var $next = $this.next('div:not(.clone)').length ? $this.next('div') : $($targets[0]);
                    var $clone = $next.clone();
                    $next.addClass('cloned');
                    $clone.addClass('clone active').css('opacity', 0);
                    $clone.appendTo($social);
                    $next.animate({opacity: 0}, ms);
                    $clone.animate({opacity: 1}, ms);
                    var target = $next.data().sub;
                    $social.trigger('social.change', [target]);
                    return false;
                }
            });
        },delay);
    };
    var stop = function() {
        clearInterval(this.timer);
        $social.find('.clone').remove();
        $targets.each(function(i) {
            $(this).stop(false,true,false);
            $(this).removeClass('cloned')
            $(this).css('opacity',1);
        });
    };
    $social.mouseenter(function(e) {
        stop();
    });
    $social.mouseleave(function(e) {
        start();
    });
    $targets.mouseenter(function(e) {
        var target = $(this).data().sub;
        $social.trigger('social.change', [target]);
    });
    $targets.mouseleave(function(e) {
        $social.trigger('social.change', ['#kingSubDefault']);
    });
    $social.on('social.change', function(e, target) {
        $subtitles.removeClass('active');
        $(target).addClass('active');
    });
    EP.goBelowHeader($targets);
    start();
};
EP.checkVideoAvailable = function() {
    function supports_video() {
        return !!document.createElement('video').canPlayType;
    }
    var $videoContainer = $('.ep-video-container');
    var $topInfo = $('.top-info');
    if (!supports_video()) {
        $videoContainer.remove();
        $topInfo.addClass('bg-image');
    };
};
EP.goBelowHeader = function($elements) {
    var init = function() {
        $('.goBelowHeader').click(go);
    };
    var go = function(e) {
        e.preventDefault();
        readFromData = e.data ? e.data.readFromData : false;
        var $this = $(this);
        if (readFromData) {
            var dataHref = $this.data().href;
            var $target = $(dataHref.match(/#.+/)[0]);
        }
        else var $target = $($this.attr('href').match(/#.+/)[0]);
        EP.scrollTo($target);
    };
    switch (typeof $elements) {
        case 'undefined': init(); break;
        default: $elements.click({readFromData: true}, go);
    }
};
EP.scrollTo = function($target, callback) {
    callback = typeof callback == 'function' ? callback : function(){};
    var $body = $('html, body');
    var documentHeight = $(document).height();
    var headerHeight = Number($('header').css('height').replace('px',''));
    var offset = $target.offset().top;
    var sNew = offset-headerHeight;
    var sActual = $body.first().scrollTop() ? $body.first().scrollTop() : $body.last().scrollTop();
    var pixelsToScroll = Math.abs(sNew - sActual);
    var speed = pixelsToScroll * 1000 / documentHeight;
    $body.stop(true, true);
    $body.animate({scrollTop: [offset-headerHeight, 'easeOutQuint']}, speed, callback);
};
EP.menu = function() {
    var ms = 200;
    var $menu = $('.header-menu');
    var $openButton = $('.open-menu');
    var $buttonImg = $openButton.find('img');
    var last_part_url = $buttonImg.attr('src').split('/').pop();
    var asset_path = $buttonImg.attr('src').replace(last_part_url, '');
    var imgSrc = {
        open: asset_path+'icon-menu.png',
        close: asset_path+'icon-close.png',
    };
    var opening = false;
    var toggle = function(e) {
        e.stopPropagation();
        if ($menu.hasClass('hidden')) {
            $menu.css('opacity', 0);
            $menu.removeClass('hidden');
            $menu.animate({opacity: 1}, ms);
            $buttonImg.attr('src', imgSrc.close);
        }
        else {
            close(e);
        };
    };
    var close = function(e) {
        var $this = $(e.target);
        if (!$menu.hasClass('hidden')) {
            $menu.stop(true, true);
            $menu.animate({opacity: 0}, ms, function() {
                $menu.addClass('hidden');
            });
            $buttonImg.attr('src', imgSrc.open);
        }
    };
    $openButton.click(toggle);
    $('body').click(close);
    $('.header-menu, .header-menu ul, .header-menu li').click(function(e) {
        if (e.target.tagName != 'A') e.stopPropagation();
    });
};
EP.languageSelector = function() {
    $('.language-selector').find('a').click(function(e) {
        e.preventDefault();
        var $this = $(this);
        var lang = $this.data().lang;
        $.cookie('lang', lang, {expires: 365});
        location.reload();
    });
};
EP.gotoHash = function() {
    var hash = window.location.hash;
    if (hash) {
        EP.scrollTo($(hash));
    };
};
EP.goTop = function() {
    $('header .header-center a').click(function(e) {
        e.preventDefault();
        EP.scrollTo($('section.social-unified'));
    });
};
EP.highlightMachine = function() {
    $.fn.highlightMachine = function(options) {
        this.each(function() {
            options = typeof options == 'object' ? options : false;
            var $this = $(this);
            var data = !options ? $this.data() : (function() {
                var rtn = $this.data();
                for (var prop in options) {
                    rtn[prop] = options[prop];
                };
                return rtn;
            }());
            if (!data.selector) throw 'Highlight Machine Error: Selector not defined!';
            var selector = data.selector;
            var letterTime = data.letterTime ? data.letterTime : 100;
            var textTime = data.textTime ? data.textTime : 1500;
            var highlighTime = data.highlighTime ? data.highlighTime : 25;
            var beforeHighlight = data.beforeHighlight ? data.beforeHighlight : 700;
            var $elements = $this.find(selector);
            $elements.each(function() {
                $(this).data().originalText = $(this).html();
            });
            var startHighlight = function($element, callback) {
                var html = $element.data().originalText;
                var words = html.split(' ');
                var lastWord = words[words.length-1];
                var lastWordLenght = lastWord.length;
                var $span = $('<span>', { class: 'highlight' });
                $element.timer = setInterval(function() {
                    var length = $span.html().length;
                    var i = length+1;
                    if (i <= lastWordLenght) {
                        $element.html(html.substr(0, html.length-i));
                        $span.html(lastWord.substr(lastWord.length-i));
                        $span.appendTo($element);
                    } else {
                        clearInterval($element.timer);
                        callback();
                    }
                }, highlighTime);
            };
            var startAnimation = function() {
                var $element = $this.$nextElement ? $this.$nextElement : $elements.first();
                var html = $element.data().originalText;
                $elements.removeClass('active');
                $element.html('').addClass('active');
                $element.timer = setInterval(function() {
                    var length = $element.html().length;
                    var newHtml = '';
                    for (var i in html) {
                        if (i <= length) newHtml+= html[i];
                    };
                    $element.html(newHtml);
                    if (newHtml.length == html.length) {
                        clearInterval($element.timer);
                        setTimeout(function() {
                            startHighlight($element, function() {
                                $this.$nextElement = $element.is($elements.last()) ? $elements.first() : $element.next(selector);
                                setTimeout(startAnimation, textTime);
                            });
                        }, beforeHighlight);
                    };
                }, letterTime);
            };
            startAnimation();
        });
    };
    $('.highlight-machine').highlightMachine();
};
EP.swipePricing = function() {
    var listen_swipe = new Boolean;
    var windowWidth = new Number;
    var swipeDistance = new Number;
    var $window = $(window);
    var $pricingItem = $('.pricing-item-container');
    var $scrollDiv = $('div.pricing-horizontal-scroll');
    var padding = Number($pricingItem.css('padding-right').replace('px', ''));

    $window.on('resize', function(e) {
        windowWidth = $window.width();
        swipeDistance = windowWidth - padding;
        if (windowWidth < 440) {
            $pricingItem.css('width', windowWidth);
            var leftToMultiply = windowWidth - padding;
            $pricingItem.each(function(i) {
                $(this).css('left', i*leftToMultiply);
            });
            $scrollDiv.css('overflow', 'hidden');
            $scrollDiv.scrollLeft(0);
            listen_swipe = true;
        }
        else {
            $pricingItem.attr('style', '');
            $scrollDiv.attr('style', '');
            listen_swipe = false;
        }
    });

    $scrollDiv.on('swipeleft', function(e) {
        if (listen_swipe) {
            var scroll = $scrollDiv.scrollLeft();
            var newScroll = scroll + swipeDistance;
            $scrollDiv.stop(true, true);
            $scrollDiv.animate({scrollLeft: [newScroll, 'easeOutQuint']}, 600);
            return false;
        };
    });
    $scrollDiv.on('swiperight', function(e) {
        if (listen_swipe) {
            var scroll = $scrollDiv.scrollLeft();
            var newScroll = scroll - swipeDistance;
            $scrollDiv.stop(true, true);
            $scrollDiv.animate({scrollLeft: [newScroll, 'easeOutQuint']}, 600);
            return false;
        };
    });

    $window.trigger('resize');
};
EP.classSwitcher = function() {
    $('.switch .switch-option').click(function(e) {
        e.preventDefault();
        var $this = $(this);
        var $container = $this.parents('.switch').first();
        var $targets = $($container.data('targets'));
        var index = $this.data('index');
        if (!$targets.length || typeof index === 'undefined') return;
        $targets.removeClass('active');
        $targets.parent().each(function() {
            $(this).children().eq(index).addClass('active');
        });
        $this.siblings('.switch-option').removeClass('selected');
        $this.addClass('selected');
    });
};


EP.postMessages = function() {
    var onSuccess = function(data, $form) {
        $form.parents('.post-messages').first().removeClass('failure').addClass('success');
    };
    var onFailure = function(data, $form) {
        $form.parents('.post-messages').first().removeClass('success').addClass('failure');
    };
    var postMessageReset = function($el) {
        if ($el.length) {
            $el.removeClass('success').removeClass('failure');
            $el.find('form').get(0).reset();
        };
    };
    $('.post-messages-reset').click(function(e) {
        e.preventDefault();
        postMessageReset($(this).parents('.post-messages').first());
    });
    $('.modal').on('hidden.bs.modal', function(e) {
        postMessageReset($(this).find('.post-messages'));
    });
    EP.formMailTo({ onSuccess: onSuccess, onFailure: onFailure });
};

EP.formMailTo = function(options) {
    $().validate || EP.validate();
    var onSuccess = options.onSuccess || function(data) { console.log(data); };
    var onFailure = options.onFailure || function(data) { console.log(data); };
    var $elements = $('form.form-mailto');
    $elements.validate(function(e) {
        e.preventDefault();
        var $form = $(e.target);
        $.post($form.attr('action'), $form.serialize(), function(success) {
            if(success) onSuccess(success, $form);
            else onFailure(success, $form);
        }, 'json');
    });
}

EP.log = function() {
    var log = {};
    $('script.application_log').each(function() {
        var $this = $(this);
        var name = $this.data().name;
        log[name] = $.parseJSON($this.html());
    });
    console.log(log);
};