const urlParams = new URLSearchParams(window.location.search);

const url = urlParams.get('url');
var urldiv = document.getElementById("url");
urldiv.innerText = "Requested URL: " + url;

const data = JSON.parse(urlParams.get('data'))
var rsltdiv = document.getElementById("output");
rsltdiv.innerText = JSON.stringify(data, null, 4);
