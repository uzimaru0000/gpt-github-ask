import { createCommand } from 'commander';
import ora from 'ora';
import { loadStore } from '../lib/embedding';
import { storePath } from '../config';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { conversation } from '../lib/conversation';
import { OpenAI } from 'langchain/llms';
import prompts from 'prompts';
import { join } from 'path';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';
import { isImplementsShow } from '../error';

marked.setOptions({
  renderer: new TerminalRenderer(),
});

export const askCmd = createCommand('ask');

askCmd
  .description('Ask about Repository')
  .argument('repos', 'Repository URL from GitHub')
  .option('-k, --key [key]', 'OpenAI API key')
  .action(async (repo, options) => {
    const url = new URL(repo);
    const logger = ora();
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: options.key ?? process.env['OPENAI_API_KEY'],
    });
    const llm = new OpenAI({
      openAIApiKey: options.key ?? process.env['OPENAI_API_KEY'],
      maxTokens: 2000,
    });

    try {
      logger.start('Loading embedding store');
      const store = await loadStore(join(storePath, url.pathname), embeddings);
      logger.succeed();

      const assistant = conversation(store, llm);
      const assistantWithLogger = async (query: string) => {
        logger.start('Thinking...');
        return assistant(query);
      };

      for await (const output of repl(assistantWithLogger)) {
        logger.succeed();
        console.log(marked(output));
      }
    } catch (e) {
      if (isImplementsShow(e)) {
        logger.fail(e.show());
      } else {
        logger.fail('failed');
      }
    }
  });

async function* repl(assistant: (query: string) => Promise<string>) {
  const fun = rep(assistant);
  for (;;) {
    yield await fun();
  }
}

const rep = (assistant: (query: string) => Promise<string>) => async () => {
  const input = await prompts({
    name: 'ask',
    type: 'text',
    message: 'Question',
  });

  if (input.ask) {
    return assistant(input.ask);
  } else {
    throw { type: 'INPUT', err: 'exit' };
  }
};
