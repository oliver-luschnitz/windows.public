
log("Starting test part '{0}'".format(partname));
gotoGitRoot();
gitUpdate();
WScript.echo(shell.CurrentDirectory);
dir.popd();
dir.popd();
WScript.echo(shell.CurrentDirectory);
