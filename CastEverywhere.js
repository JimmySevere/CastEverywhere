// ==UserScript==
// @name         CastEverywhere
// @namespace    http://thebop.biz
// @version      0.1
// @description  Cast all video tag sources
// @author       Bop
// @require      https://code.jquery.com/jquery-3.1.1.min.js
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function($) {
    'use strict';

    function runCastSetup(){
        var bopCast = {};

        window.__onGCastApiAvailable = function(loaded, errorInfo) {
            if (loaded) {
                initializeCastApi();
            } else {
                console.log(errorInfo);
            }
        };

        function errorFn(e){
            console.log(e);
        }

        function receiverListener(e) {
            if( e === chrome.cast.ReceiverAvailability.AVAILABLE) {
            }
        }

        function sessionListener(session) {
            bopCast.session = session;
            if (session.media.length !== 0) {
                onMediaDiscovered('onRequestSessionSuccess', session.media[0]);
            }
            if (session.status !== chrome.cast.SessionStatus.CONNECTED) {
                console.log('SessionListener: Session disconnected');
                // Update local player to disconnected state
            }
        }

        function stopApp() {
            if(bopCast.session)
                bopCast.session.stop(errorFn, errorFn);
        }

        function initializeCastApi() {
            var sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
            var apiConfig = new chrome.cast.ApiConfig(sessionRequest,
                                                      sessionListener,
                                                      receiverListener);
            chrome.cast.initialize(apiConfig, function(){
            }, errorFn);
        }

        //font awesome
        $("head").prepend('<link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">');

        $('video, audio').each(function(){
            var video = this;
            var castControls = $(''+
                                 '<div class="bop-video-controls">'+
                                 '<div class="close"><i class="fa fa-times" aria-hidden="true"></i></div>'+
                                 '<div class="play"><i class="fa fa-play" aria-hidden="true"></i></div>'+
                                 '<div class="pause"><i class="fa fa-pause" aria-hidden="true"></i></div>'+
                                 '<div class="cast"><i class="fa fa-television" aria-hidden="true"></i></div>'+
                                 '</div>');
            castControls.css({fontFamily: 'FontAwesome', background: 'black', position: 'fixed', zIndex: '9999999', fontSize: '50px', top:'50px'})
                .insertAfter(video);

            castControls.find('div').css({display: 'inline-block', padding: '5px', color: 'white'});

            $(video).detach();

            castControls.off('click').on('click', '.close', function(){
                $(video).insertBefore(castControls);
                castControls.remove();
            }).on('click', '.cast', function(e){
                function onRequestSessionSuccess(session) {
                    bopCast.session = session;
                    var mediaInfo = new chrome.cast.media.MediaInfo(video.currentSrc);
                    var request = new chrome.cast.media.LoadRequest(mediaInfo);
                    function onMediaDiscovered(how, media) {
                        bopCast.media = media;
                        bopCast.video = video;
                        //media.addUpdateListener(onMediaStatusUpdate);
                        media.play();
                    }
                    session.loadMedia(request,
                                      onMediaDiscovered.bind(this, 'loadMedia'),
                                      errorFn);

                }

                chrome.cast.requestSession(onRequestSessionSuccess, errorFn);
            }).on('click', '.pause', function(e){
                bopCast.media.pause();
            }).on('click', '.play', function(e){
                bopCast.media.play();
            });
        });
        $.getScript('https://www.gstatic.com/cv/js/sender/v1/cast_sender.js');
    }

    var iid = window.setInterval(function(){
        if($('video').length){
            runCastSetup();
            window.clearInterval(iid);
        }
    }, 5000);
})(jQuery);
