const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const { GoogleAIFileManager } = require("@google/generative-ai/server");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

const apiKey = process.env.GKEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

/**
 * Uploads the given file to Gemini.
 *
 * See https://ai.google.dev/gemini-api/docs/prompting_with_media
 */
async function uploadToGemini(path, mimeType) {
  const uploadResult = await fileManager.uploadFile(path, {
    mimeType,
    displayName: path,
  });
  const file = uploadResult.file;
  console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
  return file;
}

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: "Hey you are agricultural scientist, and you help farmers by diagonising and giving them proper guide in all ways and you answer always in json format",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function run(image) {
  // TODO Make these files available on the local file system
  // You may need to update the file paths
  const files = [
    await uploadToGemini("./public/t.jpg", "image/png"),
    await uploadToGemini("./public/a.jpg", "image/png"),
  ];

  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              mimeType: files[0].mimeType,
              fileUri: files[0].uri,
            },
          },
        ],
      },
      {
        role: "model",
        parts: [
          { text: "```json\n{\n    \"diagnosis\": {\n      \"disease\": \"Early Blight\",\n      \"confidence\": 0.95,\n      \"symptoms\": [\n        \"Dark brown or black spots on leaves, often with concentric rings resembling a target.\",\n        \"Yellowing of tissue around the spots.\",\n        \"Spots may enlarge and merge, leading to defoliation.\",\n        \"Lesions can also appear on stems and fruit, starting near the stem end.\"\n      ],\n      \"image_analysis\": {\n        \"observed_symptoms\": [\n          \"Leaf spots with concentric rings.\",\n          \"Yellowing around lesions.\",\n          \"Lesion size and appearance consistent with Early Blight.\"\n        ]\n      }\n    },\n    \"recommendations\": {\n      \"preventive_measures\": [\n        \"Use disease-free seeds and transplants.\",\n        \"Improve air circulation around plants by pruning and spacing them properly.\",\n        \"Avoid overhead irrigation; water at the base of the plants.\",\n        \"Mulch around plants to prevent soil from splashing onto leaves.\",\n        \"Rotate crops annually to avoid build-up of the pathogen in the soil.\"\n      ],\n      \"treatment\": [\n        {\n          \"type\": \"Fungicide\",\n          \"active_ingredients\": [\n            \"Chlorothalonil\",\n            \"Mancozeb\",\n            \"Copper-based fungicides\",\n            \"Azoxystrobin\",\n            \"Pyraclostrobin\"\n          ],\n          \"application_instructions\": \"Apply fungicides according to label instructions, starting when symptoms first appear.  Repeat applications may be necessary, especially during periods of wet weather.  Alternate between different fungicide classes to prevent resistance development.\",\n          \"organic_options\": [\n            \"Copper-based fungicides\",\n            \"Bacillus subtilis-based biofungicides\"\n          ],\n          \"notes\": \"Always follow label instructions for proper dosage and application methods.\"\n        },\n        {\n          \"type\": \"Cultural Practices\",\n          \"instructions\": [\n            \"Remove and destroy infected leaves immediately to prevent further spread.\",\n            \"Ensure proper plant nutrition to enhance plant resistance.\",\n            \"Maintain optimal soil drainage to prevent waterlogging.\"\n          ]\n        }\n      ]\n    }\n  }\n```" },
        ],
      },
      {
        role: "user",
        parts: [
          {
            fileData: {
              mimeType: files[1].mimeType,
              fileUri: files[1].uri,
            },
          },
        ],
      },
      {
        role: "model",
        parts: [
          { text: "```json\n{\n    \"diagnosis\": {\n        \"disease\": \"Apple Scab\",\n        \"confidence\": 0.95,\n        \"symptoms\": [\n            \"Olive-green to brown spots on leaves, which may later turn black and become velvety.\",\n            \"Circular, olive-brown lesions on fruit, which can become scabby and cracked.\",\n            \"Premature leaf drop in severe cases.\",\n            \"Infected fruit may become distorted and stunted.\"\n        ],\n        \"image_analysis\": {\n            \"observed_symptoms\": [\n                \"Visible lesions on the fruit surface.\",\n                \"Lesions appear scabby and discolored.\",\n                \"Shape and pattern of spots are consistent with Apple Scab.\"\n            ]\n        }\n    },\n    \"recommendations\": {\n        \"preventive_measures\": [\n            \"Plant disease-resistant apple varieties.\",\n            \"Prune trees to improve air circulation and sunlight penetration.\",\n            \"Rake and remove fallen leaves in the autumn to reduce overwintering inoculum.\",\n            \"Apply preventative fungicide sprays during the growing season, especially during periods of wet weather.\"\n        ],\n        \"treatment\": [\n            {\n                \"type\": \"Fungicide\",\n                \"active_ingredients\": [\n                    \"Captan\",\n                    \"Myclobutanil\",\n                    \"Dodine\",\n                    \"Mancozeb\",\n                    \"Thiophanate-methyl\"\n                ],\n                \"application_instructions\": \"Apply fungicides according to label instructions, starting at bud break and continuing through fruit set.  Repeat applications may be necessary, especially during periods of wet weather. Alternate between different fungicide classes to prevent resistance development.\",\n                \"organic_options\": [\n                    \"Sulfur-based fungicides\",\n                    \"Lime sulfur\",\n                    \"Copper-based fungicides (less effective as a curative treatment)\"\n                ],\n                \"notes\": \"Ensure thorough coverage of all plant parts. Monitor weather conditions and apply fungicides preventatively during periods favorable for disease development.\"\n            },\n            {\n                \"type\": \"Cultural Practices\",\n                \"instructions\": [\n                    \"Remove and destroy infected fruit to reduce inoculum.\",\n                    \"Improve air circulation around trees by pruning.\",\n                    \"Avoid overhead irrigation to reduce leaf wetness.\"\n                ]\n            }\n        ]\n    }\n}\n ```" },
        ],
      },
    ],
  });
  try {
    const parts = [
      {
        inlineData: {
          mimeType: 'image/jpeg', // Or 'image/png', adjust as needed
          data: image,
        },
      },
    ];

    const result = await chatSession.sendMessage(parts);
    // console.log(result.response.text());
    return (result.response.text());



  } catch (error) {
    return error
  }
}

// const image = fs.readFileSync("./guin.jpg", { encoding: "base64" });
// console.log(image);


// run(image);
module.exports = run;