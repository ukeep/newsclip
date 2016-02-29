/**
 * Implement infinite scrolling
 * - Inspired by: http://ravikiranj.net/drupal/201106/code/javascript/how-implement-infinite-scrolling-using-native-javascript-and-yui3
 */

(function () {
    var isIE = /msie/gi.test(navigator.userAgent); // http://pipwerks.com/2011/05/18/sniffing-internet-explorer-via-javascript/

    this.infiniteScroll = function (options) {
        var defaults = {
                callback: function () {},
                distance: 50
            }
            // Populate defaults
        for (var key in defaults) {
            if (typeof options[key] == 'undefined') options[key] = defaults[key];
        }

        var scroller = {
            options: options,
            updateInitiated: false
        }

        // window.onscroll = function (event) {
        document.getElementById("stories").onscroll = function (event) {
                handleScroll(scroller, event);
            }
            // For touch devices, try to detect scrolling by touching
//        document.ontouchmove = function (event) {
        document.getElementById("stories").ontouchmove = function (event) {
            handleScroll(scroller, event);
        }
    }

    function getScrollPos() {
        // Handle scroll position in case of IE differently
        //        if (isIE) {
        //            return document.body.scrollTop;
        //        } else {
        //            return window.pageYOffset;
        var t = (document.getElementById("stories")) ? document.getElementById("stories").scrollTop : 0;
        return t;

        //        }
    }

    var prevScrollPos = getScrollPos();

    // Respond to scroll events
    function handleScroll(scroller, event) {
        if (scroller.updateInitiated) {
            return;
        }
        var scrollPos = getScrollPos();
        if (scrollPos == prevScrollPos) {
            return; // nothing to do
        }

        // Find the pageHeight and clientHeight (the no. of pixels to scroll to make the scrollbar reach max pos)
//        var pageHeight = document.body.scrollHeight;
//        var clientHeight = document.body.clientHeight;
        var pageHeight = document.getElementById("stories").scrollHeight;
        var clientHeight = document.getElementById("stories").clientHeight;

        // Check if scroll bar position is just 50px above the max, if yes, initiate an update
        if (pageHeight - (scrollPos + clientHeight) < scroller.options.distance) {
            scroller.updateInitiated = true;
            scroller.options.callback(function () {
                scroller.updateInitiated = false;
            });
        }

        prevScrollPos = scrollPos;
    }
}());
