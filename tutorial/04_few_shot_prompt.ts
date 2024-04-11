/**
 * 在 Open AI 的官方文档  GPT 最佳实践中，也给出了和上面这两大原则一脉相承 的 6 大策略。分别是:
    1. 写清晰的指示
    2. 给模型提供参考(也就是示例) 3. 将复杂任务拆分成子任务
    4. 给 GPT 时间思考
    5. 使用外部工具
    6. 反复迭代问题和模型
    FewShotPromptTemplate。FewShot，也就是少样本这一概念，是提示工程中非常重要的部 分，对应着 OpenAI 提示工程指南中的第 2 条——给模型提供参考
    Few-Shot(少样本)、One-Shot(单样本)和与之对应的 Zero-Shot(零样本)的概念都 起源于机器学习。如何让机器学习模型在极少量甚至没有示例的情况下学习到新的概念或类 别，对于许多现实世界的问题是非常有价值的，因为我们往往无法获取到大量的标签化数据。在提示工程(Prompt Engineering)中，Few-Shot 和 Zero-Shot 学习的概念也被广泛应用。
    - 在 Few-Shot 学习设置中，模型会被给予几个示例，以帮助模型理解任务，并生成正确的响应。
    - 在 Zero-Shot 学习设置中，模型只根据任务的描述生成响应，不需要任何示例。
 */

import { FewShotPromptTemplate, PromptTemplate } from "langchain/prompts";
import { StringOutputParser } from "langchain/schema/output_parser";
import { EModelName, getChatModel } from "../common/model";

// 初始化模型
const model = getChatModel(EModelName.GPT_3);

// 创建一些翻译示例
const samples = [
	{
		source_language: "English",
		target_language: "Chinese",
		source_text: "How are you?",
		translated_text: "你好吗？",
	},
	{
		source_language: "Indonesian",
		target_language: "Chinese",
		source_text: "Apa kabar?",
		translated_text: "你好吗？",
	},
	{
		source_language: "English",
		target_language: "Chinese",
		source_text: "What is the weather like today?",
		translated_text: "今天天气怎么样？",
	},
];

const prompt_samples = PromptTemplate.fromTemplate(
	"源语言: {source_language}\n目标语言: {target_language}\n原文: {source_text}\n翻译: {translated_text}",
);

const prompt = new FewShotPromptTemplate({
	examples: samples,
	examplePrompt: prompt_samples,
	suffix:
		"源语言: {source_language}\n目标语言: {target_language}\n原文: {source_text}",
	inputVariables: ["source_language", "target_language", "source_text"],
});

// 用于翻译的新文本
const new_text = {
	source_language: "Indonesian",
	target_language: "Chinese",
	source_text: "Selamat pagi",
};

const realPrompt = await prompt.format(new_text);
console.log("最终的提示词：\n", realPrompt);

// 生成响应
const output = await prompt
	.pipe(model)
	.pipe(new StringOutputParser())
	.invoke(new_text);

console.log(output);
