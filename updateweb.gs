// Get data for all Leader ecoNews stories from spreadsheet and save to JSON file
// for access by Leader ecoNews web page.
//
// This script should be run after spreadsheet is updated or edited,
// and can be scheduled to run each night to be sure.
//   
// Jonathan Doig jon@doig.net 15/2/2016

function updateWeb() {
    var sheetFileId = "18RO3nsWm1DzWVkDZ70GCRguPRZEpjWLZHOXqpr1EV1s";
    var jsonFileId = "0B4rKiNtdxe1Nd2ZtLUU2a3gxMEk";
    var adminEmail = "jonathan.doig@gmail.com, sarah.a.roxas@gmail.com";
    var success = 0;
    var fail = -1;
    var errString = "";
    var topics = [];
    var people = [];
    var stories = [];
    var mail = true;

    try {
        var sheetFile = SpreadsheetApp.openById(sheetFileId);
    } catch (e) {
        errString = "Cannot open spreadsheet with ID '" + sheetFileId + "'\n" +
            "Error: " + e.message + "\n";
    }

    try {
        var jsonFile = DriveApp.getFileById(jsonFileId);
    } catch (e) {
        errString += (errString) ? "\n" : "";
        errString += "Cannot open JSON file with ID '" + jsonFileId +
            "'\n" +
            "Error: " + e.message + "\n";
    }

    if (errString) {
        rtn(fail);
    };

    if (Math.min(
            getTopics(topics),
            getPeople(people),
            getStories(stories)) == fail) {

        rtn(fail);

    } else {

        jsonFile.setContent(
            "var topics  = " + JSON.stringify(topics) + ";" +
            "var people  = " + JSON.stringify(people) + ";" +
            "var stories = " + JSON.stringify(stories) + ";"
        );

        rtn(success);
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
        Logger.log("sheet is " + sheet);
        if (!sheet) {
            errString += (errString) ? "\n" : "";
            errString += "Cannot find sheet '" + sheetName + "'\n";
            Logger.log(errString);
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
            //            Logger.log(topic);
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
        Logger.log("sheet is " + sheet);
        if (!sheet) {
            errString += (errString) ? "\n" : "";
            errString += "Cannot find sheet '" + sheetName + "'\n";
            Logger.log(errString);
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
            // Logger.log(person);
        }

        res.sort(function (a, b) {
            return a.fullname.localeCompare(b.fullname);
        });

        return success;
    }

    function getStories(res) {
        var startYear = 2013;
        var endYear = new Date().getFullYear();
        var startRow = 1; // = row 2

        var dateCol = 0,
            pageCol = 1,
            titleCol = 4,
            authorCol = 5,
            personCol = 6,
            topicsCol = 14,
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
            Logger.log("sheetName is " + sheetName);
            if (!sheet) {
                errString += (errString) ? "\n" : "";
                errString += "Cannot find sheet '" + sheetName + "'\n";
                Logger.log(errString);
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

                    res.push(story);
                    // Logger.log(story);
                }
            }
        }

        if (errString) {
            return fail;
        } else {
            res.sort(function (a, b) {
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
                heading = "Newsclip getData succeeded";
                msg = "Newsclip getData finished " + new Date() + "\n";
                break;
            case fail:
                heading = "Newsclip getData Error";
                msg = "Newsclip getData failed " + new Date() + "\n\n" + errString;
                break;
            default:
                break;
        }
        if (mail) {
            MailApp.sendEmail(adminEmail, "Newsclip getData succeeded", msg);
        } else {
            document.getElementById("result").innerHTML =
                "<h2>" + heading + "/h2><p>" + msg + "<\p>";
        }

    }

}
