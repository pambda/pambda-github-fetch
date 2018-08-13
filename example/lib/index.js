const { compose, createLambda } = require('pambda');
const { aws } = require('pambda-aws');
const { errorhandler } = require('pambda-errorhandler');
const { render404 } = require('pambda-404');
const { binarySupport } = require('pambda-binary-support');
const { serveStatic } = require('pambda-serve-static');
const { checkenv } = require('lambda-checkenv');
const { logger } = require('pambda-logger');
const { githubFetch } = require('pambda-github-fetch');

checkenv({
  GITHUB_TOKEN: true,
  GITHUB_USER: true,
});

const LOCAL = process.env.AWS_SAM_LOCAL === 'true';

exports.handler = createLambda(
  compose(
    aws({
      xray: false,
    }),

    !LOCAL && logger(),

    errorhandler(),

    binarySupport({
      binaryMediaTypes: [ 'image/*' ],
    }),

    githubFetch({
      user: process.env.GITHUB_USER,
      token: process.env.GITHUB_TOKEN,
    }),

    serveStatic('public', {
      basePath: '/',
      index: [ 'index.htm', 'index.html' ],
    }),

    render404()
  )
);
