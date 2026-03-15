# Workflow Banner – What You Can Change & Re-Generation Prompt

## What You Can Change in This Image

| Element | Current (Docling example) | Your options (e.g. VoiceIDO) |
|--------|----------------------------|------------------------------|
| **Input file types** | PDF, PPTX, DOCX, HTML | **Images (PNG/JPG), Audio (MP3/WAV), Video (MP4),** or PDF, HTML, PPTX, DOCX |
| **Input icons/labels** | Colored document strips (red/orange/blue/purple) | Same style, different extensions: `.png`, `.mp3`, `.mp4`, `.pdf`, etc. |
| **App / product name** | "docling" | **VoiceIDO** (or your app name) |
| **Mascot** | Tux the penguin (Linux) | Tux, or: abstract robot, microphone, waveform character, or your logo/mascot |
| **Intermediate format** | "Docling {DOC}" | **VoiceIDO {TEXT}**, or "Structured output", "Transcript", "Extract" |
| **Output path 1 (structured)** | JSON, MD, Figures | **Transcript, JSON, SRT, Summary** or OCR text, Analysis report, etc. |
| **Output path 2 (AI stack)** | Chunking, LlamaIndex, LangChain | **OpenAI, Anthropic, Hugging Face, LangChain, LlamaIndex, Pinecone, Weaviate, Chroma** – or any combo |
| **Mascot for AI path** | Llama (for LlamaIndex) | **Llama, robot, sparkle/AI orb**, or remove and show only labels |
| **Output path 3 (app)** | "Your GenAI App" | **Your Voice App**, **Custom Pipeline**, **Enterprise API**, etc. |
| **Arrow color** | Orange | Blue, green, brand color |
| **Label colors** | Purple, blue, green | Match your palette (e.g. blue + orange for VoiceIDO) |
| **Background** | Black | Dark gray, navy, or keep black |

---

## Full Re-Generation Prompt (copy and edit)

Use this as the basis for DALL·E, Midjourney, Ideogram, or similar. Replace the placeholders in square brackets.

```
Professional workflow diagram, infographic style, on solid black background. 
Left to right flow with thick orange arrows.

INPUT (left): Four document/file icons in a row, each with a colored top band and label: 
[PDF, PPTX, DOCX, HTML] 
OR for media pipeline: 
[PNG/JPG, MP3, MP4, PDF]. 
Cartoon mascot (small Tux penguin or friendly robot) running right, carrying a document.

CENTER: One thick orange arrow into a dark gray app window (macOS-style window with red/yellow/green buttons). 
Inside the window: same mascot (larger) holding a document; below it the app name in white: 
"[VoiceIDO]" 
or "[docling]" or "[Your App Name]".

ARROW to one large document icon labeled 
"[VoiceIDO {TEXT}]" or "[Docling {DOC}]".

From that document, THREE arrows branch (up, middle, down):

1) UP: Mascot with chef hat "3", holding stacked documents. 
   Purple label: "[Transcript, JSON, SRT]" or "[JSON, MD, Figures]".

2) MIDDLE: Mascot holding a large egg/orb. 
   Next to it: [Llama character] for LlamaIndex, or [robot/sparkle] for other AI. 
   Blue label: "[Chunking, LlamaIndex, LangChain]" 
   OR "[OpenAI, LangChain, Pinecone]" 
   OR "[Anthropic, Hugging Face, RAG]".

3) DOWN: Mascot holding egg/orb, happy. 
   Green label: "[Your GenAI App]" or "[Your Voice App]" or "[Custom Pipeline]".

Style: Bright flat colors, cartoon mascots, clear labels, no photo-realism. 
Single coherent diagram, infographic, vector-style illustration.
```

---

## VoiceIDO-Specific Example Prompt

Copy-paste and tweak as needed:

```
Professional workflow banner, infographic, black background. Left-to-right pipeline with thick blue and orange arrows.

INPUT: Four file icons with colored bands and labels: IMAGE (PNG/JPG), AUDIO (MP3/WAV), VIDEO (MP4), DOCUMENT (PDF). A friendly cartoon penguin or abstract “voice” mascot running right, carrying a file.

CENTER: Arrow into a dark app window (traffic-light buttons). Inside: same mascot; app name in white: "VoiceIDO".

Arrow to one large document icon labeled "VoiceIDO {TEXT}".

Three branching arrows from it:

1) UP – Mascot with hat holding papers. Purple label: "Transcript · JSON · SRT · Summary".
2) MIDDLE – Mascot with AI orb; optional small llama or robot. Blue label: "LangChain · OpenAI · Pinecone · RAG".
3) DOWN – Mascot with orb. Green label: "Your GenAI App".

Style: Flat colors, cartoon, clear typography, vector-like. No photorealism.
```

---

## Tech Stack Names You Can Swap In

- **LLM / APIs:** OpenAI, Anthropic (Claude), Google AI, Cohere, LlamaIndex, LangChain
- **Vector DBs:** Pinecone, Weaviate, Chroma, Qdrant, Milvus
- **Frameworks:** LangChain, LlamaIndex, Haystack, Semantic Kernel
- **Voice/audio:** Whisper, AssemblyAI, Deepgram (if you want to name them in a label)
- **Mascots:** Llama (LlamaIndex), Tux (Linux), robot, sparkle/orb for “AI”

Use the table and prompts above to regenerate the image with your app name, input formats (e.g. PDF, HTML, PPTX or MP3, MP4, images), and chosen tech stack.

---

# Unique Styles – VoiceIDO + Penguin (Linux/Tux) Mascot

*Different visual concepts: you give inputs, we generate outputs with our tech stack. Use any prompt below as-is for image generation.*

---

## Style 1: Mission Control / Command Center

*Tux at a Linux-style control panel; inputs on screens left, outputs and tech stack on screens right.*

**Full prompt:**

```
Illustration, command center control room, dark background with blue and green terminal glow. Tux the Linux penguin as operator at a large curved desk. Left side of the desk: multiple small monitors showing floating file icons (image, audio waveform, video frame, document) labeled INPUT. Center: a big main screen with the word "VoiceIDO" in white and blue, and a penguin logo. Right side: monitors showing structured output – text streams, JSON brackets, "Transcript", "SRT", "Summary" – and tech badges: "OCR", "Whisper", "LangChain", "OpenAI", "Pinecone". Penguin wears a small headset. Aesthetic: Linux terminal, hacker-lite, professional. Flat illustration, no photorealism. Tagline feel: "Your inputs. Our stack. Your outputs."
```

---

## Style 2: Portal / Gateway

*Inputs go in one side, outputs and tech names come out the other; Tux as guide.*

**Full prompt:**

```
Single illustration, split composition. Left half: dark blue, floating 3D file icons (image, audio, video, PDF) and a small Tux penguin waving them toward the center. Center: a glowing portal or gateway in the shape of the VoiceIDO logo (abstract circular mark + word "VoiceIDO"), blue and white light, Linux-penguin silhouette inside. Right half: same penguin stepping out into light, surrounded by clean output elements – "Transcript", "JSON", "Summary", "API" – and floating tech stack labels: "LangChain", "OpenAI", "Pinecone", "Whisper". Style: modern flat design, gradient blue and orange accents, mascot is cute Tux. No photorealism. Message: Inputs in, VoiceIDO stack, outputs out.
```

---

## Style 3: Retro Linux Ad / Magazine Cover

*80s–90s computer ad or magazine cover: Tux, inputs, outputs, tech stack as bold type.*

**Full prompt:**

```
Retro 80s–90s computer magazine ad or poster. Bold typography, pixel-friendly aesthetic, dark background with neon blue and orange. Top: "VoiceIDO" in large block or rounded font. Center: Tux the penguin as the hero, holding a floppy-disk-style "INPUT" (icons for image, audio, video, doc) in one flipper and a "OUTPUT" ticket (Transcript, JSON, API) in the other. Around him: tech stack names as badge labels – "OCR", "Whisper", "LangChain", "OpenAI", "Pinecone" – and a small Linux/Tux logo. Bottom tagline: "You bring the files. We bring the stack." Style: vintage tech poster, flat colors, no photorealism.
```

---

## Style 4: Stage / Conductor (Unique)

*Tux as conductor; inputs are instruments, outputs and tech stack are the “performance”.*

**Full prompt:**

```
Illustration, concert stage, dark background. Tux the Linux penguin as orchestra conductor in a tuxedo, standing on a podium. Left side: "INPUT" section – instead of instruments, floating file types (image icon, audio waveform, video clapperboard, document) as if they are instruments. Center: a large score or screen showing "VoiceIDO" and the VoiceIDO logo. Right side: "OUTPUT" – sheet music and screens showing "Transcript", "JSON", "Summary", "API", and tech stack names as part of the performance: "LangChain", "OpenAI", "Pinecone", "Whisper". Penguin has a baton. Style: elegant flat illustration, blue and orange stage lights, professional and playful. No photorealism. Concept: You give the inputs, VoiceIDO conducts the tech, you get the outputs.
```

---

## Style 5: One-Line Hero (Simplest – use this first)

*One clear scene: inputs, VoiceIDO, outputs + tech stack, Tux as mascot.*

**Full prompt (copy this to generate):**

```
Professional product banner, single scene, dark background. Left: stack of floating file icons (image, audio, video, document) with small labels "INPUT". Center: Tux the Linux penguin standing next to a large "VoiceIDO" logo and circular emblem; the penguin is friendly and confident, one flipper raised as if presenting. Right: clean output elements – "Transcript", "JSON", "SRT", "Summary", "API" – and a row of tech stack badges: "OCR · Whisper · LangChain · OpenAI · Pinecone". Style: flat illustration, blue and orange accents, Linux/Tux as mascot, no photorealism. Clear message: You give inputs, VoiceIDO turns them into outputs with our tech stack.
```

---

Pick one style (e.g. Mission Control, Portal, Retro Ad, Conductor, or Hero) and paste the full prompt into your image generator. Swap tech names (e.g. LlamaIndex, Anthropic, Weaviate) or add your tagline as needed.
