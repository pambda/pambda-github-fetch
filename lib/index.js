const mime = require('mime-types');
const { extname } = require('path');
const { fetchContent } = require('./fetchContent');
const { callbackify } = require('lambda-callbackify');

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

exports.githubFetch = (options = {}) => {
  const {
    render,
    preamble,
    postamble,
    htmlExtensions = [
      '.htm', '.html',
      '.md', '.markdown',
      '.org',
    ],
  } = options;

  return next => {
    next = callbackify(next);

    return (event, context, callback) => {
      const {
        user = process.env.GITHUB_USER,
        token = process.env.GITHUB_TOKEN,
      } = options;

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
};
