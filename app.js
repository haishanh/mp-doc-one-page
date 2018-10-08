'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const debug = require('debug')('app');

const { groups } = require('./doc-groups');

const join = path.join;
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

async function getPage(url) {
  const res = await fetch(url, { timeout: 9000 });
  const text = await res.text();
  return text;
}

function parseTOC(baseURL, text) {
  const $ = cheerio.load(text);
  $('ul.summary li.divider').remove();
  $('.summary a').map((i, el) => {
    const relHref = $(el).attr('href');
    const absHref = join(baseURL, relHref);
    $(el).attr('href', absHref);
    // make link opened in new tab
    $(el).attr('target', '_blank');
  });

  return $.html('.summary');
}

async function injectStyle(templ) {
  let style = '';
  if (process.env.NODE_ENV === 'development') {
    style = `<link rel="stylesheet" href="style.css" charset="utf-8">`;
  } else {
    const x = await readFile('style.css', 'utf8');
    style = `<style>${x}</style>`;
  }
  return templ.replace(/\{\{style\}\}/, style);
}

function injectDateTime(templ) {
  const t = new Date().toISOString();
  const text = `<time datetime="${t}">${t}</time>`;
  return templ.replace(/\{\{datetime\}\}/, text);
}

function injectContent(templ, text) {
  return templ.replace(/\{\{content\}\}/, text);
}

async function render(content) {
  let templ = await readFile('template.html', 'utf8');
  templ = injectContent(templ, content);
  templ = await injectStyle(templ);
  templ = injectDateTime(templ);
  return templ;
}

async function genSection(item, idPrefix) {
  const { fetchURL, baseURL, title, id: idSuffix } = item;
  const id = idPrefix + idSuffix;
  const text = await getPage(fetchURL);
  let html = parseTOC(baseURL, text);
  html =
    `<div><h2 class="section-title" id="${id}">${title}</h2>` + html + '</div>';
  return html;
}

async function genBlock() {
  let html = '';
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    for (let j = 0; j < group.sections.length; j++) {
      const section = group.sections[j];
      const tmp = await genSection(section);
      if (!tmp || typeof tmp !== 'string') debug(tmp);
      html += tmp;
    }
  }
  return html;
}

async function main() {
  const html = await genBlock();
  // render
  const outputHTML = await render(html);
  const outputFileName = 'index' + '.html';
  await writeFile(outputFileName, outputHTML, 'utf8');
}

main();
