import { type Response, type Expect, expect} from '@playwright/test';

export async function expectOk(response: Response, expectF: Expect | Expect["soft"]= expect ) {
  expect(response.ok()).toBeTruthy();
  const body= await response.json();
  expectF(body.statusCode).toBe(200);
}

export async function statusCode(response: Response) {
   const body= await response.json();
   return body.statusCode;
}