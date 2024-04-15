import React from 'react';
import Konva from "konva";

import PuzzlePiece from './PuzzlePiece';

class PuzzleManager {
	static isInstantiated: boolean = false;

	public puzzleSize: number = 16;

	private maxPuzzlePieceWidth: number = 241;
	private maxPuzzlePieceHeight: number = 136;
	private puzzlePieceCount: number = 256;
	private puzzleSpacing: number = 3;

	private layer: Konva.Layer;

	private puzzlePieces: PuzzlePiece[] = [];
	private leftList: PuzzlePiece[] = [];
	private topList: PuzzlePiece[] = [];
	private rightList: PuzzlePiece[] = [];
	private bottomList: PuzzlePiece[] = [];

	private loadedPuzzlePieceCount: number = 0;

	private solvedPuzzlePieces: PuzzlePiece[][] = [...Array(this.puzzleSize)].map(e => Array(this.puzzleSize));

	constructor(layer: Konva.Layer) {
		this.layer = layer;

		PuzzleManager.isInstantiated = true;
	}

	public loadImages(imageFormat: string, callback: Function) {
		// sic!
		let imageFolder = "jpg".localeCompare(imageFormat) === 0 ? "peaces_extra" : "peaces";

		console.log("loading: ", imageFolder, imageFormat);

		for(let i = 0; i < this.puzzlePieceCount; i++) {
			let image = this.loadImage(imageFolder, imageFormat, i, callback);
		}
	}

	public solve() {
		let t0 = performance.now();
		for(let i = 0; i < 1; i++) {
			this.findTopLeftPuzzlePiece();
			this.findLeftMostPuzzlePieces();
			this.findPuzzlePiecesRowByRow();
		}
		
		let t1 = performance.now();

		console.log(`strings: ${(t1 - t0).toFixed(3)} ms`);

		this.drawSolvedPuzzle();
	}

	private loadImage(imageFolder: string, imageFormat: string, index: number, callback: Function) {
		const puzzlePieceImage: HTMLImageElement = new Image();
		const puzzleManager = this;

		puzzlePieceImage.onload = function() {

			var konvaImage = new Konva.Image({
			  x: (puzzleManager.maxPuzzlePieceWidth + puzzleManager.puzzleSpacing) * Math.floor(index % puzzleManager.puzzleSize),
			  y: (puzzleManager.maxPuzzlePieceHeight + puzzleManager.puzzleSpacing) * Math.floor(index / puzzleManager.puzzleSize),
			  image: puzzlePieceImage,
			  width: puzzlePieceImage.naturalWidth,
			  height: puzzlePieceImage.naturalHeight
			});

			puzzleManager.layer.add(konvaImage);

			puzzleManager.puzzlePieces[index] = new PuzzlePiece(puzzleManager, puzzlePieceImage, index);

			puzzleManager.loadedPuzzlePieceCount++;
			puzzleManager.onAllPuzzlePiecesLoaded(callback);
		};
		puzzlePieceImage.src = `/${imageFolder}/peace-${index}.${imageFormat}`;
	}

	private onAllPuzzlePiecesLoaded(callback: Function) {
		if(this.loadedPuzzlePieceCount !== this.puzzlePieceCount) return;

		callback();

		this.leftList = [...this.puzzlePieces];
		this.topList =  [...this.puzzlePieces];
		this.rightList =  [...this.puzzlePieces];
		this.bottomList =  [...this.puzzlePieces];

		this.leftList.sort((left, right) => left.leftCache.localeCompare(right.leftCache));
		this.topList.sort((left, right) => left.topCache.localeCompare(right.topCache));
		this.rightList.sort((left, right) => left.rightCache.localeCompare(right.rightCache));
		this.bottomList.sort((left, right) => left.bottomCache.localeCompare(right.bottomCache))
	}

	private findTopLeftPuzzlePiece() {
		const topLeftPuzzlePiece = this.puzzlePieces.find(
			(puzzlePiece) => puzzlePiece.leftCache.length == this.maxPuzzlePieceHeight - 1 && puzzlePiece.topCache.length === this.maxPuzzlePieceWidth - 1 
		);

		if(topLeftPuzzlePiece === undefined) {
			console.error("Top-left puzzle piece wasn't found!");
			return;
		}

		this.solvedPuzzlePieces[0][0] = topLeftPuzzlePiece;
	}

	private findLeftMostPuzzlePieces() {
		for(let y = 1; y < this.puzzleSize; y++) {
			const puzzlePiece = PuzzleManager.binarySearch(this.topList, "topCache", this.solvedPuzzlePieces[0][y - 1].bottomCache);

			if(puzzlePiece === undefined) {
				console.error(`Puzzle piece ${y} wasn't found!`);
				return;
			}
	
			this.solvedPuzzlePieces[0][y] = puzzlePiece;
		}
	}

	private findPuzzlePiecesRowByRow() {
		for(let y = 0; y < this.puzzleSize; y++) {
			for(let x = 1; x < this.puzzleSize; x++) {
				const puzzlePiece = PuzzleManager.binarySearch(this.leftList, "leftCache", this.solvedPuzzlePieces[x - 1][y].rightCache);
	
				if(puzzlePiece === undefined) {
					console.error(`Puzzle piece ${x}-${y} wasn't found!`);
					return;
				}
		
				this.solvedPuzzlePieces[x][y] = puzzlePiece;
			}
		}
	}

	private drawSolvedPuzzle() {
		this.layer.removeChildren();

		for(let y = 0; y < this.puzzleSize; y++) {
			for(let x = 0; x < this.puzzleSize; x++) {
				var puzzlePieceImage = this.solvedPuzzlePieces[x][y].image;

				var konvaImage = new Konva.Image({
					x: x * (this.maxPuzzlePieceWidth - 2),
					y: y * (this.maxPuzzlePieceHeight - 2),
					image: puzzlePieceImage,
					width: puzzlePieceImage.naturalWidth,
					height: puzzlePieceImage.naturalHeight
				  });
	  
				  this.layer.add(konvaImage);
			}
		}

		this.layer.draw();
	}

	static binarySearch(array: Array<PuzzlePiece>, propertyName: string, key: string): PuzzlePiece | undefined {
		const middleIndex: number = Math.floor(array.length / 2);
		const middleValue: PuzzlePiece = array[middleIndex];

		const comparison: number = middleValue[propertyName].localeCompare(key);

		if (comparison === 0) return middleValue;
		if (array.length <= 1) return undefined;

		if (comparison < 0) return PuzzleManager.binarySearch(array.slice(middleIndex), propertyName, key);
		else return PuzzleManager.binarySearch(array.slice(0, middleIndex), propertyName, key)
	}

}

export default PuzzleManager;