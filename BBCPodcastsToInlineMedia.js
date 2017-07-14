// ==UserScript==
// @name         BBCPodcasts->InlineMedia
// @namespace    http://thebop.biz
// @version      0.1
// @description  Changes BBC downloads into inline media in the page (thus no need to permanently dl).
// @author       Bop
// @match        http://www.bbc.co.uk/programmes/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var pod2InlineFn = function() {
        var pods = document.querySelectorAll(
            '#download-popup-holder a, '+
            '.buttons__download a, '+
            '[href^="http://open.live.bbc.co.uk/mediaselector/5/redir/version/2.0/mediaset/audio-nondrm-download/proto/http/vpid/"]'
        );
        var wrapper = document.getElementsByClassName('grid-wrapper');
        if( wrapper.length && pods.length ){
            wrapper = wrapper[0];
            wrapper.insertAdjacentHTML(
                'afterbegin',
                '<div class="grid bpw2-two-thirds bpe-two-thirds bop-bbc-list">'+
                '<div class="grid__inner">'+
                '<div class="br-box-page prog-box">'+
                '<div class="component component--box component--box-flushbody component--box--primary">'+
                '<div class="component__header br-box-page">'+
                '<h2>Programmes <div class="show-hide" style="display:inline-block;">+</div></h2>'+
                '</div>'+ //component__header
                '<div class="component__body br-box-page">'+
                '<ul class="list-unstyled" style="display:none;">'+
                '</ul>'+
                '</div>'+ //component__body
                '</div>'+ //component
                '</div>'+ //prog-box
                '</div>'+ //grid-inner
                '</div>' //bop-bbc-list
            );
            var ul = wrapper.querySelector('.bop-bbc-list ul');
            for( var i = 0; i < pods.length; i++ ){
                ul.insertAdjacentHTML(
                    'beforeend',
                    '<li>'+
                    '<div class="programme programme--radio programme--episode block-link highlight-box--list br-keyline br-blocklink-page br-page-linkhover-onbg015--hover">'+
                    '<h3>'+
                    pods[i].download+' - '+pods[i].innerHTML+
                    '</h3>'+
                    '<video src="'+
                    pods[i].href+
                    '" preload="metadata" controls style="height:20px; width:100%;" title="'+
                    document.createTextNode(pods[i].download).wholeText+' - '+
                    document.createTextNode(pods[i].innerHTML).wholeText+
                    '">'+
                    '</video>'+
                    '</div>'+ //programme
                    '</li>'
                );
            }

            var showHide = wrapper.querySelector('.bop-bbc-list .show-hide');
            showHide.addEventListener('click', function(){
                var isShowing = ul.style.getPropertyValue('display') !== 'none';
                showHide.innerHTML = isShowing ? '+' : '-';
                ul.style.setProperty('display', (isShowing ? 'none' : 'block'));
            });
        }
    };
    if(document.readyState === 'complete' || document.readyState === "interactive"){
        pod2InlineFn();
    }else{
        document.addEventListener("DOMContentLoaded", pod2InlineFn);
    }
})();
