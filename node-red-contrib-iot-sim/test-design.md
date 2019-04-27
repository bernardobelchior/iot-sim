# Test Design

## Test Runner 

Test runner passes a "cmd": "run" message to the test to execute. The state is stored in the context of the flow. Whenever the test is done, the context changes a flag, and the next test can run. 
Initializes a helper from node-red-test-helper.

Questions: 
1. How to run a helper inside node-red? Right now, it doesn't work because node-red has a global called `started` that is set whenever an instance is started, so two instances cannot coexist. Possible solution: Do not use the node-red-test-helper, instead just use the actual node-red instance.  
1. How to deal with the mix of test and regular nodes? Possible solution: 
1. How to load the correct nodes?

## Mock

Mock node that mocks nodes from the flow under test. Works similarly to the Inject node, by sending specific messages. 

Questions:
1. How to remove the normal nodes being mocked? 
Probably by removing them from the flow and substituting them with another one.
1. How to send sequential messages? Maybe store the ID in the flow context.
