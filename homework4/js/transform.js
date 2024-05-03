/**
 * @file functions to compute model/view/projection matrices
 *
 * @copyright The Board of Trustees of the Leland Stanford Junior University
 * @version 2022/04/21
 */



/**
  * MVPmat
  *
  * @class MVPmat
  * @classdesc Class for holding and computing model/view/projection matrices.
  *
  * @param  {DisplayParameters} dispParams    display parameters
  */
var MVPmat = function ( dispParams ) {

	// Alias for accessing this from a closure
	var _this = this;


	this.modelMat = new THREE.Matrix4();

	this.stereoViewMat =
		{ L: new THREE.Matrix4(), R: new THREE.Matrix4() };

	this.stereoProjectionMat =
		{ L: new THREE.Matrix4(), R: new THREE.Matrix4() };


	/* Functions */

	// A function to compute a model transform matrix
	function computeModelTransform( state ) {

		var modelTranslation = state.modelTranslation;

		var modelRotation = state.modelRotation;

		var translationMat
			= new THREE.Matrix4().makeTranslation(
				modelTranslation.x,	modelTranslation.y, modelTranslation.z );

		var rotationMatX =
			new THREE.Matrix4().makeRotationX(
				modelRotation.x * THREE.Math.DEG2RAD );

		var rotationMatY =
			new THREE.Matrix4().makeRotationY(
				modelRotation.y * THREE.Math.DEG2RAD );

		var modelMatrix = new THREE.Matrix4().
			premultiply( rotationMatY ).
			premultiply( rotationMatX ).
			premultiply( translationMat );

		return modelMatrix;

	}

	// A function to compute a model matrix based on the current state
	function computeViewTransform( state, halfIpdShift ) {

		var viewerPosition = state.viewerPosition;

		var viewerTarget = state.viewerTarget;

		var viewerUp = new THREE.Vector3( 0, 1, 0 );

		var translationMat
	   = new THREE.Matrix4().makeTranslation(
			 - viewerPosition.x,
			 - viewerPosition.y,
			 - viewerPosition.z );

		var rotationMat = new THREE.Matrix4().lookAt(
			viewerPosition, viewerTarget, viewerUp ).transpose();

		var ipdTranslateMat
			= new THREE.Matrix4().makeTranslation( halfIpdShift, 0, 0 );

		return new THREE.Matrix4()
			.premultiply( translationMat )
			.premultiply( rotationMat )
			.premultiply( ipdTranslateMat );

	}


	function computePerspectiveTransform(
		left, right, top, bottom, clipNear, clipFar ) {

		return new THREE.Matrix4()
			.makePerspective( left, right, top, bottom, clipNear, clipFar );

	}

	// A function to compute frustum parameters for stereo rendering.
	// Returns top/bottom/left/right values for left and right eyes.
	//
	// OUTPUT:
	// (left eye) topL, bottomL, leftL, rightL
	// (right eye) topR, bottomR, leftR, rightR
	//
	// NOTE:
	// The default values are wrong. Replace them.
	// All the parameters you need for your calculations are found in the function arguments.
	function computeTopBottomLeftRight( clipNear, clipFar, dispParams ) {

		/* TODO (2.1.2) Stereo Rendering */

		var pp = dispParams.pixelPitch;
		var d = dispParams.distanceScreenViewer;
		var h = dispParams.canvasHeight;
		var w = dispParams.canvasWidth;
		var mag = dispParams.lensMagnification;
		var ipd = dispParams.ipd;

		var top = clipNear * mag * (h * pp / (2.0 * (d)));
		var bottom = - top;


		var w1 = mag * ipd / 2.0;
		var w2 = Math.abs((mag / 2.0) * (w * pp - ipd));

		rightL = clipNear * w1/d
		leftL = -clipNear * w2/d
		rightR = clipNear * w2/d
		leftR = -clipNear * w1/d

		return {
			topL: top, bottomL: bottom, leftL: leftL, rightL: rightL,
			topR: top, bottomR: bottom, leftR: leftR, rightR: rightR,
		};
	}

	// Update the model/view/projection matrices based on the current state
	// This function is called in every frame.
	//
	// INPUT
	// state: the state object of StateController
	// renderingMode: this variable decides which matrices are updated
	function update( state ) {

		var clipNear = state.clipNear;

		var clipFar = state.clipFar;

		// Compute model matrix
		this.modelMat = computeModelTransform( state );

		// Compute view matrix
		this.stereoViewMat.L = computeViewTransform( state, dispParams.ipd / 2 );

		this.stereoViewMat.R = computeViewTransform( state, - dispParams.ipd / 2 );

		// Compute projection matrix
		var projParams = computeTopBottomLeftRight( clipNear, clipFar, dispParams );

		this.stereoProjectionMat.L = computePerspectiveTransform(
			projParams.leftL, projParams.rightL, projParams.topL, projParams.bottomL, clipNear, clipFar );

		this.stereoProjectionMat.R = computePerspectiveTransform(
			projParams.leftR, projParams.rightR, projParams.topR, projParams.bottomR, clipNear, clipFar );

	}



	/* Expose as public functions */

	this.computeModelTransform = computeModelTransform;

	this.computeViewTransform = computeViewTransform;

	this.computePerspectiveTransform = computePerspectiveTransform;

	this.computeTopBottomLeftRight = computeTopBottomLeftRight;

	this.update = update;

};
