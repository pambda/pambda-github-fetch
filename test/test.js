const test = require('tape');
const { githubFetch } = require('..');

test('test', t => {
  t.plan(9);

  const pambda = githubFetch({
    user: 'pambda',
    renderIndex: (indexJson, options, event, context, callback) => {
      const entries = indexJson.map(entry => entry.name);

      callback(null, {
        statusCode: 200,
        body: entries,
      });
    },
  });

  const lambda = pambda((event, context, callback) => {
    callback(null, {
      statusCode: 404,
    });
  });

  lambda({
    path: '/',
    headers: {},
  }, {}, (err, result) => {
    t.error(err);
    t.equal(result.statusCode, 404);
  });

  lambda({
    path: '/pambda-github-fetch/README.md',
    headers: {},
  }, {}, (err, result) => {
    t.error(err);
    t.equal(result.statusCode, 200);
    t.ok(result.headers['Content-Type'].startsWith('text/html'));
  });

  lambda({
    path: '/pambda-github-fetch/lib',
    headers: {},
  }, {}, (err, result) => {
    t.error(err);
    t.equal(result.statusCode, 301);
  });

  lambda({
    path: '/pambda-github-fetch/lib/',
    headers: {},
  }, {}, (err, result) => {
    t.error(err);
    t.equal(result.statusCode, 200);
    console.dir(result);
  });
});
