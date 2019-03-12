/**
 * Runs the examples. This is not possible in package.json since we need the arguments passed to the command.
 * Based on this: https://github.com/kimmobrunfeldt/concurrently/issues/33#issuecomment-433084589
 */
const concurrently = require('concurrently')

const args = process.argv.slice(2);

concurrently(
  [
    { command: 'npm:watch-ts', prefixColor: 'blue', name: 'TypeScript Compilation' },
    { command: `nodemon dist/examples/${args[0]}.js`, prefixColor: 'magenta', name: 'Example' }
  ],
  {
    killOthers: ['failure', 'success']
  }
);
