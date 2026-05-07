# Logo Generation Prompts

Use these prompts in AI image generators (Midjourney, DALL-E, Ideogram, Leonardo) to create the PawTrack logo.

---

## Prompt 1 — App Icon (Main)

```
Minimal app icon design for a pet health tracking app called "PawTrack". 
A single elegant paw print in terracotta color (#B5633B) centered on a 
warm white (#FDFCFA) background. The paw has 5 soft elliptical pads - 
4 small toe pads and one larger bottom pad. Clean, modern, premium feel. 
No text. Subtle warm shadow under the paw. Rounded square format. 
Inspired by Apple Health and Calm app aesthetics. 
Flat design, no gradients, no 3D effects.
--ar 1:1 --s 250
```

## Prompt 2 — App Icon (with health accent)

```
Minimalist app icon: a stylized paw print in warm terracotta (#B5633B) 
on off-white background. The main pad has a subtle heart shape carved 
into it, suggesting health and care. Five soft rounded pads. Clean lines, 
no outlines, no text. Premium mobile app icon style. Soft warm shadow. 
Modern, friendly, not cartoonish. Square format with rounded corners.
--ar 1:1 --s 250
```

## Prompt 3 — App Icon (with plus accent)

```
Clean app icon design: terracotta colored paw print (#B5633B) on cream 
white background. The center pad has a small plus symbol (+) subtly 
integrated, representing health tracking. Geometric, minimal, modern. 
Five elliptical pads. No text, no border. Soft, warm aesthetic. 
Suitable for iOS app store. Premium quality.
--ar 1:1 --s 250
```

## Prompt 4 — Wordmark Logo

```
Logo design for "PawTrack" - a pet health app. The word "Paw" in 
terracotta (#B5633B) and "Track" in dark brown (#2A2017). Heavy bold 
sans-serif geometric font. A small paw print icon to the left of the 
text. Clean white background. Modern, warm, friendly. No tagline. 
Horizontal layout. Premium app branding style.
--ar 3:1 --s 250
```

## Prompt 5 — Splash Screen

```
Mobile app splash screen design. Center: a large elegant paw print in 
terracotta (#B5633B) with the word "PawTrack" below in bold geometric 
font. Background is warm cream white (#FDFCFA). Subtle decorative paw 
prints at very low opacity in the background. Clean, minimal, premium. 
Mobile portrait format.
--ar 9:19 --s 250
```

---

## Color Reference for Generators

When generating, always specify these exact colors:
- Main brand color: `#B5633B` (terracotta/burnt orange)
- Background: `#FDFCFA` (warm white, NOT pure white)
- Dark text: `#2A2017` (warm dark brown, NOT black)
- Accent light: `#F5E6DB` (soft terracotta tint)

## Style Keywords to Include
`minimal, clean, modern, premium, warm, friendly, app icon, flat design, no gradients`

## Style Keywords to Avoid
`cartoon, 3D, glossy, neon, playful, childish, clip-art, stock, generic, realistic fur`

---

## After Generating

Once you have a logo you like:

1. **App Icon**: Export at 1024x1024 PNG (no transparency)
2. **Adaptive Icon (Android)**: Foreground at 512x512 with padding, background as solid color
3. **Favicon**: Export at 32x32 and 16x16
4. **Replace in project**:
   - `assets/images/icon.png` (1024x1024)
   - `assets/images/splash-icon.png` (512x512)
   - `assets/images/favicon.png` (48x48)
   - `assets/images/android-icon-foreground.png` (512x512)
