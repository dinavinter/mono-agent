import { sendbox } from 'sendbox';

describe('sendbox', () => {
  it('should work', async() => {
    const task = "Write a function that takes a list of strings and returns the longest string in the list."

    expect(await sendbox(task)).toEqual('sendbox');
  }, 1000000);
});
