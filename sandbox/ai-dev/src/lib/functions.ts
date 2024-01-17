import {AssistantCreateParams} from 'openai/src/resources/beta/assistants/assistants';

export const functions: Array<
    | AssistantCreateParams.AssistantToolsCode
    | AssistantCreateParams.AssistantToolsRetrieval
    | AssistantCreateParams.AssistantToolsFunction
> =[
    {
        type: 'function',
        function: {
            name: 'saveContentToFile', // Updated action name
            description: 'Save content (code or text) to file',
            parameters: {
                type: 'object',
                properties: {
                    content: {
                        type: 'string',
                        description: 'The content to save',
                    },
                    filename: {
                        type: 'string',
                        description: 'The filename including the path and extension',
                    },
                },
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'writeToFile', // Updated action name
            description: 'Write text or other content to a file',
            parameters: {
                type: 'object',
                properties: {
                    content: {
                        type: 'string',
                        description: 'The content to save',
                    },
                    filename: {
                        type: 'string',
                        description: 'The filename including the path and extension',
                    },
                },
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'listFiles',
            description: 'List files in a directory',
            parameters: {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'The path to the directory',
                    },
                },
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'readFile',
            description: 'Read a file',
            parameters: {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'The path to the file',
                    },
                },
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'commitAndPush',
            description: 'Commit and push changes to the repository',
            parameters: {
                type: 'object',
                properties: {
                    commitMessage: { // Updated parameter name
                        type: 'string',
                        description: 'The commit message',
                    },
                },
            },
        },
    },
]
export default functions;