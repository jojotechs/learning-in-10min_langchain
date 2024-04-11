/**
 * CoT 这个概念来源于学术界，是谷歌大脑的 Jason Wei 等人于 2022 年在论文《Chain-of- Thought Prompting Elicits Reasoning in Large Language Models(自我一致性提升了语
言模型中的思维链推理能力)》中提出来的概念。它提出，如果生成一系列的中间推理步骤，
就能够显著提高大型语言模型进行复杂推理的能力。
 * https://ar5iv.labs.arxiv.org/html/2201.11903
 * 
 */

import { ChatPromptTemplate } from "langchain/prompts";
import { StringOutputParser } from "langchain/schema/output_parser";
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

// 用户的询问
const human_template = "{human_input}";

const prompt = ChatPromptTemplate.fromMessages([
	["system", role_template],
	["system", cot_template],
	["human", human_template],
]);

const output = await prompt
	.pipe(model)
	.pipe(new StringOutputParser())
	.invoke({ human_input: "How to light up the gift" });

console.log("cot output:", output);

/**
 * Tree of Thought
 * ToT 框架为每个任务定义具体的思维步骤和每个步骤的候选项数量。例如，要解决一个数学推理任务，先把它分解为 3 个思维步骤，并为每个步骤提出多个方案，并保留最优的 5 个候选方案。然后在多条思维路径中搜寻最优的解决方案。ToT 进一步扩展了 CoT 的思想，通过搜索由连贯的语言序列组成的思维树来解决复杂问题。
 */

const tot_template = `
思维步骤1：确定源语言和目标语言。
    
    源语言：英语
    目标语言：中文
    
    思维步骤2：理解源语言的句子结构和意义。
    
    英语句子："How are you?"
    
    思维步骤3：寻找最合适的中文表达方式。
    
    中文翻译："你好吗？"
    
    思维步骤4：考虑语言习惯、文化差异和语境。
    
    "How are you?" 是一个常见的问候，通常不需要特别的文化考量。
    
    思维步骤5：给出翻译结果。
    `;

const tot_prompt = ChatPromptTemplate.fromMessages([
	["system", role_template],
	["system", tot_template],
	["human", human_template],
]);

const tot_output = await tot_prompt
	.pipe(model)
	.pipe(new StringOutputParser())
	.invoke({ human_input: "How to light up the gift" });

console.log("tot output:", tot_output);
