import { sandbox } from 'sandbox';

describe('sandbox', () => {
  it('should work', async() => {
    const task = "Write a function that takes a list of strings and returns the longest string in the list."

    expect(await sandbox(task)).toEqual('sandbox');
  }, 1000000);
});
