import dotenv from 'dotenv';
import { existsSync, readdirSync } from 'fs';
import {createActor} from 'xstate';
dotenv.config();

function showExamples() {
  const exampleFiles = readdirSync('./examples', { withFileTypes: true });
  exampleFiles.forEach((file) => {
    if (file.isDirectory())  
     console.log(`- ${file.name}`);
  });
}

let exampleParams = process.argv.slice(2);
while (exampleParams.length === 0) {
  console.error('No example specified, you can choose from:');
  showExamples();
  let exampleParams = process.stdin.read();
  if (exampleParams) exampleParams = exampleParams.trim();
}

const exampleName = exampleParams[0];
const filePath = `@mono-agent/${exampleName}`;
  
try {
  const machine = require(require.resolve(filePath))
  const actor = createActor(machine);
  actor.subscribe((s) => {
    console.log(s.value, s.context);
  });
  actor.start();
}catch (e) {
  console.error(e);
}