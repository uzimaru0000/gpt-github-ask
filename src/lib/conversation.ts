import { RetrievalQAChain } from 'langchain/chains';
import { BaseLLM } from 'langchain/llms';
import { VectorStore } from 'langchain/vectorstores';
import { Show, TypedError } from '../error';

type ConversationError = TypedError<'OPEN_AI', { err: unknown }>;

const openAiError = (err: unknown) =>
  ({
    type: 'OPEN_AI',
    err,
    show() {
      return (err as any).response.data.error as string;
    },
  } satisfies ConversationError & Show);

export const conversation = (vs: VectorStore, llm: BaseLLM) => {
  const retriever = vs.asRetriever(4);
  const chain = RetrievalQAChain.fromLLM(llm, retriever, {
    returnSourceDocuments: true,
  });

  return async (query: string) => {
    try {
      const res = await chain.call({ query });
      return res.text as string;
    } catch (e) {
      throw openAiError(e);
    }
  };
};
