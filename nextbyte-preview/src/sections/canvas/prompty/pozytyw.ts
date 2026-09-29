/**
 * BLOK POZYTYWNY — ogólne wytyczne jakości, zawsze na samym dole promptu.
 * Stan docelowy opisany twierdząco (model dostaje "co ma być", nie listę zakazów).
 */
export const POZYTYW = [
  `[FINAL QUALITY]`,
  `- One seamless, photorealistic photograph that is indistinguishable from an unedited capture of the same moment.`,
  `- Every detail is as sharp where the scene is sharp and as soft where the scene is soft; the edit is impossible to spot.`,
  `- Physically plausible everywhere: light, shadow, reflection, scale, anatomy and perspective all agree.`,
  `- Return only the final image.`,
].join('\n')
