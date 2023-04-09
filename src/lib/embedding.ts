import { TokenTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';
import {
  GithubRepoLoader,
  GithubRepoLoaderParams,
} from 'langchain/document_loaders';
import { HNSWLib, SaveableVectorStore } from 'langchain/vectorstores';
import { Embeddings } from 'langchain/embeddings';
import { Show, TypedError } from '../error';
import { Tiktoken } from '@dqbd/tiktoken';
import { encoding_for_model } from '@dqbd/tiktoken';

type EmbedError =
  | TypedError<'INVALID_URL', { url: URL }>
  | TypedError<'FAILED_LOAD'>
  | TypedError<'OTHER', { err: Error }>;

const invalidUrlError = (url: URL) =>
  ({
    type: 'INVALID_URL',
    url,
    show: () => {
      return `Invalid URL for ${url.toString()}`;
    },
  } satisfies EmbedError & Show);
const failedLoadError = () =>
  ({
    type: 'FAILED_LOAD',
    show: () => {
      return 'Failed to load';
    },
  } satisfies EmbedError & Show);
const otherError = (err: Error) =>
  ({
    type: 'OTHER',
    err,
    show: () => {
      return err.message;
    },
  } satisfies EmbedError & Show);

export const getGitHubRepo = (repo: URL, opts?: GithubRepoLoaderParams) => {
  if (repo.hostname !== 'github.com') {
    throw invalidUrlError(repo);
  }

  const loader = new GithubRepoLoader(repo.toString(), opts);
  return loader.load().catch((err) => {
    throw otherError(err);
  });
};

export const splitDocuments = (docs: Document[]) => {
  const splitter = new TokenTextSplitter({
    encodingName: 'gpt2',
    chunkSize: 500,
  });

  return splitter.splitDocuments(docs).catch((err) => {
    throw otherError(err);
  });
};

export const countToken = (docs: Document[]) => {
  const tokenizer = encoding_for_model('text-embedding-ada-002');
  try {
    return docs.reduce((acc, x) => {
      const tokens = tokenizer.encode(x.pageContent).length;
      return acc + tokens;
    }, 0);
  } finally {
    tokenizer.free();
  }
};

export const embedding = (embeddings: Embeddings, docs: Document[]) => {
  return HNSWLib.fromDocuments(docs, embeddings).catch((err) => {
    throw otherError(err);
  });
};

export const save = (path: string, vs: SaveableVectorStore) => {
  return vs.save(path).catch((err) => {
    throw otherError(err);
  });
};

export const loadStore = (path: string, embeddings: Embeddings) => {
  return HNSWLib.load(path, embeddings).catch(() => {
    throw failedLoadError();
  });
};
