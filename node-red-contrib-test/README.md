# node-red-contrib-test

## Known Issues

* The test flow *MUST* be after the original flow, since NodeRED will load the original flow first. Otherwise, the test would not work as the flow under test would not be loaded.
