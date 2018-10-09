'use strict';

const fs = require('fs');
const url = require('url');
const util = require('util');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const debug = require('debug')('app');
const withRetry = require('hs-with-retry');

const { groups } = require('./doc-groups');

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const rmdir = util.promisify(fs.rmdir);
const mkdir = util.promisify(fs.mkdir);

const sectionAnchors = [];

async function getPage(url) {
  const fn = () => fetch(url, { timeout: 9000 });
  const res = await withRetry({ attemptsTotal: 5, firstRetryDelay: 1000 })(fn);
  const text = await res.text();
  return text;
}

function parseTOC(baseURL, text) {
  const $ = cheerio.load(text);
  $('ul.summary li.divider').remove();
  $('.summary a').map((i, el) => {
    const relHref = $(el).attr('href');
    const absHref = url.resolve(baseURL, relHref);
    $(el).attr('href', absHref);
    // make link opened in new tab
    $(el).attr('target', '_blank');
  });

  return $.html('.summary');
}

async function injectStyle(templ) {
  let style = '';
  if (process.env.NODE_ENV === 'development') {
    style = `<link rel="stylesheet" href="../style.css" charset="utf-8">`;
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

function injectTableOfSections(templ, sectionAnchors) {
  let str = '';
  for (let i = 0; i < sectionAnchors.length; i++) {
    str += sectionAnchors[i];
  }
  return templ.replace(/\{\{tos\}\}/, str);
}

function injectContent(templ, text) {
  return templ.replace(/\{\{content\}\}/, text);
}

async function render(content) {
  let templ = await readFile('template.html', 'utf8');
  templ = injectContent(templ, content);
  templ = await injectStyle(templ);
  templ = injectTableOfSections(templ, sectionAnchors);
  templ = injectDateTime(templ);
  return templ;
}

async function genSection(item, idPrefix) {
  const { fetchURL, baseURL, title, id: idSuffix } = item;
  const id = idPrefix + '-' + idSuffix;
  const text = await getPage(fetchURL);
  let html = parseTOC(fetchURL, text);
  html = `<div class="section-title"><h2 id="${id}">${title}</h2></div>` + html;

  // side effect
  debug('section id: %s title: %s', id, title);
  sectionAnchors.push(`<a href="#${id}">${title}</a>`);

  return html;
}

async function genBlock() {
  let html = '<div class="blocks">';
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    for (let j = 0; j < group.sections.length; j++) {
      const section = group.sections[j];
      const tmp = await genSection(section, group.id);
      if (!tmp || typeof tmp !== 'string') debug(tmp);
      html += tmp;
    }
  }
  html += '</div>';
  return html;
}

async function prepare() {
  try {
    await mkdir('build');
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function main() {
  try {
    const [html, _] = await Promise.all([genBlock(), prepare()]);
    // render
    const outputHTML = await render(html);
    await writeFile('build/index.html', outputHTML, 'utf8');
  } catch (err) {
    debug(err);
    process.exit(-1);
  }
}

main();
