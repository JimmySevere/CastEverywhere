// ==UserScript==
// @name         CastEverywhere
// @namespace    http://thebop.biz
// @version      0.1
// @description  Cast all video tag sources
// @author       Bop
// @require      https://code.jquery.com/jquery-3.1.1.min.js
// @require      https://www.gstatic.com/cv/js/sender/v1/cast_sender.js
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function($) {
  'use strict';

  //font awesome
  $("head").prepend('<link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">');

  window.__onGCastApiAvailable = function(loaded, errorInfo) {
    if (loaded) {
      bopCast.init();
    } else {
      bopCast.error(errorInfo);
    }
  };
  
  var bopCast = {
    receiverID: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
    list: {},
    _list: $(),
    controls: $(
      '<div class="bop-video-controls">'+
      '<div class="close"><i class="fa fa-times" aria-hidden="true"></i></div>'+
      '<div class="list"><select></select></div>'+
      '<div class="cast"><i class="fa fa-television" aria-hidden="true"></i><i class="fa fa-plus" aria-hidden="true"></i></div>'+
      '</div>'
    ),
    updateList: function(){
      this.list = {'Video':$('video').clone(), 'Audio':$('audio').clone()};
      this._list = $();
      
      var listHTML = $();
      $.each(this.list, function(type,$items){
        this._list.add($items);
        var og = $('<optgroup label="'+type+'"></optgroup>');
        $items.each(function(i){
          var label = this.title || this.alt || this.currentSrc || this.src;
          og.append('<option value="'+type+'.'+i+'">'+label+'</option>');
        });
        listHTML.add(og);
      });
      this.controls.find('.list select').html(listHTML);
    },
    getSelectedMedia: function(){
      var val = this.controls.find('.list select').val().split('.');
      this.selectedMediaType = val[0];
      this.selectedMedia = this.list[val[0]][val[1]];
      return this.selectedMedia;
    },
    init: function(){
      var session = cast.framework.CastContext.getInstance().getCurrentSession();
      if( session.displayName !== 'Bop CastEverywhere' ){
        var sessionRequest = new chrome.cast.SessionRequest(this.receiverID);
        var apiConfig = new chrome.cast.ApiConfig(sessionRequest, this.sessionListener, this.receiverListener);
        chrome.cast.initialize(apiConfig, function(){}, errorFn);
      }
    },
    end: function(){
      if(this.session)
        this.session.stop(errorFn, errorFn);
    },
    error: function(e){
      console.log(e);
    },
    receiverListener: function(e) {
      if( e === chrome.cast.ReceiverAvailability.AVAILABLE) {
      }
    },
    sessionListener: function(session) {
      if (session.media.length !== 0) {
        onMediaDiscovered('onRequestSessionSuccess', this.session.media[0]);
      }
      if (session.status !== chrome.cast.SessionStatus.CONNECTED) {
        console.log('SessionListener: Session disconnected');
      }
    }
  };
    
  bopCast.controls.on('click', '.cast', function(e){
    chrome.cast.requestSession(function(session){
      bopCast.session = session;
      var media = bopCast.getSelectedMedia();
      var mediaSrc = media.currentSrc || media.src;
      var mediaInfo = new chrome.cast.media.MediaInfo(mediaSrc);
      var request = new chrome.cast.media.LoadRequest(mediaInfo);
      function onMediaDiscovered(how, media) {
        bopCast.media = media;
        bopCast.video = video;
        //media.addUpdateListener(onMediaStatusUpdate);
        media.play();
      }
      session.loadMedia(request, onMediaDiscovered.bind(this, 'loadMedia'), bopCast.error);

    }, errorFn);
  })
  .css({fontFamily: 'FontAwesome', background: 'black', position: 'fixed', zIndex: '9999999', fontSize: '50px', top:'50px'})
  .find('div').css({display: 'inline-block', padding: '5px', color: 'white'});

  var iid = window.setInterval(function(){
    bopCast.updateList();
    if(bopCast._list.length){
      runCastSetup();
      window.clearInterval(iid);
    }
  }, 5000);
})(jQuery);
