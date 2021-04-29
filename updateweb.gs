// Read news stories and associated data from Google sheet and
// write two files for access by newsclip web app:
// * Javascript file with stories, topics and people. Read by HTML file to display stories for end-users
// * JSON file with story metadata. Read by PHP script to set meta tags for social media crawlers
//
// This script should be run after the spreadsheet is updated or edited.
//
// Jon Doig 15/2/2016
//
// Updated 29/4/21: Recreate the archive for previous years if missing.
// This can be used when moving the archive to a new Google Drive account.
// After moving The Leader folder to a new Google Drive, 

function updateWeb() {
    class Content {
      constructor(stories, meta) {
        this.stories = stories;
        this.meta = meta;
      }
    };
    var sheetFile, jsonFile, jsonMetaFile, jsonPrevMetaFile, jsonPrevStoriesFile;
    const mail = true;
    const adminEmail = "admin@example.com";
    const success = 0,
      fail = -1;
    var error = "";
  
    const dirName = "TheLeader_public";
  
    const pubDay = 3; // Paper is published each Wednesday
    const startYear = 2013;
    const thisYear = LastPaperPubDate().getFullYear();
  
    ObjectAssignPolyfill(); // Object.Assign() is not supported by Google App Script
  
    error = openFiles();
    if (error) {
      _return(fail);
    };
  
    // Read previous content from JSON files if available, otherwise from spreadsheet
    var prevContent = getPrevContent(startYear, thisYear - 1);
  
  // Try all these functions and if any fail, bail out with all error messages
    var topics = getTopicsFromSheets(),
      people = getPeopleFromSheets(),
      newContent = getContentFromSheets(thisYear,thisYear);
  
    if (error) _return(fail);
  
    var content = joinContent(newContent, prevContent);
  
    writeJsonToFiles(topics, people, content, jsonFile, jsonMetaFile);
  
    _return(success);
  
    function joinContent(c1, c2) {
      // Join previous data to new data
      var _content = new Content([],{});
      
      _content.stories = c1.stories.concat(c2.stories);
      _content.meta = Object.assign(c1.meta, c2.meta);
  
      return _content;
    };
  
    function writeJsonToFiles(_topics, _people, _content, _datafile, _metafile) {
      if (_topics || _people)
        _datafile.setContent(
          "{\"topiclist\":" + JSON.stringify(_topics) + "," +
          "\"people\":" + JSON.stringify(_people) + "," +
          "\"stories\":" + JSON.stringify(_content.stories) + "}"
        )
      else _datafile.setContent(JSON.stringify(_content.stories));
  
      _metafile.setContent(JSON.stringify(_content.meta));
    };
  
    function getPrevContent(_startYear, _lastYear) {
      // Read previous content from JSON files if available, otherwise from spreadsheet
      // If it's New Year, add last year's content to the prev-files
  
      var _prevContent = new Content([],{}),
        _yearContent = new Content([],{});
  
      // Open the latest prev-files available
      for (var year = _lastYear; year >= _startYear; year--) {
        error = openPrevFiles(_startYear, year);
        if (error) error = ""
        else {
          if (!mail) Logger.log("Reading JSON content for " + _startYear + "-" + year);
          _prevContent = readPrevFiles();
          break;
        }
      };
  
      // Create prev-files if none exist
      if (!jsonPrevStoriesFile) createPrevFiles(_startYear);
  
      //Get a year's content at a time and add it to the prev-files in case execution reaches runtime limit
      for (year = year + 1; year <= _lastYear; year++) {
        _yearContent = getContentFromSheets(year);
        _prevContent = joinContent(_yearContent, _prevContent);
        writeJsonToFiles(null, null, _prevContent, jsonPrevStoriesFile, jsonPrevMetaFile);
        if (!mail) Logger.log("Writing JSON archive for " + year);
        if (year != _startYear) renamePrevFiles(_startYear, year);
      };
  
      return _prevContent;
  
      function createPrevFiles(_fromYear, _toYear = _fromYear) {
        var dir = DriveApp.getFoldersByName(dirName).next();
  
        jsonPrevStoriesFile = dir.createFile("econews_stories_" + _fromYear + "-" + _toYear + ".json", '');
        jsonPrevMetaFile = dir.createFile("econews_meta_" + _fromYear + "-" + _toYear + ".json", '');
      }
  
      function openPrevFiles(_fromYear, _toYear = _fromYear) {
        var jsonPrevStoriesFileName = "econews_stories_" + _fromYear + "-" + _toYear + ".json",
          jsonPrevMetaFileName = "econews_meta_" + _fromYear + "-" + _toYear + ".json";
        var jsonPrevStoriesFileId = getIdFromName(jsonPrevStoriesFileName),
          jsonPrevMetaFileId = getIdFromName(jsonPrevMetaFileName);
  
        try {
          jsonPrevMetaFile = DriveApp.getFileById(jsonPrevMetaFileId);
        } catch (e) {
          error += (error) ? "\n" : "";
          error += "Cannot open JSON previous metadata file with ID '" + jsonPrevMetaFileId + "'\n" +
            "Error: " + e.message + "\n";
        }
  
        try {
          jsonPrevStoriesFile = DriveApp.getFileById(jsonPrevStoriesFileId);
        } catch (e) {
          error += (error) ? "\n" : "";
          error += "Cannot open JSON previous stories file with ID '" + jsonPrevStoriesFileId + "'\n" +
            "Error: " + e.message + "\n";
        }
  
        return error;
      }
  
      function renamePrevFiles(_fromYear, _toYear = _fromYear) {
        jsonPrevStoriesFile.setName("econews_stories_" + _fromYear + "-" + _toYear + ".json")
        jsonPrevMetaFile.setName("econews_meta_" + _fromYear + "-" + _toYear + ".json");
      }
  
      function readPrevFiles() {
  
        // This actually returns Blob not JSON
        _prevContent.stories = jsonPrevStoriesFile.getAs('application/json').getDataAsString();
        _prevContent.meta = jsonPrevMetaFile.getAs('application/json').getDataAsString();
  
        if (_prevContent.stories.length == 0 || _prevContent.meta.length == 0) {
          error = "Previous content file(s) are empty";
          _return(fail);
        }
  
        // Apparently no way around this conversion
        _prevContent.stories = JSON.parse(_prevContent.stories);
        _prevContent.meta = JSON.parse(_prevContent.meta);
  
        return _prevContent;
      }
      
    }
  
    function LastPaperPubDate() {
      var ms2Day = 1000 * 60 * 60 * 24;
      var today = new Date();
      var todayDay = today.getDay();
      if (todayDay < pubDay) todayDay = + 7;
      return new Date(today - (todayDay - pubDay) * ms2Day);
    }
  
    function getIdFromName(name) {
      var regex = /\/view\?usp=[a-z_]*/;
      var files = DriveApp.getFilesByName(name);
      var u;
      while (files.hasNext()) {
        var file = files.next();
        u = file.getUrl().replace(regex, "").match(/[-\w]{25,}/)[0];
      };
      return u;
    }
  
    function openFiles() {
      var sheetFileId = getIdFromName("Leader ecoNews - EDIT"),
        jsonFileId = getIdFromName("econews.json"),
        jsonMetaFileId = getIdFromName("econews_meta.json");
  
      try {
        sheetFile = SpreadsheetApp.openById(sheetFileId);
      } catch (e) {
        error = "Cannot open spreadsheet with ID '" + sheetFileId +
          "'\n" +
          "Error: " + e.message + "\n";
      }
  
      try {
        jsonFile = DriveApp.getFileById(jsonFileId);
      } catch (e) {
        error += (error) ? "\n" : "";
        error += "Cannot open JSON data file with ID '" + jsonFileId +
          "'\n" +
          "Error: " + e.message + "\n";
      }
  
      try {
        jsonMetaFile = DriveApp.getFileById(jsonMetaFileId);
      } catch (e) {
        error += (error) ? "\n" : "";
        error += "Cannot open JSON metadata file with ID '" + jsonMetaFileId +
          "'\n" +
          "Error: " + e.message + "\n";
      }
  
      return error;
    }
  
    // Perhaps these three functions could be one,
    // by passing all the differences as arguments...
    function getTopicsFromSheets() {
      var _topics = [];
      var startRow = 1; // = row 2
      var nameCol = 0,
        descCol = 1;
      var sheetName = "Topics";
      var sheet, values, r;
  
      sheet = sheetFile.getSheetByName(sheetName);
      if (!sheet) {
        error += (error) ? "\n" : "";
        error += "Cannot find sheet '" + sheetName + "'\n";
        return fail;
      };
  
      values = sheet.getDataRange().getValues();
  
      for (r = startRow; r < sheet.getLastRow(); r++) {
  
        if (values[r][nameCol] == "") break; // Reached last topic in sheet
  
        var topic = {
          name: values[r][nameCol],
          description: values[r][descCol]
        };
  
        _topics.push(topic);
      };
  
      _topics.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
  
      return _topics;
    }
  
    function getPeopleFromSheets() {
      var _people = [];
      var startRow = 1; // = row 2
      var initCol = 0,
        nameCol = 1;
      var sheetName = "People";
      var sheet, values, r;
  
      sheet = sheetFile.getSheetByName(sheetName);
      if (!sheet) {
        error += (error) ? "\n" : "";
        error += "Cannot find sheet '" + sheetName + "'\n";
        return;
      }
  
      values = sheet.getDataRange().getValues();
  
      for (r = startRow; r < sheet.getLastRow(); r++) {
  
        if (values[r][initCol] == "") break; // Reached last person in sheet
  
        var person = {
          initials: values[r][initCol],
          fullname: values[r][nameCol]
        };
  
        _people.push(person);
      }
  
      _people.sort(function (a, b) {
        return a.fullname.localeCompare(b.fullname);
      });
  
      return _people;
    }
  
    function getContentFromSheets(_fromYear, _toYear = _fromYear) {
      var _content = {
        stories: [],
        meta: {}
      };
      var startRow = 1; // = row 2
  
      const dateCol = 0,
        pageCol = 1,
        titleCol = 4,
        authorCol = 5,
        personCol = 6,
        topicsCol = 15,
        linkCol = 7,
        onlineCol = 9;
  
      // These constant strings will be stripped from URLs to save space and I/O time
      const linkPrefix = /https:\/\/d(rive|ocs).google.com\/file\/d\//;
      const linkSuffix = /\/(view|edit)\?usp=[a-z_]*/;
  
      var sheet, sheetName, values, r;
  
      for (var y = _fromYear; y <= _toYear; y++) {
        sheetName = "Stories " + y;
  
        sheet = sheetFile.getSheetByName(sheetName);
        if (!sheet) {
          error += (error) ? "\n" : "";
          error += "Cannot find sheet '" + sheetName + "'\n";
        }
  
        if (!error) {
          if (!mail) Logger.log("Reading sheet '" + sheetName + "'");
  
          values = sheet.getDataRange().getValues();
  
          for (r = startRow; r < sheet.getLastRow(); r++) {
  
            if (values[r][dateCol] == "") break; // Reached last actual story in sheet, remaining rows are formulas only
            else if ((r % 100) == 0 && (!mail)) Logger.log("  row " + r);
  
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
  
            _content.stories.push(story);
  
            if (story.link) { // Only stories with images can  be shared, so only they need metadata
              var storyMeta = {
                title: story.title,
                author: story.author,
                date: story.date,
                page: story.page
              };
  
              _content.meta[story.link] = storyMeta;
            }
          }
        }
  
        if (!mail) Logger.log("  last row: " + r);
      }
  
      if (error) return;
      else {
        _content.stories = sortStories(_content.stories);
  
        // _content.stories.sort(function (a, b) {
        //   if (a.date < b.date) return 1;
        //   if (a.date > b.date) return -1;
        //   return (a.page - b.page);
        // });
  
        return _content;
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
  
    function sortStories(_stories) {
      return _stories.sort(function (a, b) {
        if (a.date < b.date) return 1;
        if (a.date > b.date) return -1;
        return (a.page - b.page);
      });
    }
  
    function _return(status) {
      var heading;
      switch (status) {
        case success:
          heading = "Newsclip updateWeb succeeded";
          msg = "Newsclip updateWeb finished " + new Date() + "\n";
          break;
        case fail:
          heading = "Newsclip updateWeb Error";
          msg = "Newsclip updateWeb failed " + new Date() + "\n\n" + error;
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
  
      if (status == fail) throw new Error(error);
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
  