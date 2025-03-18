# VoiceBook: E-Book to Audio Converter

## 🎧 Project Overview

**VoiceBook** is a tool that converts eBooks — in **EPUB** and **PDF** formats — into high-quality **MP3** audiobooks.

It leverages the **StyleTTS2** model to generate natural, expressive speech from text, making it easy to turn your favorite books into audiobooks.

This project was developed as part of our **final year project** for our **Bachelor's degree** at **USTHB University of Algiers**.

---

## ⚙️ Project Setup

Follow these steps to set up the project:

### 1️⃣ Create Server Directory

```bash
mkdir server
```

### 2️⃣ Clone StyleTTS2 Repository

```bash
git clone https://github.com/yl4579/StyleTTS2.git
mv StyleTTS2 server
```

### 3️⃣ Clean Up Directory

```bash
rmdir -r StyleTTS2
```

### 4️⃣ Move Python Files

```bash
mv app.py server
mv init.py server
```

### 5️⃣ Install Dependencies

```bash
cd server
pip install SoundFile torchaudio munch torch pydub pyyaml librosa nltk matplotlib accelerate transformers phonemizer einops einops-exts tqdm typing-extensions git+https://github.com/resemble-ai/monotonic_align.git
```

### 6️⃣ Install `espeak-ng`

```bash
sudo apt-get install espeak-ng
```

### 7️⃣ Download and Prepare Pretrained Models

```bash
git-lfs clone https://huggingface.co/yl4579/StyleTTS2-LibriTTS
mv StyleTTS2-LibriTTS/Models .
mv StyleTTS2-LibriTTS/reference_audio.zip .
unzip reference_audio.zip
mv reference_audio Demo/reference_audio
```

---

## 🚀 Inference Function

Here’s the `LFinference` function for generating speech from text:

```python
def LFinference(text, s_prev, noise, alpha=0.7, diffusion_steps=5, embedding_scale=1):
    text = text.strip().replace('\"', '')
    ps = global_phonemizer.phonemize([text])
    ps = word_tokenize(ps[0])
    ps = ' '.join(ps)

    tokens = textclenaer(ps)
    tokens.insert(0, 0)
    tokens = torch.LongTensor(tokens).to(device).unsqueeze(0)

    with torch.no_grad():
        input_lengths = torch.LongTensor([tokens.shape[-1]]).to(tokens.device)
        text_mask = length_to_mask(input_lengths).to(tokens.device)

        t_en = model.text_encoder(tokens, input_lengths, text_mask)
        bert_dur = model.bert(tokens, attention_mask=(~text_mask).int())
        d_en = model.bert_encoder(bert_dur).transpose(-1, -2)

        s_pred = sampler(noise, embedding=bert_dur[0].unsqueeze(0), num_steps=diffusion_steps, embedding_scale=embedding_scale).squeeze(0)

        if s_prev is not None:
            s_pred = alpha * s_prev + (1 - alpha) * s_pred

        s = s_pred[:, 128:]
        ref = s_pred[:, :128]

        d = model.predictor.text_encoder(d_en, s, input_lengths, text_mask)
        x, _ = model.predictor.lstm(d)
        duration = model.predictor.duration_proj(x)
        duration = torch.sigmoid(duration).sum(axis=-1)
        pred_dur = torch.round(duration.squeeze()).clamp(min=1)

        pred_aln_trg = torch.zeros(input_lengths, int(pred_dur.sum().data))
        c_frame = 0
        for i in range(pred_aln_trg.size(0)):
            pred_aln_trg[i, c_frame:c_frame + int(pred_dur[i].data)] = 1
            c_frame += int(pred_dur[i].data)

        en = (d.transpose(-1, -2) @ pred_aln_trg.unsqueeze(0).to(device))
        F0_pred, N_pred = model.predictor.F0Ntrain(en, s)
        out = model.decoder((t_en @ pred_aln_trg.unsqueeze(0).to(device)), F0_pred, N_pred, ref.squeeze().unsqueeze(0))

    return out.squeeze().cpu().numpy(), s_pred
```

### 🎯 Noise Initialization Example

```python
noise = torch.randn(1,1,256).to(device)
```

---

## 🔥 How to Use

After setting up the project, run the following command to convert an EPUB/PDF into an MP3:

```bash
python app.py --input "path/to/book.epub" --output "output.mp3"
```

---

## 👥 Team

- **Sid-Ali Benchoubane** — Developer
- **Hamza Boukader** — Developer

---

📚 **Happy Listening!**
