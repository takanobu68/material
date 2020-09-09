"use strict"; // strictモードが使えるかの検証→可能

{
	window.addEventListener('load', init);

	function init() {

		// sceneに何かを表示させるには以下の3つが必要
		// sneneを作成後
		// 1.カメラ + レンダラ
		// 2.オブジェクト
		// 3.ライト

		// sceneの作成
		// オブジェクトを保持するコンテナのようなもの
		const scene = new THREE.Scene();

		// fogの追加
		// カメラからの開始距離と、終点距離として考える
		// new THREE.Fog(色, 開始距離, 終点距離);
		// scene.fog = new THREE.Fog(0xffffff, 0.001, 1000);

		// FogExp2は色と霧の深さだけを指定
		// FogExp2(color,density)
		// scene.fog = new THREE.FogExp2(0xffffff, 0.03);

		// overrideMaterialプロパティを設定すると、
		// シーン内の全てのオブジェクトに対して
		// 同じマテリアルの使用を強制できる
		scene.overrideMaterial = new THREE.MeshLambertMaterial({
			color: 0xffffff
		});

		// cameraの作成
		const camera = new THREE.PerspectiveCamera(
			45,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);

		// cameraの位置を指定

		// camera.position.x = -30;
		// camera.position.y = 40;
		// camera.position.z = 30;
		camera.position.set(-30, 40, 30); // こう書き換えられる
		camera.lookAt(scene.position);

		scene.add(camera);


		// rendererの作成
		// rendererとは
		// cameraオブジェクトの角度に基づいてブラウザ内で
		// sceneがどのように見えるか計算するオブジェクト
		const renderer = new THREE.WebGLRenderer();

		// sceneの大きさを設定
		renderer.setSize(window.innerWidth, window.innerHeight);
		// sceneの背景色を設定
		// 色の指定方法は他にもある
		renderer.setClearColor(new THREE.Color(0xeeeeee));
		// 影の指定
		// 影は描画にコストがかかるので、指定しないと出せない
		// renderer以外にも影を使う設定をしなければならない。
		renderer.shadowMap.enabled = true;


		// オブジェクトの作成
		// planeオブジェクトの作成
		// 二次元の長方形オブジェクト。地面と見立てて使用
		// PlaneGeometryの引数
		// THREE.planeGeometry(
		// width,height,
		// widthSegments,heightSegments
		// )
		const planeGeometry = new THREE.PlaneGeometry(60, 40, 1, 1);
		const planeMaterial = new THREE.MeshLambertMaterial({
			color: 0xffffff,
			// wireframe: true
		});
		const plane = new THREE.Mesh(planeGeometry, planeMaterial);
		// 影の設定 (影を落とされる物体として指定);
		plane.receiveShadow = true;

		// 位置の指定
		plane.rotation.x = -0.5 * Math.PI;
		// plane.position.x = 0;
		// plane.position.y = 0;
		// plane.position.z = 0;
		plane.position.set(0, 0, 0);

		// sceneに追加することを忘れない
		scene.add(plane);

		// ライトの作成
		// 全体を照らすライトとスポットライトを作成

		// AmbientLight 全体を照らすライト
		// 全体を照らすライトの為、ポジションの設定は不要
		const ambientLight = new THREE.AmbientLight(0x0c0c0c);
		scene.add(ambientLight);

		// SpotLight
		// 指定した個所から光を送るライト
		// 位置を指定する必要がある
		// 影を送りたい場合は設定が必要
		// 影を送る→cast
		const spotLight = new THREE.SpotLight(0xffffff);
		spotLight.position.set(-20, 30, -5);
		spotLight.castShadow = true;
		scene.add(spotLight);

		document.getElementById("WebGL-output").appendChild(renderer.domElement);

		// console.log(scene.children)

		const controls = new function () {
			this.rotationSpeed = 0.02;
			this.numberOfObjects = scene.children.length;

			// cubeを削除する為の関数
			this.removeCube = function () {
				const allChildren = scene.children; // .childerenプロパティは配列形式
				const lastObj = allChildren[allChildren.length - 1];
				if (lastObj instanceof THREE.Mesh) {
					scene.remove(lastObj);
					this.numberOfObjects = scene.children.length;
				}
			}

			// cubeを追加する関数
			this.addCube = function () {
				// ランダム数値を生成
				const cubeSize = Math.ceil((Math.random() * 3));
				// 直方体の幅、高さ、奥行にランダム値をセット
				// cubeGeometryの引数
				// THREE.CubeGeometry(
				// width,height,depth,
				// widthSegments,heightSegments,depthSegments
				// )
				const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
				// colorの指定もランダムにする
				const cubeMaterial = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
				const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
				// cubeから影を送る設定をする
				cube.castshadow = true;
				// 出来たcubeに名前を順番に設定していく
				cube.name = "cube-" + scene.children.length;

				// cubeオブジェクトの配置をランダムに行う
				cube.position.x = -30 + Math.round(
					(Math.random() * planeGeometry.parameters.width)
				);
				cube.position.y = Math.round(
					(Math.random() * 5)
				);
				cube.position.z = -20 + Math.round(
					(Math.random() * planeGeometry.parameters.height)
				);

				// 作ったcubeをsceneに追加
				scene.add(cube);
				// numberOfObjects変数はGUIでシーン内のオブジェクトの数を
				// 表示するために使われている
				this.numberOfObjects = scene.children.length;
			}

			this.outputObjects = function () {
				console.log(scene.children);
			}

		}

		const gui = new dat.GUI();
		gui.add(controls, 'rotationSpeed', 0, 0.5);
		gui.add(controls, 'addCube');
		gui.add(controls, 'removeCube');
		gui.add(controls, 'outputObjects');
		gui.add(controls, 'numberOfObjects').listen();

		render();

		function render() {
			scene.traverse(function (obj) {
				if (obj instanceof THREE.Mesh && obj != plane) {
					obj.rotation.x += controls.rotationSpeed;
					obj.rotation.y += controls.rotationSpeed;
					obj.rotation.z += controls.rotationSpeed;
				}
			});

			requestAnimationFrame(render);
			renderer.render(scene, camera);
		}


	}



}
