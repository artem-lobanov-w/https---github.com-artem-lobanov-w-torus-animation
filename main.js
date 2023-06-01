import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const shaderCode = document.getElementById('fragShader').innerHTML;
const shaderCode2 = document.getElementById('fragShader2').innerHTML;
THREE.ImageUtils.crossOrigin = '';
const texture = new THREE.TextureLoader().load('gradient-2.png');
const texture2 = new THREE.TextureLoader().load('Rectangle 56.png');

const loader = new GLTFLoader();
const url = 'GRAF_3_23.glb';

loader.load(url, function (gltf) {
  const model = gltf.scene;

  model.traverse((child) => {
    if (child.isMesh) {
      const geometry = child.geometry;

      const positions = geometry.getAttribute('position').array;
      const randomPosition = [];
      for (let i = 0; i < positions.length; i += 3) {
        randomPosition.push(10.0 * Math.random() - 5.0, 10.0 * Math.random() - 5.0, 10.0 * Math.random() - 5.0);
      }

      // --------------------------------------------------------------------------
      const pointsArr = [];
      const pointSize = [];
      let uniforms2 = {
        mouseCoord: { type: 'v3', value: new THREE.Vector3() },
        mouseCoord: { type: 'v3', value: new THREE.Vector3() },
        tex: { type: 't', value: texture2 },
        opacity: { type: 'f', value: 0.5 },
        res: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      };
      uniforms2.mouseCoord.value.z = 50;
      // Цикл создает точки
      for (let i = 0; i < positions.length; i += 3) {
        const max = 0.03;
        const min = 0.055;
        pointSize[i] = Math.random() * (max - min) + min;
        pointSize[i + 1] = Math.random() * (max - min) + min;
        pointSize[i + 2] = Math.random() * (max - min) + min;
        const pointGeometry = new THREE.CircleGeometry(pointSize[i], 50);
        const pointMaterial = new THREE.ShaderMaterial({
          uniforms: uniforms2,
          fragmentShader: shaderCode,
          side: THREE.DoubleSide,
          transparent: true
        });
        const point = new THREE.Mesh(pointGeometry, pointMaterial);

        const posX = randomPosition[i];
        const posY = randomPosition[i + 1];
        const posZ = randomPosition[i + 2];
        point.position.set(posX, posY, posZ);
        pointsArr.push(point);
        pointSize.push(pointSize[i]);
      }

      const groupPoints = new THREE.Group();
      // Добавляет точки в группу
      pointsArr.forEach(point => {
        scene.add(point);
        point.lookAt(camera.position);
        groupPoints.add(point);
      });
      scene.add(groupPoints);
      groupPoints.rotation.x = Math.PI / 2;

      let t = 0;
      let time = 0;
      // Вычисляет размер точки от времени
      function getPointSizeAtTime(t, oldSize) {
        return Math.sin((t - oldSize) / oldSize / 80.0) / 80.0 + 0.05;
      }
      
      function animationPointSize() {
        requestAnimationFrame(animationPointSize);
        t += 0.1;
        time += 0.003;
        uniforms2.mouseCoord.value.x = Math.sin(time);
        uniforms2.mouseCoord.value.y = Math.cos(time);
        // Цикл изменяет размер точек
        for (let i = 0; i < pointsArr.length; i++) {
          const oldSize = pointSize[i]
          const scale = getPointSizeAtTime(t, oldSize) * 10;
          pointsArr[i].scale.set(scale, scale, scale);
        }
      }
      animationPointSize();
      // Поворачивает точки при повороте камеры
      controls.addEventListener("change", () => {
        pointsArr.forEach(point => {
          point.lookAt(camera.position);
        });
      });
      
      const randomPositionCopy = [...randomPosition];
      let increment = 0.002;

      // Функция собирает лого
      function updateArray() {
        for (let j = 0; j < 55; j++) {
          for (let i = 0; i < randomPosition.length; i++) {
            if (randomPosition[i] < positions[i]) {
              randomPosition[i] = randomPosition[i] + increment;
            } else if (randomPosition[i] > positions[i]) {
              randomPosition[i] = randomPosition[i] - increment;
            } else if ((randomPosition[i] - positions[i]) < 0.002) {
              randomPosition[i] = positions[i];
            }
          }
        }
        let k = 0;
        for (let i = 0; i < pointsArr.length; i++) {
          const posX = randomPosition[k];
          const posY = randomPosition[k + 1];
          const posZ = randomPosition[k + 2];
          pointsArr[i].position.set(posX, posY, posZ);
          pointsArr[i].lookAt(camera.position);
          k += 3;
        }
      }
      // Функция разбирает лого 
      function reverseUpdateArray() {
        for (let j = 0; j < 55; j++) {
          for (let i = 0; i < randomPosition.length; i++) {
            if (randomPosition[i] < randomPositionCopy[i]) {
              randomPosition[i] = randomPosition[i] + increment;
            } else if (randomPosition[i] > randomPositionCopy[i]) {
              randomPosition[i] = randomPosition[i] - increment;
            } else if ((randomPosition[i] - randomPositionCopy[i]) < 0.002) {
              randomPosition[i] = randomPositionCopy[i];
            }
          }
        }
        let j = 0;
        for (let i = 0; i < pointsArr.length; i++) {
          const posX = randomPosition[j];
          const posY = randomPosition[j + 1];
          const posZ = randomPosition[j + 2];
          pointsArr[i].position.set(posX, posY, posZ);
          pointsArr[i].lookAt(camera.position);
          j += 3;
        }
      }
      // Функция анимации лого в зависимости от направления прокрутки колесика
      window.addEventListener('wheel', function (event) {
        if (event.deltaY > 0) {
          updateArray();
        } else {
          reverseUpdateArray();
        }
      });

    }
  });
  camera.position.z = 3;

  let uniforms = {
    mouseCoord: { type: 'v3', value: new THREE.Vector3() },
    tex: { type: 't', value: texture },
    res: { type: 'v2', value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  };

  //Добавление плоскость с градиент на фон
  const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
  const planeMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    fragmentShader: shaderCode2,
    side: THREE.DoubleSide
  });
  const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(planeMesh);
  planeMesh.position.set(0, 0, -85);

  const groupBG = new THREE.Group();
  groupBG.add(planeMesh);
  scene.add(groupBG);
  groupBG.position.set(camera.position.x, camera.position.y, camera.position.z);

  function animate() {
    requestAnimationFrame(animate);
    groupBG.rotation.x = camera.rotation.x;
    groupBG.rotation.y = camera.rotation.y;
    groupBG.rotation.z = camera.rotation.z;
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
});

