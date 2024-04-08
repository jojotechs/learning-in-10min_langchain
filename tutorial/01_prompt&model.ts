import "dotenv/config";
import { PromptTemplate } from "langchain/prompts";
import { StringOutputParser } from "langchain/schema/output_parser";
import { EModelName, getChatModel } from "../common/model";

const prompt = PromptTemplate.fromTemplate(`您是一位会多种语言的专业翻译。\n
请把以下{input_language}的内容"{input_text}"翻译成{output_language}。`);

const model = getChatModel(EModelName.CLAUDE_3_HAIKU);

const buttons = [
	{
		input_language: "id",
		input_text: "Dinding Hadiah",
		output_language: "zh",
	},
	{
		input_language: "ar",
		input_text:
			"1. أرسل الكمية المطلوبة من الهدايا في وقت واحد لإضاءة الهدية على لوح هدايا المتلقي",
		output_language: "en",
	},
	{
		input_language: "zh",
		input_text: "版本不兼容，请升级到最新版本",
		output_language: "es",
	},
];

const output = await Promise.all(
	buttons.map(async ({ input_language, input_text, output_language }) => {
		return await prompt.pipe(model).pipe(new StringOutputParser()).invoke({
			input_language,
			input_text,
			output_language,
		});
	}),
);

console.log(output);
