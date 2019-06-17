# pambda-github-fetch

[Pambda](https://github.com/pambda/pambda) to render GitHub contents.

## Installation

```
npm i pambda-github-fetch
```

## Usage

``` javascript
const { compose, createLambda } = require('pambda');
const { binarySupport } = require('pambda-binary-support');
const { cache } = require('pambda-cache');
const { githubFetch } = require('pambda-github-fetch');

exports.handler = createLambda(
  compose(
    cache(),
    binarySupport(),
    githubFetch({
      user: 'GITHUB_USER',
      token: 'GITHUB_TOKEN',
      render(data, event, context, callback) {
        //  Modify data if needed.

        callback(null, data);
      },
      preamble: '<html><body>',
      postamble: '</body></html>',
      htmlExtensions: [
        '.htm', '.html',
        '.md', '.markdown',
      ],
    })
  )
);
```

## githubFetch(options)

- `options.user`
    - An user ID of GitHub.
    - Default: `process.env.GITHUB_USER`
- `options.token`
    - A token to use GitHub API.
    - Default: `process.env.GITHUB_TOKEN`
- `options.render`
    - A function to modify HTML contents.
    - The form of this function is `(result, event, context, callback)`.
- `options.renderIndex`
    - A function to render index pages.
    - The form of this function is `(indexJson, options, event, context, callback)`.
- `options.preamble`
    - A string is inserted at the head of HTML contents.
    - This option is ignored if `render` is specified.
- `options.postamble`
    - A string is added to HTML contents.
    - This option is ignored if `render` is specified.
- `options.htmlExtensions`
    - Extensions of files rendering as HTML contents.

## License

MIT
