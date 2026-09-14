const SYSTEM_PROMPT = `
You are a professional Myanmar-market product copywriter.

Your job is to analyze the product image and the information provided by the seller, then create natural, persuasive, human-sounding marketing content for Myanmar online sellers.

IMPORTANT WRITING RULES:

1. Write primarily in natural Burmese.
2. Use English only when it naturally fits:
   - brand names
   - product names
   - common marketing terms
   - short phrases
   - hashtags
3. Never sound like generic AI writing.
4. Never sound like a translation.
5. Never sound like a textbook or corporate advertisement.
6. Write like an experienced Myanmar social-media seller/content writer.
7. Understand Myanmar online shopping behavior and social-media language.
8. Match the requested audience.
9. Match the requested tone.
10. Do not use excessive emojis.
11. Do not invent product specifications.
12. Do not invent ingredients.
13. Do not invent certifications.
14. Do not invent guarantees.
15. Do not invent discounts.
16. Do not invent features that cannot be seen or were not provided.
17. Do not invent a price.
18. If information is uncertain, avoid making a specific claim.
19. Make the caption useful and actually suitable for posting.
20. Avoid repetitive AI-style phrases.

Return ONLY valid JSON.

The JSON must contain exactly these fields:

caption
short_caption
hashtags
ad_copy
product_highlights
ctas

product_highlights must be an array of strings.

ctas must be an array of strings.
`;

export default async function handler(req, res) {
  /*
   * =========================
   * CORS
   * =========================
   */

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

  /*
   * =========================
   * OPTIONS
   * =========================
   */

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  /*
   * =========================
   * ONLY POST
   * =========================
   */

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    /*
     * =========================
     * API KEY
     * =========================
     */

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error:
          "OPENAI_API_KEY is not configured."
      });
    }

    /*
     * =========================
     * REQUEST DATA
     * =========================
     */

    const body = req.body || {};

    const imageData = body.imageData || "";

    const productName =
      body.productName || "";

    const price =
      body.price || "";

    const description =
      body.description || "";

    const audience =
      body.audience || "မြန်မာ Customer";

    const tone =
      body.tone || "သဘာဝဆန်ဆန်";

    const platform =
      body.platform || "Facebook";

    const designStyle =
      body.designStyle || "Premium";

    const font =
      body.font || "Noto Sans Myanmar";

    /*
     * =========================
     * IMAGE CHECK
     * =========================
     */

    if (!imageData) {
      return res.status(400).json({
        error:
          "Product image is required."
      });
    }

    /*
     * =========================
     * IMAGE FORMAT CHECK
     * =========================
     */

    if (
      !imageData.startsWith(
        "data:image/"
      )
    ) {
      return res.status(400).json({
        error:
          "Invalid product image format."
      });
    }

    /*
     * =========================
     * MODEL
     * =========================
     */

    const model =
      process.env.OPENAI_MODEL ||
      "gpt-5.6-luna";

    /*
     * =========================
     * USER PROMPT
     * =========================
     */

    const userPrompt = `
Analyze the attached product image carefully.

Create ready-to-post marketing content specifically for this product.

SELLER INFORMATION:

Product name:
${productName}

Price:
${price}

Description:
${description}

Target audience:
${audience}

Writing tone:
${tone}

Platform:
${platform}

Design style:
${designStyle}

Myanmar font preference:
${font}


CONTENT REQUIREMENTS:

Write the main caption naturally in Burmese.

The caption should:
- immediately communicate what the product is
- mention useful visible/provided characteristics
- feel natural for Myanmar customers
- be persuasive without sounding exaggerated
- include a natural call-to-action
- be ready to post on social media

Create a shorter version for short_caption.

Create relevant hashtags for Myanmar social media.

Create ad_copy suitable for a short promotional advertisement.

Create 3-6 useful product_highlights.

Create 2-4 natural CTAs.

Do NOT invent information that is not visible in the image or provided by the seller.

Return ONLY valid JSON.
`;

    /*
     * =========================
     * OPENAI REQUEST
     * =========================
     */

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

            /*
             * Structured JSON output.
             * OpenAI Responses API supports
             * JSON Schema through text.format.
             */

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

    /*
     * =========================
     * READ OPENAI RESPONSE
     * =========================
     */

    const data =
      await openAIResponse.json();

    /*
     * =========================
     * OPENAI ERROR
     * =========================
     */

    if (!openAIResponse.ok) {
      console.error(
        "OpenAI API Error:",
        data
      );

      return res.status(
        openAIResponse.status
      ).json({
        error:
          data?.error?.message ||
          "OpenAI request failed."
      });
    }

    /*
     * =========================
     * EXTRACT TEXT
     * =========================
     *
     * Do NOT depend only on
     * data.output_text.
     *
     * Raw Responses API data contains
     * generated content inside output.
     */

    let outputText = "";

    /*
     * First try output_text if available.
     */

    if (
      typeof data.output_text ===
      "string" &&
      data.output_text.trim()
    ) {
      outputText =
        data.output_text.trim();
    }

    /*
     * Otherwise extract from output[]
     */

    if (
      !outputText &&
      Array.isArray(data.output)
    ) {
      for (
        const outputItem of data.output
      ) {
        if (
          outputItem &&
          Array.isArray(
            outputItem.content
          )
        ) {
          for (
            const contentItem
              of outputItem.content
          ) {
            if (
              contentItem &&
              typeof contentItem.text ===
                "string"
            ) {
              outputText +=
                contentItem.text;
            }
          }
        }
      }
    }

    outputText =
      outputText.trim();

    /*
     * =========================
     * EMPTY RESPONSE
     * =========================
     */

    if (!outputText) {
      console.error(
        "OpenAI returned no text:",
        JSON.stringify(data)
      );

      return res.status(502).json({
        error:
          "AI returned an empty response."
      });
    }

    /*
     * =========================
     * REMOVE CODE FENCES
     * =========================
     *
     * Safety fallback in case the
     * model returns ```json ... ```
     */

    outputText =
      outputText
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

    /*
     * =========================
     * PARSE JSON
     * =========================
     */

    let result;

    try {
      result =
        JSON.parse(outputText);
    } catch (parseError) {
      console.error(
        "JSON Parse Error:",
        parseError
      );

      console.error(
        "AI RAW OUTPUT:",
        outputText
      );

      return res.status(502).json({
        error:
          "AI returned invalid JSON.",
        raw:
          outputText.slice(0, 1000)
      });
    }

    /*
     * =========================
     * VALIDATE RESULT
     * =========================
     */

    if (
      typeof result.caption !==
      "string"
    ) {
      result.caption = "";
    }

    if (
      typeof result.short_caption !==
      "string"
    ) {
      result.short_caption = "";
    }

    if (
      typeof result.hashtags !==
      "string"
    ) {
      result.hashtags = "";
    }

    if (
      typeof result.ad_copy !==
      "string"
    ) {
      result.ad_copy = "";
    }

    if (
      !Array.isArray(
        result.product_highlights
      )
    ) {
      result.product_highlights =
        [];
    }

    if (
      !Array.isArray(
        result.ctas
      )
    ) {
      result.ctas = [];
    }

    /*
     * =========================
     * SUCCESS
     * =========================
     */

    return res.status(200).json({
      caption:
        result.caption,

      short_caption:
        result.short_caption,

      hashtags:
        result.hashtags,

      ad_copy:
        result.ad_copy,

      product_highlights:
        result.product_highlights,

      ctas:
        result.ctas
    });

  } catch (error) {

    /*
     * =========================
     * SERVER ERROR
     * =========================
     */

    console.error(
      "Server Error:",
      error
    );

    return res.status(500).json({
      error:
        error?.message ||
        "Server error."
    });
  }
}
