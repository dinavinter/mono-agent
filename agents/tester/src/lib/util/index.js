import fs from 'fs';
// eslint-disable-next-line no-unused-vars
import colors from '@colors/colors';

const codeRegex = /```(.*)(\r\n|\r|\n)(?<code>[\w\W\n]+)(\r\n|\r|\n)```/;

export function preprocessJsonInput(text) {
  try {
    return text.match(codeRegex).groups.code.trim();
  } catch (e) {
    throw new Error('No code found');
  }
}
export {parseSite} from './page-parser.js';
const boilerPlate = `import { test, expect } from '@playwright/test';

test('generated test', async ({ page }) => {
`;

export function createTestFile({outputFilePath: filePath}) {
   fs.writeFileSync(filePath, boilerPlate.trim() + '\n');
}

export function createTestFileAsync({outputFilePath: filePath}) {
  
  return  new Promise((resolve, reject) => {
    fs.writeFile(filePath, boilerPlate.trim() + '\n', (err) => {
      if (err) {
        reject(err);
      }
      resolve(filePath);
    });
  });

 }

export const formatCode = ({code, task}) => {
  let formattedCode = `\t// ${task}\n`;
  // Split the code into lines and format each line
  const lines = code.split('\n');
  for (const line of lines) {
    formattedCode += `\t${line.trim()}\n`;
  }
  return formattedCode.append('\n');
};
export function appendToTestFileAsync({task, code, outputFilePath}) {
  return new Promise((resolve, reject) => {
    const formattedCode = formatCode({generatedCode: code, userInput: task});
    fs.appendFile(outputFilePath, formattedCode, 'utf8', (err) => {
      if (err) {
        reject(err);
      }
      resolve(outputFilePath);
    });
  });
}
 
  
export function appendToTestFile(userInput, generatedCode, filePath) {
  let formattedCode = `\t// ${userInput}\n`;

  // Split the code into lines and format each line
  const lines = generatedCode.split('\n');
  for (const line of lines) {
    formattedCode += `\t${line.trim()}\n`;
  }

  fs.appendFileSync(filePath, `${formattedCode}\n`, 'utf8');
}

export function completeTestFile(filePath) {
  fs.appendFileSync(filePath, '});', 'utf8');
}

export function gracefulExit(options) {
  if (options.outputFilePath) {
    completeTestFile(options.outputFilePath);
  }

  console.log('Exiting'.red);
}
