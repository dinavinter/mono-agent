import type {Config} from 'jest';
 
export default async (): Promise<Config> => {
  return {
    transformIgnorePatterns: ["<rootDir>/node_modules/"],
    displayName: 'browser',
    testEnvironment: 'node',

    transform: {
      // "^.+\\.(t|j)sx?$": "@swc/jest"

      '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/agents/browser'
  };
};

 