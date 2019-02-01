// Read news stories and associated data from Google sheet and
// write two files for access by newsclip web app:
// * Javascript file with stories, topics and people. Read by HTML file to display stories for end-users
// * JSON file with story metadata. Read by PHP script to set meta tags for social media crawlers
//
// This script should be run after the spreadsheet is updated or edited.
//
// Jonathan Doig jon@doig.net 15/2/2016

function updateWeb() {
    var sheetFile, jsonFile, jsonMetaFile, jsonPrevMetaFile, jsonPrevStoriesFile;
    var adminEmail = "jonathan.doig@gmail.com, sarah.a.roxas@gmail.com";
    var success = 0,
        fail = -1;
    var errString = "";
    var topics = [],
        people = [],
        stories = [],
        meta = {};
    var mail = true;

    ObjectAssignPolyfill(); // Object.Assign() is not supported by Google App Script

    errString = openFiles();
    if (errString) {
        rtn(fail);
    };

    if (Math.min(
            getTopics(topics),
            getPeople(people),
            getNewStories(stories, meta)) == fail) {

        rtn(fail);

    } else {
        var stories = stories.concat(JSON.parse(jsonPrevStoriesFile));
        var meta = meta.concat(JSON.parse(jsonPrevMetaFile));

        jsonFile.setContent(
            "var topics  = " + JSON.stringify(topics) + ";" +
            "var people  = " + JSON.stringify(people) + ";" +
            "var stories = " + JSON.stringify(stories) + ";"
        );

        jsonMetaFile.setContent(JSON.stringify(meta));

        rtn(success);
    }

    function openFiles() {
      var sheetFileId = "18RO3nsWm1DzWVkDZ70GCRguPRZEpjWLZHOXqpr1EV1s",
          jsonFileId = "0B4rKiNtdxe1Nd2ZtLUU2a3gxMEk",
          jsonMetaFileId = "0B4rKiNtdxe1NVEFnTmkzYTJlalU";
          jsonPrevMetaFileId = "1o5MOt0GUaHIMP_tAyiFbPnyjlhyXytN-";
          jsonPrevStoriesFileId = "1outwVCT1UWNTSSJzSOcXjHPHS0SnXTBQ";

      try {
        sheetFile = SpreadsheetApp.openById(sheetFileId);
      } catch (e) {
          errString = "Cannot open spreadsheet with ID '" + sheetFileId + "'\n" +
              "Error: " + e.message + "\n";
      }

      try {
        jsonFile = DriveApp.getFileById(jsonFileId);
      } catch (e) {
          errString += (errString) ? "\n" : "";
          errString += "Cannot open JSON data file with ID '" + jsonFileId +
              "'\n" +
              "Error: " + e.message + "\n";
      }

      try {
        jsonMetaFile = DriveApp.getFileById(jsonMetaFileId);
      } catch (e) {
          errString += (errString) ? "\n" : "";
          errString += "Cannot open JSON metadata file with ID '" + jsonMetaFileId +
              "'\n" +
              "Error: " + e.message + "\n";
      }

      try {
        jsonPrevMetaFile = DriveApp.getFileById(jsonPrevMetaFileId);
      } catch (e) {
          errString += (errString) ? "\n" : "";
          errString += "Cannot open JSON previous metadata file with ID '" + jsonPrevMetaFileId + "'\n" +
              "Error: " + e.message + "\n";
      }

      try {
        jsonPrevStoriesFile = DriveApp.getFileById(jsonPrevStoriesFileId);
      } catch (e) {
          errString += (errString) ? "\n" : "";
          errString += "Cannot open JSON previous stories file with ID '" + jsonPrevStoriesFileId + "'\n" +
              "Error: " + e.message + "\n";
      }

      return errString;
    }


    // Perhaps these three functions could be one,
    // by passing all the differences as arguments...
    function getTopics(res) {
        var startRow = 1; // = row 2
        var nameCol = 0,
            descCol = 1;
        var sheetName = "Topics";
        var sheet, values, r;

        sheet = sheetFile.getSheetByName(sheetName);
        if (!sheet) {
            errString += (errString) ? "\n" : "";
            errString += "Cannot find sheet '" + sheetName + "'\n";
            return fail;
        }

        values = sheet.getDataRange().getValues();

        for (r = startRow; r < sheet.getLastRow(); r++) {

            if (values[r][nameCol] == "") break; // Reached last topic in sheet

            var topic = {
                name: values[r][nameCol],
                description: values[r][descCol]
            };

            res.push(topic);
        }

        res.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });

        return success;
    }

    function getPeople(res) {
        var startRow = 1; // = row 2
        var initCol = 0,
            nameCol = 1;
        var sheetName = "People";
        var sheet, values, r;

        sheet = sheetFile.getSheetByName(sheetName);
        if (!sheet) {
            errString += (errString) ? "\n" : "";
            errString += "Cannot find sheet '" + sheetName + "'\n";
            return fail;
        }

        values = sheet.getDataRange().getValues();

        for (r = startRow; r < sheet.getLastRow(); r++) {

            if (values[r][initCol] == "") break; // Reached last person in sheet

            var person = {
                initials: values[r][initCol],
                fullname: values[r][nameCol]
            };

            res.push(person);
        }

        res.sort(function (a, b) {
            return a.fullname.localeCompare(b.fullname);
        });

        return success;
    }

    function getNewStories(tStories, tMeta) {
        var startYear = 2019;
        var endYear = new Date().getFullYear();
        var startRow = 1; // = row 2

        var dateCol = 0,
            pageCol = 1,
            titleCol = 4,
            authorCol = 5,
            personCol = 6,
            topicsCol = 15,
            linkCol = 7,
            onlineCol = 9;

        // These constant strings will be stripped from URLs to save space and I/O time
        var linkPrefix = /https:\/\/d(rive|ocs).google.com\/file\/d\//;
        var linkSuffix = /\/(view|edit)\?usp=sharing/;
        var onlinePrefix = "http://www.theleader.com.au/story/";

        var sheet, sheetName, values, r;

        for (var y = endYear; y >= startYear; y--) {
            sheetName = "Stories " + y;

            sheet = sheetFile.getSheetByName(sheetName);
            if (!sheet) {
                errString += (errString) ? "\n" : "";
                errString += "Cannot find sheet '" + sheetName + "'\n";
            }

            if (!errString) {
                values = sheet.getDataRange().getValues();

                for (r = startRow; r < sheet.getLastRow(); r++) {

                    if (values[r][dateCol] == "") break; // Reached last actual story in sheet, remaining rows are formulas only

                    var story = {
                        date: isoDateString(values[r][dateCol]),
                        page: values[r][pageCol],
                        title: values[r][titleCol],
                        author: values[r][authorCol],
                        person: values[r][personCol],
                        topics: values[r][topicsCol],
                        link: values[r][linkCol],
                        online: values[r][onlineCol]
                    };

                    // Strip constant URL sections to save time writing and reading JSON file
                    story.link = story.link.replace(linkPrefix, "");
                    story.link = story.link.replace(linkSuffix, "");
                    story.online = story.online.replace(onlinePrefix, "");

                    tStories.push(story);

                    if (story.link) { // Only stories with images can  be shared, so only they need metadata
                        var storyMeta = {
                            title: story.title,
                            author: story.author,
                            date: story.date,
                            page: story.page
                        };

                        tMeta[story.link] = storyMeta;
                    }
                }
            }
        }

        if (errString) {
            return fail;
        } else {
            tStories.sort(function (a, b) {
                if (a.date < b.date) return 1;
                if (a.date > b.date) return -1;
                return (a.page - b.page);
            });

            return success;
        }

        function isoDateString(s) {
            var d = s.getDate();
            if (d < 10) d = "0" + d;
            var m = s.getMonth() + 1;
            if (m < 10) m = "0" + m;
            var y = s.getFullYear();
            return y + "-" + m + "-" + d;
        }
    }

    function rtn(status) {
        var heading;
        switch (status) {
            case success:
                heading = "Newsclip updateWeb succeeded";
                msg = "Newsclip updateWeb finished " + new Date() + "\n";
                break;
            case fail:
                heading = "Newsclip updateWeb Error";
                msg = "Newsclip updateWeb failed " + new Date() + "\n\n" + errString;
                break;
            default:
                break;
        }
        if (mail) {
            MailApp.sendEmail(adminEmail, heading, msg);
        } else {
            Logger.log(heading);
            Logger.log(msg);
        }

    }

    function ObjectAssignPolyfill() {
        if (typeof Object.assign != 'function') {
          // Must be writable: true, enumerable: false, configurable: true
          Object.defineProperty(Object, "assign", {
            value: function assign(target, varArgs) { // .length of function is 2
              'use strict';
              if (target == null) { // TypeError if undefined or null
                throw new TypeError('Cannot convert undefined or null to object');
              }

              var to = Object(target);

              for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];

                if (nextSource != null) { // Skip over if undefined or null
                  for (var nextKey in nextSource) {
                    // Avoid bugs when hasOwnProperty is shadowed
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                      to[nextKey] = nextSource[nextKey];
                    }
                  }
                }
              }
              return to;
            },
            writable: true,
            configurable: true
          });
        }
      }

}
