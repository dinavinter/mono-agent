import { getBaseClasses } from '../getBaseClasses';
import {
  TokenTextSplitter,
  TokenTextSplitterParams,
} from 'langchain/text_splitter';
import { TiktokenEncoding } from '@dqbd/tiktoken';
import {IPipe, IPipeContext} from "../SplitInput";

class TokenTextSplitter_TextSplitters implements IPipe {
  label: string;
  name: string;
  version: number;
  description: string;
  type: string;
  icon: string;
  category: string;
  baseClasses: string[];
  inputs=[
    {
      label: 'Encoding Name',
      name: 'encodingName',
      type: 'options',
      options: [
        {
          label: 'gpt2',
          name: 'gpt2',
        },
        {
          label: 'r50k_base',
          name: 'r50k_base',
        },
        {
          label: 'p50k_base',
          name: 'p50k_base',
        },
        {
          label: 'p50k_edit',
          name: 'p50k_edit',
        },
        {
          label: 'cl100k_base',
          name: 'cl100k_base',
        },
      ],
      default: 'gpt2',
    },
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
  ];

  constructor() {
    this.label = 'Token Text Splitter';
    this.name = 'tokenTextSplitter';
    this.version = 1.0;
    this.type = 'TokenTextSplitter';
    this.icon = 'tiktoken.svg';
    this.category = 'Text Splitters';
    this.description = `Splits a raw text string by first converting the text into BPE tokens, then split these tokens into chunks and convert the tokens within a single chunk back into text.`;
    this.baseClasses = [this.type, ...getBaseClasses(TokenTextSplitter)];
    
  }

  async init(nodeData: IPipeContext){
    const encodingName = nodeData.inputs?.['encodingName'] as string;
    const chunkSize = nodeData.inputs?.['chunkSize'] as string;
    const chunkOverlap = nodeData.inputs?.['chunkOverlap'] as string;

    const obj = {} as TokenTextSplitterParams;

    obj.encodingName = encodingName as TiktokenEncoding;
    if (chunkSize) obj.chunkSize = parseInt(chunkSize, 10);
    if (chunkOverlap) obj.chunkOverlap = parseInt(chunkOverlap, 10);

    return new TokenTextSplitter(obj);
   }
}

export default { nodeClass: TokenTextSplitter_TextSplitters };
