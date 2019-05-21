import * as shell from "shelljs";

const files = shell
  .find("src/nodes")
  .filter(file => file.match(/\.html$/))
  .map(file => [file, file.replace(/^src/, "dist")]);

/* Obtains the path to file
 * Input: `/dist/nodes/test-runner/test-runner.html`
 * Matches: `/test-runner.html` */
const dirRegex = /\/([^\/]*?)\.html$/;

const dirsToCreate = new Set(
  files.map(([_, dst]) => dst.replace(dirRegex, ""))
);

shell.mkdir("-p", Array.from(dirsToCreate));

files.forEach(([src, dst]) => shell.cp(src, dst));
