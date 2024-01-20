# Agents Monorepo - Template
Monorepo to contains apps and agents

## Structure
### agents
Contains agents packages

### apps
Contains applications

### pipes
Output and input parsers

### tools
Common tools

## Development

### Prerequisites

```shell
npm i -g pnpm
npm i -g nx
```

### Install dependencies
```shell
pnpm i -r
```

### Build

Build all:
```shell
nx run-many -t build
```

Build specific project
```shell
nx <project>:build
```
For example
```shell
nx jstest:build
```

## Test

Test all:
```shell
nx run-many -t test
```

Build specific project
```shell
nx <project>:test
```
For example
```shell
nx jstest:test
```
## Create new agent
```shell
nx g lib tester --directory=agents/tester --buildable --publishable --importPath=@mono-agents/tester --projectNameAndRootFormat="as-provided" --simpleModuleName=true --unitTestRunne=none --compiler=swc
```
```shell
nx g @nx/js:lib <agent-name> --directory=agents/<agent-name>
```

## Create new app
```shell
nx g @nx/web:app <app-name> --directory=apps/<app-name>
```

## Create new pipe
```shell
nx g @nx/js:lib <pipe-name> --directory=pipes/<pipe-name>
```

## Create new tool
```shell
nx g @nx/js:lib <tool-name> --directory=tools/<tool-name>
```
