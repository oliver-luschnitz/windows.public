// Task Executer Start Script

var shell = WScript.CreateObject("Wscript.Shell");
var cmd = "javaw -jar taskexecuter.jar";
var exec = shell.exec(cmd);
WScript.echo("Task Executer wurde gestartet.");
while (exec.status == 0) {
	WScript.sleep(1000);
}
WScript.echo("Task Executer wurde beendet:");
