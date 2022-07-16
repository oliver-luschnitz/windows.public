var tasks;
var shutdownUri;
var tasksdiv;
var cmddiv;
var startdiv;
var configdiv;
var extraoptionsdiv;
var tooltipdiv;

var baseuri = "http://localhost:8080/ap/TaskExecution";

function getOptions() {
    var req = new XMLHttpRequest();
    req.open('GET', baseuri + "/config");
    req.onload = function () {
        var maindiv = document.getElementById("main");
        maindiv.style.display = "block";

        var errordiv = document.getElementById("error");
        errordiv.style.display = "none";

        var data = JSON.parse(req.responseText);
        tasks = data.taskList.Tasks;

        tasksdiv = document.getElementById("tasks");
        cmddiv = document.getElementById("cmd");
        startdiv = document.getElementById("start");
        configdiv = document.getElementById("showconfig");
        extraoptionsdiv = document.getElementById("extraoptionvalues");
        tooltipdiv = document.getElementById("optionsToolTip");

        shutdownUri = data.shutdownUri;
        fillTasksSelector();
        extraoptionsdiv.onmouseover = function() { showToolTip(); }
        extraoptionsdiv.onmousemove = function(e) {
            if (optionsToolTip.style.display == 'block') {
                x = (e.pageX ? e.pageX : window.event.x) + optionsToolTip.offsetParent.scrollLeft - optionsToolTip.offsetParent.offsetLeft;
                y = (e.pageY ? e.pageY : window.event.y) + optionsToolTip.offsetParent.scrollTop - optionsToolTip.offsetParent.offsetTop;
                optionsToolTip.style.left = (x + 20) + "px";
                optionsToolTip.style.top 	= (y + 20) + "px";
            }
        };
        extraoptionsdiv.onmouseout = function() { hideToolTip(); }
        startdiv.onclick = function() { startTask(); }
        setShutdownLink();
    };
    req.send();
}

function tasksdivOnChange() {
    cmddiv.onchange = null;
    cmddiv.innerHTML = "";
    chrome.storage.local.set({'task': tasksdiv.value});
    setConfigLink();
    fillCommandSelector(tasksdiv.value);
    setConfigLink();
}

function showHideExtraOptions() {
    extraoptionsdiv.onchange = null;
    extraoptionsdiv.value = "";
    var optionalParametersList = tasks[tasksdiv.value].OptionalParameters;
    if (optionalParametersList) {
        var optionalParameters = optionalParametersList[cmddiv.value];
        if (!optionalParameters) {
            extraoptionsdiv.style.display = "none";
        } else {
            extraoptionsdiv.style.display = "block";
            tooltipdiv.innerText = `Mögliche Parameter: ${optionalParameters}`;

            var prop = tasksdiv.value + "_extra";
            chrome.storage.local.get([prop], function(result) {
                if (result[prop]) {
                    extraoptionsdiv.value = result[prop];
                }
            });
            extraoptionsdiv.onchange = extraoptionsdivOnChange;
        }
    }
}

function extraoptionsdivOnChange() {
    var prop = tasksdiv.value + "_extra";
    var obj = {};
    obj[prop] = extraoptionsdiv.value;
    chrome.storage.local.set(obj);
}

function fillTasksSelector() {
    for (var i in tasks) {
        var displayNames = tasks[i].DisplayNames;
        if (!displayNames) displayNames = {};
        var e = document.createElement("option");
        e.value = i;
        var dn = displayNames["Task"]
        if (dn)
            e.innerText = dn;
        else
            e.innerText = i;
        tasksdiv.appendChild(e);
    }
    chrome.storage.local.get(['task'], function(result) {
        tasksdiv.value = result.task;
        setConfigLink();
        fillCommandSelector(tasksdiv.value);
    });
    tasksdiv.onchange = tasksdivOnChange;
}

function setConfigLink() {
    configdiv.href = `${baseuri}/${tasksdiv.value}/`
}

function cmddivOnChange() {
    var cmdProp = tasksdiv.value + "_cmd";
    var obj = {};
    obj[cmdProp] = cmddiv.value;
    chrome.storage.local.set(obj);
    showHideExtraOptions();
}

function fillCommandSelector(taskname) {
    cmddiv.innerHTML = "";
    if (taskname) {
        var cmdlines = tasks[taskname].Commandlines;
        var displayNames = tasks[taskname].DisplayNames;
        if (!displayNames) displayNames = {};
        for (var j in cmdlines) {
            var e2 = document.createElement("option")
            e2.value = j;
            var dn = displayNames[j]
            if (dn)
                e2.innerText = dn;
            else
                e2.innerText = j;
            cmddiv.appendChild(e2)
        }

        var cmdProp = tasksdiv.value + "_cmd";
        chrome.storage.local.get([cmdProp], function(result) {
            cmddiv.value = result[cmdProp];
            showHideExtraOptions();
        });

        cmddiv.onchange = cmddivOnChange;
    }
}

function setShutdownLink() {
    var div = document.getElementById("shutdown");
    div.href = "#";
    div.onclick = function() {
        if (window.confirm("Youtube-Downloader wirklich beenden?")) {
            div.href = shutdownUri;
            var maindiv = document.getElementById("main");
            maindiv.style.display = "none";
            var errordiv = document.getElementById("error");
            errordiv.style.display = "block";
            setTimeout(function(){ window.close(); }, 500);
        }
    };
};

function startTask() {
    var extraOptions = extraoptionsdiv.value.trim();
    if (extraOptions) {
        var lines = extraOptions.split("\n");
        for (var i = 0; i < lines.length; i++) {
            lines[i] = encodeURI(lines[i]);
        }
        extraOptions = lines.join("&");
    }
    var noTab = tasks[tasksdiv.value].NoTab;

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        var req = new XMLHttpRequest();
        req.open('GET', `${baseuri}/${tasksdiv.value}/${cmddiv.value}?URL=${activeTab.url}&${extraOptions}`);
        if (!noTab) {
            req.onload = function () {
                chrome.tabs.create({url:chrome.runtime.getURL(`result.html?url=${activeTab.url}&data=${encodeURI(req.responseText)}`)});
            };
        }
        req.onerror = function () {
            chrome.tabs.create({url:chrome.runtime.getURL("error.html")});
        };
        req.send();
    });
}

function showToolTip() {
    optionsToolTip.style.display = "block";
}

function hideToolTip() {
    optionsToolTip.style.display = "none";
}

getOptions();
