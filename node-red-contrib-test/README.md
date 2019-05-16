# node-red-contrib-test

## Known Issues

* The test flow tab *MUST* be after the original flow tab, since NodeRED will load the first tab first. Otherwise, the test would not work as the flow under test would not have been loaded when the tests were to start running.

## Desiderata

TODO: Introduction establishing we're using Node-RED. 

### Use Case 1: Spy

Read the message from another node. By itself, the use case on its own is not very useful, but helps building the next ones. In conjunction with another nodes, it can be used to debug, assert or modify messages without altering the flow under test. 

Examples:
* Spy *Function* node to debug the result without altering the initial flow.

### Use Case 2: Assert

Assert the received value matches a pre-computed result. This use case is the core of a testing framework and relies on the previous use case to obtain values from the flow under test. 

Examples:
* Assert that a *Change* node changes values such as `undefined` or `null` as expected.

### Use Case 3: Await

Wait for a message to arrive. If it does, send the message; if a message does not arrive within a user specified timeout, send a message signaling the timeout has been reached. 

Examples:
* Wait 3s to make sure a message did not arrive.
* Wait for an asynchronous computation to finish within a given timeout.

### Use Case 4: Mock

Send values as if they were sent by a specific node. It is useful to mock nodes that are not easy to set up for testing, like emails, databases, etc. It can also be used to inject values that may find faults in the system.

Examples:
* Mock email node to act as if an email was received
* Insert an `undefined` where only numbers are expected.

### Use Case 5: Generate Test Report

Aggregate all assertions from all tests and generate a report detailing which tests failed, including the location and context of the failure. 

Examples:
* Run a whole test suite after a big refactor and obtain a report explaining where and why the tests failed.  

### Scenario 1

Imagine a scenario where the user wants to automatically open or close window blinds, when it is day or night, respectively.  

Sensors: 
* Light

Actuators:
* Smart Window Blinds

Let's say it is considered night, when light value <= 1 lux. The logic is simple:
```
If light <= 1 lux, then close blinds.
If light > 1 lux, then open blinds.
```


### Scenario 2

Imagine a scenario where the user wants to automatically open or close window blinds, when it is day or night, respectively. However, in a hot day, having blinds open will heat up the house, which is undesirable. The user places a temperature sensor outside the window.  

Sensors: 
* Light
* Temperature

Actuators:
* Smart Window Blinds

Like the scenario above, let's consider night, when light value <= 1 lux. Let's also say that the blinds should only open if the outside temperature is <= 25ºC. The logic is still simple:
```
If light <= 1 lux, then close blinds.
If light > 1 lux AND temperature <= 25ºC, then open blinds.
If light > 1 lux AND temperature > 25ºC, then close blinds.
```
