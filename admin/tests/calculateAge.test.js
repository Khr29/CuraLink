import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateAge } from "../src/utils/calculateAge.js";

const TODAY = new Date(2026, 9, 21); // 21 Oct 2026

test("calculateAge: whole years, before and after the birthday", () => {
  assert.equal(calculateAge("1994-03-15", TODAY), 32); // birthday already passed this year
  assert.equal(calculateAge("1994-12-01", TODAY), 31); // birthday still to come
  assert.equal(calculateAge("2000-10-21", TODAY), 26); // birthday is today
  assert.equal(calculateAge("2000-10-22", TODAY), 25); // birthday is tomorrow
});

test("calculateAge: nothing usable -> null, never NaN", () => {
  // "Not Selected" is the user model's default dob (backend/models/userModels.js).
  for (const dob of [undefined, null, "", "Not Selected", "garbage", {}, NaN]) {
    assert.equal(calculateAge(dob, TODAY), null, `dob=${JSON.stringify(dob)}`);
  }
});

test("calculateAge: a date of birth in the future -> null", () => {
  assert.equal(calculateAge("2030-01-01", TODAY), null);
});

test("calculateAge: defaults to the current date", () => {
  const thirtyYearsAgo = new Date().getFullYear() - 30;
  assert.ok([29, 30].includes(calculateAge(`${thirtyYearsAgo}-06-15`)));
});
