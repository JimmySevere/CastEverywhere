// ==UserScript==
// @name         CastEverywhere Dev
// @namespace    http://thebop.biz
// @version      0.2-dev
// @description  Make all sources availabe for weightless casting
// @author       Bop
// @require      https://code.jquery.com/jquery-3.1.1.min.js
// @require      https://www.gstatic.com/cv/js/sender/v1/cast_sender.js
// @require      https://www.gstatic.com/cast/sdk/libs/sender/1.0/cast_framework.js
// @match        *://*/*
// @exclude      *://www.youtube.com/*
// @exclude      *://www.bbc.co.uk/iplayer/*
// @exclude      *://vidcast.dabble.me/*
// @grant        none
// ==/UserScript==

jQuery.noConflict();

(function($) {
    'use strict';

    //font awesome
    $("head").prepend('<link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">');

    var bopCast = {
        list: {},
        _list: $(),
        controls: $(
            '<div class="bop-video-controls">'+
            '<div class="close"><i class="fa fa-times" aria-hidden="true"></i></div>'+
            '<div class="list"><select></select></div>'+
            '<div class="refresh"><i class="fa fa-refresh" aria-hidden="true"></i></div>'+
            '<div class="cast"><i class="fa fa-television" aria-hidden="true"></i><i class="fa fa-plus" aria-hidden="true"></i></div>'+
            '</div>'
        ),
        appended: false,
        searchIntervalID: 0,
        searchInterval: 1000,
        init: function(){
            this.receiverID = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;
            var session = cast.framework.CastContext.getInstance().getCurrentSession();
            if( ! session || session.displayName !== 'Bop CastEverywhere' ){
                var sessionRequest = new chrome.cast.SessionRequest(this.receiverID);
                var apiConfig = new chrome.cast.ApiConfig(sessionRequest, this.sessionListener.bind(this), this.receiverListener.bind(this));
                chrome.cast.initialize(apiConfig, function(){}, this.error);
            }

            this.searchIntervalID = window.setInterval(this.searchIntervalFn.bind(this), this.searchInterval);
            
            this.controls
              .on('click', '.cast', this.cast.bind(this))
              .on('click', '.close', this.detachFromBody.bind(this))
              .on('click', '.refresh', this.updateList.bind(this));
        },
        updateList: function(){
            this.list = {'Video':$('video'), 'Audio':$('audio')};
            var _list = $();

            var listHTML = $();
            $.each(this.list, function(type,$items){
                _list = _list.add($items);
                var og = $('<optgroup label="'+type+'"></optgroup>');
                $items.each(function(i){
                    var label = this.title || this.alt || this.currentSrc || this.src || i+1;
                    og.append('<option value="'+type+'.'+i+'">'+label+'</option>');
                });
                listHTML = listHTML.add(og);
            });

            this._list = _list;

            this.controls.find('.list select').html(listHTML);
        },
        appendToBody: function(){
            $('body').append(this.controls);
            this.appended = true;
        },
        detachFromBody: function(){
          this.controls.detach();
          this.appended = false;
        },
        searchIntervalFn: function(){
            this.updateList();
            if(this._list.length && !this.appended){
                this.appendToBody();
                window.clearInterval(this.searchIntervalID);
                //this.searchIntervalID = window.setInterval(this.searchIntervalFn.bind(this), this.searchInterval);
            }
        },
        getSelectedMedia: function(){
            var val = this.controls.find('.list select').val().split('.');
            this.selectedMediaType = val[0];
            this.selectedMedia = this.list[val[0]][val[1]];
            return this.selectedMedia;
        },
        end: function(){
            if(this.session)
                this.session.stop(this.error, this.error);
        },
        error: function(e){
            console.log(e);
        },
        receiverListener: function(e) {
            if( e === chrome.cast.ReceiverAvailability.AVAILABLE) {
            }
        },
        sessionListener: function(session) {
            this.session = session;
            if (session.media.length !== 0) {
                this.onMediaDiscovered('onRequestSessionSuccess', session.media[0]);
            }
            if (session.status !== chrome.cast.SessionStatus.CONNECTED) {
                console.log('SessionListener: Session disconnected');
            }
        },
        addMediaToQueue: function(session){
            session.displayName = 'Bop CastEverywhere';
            this.session = session;
            var media = this.getSelectedMedia();
            var mediaSrc = media.currentSrc || media.src;
            var mediaInfo = new chrome.cast.media.MediaInfo(mediaSrc);
            //var qItem = new chrome.cast.media.QueueItem(mediaInfo);
            //var request;
            //if( !session.media.length ){
            //    request = new chrome.cast.media.QueueLoadRequest([qItem]);
            //    session.queueLoad(request, this.onMediaDiscovered.bind(chrome.cast, 'loadMedia'), this.error);
            //}else{
            //    request = new chrome.cast.media.QueueInsertItemsRequest([qItem]);
            //    session.queueLoad(request, this.onMediaDiscovered.bind(chrome.cast, 'loadMedia'), this.error);
            //}
            var request = new chrome.cast.media.LoadRequest(mediaInfo);
            session.loadMedia(request, this.onMediaDiscovered.bind(chrome.cast, 'loadMedia'), this.error);
        },
        onMediaDiscovered: function (how, media) {
            this.media = media;
            //media.addUpdateListener(onMediaStatusUpdate);
            //media.play();
        },
        cast: function(e){
            //if( this.session && this.session.displayName == 'Bop CastEverywhere' ){
            //  this.addMediaToQueue(this.session);
            //}else{
              chrome.cast.requestSession(this.addMediaToQueue.bind(this), this.error.bind(this));
            //}
        }
    };


    window.__onGCastApiAvailable = function(loaded, errorInfo) {
        if (loaded) {
            bopCast.init();
        } else {
            bopCast.error(errorInfo);
        }
    };

    bopCast.controls
        .css({fontFamily: 'FontAwesome', background: 'black', position: 'fixed', zIndex: '9999999', fontSize: '20px', top:'0', left:'0'})
        .find('div').css({display: 'inline-block', padding: '5px', color: 'white'});


})(jQuery);
