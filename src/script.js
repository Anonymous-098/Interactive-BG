import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import './style.css';
import {Text,preloadFont} from 'troika-three-text';
import gsap from 'gsap';
import { MathUtils } from 'three';

const distance = (x1,y1,x2,y2) =>{
    return Math.sqrt( Math.pow((x1-x2),2) + Math.pow((y1-y2),2));
}

const map = (a,b,c,d,t) =>{
    return ( (t-a)/(b-a) ) * (d-c) + c;
}

const textureLoader = new THREE.TextureLoader();
const pic1 = textureLoader.load('/2.jpg');

preloadFont(
    {
        font: '/fonts/Bristone.otf', 
        characters: 'abcdefghijklmnopqrstuvwxyz'
    }
)

const scene = new THREE.Scene();
// scene.background =  environmentMapTexture;

const sizes = {
    width:window.innerWidth,
    height:window.innerHeight
}
window.addEventListener("resize",(e)=>{
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width/sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth,window.innerHeight);
})

const mouse = new THREE.Vector2();
window.addEventListener("mousemove",(e)=>{
    mouse.x = (e.clientX/sizes.width)*2-1;
    mouse.y = 1-(e.clientY/sizes.height)*2;
})

//CAMERA
const camera = new THREE.PerspectiveCamera(40,window.innerWidth/window.innerHeight,0.1,1000);
camera.position.set(0,0,19);
scene.add(camera); 
camera.layers.enable(1);
camera.layers.set(2);

//CANVAS
const canvas = document.querySelector(".webgl");

//CONTROLS
// const controls = new OrbitControls(camera,canvas);
// controls.enableDamping = true;

//RENDERER
const renderer = new THREE.WebGL1Renderer({
    canvas:canvas
});
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

//LIGHTS
const ambientLight = new THREE.AmbientLight(0xffffff,0.3);
scene.add(ambientLight);
ambientLight.layers.set(2);

const directionalLight = new THREE.DirectionalLight(0xffffff,0.1);
directionalLight.position.set(0,0,20);
// scene.add(directionalLight);
directionalLight.layers.set(2);

const pointLight = new THREE.PointLight(0xffffff,1.0);
// scene.add(pointLight);
// pointLight.layers.set(2);

//MAIN TEXT
const myText = new Text();
scene.add(myText);
myText.position.set(-6,1.5,1.0);
myText.text = 'Rishabh'
myText.font = '/fonts/Bristone.otf'
myText.fontSize = 2
myText.layers.set(2);

myText.sync(()=>{
    //PLANE TO DETERMINE POINT
    const plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(31.5,14),
        new THREE.MeshBasicMaterial({color:0x000000})
    )
    plane.position.y = 0.2
    plane.position.z = -2;
    // scene.add(plane);

    //RANDOM COLORS (Not needed)
    const colors = [
        '#F6D8D8','#ACDDDE','#CAF1DE','#FEF8DD','#C0C6ED','#F4D291','#98FB98'
    ]
    const getRandomColor = () =>{
        return colors[Math.floor(Math.random() * Math.floor(colors.length))];
    }

    //CUBECAMERA
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(1024,{
        format:THREE.RGBAFormat,
        generateMipmaps:true,
        minFilter:THREE.LinearMipMapLinearFilter
    });
    const cubeCamera = new THREE.CubeCamera(0.1,1000,cubeRenderTarget);
    scene.add(cubeCamera);

    //CUBE (cubecamera is inside this cube)
    var picPlane = new THREE.Mesh(
        new THREE.BoxBufferGeometry(50,50,50),
        new THREE.MeshBasicMaterial({map:pic1,side:THREE.DoubleSide})
    )
    scene.add(picPlane);

    //MIRROR MATERIAL
    const material = new THREE.MeshStandardMaterial({
        envMap:cubeRenderTarget.texture,
        reflectivity:1.0,
        metalness:0.7,
        roughness:0.3,
    });

    //MIRRORS
    var a=0;
    var b=0;
    const group = new THREE.Group();
    scene.add(group);
    group.position.set(-13.25,-5.25,0);

    var rows = 5;
    var cols = 11;
    const meshes = new Array(rows);

    for(var i=0;i<rows;i++)
    {
        meshes[i] = new Array(cols);
        for(var j=0;j<cols;j++)
        {
            const colorVal = getRandomColor();
            const mesh = new THREE.Mesh(
                new THREE.PlaneBufferGeometry(2.55,2.55),
                material
            );
            mesh.position.set(a,b,0);
            a=a+2.65;
            group.add(mesh);
            mesh.layers.set(2);
            mesh.initialPosition = {
                x:a+group.position.x,
                y:b+group.position.y,
                z:0
            }
            mesh.initialRotation = {
                x: 0,
                y: 0,
                z: 0,
            };
            meshes[i][j]= mesh;
        }
        b=b+2.65;
        a=0;
    }

    const raycaster = new THREE.Raycaster();

    const clock = new THREE.Clock();

    //ANIMATE FUNCTION
    var tick = function(){

        raycaster.setFromCamera(mouse,camera);

        const point = raycaster.intersectObject(plane);
        if(point.length)
        {
            for(var i=0;i<rows;i++)
            {
                for(var j=0;j<cols;j++)
                {
                    const mesh = meshes[i][j];
                    const mouseMeshDist = distance(mesh.initialPosition.x,mesh.initialPosition.y,point[0].point.x,point[0].point.y);

                    const z = map(2,4,2.5,0,mouseMeshDist);
                    
                    if(j>5)
                    {
                        gsap.to(mesh.rotation,{
                            x: z<1?0:z*0.05
                        })
                        
                        gsap.to(mesh.rotation,{
                            y: z<1?0:z*0.05
                        })
                    }
                    else if(j<5)
                    {
                        gsap.to(mesh.rotation,{
                            x: z<1?0:z*0.05
                        })
                        
                        gsap.to(mesh.rotation,{
                            y: z<1?0:-z*0.05
                        })
                    }
                    else if(j===5)
                    {
                        gsap.to(mesh.rotation,{
                            x: z<1?0:z*0.05
                        })
                    }
                }
            }
        }

        cubeCamera.update(renderer,scene);
        renderer.render(scene,camera);
        window.requestAnimationFrame(tick);
        cubeCamera.rotation.x += 0.005;
    }

    tick();
})