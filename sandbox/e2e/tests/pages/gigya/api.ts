import {expect, Response} from '@playwright/test';

export async function  expectOk(response: Response) {
  expect(response.ok()).toBeTruthy();
  const body= await response.json();
  expect.soft(body.statusCode).toBe(200);
}