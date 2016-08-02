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
    var distStart, distEnd;
    var oversize = false;
    var imgWidth, imgHeight;

    //    function dayString(d) {
    //        var t = d.getFullYear() + "-";
    //        t += (d.getMonth() < 9) ? "0" : "";
    //        t += d.getMonth() + 1 + "-";
    //        t += (d.getDate() < 10) ? "0" : "";
    //        t += d.getDate();
    //        return t
    //
    //    }

    var firstDate = new Date(2013, 0, 1);
    var lastDate = new Date();
    var replyBy = 20; // Show reply button if story less than replyBy days old
    var today = new Date();
    var cutoff = new Date();
    cutoff.setDate(today.getDate() - replyBy);

    var filterElem = []; // Will reference the filter elements in header
    //    var iFromDate = 0,
    //        iToDate = 1,
    //        iTopic = 2,
    //        iPerson = 3,
    //        iSearch = 4 // Indices to filterElem array

    var iToDate = 0,
        iTopic = 1,
        iPerson = 2,
        iSearch = 3,
        iSearchBtn = 4,
        iClearBtn = 5 // Indices to filterElem array

    var searchHint = "Search title or author";

    //    var active = ["black", "#f8ecb9", "normal"];
    //    var inactive = ["grey", "white", "italic"];
    //    var col = 0,
    //        bg = 1,
    //        fs = 2;

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

    var fromPicker, toPicker;
}

function init() {
    //    window.filterElem[iFromDate] = document.getElementById("fromDate");
    window.filterElem[iToDate] = document.getElementById("toDate");
    window.filterElem[iTopic] = document.getElementById("topic");
    window.filterElem[iPerson] = document.getElementById("person");
    window.filterElem[iSearch] = document.getElementById("search");
    window.filterElem[iSearchBtn] = document.getElementById("searchBtn");
    window.filterElem[iClearBtn] = document.getElementById("clearBtn");

    setDate();
    setTopics();
    setPeople();

    clearFilter();
    checkHeight();

    document.getElementById("loadStories").style.display = "none";

    var scrollOptions = {
        distance: scrollSensor,
        callback: function (done) {
            writeStories(bucket);
            done();
        }
    }

    infiniteScroll(scrollOptions); // setup infinite scroll

    window.addEventListener("resize", checkHeight, false);

    //  fromPicker = new Pikaday({
    //    defaultDate: firstDate,
    //    field: document.getElementById("fromDate"),
    //    format: "D MMMM YYYY",
    //    maxDate: lastDate,
    //    minDate: firstDate,
    //    onOpen: function () {
    //      window.setTimeout(function () {
    //        if (!document.getElementById("fromDate").value) {
    //          fromPicker.setDate(firstDate);
    //          fromPicker.hide();
    //        };
    //      }, 250);
    //    },
    //    onSelect: function () {
    //      filter.fromDate = this.getDate();
    //      writeStories(bucket, true);
    //      setInputs(false);
    //    },
    //    setDefaultDate: true
    //  });

    toPicker = new Pikaday({
        defaultDate: lastDate,
        field: document.getElementById("toDate"),
        format: "D MMMM YYYY",
        maxDate: lastDate,
        minDate: firstDate,
        onOpen: function () {
            window.setTimeout(function () {
                if (!document.getElementById("toDate").value) {
                    toPicker.setDate(lastDate);
                    toPicker.hide();
                };
            }, 250);
        },
        onSelect: function () {
            filter.toDate = this.getDate();
            writeStories(bucket, true);
            setInputs(false);
        },
        setDefaultDate: true
    });

    if (window.location.search) {
        showOnPageLoad(window.location.search);
    } else {
        writeStories(bucket, true);
    }
}

function setDate() {
    //    filterElem[iFromDate].min = firstDate;
    //    filterElem[iFromDate].max = lastDate;
    //    filterElem[iFromDate].title = "Filter from date (default: start of archive)";
    //    filterElem[iToDate].min = firstDate;
    //    filterElem[iToDate].max = lastDate;
    filterElem[iToDate].title = "Filter to date (default: today)";
}

function clearDate() {
    filterElem[iToDate].value = moment(lastDate).format('D MMMM YYYY');
    filter.toDate = lastDate;
    writeStories(bucket, true);
    setInputs(false);
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
    //    filter.fromDate = firstDate;
    filter.toDate = lastDate;
    filter.person = "";
    filter.topics = "";
    filter.search = "";
    setInputs(true);
};

function setInputs(fromFilter) {
    document.body.focus();
    var filtered = false;

    if (fromFilter) {
        //        filterElem[iFromDate].value =
        //            moment(filter.fromDate).format("D MMMM YYYY");
        filterElem[iToDate].value =
            moment(filter.toDate).format("D MMMM YYYY");
        filterElem[iTopic].value = filter.topics;
        filterElem[iPerson].value = filter.person;
        filterElem[iSearch].value = (searchStart) ? searchHint : filter.search;
    }

    //    if (filter.fromDate == firstDate) {
    //        filterElem[iFromDate].style.color = inactive[col];
    //        filterElem[iFromDate].style.backgroundColor = inactive[bg];
    ////        if (!filterElem[iFromDate].required) filterElem[iFromDate].setAttribute("required", true);
    //    } else {
    //        filterElem[iFromDate].style.color = active[col];
    //        filterElem[iFromDate].style.backgroundColor = active[bg];
    ////        if (filterElem[iFromDate].required) filterElem[iFromDate].removeAttribute("required");
    //    }

    if (filter.toDate == lastDate) {
        filterElem[iToDate].parentElement.classList.remove("set");
        //        if (!filterElem[iToDate].required) filterElem[iToDate].setAttribute("required", true);
    } else {
        filterElem[iToDate].parentElement.classList.add("set");
        filtered = true;
        //        if (filterElem[iToDate].required) filterElem[iToDate].removeAttribute("required");
    }

    if (filter.topics) {
        filterElem[iTopic].classList.add("set");
        filtered = true;
    } else {
        filterElem[iTopic].classList.remove("set");
    };

    if (filter.person) {
        filterElem[iPerson].classList.add("set");
        filtered = true;
    } else {
        filterElem[iPerson].classList.remove("set");
    };

    if (filter.search && !searchStart) {
        filterElem[iSearch].classList.add("set");
        filterElem[iSearchBtn].classList.add("set");
        filtered = true;
    } else {
        filterElem[iSearch].classList.remove("set");
        filterElem[iSearchBtn].classList.remove("set");
    };

    if (filtered) {
        filterElem[iClearBtn].parentElement.classList.add("set", "notice");
    } else {
        filterElem[iClearBtn].parentElement.classList.remove("set", "notice");
    }
}

function showOnPageLoad(id) {
    var dStr = "";
    var dateStory1 = -1;

    id = id.replace(/^\?s=/, "");
    // find story with that link(id)
    for (var j = 0; j < stories.length; j++) {
        // Count from first story for the target date 
        if (stories[j].date != dStr) {
            dStr = stories[j].date;
            dateStory1 = j;
        }
        if (stories[j].link == id) {
            dStr = stories[j].date;
            break;
        }
    }

    if (j == stories.length) {
        console.warn("Story ID " + id + " not found");
        location = location.pathname; // Reloads page without search query
        return;
    }

    if (dateStory1 > 0) {
        filter.toDate = new Date(stories[j].date + "T00:00");
    }

    setInputs(true);

    writeStories(j - dateStory1 + bucket + 1, true); // Write stories to target plus a few
    window.setTimeout(function () {
        document.getElementById(id).scrollIntoView();
        window.scrollBy(0, -window.innerHeight/2); // Scroll element to middle of screen
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
    var d = new Date(s.date);
    d.setHours(0,0,0,0);
    //    return d >= filter.fromDate && d <= filter.toDate &&
    return d <= filter.toDate &&
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
                    storyDiv += "<a href='" + onlinePrefix + s.online + "' target=_blank><img class='textBtn' src='images/online.svg' title='This story is available on the " + paperShortName + " website'></a> ";
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
                    storyDiv += " <a href='javascript:;' onClick='clearFilter(); filter.topics=\"" + topicList[i] + "\"; setInputs(true); writeStories(bucket, true)'>" + topicList[i] + "</a>";
                }
            }
            if (s.person != "") {
                storyDiv += " <img class='textIcon' src='images/person.svg' title='SSEC members tagged in this story'>";
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
                        "onClick='clearFilter(); filter.person=\"" + personList[i] + "\"; setInputs(true); writeStories(bucket, true)'>" + personList[i] + "</a>";
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

            var dateObjString = "new Date(" + d.getFullYear() + "," + d.getMonth() + "," + d.getDate() + ")";

            //            storyDiv += "<span class='noWrap'>" + "<a href='javascript:;' onClick='clearFilter(); filter.fromDate=\"" + s.date + "\"; filter.toDate=\"" +
            storyDiv += "<span class='noWrap'>" + "<a href='javascript:;' onClick='clearFilter(); filter.toDate= " +
                dateObjString + "; setInputs(true); writeStories(bucket, true)'>" +
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
            var readOnline = (s.online) ? "<br><a href='" + onlinePrefix + s.online + "' target=_blank>Read online</a>" : "";
            storyDiv += "<p class='note'>no image" + readOnline + "</p>"
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
        //        console.log('Copying text command was ' + msg);
    } catch (err) {
        console.error('Oops, unable to copy');
    }

    document.body.removeChild(textArea);
}

function searchStories() {
    var s = document.getElementById('search').value.trim().replace('\n', '');
    var sElem = document.getElementById('search');
    if (!searchStart) {
        filter.search = RegExp(s, 'i');
        writeStories(bucket, true);
    }
    setInputs(false);
}

function showImg(id) {
    if (view == "fullscreen") {
        console.warn("in showImg, but already fullscreen");
        return;
    }

    var imgBox = document.getElementById("imgBox");
    var show = document.getElementById("show").style;
    var shownImg = document.getElementById("shownImg");
    var zoomDiv = document.getElementById("zoomDiv");

    view = "fullscreen";
    show.width = window.innerWidth;
    show.height = window.innerHeight;
    show.transition = "opacity 250ms ease-in-out, z-index 0ms";
    show.zIndex = 4;
    show.opacity = 1;
    window.setTimeout(function () {
        document.body.style.overflow = "hidden";
    }, 250);
    document.getElementById("shownImg").src = "";
    document.getElementById("shownImg").src = linkPrefix + id;

    shownImg.addEventListener("load", checkImgSize, false);

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

function checkImgSize() {
    if (shownImg.naturalHeight > window.innerHeight ||
        shownImg.naturalWidth > window.innerWidth) {
        oversize = true;
        vscrollOutside();
        if (shownImg.naturalHeight > window.innerHeight) {
            shownImg.classList.add("overHeight");
        }
        imgHeight = shownImg.naturalHeight;
        imgWidth = shownImg.naturalWidth;
        shownImg.style.maxHeight = imgHeight;
        shownImg.style.maxWidth = imgWidth;
        shownImg.addEventListener("touchstart", touchImg, false);
        shownImg.addEventListener("touchmove", touchImg, false);
        shownImg.addEventListener("touchend", touchImg, false);
        zoomDiv.classList.remove("hidden");
    }
}

function touchImg(e) {
    switch (e.type) {
        case "touchstart":
            if (e.touches.length == 2) {
                e.stopPropagation();
                distStart =
                    ((e.touches[0].x || e.touches[0].screenX) -
                        (e.touches[1].x || e.touches[1].screenX)) *
                    ((e.touches[0].x || e.touches[0].screenX) -
                        (e.touches[1].x || e.touches[1].screenX)) +
                    ((e.touches[0].y || e.touches[0].screenY) -
                        (e.touches[1].y || e.touches[1].screenY)) *
                    ((e.touches[0].y || e.touches[0].screenY) -
                        (e.touches[1].y || e.touches[1].screenY));
            } else {
                distStart = 0;
            }
            break;
        case "touchmove":
            if (distStart && e.touches.length == 2) {
                e.stopPropagation();
                distEnd =
                    ((e.touches[0].x || e.touches[0].screenX) -
                        (e.touches[1].x || e.touches[1].screenX)) *
                    ((e.touches[0].x || e.touches[0].screenX) -
                        (e.touches[1].x || e.touches[1].screenX)) +
                    ((e.touches[0].y || e.touches[0].screenY) -
                        (e.touches[1].y || e.touches[1].screenY)) *
                    ((e.touches[0].y || e.touches[0].screenY) -
                        (e.touches[1].y || e.touches[1].screenY));
            }
            break;
        case "touchend":
            if (distEnd) {
                var zoomBtn = document.getElementById("zoomBtn");
                e.stopPropagation();
                if (distEnd > distStart && hasClass(zoomBtn, "fit") ||
                    distEnd < distStart && !hasClass(zoomBtn, "fit")) {
                    toggleZoom();
                }
                distEnd = 0;
            }
            break;
        default:
            console.warn("Unknown event type '" + e.type + "' in function touchImg");
            break;
    }
}

function toggleZoom(clkEv) {
    if (clkEv) {
        clkEv.stopPropagation();
    }
    var shownImg = document.getElementById("shownImg");
    var zoomBtn = document.getElementById("zoomBtn");
    if (hasClass(zoomBtn, "fit")) {
        shownImg.style.maxHeight = imgHeight;
        shownImg.style.maxWidth = imgWidth;
        zoomBtn.classList.remove("fit");
        zoomBtn.title = "Fit to window";
    } else {
        shownImg.style.maxHeight = window.innerHeight;
        shownImg.style.maxWidth = window.innerWidth;
        zoomBtn.classList.add("fit");
        zoomBtn.title = "Actual size";
    }
}

function hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

function closeImg() {
    var imgBox = document.getElementById("imgBox");
    var show = document.getElementById("show").style;
    var shownImg = document.getElementById("shownImg");
    var zoomDiv = document.getElementById("zoomDiv");
    var zoomBtn = document.getElementById("zoomBtn");

    if (hasClass(zoomBtn, "fit")) {
        toggleZoom();
    }

    if (oversize) {
        shownImg.removeEventListener("touchstart", touchImg);
        shownImg.removeEventListener("touchmove", touchImg);
        shownImg.removeEventListener("touchend", touchImg);
        zoomDiv.classList.add("hidden");
        shownImg.style.maxHeight = "";
        shownImg.style.maxWidth = "";
        shownImg.classList.remove("overHeight");
    }

    if (view != "fullscreen") {
        console.error("In closeImg, but not fullscreen");
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
    //    window.removeEventListener("resize", vscrollOutside);
    window.onbeforeunload = "";

    window.removeEventListener("popstate", closeImg);
    history.pushState("", document.title, location.pathname);
}

// If only vertical scrollbar on image, put it outside
function vscrollOutside() {
    var imgBox = document.getElementById("imgBox");
    var shownImg = document.getElementById("shownImg");
    if (shownImg.naturalHeight > window.innerHeight &&
        shownImg.naturalWidth == window.innerWidth) {
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
    document.body.classList.add("noscroll");
}

function raisePennant() {
    document.getElementById("mc_embed_signup").style.top = -subscribeHeight;
    document.getElementById("about").style.top = -aboutHeight - subscribeHeight;
    document.getElementById("mc_embed_signup").style.bottom = "auto";
    document.getElementById("about").style.bottom = "auto";

    document.getElementById("modal").style.transition = "top 500ms ease-out";;
    document.getElementById("modal").style.top = "-100%";
    pennantDown = "";
    document.body.classList.remove("noscroll");
    dontScrollHeaderThisTime = hideHeader; // Tell scrollHeader not to run
    document.body.scrollTop = bodyTop;
}
