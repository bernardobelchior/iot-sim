# node-red-contrib-test

## Known Issues

* The test flow tab *MUST* be after the original flow tab, since NodeRED will load the first tab first. Otherwise, the test would not work as the flow under test would not have been loaded when the tests were to start running.

## Desiderata

TODO: Introduction establishing we're using Node-RED. 

### Use Case 1: Create Mocks

Given a scenario where a room has a thermostat, window and heater, when the window is not open and the thermostat is reading a temperature below 18ºC, the heater should be turned on. It should be possible to mock the thermostat so that the temperature can be set for the purpose of testing. Achieving this will help test for various type of errors, e.g. when the temperature is 19ºC and the window is closed, the heater should remain turned off; when temperature is 17ºC and the window is closed, the heater should turn on, etc.

### Use Case 2: Create Spies

Reusing the scenario from Use Case 1, it should be possible to spy on the heater so that tests can verify the heater has been turned on/off. Using spies with mocks allows the create of unit and integration tests.

### Use Case 3: Unit Testing

Utilizing once again the scenario from Use Case 1, it should be possible to write a test to detect a possible logic error by injecting fake values into a component and spying its response, e.g. mock the heater to receive the temperature as 17ºC and window to be closed, then spy on it to verify if it has turned on. This construct can automate the finding of logic errors such as `temperature < 18` being confused with `temperature > 18`. 

### Use Case 4: Integration Testing

Still using the same scenario, it should be possible to write a test to detect integration problems by injecting fake values into the some components and spying the response from others, e.g. mock both the thermostat to display the temperature as 17ºC and the window to be closed, then spy the heater to verify if it has turned on. This construct can automate the finding of integration problems such as information not being sent, problems with components, unexpected formats, etc. 

### Use Case 5: Find Logic Errors

As mentioned briefly in Use Case 3, it should be possible to write a test to detect errors in the logic of the system, such as off-by-one (e.g., access past the end of an array) or the mixing of `>` with `<` in conditionals. 

### Use Case 6: Detect Physical Error

Given a scenario where a room has a switch connected to a lamp and a light sensor. It should be possible create a test to check if the switch or lamp are misbehaving by turning it on and asserting that the light level is the one expected when a light is turned on. This gives the user the ability to verify if physical devices are malfunctioning and, thus, fix the problem.

### Use Case 7: Generate Test Report

On a complex system refactors are scary as they can touch many parts of the codebase and possibly create problems. As such, when a refactor is done, it is useful to run all tests and aggregate their results by generating a summary with all failing tests including the location, so that bugs that were introduced during said refactor can be found and eliminated.

