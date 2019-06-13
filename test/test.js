const test = require('tape');
const { githubFetch } = require('..');

test('test', t => {
  t.plan(5);

  const pambda = githubFetch({
    user: 'pambda',
  });

  const lambda = pambda((event, context, callback) => {
    callback(null, {
      statusCode: 404,
    });
  });

  lambda({
    path: '/',
  }, {}, (err, result) => {
    t.error(err);
    t.equal(result.statusCode, 404);
  });

  lambda({
    path: '/pambda-github-fetch/README.md',
  }, {}, (err, result) => {
    t.error(err);
    t.equal(result.statusCode, 200);
    t.ok(result.headers['Content-Type'].startsWith('text/html'));
  });
});
