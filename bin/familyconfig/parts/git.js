
var partname = "git";

function gotoGitRoot() {
	var folder = fso.GetFolder(".");
	while (!isGitRoot(folder)){
		if (folder.IsRootFolder) break;
		folder = folder.parentFolder;
	}
	if (isGitRoot(folder))
	{
		dir.pushd(folder.Path);
	}
}

function isGitRoot(fldr) {
	var e = new Enumerator(fldr.SubFolders);
	for (; !e.atEnd(); e.moveNext()) {
		var subfldr = e.item();
		if (subfldr.Name === ".git"){
			return true;
		}
	}
	return false;
}

function gitUpdate() {
	log("updating repository");
	var p = shell.exec("git pull");
	log("running process 'git' with id {0}".format(p.ProcessID));
	while (p.Status == 0) {
		WScript.Sleep(100);
	}
	var stdout = p.StdOut.ReadAll();
	log("Output: {0}".format(stdout.trim()));
	var stderr = p.StdErr.ReadAll().trim();
	if (stderr)	log("Errors: {0}".format(stderr));
	log("git updat finished with exit code {0}".format(p.ExitCode));
}
