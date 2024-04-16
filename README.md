# Puzzle Stitcher

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

or with included `npm_run_dev.bat` script.

Open [http://localhost:3000](http://localhost:3000) with your browser.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Base Algorithm

### Loading:

1. Load all images;
2. Get pixel edges for each image;
3. `png only` Convert each edge to a string (measurements showed that searching and comparisons with strings turned out to be faster that the same with integers (possibly, due to jit?));
4. `png only` Create 4 lists containing all images, but each list is sorted differently: leftList, topList, rightList, bottomList. LeftList is sorted by top edge strings, and so on.

### Solving:

1. Find top-left image by width and height (it's the only 240x135 image);
2. Fill left-most column by comparing image candidate top edge string to the above image's bottom edge string.  
`png only` Due to having sorted lists, binary search is used here for performance.  
`jpg only` Due to jpg being lossy, I can't compare edges directly. Instead hamming distance is calculated.  
3. Fill each row  top to bottom, left to right, by comparing image candidate left edge string to the left image's right edge string. Same approach as in step 2.

## Additional Features:

1. Canvas panning and zooming;
2. Canvas autoresizing on window resize;
3. Image format combobox is saved across sessions in `Local Storage`.

## Issues:

1. Both png and jpg algorithms are not safe from collision;
2. `jpg` processing is 64 times slower than `png` processing.

