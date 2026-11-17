export const project = {
  introduction: `For this project, we used Google Teachable Machine to make an image classifier for handwritten Hindi, Telugu, and English. 
  We wanted to see if the model could tell the difference between the three languages based on handwritten examples. We also wanted to test 
  it on new images instead of only seeing how it worked with the images it was trained on.`,

  researchQuestion: `Can a Teachable Machine image model trained using our handwritten Hindi, Telugu, and English examples correctly classify
  new handwriting that was not part of its training data? We also wanted to see if adding more variety to the training images would make the 
  model work better.`,

  collection: `All of the images in our dataset were made by us. We wrote different examples by hand and took pictures of them instead of using 
  images from the internet. Our first full dataset had 301 images total: 100 Hindi, 100 Telugu, and 101 English.

After testing the model, we decided that we needed more variety in the dataset. We collected 10 more images for each language. For these 
images, we changed things like the paper, size of the writing, amount of text, position on the page, camera distance, lighting, and angle. 
Some images had single words while others had short phrases or sentences.`,

  methodology: `We went through a few versions of the model instead of just training it once.

For V1, we started with only Hindi and Telugu. This was mainly our first experiment to see how the model behaved. It could recognize some 
new examples, but we also noticed problems when the handwriting changed.

V2 was our first full model with all three classes: Hindi, Telugu, and English. After training it, we tested it using 9 new images, with 3 
from each language.

The V2 results were not very good, so we collected more varied images for each language. Out of the 10 new images for each language, we kept 
images 1-3 out of the training data for testing. We added images 4-10 to the training data and trained V3. We then tested V3 using the same 9 
test images so we could compare the two versions.`,

  training: `V2 had 301 training images: 100 Hindi, 100 Telugu, and 101 English. We used 50 epochs, a batch size of 16, and a learning 
  rate of 0.001.

For V3, we added 7 more training images for each language. This gave us 107 Hindi images, 107 Telugu images, and 108 English images, or 322 
images total. We kept the training settings the same as V2 so the main change between the two models was the additional training data.`,

  testing: `We used the same 9 held-out images to test V2 and V3. There were 3 Telugu, 3 Hindi, and 3 English test images.

V2 got 3 out of 9 correct. It got 1/3 Telugu, 0/3 Hindi, and 2/3 English correct. We also noticed that some of its wrong answers had really 
high confidence. One Telugu image was predicted as English with 100% confidence, one Hindi image was predicted as Telugu with 100% confidence,
and one English image was predicted as Hindi with 95% confidence.

V3 did much better on the same test images and got 7 out of 9 correct. It got all 3 Telugu images correct, 2/3 Hindi images correct, and 2/3 
English images correct. One of the clearest changes was Telugu Test 1. V2 predicted it as English with 100% confidence, but V3 predicted the 
same image as Telugu with 99% confidence.

V3 was still not perfect. One Hindi image was predicted as Telugu with 99% confidence and one English image was predicted as Hindi with 76% 
confidence. Since we only tested 9 images, 7/9 does not mean that the model is 77.8% accurate in general. It is just the result we got from 
our test set.`,

  limitations: `One problem with our dataset is that each language was mostly written by one person. Because of this, the model might be 
  learning parts of that person's handwriting style along with the actual differences between the scripts. Things like the paper, background, 
  lighting, or the way someone writes could also affect what the model predicts.

Our test set was also pretty small. We only had 9 held-out images, so we cannot use our results to say that the model would work the same way 
with everyone's handwriting.

Another thing we noticed was that confidence did not always mean the model was right. Sometimes it was almost 100% confident and still chose
the wrong language. This was probably one of the most interesting things we saw while testing because just looking at the confidence number 
can make the prediction seem more reliable than it actually is.`,

  ethics: `This project made it easier to see how much the data we give a model matters. Teachable Machine does not actually understand Hindi,
  Telugu, or English. It is using patterns from the images we gave it to decide which class a new image looks most similar to.

This also made us think more about representation in training data. If most of the examples for one class come from one person's handwriting, 
that person is basically being used to represent the whole class in our dataset. Someone with very different handwriting might get a different
result.

Our project is a small experiment and the consequences of getting a language wrong here are not serious. But the same issue becomes much more 
important when machine learning is used to make decisions about actual people. It is important to look at who and what is represented in the 
training data instead of assuming that the output of a model is automatically neutral or correct.`,

  readings: `Our results reminded us of Joy Buolamwini's work on bias in AI. One of the main things we took from her work was the importance 
  of looking at who is represented in the data and actually testing whether a system works for different groups.

Our project is obviously different because we were classifying handwriting and not people. We are not trying to compare our mistakes with the 
discrimination or harms discussed in her work. What connected for us was the issue with the data. Our own model showed that what we included 
in the training set affected what the model was able to recognize later.

It also connects to Code and Power because the model's results are not just something that appeared on their own. We chose the three 
categories, collected the examples, decided what went into training, and decided how to test it. Seeing a label with something like 99% 
confidence can make the result look objective, even though we had examples where a 99% confident answer was actually wrong.`,

  references: ,

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

  metrics: {
    collectedImages: "322",
    heldOutImages: "9",
    accuracy: "7/9 on our final held-out test set"
  },
};
