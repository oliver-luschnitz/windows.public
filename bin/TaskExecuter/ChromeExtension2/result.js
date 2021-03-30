var urlParams = new URLSearchParams(window.location.search);

var url = urlParams.get('url');
var urldiv = document.getElementById("url");
urldiv.innerText = "Requested URL: " + url;

const data = urlParams.get('data');
oData = JSON.parse(data);

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
            if (data.usePreTag) {
                elem = document.createElement("pre");
                elem.innerText = data.stdout.join('\n');
                div.appendChild(elem);
            } else {
                data.stdout.forEach(line => {
                    elem = document.createElement("div");
                    elem.innerText = line;
                    div.appendChild(elem);
                });
            }
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