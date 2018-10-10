'use strict';

const fs = require('fs');
const url = require('url');
const util = require('util');
const fetch = require('node-fetch');
const execa = require('execa');
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

async function getStyle() {
  let style = '';
  if (process.env.NODE_ENV === 'development') {
    // not await intentionally
    execa('cp', ['template/style.css', 'build']);
    style = `<link rel="stylesheet" href="style.css" charset="utf-8">`;
  } else {
    const x = await readFile('template/style.css', 'utf8');
    style = `<style>${x}</style>`;
  }
  return style;
}

async function getScript() {
  return await readFile('template/script.js', 'utf8');
}

function getDateTime() {
  const t = new Date().toISOString();
  return `<time datetime="${t}">${t}</time>`;
}

function getTableOfSections(sectionAnchors) {
  let str = '';
  for (let i = 0; i < sectionAnchors.length; i++) {
    str += sectionAnchors[i];
  }
  return str;
}

function injectContent(templ, text) {
  return templ.replace(/\{\{content\}\}/, text);
}

async function render(templateFile, data) {
  let templ = await readFile(templateFile, 'utf8');
  const keys = Object.keys(data);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    templ = templ.replace(`{{${k}}}`, data[k]);
  }
  return templ;
}

async function genHTML(content) {
  const style = await getStyle();
  const script = await getScript();
  // sectionAnchors is a file level global
  const tos = getTableOfSections(sectionAnchors);
  const datetime = getDateTime();
  return render('template/template.html', {
    content,
    style,
    script,
    tos,
    datetime
  });
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
    const [content, _] = await Promise.all([genBlock(), prepare()]);
    // render
    const outputHTML = await genHTML(content);
    await writeFile('build/index.html', outputHTML, 'utf8');
  } catch (err) {
    debug(err);
    process.exit(-1);
  }
}

main();
