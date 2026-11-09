/** Replace the empty string with your exported Teachable Machine IMAGE model URL.
 * Remote example: https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/
 * Local option: put model.json, metadata.json and weights.bin in public/model/,
 * then set modelUrl to './model/'. No model is bundled and no scores are invented.
 */
export const experiment = {
  modelUrl: "", // TODO: paste your final, trained model link here.
  /** Demo video: a YouTube, Vimeo or Google Drive share link, or a local file
   * placed in public/ (e.g. "./demo.mp4"). For Google Drive, set sharing to
   * "Anyone with the link". */
  demoVideoUrl: "", // TODO: your group's original demonstration video link.
  demoCaptionsUrl: "", // TODO: optional WebVTT captions for a local MP4/WebM.
  demoTranscript: "", // TODO: your group's video transcript.
  /** Project links shown in the Research mailbag. Leave blank to show a placeholder. */
  repositoryUrl: "https://github.com/nshivarathri/LIS500.Group_Project-2",
  datasetUrl: "https://github.com/nshivarathri/LIS500.Group_Project-2/tree/main/dataset",
  datasetNote: "", // Optional: one line about what the dataset link contains.
  plannedImages: 300,
  plannedContributors: 3,
  plannedImagesPerPerson: 100,
};
