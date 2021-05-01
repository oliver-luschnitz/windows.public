const urlParams = new URLSearchParams(window.location.search);

const url = urlParams.get('url');
var urldiv = document.getElementById("url");
urldiv.innerText = "Requested URL: " + url;

const data = urlParams.get('data');
oData = JSON.parse(data);

var enddiv;

if (!oData.error) {
    var div = document.getElementById("starterfehler");
    div.style = "display: none";
    div = document.getElementById("taskname");
    div.innerText = oData.name;
    div = document.getElementById("counter");
    div.innerText = oData.counter;
    div = document.getElementById("workingdir");
    div.innerText = oData.workingDir;
    div = document.getElementById("command");
    div.innerText = oData.command;
    div = document.getElementById("resulturi");
    div.innerText = oData.requestResultUri;
    enddiv = document.getElementById("end");
    enddiv.style.display = "none";
    div = document.getElementById("shutdown");
    div.onclick = function() {
        if (window.confirm("Youtube-Downloader wirklich beenden?")) {
            var req = new XMLHttpRequest();
            req.open('GET', oData.shutdownUri);
            req.onload = function() {
                var end = document.getElementById("end");
                if (req.responseText.toLowerCase() === "true") {
                    end.innerText = "Beendet."
                    window.setTimeout(function(){ window.close(); }, 500);
                } else {
                    end.innerText = "Programm konnte nicht beendet werden."
                }
            };
            req.send();
        }
    };

    setTimeout(function(){ requestResult(oData.requestResultUri); }, 500);

} else {
    var div = document.getElementById("startedInfo");
    div.style = "display: none";
    div = document.getElementById("starterfehler");
    div.innerText = oData.error;
}

function requestResult(uri) {
    var req = new XMLHttpRequest();
    req.open('GET', uri);
    req.onload = function () {
        var data = JSON.parse(req.responseText);
        var div = document.getElementById("stdout");

        if (data.stdout.length === 0) {
            getCounter(div, data);
        } else {
            div.innerHTML = "";
            var elem = document.createElement("div");
            getCounter(elem, data);
            div.appendChild(elem);
            data.stdout.forEach(line => {
                elem = document.createElement("div");
                elem.innerText = line;
                div.appendChild(elem);
            });
        }

        if (data.stderr.length > 0) {
            var errorcontainer = document.getElementById("errors")
            errorcontainer.style = "display: block";
            var err = document.getElementById("stderr");
            err.innerHTML = "";
            data.stderr.forEach(line => {
                var elem = document.createElement("div");
                elem.innerText = line;
                err.appendChild(elem);
            });
        }

        if (data.running) {
            setTimeout(function(){ requestResult(oData.requestResultUri); }, 1000);
        } else {
            enddiv.style.display = "block";
            var fc = div.firstChild;
            fc.innerText = `Beendet mit Exitcode ${data.exitCode}.`;
            fc.style = `color: ${data.exitCode === 0 ? 'blue' : 'red'}; font-weight: bold;`;
        }
        window.scrollTo(0,document.body.scrollHeight);
    };
    req.send();
}

function getCounter(parentElem, data) {
    parentElem.innerText = "";
    var elem1 = document.createElement("span");
    elem1.innerText = `Running (${data.requestCounter})`;
    parentElem.appendChild(elem1);
    if (data.percent) {
        var elem2 = document.createElement("span");
        elem2.innerText = ` ${data.percent}%`;
        parentElem.appendChild(elem2);
    }
}
