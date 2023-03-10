import fs from 'fs';
import path from 'path';

(() => {
  const cleanArgument = arg => arg.replace(/-*/, '');
  const valueIsNotEmpty = value => value.length > 0;

  console.info(`processing arguments ${process.argv.slice(2)}`);

  const normalizedInput = process.argv.slice(2).reduce((argList, str) => {
    if (/\-\-.*\=.*/.test(str)) {
      return [ ...argList, str ];
    }

    const lastItem = argList[argList.length - 1];

    const copy = [ ...argList ];
    copy.splice(argList.length - 1, 1, `${lastItem} ${str}`);

    return copy;
  }, []);

  console.info(`normalized arguments ${normalizedInput.join(' ')}`);

  const options = normalizedInput.reduce((acc, str) => {
    const [ arg, value ] = str.split(/=/);

    switch (arg) {
      case '--title':
      case '--url':
      case '--originTitle':
      case '--originUrl':
      case '--comment':
        return { ...acc, [cleanArgument(arg)]: valueIsNotEmpty(value) ? value.trim() : null };
      case '--date':
      case '--publishedDate':
        return { ...acc, [cleanArgument(arg)]: valueIsNotEmpty(value) ? new Date(value) : null };
      case '--tags':
        return { ...acc, tags: valueIsNotEmpty(value) ? value.split(',').map(v => v.trim()) : [] };
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
        return [
          '[taxonomies]',
          'tech=[]',
        ];
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
    .replaceAll(/[$&+,:;=?@#|'"<>.^*()%!-]/g, '_')
    .replaceAll(/\s/g, '-')
    .toLowerCase()

  fs.writeFileSync(path.join('content', 'links', `${dateString}_${dashedName}.md`), fileContent);
})()
