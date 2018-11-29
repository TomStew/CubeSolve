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
//  |  Face  | Face  | Center | Center | Slice  |
//  |  Name  | Array | Loc #  | Color  | ID[#]  |
//  |--------|-------|--------|--------|--------|
//  | Back   | faceB |    4   |  Green | Z[0]   |
//  | Front  | faceF |   22   |  Blue  | Z[N-1] |
//  | Down   | faceD |   10   | White  | Y[0]   |
//  |  Up    | faceU |   15   | Yellow | Y[N-1] |
//  | Left   | faceL |   12   | Orange | X[0]   |
//  | Right  | faceR |   14   |  Red   | X[N-1] |
//  |--------|-------|--------|--------|--------|


var UnitCube = function ( cubeWidth, edgeWidth ) {
	var faceWidth  = cubeWidth - 2 * edgeWidth; 
	var edgeCenter = ( cubeWidth - edgeWidth ) / 2;
	var redMesh    = new THREE.Mesh( new THREE.BoxGeometry( edgeWidth, faceWidth, faceWidth), new THREE.MeshStandardMaterial( { color: 0xff0000 } ));
	var orangeMesh = new THREE.Mesh( new THREE.BoxGeometry( edgeWidth, faceWidth, faceWidth), new THREE.MeshStandardMaterial( { color: 0xff8c00 } ));
	var yellowMesh = new THREE.Mesh( new THREE.BoxGeometry( faceWidth, edgeWidth, faceWidth), new THREE.MeshStandardMaterial( { color: 0xffff00 } ));
	var whiteMesh  = new THREE.Mesh( new THREE.BoxGeometry( faceWidth, edgeWidth, faceWidth), new THREE.MeshStandardMaterial( { color: 0xffffff } ));
	var blueMesh   = new THREE.Mesh( new THREE.BoxGeometry( faceWidth, faceWidth, edgeWidth), new THREE.MeshStandardMaterial( { color: 0x0000ff } ));
	var greenMesh  = new THREE.Mesh( new THREE.BoxGeometry( faceWidth, faceWidth, edgeWidth), new THREE.MeshStandardMaterial( { color: 0x00cc11 } ));

	var geoX = new THREE.BoxGeometry( faceWidth, edgeWidth, edgeWidth );
	var geoY = new THREE.BoxGeometry( edgeWidth, faceWidth, edgeWidth );
	var geoZ = new THREE.BoxGeometry( edgeWidth, edgeWidth, cubeWidth );  // Add extra length in Z to fill in corners
	var blackMat = new THREE.MeshStandardMaterial( { color: 0x000000 } );
	var edge01 = new THREE.Mesh( geoX, blackMat );
	var edge02 = new THREE.Mesh( geoX, blackMat );
	var edge03 = new THREE.Mesh( geoX, blackMat );
	var edge04 = new THREE.Mesh( geoX, blackMat );
	var edge05 = new THREE.Mesh( geoY, blackMat );
	var edge06 = new THREE.Mesh( geoY, blackMat );
	var edge07 = new THREE.Mesh( geoY, blackMat );
	var edge08 = new THREE.Mesh( geoY, blackMat );
	var edge09 = new THREE.Mesh( geoZ, blackMat );
	var edge10 = new THREE.Mesh( geoZ, blackMat );
	var edge11 = new THREE.Mesh( geoZ, blackMat );
	var edge12 = new THREE.Mesh( geoZ, blackMat );

	redMesh.position.x 		=  edgeCenter;
	orangeMesh.position.x 	= -edgeCenter;
	yellowMesh.position.y 	=  edgeCenter;
	whiteMesh.position.y 	= -edgeCenter;
	blueMesh.position.z 	=  edgeCenter;
	greenMesh.position.z 	= -edgeCenter;

	edge01.position.set( 0, -edgeCenter, -edgeCenter );
	edge02.position.set( 0, -edgeCenter,  edgeCenter );
	edge03.position.set( 0,  edgeCenter, -edgeCenter );
	edge04.position.set( 0,  edgeCenter,  edgeCenter );

	edge05.position.set( -edgeCenter, 0, -edgeCenter );
	edge06.position.set( -edgeCenter, 0,  edgeCenter );
	edge07.position.set(  edgeCenter, 0, -edgeCenter );
	edge08.position.set(  edgeCenter, 0,  edgeCenter );

	edge09.position.set( -edgeCenter, -edgeCenter, 0 );
	edge10.position.set( -edgeCenter,  edgeCenter, 0 );
	edge11.position.set(  edgeCenter, -edgeCenter, 0 );
	edge12.position.set(  edgeCenter,  edgeCenter, 0 );

	unitCubeGroup = new THREE.Group();

	unitCubeGroup.add(redMesh);
	unitCubeGroup.add(orangeMesh);
	unitCubeGroup.add(yellowMesh);
	unitCubeGroup.add(whiteMesh);
	unitCubeGroup.add(blueMesh);
	unitCubeGroup.add(greenMesh);

	unitCubeGroup.add(edge01);
	unitCubeGroup.add(edge02);
	unitCubeGroup.add(edge03);
	unitCubeGroup.add(edge04);

	unitCubeGroup.add(edge05);
	unitCubeGroup.add(edge06);
	unitCubeGroup.add(edge07);
	unitCubeGroup.add(edge08);

	unitCubeGroup.add(edge09);
	unitCubeGroup.add(edge10);
	unitCubeGroup.add(edge11);
	unitCubeGroup.add(edge12);

	return( unitCubeGroup );
};

var MultiCubeN = function ( multiCubeSize, unitCubeSize, unitCubeSpace, unitCubeBorder ) {
	// Set default values.
	this.position = new THREE.Vector3(0, 0, 0);  	// FIX ME Add this later to allow MultiCubeN away from origin.
	this.xAxis = new THREE.Vector3(1, 0, 0);		// Rotate on this axis for pitch. Translate to move right (left).
	this.yAxis = new THREE.Vector3(0, 1, 0);		// Rotate on this axis for yaw. Translate to move up (down).
	this.zAxis = new THREE.Vector3(0, 0, 1);		// Rotate on this for roll. Translate to move backward (forward).
	this.cubeRotateSteps = 32; 						// Number of rotation steps to animate a 90 degree turn.
	this.frameUpdateTime = 1000 / 60; 				// 60 frames per second

	// Initialize properties
	this.multiCubeSize = multiCubeSize; 		// 3 = 3x3x3, 4 = 4x4x4, etc.
	this.numUnits = multiCubeSize * multiCubeSize * multiCubeSize;
	this.lastUnit = this.numUnits - 1;
	this.unitCubeSize = unitCubeSize;
	this.unitCubeSpace = unitCubeSpace; 
	this.unitCubeBorder = unitCubeBorder; 
	this.gridPitch = unitCubeSize + unitCubeSpace;
	this.stable = true;

	// Create unit cubes
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
				this.cubes.push(new UnitCube( this.unitCubeSize, this.unitCubeBorder ));
				this.cubes[i].position.x = (x + 0.5 - 0.5 * this.multiCubeSize) * this.gridPitch + this.position.x;
				this.cubes[i].position.y = (y + 0.5 - 0.5 * this.multiCubeSize) * this.gridPitch + this.position.y;
				this.cubes[i].position.z = (z + 0.5 - 0.5 * this.multiCubeSize) * this.gridPitch + this.position.z;
				this.cubes[i].castShadow = true;
				this.cubeNumAt[i] = i;
				i++;
			}; 
		}; 
	}; 
	this.updateSlices();
}; 

// Define a method for adding a MultiCubeN to a scene.
MultiCubeN.prototype.addToScene = function( scene ) {
	for (var i = 0; i <= this.lastUnit; i++) {
		scene.add(this.cubes[i]);
	};
};

MultiCubeN.prototype.setPosition = function( newPosition ) {
	var deltaX = newPosition.x - this.position.x;
	var deltaY = newPosition.y - this.position.y;
	var deltaZ = newPosition.z - this.position.z;
	this.position = newPosition;

	// Update unit cube positions.
	for (var i=0; i<=this.lastUnit; i++) {
		this.cubes[i].position.x += deltaX;
		this.cubes[i].position.y += deltaY;
		this.cubes[i].position.z += deltaZ;
	};
}

// Define a method for rotating a slice 90 degrees.
//   axisID: 	"X", "Y", or "Z" to identify axis of rotation.
//   slideNum:  Number of slice to be rotated from 0 to N-1 from back/left/bottom to front/right/top.
//	 rotDir: 	1 = clockwise; -1 = counterclockwise as viewed from back/left/bottom.
MultiCubeN.prototype.rotateSlice90 = function( axisID, sliceNum, rotDir ) {
	var _angle = 0;
	var _axis = new THREE.Vector3(0, 0, 0);
	var _sliceNum = 0;
	var _slice = [];

	// Force _sliceNum to be an integer from 0 to N-1.
	if (( sliceNum >= 0 ) && ( sliceNum <= this.multiCubeSize - 1 )) {
		_sliceNum = Math.round(sliceNum);
	} else {
		_sliceNum = 0;
	}

	// Setup _slice and _axis for rotation.
	if (axisID === "X") {
		_slice = this.sliceX[_sliceNum];
		_axis = this.xAxis; 
	} else if (axisID === "Y") {
		_slice = this.sliceY[_sliceNum];
		_axis = this.yAxis; 
	} else {
		_slice = this.sliceZ[_sliceNum];
		_axis = this.zAxis;	// Default to Z-axis.
	}

	// Calculate angle per rotation step.
	_angle = rotDir * Math.PI / ( 2 * this.cubeRotateSteps );

	// Perform recursive rotation.
	this.rotateSliceRecur( _slice, _axis, _angle, this.frameUpdateTime, this.cubeRotateSteps );
};

// Define a recursive method for mixing up a multi-cube by repeatedly doing random 90 degree rotations.
MultiCubeN.prototype.mixUp = function( count ) {
	var _this = this;	// We need this to make this.mixUp work inside the setTimeout context.
	var axisNum, axisID, delay, sliceNum, rotDir, timeoutID;

	if (count > 0) {
		// Choose random axis.
		axisNum = Math.floor( 3 * Math.random() );
		if (axisNum == 1) {
			axisID = "X";
		} else if (axisNum == 2) {
			axisID = "Y";
		} else {
			axisID = "Z";
		}

		sliceNum = Math.floor( this.multiCubeSize * Math.random() ); 	// Choose random sliceNum from 0 to N-1.

		// Choose random rotation direction (1 or -1).
		if ( Math.random() > 0.5 ) {
			rotDir = 1; 
		} else {
			rotDir = -1;
		}

		// FIX ME!  This doesn't work reliably.  Mix-up rotates faces while cube is unstable.
		delay = 1.05 * _this.frameUpdateTime * _this.cubeRotateSteps; 	// Add 5% pause between 90 degree rotations.

		this.rotateSlice90( axisID, sliceNum, rotDir ); 
		timeoutID = setTimeout( function() {
			_this.mixUp( count - 1 );
		}, delay);
	};
};

// Define a recursive method for rotating a slice using a multi-step animation.
//   slice  = slice array (e.g. this.sliceZ[n], this.faceF, this.faceL, etc) to be rotated
//   axis  = real world axis to rotate around (normally X, Y, or Z)
//   angle = rotation step size in radians
//   delay = time between steps in ms
//	 count = number of steps
MultiCubeN.prototype.rotateSliceRecur = function( slice, axis, angle, delay, count ) {
	var _this = this;	// We need this to make this.rotateSliceRecur work inside the setTimeout context.
	if (count > 0) {
		this.stable = false; 
		this.rotateSlicePartial( slice, axis, angle );
		var timeoutID = setTimeout( function() {
			_this.rotateSliceRecur( slice, axis, angle, delay, count - 1 );
		}, delay);
	} else {
		this.snapToGrid();
		this.updateCubeNumAt();
		this.updateSlices();
		this.stable = true;
	}
};

// Define a method for rotating a slice by an angle in a single step. 
MultiCubeN.prototype.rotateSlicePartial = function( slice, axis, angle ) {
	var i = j = k = 0;
	var q = new THREE.Quaternion();
	q.setFromAxisAngle(axis, angle);	// Represent the desired rotation as a quaternion.
	for (i = 0; i <= this.multiCubeSize - 1; i++) {
		for (j = 0; j <= this.multiCubeSize - 1; j++) {
				k = slice[i][j];							// Get index of unit cube to be rotated.
				this.cubes[k].applyQuaternion(q);			// Update unit cube orientation (rotation).
				this.cubes[k].position.sub(this.position); 	// Subtract origin of multicube from unit cube position.
				this.cubes[k].position.applyQuaternion(q); 	// Apply rotation to unit cube position.
				this.cubes[k].position.add(this.position); 	// Add origin of multicube back into unit cube position.				
		};
	};
}; 

// Define a method to snap unit cube locations and orientations to force on-grid and on-axis.
MultiCubeN.prototype.snapToGrid = function() {
	var gridX = 0;  	// X grid position from 0 to N-1.
	var gridY = 0;  	// Y grid position from 0 to N-1.
	var gridZ = 0;  	// Z grid position from 0 to N-1.
	var gridRotX = 0; 	// X rotation from -1 to +2 with step size of 90 degrees.
	var gridRotY = 0; 	// Y rotation from -1 to +2 with step size of 90 degrees.
	var gridRotZ = 0; 	// Z rotation from -1 to +2 with step size of 90 degrees.
	for (var i=0; i<=this.lastUnit; i++) {
		// Snap positions to grid.
		gridX = Math.round((( this.cubes[i].position.x - this.position.x ) / this.gridPitch ) + 0.5 * (this.multiCubeSize - 1)); 
		gridY = Math.round((( this.cubes[i].position.y - this.position.y ) / this.gridPitch ) + 0.5 * (this.multiCubeSize - 1)); 
		gridZ = Math.round((( this.cubes[i].position.z - this.position.z ) / this.gridPitch ) + 0.5 * (this.multiCubeSize - 1)); 
		this.cubes[i].position.x = this.gridPitch * (gridX + 0.5 * (1 - this.multiCubeSize)) + this.position.x;
		this.cubes[i].position.y = this.gridPitch * (gridY + 0.5 * (1 - this.multiCubeSize)) + this.position.y;
		this.cubes[i].position.z = this.gridPitch * (gridZ + 0.5 * (1 - this.multiCubeSize)) + this.position.z;

		// Snap rotations to X/Y/Z axes.
		gridRotX = Math.round(this.cubes[i].rotation.x / (Math.PI / 2)); 
		gridRotY = Math.round(this.cubes[i].rotation.y / (Math.PI / 2)); 
		gridRotZ = Math.round(this.cubes[i].rotation.z / (Math.PI / 2)); 
		this.cubes[i].rotation.x = gridRotX * Math.PI / 2;
		this.cubes[i].rotation.y = gridRotY * Math.PI / 2;
		this.cubes[i].rotation.z = gridRotZ * Math.PI / 2;
	};
};

// Define a method to determine location # for each cube and update cubeNumAt 
//    array accordingly.
// Assumes this.snapToGrid has already been run.
MultiCubeN.prototype.updateCubeNumAt = function() {
	var gridX = 0;  	// X grid position from 0 to N-1.
	var gridY = 0;  	// Y grid position from 0 to N-1.
	var gridZ = 0;  	// Z grid position from 0 to N-1.
	var locNum = 0;		// Location # from 0 to N^3 - 1.
	for (var i=0; i<=this.lastUnit; i++) {
		gridX = (( this.cubes[i].position.x - this.position.x ) / this.gridPitch ) + 0.5 * (this.multiCubeSize - 1); 
		gridY = (( this.cubes[i].position.y - this.position.y ) / this.gridPitch ) + 0.5 * (this.multiCubeSize - 1); 
		gridZ = (( this.cubes[i].position.z - this.position.z ) / this.gridPitch ) + 0.5 * (this.multiCubeSize - 1); 
		locNum = Math.round(this.multiCubeSize*this.multiCubeSize*gridZ + this.multiCubeSize*gridY + gridX);
		this.cubeNumAt[locNum] = i;
	};
};

// Define a method to update all sliceX/Y/Z and faceF/U/R/B/D/L arrays.
// Valid for any value of multiCubeSize.
// Assumes this.updateCubeNumAt has already been run.
MultiCubeN.prototype.updateSlices = function() {
	// Update sliceX/Y/Z arrays using cubeNumAt.
	var i = x = y = z = 0;
	for (z = 0; z <= this.multiCubeSize - 1; z++) {
		for (y = 0; y <= this.multiCubeSize - 1; y++) {
			for (x = 0; x <= this.multiCubeSize - 1; x++) {
				this.sliceX[x][y][z] = this.cubeNumAt[i];	// Slices in X axis from left to right.
				this.sliceY[y][z][x] = this.cubeNumAt[i];	// Slices in Y axis from down to up.
				this.sliceZ[z][y][x] = this.cubeNumAt[i];	// Slices in Z axis from back to front.
				i++;
			};
		};
	};

	// Update faceF/U/R/B/D/L arrays from sliceX/Y/Z arrays.
	this.faceF = this.sliceZ[this.multiCubeSize - 1];	// Define front face (blue).
	this.faceU = this.sliceY[this.multiCubeSize - 1]; 	// Define up face (yellow).
	this.faceR = this.sliceX[this.multiCubeSize - 1]; 	// Define right face (red).
	this.faceB = this.sliceZ[0]; 						// Define back face (green).
	this.faceD = this.sliceY[0]; 						// Define down face (white).
	this.faceL = this.sliceX[0];  						// Define left face (orange).
};
