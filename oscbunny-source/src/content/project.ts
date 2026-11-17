/** Group project statement, split across the Project statement sections.
 * Student-written content only. Paragraphs are separated by a blank line.
 */
export const project = {
  introduction: `When we first started this project I honestly thought our idea would be pretty straightforward. We decided to make a model that could recognize handwritten Hindi, Telugu and English. These three look very different to me when I see them written down. Because of that I assumed the model would also be able to see those differences pretty easily. I thought that if we gave it enough examples of each language then it would eventually figure out what makes each one different. After actually making the model and testing it I realized that machine learning does not really work as simply as I thought it did.`,

  researchQuestion: `Can a Teachable Machine image model trained using our handwritten Hindi, Telugu, and English examples correctly classify new handwriting that was not part of its training data? We also wanted to see if adding more variety to the training images would make the model work better.`,

  collection: `We used Google Teachable Machine for the project. All of the images in our dataset were made by us. We wrote the examples ourselves and took pictures of them. We did not just download handwriting pictures from the internet. Our first complete dataset had 301 images. We had 100 Hindi images, 100 Telugu images, and 101 English images.

At first 301 images sounded like a lot to me. I thought having around 100 examples for every language should give the model enough information to understand the difference between them. One of the biggest things I learned from this project is that the number of images does not tell the whole story. You can have a lot of images and still have a dataset that is missing important variation.`,

  methodology: `Before we made the complete three language model we experimented with Hindi and Telugu first. We called this V1. This was when I first started noticing that the model might not actually be learning what I thought it was learning.

We tried new handwritten examples to see what would happen. Sometimes the model did recognize them correctly. But when the handwriting changed the results could change a lot too. One of the tests that really stood out to me was a Telugu example written by a different person. The model predicted that it was Hindi with 97% confidence.

That result confused me at first. Telugu and Hindi look different to me. So I started wondering what exactly the model was looking at. Was it actually recognizing the script? Was it recognizing the handwriting style? Was it looking at something about the paper or the picture? I could not really tell just by looking at the prediction.

That was probably the first point where I stopped thinking about the model as something that was actually reading the language.`,

  training: `After that we made V2. This was our first complete model with Hindi, Telugu, and English. The training dataset had 301 images. We trained it using 50 epochs with a batch size of 16 and a learning rate of 0.001.`,

  testing: `We also wanted to test the model with images that were not already part of its training data. I think this was really important. If we only kept showing it examples that were very similar to what it already saw then we could have easily convinced ourselves that the model worked better than it actually did.

For testing we used nine new images. We had three Telugu images, three Hindi images, and three English images.

I expected V2 to do pretty well. Instead it only got 3 out of 9 correct.

For Telugu it got 1 out of 3 correct. For Hindi it got 0 out of 3 correct. For English it got 2 out of 3 correct.

The mistakes were interesting too because the model was not always unsure when it was wrong. Sometimes it was extremely confident. One Telugu image was predicted as English with 100% confidence. One Hindi image was predicted as Telugu with 100% confidence. One English image was predicted as Hindi with 95% confidence.

This was probably the most surprising part of the whole project for me.

Before doing this project I think seeing something like "100%" from an AI system would automatically make me trust the answer more. It feels like the computer must know what it is doing if it is that confident. But here I already knew the correct answer because these were our own images. I was literally watching the model tell me the wrong answer with 100% confidence.

That made me look at confidence scores very differently.

After V2 we did not want to just accept the bad result and move on. We looked at our dataset again. We thought one problem could be that our training pictures were too similar to each other. So we decided to collect more images with more differences between them.

We made 10 additional images for every language. This time we purposely changed different things. We used lined paper and blank paper. We changed the size of the handwriting. We changed where the writing was on the page. We used single words, phrases, and sentences. We also changed the distance from the camera. Some pictures had different lighting or a different angle.

We did not put all of those new images into the training set. We kept the first three new images for every language separate for testing. We added the other seven images from each language to the training data.

That gave V3 a total of 322 training images. It had 107 Hindi images, 107 Telugu images, and 108 English images.

We kept the same training settings that we used for V2. I liked that we did this because it made the comparison easier. We were not changing the settings and the dataset at the same time. The main thing we changed was the training data.

Then we tested V3 using the same nine held out images.

This time it got 7 out of 9 correct.

It got all three Telugu images correct. It got two of the three Hindi images correct. It also got two of the three English images correct.

One result showed the change especially well. In V2 our first Telugu test image was classified as English with 100% confidence. When we tested that exact same image with V3 the model classified it as Telugu with 99% confidence.

I thought that was really interesting because we did not suddenly build a completely different type of AI. We mostly changed the examples that the model learned from. Our result on the same small test set went from 3 out of 9 to 7 out of 9.

That showed me how much power the training data actually has.`,

  limitations: `At the same time I do not think our final result means that our model is just 77.8% accurate. We only tested nine held out images. That is a very small test. If we gave it 100 completely new images from different people then we might get a very different result.

V3 also still made mistakes.

One Hindi image was predicted as Telugu with 99% confidence. One English image was predicted as Hindi with 76% confidence. So even after improving the training data we still had the same basic problem where the model could be confident and wrong.

There is also another limitation that I think is really important. Each language was mostly represented by one person's handwriting. At the beginning I did not really see that as such a big problem. We were giving it Hindi examples for Hindi and Telugu examples for Telugu. That seemed reasonable.

After testing the model I see the problem much more clearly.

One person's handwriting cannot represent everybody who writes that language. If most of the Telugu examples come from one person's handwriting then the model could start connecting that person's writing style with Telugu. The same problem can happen with Hindi and English. It could also learn something about the paper or the way we took the pictures.

If I were continuing this project this is probably the first thing I would change. I would get handwritten examples from a lot more people for every language. I would also make a much larger test set from people whose handwriting was never included in the training data.`,

  ethics: `This project made it easier to see how much the data we give a model matters. Teachable Machine does not actually understand Hindi, Telugu, or English. It is using patterns from the images we gave it to decide which class a new image looks most similar to.

This also made us think more about representation in training data. If most of the examples for one class come from one person's handwriting, that person is basically being used to represent the whole class in our dataset. Someone with very different handwriting might get a different result.

Our project is a small experiment and the consequences of getting a language wrong here are not serious. But the same issue becomes much more important when machine learning is used to make decisions about actual people. It is important to look at who and what is represented in the training data instead of assuming that the output of a model is automatically neutral or correct.`,

  readings: `This is also where Unmasking AI became much more real to me.

One of the biggest lessons I took from Joy Buolamwini is that we cannot just ask whether an AI system works. We also have to ask who was represented when it was made and who it was actually tested on.

Obviously our handwriting classifier is not the same as the systems Buolamwini discusses. If our model calls Telugu Hindi then nobody is being denied an opportunity or being harmed by a serious decision. I do not think those things should be compared like they have the same consequences.

What connected with me was the problem underneath it.

The model only knows the examples that we give it.

That sounds extremely obvious when I write it down. But I do not think I really understood how important it was until I watched our own model fail.

We named one class "Telugu." But the model was not somehow given an understanding of Telugu. It was given our collection of images that we decided would represent Telugu. Those are two very different things.

The same is true for Hindi and English.

That made me understand the problem of representation in AI better. If certain people or certain types of examples are missing from the data then the system does not magically understand them anyway. It learned from what somebody chose to give it.

Another part of Unmasking AI that stayed with me during this project was the idea of questioning AI systems instead of automatically trusting them because they look technical or objective.

Our model gives us a label and then gives us a percentage beside it. That percentage makes the result look very official. Telugu 99% looks a lot more convincing than just saying I think this is Telugu.

But our testing showed that the percentage can be misleading if we do not understand what it means. We had a prediction that was 100% confident and completely wrong. We had another that was 99% confident and wrong.

That is probably the result I will remember most from this project.

It also made the idea of Code and Power make more sense to me. Before this project it was easy to think of the computer as the thing making the decision. But there were people behind basically every part of our model. We chose Hindi, Telugu, and English as the categories. We decided what examples to collect. We decided how many images to use. We decided what went into training and what stayed out for testing. We decided what changes to make after V2 failed.

The model did not make any of those decisions.

I think the biggest thing I learned from this project actually came from the model not working very well at first. If V2 had gotten all nine images correct then I probably would have thought we made a really good model and moved on. Getting only 3 out of 9 forced me to question what the model had actually learned.

Then getting 7 out of 9 after changing our dataset showed me that the data really matters. But the two remaining mistakes also reminded me that improving a model does not mean that all of its problems are suddenly gone.

Before this assignment I mostly thought about machine learning in terms of whether a model gives the correct answer. Now I think there are more questions I would ask. What was it trained on? Who created that data? What is missing from it? Has it actually been tested on something different from its training data? What does the confidence score really mean? Who might the model work well for and who might it fail for?

For me that is the biggest connection between this project and Unmasking AI. Building a model was useful. But seeing how easily our own choices affected what the model learned was much more useful. It made AI feel less like some independent system that just knows things and more like something that reflects the examples and decisions that people put into it.`,

  aiUsage: `We used an AI assistant (Claude, made by Anthropic) to help us redesign and build this website. It helped with the page layout and visual design, the website code, setting up our Teachable Machine model on this page, and fixing bugs, such as how photos are prepared before they are sent to the model. It also helped us organize our dataset files on GitHub.

We did not use AI to create any of our data. Every handwriting image in our dataset was written and photographed by us. We also did not use AI to write our project statement or analysis. The writing on this page is our own.`,

  contributors: [
    "Nireekshana Shivarathri",
    "Yuthika Goel",
    "Madeline Root"
  ],

  languages: [
    "Hindi",
    "Telugu",
    "English"
  ],

  /** Who collected each language's images, split into V3 training and held-out test images. */
  dataset: [
    { language: "Hindi", glyph: "अ", contributor: "Yuthika Goel", training: 107, test: 3 },
    { language: "Telugu", glyph: "అ", contributor: "Nireekshana Shivarathri", training: 107, test: 3 },
    { language: "English", glyph: "A", contributor: "Madeline Root", training: 108, test: 3 },
  ],

  metrics: {
    collectedImages: "322",
    heldOutImages: "9",
    accuracy: "7/9 on our final held-out test set"
  },
};
