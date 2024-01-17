 import { getBaseClasses } from '../getBaseClasses';
import {
  RecursiveCharacterTextSplitter,
  RecursiveCharacterTextSplitterParams,
} from 'langchain/text_splitter';
 import {IPipe, IPipeContext} from "../SplitInput";

export class RecursiveCharacterTextSplitter_TextSplitters implements IPipe {
  label: string;
  name: string;
  version: number;
  description: string;
  type: string;
  icon: string;
  category: string;
  baseClasses: string[];
  inputs= [
    {
      label: 'Chunk Size',
      name: 'chunkSize',
      type: 'number',
      default: 1000,
      optional: true,
    },
    {
      label: 'Chunk Overlap',
      name: 'chunkOverlap',
      type: 'number',
      optional: true,
    },
    {
      label: 'Custom Separators',
      name: 'separators',
      type: 'string',
      rows: 4,
      description:
          'Array of custom separators to determine when to split the text, will override the default separators',
      placeholder: `["|", "##", ">", "-"]`,
      additionalParams: true,
      optional: true,
    },
  ];

  constructor() {
    this.label = 'Recursive Character Text Splitter';
    this.name = 'recursiveCharacterTextSplitter';
    this.version = 2.0;
    this.type = 'RecursiveCharacterTextSplitter';
    this.icon = 'textsplitter.svg';
    this.category = 'Text Splitters';
    this.description = `Split documents recursively by different characters - starting with "\\n\\n", then "\\n", then " "`;
    this.baseClasses = [
      this.type,
      ...getBaseClasses(RecursiveCharacterTextSplitter),
    ];
   }

  async init(nodeData:IPipeContext) {
    const chunkSize = nodeData.inputs?.chunkSize as string;
    const chunkOverlap = nodeData.inputs?.chunkOverlap as string;
    const separators = nodeData.inputs?.separators;

    const obj = {} as RecursiveCharacterTextSplitterParams;

    if (chunkSize) obj.chunkSize = parseInt(chunkSize, 10);
    if (chunkOverlap) obj.chunkOverlap = parseInt(chunkOverlap, 10);
    if (separators) {
      try {
        obj.separators =
          typeof separators === 'object' ? separators : JSON.parse(separators);
      } catch (e) {
        throw new Error(typeof e === 'string' ? e : JSON.stringify(e));
      }
    }

    return  new RecursiveCharacterTextSplitter(obj);
   }
}

export default { nodeClass: RecursiveCharacterTextSplitter_TextSplitters };
