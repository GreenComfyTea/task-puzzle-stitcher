import React from 'react';
import Konva from "konva";

import PuzzlePiece from './PuzzlePiece';

class PuzzleManager {
	public puzzleSize: number = 16;

	private maxPuzzlePieceWidth: number = 241;
	private maxPuzzlePieceHeight: number = 136;
	private puzzlePieceCount: number = 256;
	private puzzleSpacing: number = 3;

	private layer: Konva.Layer;

	private imageFolder: string = "peaces"; // sic!
	private imageFormat: string = "png";
	private isPng: boolean = true;

	private puzzlePieces: PuzzlePiece[] = [];
	private leftList: PuzzlePiece[] = [];
	private topList: PuzzlePiece[] = [];
	private rightList: PuzzlePiece[] = [];
	private bottomList: PuzzlePiece[] = [];

	private loadedPuzzlePieceCount: number = 0;

	private solvedPuzzlePieces: PuzzlePiece[][] = [...Array(this.puzzleSize)].map(e => Array(this.puzzleSize));

	constructor(layer: Konva.Layer, imageFormat: string) {
		this.layer = layer;
		this.imageFormat = imageFormat;

		if("jpg".localeCompare(imageFormat) === 0) {
			this.imageFolder = "peaces_extra"; // sic!
			this.isPng = false;
		}
	}

	public loadImages(callback: Function) {
		for(let i = 0; i < this.puzzlePieceCount; i++) {
			let image = this.loadImage(i, callback);
		}
	}

	public solve() {
		this.findTopLeftPuzzlePiece();
		this.findLeftMostPuzzlePieces();
		this.findPuzzlePiecesRowByRow();

		this.drawSolvedPuzzle();
	}

	private loadImage(index: number, callback: Function) {
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
		puzzlePieceImage.src = `/${this.imageFolder}/peace-${index}.${this.imageFormat}`;
	}

	private onAllPuzzlePiecesLoaded(callback: Function) {
		if(this.loadedPuzzlePieceCount !== this.puzzlePieceCount) return;

		callback();

		this.leftList = [...this.puzzlePieces];
		this.topList =  [...this.puzzlePieces];
		this.rightList =  [...this.puzzlePieces];
		this.bottomList =  [...this.puzzlePieces];

		if(!this.isPng) return;

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
			const puzzlePiece = this.isPng
				? PuzzleManager.binarySearch(this.topList, "topCache", this.solvedPuzzlePieces[0][y - 1].bottomCache)
				: PuzzleManager.findPuzzlePieceByHammingDistance(this.topList, "topCache", this.solvedPuzzlePieces[0][y - 1], "bottomCache");

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
				const puzzlePiece = this.isPng
					? PuzzleManager.binarySearch(this.leftList, "leftCache", this.solvedPuzzlePieces[x - 1][y].rightCache)
					: PuzzleManager.findPuzzlePieceByHammingDistance(this.leftList, "leftCache", this.solvedPuzzlePieces[x - 1][y], "rightCache");

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

				var offsetX = x - 1;
				var offsetY = y - 1;

				if(offsetX < 0) offsetX = 0;
				if(offsetY < 0) offsetY = 0;

				var konvaImage = new Konva.Image({
					x: x * (this.maxPuzzlePieceWidth - 2) + offsetX,
					y: y * (this.maxPuzzlePieceHeight - 2) + offsetY,
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

		const comparison: number = (middleValue![propertyName as keyof PuzzlePiece]! as string).localeCompare(key);

		if (comparison === 0) return middleValue;
		if (array.length <= 1) return undefined;

		if (comparison < 0) return PuzzleManager.binarySearch(array.slice(middleIndex), propertyName, key);
		else return PuzzleManager.binarySearch(array.slice(0, middleIndex), propertyName, key)
	}

	static findPuzzlePieceByHammingDistance(array: Array<PuzzlePiece>, propertyName: string, target: PuzzlePiece, targetPropertyName: string): PuzzlePiece | undefined {

		let lowestDistance = 999999999;
		let puzzlePieceWithLowestDistance = undefined;

		for(let i = 0; i < array.length; i++) {
			const puzzlePiece = array[i];

			if(puzzlePiece === target) continue;

			const distance = PuzzleManager.hammingDistance(
				puzzlePiece![propertyName as keyof PuzzlePiece] as string,
				target![targetPropertyName as keyof PuzzlePiece] as string
			);

			if(distance < lowestDistance) {
				lowestDistance = distance;
				puzzlePieceWithLowestDistance = puzzlePiece;
			}
		}

		return puzzlePieceWithLowestDistance;
	}

	static hammingDistance(string1: string = '', string2: string = '') {
		if (string1.length !== string2.length) return 999999999;

		let distance = 0;
		for (let i = 0; i < string1.length; i++) {
			let charCode1 = string1.charCodeAt(i);
			let charCode2 = string2.charCodeAt(i);
			
			distance += Math.abs(charCode1 - charCode2);
		};

		return distance;
	 };

}

export default PuzzleManager;