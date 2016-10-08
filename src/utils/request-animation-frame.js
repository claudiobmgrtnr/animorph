const requestAnimationFrame = window.requestAnimationFrame || setTimeout;

export function requestAnimationFramePromise () {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}
