const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firebaseConfig = {
  //Get the Config from the Firebase Console
};

admin.initializeApp(firebaseConfig);
// Database reference
const dbRef = admin.firestore().doc("twitter-bot/config");

// Twitter API init
const TwitterApi = require("twitter-api-v2").default;
const twitterClient = new TwitterApi({
  clientId: " ",
  clientSecret: " ",
});

//Change this to your callback endpoint after you push the code to your Firebase Console
const callbackURL =
  "https://us-central1-twitter-bot-c116f.cloudfunctions.net/callback";

// OpenAI API init
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  organization: "",
  apiKey: " ",
});
const openai = new OpenAIApi(configuration);

//Choose your Keywords
const prompts = [
  "something from a popular TV show",
  "Android",
  "iOS",
  "Flutter",
  "React",
  "React Native",
  "Swift",
  "Java",
  "Kotlin",
  "Google Developer Student Club",
  "Python",
  "Flutter Web",
  "Node.js",
  "LinkedIn",
  "Golang",
  "JavaScript",
  "TypeScript",
  "Productivity",
  "Linux",
  "Windows",
  "MacOS",
  "Artificial Intelligence",
  "Machine Learning",
  "Google Developer Student Club",
  "Natural Language Processing",
  "Blockchain",
  "Cryptocurrency",
  "Cloud",
  "DevOps",
  "Data Science",
  "Data Structures",
  "Algorithms",
  "Databases",
  "Data Mining",
  "Data Visualization",
  "Google Developer Student Club",
  "Data Analysis",
  "Data Engineering",
  "Data Warehousing",
  "Good Portfolio",
  "Kubernetes",
  "Docker",
  "AWS",
  "Azure",
  "Google Cloud",
  "Google Cloud Platform",
  "Google Developer Student Club",
  "Firebase",
  "Firebase Cloud Functions",
  "Firebase Cloud Storage",
  "Firebase Realtime Database",
  "Firebase Firestore",
  "Firebase Hosting",
  "Firebase Authentication",
  "Firebase Database",
  "Computer Science",
  "Data Structures",
  "Figma",
  "Adobe XD",
  "Git",
  "Google Developer Student Club",
  "Github",
  "Microsoft",
  "Apple",
  "Internship",
  "Job",
  "Job Search",
  "Job Interview",
  "Job Interview Questions",
  "Job Interview Questions and Answers",
  "Venture Capitalism",
  "Student Life",
  "Kenya",
  "Google Developer Student Club",
  "Technology",
  "#100DaysOfCode",
  "#FlutterDevs",
  "#Flutter",
  "#FlutterDev",
  "#NodeJS",
  "Tech joke",
  "FastAPI",
  "Fastify",
  "PostgreSQL",
  "Postgres",
  "OpenAI",
  "Google Developer Student Club",
];

// STEP 1 - Auth URL
exports.auth = functions.https.onRequest(async (request, response) => {
  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
    callbackURL,
    { scope: ["tweet.read", "tweet.write", "users.read", "offline.access"] }
  );

  // store verifier
  await dbRef.set({ codeVerifier, state });

  response.redirect(url);
});

// STEP 2 - Verify callback code, store access_token
exports.callback = functions.https.onRequest(async (request, response) => {
  const { state, code } = request.query;

  const dbSnapshot = await dbRef.get();
  const { codeVerifier, state: storedState } = dbSnapshot.data();

  if (state !== storedState) {
    return response.status(400).send("Stored tokens do not match!");
  }

  const {
    client: loggedClient,
    accessToken,
    refreshToken,
  } = await twitterClient.loginWithOAuth2({
    code,
    codeVerifier,
    redirectUri: callbackURL,
  });

  await dbRef.set({ accessToken, refreshToken });

  const { data } = await loggedClient.v2.me(); // start using the client if you want

  // response.send(data);
  response.sendStatus(200);
});

// STEP 3 - Refresh tokens and post tweets
exports.tweet = functions.https.onRequest(async (request, response) => {
  const { refreshToken } = (await dbRef.get()).data();

  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await twitterClient.refreshOAuth2Token(refreshToken);

  await dbRef.set({ accessToken, refreshToken: newRefreshToken });
  console.log("Running!");
  try {
    const nextTweet = await openai.createCompletion({
      model: "text-davinci-002",
      prompt: `tweet something cool about ${
        prompts[Math.floor(Math.random() * prompts.length)]
      } for #techtwitter`,
      max_tokens: 164,
    });
    console.log(nextTweet);

    const { data } = await refreshedClient.v2.tweet(
      nextTweet.data.choices[0].text
    );
    console.log(data);
    response.send(data);
  } catch (e) {
    console.log(e);
    response.send(e);
  }
});

exports.tweetHourly = functions.pubsub
  .schedule("*/30 * * * *")
  .onRun(async (context) => {
    const { refreshToken } = (await dbRef.get()).data();

    const {
      client: refreshedClient,
      accessToken,
      refreshToken: newRefreshToken,
    } = await twitterClient.refreshOAuth2Token(refreshToken);

    await dbRef.set({ accessToken, refreshToken: newRefreshToken });

    const nextTweet = await openai.createCompletion({
      model: "text-davinci-002",
      prompt: `tweet something cool for about ${
        prompts[Math.floor(Math.random() * prompts.length)]
      } for #techtwitter`,
      max_tokens: 164,
    });
    console.log(nextTweet);

    const { data } = await refreshedClient.v2.tweet(
      nextTweet.data.choices[0].text
    );
    console.log(data);
  });
