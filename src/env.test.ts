import { expect, test } from "bun:test";
import { z } from "zod";

test("url fields reject empty strings when emptyStringAsUndefined is true", () => {
  const schema = z.string().url();
  expect(() => schema.parse("")).toThrow();
  expect(() => schema.parse("http://localhost:3000")).not.toThrow();
});

test("flag enum accepts on|off only", () => {
  const flag = z.enum(["on", "off"]);
  expect(flag.parse("on")).toBe("on");
  expect(flag.parse("off")).toBe("off");
  expect(() => flag.parse("yes")).toThrow();
});
