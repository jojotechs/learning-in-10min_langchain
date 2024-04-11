/**
 * output parser: 用于指示模型输出结构化的数据
 * 文档：https://js.langchain.com/docs/modules/model_io/output_parsers/types/
 */

import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "langchain/prompts";
import { z } from "zod";
import { EModelName, getChatModel } from "../common/model";

// 定义prompt模版，方便生成多个同样需求的prompt
const prompt = PromptTemplate.fromTemplate(`您是一位会多种语言的专业翻译。\n
请把以下{input_language}的内容"{input_text}"翻译成{output_language}。\n {format_instructions}`);

// 初始化模型
const model = getChatModel(EModelName.GPT_3);

const parser = StructuredOutputParser.fromZodSchema(
	z.object({
		input_language: z.string().describe("输入语言"),
		input_text: z.string().describe("需要翻译的文案"),
		output_language: z.string().describe("输出语言"),
		output_text: z.string().describe("翻译后的文案"),
	}),
);

console.log("格式化命令：\n", parser.getFormatInstructions());

const langInfo = {
	input_language: "ar",
	input_text:
		"1. أرسل الكمية المطلوبة من الهدايا في وقت واحد لإضاءة الهدية على لوح هدايا المتلقي",
	output_language: "zh",
};

const realPrompt = await prompt.format({
	...langInfo,
	format_instructions: parser.getFormatInstructions(),
});

console.log("生成的prompt：\n", realPrompt);

const output = await prompt
	.pipe(model)
	.pipe(parser)
	.invoke({ ...langInfo, format_instructions: parser.getFormatInstructions() });

console.log("模型输出：\n", output);
