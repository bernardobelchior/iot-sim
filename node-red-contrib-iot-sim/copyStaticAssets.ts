import * as shell from "shelljs";

shell.mkdir("-p", "dist/nodes/");
shell.cp("-R", "src/nodes/*.html", "dist/nodes");
