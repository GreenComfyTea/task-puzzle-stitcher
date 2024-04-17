# Puzzle Stitcher

**[Job application task](https://github.com/GreenComfyTea/task-puzzle-stitcher/files/14995431/Task_-_Puzzle_stitcher-1.pdf)**.

## Getting Started

First, install dependencies:

```bash
npm install
```

or with included `npm_install.bat` script.

Then run the development server:

```bash
npm run dev
```

or with included `npm_run_dev.bat` script.

Open [http://localhost:3000](http://localhost:3000) with your browser.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

>**:pushpin: `ReferenceError: localStorage is not defined` error can be ignored.


## Additional Dependancies

1. `Pico.css` - UI styling;
2. `Konva.js` - canvas handling;
3. `node-canvas` - canvas handling;

## Base Algorithm

### Loading:

1. Load all images;
2. Get pixel edges for each image;
3. Convert each edge to a string (measurements showed that searching and comparisons with strings turned out to be faster that the same with integers (possibly, due to jit?));
4. `png only` Create 4 lists containing all images, but each list is sorted differently: leftList, topList, rightList, bottomList. LeftList is sorted by top edge strings, and so on.

### Solving:

1. Find top-left image by width and height (it's the only 240x135 image);
2. Fill left-most column by comparing image candidate top edge string to the above image's bottom edge string.  
`png only` Due to having sorted lists, binary search is used here for performance.  
`jpg only` Due to jpg being lossy, I can't compare edges directly. Instead hamming distance is calculated.  
3. Fill each row  top to bottom, left to right, by comparing image candidate left edge string to the left image's right edge string. Same approach as in step 2.

## Additional Features

1. Canvas panning and zooming;
2. Canvas autoresizing on window resize;
3. Selected image format is saved across sessions in `Local Storage`.

## Issues

1. Both png and jpg algorithms are not safe from collisions;
2. `jpg` processing is 63 times slower than `png` processing.

## Measurements

```JS
const t0 = performance.now();

for(let i = 0; i < 100; i++) {
	this.findTopLeftPuzzlePiece();
	this.findLeftMostPuzzlePieces();
	this.findPuzzlePiecesRowByRow();
}

const t1 = performance.now();

console.log(`${(t1 -t0)} ms`);
```

`PNG String`: 55 ms  
`PNG Uint8ClampedArray`: 97 ms  
`JPG String`: 3485 ms  
`JPG Uint8ClampedArray`: 3977 ms  
  
`PNG BinarySearch()`: 55 ms  
`PNG Array.prototype.find()`: 537 ms

