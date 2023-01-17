var scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
scene.fog = new THREE.Fog(0xffffff, 0, 750);

var light = new THREE.HemisphereLight(0xeeeeee, 0x888888, 0.8);
light.position.set(1, 1, 1);
scene.add(light);

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.y = 10;

var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
window.addEventListener('resize', onWindowResize);

var boxes = [];
var spheres = [];
var raycaster;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;

// var prevTime = performance.now();
var velocity = new THREE.Vector3();
var direction = new THREE.Vector3();
var vertex = new THREE.Vector3();
var color = new THREE.Color();

var controls = new THREE.PointerLockControls(camera, document.body);
var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');

if (instructions) {
    instructions.addEventListener('click', function () {

        controls.lock();

    });
}

controls.addEventListener('lock', function () {
    instructions.style.display = 'none';
    blocker.style.display = 'none';
});

controls.addEventListener('unlock', function () {
    blocker.style.display = 'block';
    instructions.style.display = '';
});

scene.add(controls.getObject());

var onKeyDown = function (event) {

    switch (event.code) {

        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;

        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;

        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;

        case 'Space':
            if (canJump == true) velocity.y += 350;
            canJump = false;
            break;

    }

};

var onKeyUp = function (event) {

    switch (event.code) {

        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;

        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;

        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;

    }

};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000).applyMatrix4(new THREE.Matrix4().makeRotationX(Math.PI / 2)), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide }));
scene.add(ground);

// objects

var boxGeometry = new THREE.BoxGeometry(20, 20, 20);

position = boxGeometry.attributes.position;
var colorsBox = new THREE.Color(0x000000);

var boxMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });
var sphereGeometry = new THREE.SphereGeometry(5, 5, 5);
var sphereMaterial = new THREE.MeshBasicMaterial({ color: 'rgb(88, 199, 115)' });

for (let i = 0; i < 1000; i++) {
    var boxAtas = new THREE.Mesh(boxGeometry, boxMaterial);
    boxAtas.position.x = Math.floor(Math.random() * 50 - 10) * 50;
    boxAtas.position.y = Math.floor(Math.random() * 20) * 20 + 5;
    boxAtas.position.z = Math.floor(Math.random() * 50 - 10) * 50;

    var xBawah = Math.floor(Math.random() * 50) * 100;
    var zBawah = Math.floor(Math.random() * 50 - 10) * 75;

    var boxBawah = new THREE.Mesh(boxGeometry, boxMaterial);
    boxBawah.position.x = xBawah;
    boxBawah.position.y = 10;
    boxBawah.position.z = zBawah;

    scene.add(boxAtas);
    boxes.push(boxAtas);
    scene.add(boxBawah);
    boxes.push(boxBawah);

    var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.x = Math.floor(Math.random() * 50 - 10) * 50;
    sphere.position.y = 10;
    sphere.position.z = Math.floor(Math.random() * 50 - 10) * 50;
    spheres.push(sphere);

    var sphereAtas = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereAtas.position.x = xBawah;
    sphereAtas.position.y = 25;
    sphereAtas.position.z = zBawah;
    spheres.push(sphereAtas);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}


function draw() {
    requestAnimationFrame(draw);

    var time = performance.now();

    for (let i = 0; i < spheres.length; i++) {
        scene.add(spheres[i]);
    }

    if (controls.isLocked == true) {

        raycaster.ray.origin.copy(controls.getObject().position);
        raycaster.ray.origin.y -= 10;

        var intersections = raycaster.intersectObjects(boxes, false);
        var onObject = intersections.length > 0;

        raycaster.ray.origin.copy(controls.getObject().position);
        raycaster.ray.origin.y += 10;

        var intersections2 = raycaster.intersectObjects(spheres, true);
        var onObject2 = intersections2.length > 0;
        if (onObject2 == true) {
            if (intersections2[1] != undefined) {
                for (let i = 0; i < spheres.length; i++) {
                    if (intersections2[1].object == spheres[i]) {
                        console.log(i);
                        scene.remove(spheres[i]);
                        spheres.splice(i, 1);
                    }
                }
                // console.log("HAI!!");
            }
        }

        var delta = (time - prevTime) / 800;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        if (onObject == true) {
            velocity.y = Math.max(0, velocity.y);
            canJump = true;
        }

        controls.moveRight(- velocity.x * delta);
        controls.moveForward(- velocity.z * delta);

        controls.getObject().position.y += (velocity.y * delta);

        if (controls.getObject().position.y < 10) {

            velocity.y = 0;
            controls.getObject().position.y = 10;

            canJump = true;

        }

    }

    prevTime = time;

    renderer.render(scene, camera);

    // if (moveForward == true) {
    //     console.log(velocity);
    // }
}

draw();


// app.get('/index', function(req, res) {

//     var name = 'hello';
  
//     res.render(__dirname + "/index.html", {name:name});
  
//   });


// Text Geometry
// var textGeo = new THREE.TextGeometry("Score: 0", {
//     // font: new THREE.Font(fontJSON),
//     size: 10,
//     height: 0.1,
//     curveSegments: 12,
//     bevelEnabled: true,
//     bevelThickness: 0.1,
//     bevelSize: 0.1
//   });
//   var textMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
//   scoreText = new THREE.Mesh(textGeo, textMaterial);
//   scoreText.position.set(5, 10, 0);
//   scene.add(scoreText);