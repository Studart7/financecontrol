// A simple script is not enough to accurately calculate CSS filter for exact hex without complex solvers.
// But we can guess: #5C1A1A is a dark red. Hue is around 0 (red).
// From black: invert(15%) sepia(100%) saturate(3000%) hue-rotate(345deg) brightness(60%) contrast(100%)
console.log('Use approximate filter');
