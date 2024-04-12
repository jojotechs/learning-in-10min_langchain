import { PineconeStore } from "@langchain/pinecone";
import { Pinecone } from "@pinecone-database/pinecone";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { pull } from "langchain/hub";
import { ChatPromptTemplate, PromptTemplate } from "langchain/prompts";
import { ScoreThresholdRetriever } from "langchain/retrievers/score_threshold";
import { RunnablePassthrough, RunnableSequence } from "langchain/runnables";
import { StringOutputParser } from "langchain/schema/output_parser";
import { DynamicStructuredTool, DynamicTool } from "langchain/tools";
import { formatDocumentsAsString } from "langchain/util/document";
import { z } from "zod";
import { EModelName, getChatModel, getEmbeddingModel } from "../common/model";

const pinecone = new Pinecone();

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

const loader = new CSVLoader(
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	process.env.RETRIEVAL_RESOURCE_CSV!,
);

const docs = await loader.load();

// console.log("Docs:\n", docs)
// 持久化文档数据到 Pinecone
// const pineconeStore = await PineconeStore.fromDocuments(docs, getEmbeddingModel(), {
//   pineconeIndex,
// });
const pineconeStore = await PineconeStore.fromExistingIndex(
	getEmbeddingModel(),
	{
		pineconeIndex,
	},
);

const retrieval_prompt = ChatPromptTemplate.fromMessages([
	[
		"system",
		`Use the following pieces of context to answer the question at the end.
  If you don't know the answer, just say that you don't know, don't try to make up an answer.
  ----------------
  {context}`,
	],
	["human", "{question}"],
]);

const chain = RunnableSequence.from([
	{
		context: pineconeStore.asRetriever({ k: 1 }).pipe(formatDocumentsAsString),
		question: new RunnablePassthrough(),
	},
	retrieval_prompt,
	getChatModel(EModelName.GPT_3),
	new StringOutputParser(),
]);

// const output = await chain.invoke("\"选择你要兑换的数量\"用印尼语怎么说")
// console.log(output)

const tools = [
	new DynamicTool({
		name: "GetCacheTranslateTool",
		description:
			"get the translation data from csv file and It will return the line similar to the input. You should ask translate xxxxxx to what language?",
		func: async (input: string) => {
			const output = await chain.invoke(input);
			return output;
		},
	}),
	new DynamicTool({
		name: "A Translate Professor",
		description:
			"一位专业的语言学家，对翻译的语言学知识有深入的理解，用于在获得翻译后调用以减少机器翻译的感觉，提升翻译质量。",
		func: async (input: string) => {
			const prompt = PromptTemplate.fromTemplate(
				"你是一位专业的语言学家，对翻译的语言学知识有深入的理解，负责减少机器翻译的感觉，提升翻译质量。请优化下面这段翻译，根据文意尽量使用符合人类阅读习惯的意译，使之更加流畅。\n{input}",
			);
			const output = await prompt
				.pipe(getChatModel(EModelName.GPT_4))
				.pipe(new StringOutputParser())
				.invoke({ input });
			return output;
		},
	}),
];

const agentPrompt = await pull<PromptTemplate>("hwchase17/react");

const agent = await createReactAgent({
	llm: getChatModel(EModelName.CLAUDE_3_HAIKU),
	tools,
	prompt: agentPrompt,
});

const agentExecutor = new AgentExecutor({
	agent,
	tools,
	verbose: true,
});

const result = await agentExecutor.invoke({
	input: '"选择你要兑换的数量"用印尼语怎么说',
});

console.log(result);
