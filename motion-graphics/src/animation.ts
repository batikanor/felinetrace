import {interpolate, spring} from 'remotion';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const enter = (frame: number, fps: number, delay = 0) =>
  spring({frame: frame - delay, fps, config: {damping: 18, stiffness: 120, mass: 0.75}});

export const fade = (frame: number, start: number, end = start + 12) =>
  interpolate(frame, [start, end], [0, 1], clamp);

export const draw = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], clamp);

export const rise = (progress: number, distance = 40) => ({
  opacity: progress,
  transform: `translateY(${(1 - progress) * distance}px)`,
});
