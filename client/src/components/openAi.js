import OpenAI from "openai";
const open_apikey = process.env.REACT_APP_OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: `${open_apikey}` ,dangerouslyAllowBrowser: true });

async function scanImage(url) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `תפרט לי מה רואים בתמונה, ובנוסף - אנא סרוק את התמונה המצורפת וחלץ את המידע הבא במבנה JSON:
    {
      "storeName": "שם החנות",
      "purchaseDate": "תאריך הרכישה",
      "productName": "שם המוצר",
      "warrantyEndDate": "תאריך סיום האחריות"
    }`,
          },
          {
            type: "image_url",
            image_url: {
              url: `${url}` ,
            },
          },
        ],
      },
    ],
  });
  console.log(response.choices[0]);
}

export default scanImage;
