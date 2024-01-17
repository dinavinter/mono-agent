import {getBaseClasses} from '../getBaseClasses';
import {MarkdownTextSplitter, MarkdownTextSplitterParams,} from 'langchain/text_splitter';
import splitInput, {IPipe, IPipeContext} from "../SplitInput";

class MarkdownTextSplitter_TextSplitters implements IPipe {
  label: string;
  name: string;
  version: number;
  description: string;
  type: string;
  icon: string;
  category: string;
  baseClasses: string[];
  inputs= splitInput;

  constructor() {
    this.label = 'Markdown Text Splitter';
    this.name = 'markdownTextSplitter';
    this.version = 1.0;
    this.type = 'MarkdownTextSplitter';
    this.icon = 'markdownTextSplitter.svg';
    this.category = 'Text Splitters';
    this.description = `Split your content into documents based on the Markdown headers`;
    this.baseClasses = [this.type, ...getBaseClasses(MarkdownTextSplitter)];
     
  }
  
  

   async init({inputs}: IPipeContext): Promise<MarkdownTextSplitterParams> {
    const chunkSize = inputs?.chunkSize;
    const chunkOverlap = inputs?.chunkOverlap;
    const obj = {} as MarkdownTextSplitterParams;
    if (chunkSize) obj.chunkSize = parseInt(chunkSize, 10);
    if (chunkOverlap) obj.chunkOverlap = parseInt(chunkOverlap, 10);
    return new MarkdownTextSplitter(obj);
  }
  
  
}

export default {nodeClass: MarkdownTextSplitter_TextSplitters };

function markdown(nodeData: IPipeContext) {
  const chunkSize = nodeData.inputs?.chunkSize as string;
  const chunkOverlap = nodeData.inputs?.chunkOverlap as string;
  const obj = {} as MarkdownTextSplitterParams;
  if (chunkSize) obj.chunkSize = parseInt(chunkSize, 10);
  if (chunkOverlap) obj.chunkOverlap = parseInt(chunkOverlap, 10);
  return new MarkdownTextSplitter(obj);
} 