import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root=path.dirname(fileURLToPath(import.meta.url)),port=Number(process.env.PORT||3000);
const KEY=process.env.OPENAI_API_KEY,MODEL=process.env.OPENAI_MODEL||"gpt-4.1-mini";
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8"};
function reply(res,status,obj){res.writeHead(status,{"content-type":"application/json; charset=utf-8","cache-control":"no-store"});res.end(JSON.stringify(obj))}
async function body(req){let size=0,chunks=[];for await(const c of req){size+=c.length;if(size>8_000_000)throw Error("照片过大");chunks.push(c)}return JSON.parse(Buffer.concat(chunks).toString("utf8"))}
const answers=[
{id:"q1",answer:"ancient",explain:"ancient：古代的；古老的。"},
{id:"q2",answer:"fantastic",explain:"fantastic：极好的。"},
{id:"q3",answer:"scenery",explain:"scenery：风景；不可数名词。"},
{id:"q4",answer:"camped",explain:"last summer 是过去时间，camp 的过去式为 camped。"},
{id:"q5",answer:"visited",explain:"yesterday 表示过去，visit → visited。"},
{id:"q6",answer:"were taking",explain:"when it began to rain 前正在拍照，用过去进行时。"},
{id:"q7",answer:"B",explain:"went 表示一次过去的假期旅行。"},
{id:"q8",answer:"A",explain:"something interesting：不定代词后置形容词。"},
{id:"q9",answer:"C",explain:"didn't go 后使用动词原形。"},
{id:"q10",answer:"D",explain:"天气晴朗、欣赏风景，语境中用 fantastic。"}
];
const standard=answers.map(x=>x.id+" = "+x.answer+"；"+x.explain).join("\n");
const system="你是严谨的初二英语教师。用户上传一张学生纸笔作答照片，试卷题号 1-10，对应 q1-q10。标准答案：\n"+standard+"\n只批改能看清的学生手写答案。不可猜测、不可凭空补写，不能把印刷的试卷内容当成学生答案。若无法识别，标记 uncertain。每题10分，完全正确10，否则0；非专有名词大小写不计。返回 JSON 对象 {\"items\":[{\"id\":\"q1\",\"student_answer\":\"...\",\"correct\":true,\"uncertain\":false,\"score\":10,\"explanation\":\"中文具体讲解\"}],\"summary\":\"中文总结\",\"weaknesses\":[\"薄弱点\"]}，必须恰好10个 items；无法辨认的题 student_answer 为空、correct=false、uncertain=true、score=0。不要 markdown。";
async function grade(data){
 if(!KEY)throw Error("服务端尚未设置 OPENAI_API_KEY，拍照自动批改不可用");
 if(typeof data.image!=="string"||!/^data:image\/(jpeg|png|webp);base64,/.test(data.image))throw Error("只支持 JPG、PNG、WebP 图片");
 if(data.image.length>7_000_000)throw Error("图片过大，请压缩后重新上传");
 const resp=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Authorization":"Bearer "+KEY,"Content-Type":"application/json"},body:JSON.stringify({model:MODEL,temperature:0,response_format:{type:"json_object"},messages:[{role:"system",content:system},{role:"user",content:[{type:"text",text:"批改这张完整答卷照片，模糊题标记 uncertain。"},{"type":"image_url",image_url:{url:data.image,detail:"high"}}]}]})});
 const raw=await resp.json();if(!resp.ok)throw Error(raw.error?.message||"视觉模型请求失败");
 const parsed=JSON.parse(raw.choices?.[0]?.message?.content||"{}");
 const items=answers.map(a=>{const x=parsed.items?.find(v=>v.id===a.id)||{};const uncertain=Boolean(x.uncertain)||!x.student_answer,correct=!uncertain&&Boolean(x.correct);return {id:a.id,student_answer:String(x.student_answer||""),answer:a.answer,correct,uncertain,score:correct?10:0,explanation:String(x.explanation||a.explain)}});
 return {items,total:items.reduce((n,x)=>n+x.score,0),max:100,summary:String(parsed.summary||""),weaknesses:Array.isArray(parsed.weaknesses)?parsed.weaknesses:[],requiresReview:items.some(x=>x.uncertain),warning:"AI 识别和批改仅供学习反馈；模糊、遮挡或争议答案请人工复核。"};
}
http.createServer(async(req,res)=>{
 try{
  if(req.method==="GET"&&req.url==="/api/health")return reply(res,200,{ok:true,gradingConfigured:Boolean(KEY)});
  if(req.method==="POST"&&req.url==="/api/grade")return reply(res,200,await grade(await body(req)));
  if(req.method!=="GET")return reply(res,405,{error:"Method not allowed"});
  const url=new URL(req.url,"http://localhost"),rel=url.pathname==="/"?"/index.html":url.pathname;
  const file=path.resolve(root,"public","."+rel);if(!file.startsWith(path.resolve(root,"public")+path.sep))return reply(res,403,{error:"Forbidden"});
  const bytes=await readFile(file);res.writeHead(200,{"content-type":types[path.extname(file)]||"application/octet-stream"});res.end(bytes);
 }catch(e){reply(res,/ENOENT/.test(e.message)?404:400,{error:e.message})}
}).listen(port,()=>console.log("Grade8 English: http://localhost:"+port));
