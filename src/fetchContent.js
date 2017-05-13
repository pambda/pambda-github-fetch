import { request } from 'https';
import concat from 'concat-stream';

/*
 * Fetch contents from GitHub.
 */
export function fetchContent({ user, path, token, raw }, callback) {
  if (path[0] === '/') {
    path = path.substr(1);
  }

  const index = path.indexOf('/');

  const repo = path.substr(0, index);
  path = path.substr(index + 1);

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

  const req = request(options, res =>
    res.pipe(concat(data => callback(null, res, data)))
  );

  req
    .on('error', callback)
    .end();
}
