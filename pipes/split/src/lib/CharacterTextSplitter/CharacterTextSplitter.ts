 import { getBaseClasses } from '../getBaseClasses';
import {
  CharacterTextSplitter,
  CharacterTextSplitterParams,
} from 'langchain/text_splitter';
 import SplitInput, {IPipe, IPipeContext, separatorInput} from "../SplitInput";

 const inputs = [...SplitInput, separatorInput];
class CharacterTextSplitter_TextSplitters implements IPipe {
  label: string;
  name: string;
  version: number;
  description: string;
  type: string;
  icon: string;
  category: string;
  baseClasses: string[];
  inputs= inputs;

  constructor() {
    this.label = 'Character Text Splitter';
    this.name = 'characterTextSplitter';
    this.version = 1.0;
    this.type = 'CharacterTextSplitter';
    this.icon = 'textsplitter.svg';
    this.category = 'Text Splitters';
    this.description = `splits only on one type of character (defaults to "\\n\\n").`;
    this.baseClasses = [this.type, ...getBaseClasses(CharacterTextSplitter)];
   }

  async init(nodeData: IPipeContext): Promise<CharacterTextSplitterParams> {
    const separator = nodeData.inputs?.separator as string;
    const chunkSize = nodeData.inputs?.chunkSize as string;
    const chunkOverlap = nodeData.inputs?.chunkOverlap as string;

    const obj = {} as CharacterTextSplitterParams;

    if (separator) obj.separator = separator;
    if (chunkSize) obj.chunkSize = parseInt(chunkSize, 10);
    if (chunkOverlap) obj.chunkOverlap = parseInt(chunkOverlap, 10);

    const splitter = new CharacterTextSplitter(obj);

    return splitter;
  }
}

module.exports = { nodeClass: CharacterTextSplitter_TextSplitters };
