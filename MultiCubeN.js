// MultiCubeN.js
// 
// Define an NxNxN array of multi-colored unit cubes.
// Provide methods for adding multicube to a scene and rotating faces.
//
// Example of location # used in this.cubeNumAt for 3x3x3: 
//   Front face (blue center)
//	   24 25 26
//     21 22 23
//     18 19 20
//   Middle slice
//	   15 16 17
//     12 13 14
//      9 10 11			
//   Back face (green center) as viewed from front
// 		6  7  8
// 		3  4  5
// 		0  1  2
//
// Faces: (Center loc # is for 3x3x3 example)
//  |  Face  | Face  | Center | Center |
//  |  Name  | Array | Loc #  | Color  |
//  |--------|-------|--------|--------|
//  | Front  | faceF |   22   |  Blue  |
//  | Back   | faceB |    4   |  Green |
//  | Left   | faceL |   12   | Orange |
//  | Right  | faceR |   14   |  Red   |
//  |  Up    | faceU |   15   | Yellow |
//  | Down   | faceD |   10   | White  |
//  |--------|-------|--------|--------|

var MultiCubeN = function ( multiCubeSize, unitCubeSize, unitCubeSpace ) {
	this.multiCubeSize = multiCubeSize; 		// 3 = 3x3x3, 4 = 4x4x4, etc.
	this.numUnits = multiCubeSize * multiCubeSize * multiCubeSize;
	this.lastUnit = this.numUnits - 1;
	this.unitCubeSize = unitCubeSize;
	this.unitCubeSpace = unitCubeSpace; 
	this.gridPitch = unitCubeSize + unitCubeSpace;
	this.stable = true;
	this.unitGeo = new THREE.BoxGeometry( unitCubeSize, unitCubeSize, unitCubeSize );
	this.unitGeo.faces[0].color.setHex( 0xff0000 );	// Red
	this.unitGeo.faces[1].color.setHex( 0xff0000 ); // Red
	this.unitGeo.faces[2].color.setHex( 0xff8c00 ); // Orange
	this.unitGeo.faces[3].color.setHex( 0xff8c00 ); // Orange
	this.unitGeo.faces[4].color.setHex( 0xffff00 ); // Yellow
	this.unitGeo.faces[5].color.setHex( 0xffff00 ); // Yellow
	this.unitGeo.faces[6].color.setHex( 0xffffff ); // White
	this.unitGeo.faces[7].color.setHex( 0xffffff ); // White
	this.unitGeo.faces[8].color.setHex( 0x0000ff ); // Blue
	this.unitGeo.faces[9].color.setHex( 0x0000ff ); // Blue
	this.unitGeo.faces[10].color.setHex( 0x00cc11 ); // Green
	this.unitGeo.faces[11].color.setHex( 0x00cc11 ); // Green
	this.unitMat = new THREE.MeshStandardMaterial( { vertexColors: THREE.FaceColors } );

	this.cubes = [];
	this.cubeNumAt = [];
	this.sliceX = [];
	this.sliceY = [];
	this.sliceZ = [];
	var i = 0;
	for (var z = 0; z <= this.multiCubeSize - 1; z++) {
		this.sliceX[z] = [];
		this.sliceY[z] = [];
		this.sliceZ[z] = [];
		for (var y = 0; y <= this.multiCubeSize - 1; y++) {
			this.sliceX[z][y] = [];
			this.sliceY[z][y] = [];
			this.sliceZ[z][y] = [];
			for (var x = 0; x <= this.multiCubeSize - 1; x++) {
				this.sliceX[z][y][x] = 0;
				this.sliceY[z][y][x] = 0;
				this.sliceZ[z][y][x] = 0;
				this.cubes.push(new THREE.Mesh( this.unitGeo, this.unitMat ));
				this.cubes[i].position.x = (x + 0.5 - 0.5 * this.multiCubeSize) * this.gridPitch;
				this.cubes[i].position.y = (y + 0.5 - 0.5 * this.multiCubeSize) * this.gridPitch;
				this.cubes[i].position.z = (z + 0.5 - 0.5 * this.multiCubeSize) * this.gridPitch;
				this.cubes[i].castShadow = true;
				this.cubeNumAt[i] = i;
				i++;
			}; 
		}; 
	}; 
	this.updateSlices();
	this.updateFaces();
}; 

// Define a method for adding a MultiCubeN to a scene.
MultiCubeN.prototype.addToScene = function( scene ) {
	for (var i = 0; i <= this.lastUnit; i++) {
		scene.add(this.cubes[i]);
	};
};

// Define a recursive method for rotating a face using a multi-step animation.
//   face  = face array (e.g. faceF, faceL, etc) to be rotated
//   axis  = real world axis to rotate around (normally X, Y, or Z)
//   angle = rotation step size in radians
//   delay = time between steps in ms
//	 count = number of steps
MultiCubeN.prototype.rotateFaceRecur = function( face, axis, angle, delay, count ) {
	var _this = this;	// We need this to make this.rotateFaceRecur work inside the setTimeout context.
	if (count > 0) {
		this.stable = false; 
		this.rotateFacePartial( face, axis, angle );
		var timeoutID = setTimeout( function() {
			_this.rotateFaceRecur( face, axis, angle, delay, count-1 );
		}, delay);
	} else {
		// this.snapToGrid();
		this.updateCubeNumAt();
		this.updateSlices();
		this.updateFaces();
		this.stable = true;
	}
}

// Define a method for rotating a face by an angle in a single step. 
MultiCubeN.prototype.rotateFacePartial = function( face, axis, angle ) {
	var i = j = k = 0;
	var q = new THREE.Quaternion();
	q.setFromAxisAngle(axis, angle);
	for (i = 0; i <= this.multiCubeSize - 1; i++) {
		for (j = 0; j <= this.multiCubeSize - 1; j++) {
				k = face[i][j];
				this.cubes[k].applyQuaternion(q);
				this.cubes[k].position.applyQuaternion(q);
		};
	};
}; 

// Dfine a method to snap unit cube locations and orientations to force on-grid and on-axis.
// FIX ME for larger cubes
MultiCubeN.prototype.snapToGrid = function() {
	for (var i=0; i<=this.lastUnit; i++) {
		// Snap X position
		if ( this.cubes[i].position.x > this.gridPitch / 2 ) {
			this.cubes[i].position.x = this.gridPitch;
		} else if ( this.cubes[i].position.x < -this.gridPitch / 2 ) {
			this.cubes[i].position.x = -this.gridPitch;						
		} else {
			this.cubes[i].position.x = 0;
		}
		// Snap Y position
		if ( this.cubes[i].position.y > this.gridPitch / 2 ) {
			this.cubes[i].position.y = this.gridPitch;
		} else if ( this.cubes[i].position.y < -this.gridPitch / 2 ) {
			this.cubes[i].position.y = -this.gridPitch;						
		} else {
			this.cubes[i].position.y = 0;
		}
		// Snap Z position
		if ( this.cubes[i].position.z > this.gridPitch / 2 ) {
			this.cubes[i].position.z = this.gridPitch;
		} else if ( this.cubes[i].position.z < -this.gridPitch / 2 ) {
			this.cubes[i].position.z = -this.gridPitch;						
		} else {
			this.cubes[i].position.z = 0;
		}
		// Snap X rotation
		if ( this.cubes[i].rotation.x < -3 * Math.PI / 4 ) {
			this.cubes[i].rotation.x = Math.PI;
		} else if ( this.cubes[i].rotation.x < -Math.PI / 4 ) {
			this.cubes[i].rotation.x = -Math.PI / 2;
		} else if ( this.cubes[i].rotation.x < Math.PI / 4 ) {
			this.cubes[i].rotation.x = 0;
		} else if ( this.cubes[i].rotation.x < 3 * Math.PI / 4 ) {
			this.cubes[i].rotation.x = Math.PI / 2;
		} else {
			this.cubes[i].rotation.x = Math.PI;
		}
		// Snap Y rotation
		if ( this.cubes[i].rotation.y < -3 * Math.PI / 4 ) {
			this.cubes[i].rotation.y = Math.PI;
		} else if ( this.cubes[i].rotation.y < -Math.PI / 4 ) {
			this.cubes[i].rotation.y = -Math.PI / 2;
		} else if ( this.cubes[i].rotation.y < Math.PI / 4 ) {
			this.cubes[i].rotation.y = 0;
		} else if ( this.cubes[i].rotation.y < 3 * Math.PI / 4 ) {
			this.cubes[i].rotation.y = Math.PI / 2;
		} else {
			this.cubes[i].rotation.y = Math.PI;
		}
		// Snap Z rotation
		if ( this.cubes[i].rotation.z < -3 * Math.PI / 4 ) {
			this.cubes[i].rotation.z = Math.PI;
		} else if ( this.cubes[i].rotation.z < -Math.PI / 4 ) {
			this.cubes[i].rotation.z = -Math.PI / 2;
		} else if ( this.cubes[i].rotation.z < Math.PI / 4 ) {
			this.cubes[i].rotation.z = 0;
		} else if ( this.cubes[i].rotation.z < 3 * Math.PI / 4 ) {
			this.cubes[i].rotation.z = Math.PI / 2;
		} else {
			this.cubes[i].rotation.z = Math.PI;
		}
	}
}

// Define a method to determine location # for each cube and update cubeNumAt 
//    array accordingly.
// Assumes unit cube positions have already been snapped to grid so that unit 
//    cube positions should be integer multiples of this.gridPitch.
MultiCubeN.prototype.updateCubeNumAt = function() {
	var gridX = 0;  // X grid position from 0 to 2.
	var gridY = 0;  // Y grid position from 0 to 2.
	var gridZ = 0;  // Z grid position from 0 to 2.
	var locNum = 0;		// Location # from 0 to 26.
	for (var i=0; i<=this.lastUnit; i++) {
		gridX = ( this.cubes[i].position.x / this.gridPitch ) + 0.5 * (this.multiCubeSize - 1); 
		gridY = ( this.cubes[i].position.y / this.gridPitch ) + 0.5 * (this.multiCubeSize - 1); 
		gridZ = ( this.cubes[i].position.z / this.gridPitch ) + 0.5 * (this.multiCubeSize - 1); 
		locNum = Math.round(this.multiCubeSize*this.multiCubeSize*gridZ + this.multiCubeSize*gridY + gridX);
		this.cubeNumAt[locNum] = i;
	};
};

// Define a method to update all 6 face arrays using cubeNumAt.
// Assumes this.cubeNumAt has already been updated.
// Existing implementation assumes 3x3x3 (multiCubeSize = 3).
MultiCubeN.prototype.updateFaces = function() {
	this.faceF = this.sliceZ[this.multiCubeSize - 1];	// Define front face (blue).
	this.faceU = this.sliceY[this.multiCubeSize - 1]; 	// Define up face (yellow).
	this.faceR = this.sliceX[this.multiCubeSize - 1]; 	// Define right face (red).
	this.faceB = this.sliceZ[0]; 						// Define back face (green).
	this.faceD = this.sliceY[0]; 						// Define down face (white).
	this.faceL = this.sliceX[0];  						// Define left face (orange).

/*
		[this.cubeNumAt[24], this.cubeNumAt[25], this.cubeNumAt[26]], 
		[this.cubeNumAt[21], this.cubeNumAt[22], this.cubeNumAt[23]], 
		[this.cubeNumAt[18], this.cubeNumAt[19], this.cubeNumAt[20]] 
	];
		[this.cubeNumAt[26], this.cubeNumAt[17], this.cubeNumAt[8]], 
		[this.cubeNumAt[23], this.cubeNumAt[14], this.cubeNumAt[5]], 
		[this.cubeNumAt[20], this.cubeNumAt[11], this.cubeNumAt[2]] 
	];
		[this.cubeNumAt[6],  this.cubeNumAt[7],  this.cubeNumAt[8]], 
		[this.cubeNumAt[15], this.cubeNumAt[16], this.cubeNumAt[17]], 
		[this.cubeNumAt[24], this.cubeNumAt[25], this.cubeNumAt[26]]
	];
		[this.cubeNumAt[6], this.cubeNumAt[15], this.cubeNumAt[24]], 
		[this.cubeNumAt[3], this.cubeNumAt[12], this.cubeNumAt[21]], 
		[this.cubeNumAt[0], this.cubeNumAt[9],  this.cubeNumAt[18]]
	];
		[this.cubeNumAt[8], this.cubeNumAt[7], this.cubeNumAt[6]], 
		[this.cubeNumAt[5], this.cubeNumAt[4], this.cubeNumAt[3]], 
		[this.cubeNumAt[2], this.cubeNumAt[1], this.cubeNumAt[0]]
	];
		[this.cubeNumAt[18], this.cubeNumAt[19], this.cubeNumAt[20]], 
		[this.cubeNumAt[9],  this.cubeNumAt[10], this.cubeNumAt[11]], 
		[this.cubeNumAt[0],  this.cubeNumAt[1],  this.cubeNumAt[2]]
	];
	*/
};


// Define a method to update all slice arrays using cubeNumAt.
// Valid for any value of multiCubeSize.
// Assumes this.cubeNumAt has already been updated.
MultiCubeN.prototype.updateSlices = function() {
	var i = x = y = z = 0;
	for (z = 0; z <= this.multiCubeSize - 1; z++) {
		for (y = 0; y <= this.multiCubeSize - 1; y++) {
			for (x = 0; x <= this.multiCubeSize - 1; x++) {
				this.sliceX[x][y][z] = this.cubeNumAt[i];
				this.sliceY[y][z][x] = this.cubeNumAt[i];
				this.sliceZ[z][y][x] = this.cubeNumAt[i];
				i++;
			}
		}
	}
};
