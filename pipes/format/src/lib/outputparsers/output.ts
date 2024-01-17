import { BaseOutputParser } from 'langchain/schema/output_parser';

export function parse<T>(
  parser: BaseOutputParser<T>,
  completion: string
): Promise<T> {
  try {
    return parser.parse(completion);
  } catch (e) {
    throw new OutputParserError(
      e,
      'There was an issue parsing the response from the AI model.'
    );
  }
}

class OutputParserError implements Error {
  public summery: string;
  get name(): string  {
    return this.innerError?.name || "output-parsing-error";
  }
  get message(): string {
    return this.summery;
  }
  
  get details(): string | undefined {
    if (typeof this.inner === 'string') {
      return this.inner as string;
    } else {
      return this.innerError?.message;
    }
  }

  get stack(): string | undefined {
    return this.innerError?.stack;
  }
  
  public inner: Error | unknown;
  private get innerError(): Error | undefined {
    if (this.inner instanceof Error) {
      return this.inner;
    } else {
      return undefined;
    }
  }
  constructor(e: Error | unknown, message: string) {
    this.summery = message;
    this.inner = e;
  }
}
