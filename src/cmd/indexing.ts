import { createCommand } from 'commander';
import {
  countToken,
  embedding,
  getGitHubRepo,
  save,
  splitDocuments,
} from '../lib/embedding';
import { material } from 'cli-spinners';
import ora from 'ora';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { storePath } from '../config';
import { join } from 'path';
import { withSpinner } from '../lib/logger';
import prompts from 'prompts';
import { existsSync } from 'fs';

export const indexCmd = createCommand('index');

indexCmd
  .description('Create index from GitHub repository')
  .argument('repos', 'Repository URL from GitHub')
  .option('-t, --token [token]', 'GitHub token')
  .option('-k, --key [key]', 'OpenAI API key')
  .option('-b, --branch [branch]', 'Target branch', 'main')
  .option('-r, --recursive', 'Fetch recursive', false)
  .action(async (args, options) => {
    const url = new URL(args);
    const savePath = join(storePath, url.pathname);
    const api = new OpenAIEmbeddings({
      openAIApiKey: options.key ?? process.env['OPENAI_API_KEY'],
      modelName: 'text-embedding-ada-002',
    });
    const logger = withSpinner(ora({ spinner: material }));

    const isExists = existsSync(savePath);
    const isContinue =
      isExists &&
      (await prompts({
        type: 'confirm',
        message: `"${args}" has already created Index. Do you want to create it again?`,
        name: 'isContinue',
      }));

    if (isContinue && !isContinue.isContinue) {
      return;
    }

    const repo = await logger('Fetch repository...', () =>
      getGitHubRepo(url, {
        accessToken: options.token ?? process.env['GITHUB_ACCESS_TOKEN'],
        branch: options.branch ?? 'main',
        recursive: options.recursive,
        unknown: 'warn',
      })
    );
    const docs = await logger('Splitting...', () => splitDocuments(repo));

    const count = countToken(docs);
    const { isRun } = await prompts({
      type: 'confirm',
      message: `It costs $${(count / 1000) * 0.0004}`,
      name: 'isRun',
    });

    if (isRun) {
      const store = await logger('Embedding...', () => embedding(api, docs));
      await logger('Saving...', () => save(savePath, store));
    } else {
      console.log('Interruption');
    }
  });
