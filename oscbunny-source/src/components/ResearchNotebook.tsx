import type React from "react";
import {
  BookOpen,
  Film,
  ArrowUpRight,
  FileText,
  CodeXml,
  FolderOpen,
} from "lucide-react";
import { project } from "../content/project";
import { experiment } from "../config";
function WritingSlot({ value, prompt }: { value: string; prompt: string }) {
  return value.trim() ? (
    <div className="student-prose">{value}</div>
  ) : (
    <div className="writing-slot">
      <span>STUDENT WRITING PLACEHOLDER</span>
      <p>{prompt}</p>
    </div>
  );
}
/** Turns a YouTube, Vimeo or Google Drive share link into an embeddable player URL. */
function embedUrl(raw: string) {
  try {
    const url = new URL(raw, document.baseURI);
    const host = url.hostname.replace(/^(www|m)\./, "");
    const parts = url.pathname.split("/").filter(Boolean);
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const id =
        url.searchParams.get("v") ||
        (["shorts", "embed", "live"].includes(parts[0]) ? parts[1] : "");
      if (id && /^[\w-]{11}$/.test(id))
        return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (host === "youtu.be" && /^[\w-]{11}$/.test(parts[0] || ""))
      return `https://www.youtube-nocookie.com/embed/${parts[0]}`;
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = parts.find((p) => /^\d+$/.test(p));
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    if (host === "drive.google.com") {
      const id =
        (parts[0] === "file" && parts[1] === "d" ? parts[2] : "") ||
        url.searchParams.get("id") ||
        "";
      if (/^[\w-]{10,}$/.test(id))
        return `https://drive.google.com/file/d/${id}/preview`;
    }
  } catch {
    /* invalid source is shown through native video error */
  }
  return "";
}
export function Video() {
  const raw = experiment.demoVideoUrl.trim();
  const embed = raw ? embedUrl(raw) : "";
  return (
    <section className="video-section notebook-card" id="demonstration">
      <span className="eyebrow">A LETTER IN MOTION · OUR DEMONSTRATION</span>
      <h2>A peek at our post office.</h2>
      <p className="section-description">
        {raw
          ? "Our demonstration of the classifier in action."
          : "Your group’s original demonstration belongs here."}
      </p>
      {raw ? (
        embed ? (
          <iframe
            title="Our group's Oscbunny demonstration"
            src={embed}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <video controls preload="metadata" src={raw}>
            {experiment.demoCaptionsUrl && (
              <track
                kind="captions"
                src={experiment.demoCaptionsUrl}
                srcLang="en"
                label="English"
                default
              />
            )}
            Your browser cannot play this video. Use the video link below.
          </video>
        )
      ) : (
        <div className="video-placeholder">
          <Film size={40} strokeWidth={1.2} />
          <h3>Your demonstration, coming soon.</h3>
          <p>
            Student video placeholder · add your own recording in{" "}
            <code>src/config.ts</code>.
          </p>
          <small>
            Show the model working, an incorrect prediction, and the interface
            in use. Add captions and your own transcript.
          </small>
        </div>
      )}
      {raw && (
        <a className="text-link" href={raw} target="_blank" rel="noreferrer">
          Open the demonstration <ArrowUpRight size={13} />
        </a>
      )}
      <details>
        <summary>
          <FileText size={14} /> Demonstration transcript
        </summary>
        <WritingSlot
          value={experiment.demoTranscript}
          prompt="Add your group's own transcript in src/config.ts. Include captions for your video."
        />
      </details>
    </section>
  );
}
export default function ResearchNotebook() {
  return (
    <section className="research-notebook" id="notebook">
      <div className="airmail-rule" />
      <div className="notebook-heading">
        <div>
          <span className="eyebrow">THE RESEARCH MAILBAG · LIS 500</span>
          <h2>
            Behind every little letter,
            <br />a bigger question.
          </h2>
          <p>
            A home for your group’s methods, findings, and original analysis.
          </p>
        </div>
        <BookOpen size={52} strokeWidth={1} />
      </div>
      <div className="academic-notice">
        <b>Unfinished student sections</b>
        <p>
          The writing spaces below are intentionally empty. Your group supplies
          the analysis, reflection, citations, training photographs, and
          demonstration. Design and programming assistance does not fill these
          academic sections.
        </p>
      </div>
      <div className="notebook-grid">
        <article className="notebook-card">
          <span className="eyebrow">01 / THE FIRST LETTER</span>
          <h3>Introduction & research question</h3>
          <WritingSlot
            value={project.introduction}
            prompt="Write your group's project introduction and explain what you decided to investigate."
          />
          <h4>Our research question</h4>
          <WritingSlot
            value={project.researchQuestion}
            prompt="Add your group's own research question."
          />
        </article>
        <article className="notebook-card">
          <span className="eyebrow">02 / COLLECTING THE MAIL</span>
          <h3>Dataset & collection</h3>
          <div className="planned-stats">
            <div>
              <b>300</b>
              <span>original images planned</span>
            </div>
            <div>
              <b>3</b>
              <span>group members</span>
            </div>
            <div>
              <b>100</b>
              <span>images per person planned</span>
            </div>
          </div>
          <span className="plan-label">
            COLLECTION PLAN · NOT A COMPLETED DATASET
          </span>
          <WritingSlot
            value={project.collection}
            prompt="Document your actual collection process, contributors, class counts, and original-photo ownership. Update the planned numbers only when verified."
          />
          <WritingSlot
            value={project.methodology}
            prompt="Describe your actual sampling choices, handwriting, backgrounds, lighting and consent. Include how you kept test images separate from training images."
          />
        </article>
        <article className="notebook-card">
          <span className="eyebrow">03 / TEACHING THE SORTER</span>
          <h3>Model training & testing</h3>
          <WritingSlot
            value={project.training}
            prompt="Record your actual training settings, model versions, class labels, and changes made between trials."
          />
          <div className="metric-table">
            <div>
              <span>Images actually collected</span>
              <b>{project.metrics.collectedImages || "Not recorded"}</b>
            </div>
            <div>
              <span>Held-out test images</span>
              <b>{project.metrics.heldOutImages || "Not recorded"}</b>
            </div>
            <div>
              <span>Measured test accuracy</span>
              <b>{project.metrics.accuracy || "Not recorded"}</b>
            </div>
          </div>
          <WritingSlot
            value={project.testing}
            prompt="Write your own test procedure and measured results. Add real examples, class-level outcomes, and any failed trials; do not invent metrics."
          />
        </article>
        <article className="notebook-card">
          <span className="eyebrow">04 / LETTERS THAT GOT LOST</span>
          <h3>Limitations, bias & misclassifications</h3>
          <WritingSlot
            value={project.limitations}
            prompt="Analyze your actual errors and observed limitations. Add original examples and explain what your evidence does and does not show."
          />
        </article>
        <article className="notebook-card">
          <span className="eyebrow">05 / MORE THAN A STAMP</span>
          <h3>Ethics & language recognition</h3>
          <WritingSlot
            value={project.ethics}
            prompt="Write your group's own ethical discussion of language recognition, its possible uses, affected people, and relevant issues raised by your experiment."
          />
        </article>
        <article className="notebook-card reading-card">
          <span className="eyebrow">READING ROOM / YOUR ORIGINAL ANALYSIS</span>
          <h3>In conversation with LIS 500</h3>
          <div className="reading-tag">
            <BookOpen size={16} />
            <span>
              Joy Buolamwini · <i>Unmasking AI</i>
            </span>
          </div>
          <WritingSlot
            value={project.readings}
            prompt="Write your original analysis connecting your experiment to Unmasking AI and other assigned LIS 500 readings. Supply your own interpretation and verify page numbers, quotations, and citations."
          />
          <h4>References</h4>
          <WritingSlot
            value={project.references}
            prompt="Add the actual course readings and sources your group cites. No quotations or citations have been invented for you."
          />
        </article>
      </div>
      <ProjectLinks />
      <div className="editing-note">
        <PenIcon /> Edit all writing slots in{" "}
        <code>src/content/project.ts</code> · Add your video, repository and
        dataset links in <code>src/config.ts</code>
      </div>
    </section>
  );
}
function LinkCard({
  href,
  icon,
  label,
  title,
  note,
  placeholder,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  title: string;
  note: string;
  placeholder: string;
}) {
  const url = href.trim();
  return url ? (
    <a className="project-link" href={url} target="_blank" rel="noreferrer">
      <span className="project-link-icon">{icon}</span>
      <span className="project-link-text">
        <span>{label}</span>
        <b>{title}</b>
        <small>{note || url.replace(/^https?:\/\//, "")}</small>
      </span>
      <ArrowUpRight size={16} />
    </a>
  ) : (
    <div className="project-link empty">
      <span className="project-link-icon">{icon}</span>
      <span className="project-link-text">
        <span>{label}</span>
        <b>{title}</b>
        <small>{placeholder}</small>
      </span>
    </div>
  );
}
function ProjectLinks() {
  return (
    <section className="notebook-card links-section" id="project-links">
      <span className="eyebrow">06 / RETURN ADDRESSES</span>
      <h2>Find our work.</h2>
      <p className="section-description">
        The code behind this site and the images we trained our model on.
      </p>
      <div className="project-links">
        <LinkCard
          href={experiment.repositoryUrl}
          icon={<CodeXml size={20} strokeWidth={1.6} />}
          label="GITHUB REPOSITORY"
          title="Website & classifier code"
          note=""
          placeholder="Add your repository link in src/config.ts."
        />
        <LinkCard
          href={experiment.datasetUrl}
          icon={<FolderOpen size={20} strokeWidth={1.6} />}
          label="DATASET"
          title="Our handwriting images"
          note={experiment.datasetNote}
          placeholder="Dataset link coming soon · add it in src/config.ts."
        />
      </div>
    </section>
  );
}
function PenIcon() {
  return <span aria-hidden="true">✎</span>;
}
