'use client';

import '@picocss/pico';
import styles from "./page.module.css";
import React, { useState, useEffect } from 'react';
import Konva from "konva";

import PuzzleManager from "../puzzle-stitcher/PuzzleManager";
import { ok } from 'assert';

export default function ClientPage() {
	let puzzleLayer: Konva.Layer | undefined = undefined;
	let puzzleManager: PuzzleManager | undefined = undefined;
	
	let imageFormatDropdownElement: HTMLSelectElement | null = null;
	let solvePuzzleButtonElement: HTMLButtonElement | null = null;
	let canvasContainerElement: HTMLElement | null = null;

	let isInitialized = false;

	let isInitialUserDataLoaded = false;
	let selectedImageFormat = "png";

	function saveUserDataToLocalStorage() {
		if (!localStorage) {
			return;
		}
	
		if(selectedImageFormat) {
			localStorage.imageFormat = selectedImageFormat;
		}
	}
	
	function loadUserDataFromLocalStorage() {
		if (!localStorage) {
			return;
		}

		const storedImageFormat = localStorage.imageFormat;
	
		if(storedImageFormat) {
			selectedImageFormat = storedImageFormat;
		}

	}

	function onLoadImagesClick() {
		if(puzzleLayer === undefined) return;
		if(imageFormatDropdownElement === null) return;
		if(solvePuzzleButtonElement === null) return;

		solvePuzzleButtonElement!.className = `${styles.button} ${styles.disabled}`;

		puzzleLayer.removeChildren();
		puzzleLayer.draw();

		puzzleManager = new PuzzleManager(puzzleLayer, selectedImageFormat);
		puzzleManager.loadImages(() => solvePuzzleButtonElement!.className = styles.button);
	}

	function onSolvePuzzleClick() {
		if(puzzleManager === undefined) return;

		puzzleManager.solve();
	}

	function onImageFormatChange() {
		selectedImageFormat = imageFormatDropdownElement!.value;
		saveUserDataToLocalStorage();
	}

	useEffect(() => {
		if(isInitialized) return;

		isInitialized = true;

		imageFormatDropdownElement = document.getElementById("image-format-dropdown") as HTMLSelectElement;
		solvePuzzleButtonElement = document.getElementById("solve-puzzle-button") as HTMLButtonElement;
		canvasContainerElement = document.getElementById("canvas-container") as HTMLElement;

		var stageWidth = canvasContainerElement.offsetWidth;
		var stageHeight = canvasContainerElement.offsetHeight;

		var stage = new Konva.Stage({
			container: "canvas-container",   // id of container <div>
			width: stageWidth,
			height: stageHeight,
			// Panning
			draggable: true,
			scale: { x: 1, y: 1 }
		});

		// // Resize canvas on window resize
		// window.addEventListener('resize', () => {
		// 	// We need to fit stage into parent container
		// 	var containerWidth = canvasContainerElement!.offsetWidth;
				
		// 	// Scale all objects on canvas
		// 	var scale = containerWidth / stageWidth;

		// 	stage.width(stageWidth * scale);
		// 	stage.height(canvasContainerElement!.offsetHeight);
		// 	stage.scale({ x: scale, y: scale });
		// });

		// Zooming
		// var scaleBy = 1.25;
		// stage.on('wheel', (e) => {
		//   // Stop default scrolling
		//   e.evt.preventDefault();
  
		//   var oldScale = stage.scaleX();
		//   var pointer = stage.getPointerPosition();
  
		//   var mousePointTo = {
		// 	x: (pointer!.x - stage.x()) / oldScale,
		// 	y: (pointer!.y - stage.y()) / oldScale,
		//   };
  
		//   // How to scale? Zoom in? Or zoom out?
		//   let direction = e.evt.deltaY > 0 ? -1 : 1;
  
		//   // When we zoom on trackpad, e.evt.ctrlKey is true
		//   // In that case lets revert direction
		//   if (e.evt.ctrlKey) {
		// 	direction = -direction;
		//   }
  
		//   var newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
  
		//   stage.scale({ x: newScale, y: newScale });
  
		//   var newPos = {
		// 	x: pointer!.x - mousePointTo.x * newScale,
		// 	y: pointer!.y - mousePointTo.y * newScale,
		//   };

		//   stage.position(newPos);
		// });

		puzzleLayer = new Konva.Layer();
		stage.add(puzzleLayer);
		puzzleLayer.draw();
	}, []);

	loadUserDataFromLocalStorage();

	return (
		<div>
			<div className={styles.canvasContainer} id="canvas-container">
			</div>

			<div className={styles.ui}>
				<select className={styles.dropdown} id="image-format-dropdown" defaultValue={selectedImageFormat} onChange={() => onImageFormatChange()}>
					<option value="png" id="pngOption">PNG</option>
					<option value="jpg" id="jpgOption" >JPG</option>
				</select>

				<button className={styles.button} id="load-images-button" onClick={() => onLoadImagesClick()} >Load Images</button>
				<button className={styles.button + " " + styles.disabled} id="solve-puzzle-button" onClick={() => onSolvePuzzleClick()} >Solve Puzzle</button>

			</div>
		</div>
		
	);
}