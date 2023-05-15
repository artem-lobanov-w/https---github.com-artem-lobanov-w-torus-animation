
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls( camera, renderer.domElement );
controls.enableZoom = false;

controls.enableDamping = true; 
controls.dampingFactor = 0.05; 






const loader = new GLTFLoader();
const url = 'particlesThree.glb';

loader.load(url, function (gltf) {
  const model = gltf.scene;

  model.traverse((child) => {
    if (child.isMesh) {
      const geometry = child.geometry;
      const material = new THREE.PointsMaterial({
        size: 0.01,
        vertexColors: true // включаем использование цветов вершин
      });
      const points = new THREE.Points(geometry, material);
      
      // получаем массив вершин из объекта geometry
      const positions = geometry.getAttribute('position').array;

      // создаем массив цветов для вершин
      const colors = [];
      for (let i = 0; i < positions.length; i += 3) {
        let sin = Math.sin(Math.random());
        colors.push(0.8 * sin, 0.8 * sin, 0.5 * sin + sin); // создаем случайный цвет (почти) для каждой вершины
      }

      const randomPosition = [];
      for (let i = 0; i < positions.length; i += 3) {
        randomPosition.push(6.0*Math.random()-3.0, 6.0*Math.random()-3.0, 6.0*Math.random()-3.0);
      }
      const randomPositionCopy = [...randomPosition];

      let increment = 0.0005;


      // Анимация по таймеру
      // setInterval( () => {
      //   for(let i = 0; i<randomPosition.length; i++) {
      //     if (randomPosition[i] < positions[i]) {
      //       randomPosition[i] = randomPosition[i] + increment;
      //     } else if(randomPosition[i] > positions[i]) {
      //       randomPosition[i] = randomPosition[i] - increment;
      //     }
      //   }
      //   geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(randomPosition), 3));
      // }, 1);



      // Анимация при прокрутке колесика
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(randomPosition), 3));
      function updateArray(increment) {
        for(let j = 0; j < 75; j++) {
          for(let i = 0; i<randomPosition.length; i++) {
            if (randomPosition[i] < positions[i]) {
              randomPosition[i] = randomPosition[i] + increment;
            } else if(randomPosition[i] > positions[i]) {
              randomPosition[i] = randomPosition[i] - increment;
            } else if((randomPosition[i] - positions[i]) < 0.002) {
              randomPosition[i] = positions[i];
            }
          }
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(randomPosition), 3));
      }
      function reverseUpdateArray(increment) {
        for(let j = 0; j < 75; j++) {
          for(let i = 0; i<randomPosition.length; i++) {
            if (randomPosition[i] < randomPositionCopy[i]) {
              randomPosition[i] = randomPosition[i] + increment;
            } else if(randomPosition[i] > randomPositionCopy[i]) {
              randomPosition[i] = randomPosition[i] - increment;
            } else if((randomPosition[i] - randomPositionCopy[i]) < 0.002) {
              randomPosition[i] = randomPositionCopy[i];
            }
          }
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(randomPosition), 3));
      }

      let time = 0;
      let sinPosition;
      let sinPosition2;
      let cosPosition;
      let randSignArray = [];
      let sign;
      let ratio = 1.0;

      for(let i = 0; i<randomPosition.length; i++) {
        sign = Math.random() < 0.5 ? -1.0 : 1.0;
        randSignArray[i] = sign;
      }

      animateVerticles();
      function animateVerticles() {
        requestAnimationFrame(animateVerticles);
        time += 0.1;
        sinPosition = Math.sin(time)*0.1;
        cosPosition = Math.cos(time*0.5)*0.1;
        sinPosition2 = Math.sin(time/Math.PI)*0.1;
        for(let i = 0; i<randomPosition.length; i++) {
          randomPosition[i] += (sinPosition * cosPosition * sinPosition2) * randSignArray[i] * ratio;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(randomPosition), 3));
      }

      window.addEventListener('wheel', function(event) {
        if (event.deltaY > 0) {
          updateArray(increment);
          if(ratio > 0.0) {
            ratio -= 0.01;
          }
        } else {
          reverseUpdateArray(increment);
          ratio += 0.01;
        }
        console.log(ratio);

      });

      
      // задаем массив цветов в объекте geometry
      geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
      child.parent.add(points);
      child.parent.remove(child);
    }

    
  });
  

  model.scale.set(1.0, 1.0, 1.0);
  scene.add(model);

  
  camera.position.z = 3;
  model.rotateX(Math.PI/2.0);
  
  let angleRotate = 0.0001;
  animate();  
  function animate() {
    requestAnimationFrame(animate);
    // model.rotateY(angleRotate);
    controls.update();
    renderer.render(scene, camera);
  }
});