import {
  RecursiveCharacterTextSplitter,
  RecursiveCharacterTextSplitterParams,
  SupportedTextSplitterLanguage,
} from 'langchain/text_splitter';
import {getBaseClasses} from '../getBaseClasses';
import splitInput, {IPipe, IPipeContext} from "../SplitInput";

class CodeTextSplitter_TextSplitters implements IPipe {
  label: string;
  name: string;
  version: number;
  description: string;
  type: string;
  icon: string;
  category: string;
  baseClasses: string[];
  inputs=  [
      ...splitInput,
    {
      label: 'Language',
      name: 'language',
      type: 'options',
      options: [
        {
          label: 'cpp',
          name: 'cpp',
        },
        {
          label: 'go',
          name: 'go',
        },
        {
          label: 'java',
          name: 'java',
        },
        {
          label: 'js',
          name: 'js',
        },
        {
          label: 'php',
          name: 'php',
        },
        {
          label: 'proto',
          name: 'proto',
        },
        {
          label: 'python',
          name: 'python',
        },
        {
          label: 'rst',
          name: 'rst',
        },
        {
          label: 'ruby',
          name: 'ruby',
        },
        {
          label: 'rust',
          name: 'rust',
        },
        {
          label: 'scala',
          name: 'scala',
        },
        {
          label: 'swift',
          name: 'swift',
        },
        {
          label: 'markdown',
          name: 'markdown',
        },
        {
          label: 'latex',
          name: 'latex',
        },
        {
          label: 'html',
          name: 'html',
        },
        {
          label: 'sol',
          name: 'sol',
        },
      ],
    } 
  ];
  constructor() {
    this.label = 'Code Text Splitter';
    this.name = 'codeTextSplitter';
    this.version = 1.0;
    this.type = 'CodeTextSplitter';
    this.icon = 'codeTextSplitter.svg';
    this.category = 'Text Splitters';
    this.description = `Split documents based on language-specific syntax`;
    this.baseClasses = [
      this.type,
      ...getBaseClasses(RecursiveCharacterTextSplitter),
    ];
  }
  async init(nodeData: IPipeContext): Promise<any> {
    const chunkSize = nodeData.inputs?.chunkSize as string;
    const chunkOverlap = nodeData.inputs?.chunkOverlap as string;
    const language = nodeData.inputs?.language as SupportedTextSplitterLanguage;

    const obj = {} as RecursiveCharacterTextSplitterParams;

    if (chunkSize) obj.chunkSize = parseInt(chunkSize, 10);
    if (chunkOverlap) obj.chunkOverlap = parseInt(chunkOverlap, 10);

    return RecursiveCharacterTextSplitter.fromLanguage(language, obj);
  }
}
export default { nodeClass: CodeTextSplitter_TextSplitters };
