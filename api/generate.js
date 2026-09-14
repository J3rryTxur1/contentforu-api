const SYSTEM_PROMPT = `
You are a professional Myanmar e-commerce content writer and product marketing strategist.

Your job is to create natural, persuasive, human-sounding product content for Myanmar online sellers.

The final content must feel like it was written by an experienced Myanmar seller or content writer, NOT by an AI.

========================
1. PRODUCT UNDERSTANDING
========================

Carefully analyze the uploaded product image together with the seller's provided information.

Understand:

- What the product is
- Visible color
- Shape
- Style
- Design
- Visible details
- Practical use
- Likely target customer
- Overall appearance

Only use information that is visible in the image or explicitly provided by the seller.

NEVER invent:

- Material
- Size
- Brand
- Warranty
- Origin
- Ingredients
- Specifications
- Certifications
- Durability claims
- Delivery information
- Contact information
- Discounts
- Promotions
- Stock availability
- Product features that cannot be confirmed

If a detail cannot be confirmed, simply do not mention it.

========================
2. MYANMAR MARKET
========================

Write specifically for Myanmar customers.

The language should feel natural for Myanmar Facebook pages and online shops.

Use simple, conversational Burmese.

Do not translate English advertising templates word-for-word into Burmese.

Avoid unnecessarily formal Burmese.

Avoid unnatural phrases that sound like AI-generated marketing copy.

Avoid exaggerated advertising language.

Avoid fake urgency.

Avoid making unsupported claims.

========================
3. WRITING STYLE
========================

Write like a real Myanmar seller talking to customers.

The writing should be:

- Natural
- Clear
- Easy to read
- Believable
- Useful
- Persuasive without being pushy

Do not make every sentence promotional.

Do not repeatedly use generic phrases such as:

"အရည်အသွေးအကောင်းဆုံး"
"အရမ်းမိုက်"
"မလွတ်သင့်တဲ့အခွင့်အရေး"
"အခုပဲဝယ်လိုက်ပါ"
"အခုပဲမှာယူလိုက်ပါ"
"အကောင်းဆုံးရွေးချယ်မှု"
"လူတိုင်းအတွက်အထူးသင့်တော်"

unless the provided information genuinely supports them.

========================
4. MAIN CAPTION
========================

Create a natural social-media sales caption.

A strong caption can contain:

- A relevant hook
- Product introduction
- Important product details
- Customer benefits
- Price if provided
- Natural CTA

Do not force every section.

The caption should flow naturally as one complete post.

The opening should be based on the actual product.

Do not use clickbait.

========================
5. FEATURE TO BENEFIT
========================

Whenever appropriate, explain why an actual product feature is useful to the customer.

Example:

Feature:
"Simple design"

Better:
"ရိုးရိုးရှင်းရှင်းနဲ့ နေ့စဉ်အသုံးပြုရလွယ်တဲ့ပုံစံ"

Do not exaggerate benefits.

========================
6. AUDIENCE
========================

Respect the selected target audience.

If audience is:

Myanmar Customer:
Use broadly understandable Burmese.

Young:
Use modern, casual and natural language.

Women:
Focus on relevant style, appearance and convenience when supported by the product.

Men:
Focus on relevant style, practicality and usage when supported.

Premium:
Use elegant and refined language with fewer emojis.

Budget:
Focus on practical value without falsely claiming the product is the cheapest.

========================
7. TONE
========================

Respect the selected tone.

Natural:
Conversational, simple and human.

Professional:
Clear, trustworthy and organized without sounding too formal.

Friendly:
Warm and approachable.

Premium:
Elegant, refined and restrained.

Youth:
Modern, casual and natural. Small amounts of common English are acceptable.

Storytelling:
Use a relatable situation or feeling connected to the product.

Do not create fake customer stories.

========================
8. PRICE
========================

If the seller provides a price, use exactly that price.

Never change the price.

Never invent a discount.

Never invent a promotion.

Never claim something is "on sale" unless the seller provides that information or the selected design context clearly indicates a sale.

========================
9. CTA
========================

Create natural calls to action suitable for Myanmar online shops.

Examples:

"အသေးစိတ်သိချင်ရင် Messenger မှာ မေးမြန်းနိုင်ပါတယ်။"

"မှာယူချင်ရင် Page Messenger ကနေ ဆက်သွယ်နိုင်ပါတယ်။"

"Size / color သိချင်ရင် Message ပို့ပြီး မေးနိုင်ပါတယ်။"

Do not invent phone numbers, addresses or links.

Do not use aggressive repeated CTAs.

========================
10. SHORT CAPTION
========================

Create a concise version for social media.

It should communicate the product, its main benefit and price when available.

Keep it natural.

========================
11. AD COPY
========================

Create a persuasive version suitable for advertising.

It must remain truthful and human-sounding.

Do not exaggerate.

Do not make unsupported promises.

========================
12. HASHTAGS
========================

Create relevant hashtags only.

Use a reasonable number.

Use Myanmar and English hashtags only when they are actually useful.

Do not use irrelevant trending hashtags.

========================
13. PRODUCT HIGHLIGHTS
========================

Return 3 to 6 short product highlights.

Each highlight must be specific.

Only include information supported by the image or seller information.

Do not repeat the same point.

========================
14. CTA OPTIONS
========================

Return 2 to 4 different natural CTA options.

Avoid repetitive wording.

========================
15. LANGUAGE
========================

Primary language must be Myanmar Burmese.

English may be used naturally for:

- Brand names
- Product names
- Common fashion terms
- Common technology terms
- Common social-media terminology
- Hashtags

Do not randomly mix English into Burmese.

Use natural Myanmar sentence structure and punctuation.

========================
16. EMOJI
========================

Use emojis sparingly.

Do not put emojis in every sentence.

Premium content should use very few emojis.

========================
17. FINAL QUALITY CHECK
========================

Before returning the answer, silently check:

- Does this sound like a real Myanmar seller wrote it?
- Is the Burmese natural?
- Did I understand the actual product?
- Did I invent any information?
- Is the audience correct?
- Is the selected tone respected?
- Is the CTA natural?
- Is the content useful?
- Is it suitable for Myanmar social media?
- Is it ready to post?

If something sounds like generic AI marketing language, rewrite it naturally.

========================
OUTPUT
========================

Return ONLY the requested JSON structure.

Do not include markdown code fences.

Do not include explanations outside the JSON.
`;

export default async function handler(req, res) {

  /* =========================
     CORS
  ========================= */

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  /* =========================
     OPTIONS
  ========================= */

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  /* =========================
     METHOD CHECK
  ========================= */

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {

    /* =========================
       API KEY
    ========================= */

    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error:
          "OPENAI_API_KEY is not configured in Vercel."
      });
    }

    /* =========================
       REQUEST DATA
    ========================= */

    const {
      imageData,
      productName,
      price,
      description,
      audience,
      tone,
      platform,
      designStyle,
      font
    } = req.body || {};

    /* =========================
       IMAGE CHECK
    ========================= */

    if (
      !imageData ||
      typeof imageData !== "string"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Product image is required."
      });
    }

    if (
      !imageData.startsWith("data:image/")
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid image format."
      });
    }

    /* =========================
       IMAGE SIZE CHECK
       ~8MB maximum
    ========================= */

    const imageSizeMB =
      Buffer.byteLength(
        imageData,
        "utf8"
      ) /
      (1024 * 1024);

    if (imageSizeMB > 8) {
      return res.status(400).json({
        success: false,
        error:
          "Product image is too large. Please use an image smaller than 8MB."
      });
    }

    /* =========================
       USER PROMPT
    ========================= */

    const userPrompt = `
Create Myanmar e-commerce content for this product.

Product name:
${productName || "Not provided"}

Price:
${price || "Not provided"}

Seller description:
${description || "Not provided"}

Target audience:
${audience || "Myanmar Customer"}

Tone:
${tone || "Natural"}

Platform:
${platform || "Facebook"}

Design style:
${designStyle || "Premium"}

Myanmar font:
${font || "Noto Sans Myanmar"}

IMPORTANT:

Analyze the uploaded product image carefully.

Use the image together with the seller information.

Do not invent information that cannot be confirmed.

Write natural Myanmar content suitable for a real Myanmar online shop.

The result must be ready for the seller to review and post.
`;

    /* =========================
       OPENAI REQUEST
    ========================= */

    const model =
      process.env.OPENAI_MODEL ||
      "gpt-5.6-luna";

    const openAIResponse =
      await fetch(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${apiKey}`
          },

          body: JSON.stringify({

            model,

            input: [

              {
                role: "system",

                content: [
                  {
                    type:
                      "input_text",

                    text:
                      SYSTEM_PROMPT
                  }
                ]
              },

              {
                role: "user",

                content: [

                  {
                    type:
                      "input_text",

                    text:
                      userPrompt
                  },

                  {
                    type:
                      "input_image",

                    image_url:
                      imageData
                  }

                ]
              }

            ],

            text: {

              format: {

                type:
                  "json_schema",

                name:
                  "myanmar_product_content",

                strict: true,

                schema: {

                  type: "object",

                  properties: {

                    caption: {
                      type: "string"
                    },

                    short_caption: {
                      type: "string"
                    },

                    hashtags: {
                      type: "string"
                    },

                    ad_copy: {
                      type: "string"
                    },

                    product_highlights: {

                      type: "array",

                      items: {
                        type: "string"
                      }

                    },

                    ctas: {

                      type: "array",

                      items: {
                        type: "string"
                      }

                    }

                  },

                  required: [

                    "caption",
                    "short_caption",
                    "hashtags",
                    "ad_copy",
                    "product_highlights",
                    "ctas"

                  ],

                  additionalProperties:
                    false

                }

              }

            }

          })

        }
      );

    /* =========================
       READ OPENAI RESPONSE
    ========================= */

    const data =
      await openAIResponse.json();

    console.log(
      "OpenAI status:",
      openAIResponse.status
    );

    console.log(
      "OpenAI response id:",
      data?.id || null
    );

    /* =========================
       OPENAI ERROR
    ========================= */

    if (!openAIResponse.ok) {

      console.error(
        "OpenAI API error:",
        data
      );

      return res.status(200).json({

        success: false,

        error:
          data?.error?.message ||
          "OpenAI API request failed.",

        openai_status:
          openAIResponse.status,

        openai_error:
          data?.error || null

      });
    }

    /* =========================
       EXTRACT OUTPUT
    ========================= */

    let outputText =
      data?.output_text || "";

    if (
      !outputText &&
      Array.isArray(data?.output)
    ) {

      for (
        const outputItem
        of data.output
      ) {

        if (
          Array.isArray(
            outputItem?.content
          )
        ) {

          for (
            const contentItem
            of outputItem.content
          ) {

            if (
              contentItem?.type ===
                "output_text" &&
              typeof contentItem?.text ===
                "string"
            ) {

              outputText +=
                contentItem.text;

            }

          }

        }

      }

    }

    /* =========================
       REFUSAL / EMPTY OUTPUT
    ========================= */

    if (!outputText) {

      console.error(
        "Empty AI output:",
        JSON.stringify(
          data,
          null,
          2
        )
      );

      return res.status(200).json({

        success: false,

        error:
          "AI returned an empty response.",

        response_id:
          data?.id || null,

        response_status:
          data?.status || null,

        incomplete_details:
          data?.incomplete_details ||
          null,

        output:
          data?.output || null

      });
    }

    /* =========================
       CLEAN JSON
    ========================= */

    outputText =
      outputText
        .trim()
        .replace(
          /^```json\s*/i,
          ""
        )
        .replace(
          /^```\s*/i,
          ""
        )
        .replace(
          /\s*```$/i,
          ""
        )
        .trim();

    /* =========================
       PARSE JSON
    ========================= */

    let result;

    try {

      result =
        JSON.parse(outputText);

    } catch (parseError) {

      console.error(
        "JSON parse error:",
        parseError
      );

      console.error(
        "Raw AI output:",
        outputText
      );

      return res.status(200).json({

        success: false,

        error:
          "AI returned invalid JSON.",

        raw:
          outputText.slice(
            0,
            3000
          )

      });
    }

    /* =========================
       VALIDATE RESULT
    ========================= */

    if (
      !result ||
      typeof result !== "object"
    ) {

      return res.status(200).json({

        success: false,

        error:
          "AI returned an invalid result."

      });
    }

    /* =========================
       SUCCESS
    ========================= */

    return res.status(200).json({

      success: true,

      caption:
        result.caption || "",

      short_caption:
        result.short_caption || "",

      hashtags:
        result.hashtags || "",

      ad_copy:
        result.ad_copy || "",

      product_highlights:
        Array.isArray(
          result.product_highlights
        )
          ? result.product_highlights
          : [],

      ctas:
        Array.isArray(result.ctas)
          ? result.ctas
          : []

    });

  } catch (error) {

    console.error(
      "Generate API error:",
      error
    );

    return res.status(200).json({

      success: false,

      error:
        error?.message ||
        "Internal server error."

    });

  }

}
