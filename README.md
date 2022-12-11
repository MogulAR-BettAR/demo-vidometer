# vidometer v1.0.16

**vidometer** is a World Tracking feature of **bettar-vidometry** library.

This library is created to simplify using the AR world tracking experience on the web.
In a few lines of the code, you can integrate the World Tracking experience into your web application to provide an exciting AR experience for the users.

## vidometer-demo

This example project shows how to integrate a **vidometer** into your web application.

You can check [live example](https://bettar.life/vidometer/).

### Installation

Execute the following command in order to install dependencies:

```tsx
npm i
```

or

```tsx
yarn install
```

### Development

Execute the following command in order to run the application in development mode:

*start-html* - runs example with static **vidometry-vidometer** tag;

*start-prog* - runs example with **vidometer** programmatically added;

```tsx
npm run start-html
// OR
npm run start-prog
```

OR

```tsx
yarn start-html
// OR
yarn start-prog
```

Run the following URL on your mobile device:

```tsx
https://localhost:8080
```

# vidometer integration

In order to add a **vidometer** to your site you need the following actions:

1. Add the following JS script in the **head** section:

```tsx
<head>
	...
	<script src="https://bettar.life/vidometry/vidometer.1.0.16.js"></script>
	...
</head>
```

1. Add **vidometer** to web page:
    
    a. add **viomdetry-vidometer** tag:
    

```tsx
<vidometry-vidometer id="vidometer"></vidometry-vidometer>
```

or with attributes:

```jsx
<vidometry-vidometer id="vidometer" initial-height="1.3" object-tracking></vidometry-vidometer>
```

b. add vidometry-vidometer programmatically:

```tsx
vidometer = this.document.createElement('vidometry-vidometer');
document.body.appendChild(vidometer);
```

or with attributes:

```jsx

vidometer = this.document.createElement('vidometry-vidometer');
vidometer.setAttribute('initial-height', '1.3');
vidometer.setAttribute('object-tracking', true);
document.body.appendChild(vidometer);
```

1. Add **vidometer** callbacks:
    1. **onReady()** - throws when vidometer is initialized and ready to work;
    2. **onMotion(rototranslation)** - uses to update 3d position of the object/objects on the scene. Throws every frame before starting;
        1. **rototranslation** - source of rototranslation matrix (4x4);
    3. **onProcess(rototranslation, focal)** - uses to update 3d position of the perspective camera of the scene. Throws every frame;
        1. **rototranslation** - source of rototranslation matrix (4x4);
        2. **focal** - focal length of the perspective camera;

```jsx
vidometer.onReady = onVidometerReady;
vidometer.onMotion = onVidometerMotion;
vidometer.onProcess = onVidometerProcess;
```

1. Initialize **vidometer**:
    1. **sceneWidth** - width of the scene in pixels;
    2. **sceneHeight** - height of the scene in pixels;
    3. **fov** - initial filed of view of the perspective camera (recommended value is 70);
    4. **videoCanvas** - reference to the canvas tag where video frame should be rendered;

```jsx
vidometer.initialize(sceneWidth, sceneHeight, fov, videoCanvas);
```

1. Start **vidometer** processing:
    1. x - horizontal position on the scene(starting from the left side);
    2. y - vertical position on the scene(starting from the top side);
    3. roto - 3d position of the object/objects on the scene (source of ****rototranslation matrix);
    
    If you use the preview mode of the model on the scene (show object position and orientation on the scene before starting), we recommend using starting position in the center of the screen:  **start(sceneWidth/2**, **sceneHeight/2)**.
    

```tsx
vidomter.start(x, y)
	.then(roto => {
		// object is located on the scene
	});
```

You can also stop the processing of the vidometer

```jsx
vidometer.stop();
```

It stops all computations and reduces the load on the processor (you can use it if you want to pause your experience).

In order to resume vidometer processing, you need to call the resume method:

```jsx
vidometer.resume();
```

After resuming the processing you need to call the **start** method to position the object on the scene.

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
  <script src="https://bettar.life/vidometry/vidometer.1.0.8.js"></script>
  <script>
    class Scene3D {
      constructor(width, height, fov, canvas) {
        this.fov = fov;
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
        this.camera = new THREE.PerspectiveCamera(35/*fov*/, aspect, 0.01, 10000);
        this.camera.filmGauge = Math.max(width, height);
        this.camera.updateProjectionMatrix();
        this.scene.add(this.camera);

        // 4. container
        this.container = new THREE.Object3D();
        this.container.frustumCulled = false;
        this.container.matrixAutoUpdate = false;
        this.scene.add(this.container);
      }

      updateFocal(focal) {
        if (this.focal !== focal) {
          this.focal = focal;
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

    var scene, vidometer, width, height, fov;
    var isReady = false;

    const onVidometerReady = () => {
      isReady = true;
    }

    const onVidometerMotion = (roto) => {
      scene.updateObjectMatrix(roto);
    }

    const onVidometerProcess = (roto, focal) => {
      scene.updateFocal(focal);
      scene.render(roto);
    }

    function onClick() {
      if (isReady) {
        vidometer.start(width / 2 + 1, height / 2 + 1)
					.then(roto => {
            // scene.updateObjectMatrix(roto);
            console.log('object is located on the scene');
          });
      }
    }

    function init() {
      width = window.innerWidth;
      height = window.innerHeight;
      fov = 65;

      initVidometer();
      initScene();
    }

    function initVidometer() {
      const canvas = document.getElementById('canvas-video');
      vidometer = document.getElementById('vidometer');
      vidometer.onReady = onVidometerReady;
      vidometer.onMotion = onVidometerMotion;
      vidometer.onProcess = onVidometerProcess;
      vidometer.initialize(width, height, fov, canvas);
    }

    function initScene() {
      const canvas = document.getElementById('canvas-gl');
      canvas.width = width;
      canvas.height = height;
      scene = new Scene3D(width, height, fov, canvas);

      const cube = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.01, 0.5), new THREE.MeshNormalMaterial());
      cube.position.setY(0.005)
      cube.frustumCulled = false;
      scene.add(cube);
    }
  </script>
</head>

<body onload="init();" onclick="onClick();">
  <div style="position: fixed; left: 0; top: 0; width: 100vw; height: 100vh;" scrolling="no">
    <vidometry-vidometer id="vidometer"></vidometry-vidometer>
    <canvas id="canvas-video" style="position: absolute;"></canvas>
    <canvas id="canvas-gl" style="position: absolute; left: 0; top: 0; width: 100vw; height: 100vh;" width="100vw"
      height="100vh"></canvas>
  </div>
</body>

</html>
```

src/index.html - example with static **vidometry-vidometer** tag;

src/index2.html - example of **vidometer** programmatically added;

## API

### Attributes:

**initial-height** (*number*) - vertical distance to the tracked plane in meters (optional, by default - *1.3m*);

**object-tracking** (*boolean*) - uses if the object should locate in a limited area: table, etc. (optional by default - *false*).

### Methods:

**initialize(sceneWidth, sceneHeight, fov, videoCanvas)** - initialize **vidometer**;

1. ***sceneWidth*** - width of the scene in pixels;
2. ***sceneHeight*** - height of the scene in pixels;
3. ***fov*** - initial filed of view of the perspective camera (recommended value is 65);
4. ***videoCanvas*** - reference to the canvas tag where video frame should be rendered;

**start(x, y)** - starts **vidometer** processing:

1. ***x*** - horizontal position on the scene(starting from the left side);
2. ***y*** - vertical position on the scene(starting from the top side);
3. returns **Promise<number[]> -** 3d position of the object/objects on the scene (source of ****rototranslation matrix);

**stop()** - stops **vidometer** processing;

**resume()** - resumes **vidometer** processing;

### Callbacks

**onReady()** - throws when vidometer is initialized and ready to work;

**onMotion(rototranslation)** - uses to update 3d position of the object/objects on the scene. Throws every frame before starting;

1. **rototranslation** - source of rototranslation matrix (4x4);

**onProcess(rototranslation, focal)** - uses to update 3d position of the perspective camera of the scene. Throws every frame;

1. **rototranslation** - source of rototranslation matrix (4x4);
2. **focal** - focal length of the perspective camera;

**onStarted()** - throws once, when object is located on the scene;