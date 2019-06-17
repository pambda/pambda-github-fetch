const mime = require('mime-types');
const { extname } = require('path');
const { fetchContent } = require('./fetchContent');
const { callbackify } = require('lambda-callbackify');
const { getCurrentUrl } = require('lambda-url-resolver');

const DEFAULT_PREAMBLE = `<!DOCTYPE HTML>
<html>
  <head>
    <meta charset="UTF-8">
  </head>
  <body>
`;

const DEFAULT_POSTAMBLE = `  </body>
</html>
`;

exports.githubFetch = (options = {}) => next => {
  next = callbackify(next);

  const {
    render,
    preamble,
    postamble,
    htmlExtensions = [
      '.htm', '.html',
      '.md', '.markdown',
      '.org',
    ],
    user = process.env.GITHUB_USER,
    token = process.env.GITHUB_TOKEN,
    renderIndex,
  } = options;

  return (event, context, callback) => {
    const {
      path,
    } = event;

    const ext = extname(path);
    const isHtml = htmlExtensions.includes(ext);
    const contentType = isHtml
      ? 'text/html; charset=utf-8'
      : (mime.contentType(ext) || 'application/octet-stream');

    /*
     * Fetch contents from GitHub.
     */
    const params = {
      user,
      path,
      token,
      raw: !isHtml,
    }

    fetchContent(params, (err, res, data) => {
      if (err) {
        return callback(err);
      }

      const { statusCode } = res;

      if (statusCode !== 200) {
        return next(event, context, callback);
      };

      /*
       * Response if a directory is fetched.
       */
      if (res.headers['content-type'].startsWith('application/json')) {
        if (!path.endsWith('/')) {
          return callback(null, {
            statusCode: 301,
            headers: {
              Location: getCurrentUrl(event) + '/',
            },
          });
        }

        if (!renderIndex) {
          return callback(null, {
            statusCode: 200,
            headers: {
              'Content-Type': res.headers['content-type'],
            },
            body: data.toString(),
          });
        }

        let indexJson;

        try {
          indexJson = JSON.parse(data.toString());
        } catch (err) {
          return callback(err);
        }

        return renderIndex(indexJson, options, event, context, callback);
      }

      /*
       * Make result.
       */
      const result = {
        body: data,
        headers: {
          'Content-Type': contentType,
        },
        statusCode,
      };

      /*
       * Modify HTML.
       */
      if (isHtml) {
        if (render) {
          return render(result, event, context, callback);
        }

        result.body = (preamble || DEFAULT_PREAMBLE)
          + result.body
          + (postamble || DEFAULT_POSTAMBLE);
      }

      /*
       * Respond.
       */
      callback(null, result);
    });
  };
};
