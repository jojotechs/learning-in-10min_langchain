import "dotenv/config";
import { PromptTemplate } from "langchain/prompts";
// 用于解析输出结果成字符串
import { StringOutputParser } from "langchain/schema/output_parser";
import { EModelName, getChatModel } from "../common/model";

// 定义prompt模版，方便生成多个同样需求的prompt
const prompt = PromptTemplate.fromTemplate(`您是一位会多种语言的专业翻译。\n
请把以下{input_language}的内容"{input_text}"翻译成{output_language}。`);

// 初始化模型
const model = getChatModel(EModelName.GPT_3);

// 定义prompt模板参数
const langs = [
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

// 批量调用模型进行翻译
const output = await Promise.all(
	langs.map(async ({ input_language, input_text, output_language }) => {
		const real_prompt = await prompt.format({
			input_language,
			input_text,
			output_language,
		});
		console.log("最终构造的prompt: \n", real_prompt);
		// StringOutputParser是接触到的第一个parser，用于将模型输出的结果转换成字符串，否则返回的结果会带有langchain额外的结构数据
		return await prompt.pipe(model).pipe(new StringOutputParser()).invoke({
			input_language,
			input_text,
			output_language,
		});
	}),
);

// 打印输出结果
console.log(output);
