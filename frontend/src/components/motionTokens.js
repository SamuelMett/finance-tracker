export const EASE = [0.22, 1, 0.36, 1];
export const INK_EASE = [0.65, 0, 0.35, 1];

export const riseVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};
