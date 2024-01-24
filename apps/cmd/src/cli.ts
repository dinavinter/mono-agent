import {createActor} from 'xstate';


let exampleParams = process.argv.slice(2);
while (exampleParams.length === 0) {
  console.error('No example specified, you can choose from:');
  let exampleParams = process.stdin.read();
  if (exampleParams) exampleParams = exampleParams.trim();
}

const exampleName = exampleParams[0];
const filePath = `@mono-agent/${exampleName}`;
  
try {
  // const machine = require(require.resolve(filePath))
  const {defult:machine} = await import(filePath) ;
  const actor = createActor(machine);
  actor.subscribe((s) => {
    console.log(s.value, s.context);
  });
  actor.start();
}catch (e) {
  console.error(e);
}