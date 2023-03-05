import fs from 'fs';
import path from 'path';

(() => {
  const cleanArgument = arg => arg.replace(/-*/, '');
  const options = process.argv.slice(2).reduce((acc, str) => {
    const [ arg, value ] = str.split(/=/);

    switch (arg) {
      case '--title':
      case '--url':
      case '--originTitle':
      case '--originUrl':
      case '--comment':
        return { ...acc, [cleanArgument(arg)]: value.trim() };
      case '--date':
      case '--publishedDate':
        return { ...acc, [cleanArgument(arg)]: new Date(value) };
      case '--tags':
        return { ...acc, tags: value.split(',').map(v => v.trim()) };
      default:
        return acc;
    }
  }, {
    title: null,
    date: null,
    url: null,
    tags: [],
    originTitle: null,
    originUrl: null,
    publishedDate: null,
    comment: null,
  });

  const dateString = [
    options.date.getFullYear(),
    `${Math.min(options.date.getMonth() + 1, 12)}`.padStart(2, '0'),
    `${options.date.getDate()}`.padStart(2, '0'),
  ].join('-');

  const fileContent = [
    '+++',
    `title = "${options.title}"`,
    `date = ${options.date.toISOString()}`,
    'template = "link.html"',
    ...(() => {
      if (!options.tags.length) {
        return [];
      }

      return [
        '[taxonomies]',
        `tech=${JSON.stringify(options.tags)}`
      ];
    })(),
    '[extra]',
    `link_url = "${options.url}"`,
    ...(() => {
      if (!options.originTitle) {
        return [];
      }

      return [
        `origin_title = "${options.originTitle}"`,
      ];
    })(),
    ...(() => {
      if (!options.originUrl) {
        return [];
      }

      return [
        `origin_url = "${options.originUrl}"`,
      ];
    })(),
    ...(() => {
      if (!options.publishedDate) {
        return [];
      }

      return [
        `published_date = "${options.publishedDate.toISOString()}"`,
      ];
    })(),
    '+++',
    ...(() => {
      if (!options.comment) {
        return [];
      }

      return [
        '\n',
        options.comment,
      ];
    })(),
  ].join('\n');

  const dashedName = options.title
    .slice(0, 50)
    .replaceAll(/ /g, '-')
    .replaceAll(/'/g, '')
    .toLowerCase()

  fs.writeFileSync(path.join('content', 'links', `${dateString}_${dashedName}.md`), fileContent);
})()
