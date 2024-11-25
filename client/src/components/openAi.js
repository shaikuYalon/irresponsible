import OpenAI from "openai";
const open_apikey = process.env.REACT_APP_OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: `${open_apikey}`,
  dangerouslyAllowBrowser: true,
});

async function scanImage(url) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an assistant that extracts information from images and returns it in the following JSON format. If no information exists, return an empty field:
          {
            "storeName": "שם החנות",
            "productName": "שם המוצר",
            "purchaseDate": "תאריך הרכישה",
            "warrantyEndDate": "תאריך סיום האחריות"
          }`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Here is the URL of an image containing receipt information, Please extract the details and return the JSON",
          },
          {
            type: "image_url",
            image_url: {
              url: `${url}`,
            },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
  });
  console.log(response.choices[0].message.content);

  return response.choices[0].message.content; 
}

export default scanImage;
