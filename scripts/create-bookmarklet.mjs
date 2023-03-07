(() => {
  const formatDateTimeLocal = (date) => {
    return [
      date.getFullYear(),
      '-',
      `${Math.min(date.getMonth() + 1, 12)}`.padStart(2, '0'),
      '-',
      `${date.getDate()}`.padStart(2, '0'),
      'T',
      `${date.getHours()}`.padStart(2, '0'),
      ':',
      `${date.getMinutes()}`.padStart(2, '0'),
    ].join('')
  }

  const getMetadataFromLdJson = () => {
    const script = document.querySelector('script[type="application/ld+json"]');

    if (!script || script.innerHTML.length === 0) {
      return null;
    }

    const parsed = JSON.parse(script.innerHTML);

    const author = Array.isArray(parsed.author)
      ? parsed.author[0]
      : parsed.author;

    return {
      authorName: author?.name ?? null,
      title: parsed.headline ?? null,
      url: parsed.url ?? null,
      siteName: parsed.publisher?.name ?? null,
      siteUrl: parsed.publisher?.url ?? null,
      publishedAt: parsed.datePublished ? new Date(parsed.datePublished) : null,
    }
  }

  const getData = () => {
    const json = getMetadataFromLdJson();

    const getPageTitle = () => {
      const title = document.title;

      return json?.title ?? title;
    }

    const getPageUrl = () => {
      return json?.url ?? window.location.href;
    }

    const getHostUrl = () => {
      const url = (new URL(window.location.href)).origin;

      return json?.siteUrl ?? url;
    }

    const getPublishedDate = () => {
      const metaPublishedAt = document.querySelector('meta[property="article:published_time"]')?.content;

      if (json?.publishedAt) {
        return json.publishedAt;
      }

      return metaPublishedAt ? new Date(metaPublishedAt) : undefined;
    }

    const getOriginTitle = () => {
      const metaTitle = document.querySelector('meta[property="og:site_name"]')?.content;

      return json?.siteName ?? json?.author ?? metaTitle;
    }

    const getPageTags = () => {
      const tagNodes = document.querySelectorAll('meta[property="article:tag"]');

      if (tagNodes.length === 0) {
        return [];
      }

      if (tagNodes.length === 1) {
        return tagNodes[0].content.split(',').map(v => v.trim());
      }

      return Array.from(tagNodes).map(node => node.content);
    }

    return {
      title: getPageTitle(),
      url: getPageUrl(),
      originUrl: getHostUrl(),
      originTitle: getOriginTitle(),
      publishedDate: getPublishedDate(),
      tags: getPageTags(),
    }
  }

  const initialData = getData();

  const win = window.open(window.location.href, '_blank', 'top=30, left=30, width=350, height=550');

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Add link to my web</title>
        <style>
          form {
            display: flex;
            flex-direction: column;
            padding: 10px;
          }
          input, textarea {
            margin-bottom: 15px;
            width: 100%;
          }
          form label {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
          }
          .controls {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 20px;
          }
          #reset {
            margin-right: 10px;
          }
        </style>
      </head>
      <body onload="onLoaded">
        <main>
          <form>
            <label>
              Title*
              <input required id="title" type="text" value="${initialData.title}" />
            </label>
            <label>
              URL*
              <input required id="url" type="url" value="${initialData.url}" />
            </label>
            <label>
              Publisher name
              <input id="originTitle" type="title" value="${initialData.originTitle}" />
            </label>
            <label>
              Publisher URL
              <input id="originUrl" type="url" value="${initialData.originUrl}" />
            </label>
            <label>
              Published at
              <input id="publishedDate" type="datetime-local" value="${initialData.publishedDate ? formatDateTimeLocal(initialData.publishedDate) : ""}" />
            </label>
            <label>
              Tags (comma-separated)
              <input id="tags" type="text" value="${initialData.tags.join(', ')}" />
            </label>
            <label>
              Your comment
              <textarea id="comment" value=""></textarea>
            </label>
            <div class="controls">
              <input id="reset" type="reset" value="Reset" />
              <input id="send" type="submit" value="Send" />
            </div>
          </form>
        </main>
        <script>
          const onLoaded = () => {
            console.info('Page loaded');
            document.body.style.background = "silver";
          };
        </script>
      </body>
    </html>
  `);
})()
