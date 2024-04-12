import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

// 一些亲测比较好用的模型
export enum EModelName {
	GPT_3 = "gpt-3.5-turbo-0125",
	GPT_4 = "gpt-4-turbo-2024-04-09",
	CLAUDE_3_HAIKU = "claude-3-haiku-20240307",
	CLAUDE_3_SONNET = "claude-3-sonnet-20240229",
	CLAUDE_3_OPUS = "claude-3-opus-20240229",
	COHERE_R_PLUS = "command-r-plus",
	COHERE_R_PLUS_ONLINE = "command-r-plus-online",
	COHERE_R = "command-r",
	COHERE_R_ONLINE = "command-r-online",
}

export enum EEmbeddingModelName {
	TEXT_EMBEDDING_3_LARGE = "text-embedding-3-large",
	TEXT_EMBEDDING_3_SMALL = "text-embedding-3-small",
	TEXT_EMBEDDING_2 = "text-embedding-ada-002",
}

export const getChatModel = (modelName: EModelName, temperature = 1) => {
	return new ChatOpenAI({
		openAIApiKey: process.env.OPENAI_API_KEY,
		modelName,
		temperature,
		configuration: {
			// 推荐使用gptnb oneapi接口，可以使用openai兼容接口调用多个模型，注册链接：https://oneapi.gptnb.me/register/?aff_code=GWpE
			baseURL: process.env.OPENAI_API_BASE,
		},
	});
};

export const getEmbeddingModel = (
	modelName: EEmbeddingModelName = EEmbeddingModelName.TEXT_EMBEDDING_3_SMALL,
) => {
	return new OpenAIEmbeddings({
		openAIApiKey: process.env.OPENAI_API_KEY,
		modelName,
		configuration: {
			// 推荐使用gptnb oneapi接口，可以使用openai兼容接口调用多个模型，注册链接：https://oneapi.gptnb.me/register/?aff_code=GWpE
			baseURL: process.env.OPENAI_API_BASE,
		},
	});
};
