# gpt-github-ask

gpt-github-ask is a command-line interface (CLI) tool that allows you to ask questions about GitHub repositories using embeddings created from repository data.

## Usage

Before using gpt-github-ask, you need to set the environment variables GITHUB_ACCESS_TOKEN and OPENAI_API_KEY. Alternatively, you can create a .env file in the root directory of the project with the following content:

```
GITHUB_ACCESS_TOKEN=your-github-access-token
OPENAI_API_KEY=your-openai-api-key
```

## How to use

The gpt-github-ask repository provides a CLI tool that allows you to create embeddings by reading GitHub repositories, and use them to ask questions.

To use the index command, run the following command:

```
yarn start index [options] <repos>
```

Specify the GitHub repositories to index in <repos>.

The [options] parameter has the following options:

```
Options:
  -t, --token [token]    GitHub token
  -k, --key [key]        OpenAI API key
  -b, --branch [branch]  Target branch (default: "main")
  -r, --recursive        Fetch recursive (default: false)
  -h, --help             display help for command
```

To ask questions, run the following command:

```
yarn start ask [options] <repos>
```

Specify the GitHub repositories to ask questions in <repos>.

The [options] parameter has the following options:

```
Options:
  -k, --key [key]  OpenAI API key
  -h, --help       display help for command
```
