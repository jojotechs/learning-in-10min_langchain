/**
 * ChatPrompt用于将聊天消息列表作为输入 - 列表中每一项都将包含角色信息，比如system、human、ai等和不同角色对应的prompt
 */
import "dotenv/config";
import { ChatPromptTemplate } from "langchain/prompts";
// 用于解析输出结果成字符串
import { StringOutputParser } from "langchain/schema/output_parser";
import { EModelName, getChatModel } from "../common/model";

// 定义prompt模版，方便生成多个同样需求的prompt
const chat_prompt = ChatPromptTemplate.fromMessages([
	[
		"system",
		`
    # 角色
    您是一位精通{input_language}和{output_language}的专业翻译。
    ## 技能
    - 对用户输入的内容进行翻译，转化{input_language}为{output_language}。
    - 尊重并保证翻译的准确性，以最忠实地传达原始内容。
  `,
	],
	["human", "{input_text}"],
]);

// 初始化模型
const model = getChatModel(EModelName.GPT_3);

const langInfo = {
	input_language: "id",
	input_text: "Pengguna ini tidak sedang di kursi. Tidak bisa mengirim hadiah",
	output_language: "zh",
};

const prompt = await chat_prompt.format(langInfo);

console.log("最终构造的prompt:\n", prompt);

// 批量调用模型进行翻译
const output = await chat_prompt
	.pipe(model)
	.pipe(new StringOutputParser())
	.invoke(langInfo);

// 打印输出结果
console.log(output);
