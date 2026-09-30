import next from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  { ignores: [".next/**", "node_modules/**", "scrape/**", "next-env.d.ts"] },
  ...next,
  ...nextTs,
];

export default config;
