const { request } = require('https');

/*
 * Fetch contents from GitHub.
 */
function fetchContent({ user, path, token, raw }, callback) {
  if (!user) {
    return callback(new Error('`options.user` must be specified'));
  }

  if (!token) {
    return callback(new Error('`options.token` must be specified'));
  }

  if (path[0] === '/') {
    path = path.substr(1);
  }

  const index = path.indexOf('/');

  const repo = path.substr(0, index);
  path = path.substr(index + 1);

  if (path.endsWith('/')) {
    path = path.substr(0, path.length - 1);
  }

  const options = {
    hostname: 'api.github.com',
    path: `/repos/${user}/${repo}/contents/${path}`,
    headers: {
      Accept: raw ? 'application/vnd.github.v3.raw' : 'application/vnd.github.v3.html',
      Authorization: `token ${token}`,
      Host: 'api.github.com',
      'User-Agent': 'pambda-github-fetch',
    },
  };

  const req = request(options, res => callback(null, res));

  req
    .on('error', callback)
    .end();
}

function getBody(res, callback) {
  const data = [];

  res
    .on('data', chunk => data.push(chunk))
    .on('error', callback)
    .on('end', () => {
      callback(null, Buffer.concat(data));
    });
}

/*
 * Exports.
 */
exports.fetchContent = fetchContent;
exports.getBody = getBody;
