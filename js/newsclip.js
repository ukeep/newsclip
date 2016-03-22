initVars: {
    var linkPrefix = "https://drive.google.com/uc?export=view&id=";
    //        var thumbPrefix = "https://drive.google.com/thumbnail?sz=h200&id=";
    var thumbPrefix = linkPrefix;
    //            var sharePrefix = "https://drive.google.com/file/d/";
    //            var shareSuffix = "/view?usp=sharing";
    var maxheaderPercent = 0.10; // 0.07;
    var headerHeight, hideHeader, lastScrollTop;
    var headerShown = true;
    var subscribeHeight = 440;
    var aboutHeight = 515;
    var pennantDown = "";
    var dontScrollHeaderThisTime = false;
    var bodyTop;

    var onlinePrefix = "http://www.theleader.com.au/story/";
    var paperName = "Sutherland Shire Leader";
    var paperEmail = "Leader Letters <leaderletters@fairfaxmedia.com.au>";
    var paperShortName = "Leader";
    var paperTwitterHandle = "@theleadernews";
    var hashtag = "econews";

    function dayString(d) {
        var t = d.getFullYear() + "-";
        t += (d.getMonth() < 9) ? "0" : "";
        t += d.getMonth() + 1 + "-";
        t += (d.getDate() < 10) ? "0" : "";
        t += d.getDate();
        return t

    }

    var firstDate = "2013-01-01";
    var lastDate = dayString(new Date()); // If a fixed last date, use "yyyy-mm-dd"
    var replyBy = 20; // Show reply button if story is less than these days old
    var today = new Date();
    var cutoff = new Date();
    cutoff.setDate(today.getDate() - replyBy);

    var filterElem = []; // Will reference the filter elements in header
    var iFromDate = 0,
        iToDate = 1,
        iTopic = 2,
        iPerson = 3,
        iSearch = 4 // Indices to filterElem array

    var searchHint = "Search title or author";

    var active = ["black", "#f8ecb9", "normal"];
    var inactive = ["grey", "white", "italic"];
    var col = 0,
        bg = 1,
        fs = 2;

    var view = "";

    var showMargin = 10; // Margin between edge of window and full size news image

    var next = 0; // Next story to display when scrolling to end of page 
    var bucket = 7; // Number of stories loaded to page at a time
    var scrollSensor = 50; // Add more content if within this distance of page end
    var filter = {};
    var searchStart = true;

    var month = new Array("January", "February", "March",
        "April", "May", "June",
        "July", "August", "September",
        "October", "November", "December");

    var scrollbarWidth = 17;
    //            var justShown = false;

    var writeNotice = true;

}

function init() {
    window.filterElem[iFromDate] = document.getElementById("fromDate");
    window.filterElem[iToDate] = document.getElementById("toDate");
    window.filterElem[iTopic] = document.getElementById("topic");
    window.filterElem[iPerson] = document.getElementById("person");
    window.filterElem[iSearch] = document.getElementById("search");

    setDates();
    setTopics();
    setPeople();

    clearFilter();
    checkHeight();

    document.getElementById("loadStories").style.display = "none";

    if (window.location.search) {
        showOnPageLoad(window.location.search);
    } else {
        writeStories(bucket, true);
    }

    var scrollOptions = {
        distance: scrollSensor,
        callback: function (done) {
            writeStories(bucket);
            done();
        }
    }

    infiniteScroll(scrollOptions); // setup infinite scroll

    window.addEventListener("resize", checkHeight, false);
}

function setDates() {
    filterElem[iFromDate].min = firstDate;
    filterElem[iFromDate].max = lastDate;
    filterElem[iFromDate].title = "Filter from date (default: start of archive)";
    filterElem[iToDate].min = firstDate;
    filterElem[iToDate].max = lastDate;
    filterElem[iToDate].title = "Filter to date (default: today)";
}

function setTopics() {
    var options = "<option value='' selected>(all)</option>";
    for (var i = 0; i < topics.length; i++) {
        options += "<option value='" + topics[i].name + "'>" +
            topics[i].name + "</option>";
    }

    filterElem[iTopic].innerHTML = options;

    var rows = "";
    for (var j = 0; j < topics.length; j++) {
        rows += "<div class='row'>" +
            "<div class='term'>" + topics[j].name + "</div>" +
            "<div class='description'>" + topics[j].description + "</div>" +
            "</div>";
    }

    document.getElementById("topicHelp").innerHTML = rows;
}

function setPeople() {
    var options = "<option value='' selected>(all)</option>";
    for (var i = 0; i < people.length; i++) {
        options += "<option value='" + people[i].initials + "'>" +
            people[i].fullname + "</option>";
    }
    filterElem[iPerson].innerHTML = options;
}

function clearFilter() {
    filter.fromDate = firstDate;
    filter.toDate = lastDate;
    filter.person = "";
    filter.topics = "";
    filter.search = "";
    setInputs();

};

function setInputs() {
    filterElem[iFromDate].value = filter.fromDate;
    filterElem[iToDate].value = filter.toDate;
    filterElem[iTopic].value = filter.topics;
    filterElem[iPerson].value = filter.person;
    filterElem[iSearch].value = (searchStart) ? searchHint : filter.search;

    filterElem[iFromDate].style.color = (filter.fromDate != firstDate) ? active[col] : inactive[col];
    filterElem[iFromDate].style.backgroundColor = (filter.fromDate != firstDate) ? active[bg] : inactive[bg];

    filterElem[iToDate].style.color = (filter.toDate != lastDate) ? active[col] : inactive[col];
    filterElem[iToDate].style.backgroundColor = (filter.toDate != lastDate) ? active[bg] : inactive[bg];
    filterElem[iTopic].style.color = (filter.topics) ? active[col] : inactive[col];
    filterElem[iTopic].style.backgroundColor = (filter.topics) ? active[bg] : inactive[bg];
    filterElem[iPerson].style.color = (filter.person) ? active[col] : inactive[col];
    filterElem[iPerson].style.backgroundColor = (filter.person) ? active[bg] : inactive[bg];
    filterElem[iSearch].style.color = (filter.search && !searchStart) ? active[col] : inactive[col];
    filterElem[iSearch].style.backgroundColor = (filter.search && !searchStart) ? active[bg] : inactive[bg];
}

function showOnPageLoad(id) {

    id = id.replace(/^\?s=/, "");
    // find story with that link(id)
    for (var j = 0; j < stories.length; j++) {
        if (stories[j].link == id) {
            break;
        }
    }

    if (j == stories.length) {
        console.log("story ID " + id + " not found");
        location = location.pathname; // Reloads page without search query
        return;
    }

    filter.fromDate = stories[j].date;
    filter.toDate = stories[j].date;
    setInputs();

    writeStories(Infinity, true); // Write all stories in filter
    window.setTimeout(function () {
        document.getElementById(id).scrollIntoView();
    }, 250);

    showImg(id);
}

function writeStories(n, reset) {
    if (reset) {
        writeNotice = true;
        next = 0;
        nStories = 0;
        document.getElementById("stories").innerHTML = "";
        window.scrollTo(0, 0);
        reset = false;
    }
    for (var j = 0; next < stories.length && j <= n; next++) {
        if (fitsThru(stories[next])) {
            document.getElementById("stories").innerHTML +=
                formatStory(stories[next]);
            j++;
        }
    }
    nStories += j;
    if (next == stories.length && writeNotice) {
        var notice;
        switch (nStories) {
            case 0:
                notice = "No items match";
                break;
            case 1:
                notice = "1 item matches";
                break;
            default:
                notice = nStories + " items match";
        }
        notice += " your search/filter.";
        if (nStories == 0) {
            notice += " <span class='noWrap'><a href='javascript:clearFilter(); writeStories(bucket, true)'>Clear search/filter</a></span>.";
        }

        document.getElementById("stories").innerHTML +=
            "<div class='story'><span class='notice'>" + notice +
            "</span></div>";
        writeNotice = false;
    }

}

function fitsThru(s) {
    return s.date.substr(0, 10) >= filter.fromDate &&
        s.date.substr(0, 10) <= filter.toDate &&
        (filter.person == "" || s.person.search(filter.person) > -1) &&
        (filter.topics == "" || s.topics.search(filter.topics) > -1) &&
        (filter.search == "" ||
            s.title.search(filter.search) > -1 ||
            s.author.search(filter.search) > -1);
}

function formatStory(s) {

    if (s.link) {
        var storyDiv = "<div class='story' id='" + s.link + "'>";
    } else {
        var storyDiv = "<div class='story'>";
    }

    detailsDiv: {
        storyDiv += "<div class='details'>";

        storyDiv += "<h2>" + s.title + "</h2>";

        byline: {
            if (s.author || s.online) {
                storyDiv += "<p class='byline'>";
                if (s.online != "") {
                    storyDiv += "<a href='" + onlinePrefix + s.online + "' target=_blank><img class='textBtn' src='images/online.svg' title='Read online'></a> ";
                }
                storyDiv += s.author + "</p>";
            }
        }

        tagline: {
            storyDiv += "<p class='tagline'>"
            if (s.topics != "") {
                storyDiv += " <img class='textIcon' src='images/topic.svg' title='Topics tagged in this story'>";
                var topicList = s.topics.split(", ");
                for (var i = 0; topicList[i]; i++) {
                    storyDiv += " <a href='javascript:;' onClick='clearFilter(); filter.topics=\"" + topicList[i] + "\"; setInputs(); writeStories(bucket, true)'>" + topicList[i] + "</a>";
                }
            }
            if (s.person != "") {
                storyDiv += " <img class='textIcon' src='images/person.svg' title='People tagged in this story'>";
                var personList = s.person.split(", ");
                for (var i = 0; personList[i]; i++) {
                    var title = "";
                    for (var j = 0; j < people.length; j++) {
                        if (people[j].initials == personList[i]) {
                            title = "title='" + people[j].fullname + "'";
                            break;
                        }
                    }
                    storyDiv += " <a href='javascript:;'" + title +
                        "onClick='clearFilter(); filter.person=\"" + personList[i] + "\"; setInputs(); writeStories(bucket, true)'>" + personList[i] + "</a>";
                }
            }

            storyDiv += "</p>"
        }

        citeline: {
            storyDiv += "<p class='citeline'>" + "<span class='noWrap'>" + paperName + ",</span> ";

            var d = new Date(s.date);
            var dateString = month[d.getMonth()] + " " +
                d.getDate() + " " +
                d.getFullYear();

            var shortDate = month[d.getMonth()].substr(0, 3) + " " + d.getDate();

            storyDiv += "<span class='noWrap'>" + "<a href='javascript:;' onClick='clearFilter(); filter.fromDate=\"" +
                s.date + "\"; filter.toDate=\"" +
                s.date + "\"; setInputs(); writeStories(bucket, true)'>" +
                dateString + "</a></span>";

            storyDiv += " &ndash; page " + s.page + "</p>";
        }

        shareBtns: if (s.link) {
                var shareLink =
                    encodeURIComponent(window.location.origin + window.location.pathname + "?s=" + s.link);

                storyDiv += "<div class='shareBtns'><a href='https://www.facebook.com/sharer/sharer.php?u=" + shareLink + "' target='_blank'><img class='textBtn' src='images/fb_share.svg' title='Share on Facebook'></a>"

                var tweet = s.title;
                tweet += (s.author) ? " - " + s.author : "";
                tweet += " " + paperTwitterHandle || paperName;
                tweet += " " + shortDate;
                tweet += (d.getFullYear() == today.getFullYear()) ?
                    "" : " " + d.getFullYear(); // Add year if not this year
                tweet = tweet.replace(/\'/g, "%27");

                storyDiv += " <a href='https://twitter.com/intent/tweet?text=" + tweet + "&url=" + shareLink + "&hashtags='" + hashtag + "' target='_blank'><img class='textBtn' src='images/tweet.svg' title='Tweet this story'></a>";

                var body = '"' + s.title + '"\n';
                body += (s.author) ? s.author + ", " : "";
                body += paperName + " " + dateString + "\n\n";
                body = encodeURIComponent(body) + shareLink;

                var mailLink = "mailto:?subject=" +
                    encodeURIComponent(s.title) +
                    "&body=" + body;
                storyDiv += " <a href=" + mailLink + " target='_blank'><img class='textBtn' src='images/mail.svg' title='Mail this story'></a>";

                var copyText = '\"\\"' + s.title + '\\"\\n'; // Escape quote & \n to work in copyTextToClipboard
                copyText += (s.author) ? s.author + ", " : "";
                copyText += paperName + " " + dateString + "\\n\\n" +
                    window.location.origin + window.location.pathname + "?s=" + s.link + "\"";

                storyDiv += " <a href='javascript:;' class='copyMe puff' tabindex='1'><img class='textBtn puff' src='images/copy.svg' onclick='window.setTimeout(function() {copyTextToClipboard(" + copyText + ");}, 1000)' title='Copy story to clipboard'></a>";

                if (d >= cutoff) {
                    body = "Dear Editor\n\nRegarding \"" +
                        s.title + "\" (" + paperShortName + ", " +
                        dateString.replace(/ [0-9]{4}$/, "") + "), ";

                    mailLink = "mailto:" + encodeURIComponent(paperEmail) + "?subject=" +
                        encodeURIComponent(s.title) +
                        "&body=" + encodeURIComponent(body);

                    storyDiv += " <a href=" + mailLink + " target='_blank'><img class='textBtn' src='images/reply.svg' title='Write to the paper'></a>";
                }

                storyDiv += "</div>";
            }

        storyDiv += "</div>";
    }

    thumbDiv: {
        storyDiv += "<div class='thumb'>";
        if (s.link) {

            // Drop loadImg: not appearing till main image loads anyway
            // storyDiv += "<img class='loadImg' src='images/loadimg.svg'>";

            storyDiv += "<img src='" +
                thumbPrefix + s.link + "' title='Click to view' onclick=showImg('" + s.link + "')>";
        } else {
            storyDiv += "<p class='note'>no image</p>"
        }
        storyDiv += "</div>";
    }

    storyDiv += "</div>";

    storyDiv += "<hr>";

    return storyDiv;
}

function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    // Courtesy Dean Taylor on
    // http://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
    //
    // *** This styling is an extra step which is likely not required. ***
    //
    // Why is it here? To ensure:
    // 1. the element is able to have focus and selection.
    // 2. if element was to flash render it has minimal visual impact.
    // 3. less flakyness with selection and copying which **might** occur if
    //    the textarea element is not visible.
    //
    // The likelihood is the element won't even render, not even a flash,
    // so some of these are just precautions. However in IE the element
    // is visible whilst the popup box asking the user for permission for
    // the web page to copy to the clipboard.
    //

    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;

    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';


    textArea.value = text;

    document.body.appendChild(textArea);

    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
    } catch (err) {
        console.log('Oops, unable to copy');
    }

    document.body.removeChild(textArea);
}

function searchStories() {
    var s = document.getElementById('search').value.trim().replace('\n', '');
    var sStyle = document.getElementById('search').style;
    if (!searchStart) {
        filter.search = RegExp(s, 'i');
        writeStories(bucket, true);
    }
    if (s && !searchStart) {
        sStyle.backgroundColor = active[bg];
        sStyle.color = active[col];
        sStyle.fontStyle = active[fs];
    } else {
        sStyle.color = inactive[col];
        sStyle.backgroundColor = inactive[bg];
    }
}

function showImg(id) {
    if (view == "fullscreen") {
        alert("in showImg, but already fullscreen");
        return;
    }

    var imgBox = document.getElementById("imgBox");
    var show = document.getElementById("show").style;

    view = "fullscreen";
    show.width = window.innerWidth;
    show.height = window.innerHeight;
    show.transition = "opacity 250ms ease-in-out, z-index 0ms";
    show.zIndex = 4;
    show.opacity = 1;
    window.setTimeout(function () {
        document.body.style.overflow = "hidden";
    }, 250);
    document.getElementById("shownImg").src =
        linkPrefix + id;

    vscrollOutside();

    imgBox.scrollTop = 0;
    imgBox.scrollLeft = 0;

    imgBox.style.opacity = 1;
    window.addEventListener("keyup", showKey, false);
    window.addEventListener("resize", checkHeight, false);
    window.onbeforeunload = function () {
        return "Click anywhere to close the image."
    };
    history.pushState("", document.title, "?s=" + id);
    window.addEventListener("popstate", closeImg, false);
}

function closeImg() {
    var imgBox = document.getElementById("imgBox");
    var show = document.getElementById("show").style;

    if (view != "fullscreen") {
        alert("in closeImg, but not fullscreen");
        return;
    }
    view = "";
    document.body.style.overflow = "auto";

    show.opacity = 0;
    show.transition = "opacity 250ms ease-in-out, z-index 0ms linear 500ms";
    show.zIndex = -1;

    imgBox.style.width = "auto";
    imgBox.style.opacity = 0;
    window.removeEventListener("keyup", showKey);
    window.removeEventListener("resize", vscrollOutside);
    window.onbeforeunload = "";

    window.removeEventListener("popstate", closeImg);
    history.pushState("", document.title, location.pathname);
}

// If only vertical scrollbar on image, put it outside
function vscrollOutside() {
    var imgBox = document.getElementById("imgBox");
    if (imgBox.scrollHeight > imgBox.offsetHeight &&
        imgBox.scrollWidth == imgBox.offsetWidth) {
        imgBox.style.width = imgBox.offsetWidth + scrollbarWidth;
    }
}

function showKey(e) {
    if (e.keyCode == 27) { // Esc key pressed
        closeImg();
    }
}

// Show header when user scrolls up
function checkHeight() {
    var hdr = document.getElementById("header");
    headerHeight = hdr.scrollHeight;
    document.getElementById("stories").style.top = headerHeight;
    hideHeader = headerHeight > window.innerHeight * maxheaderPercent;

    // Show filter/search tools when user scrolls up
    if (hideHeader) {
        lastScrollTop = 0;
        window.addEventListener("scroll", scrollHeader, false);
        document.getElementById("mc_embed_signup").style.top = -subscribeHeight;
        document.getElementById("about").style.top = -aboutHeight - subscribeHeight;
    } else {
        window.removeEventListener("scroll", scrollHeader);
        hdr.style.top = 0;
        hdr.style.width = document.body.clientWidth; // Recover width lost by position fixed
        document.getElementById("mc_embed_signup").style.top = -headerHeight - subscribeHeight;
        document.getElementById("about").style.top = -headerHeight - aboutHeight - subscribeHeight;
    }
}

function scrollHeader() {
    if (pennantDown || dontScrollHeaderThisTime || view == "fullscreen") {
        dontScrollHeaderThisTime = false;
        return;
    }
    var st = window.pageYOffset || document.documentElement.scrollTop;
    if (st < lastScrollTop) { // Scroll up
        if (headerShown) {
            if (st < headerHeight && document.getElementById("header").style.top != '0px') {
                document.getElementById("header").style.top =
                    Math.max(-headerHeight, -st);
            }
        } else {
            document.getElementById("header").style.top = 0;
            headerShown = true;
        }
    } else { // Scroll down
        if (headerShown || lastScrollTop < headerHeight) {
            if (st < headerHeight) {
                document.getElementById("header").style.transitionProperty = 'none';
                document.getElementById("header").style.top =
                    Math.max(-headerHeight, -st);
            } else {
                document.getElementById("header").style.transitionProperty = 'top';
                document.getElementById("header").style.top = -headerHeight;
                headerShown = false;
            }
        }
    }
    lastScrollTop = st;
}

function dropPennant(f) {
    if (pennantDown) {
        if (pennantDown == f) {
            raisePennant();
            return;
        } else {
            raisePennant();
        }
    }
    document.getElementById("modal").style.transition =
        "top 500ms ease-in";
    document.getElementById("modal").style.top = 0;

    bodyTop = document.body.scrollTop;

    switch (f) {
        case "subscribe":
            document.getElementById("mc_embed_signup").style.top =
                headerHeight + bodyTop;
            document.getElementById("mc_embed_signup").style.height =
                Math.min(subscribeHeight, window.innerHeight - headerHeight);
            break;
        case "about":
            document.getElementById("about").style.top =
                headerHeight + bodyTop;
            document.getElementById("about").style.height =
                Math.min(aboutHeight, window.innerHeight - headerHeight);
            break;
        default:
            break;
    }
    pennantDown = f;
    document.body.style.top = -bodyTop + "px";
    document.body.className += " noscroll";
}

function raisePennant() {
    document.getElementById("mc_embed_signup").style.top = -subscribeHeight;
    document.getElementById("about").style.top = -aboutHeight - subscribeHeight;
    document.getElementById("mc_embed_signup").style.bottom = "auto";
    document.getElementById("about").style.bottom = "auto";

    document.getElementById("modal").style.transition = "top 500ms ease-out";;
    document.getElementById("modal").style.top = "-100%";
    pennantDown = "";
    document.body.className = document.body.className.replace(" noscroll", "");
    dontScrollHeaderThisTime = hideHeader; // Tell scrollHeader not to run
    document.body.scrollTop = bodyTop;
}
