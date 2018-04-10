const test = require('tape');
const { githubFetch } = require('..');

test('test', t => {
  t.plan(2);

  const pambda = githubFetch({});

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
});
