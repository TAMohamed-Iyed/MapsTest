export const random = (n: number) => {
  return Math.floor(Math.random() * n) + 1;
};

export default () => {
  return `rgb(${random(255)}, ${random(255)}, ${random(255)})`;
};
