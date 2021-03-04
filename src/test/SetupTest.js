let consoleOutput;
const originalLogFunction = console.log;
beforeEach(function() {
  consoleOutput = '';
  console.log = (msg) => {
    consoleOutput += msg + '\n';
  };
});

afterEach(function() {
  console.log = originalLogFunction;
  if (this.currentTest.state === 'failed') {
    console.log("Log:");
    console.log(consoleOutput);
  }
}); 
