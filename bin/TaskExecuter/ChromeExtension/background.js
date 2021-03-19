// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

chrome.browserAction.onClicked.addListener(function(tab) {
    var req = new XMLHttpRequest();
    req.open('GET', `http://localhost:8080/ap/TaskExecution/ytdl/mp3256?URL=${tab.url}`);
    req.onload = function () {
        chrome.tabs.create({url:chrome.extension.getURL(`result.html?url=${tab.url}&data=${encodeURI(req.responseText)}`)});
    };
    req.onerror = function () {
        chrome.tabs.create({url:chrome.extension.getURL("error.html")});
    };
    req.send();
});
