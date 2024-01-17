import {Awaitable} from "vitest";

export default [
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

export  const separatorInput = {
    label: 'Custom Separator',
    name: 'separator',
    type: 'string',
    placeholder: `" "`,
    description:
        'Separator to determine when to split the text, will override the default separator',
    optional: true,
};



export type InferInput<IParams extends INodeParams[]> = ConditionalRequired<NodeType<IParams>> ;

type NodeType<IParams extends INodeParams[] = INodeParams[]>={
    [key in INodeParams[number]['name']]: IParams[number]['type']
}

export type ConditionalRequired<T extends NodeType<INodeParams[]> > = 
    T extends NodeType<infer Params> ?
         Partial<NodeType> & Required<Pick<T, RequiredParams<Params>>>
        :never;
 
export type RequiredParams<IParams extends INodeParams[] = INodeParams[] > = keyof IParams[number] extends {"optional": false} ? IParams[number]["name"]:never;

export type OptionalParams<IParams extends INodeParams[] = INodeParams[] > = keyof IParams[number] extends {"optional": true} ? IParams[number]["name"]:never;

export type Pipe<InputsParam extends INodeParams[] = INodeParams[],Input extends InferInput<InputsParam>= InferInput<InputsParam>, Output extends any = any>= {
    init(context: IPipeContext<Input>): Awaitable<Output> | Output;
    inputs?: InputsParam;
}
// export interface Pipe<P extends Pipe = Pipe, InputsParam extends INodeParams[] = INodeParams[],Input extends Record<string, any> = Record<string, any>, Output extends any = any> {
//     init: InferPipeFromClass<P>;
//     // init(context: IPipeContext<InferInput<InputsParam>>): Awaitable<Output> | Output;
//     inputs?: InputsParam;
// }


declare function pipe<Input extends Record<string, any>= Record<string, any>, Output extends  any =any>(context: IPipeContext<Input>): Output;

export type InferPipeFromClass<P extends Pipe>= P extends Pipe<infer InputsParam, infer Input, infer Output> ?  typeof pipe<Input, Output> : never;


export interface IPipe<InputsParam extends INodeParams[] = INodeParams[],Input extends Record<string, any> = Record<string, any>, Output extends any = any> {
    init(context: IPipeContext<InferInput<InputsParam>>): Awaitable<Output> | Output;
    inputs?: InputsParam;
    [key: string]: any;
}


export type INodeParams = {
    label?: string;
    name: string;
    type: string;
    optional?: boolean;
    default?: any;
    description?: string;
    placeholder?: string;
    valueOptions?: string[];
    datagrid?: any[];
    additionalParams?: boolean;
    flex?: number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    [key: string]: any;
};

export type IPipeContext<Input extends Record<string, any> = Record<string, any>> = {
    id: string
    credential?: string
    instance?: any
    loadMethod?: string // method to load async options
    inputs?: Input
};

 
export type IPipeInput = {
        chunkSize?: number
        chunkOverlap?: number
}