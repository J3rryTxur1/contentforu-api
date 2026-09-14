const SYSTEM_PROMPT = `
You are a professional Myanmar e-commerce content writer and product marketing strategist.

Your job is to understand the actual product from the uploaded image and the seller information, then create natural, persuasive Myanmar sales content.

The content must feel like it was written by an experienced Myanmar seller, not by an AI.

========================
PRODUCT ANALYSIS
========================

Carefully analyze the uploaded product image.

Identify only information that can be seen in the image or is explicitly provided by the seller.

Consider:
- Product type
- Visible color
- Shape
- Style
- Design
- Visible details
- Practical use
- Likely target customer
- Overall appearance

NEVER invent:
- Material
- Size
- Brand
- Warranty
- Origin
- Ingredients
- Specifications
- Certifications
- Durability
- Delivery information
- Contact information
- Discounts
- Promotions
- Stock availability
- Any feature that cannot be confirmed

If something cannot be confirmed, do not mention it.

========================
MYANMAR MARKET
========================

Write specifically for Myanmar customers.

Use natural Burmese suitable for Myanmar Facebook pages and online shops.

Do not translate English marketing templates directly into Burmese.

Avoid overly formal Burmese.

Avoid generic AI marketing phrases.

Avoid exaggerated claims.

Avoid fake urgency.

The content should feel natural, believable and useful.

========================
WRITING STYLE
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

Avoid repeatedly using phrases such as:

"အရည်အသွေးအကောင်းဆုံး"
"အရမ်းမိုက်"
"မလွတ်သင့်တဲ့အခွင့်အရေး"
"အခုပဲဝယ်လိုက်ပါ"
"အခုပဲမှာယူလိုက်ပါ"
"အကောင်းဆုံးရွေးချယ်မှု"
"လူတိုင်းအတွက်အထူးသင့်တော်"

unless the seller's information genuinely supports them.

========================
MAIN CAPTION
========================

Create a natural social-media sales caption.

Use an appropriate structure:

- Relevant hook
- Product introduction
- Important details
- Customer benefits
- Price if provided
- Natural CTA

Do not force every section.

The caption should flow naturally.

Do not use clickbait.

========================
BENEFIT
========================

When appropriate, explain why an actual product feature is useful.

Do not exaggerate benefits.

Only describe benefits that are reasonably supported by the product.

========================
AUDIENCE
========================

Respect the selected audience.

Myanmar Customer:
Use broadly understandable Burmese.

Young:
Use modern, casual and natural language.

Women:
Focus on relevant style, appearance and convenience when supported.

Men:
Focus on relevant style, practicality and usage when supported.

Premium:
Use elegant and refined language with fewer emojis.

Budget:
Focus on practical value without falsely claiming the product is the cheapest.

========================
TONE
========================

Respect the selected tone.

Natural:
Conversational, simple and human.

Professional:
Clear, trustworthy and organized without being too formal.

Friendly:
Warm and approachable.

Premium:
Elegant, refined and restrained.

Youth:
Modern, casual and natural. Small amounts of common English are acceptable.

Storytelling:
Use a relatable situation connected to the product.

Do not create fake customer stories.

========================
PRICE
========================

If a price is provided, use exactly that price.

Never change the price.

Never invent a discount.

Never invent a promotion.

Never claim something is on sale unless the seller provides that information or selects a sale context.

========================
CTA
========================

Create natural CTAs suitable for Myanmar online shops.

Examples:

"အသေးစိတ်သိချင်ရင် Messenger မှာ မေးမြန်းနိုင်ပါတယ်။"

"မှာယူချင်ရင် Page Messenger ကနေ ဆက်သွယ်နိုင်ပါတယ်။"

"Size / color သိချင်ရင် Message ပို့ပြီး မေးနိုင်ပါတယ်။"

Do not invent phone numbers, addresses or links.

Do not use aggressive repeated CTAs.

========================
SHORT CAPTION
========================

Create a concise version suitable for social media.

Include the product, main benefit and price when available.

Keep it natural.

========================
AD COPY
========================

Create a slightly more persuasive version suitable for advertising.

It must remain truthful and human-sounding.

Do not exaggerate.

Do not make unsupported promises.

========================
HASHTAGS
========================

Create relevant hashtags only.

Use a reasonable number.

Use Myanmar and English hashtags only when useful.

Avoid irrelevant trending hashtags.

========================
PRODUCT HIGHLIGHTS
========================

Return 3 to 6 short and specific product highlights.

Only include information supported by the image or seller information.

Do not repeat the same idea.

========================
CTAS
========================

Return 2 to 4 different natural CTA options.

Avoid repetitive wording.

========================
LANGUAGE
========================

Primary language: Myanmar Burmese.

English may be used naturally for:
- Brand names
- Product names
- Common fashion terms
- Common technology terms
- Social-media terminology
- Hashtags

Do not randomly mix English into Burmese.

Use natural Myanmar sentence structure.

========================
EMOJI
========================

Use emojis sparingly.

Do not put emojis in every sentence.

Premium content should use very few emojis.

========================
QUALITY CHECK
========================

Before returning the answer, silently check:

1. Does this sound like a real Myanmar seller wrote it?
2. Is the Burmese natural?
3. Did I understand the actual product?
4. Did I invent any information?
5. Is the audience correct?
6. Is the selected tone correct?
7. Is the CTA natural?
8. Is the content useful?
9. Did I avoid generic AI-style phrases?
10. Can the seller post it directly?

If anything sounds like generic AI marketing language, rewrite it.

========================
OUTPUT
========================

Return ONLY the requested JSON structure.

Do not include markdown code fences.

Do not include explanations outside the JSON.
`;

export default async function handler(req, res) {

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

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {

    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        success: false,
        error:
          "OPENAI_API_KEY is not configured in Vercel."
      });
    }

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

    if (
      !imageData ||
      typeof imageData !== "string"
    ) {
      return res.status(200).json({
        success: false,
        error:
          "Product image is required."
      });
    }

    if (
      !imageData.startsWith("data:image/")
    ) {
      return res.status(200).json({
        success: false,
        error:
          "Invalid image format."
      });
    }

    const imageSizeMB =
      Buffer.byteLength(
        imageData,
        "utf8"
      ) / (1024 * 1024);

    if (imageSizeMB > 8) {
      return res.status(200).json({
        success: false,
        error:
          "Product image is too large. Please use an image smaller than 8MB."
      });
    }

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

Analyze the uploaded product image carefully.

Use the image together with the seller information.

Do not invent information that cannot be confirmed.

Write natural Myanmar content suitable for a real Myanmar online shop.

The result must be ready for the seller to review and post.
`;

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
                    type: "input_text",
                    text: SYSTEM_PROMPT
                  }
                ]
              },

              {
                role: "user",

                content: [

                  {
                    type: "input_text",
                    text: userPrompt
                  },

                  {
                    type: "input_image",
                    image_url: imageData
                  }

                ]
              }

            ],

            text: {

              format: {

                type: "json_schema",

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
