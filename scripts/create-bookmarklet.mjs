/**
 * Script for generating Javacript bookmarklet for storing
 * links.
 *
 * Pass GITHUB_PERSONAL_ACCESS_TOKEN token to template, you
 * should never store the generated script in version control
 * system as it will contain the token.
 * The bookmarklet is to be used only in your local browser,
 * do not share it anywhere!
 *
 * Pass ORIGIN_URL which is path to page that contains form
 * for adding links and logic to make request to Github API.
 * It fall-backs to `localhost:1111` for development purposes.
 *
 * Outpath is a path to file containing code for the bookmarklet.
 * You should copy and paste it.
 */
import fs from 'fs';
import path from 'path';
import { cwd, env, exit, argv } from 'node:process';

const token = env.GITHUB_PERSONAL_ACCESS_TOKEN;
const originUrl = env.ORIGIN_URL;
const outPath = argv[2];

if (!outPath || !token) {
  console.info('Usage: GITHUB_PERSONAL_ACCESS_TOKEN=<token> node create-bookmarket.mjs <outPath>');
  exit(1);
}

const template = fs.readFileSync(path.join(cwd(), 'bookmarklet', 'template.mjs__templ__'))

const templateString = template.toString();

const templateStringWithToken = templateString
  .replace(/\<\%\= token \%\>/, `"${token}"`)
  .replace(/\<\%\= url \%\>/, `"${originUrl ?? 'http://localhost:1111/add_link'}"`);
const bookmarkletOutput = `javascript: ${templateStringWithToken}`;

fs.writeFileSync(outPath, bookmarkletOutput);
