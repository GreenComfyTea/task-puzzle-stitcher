'use client';

import '@picocss/pico';
import styles from "./page.module.css";
import React, { useState, useEffect } from 'react';
import Konva from "konva";

import PuzzleManager from "../puzzle-stitcher/PuzzleManager";

var puzzleLayer: Konva.Layer | undefined = undefined;
var puzzleManager: PuzzleManager | undefined = undefined;

var imageFormatDropdownElement: HTMLSelectElement | null = null;
var solvePuzzleButtonElement: HTMLButtonElement | null = null;

export default function ClientPage() {
	function onLoadImagesClick() {
		if(puzzleLayer === undefined) return;
		if(imageFormatDropdownElement === null) return;
		if(solvePuzzleButtonElement === null) return;

		puzzleLayer.removeChildren();
		puzzleLayer.draw();

		const selectedImageFormat = imageFormatDropdownElement.value;

		puzzleManager = new PuzzleManager(puzzleLayer);
		puzzleManager.loadImages(selectedImageFormat, () => solvePuzzleButtonElement!.className = styles.button);
	}

	function onSolvePuzzleClick() {
		if(puzzleManager === undefined) return;

		puzzleManager.solve();
	}

	useEffect(() => {
		imageFormatDropdownElement = document.getElementById("image-format-dropdown") as HTMLSelectElement;
		solvePuzzleButtonElement = document.getElementById("solve-puzzle-button") as HTMLButtonElement;

		var stage = new Konva.Stage({
			container: "canvas",   // id of container <div>
			width: 3901,
			height: 2211,
			// Panning
			draggable: true,
		});

		var layer = new Konva.Layer();

		stage.add(layer);

		// Zooming
		var scaleBy = 1.25;
		stage.on('wheel', (e) => {
		  // Stop default scrolling
		  e.evt.preventDefault();
  
		  var oldScale = stage.scaleX();
		  var pointer = stage.getPointerPosition();
  
		  var mousePointTo = {
			x: (pointer!.x - stage.x()) / oldScale,
			y: (pointer!.y - stage.y()) / oldScale,
		  };
  
		  // How to scale? Zoom in? Or zoom out?
		  let direction = e.evt.deltaY > 0 ? -1 : 1;
  
		  // When we zoom on trackpad, e.evt.ctrlKey is true
		  // In that case lets revert direction
		  if (e.evt.ctrlKey) {
			direction = -direction;
		  }
  
		  var newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
  
		  stage.scale({ x: newScale, y: newScale });
  
		  var newPos = {
			x: pointer!.x - mousePointTo.x * newScale,
			y: pointer!.y - mousePointTo.y * newScale,
		  };

		  stage.position(newPos);
		});


		puzzleLayer = layer;

		// draw the image
		layer.draw();
	}, []);

	return (
		<div>
			<div id="canvas">
			</div>

			<div className={styles.ui}>
				<select className={styles.dropdown} id="image-format-dropdown">
					<option value="png">PNG</option>
					<option value="jpg">JPG</option>
				</select>

				<button className={styles.button} id="load-images-button" onClick={() => onLoadImagesClick()} >Load Images</button>
				<button className={styles.button + " " + styles.disabled} id="solve-puzzle-button" onClick={() => onSolvePuzzleClick()} >Solve Puzzle</button>

			</div>
		</div>
		
	);
}
