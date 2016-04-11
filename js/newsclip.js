var app = angular.module('newsclip', []);
var month = new Array("January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December");
var paperTwitterHandle = "@theleadernews";
var paperEmail = "Leader Letters <leaderletters@fairfaxmedia.com.au>";
var replyBy = 20; // Show reply button if story is less than these days old
var today = new Date();
var cutoff = new Date();
cutoff.setDate(today.getDate() - replyBy);
var sharePrefixRaw = window.location.origin + window.location.pathname + "?s=";

app.controller('pageController', ['$http', function ($http) {
    this.paperShortName = "Leader";
    this.paperName = "Sutherland Shire Leader";
    this.linkPrefix = "https://drive.google.com/uc?export=view&id=";
    // this.thumbPrefix = "https://drive.google.com/thumbnail?sz=h200&id=";
    this.thumbPrefix = this.linkPrefix;
    this.onlinePrefix = "http://www.theleader.com.au/story/";
    this.sharePrefix = encodeURIComponent(sharePrefixRaw);
    this.hashtag = "econews";

    var data = this;
    $http.get('newsclip.json').success(function (jsonData) {
        data.topics = jsonData[0];
        data.people = jsonData[1];
        data.stories = jsonData[2];
        //        data.stories.forEach(completeUrls);
        data.stories.forEach(splitTags);
        data.stories.forEach(setVars);
    });

    //    function completeUrls(s, i, a) {
    //        a[i].thumbUrl = thumbPrefix + s.link;
    //        a[i].online = (s.online) ? onlinePrefix + s.online : "";
    //    };

    function splitTags(s, i, a) {
        if (s.topics) {
            a[i].topics = s.topics.split(", ");
        }

        if (s.person) {
            var initArray = s.person.split(", ");
            //            a[i].person.initials = s.person.split(", ");
            a[i].person = [];
            initArray.forEach(function (init, j) {
                a[i].person.push({
                    initials: init,
                    fullname: ""
                });
                for (var k = 0; k < data.people.length; k++) {
                    if (init === data.people[k].initials) {
                        a[i].person[j].fullname = data.people[k].fullname;
                        break;
                    }
                }
            });
        }
    }

    function setVars(s, i, a) {
        var d = new Date(s.date);
        a[i].dateString = month[d.getMonth()] + " " +
            d.getDate() + " " +
            d.getFullYear();

        if (a[i].link) {
            var shortDate = month[d.getMonth()].substr(0, 3) + " " + d.getDate();

            a[i].tweet = s.title;
            a[i].tweet += (s.author) ? " - " + s.author : "";
            a[i].tweet += " " + paperTwitterHandle || this.paperName;
            a[i].tweet += " " + shortDate;
            a[i].tweet += (d.getFullYear() == today.getFullYear()) ?
                "" : " " + d.getFullYear(); // Add year if not this year
            a[i].tweet = a[i].tweet.replace(/\'/g, "%27");

            var body = '"' + s.title + '"\n';
            body += (s.author) ? s.author + ", " : "";
            body += this.paperName + " " + a[i].dateString + "\n\n";
            body = encodeURIComponent(body) + this.sharePrefix + s.link;

            a[i].mailLink = "mailto:?subject=" +
                encodeURIComponent(s.title) +
                "&body=" + body;

            a[i].copyText = '\"\\"' + s.title + '\\"\\n'; // Escape quote & \n to work in copyTextToClipboard
            a[i].copyText += (s.author) ? s.author + ", " : "";
            a[i].copyText += this.paperName + " " + a[i].dateString + "\\n\\n" +
                sharePrefixRaw + s.link + "\"";

            if (d >= cutoff) {
                body = "Dear Editor\n\nRegarding \"" +
                    s.title + "\" (" + this.paperShortName + ", " +
                    a[i].dateString.replace(/ [0-9]{4}$/, "") + "), ";

                a[i].replyLink = "mailto:" + encodeURIComponent(paperEmail) + "?subject=" +
                    encodeURIComponent(s.title) +
                    "&body=" + encodeURIComponent(body);
            }
        }
    }
    }]);

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
