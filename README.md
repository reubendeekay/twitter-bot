# Automated Twitter Bot
Automated Bot for posting relevant and smart tech tweets 
Check the example on my [Twitter Account](https://twitter.com/kid_indigoo).
The bot uses serverless Node Js[(Firebase Cloud Functions)](https://firebase.google.com/products/functions) and [OpenAI GPT3 Model](https://openai.com/api/).

# How to Use
* Create a Firebase Project and copy the firebaseConfig from your project settings
* Enable Firestore test mode(Or Production mode, however you will have to allow read and write writes unconditionally without auth access)
* Creating an app(bot category) on [Twitter Developers Console](https://developer.twitter.com/)
* Enabling Twitter Oauth2. Save client secret safely
* Add the call back URL after intially pushing the code to Firebase Cloud Functions(Copy+paste the url with the endpoint /callback from your console)
* Replace the Twitter client secret and ID in the code
* Sign up for [OpenAI](https://openai.com/api/) and copy +paste the api key and organisation ID in the code
* Tweak the keywords/prompts or the cron job to best fit your use case.
* Deploy to Firebase
* Run /auth to initialise the bot and grant it permission
* Enjoy

