import PuzzleManager from "./PuzzleManager";

const { createCanvas, loadImage } = require('canvas');

class PuzzlePiece {
	private puzzleManager: PuzzleManager;

    public image: HTMLImageElement;

	public index: number = 0;
	public x: number = 0;
	public y: number = 0;

    public leftCache: string = "";
	public topCache: string = "";
	public rightCache: string = "";
	public bottomCache: string = "";

	public left: ImageData | null = null;
	public top: ImageData | null = null;
	public right: ImageData | null = null;
	public bottom: ImageData | null = null;

	constructor(puzzleManager: PuzzleManager, image: HTMLImageElement, index: number) {
		this.puzzleManager = puzzleManager;

        this.image = image;
		this.index = index;

		this.x = Math.floor(index % puzzleManager.puzzleSize);
		this.y = Math.floor(index / puzzleManager.puzzleSize);

		// Cache represents a color data of pixels of image row/column,
		// where separate RGBA values of each pixel are merged into single 32-bit integer number and then casted to a UTF-8 char.
		// Cache is a string of those chararacters.
		this.generateCache();
    }

	private generateCache() {
		const width: number = this.image.width;
		const height: number = this.image.height;

		const canvas = createCanvas(width, height);
		const canvasContext = canvas.getContext('2d');

		canvasContext.drawImage(this.image, 0, 0);
		
		const leftImageData: ImageData = canvasContext.getImageData(0, 0, 1, height);
		const topImageData: ImageData = canvasContext.getImageData(0, 0, width, 1);
		const rightImageData: ImageData = canvasContext.getImageData(width - 1, 0, 1, height);
		const bottomImageData: ImageData = canvasContext.getImageData(0, height - 1, width, 1);
		
		// Left Cache
		for(let y = 0; y < leftImageData.height; y++) {
			const rgbaInt: number = PuzzlePiece.getPixelFromIndex(leftImageData, y);
			this.leftCache += String.fromCharCode(rgbaInt);
		}

		// Top Cache
		for(let x = 0; x < topImageData.width; x++) {
			const rgbaInt: number = PuzzlePiece.getPixelFromIndex(topImageData, x);
			this.topCache += String.fromCharCode(rgbaInt);
		}

		// Right Cache
		for(let y = 0; y < rightImageData.height; y++) {
			const rgbaInt: number = PuzzlePiece.getPixelFromIndex(rightImageData, y);
			this.rightCache += String.fromCharCode(rgbaInt);
		}

		// Bottom Cache
		for(let x = 0; x < bottomImageData.width; x++) {
			const rgbaInt: number = PuzzlePiece.getPixelFromIndex(bottomImageData, x);
			this.bottomCache += String.fromCharCode(rgbaInt);
		}
	}

	static getPixelFromCoordinates(imageData: ImageData, x: number, y: number): number {
		const index: number = (x + y * imageData.width) * 4;

		return PuzzlePiece.getPixelFromIndex(imageData, index);
	}

	static getPixelFromIndex(imageData: ImageData, index: number): number {
		const red: number	= imageData.data[index];
		const green: number	= imageData.data[index + 1];
		const blue: number	= imageData.data[index + 2];
		const alpha: number	= imageData.data[index + 3];
		
		// Convert separate RGBA to single RGBA 32-bit integer number 
		const rgbaInt: number = (red << 24) + (green << 16) + (blue << 8) + (alpha);

		return rgbaInt;
	}
};

export default PuzzlePiece;