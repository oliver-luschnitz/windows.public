
var shell = WScript.CreateObject("WScript.Shell");
var fso = WScript.CreateObject("Scripting.FileSystemObject");

var logFilename = WScript.ScriptFullName + ".log";
var logFile = fso.openTextFile(logFilename, 8, true, -1);

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

if (!Number.prototype.fmt2) {
	Number.prototype.fmt2 = function() {
		if (this >= 0 && this < 10) return "0{0}".format(this);
		return "{0}".format(this);
	};
}

if (!Date.prototype.format) {
	Date.prototype.format = function() {
		var y = this.getFullYear();
		var m = this.getMonth();
		var d = this.getDate();
		var h = this.getHours();
		var M = this.getMinutes();
		var s = this.getSeconds();
		return "{0}-{1}-{2} {3}:{4}:{5}".format(y, m.fmt2(), d.fmt2(), h.fmt2(), M.fmt2(), s.fmt2());
	};
}

function log(message) {
	var msg = "{0} {1}".format(new Date().format(), message);
	logFile.WriteLine(msg);
}

log("Initialize configure script");
