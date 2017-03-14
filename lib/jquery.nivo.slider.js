/*
 * jQuery Slice Slider
 * http://chanshiyu.com
 * Copyright 2017, Chanshiyu
 */

(function($) {
  var NivoSlider = function(element, options){
    // 设置参数，默认参数在底部
    var settings = $.extend({}, $.fn.nivoSlider.defaults, options);
    // 定义变量保存当前轮播参数
    var vars = {
        currentSlide: 0,
        currentImage: '',
        totalSlides: 0,
        running: false,
        paused: false,
        stop: false,
        controlNavEl: false
    };
    // 给轮播组件附加数据
    var slider = $(element);
    var widthzdy , widthzdy2;
    slider.data('nivo:vars', vars).addClass('nivoSlider');
      // 获取轮播组件子元素图片
      var kids = slider.children();
      kids.each(function() {
        var child = $(this);
        var link = '';
        if(!child.is('img')){
          if(child.is('a')){
            child.addClass('nivo-imageLink');
            link = child;
          }
          child = child.find('img:first');
        }
        // 获取图片宽高
        var childWidth = (childWidth === 0) ? child.attr('width') : child.width(),
            childHeight = (childHeight === 0) ? child.attr('height') : child.height();
            if(link !== ''){
                link.css('display','none');
            }
            child.css('display','none');
            vars.totalSlides++;
        });
        // 随机开始一张图片
        if(settings.randomStart){
            settings.startSlide = Math.floor(Math.random() * vars.totalSlides);
        }
        // 设置开始图片
        if(settings.startSlide > 0){
            if(settings.startSlide >= vars.totalSlides) { settings.startSlide = vars.totalSlides - 1; }
            vars.currentSlide = settings.startSlide;
        }
        // 获取开始图片
        if($(kids[vars.currentSlide]).is('img')){
            vars.currentImage = $(kids[vars.currentSlide]);
        } else {
            vars.currentImage = $(kids[vars.currentSlide]).find('img:first');
        }
        // 显示开始链接
        if($(kids[vars.currentSlide]).is('a')){
            $(kids[vars.currentSlide]).css('display','block');
        }
        // 给第一张图设置背景颜色
        var sliderImg = $('<img/>').addClass('nivo-main-image');
        sliderImg.attr('src', vars.currentImage.attr('src')).show();
        slider.append(sliderImg);
        // 窗口改变尺寸时重设组件宽高
        $(window).resize(function() {
            slider.children('img').width(slider.width());
            sliderImg.attr('src', vars.currentImage.attr('src'));
            sliderImg.stop().height('auto');
            $('.nivo-slice').remove();
            $('.nivo-box').remove();
        });
        //创建导航
        slider.append($('<div class="nivo-caption"></div>'));
        // 图片标题
        var processCaption = function(settings){
            var nivoCaption = $('.nivo-caption', slider);
            if(vars.currentImage.attr('title') != '' && vars.currentImage.attr('title') != undefined){
                var title = vars.currentImage.attr('title');
                if(title.substr(0,1) == '#') title = $(title).html();
                if(nivoCaption.css('display') == 'block'){
                    setTimeout(function(){
                        nivoCaption.html(title);
                    }, settings.animSpeed);
                } else {
                    nivoCaption.html(title);
                    nivoCaption.stop().fadeIn(settings.animSpeed);
                }
            } else {
                nivoCaption.stop().fadeOut(settings.animSpeed);
            }
        }
        //初始化参数
        processCaption(settings);
        // 开始设置动画
        var timer = 0;
        if(!settings.manualAdvance && kids.length > 1){
            timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
        }
        // 添加方向按钮
        if(settings.directionNav){
            slider.append('<div class="nivo-directionNav"><a class="nivo-prevNav">'+ settings.prevText +'</a><a class="nivo-nextNav">'+ settings.nextText +'</a></div>');
            $(slider).on('click', 'a.nivo-prevNav', function(){
                if(vars.running) { return false; }
                clearInterval(timer);
                timer = '';
                vars.currentSlide -= 2;
                nivoRun(slider, kids, settings, 'prev');
            });
            $(slider).on('click', 'a.nivo-nextNav', function(){
                if(vars.running) { return false; }
                clearInterval(timer);
                timer = '';
                nivoRun(slider, kids, settings, 'next');
            });
        }
        // 添加控制按钮
        if(settings.controlNav){
            vars.controlNavEl = $('<div class="nivo-controlNav"></div>');
            slider.after(vars.controlNavEl);
            for(var i = 0; i < kids.length; i++){
                if(settings.controlNavThumbs){
                    vars.controlNavEl.addClass('nivo-thumbs-enabled');
                    var child = kids.eq(i);
                    if(!child.is('img')){
                        child = child.find('img:first');
                    }
                    if(child.attr('data-thumb')) vars.controlNavEl.append('<a class="nivo-control" rel="'+ i +'"><img src="'+ child.attr('data-thumb') +'" alt="" /></a>');
                } else {
                    vars.controlNavEl.append('<a class="nivo-control" rel="'+ i +'">'+ (i + 1) +'</a>');
                }
            }
            //设置初始激活链接
            $('a:eq('+ vars.currentSlide +')', vars.controlNavEl).addClass('active');
            $('a', vars.controlNavEl).bind('click', function(){
                if(vars.running) return false;
                if($(this).hasClass('active')) return false;
                clearInterval(timer);
                timer = '';
                sliderImg.attr('src', vars.currentImage.attr('src'));
                vars.currentSlide = $(this).attr('rel') - 1;
                nivoRun(slider, kids, settings, 'control');
            });
        }
        //鼠标覆盖暂停轮播
        if(settings.pauseOnHover){
            slider.hover(function(){
                vars.paused = true;
                clearInterval(timer);
                timer = '';
            }, function(){
                vars.paused = false;
                // 鼠标移开重新开始
                if(timer === '' && !settings.manualAdvance){
                    timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
                }
            });
        }
        // 动画结束时动画
        slider.bind('nivo:animFinished', function(){
            sliderImg.attr('src', vars.currentImage.attr('src'));
            vars.running = false;
            // 隐藏子链接
            $(kids).each(function(){
                if($(this).is('a')){
                   $(this).css('display','none');
                }
            });
            // 显示当前链接
            if($(kids[vars.currentSlide]).is('a')){
                $(kids[vars.currentSlide]).css('display','block');
            }
            // 重新开始
            if(timer === '' && !vars.paused && !settings.manualAdvance){
                timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
            }
            // 设置动画后的回调函数u
            settings.afterChange.call(this);
        });
        // 为切片动画添加切片层
        var createSlices = function(slider, settings, vars) {
        	if($(vars.currentImage).parent().is('a')) $(vars.currentImage).parent().css('display','block');
            $('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').width(slider.width()).css('visibility', 'hidden').show();
            var sliceHeight = ($('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').parent().is('a')) ? $('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').parent().height() : $('img[src="'+ vars.currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img').height();
            for(var i = 0; i < settings.slices; i++){
                var sliceWidth = Math.round(slider.width()/settings.slices);
				            widthzdy = (slider.width()-(sliceWidth*i))+'px';
				            widthzdy2 = sliceWidth+'px';
                if(i === settings.slices-1){
                    slider.append(
                        $('<div class="nivo-slice" name="'+i+'"><img src="'+ vars.currentImage.attr('src') +'" style="position:absolute; width:'+ slider.width() +'px; height:auto; display:block !important; top:0; left:-'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px;" /></div>').css({
                            left:(sliceWidth*i)+'px',
							              width: '0',
                            height:sliceHeight+'px',
                            opacity:'0',
                            overflow:'hidden'
                        })
                    );
                } else {
                    slider.append(
                        $('<div class="nivo-slice" name="'+i+'"><img src="'+ vars.currentImage.attr('src') +'" style="position:absolute; width:'+ slider.width() +'px; height:auto; display:block !important; top:0; left:-'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px;" /></div>').css({
                            left:(sliceWidth*i)+'px',
							              width: '0',
                            height:sliceHeight+'px',
                            opacity:'0',
                            overflow:'hidden'
                        })
                    );
                }
            }
            $('.nivo-slice', slider).height(sliceHeight);
            sliderImg.stop().animate({
                height: $(vars.currentImage).height()
            }, settings.animSpeed);
        };
        // Private run method
        var nivoRun = function(slider, kids, settings, nudge){
            // 获取附加的数据
            var vars = slider.data('nivo:vars');
            // 最后一张图的回调函数
            if(vars && (vars.currentSlide === vars.totalSlides - 1)){
                settings.lastSlide.call(this);
            }
            // 暂停
            if((!vars || vars.stop) && !nudge) { return false; }
            // 开始变化前的回调函数
            settings.beforeChange.call(this);
            // 变化之前设置背景颜色
            if(!nudge){
                sliderImg.attr('src', vars.currentImage.attr('src'));
            } else {
                if(nudge === 'prev'){
                    sliderImg.attr('src', vars.currentImage.attr('src'));
                }
                if(nudge === 'next'){
                    sliderImg.attr('src', vars.currentImage.attr('src'));
                }
            }
            vars.currentSlide++;
            // 轮播后的回调函数
            if(vars.currentSlide === vars.totalSlides){
                vars.currentSlide = 0;
                settings.slideshowEnd.call(this);
            }
            if(vars.currentSlide < 0) { vars.currentSlide = (vars.totalSlides - 1); }
            // 设置当前图片
            if($(kids[vars.currentSlide]).is('img')){
                vars.currentImage = $(kids[vars.currentSlide]);
            } else {
                vars.currentImage = $(kids[vars.currentSlide]).find('img:first');
            }
            // 设置激活链接
            if(settings.controlNav){
                $('a', vars.controlNavEl).removeClass('active');
                $('a:eq('+ vars.currentSlide +')', vars.controlNavEl).addClass('active');
            }
            processCaption(settings);
            // 最后一次变化后移除切片
            $('.nivo-slice', slider).remove();
            var currentEffect = settings.effect,
                anims = '';
            // 运行动画效果
            vars.running = true;
            var timeBuff = 0,
                i = 0,
                slices = '',
                firstSlice = '';
            if(currentEffect === 'sliceDown' || currentEffect === 'sliceDownRight' || currentEffect === 'sliceDownLeft'){
                createSlices(slider, settings, vars);
                timeBuff = 0;
                i = 0;
                slices = $('.nivo-slice', slider);
                if(currentEffect === 'sliceDownLeft') { slices = $('.nivo-slice', slider)._reverse(); }
                slices.each(function(){
                    var slice = $(this);
                    slice.css({ 'top': '0px' });
                    if(i === settings.slices-1){
                        setTimeout(function(){
                            slice.animate({opacity:'1.0'}, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function(){
                            slice.animate({opacity:'1.0'}, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    i++;
                });
            } else if(currentEffect === 'sliceUp' || currentEffect === 'sliceUpRight' || currentEffect === 'sliceUpLeft'){
                createSlices(slider, settings, vars);
                timeBuff = 0;
                i = 0;
                slices = $('.nivo-slice', slider);
                if(currentEffect === 'sliceUpLeft') { slices = $('.nivo-slice', slider)._reverse(); }
                slices.each(function(){
                    var slice = $(this);
                    slice.css({ 'bottom': '0px' });
                    if(i === settings.slices-1){
                        setTimeout(function(){
                            slice.animate({opacity:'1.0', width: widthzdy }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function(){
                            slice.animate({opacity:'1.0' , width: widthzdy2 }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    i++;
                });
            } else if(currentEffect === 'sliceUpDown' || currentEffect === 'sliceUpDownRight' || currentEffect === 'sliceUpDownLeft'){
                createSlices(slider, settings, vars);
                timeBuff = 0;
                i = 0;
                var v = 0;
                slices = $('.nivo-slice', slider);
                if(currentEffect === 'sliceUpDownLeft') { slices = $('.nivo-slice', slider)._reverse(); }
                slices.each(function(){
                    var slice = $(this);
                    if(i === 0){
                        slice.css('top','0px');
                        i++;
                    } else {
                        slice.css('bottom','0px');
                        i = 0;
                    }
                    if(v === settings.slices-1){
                        setTimeout(function(){
                            slice.animate({opacity:'1.0' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function(){
                            slice.animate({opacity:'1.0' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    v++;
                });
            }
        };
        var shuffle = function(arr){
            for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i, 10), x = arr[--i], arr[i] = arr[j], arr[j] = x);
            return arr;
        };
        var trace = function(msg){
            if(this.console && typeof console.log !== 'undefined') { console.log(msg); }
        };
        // 开始/暂停
        this.stop = function(){
            if(!$(element).data('nivo:vars').stop){
                $(element).data('nivo:vars').stop = true;
                trace('Stop Slider');
            }
        };
        this.start = function(){
            if($(element).data('nivo:vars').stop){
                $(element).data('nivo:vars').stop = false;
                trace('Start Slider');
            }
        };
        settings.afterLoad.call(this);
        return this;
    };
    $.fn.nivoSlider = function(options) {
        return this.each(function(key, value){
            var element = $(this);
            if (element.data('nivoslider')) { return element.data('nivoslider'); }
            var nivoslider = new NivoSlider(this, options);
            element.data('nivoslider', nivoslider);
        });
    };
    //默认设置
    $.fn.nivoSlider.defaults = {
        effect: 'sliceUpRight',      // 图片切换效果
        slices: 15,                  // 切片数量
        animSpeed: 500,              // 图片切换速度（毫秒）
        pauseTime: 3000,             // 图片停留时间（毫秒）
        startSlide: 0,               // 开始切换的位置
        directionNav: true,          // 是否使用左右按钮导航
        controlNav: true,            // 是否使用导航控制条
        controlNavThumbs: false,     // 是否使用缩略图控制导航
        pauseOnHover: true,          // 当鼠标滑向图片时，停止切换
        manualAdvance: false,        // 是否不自动切换，当为true时，需要手动切换
        prevText: 'Prev',            // 向前文字
        nextText: 'Next',            // 向后文字
        randomStart: false,          // 是否随即开始
        beforeChange: function(){},  // 当发生切换前回调函数
        afterChange: function(){},   // 当发生切换后回调函数
        slideshowEnd: function(){},  // 完成所有的切换动作后回调函数
        lastSlide: function(){},     // 切换最后一张图片时回调函数
        afterLoad: function(){}      // 当加载完成时回调函数
    };
    $.fn._reverse = [].reverse;
})(jQuery);
