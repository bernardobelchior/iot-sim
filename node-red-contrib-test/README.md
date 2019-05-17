# node-red-contrib-test

## Known Issues

* The test flow tab *MUST* be after the original flow tab, since NodeRED will load the first tab first. Otherwise, the test would not work as the flow under test would not have been loaded when the tests were to start running. TODO: Check if by injecting the message to the test runner this problem gets fixed.
* Only one Test Runner can be in one flow at a time. This is because otherwise the testDone() would be overriden otherwise. Possible fix: add the node ID to testDone to differentiate.
