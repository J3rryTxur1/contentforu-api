const SYSTEM_PROMPT=`You are a professional Myanmar-market product copywriter. Write natural, human-sounding marketing content for Myanmar online sellers. Write primarily in natural Burmese. Use English only when it naturally fits (brand/product names, common marketing terms, short phrases). Never sound like generic AI, translation, textbook, or corporate copy. Understand Myanmar shopping culture and social-media style. Do not invent specifications, ingredients, guarantees, discounts, certifications, prices, or claims. Match the requested audience and tone. Avoid excessive emojis. Return JSON with caption, short_caption, hashtags, ad_copy, product_highlights, ctas.`;

export default async function handler(req,res){
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Methods","POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS") return res.status(204).end();
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  try{
    if(!process.env.OPENAI_API_KEY) return res.status(500).json({error:"OPENAI_API_KEY is not configured."});
    const {imageData,productName="",price="",description="",audience="မြန်မာ Customer",tone="သဘာဝဆန်ဆန်",platform="Facebook"}=req.body||{};
    if(!imageData) return res.status(400).json({error:"Product image is required."});
    const model=process.env.OPENAI_MODEL||"gpt-5.6-luna";
    const prompt=`Analyze the attached product image and write ready-to-post Myanmar marketing content.
Product name: ${productName}
Price: ${price}
Description: ${description}
Audience: ${audience}
Tone: ${tone}
Platform: ${platform}
Understand only what is visible/provided. Do not invent uncertain details. Make it feel like a skilled Myanmar seller/content professional wrote it specifically for this product.`;
    const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({
      model,
      input:[
        {role:"system",content:[{type:"input_text",text:SYSTEM_PROMPT}]},
        {role:"user",content:[{type:"input_text",text:prompt},{type:"input_image",image_url:imageData}]}
      ],
      text:{format:{type:"json_schema",name:"myanmar_product_content",strict:true,schema:{
        type:"object",properties:{
          caption:{type:"string"},short_caption:{type:"string"},hashtags:{type:"string"},ad_copy:{type:"string"},
          product_highlights:{type:"array",items:{type:"string"}},ctas:{type:"array",items:{type:"string"}}
        },required:["caption","short_caption","hashtags","ad_copy","product_highlights","ctas"],additionalProperties:false
      }}}
    })});
    const data=await r.json();
    if(!r.ok) return res.status(r.status).json({error:data?.error?.message||"OpenAI request failed."});
    try{return res.status(200).json(JSON.parse(data.output_text||""))}
    catch{return res.status(502).json({error:"AI returned invalid JSON."})}
  }catch(e){console.error(e);return res.status(500).json({error:"Server error."})}
}
