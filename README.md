# vidometer v2.1.1

**vidometer** is a World Tracking feature of **bettar-vidometry** library.

This library is created to simplify using the AR world tracking experience on the web.
In a few lines of the code, you can integrate the World Tracking experience into your web application to provide an exciting AR experience for the users.

## vidometer-demo

This example project shows how to integrate a **vidometer** into your web application.

You can check [live example](https://bettar.life/vidometer/).

# vidometer integration

In order to add a **vidometer** to your site you need the following actions:

1. Add the following JS script in the **head** section:

```tsx
<head>
	...
	<script src="https://bettar.life/vidometry/vidometer.2.1.1.js"></script>
	...
</head>
```

1. Add **vidometer** to web page:
    
    a. add **viomdetry-vidometer** tag:
    

```tsx
<vidometry-vidometer id="vidometer"></vidometry-vidometer>
```

b. add vidometry-vidometer programmatically:

```tsx
vidometer = this.document.createElement('vidometry-vidometer');
document.body.appendChild(vidometer);
```

1. Add **vidometer** callbacks:
    1. **onReady()** - throws when Vidometer is initialized and ready to work;
    2. **onKeyframeSearching(code, text)** - throws when Vidometer tries to search initial keyframe;
        1. **code** - integer, response code (see Vidometer Code Response);
            1. 1 - NOT_ENOUGH_FEATURES - means that the surface doesn’t have enough features to be used as a keyframe;
            2. 11 - WRONG_ORIENTATION_X - in this case, orientation of X axis of the phone (or the pitch, see Phone Orientation) - the angle between the phone and the floor should be 35 degrees (parallel to the floor);
            3. 100 - COMPLETE - calibrated;
        2. **text** - string, text description of the code;
    3. **onCalibration(code, text)** - throws when Vidometer tries to calibrate;
        1. **code** - integer, response code (see Vidometer Code Response);
            1. 1 - NOT_ENOUGH_FEATURES - means that the surface doesn’t have enough features to be used as a keyframe;
            2. 11 - WRONG_ORIENTATION_X - in this case, the orientation of the X axis of the phone (or the pitch, see Phone Orientation) - the angle between the phone and the floor should be 0 degrees (parallel to the floor);
            3. 13 - WRONG_ORIENTATION_Z - in this case, the orientation of the Z axis of the phone (or the roll, see Phone Orientation) should be close to 0 degrees;
            4. 100 - COMPLETE - keyframe is found;
        2. **text** - string, text description of the code;
    4. **onProcess(rototranslation, objecRototranslation, fov)** - used to update the 3d position of the perspective camera of the scene and the object on the scene. Throws every frame;
        1. **rototranslation** - source of roto-translation matrix (4x4);
        2. **objecRototranslation -** source of roto-translation matrix (4x4);
        3. **fov** - field of view of the perspective camera;

```jsx
vidometer.onReady = onVidometerReady;
vidometer.onKeyframeSearching = onVidometerKeyframeSearching;
vidometer.onCalibration = onVidometerCalibration;
vidometer.onProcess = onVidometerProcess;
```

1. Initialize the Vidometer:
    1. **sceneWidth** - width of the scene in pixels;
    2. **sceneHeight** - height of the scene in pixels;
    3. **videoCanvas** - reference to the canvas tag where video frame should be rendered;

```jsx
vidometer.initialize(sceneWidth, sceneHeight, videoCanvas);
```

1. Placing object on the surface
    
    While the Vidometer is calibrated, you need call the **start** method and pass the point on the scene; **u** - x screen’s coordinate, **v** - y screen’s coordinate, origin - top left corner on the screen:
    

```tsx
vidomter.start(u, v)
	.then(response => {
		const {code, text} = response;
		// handle response
});
```

   a. **code** - integer, response code (see Vidometer Code Response);

1. 1 - NOT_ENOUGH_FEATURES - means that the surface where you can place an object doesn’t have enough features;
2. 11 - WRONG_ORIENTATION_X - in this case, the orientation of the X axis of the phone (or the pitch, see Phone Orientation) - the angle between the phone and the floor should be not more than 60 degrees (relative to the floor);
3. 100 - COMPLETE - keyframe is found;

  b. **text** - string, text description of the code;

You can also stop and clear the processing of the Vidometer

```jsx
vidometer.stop();
```

In order to resume vidometer processing, you need to call the resume method:

```jsx
vidometer.resume();
```

After resuming the tracking process will be completely restarting.

**Complete example with vidometry-vidometer tag:** 

```jsx
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Vidometer Demo</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.js"
    integrity="sha512-NLtnLBS9Q2w7GKK9rKxdtgL7rA7CAS85uC/0xd9im4J/yOL4F9ZVlv634NAM7run8hz3wI2GabaA6vv8vJtHiQ=="
    crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <script src="https://bettar.life/vidometry/vidometer.2.1.1.js"></script>
  <script>

    class Scene3D {
      constructor(width, height, canvas) {
        this.fov = 70;
        this.width = width;
        this.height = height;

        // 1. renderer
        this.renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
        });
        this.renderer.setSize(width, height);

        // 2. scene
        this.scene = new THREE.Scene();

        // 3. camera
        const aspect = width / height;
        this.camera = new THREE.PerspectiveCamera(this.fov, aspect, 0.01, 10000);
        this.camera.filmGauge = Math.max(width, height);
        var focal = this.fovToFocal(this.fov, this.width, this.height);
        this.camera.setFocalLength(focal);
        this.camera.updateProjectionMatrix();
        this.scene.add(this.camera);

        // 4. container
        this.container = new THREE.Object3D();
        this.container.frustumCulled = false;
        this.container.matrixAutoUpdate = false;
        this.scene.add(this.container);
      }

      fovToFocal(fov, width, height) {
        var DEG2RAD = Math.PI / 180;
        const vExtentSlope = Math.tan(DEG2RAD * 0.5 * fov);
        const side = Math.max(width, height);
        return 0.5 * side / vExtentSlope;
      };

      updateFieldOfView(fov) {
        if (this.fov !== fov) {
          this.fov = fov;
          var focal = this.fovToFocal(this.fov, this.width, this.height);
          this.camera.setFocalLength(focal);
          this.camera.updateProjectionMatrix();
        }
      }

      show() {
        this.container.visible = true;
      }

      hide() {
        this.container.visible = false;
      }

      addLight(light) {
        this.scene.add(light);
      }

      add(object) {
        this.container.add(object);
      }

      updateObjectMatrix(roto) {
        const matrix = new THREE.Matrix4();
        matrix.set(
          roto[0], roto[1], roto[2], roto[3],
          roto[4], roto[5], roto[6], roto[7],
          roto[8], roto[9], roto[10], roto[11],
          roto[12], roto[13], roto[14], roto[15],
        );

        matrix.decompose(this.container.position, this.container.quaternion, this.container.scale);
        this.container.updateMatrix();
      }

      render(roto) {
        const matrix = new THREE.Matrix4();
        matrix.set(
          roto[0], roto[1], roto[2], roto[3],
          roto[4], roto[5], roto[6], roto[7],
          roto[8], roto[9], roto[10], roto[11],
          roto[12], roto[13], roto[14], roto[15],
        );

        matrix.decompose(this.camera.position, this.camera.quaternion, this.camera.scale);
        this.renderer.render(this.scene, this.camera);
      }

    };

    var scene, vidometer, width, height;
    var isReady = false;
    var isCalibrated = false;
    var isTracking = false;
    var stopState = true;

    const setInfoText = (text) => {
      const info = document.getElementById("info");
      info.innerText = text;
    }

    const onVidometerReady = () => {
      isReady = true;
      setInfoText('Ready');
    }

    /**
     * Event handler on keyframe searching event
     * @param {number} code - 0 - UNDEFINED, 1 - NOT_ENOUGH_FEATURES, 11 - WRONG_ORIENTATION_X, 13 - WRONG_ORIENTATION_Z, 100 - COMPLETE;
     * @param {string} text - text description;
     */
    const onVidometerKeyframeSearching = (code, text) => {
      setInfoText(text);
    };

    /**
     * Event handler on calibration event
     * @param {number} code - 0 - UNDEFINED, 1 - NOT_ENOUGH_FEATURES, 11 - WRONG_ORIENTATION_X, 13 - WRONG_ORIENTATION_Z, 100 - COMPLETE;
     * @param {string} text - text description;
     */
    const onVidometerCalibration = (code, text) => {
      setInfoText(text);
      if (code === 100) {
        isCalibrated = true;
      }
    };

    /**
     * Function that handles the starting
     * @param {number} code - 0 - UNDEFINED, 1 - NOT_ENOUGH_FEATURES, 11 - WRONG_ORIENTATION_X, 13 - WRONG_ORIENTATION_Z, 100 - COMPLETE;
     * @param {string} text - text description;
     */
    const onVidometerStarting = (code, text) => {
      setInfoText(text);
      if (result === 100) {
        isReady = true;
      }
    }

    const onVidometerCalibrate = () => {
      setInfoText('Calibrated');
    }

    const onVidometerProcess = (roto, roto0, fov) => {
      scene.updateFieldOfView(fov);
      scene.updateObjectMatrix(roto0);
      scene.render(roto);
    }

    function onClick(e) {
      if (isCalibrated) {
        const u = e.clientX;
        const v = e.clientY;
        vidometer.start(u, v)
          .then(response => {
            const { code, text } = response;
            onVidometerStarting(code, text);
          });
      }
    }

    function onStopResumeClick() {
      const button = document.getElementById("stopResumeButton");
      if (stopState) {
        vidometer.stop()
          .then(() => {
            stopState = false;
            button.innerText = 'Resume';
            setInfoText('Stopped');
          })
      } else {
        vidometer.resume();
        stopState = true;
        button.innerText = 'Stop';
        setInfoText('Ready');
      }
    }

    function init() {
      width = window.innerWidth;
      height = window.innerHeight;
      initVidometer();
      initScene();
    }

    function initVidometer() {
      const canvas = document.getElementById('canvas-video');
      vidometer = document.getElementById('vidometer');
      vidometer.onReady = onVidometerReady;
      vidometer.onKeyframeSearching = onVidometerKeyframeSearching;
      vidometer.onCalibration = onVidometerCalibration;
      vidometer.onProcess = onVidometerProcess;
      vidometer.initialize(width, height, canvas);
    }

    function initScene() {
      const canvas = document.getElementById('canvas-gl');
      canvas.width = width;
      canvas.height = height;
      scene = new Scene3D(width, height, canvas);

      const cube = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.01, 0.5), new THREE.MeshNormalMaterial());
      cube.position.setY(0.005)
      cube.frustumCulled = false;
      scene.add(cube);
    }
  </script>
</head>

<body onload="init();" onclick="onClick(event, this);">
  <div style="position: fixed; left: 0; top: 0; width: 100vw; height: 100vh;" scrolling="no">
    <vidometry-vidometer id="vidometer"></vidometry-vidometer>
    <canvas id="canvas-video" style="position: absolute;"></canvas>
    <canvas id="canvas-gl" style="position: absolute; left: 0; top: 0; width: 100vw; height: 100vh;" width="100vw"
      height="100vh"></canvas>

    <div id="info" style="position: absolute; left: 2vw; right: 2vw; top: 2vh; height: 20vw;  font-size: 2hv;">
    </div>

    <div id="stopResumeButton" onclick="onStopResumeClick()"
      style="position: absolute; right: 2vw; top: 5vh;  padding-left: 4vw; padding-right: 4vw; font-size: 2hv; padding-top: 1vh; padding-bottom: 1vh; background: #FFF; border: solid 1px #000;">
      Stop
    </div>
  </div>
</body>

</html>
```

## API

### Methods:

**initialize(sceneWidth, sceneHeight, videoCanvas)** - initialize **vidometer**;

1. ***sceneWidth*** - the width of the scene in pixels;
2. ***sceneHeight*** - the height of the scene in pixels;
3. ***videoCanvas*** - a reference to the canvas tag where the video frame should be rendered;

**start(u, v):Promise** - try to locate the object on the surface;

1. **u** - x screen’s coordinate;
2.  **v** - y screen’s coordinate;

origin - top left corner of the screen:

returns Promise with object: **{code, text}**

1. **code** - integer, response code (see Vidometer Code Response);
    1. 1 - NOT_ENOUGH_FEATURES - means that the surface where you can place an object doesn’t have enough features;
    2. 11 - WRONG_ORIENTATION_X - in this case, the orientation of the X axis of the phone (or the pitch, see Phone Orientation) - the angle between the phone and the floor should be not more than 60 degrees (relative to the floor);
    3. 100 - COMPLETE - keyframe is found;
2. **text** - string, text description of the code;

**stop()** - stops **vidometer** processing;

**resume()** - resumes **vidometer** processing;

### Callbacks

**onReady()** - throws when the Vidometer is initialized and ready to work;

**onKeyframeSearching(code, text)** - throws when the Vidometer tries to search the initial keyframe;

1. **code** - integer, response code (see Vidometer Code Response);
    1. 1 - NOT_ENOUGH_FEATURES - means that the surface doesn’t have enough features to be used as a keyframe;
    2. 11 - WRONG_ORIENTATION_X - in this case, the orientation of the X axis of the phone (or the pitch, see Phone Orientation) - the angle between the phone and the floor should be 35 degrees;
    3. 100 - COMPLETE - calibrated;
2. **text** - string, text description of the code;

**onCalibration(code, text)** - throws when Vidometer tries to calibrate;

1. **code** - integer, response code (see Vidometer Code Response);
    1. 1 - NOT_ENOUGH_FEATURES - means that the surface doesn’t have enough features to be used as a keyframe;
    2. 11 - WRONG_ORIENTATION_X - in this case, the orientation of the X axis of the phone (or the pitch, see Phone Orientation) - the angle between the phone and the floor should be 0 degrees (parallel to the floor);
    3. 13 - WRONG_ORIENTATION_Z - in this case, the orientation of the Z axis of the phone (or the roll, see Phone Orientation) should be close to 0 degrees;
    4. 100 - COMPLETE - keyframe is found;
2. **text** - string, text description of the code;

**onProcess(rototranslation, objecRototranslation, fov)** - used to update the 3d position of the perspective camera and the object on the scene. Throws every frame;

1. **rototranslation** - the source of the roto-translation matrix (4x4);
2. **objecRototranslation -** source of roto-translation matrix (4x4);
3. **fov** - field of view of the perspective camera;

**Vidometer Response Code:**

0 - UNDEFINED;

1 - NOT_ENOUGH_FEATURES - means that the surface doesn’t have enough features to be used as a keyframe;

11 - WRONG_ORIENTATION_X - in this case, the orientation of the X axis of the phone (or the pitch, see Phone Orientation) - the angle between the phone and the floor should be 0 degrees (parallel to the floor);

13 - WRONG_ORIENTATION_Z - in this case, the orientation of the Z axis of the phone (or the roll, see Phone Orientation) should be close to 0 degrees;

100 - COMPLETE - keyframe is found;

## Phone Orientation

![phone orientation](https://bettar.life/vidometry/assets/phone_orientation.png)