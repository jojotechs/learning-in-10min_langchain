import { StringOutputParser } from "@langchain/core/output_parsers";
/**
 * LangChai通过设计好的接口，实现一个具体的链的功能，比如前面我们通过pipe方法就可以链式把Model、prompt、parser串联起来。这就相当于把整个 Model I/O 的流程封装到链里面。
 实现了链的具体功能之后，我们可以通过Runnable相关的函数将多个链组合在一起，或者将链与其他组件组合来
 构建更复杂的链。
所以，链在内部把一系列的功能进行封装，而链的外部则又可以组合串联。链其实可以被 视为 LangChain 中的一种基本功能单元。在新版本的langchain中，提供了一种叫LCEL的串联方式来描述链的结构
https://js.langchain.com/docs/expression_language/
 */
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { EModelName, getChatModel } from "../common/model";

// 第一个提示用于理解句子的上下文
const contextPrompt = PromptTemplate.fromTemplate(
	`What is the context or subject matter of the sentence: "{sentence}"?`,
);

// 第二个提示用于翻译句子
const translationPrompt = PromptTemplate.fromTemplate(
	`Translate the sentence "{sentence}" from {sourceLanguage} to {targetLanguage}, considering the context: {context}.`,
);

// 初始化模型
const model = getChatModel(EModelName.GPT_3);

// 首先使用模型解析句子的上下文
const contextChain = contextPrompt.pipe(model).pipe(new StringOutputParser());

// 然后使用解析的上下文来帮助翻译句子
const translationChain = RunnableSequence.from([
	{
		sentence: (input) => input.sentence,
		sourceLanguage: (input) => input.sourceLanguage,
		targetLanguage: (input) => input.targetLanguage,
		context: contextChain, // 使用上一步得到的上下文
	},
	translationPrompt,
	model,
	new StringOutputParser(),
]);

// console.log(translationChain.getGraph())

// 调用链来翻译句子
const result = await translationChain.invoke({
	sentence: "Dinding Hadiah",
	sourceLanguage: "id",
	targetLanguage: "zh",
});

console.log(result);
