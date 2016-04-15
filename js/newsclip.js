var app = angular.module('newsclip', ['infiniteScroll', 'bootstrapLightbox']);

angular.module('newsclip').config(function (LightboxProvider) {
    // set a custom template
    LightboxProvider.templateUrl = './lightbox.html';
});

var data_folder = "https://googledrive.com/host/0B4rKiNtdxe1NZ1NKa3ItTXR0RkU/";
var jsonFile = data_folder + "econews.json";
var month = ["January", "February", "March",
    "April", "May", "June",
    "July", "August", "September",
    "October", "November", "December"];
var paperTwitterHandle = "@theleadernews";
var paperEmail = "Leader Letters <leaderletters@fairfaxmedia.com.au>";
var replyBy = 20; // Show reply button if story is less than these days old
var today = new Date();
var cutoff = new Date();
cutoff.setDate(today.getDate() - replyBy);
var sharePrefixRaw = location.origin + location.pathname + "?s=";
var storyArchive;
var nextStory;
var reset = true;

app.controller('pageController', ['$scope', '$http', 'Lightbox', function ($scope, $http, Lightbox) {
    $scope.g = {
        paperShortName: "Leader",
        paperName: "Sutherland Shire Leader",
        linkPrefix: "https://drive.google.com/uc?export=view&id=",
        // thumbPrefix: "https://drive.google.com/thumbnail?sz=h200&id=",
        thumbPrefix: "https://drive.google.com/uc?export=view&id=",
        onlinePrefix: "http://www.theleader.com.au/story/",
        sharePrefix: encodeURIComponent(sharePrefixRaw),
        hashtag: "econews",
        bucket: 8,
        moreStories: true
    };

    var page = this;
    $http.get(jsonFile).success(function (jsonData) {
        page.topics = jsonData[0];
        page.people = jsonData[1];
        storyArchive = jsonData[2];
        page.stories = [];
        $scope.addStories($scope.g.bucket, reset);
    });

    $scope.addStories = function (n, reset) {
        var i, l;
        if (reset) {
            nextStory = 0;
            page.stories = [];
            $scope.images = [];
        }
        l = page.stories.length - 1;
        for (i = nextStory; i < storyArchive.length; i++) {
            if (true) { // Insert filter condition here
                page.stories.push(storyArchive[i]);
                l++;
                splitTags(page.stories[l]);
                setVars(page.stories[l]);
                nextStory++;
                if (nextStory >= n) {
                    break;
                }
            }
        }
        if (i === storyArchive.length) {
            $scope.g.moreStories = false;
        }
    };

    $scope.openLightboxModal = function (index) {
        Lightbox.openModal(page.stories, index, null, $scope.g);
    };


    function splitTags(s) {
        if (s.topics) {
            s.topics = s.topics.split(", ");
        }

        if (s.person) {
            var initArray = s.person.split(", ");
            //            a[i].person.initials = s.person.split(", ");
            s.person = [];
            initArray.forEach(function (init, j) {
                var k;
                s.person.push({
                    initials: init,
                    fullname: ""
                });
                for (k = 0; k < page.people.length; k++) {
                    if (init === page.people[k].initials) {
                        s.person[j].fullname = page.people[k].fullname;
                        break;
                    }
                }
            });
        }
    }

    function setVars(s) {
        var d = new Date(s.date),
            shortDate,
            body;
        // Add url & thumbUrl to use stories as images in Lightbox
        s.thumbUrl = $scope.g.thumbPrefix + s.link;
        s.url = $scope.g.linkPrefix + s.link;

        s.dateString = month[d.getMonth()] + " " +
            d.getDate() + " " +
            d.getFullYear();

        if (s.link) {
            shortDate = month[d.getMonth()].substr(0, 3) + " " + d.getDate();

            s.tweet = s.title;
            s.tweet += (s.author) ? " - " + s.author : "";
            s.tweet += " " + paperTwitterHandle || $scope.g.paperName;
            s.tweet += " " + shortDate;
            s.tweet += (d.getFullYear() === today.getFullYear()) ?
                    "" : " " + d.getFullYear(); // Add year if not this year
            s.tweet = s.tweet.replace(/\'/g, "%27");

            body = '"' + s.title + '"\n';
            body += (s.author) ? s.author + ", " : "";
            body += $scope.g.paperName + " " + s.dateString + "\n\n";
            body = encodeURIComponent(body) + $scope.g.sharePrefix + s.link;

            s.mailLink = "mailto:?subject=" +
                encodeURIComponent(s.title) +
                "&body=" + body;

            s.copyText = '\"\\"' + s.title + '\\"\\n'; // Escape quote & \n to work in copyTextToClipboard
            s.copyText += (s.author) ? s.author + ", " : "";
            s.copyText += $scope.g.paperName + " " + s.dateString + "\\n\\n" + sharePrefixRaw + s.link + "\"";

            if (d >= cutoff) {
                body = "Dear Editor\n\nRegarding \"" +
                    s.title + "\" (" + $scope.g.paperShortName + ", " +
                    s.dateString.replace(/ [0-9]{4}$/, "") + "), ";

                s.replyLink = "mailto:" + encodeURIComponent(paperEmail) + "?subject=" +
                    encodeURIComponent(s.title) +
                    "&body=" + encodeURIComponent(body);
            }
        }
    }

}]);


function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea"),
        successful,
        msg;
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
        successful = document.execCommand('copy');
        msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
    } catch (err) {
        console.log('Oops, unable to copy');
    }

    document.body.removeChild(textArea);
}
