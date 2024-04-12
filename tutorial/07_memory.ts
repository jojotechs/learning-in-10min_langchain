import { ConversationChain, LLMChain } from "langchain/chains";
/**
 * Memory - 用于保持与模型交互的历史上下文，主要有BufferMemory、BufferWindowMemory、SummaryMemory、SummaryBufferMemory几种
 */
import {
	BufferMemory,
	BufferWindowMemory,
	ChatMessageHistory,
	ConversationSummaryMemory,
} from "langchain/memory";
import { ChatPromptTemplate, PromptTemplate } from "langchain/prompts";
import { AIMessage, SystemMessage } from "langchain/schema";
import { EModelName, getChatModel } from "../common/model";

// 初始化模型
const model = getChatModel(EModelName.GPT_3);

//设定 AI 的角色和目标
const role_template =
	"你是一个专门帮助用户进行多语言翻译（如英语、印尼语等到中文）的AI助手。";

// CoT 的关键部分，AI 解释推理过程，并加入一些先前的对话示例（Few-Shot Learning）
const cot_template = `
作为一个专门帮助用户进行多语言翻译的AI助手，我的目标是提供准确和流畅的翻译。

我会仔细分析源语言句子的结构和意义，然后寻找最合适的中文表达方式。在翻译过程中，我会考虑语言习惯、文化差异和语境。

示例 1 (英语到中文):
  人类：How are you?
  AI：你好吗？

示例 2 (印尼语到中文):
  人类：Apa kabar?
  AI：你好吗？

示例 3 (英语到中文):
  人类：What is the weather like today?
  AI：今天天气怎么样？
`;

// const memory = new BufferMemory({
//   chatHistory: new ChatMessageHistory([
//     new SystemMessage(role_template),
//     new SystemMessage(cot_template),
//     new AIMessage("你好，有什么需要翻译的吗？"),
//   ])
// });
// const chain = new ConversationChain({ llm: model, memory: memory });
// const output1 = await chain.call({input: '翻译：How to light up the gift'})
// console.log(output1)
// const output2 = await chain.call({input: '翻译印尼语：Dinding Hadiah'})
// console.log(output2)
// const output3 = await chain.call({input: '解释一下上面的翻译'})
// console.log(output3)

// const memory = new BufferWindowMemory({ k: 1 })
// const chain = new ConversationChain({ llm: model, memory: memory });
// const output1 = await chain.call({input: '翻译成中文：How to light up the gift'})
// console.log(output1)
// const output2 = await chain.call({input: '翻译印尼语成中文：Dinding Hadiah'})
// console.log(output2)
// const output3 = await chain.call({input: '解释一下上面的翻译'})
// console.log(output3)

const memory = new ConversationSummaryMemory({
	llm: model,
	memoryKey: "chat_history",
});
const prompt = PromptTemplate.fromTemplate(`The following is a translation conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.

  Current conversation:
  {chat_history}
  Human: {input}
  AI:`);
const chain = new LLMChain({ llm: model, prompt, memory });
const output1 = await chain.call({
	input: "翻译成中文：How to light up the gift",
});
console.log(output1);
const output2 = await chain.call({ input: "翻译印尼语成中文：Dinding Hadiah" });
console.log(output2);
const output3 = await chain.call({ input: "解释一下上面的翻译" });
console.log(output3);
