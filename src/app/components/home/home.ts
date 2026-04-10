import { Component, ElementRef, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import * as THREE from 'three';
import { CityService } from '../../services/city';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `<div #container class="city-container"></div>`,
  styles: [`.city-container { width: 100vw; height: 100vh; overflow: hidden; background: #000; cursor: crosshair; }`]
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef;

  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 4000);
  private renderer = new THREE.WebGLRenderer({ antialias: true });
  private mouseX = 0;
  private mouseY = 0;
  private isOverview = false;
  private spawnedBirds: THREE.Group[] = [];
  private spawnedFlowers: THREE.Group[] = [];
  private spawnedBenches: THREE.Group[] = [];
  private spawnedCats: THREE.Group[] = []; // Track cats for animation
  private parkPositions: { x: number, z: number }[] = [];
  private spawnedCars: { mesh: THREE.Group, speed: number, dir: number, axis: 'x' | 'z' }[] = [];
  
  private birdSub!: Subscription;
  private colorSub!: Subscription;
  private flowerSub!: Subscription;
  private flowerColorSub!: Subscription;
  private benchSub!: Subscription;
  private benchColorSub!: Subscription;

  private currentBirdColor = 0xffffff;
  private currentFlowerColor = 0xff1493;
  private currentBenchColor = 0x8b4513;
  private currentBirdData: any[] = [];
  private currentFlowerData: any[] = [];
  private currentBenchData: any[] = [];

  constructor(private cityService: CityService) { }

  ngOnInit() {
    this.initScene();
    this.generateInfiniteCity();
    this.spawnSafeTraffic();
    this.animate();
    
    this.birdSub = this.cityService.getItems().subscribe(items => {
      this.currentBirdData = items;
      this.syncBirds(items);
    });
    this.colorSub = this.cityService.getBirdColor().subscribe(settings => {
      if (settings?.length > 0) {
        const colorSetting = settings.find(s => s.id === 'birdColor');
        if (colorSetting?.color) {
          this.currentBirdColor = this.getColorHex(colorSetting.color);
          this.syncBirds(this.currentBirdData);
        }
      }
    });

    this.flowerSub = this.cityService.getFlowers().subscribe(items => {
      this.currentFlowerData = items;
      this.syncFlowers(items);
    });
    this.flowerColorSub = this.cityService.getFlowerColor().subscribe(settings => {
      if (settings?.length > 0) {
        const colorSetting = settings.find(s => s.id === 'flowerColor');
        if (colorSetting?.color) {
          this.currentFlowerColor = this.getFlowerColorHex(colorSetting.color);
          this.syncFlowers(this.currentFlowerData);
        }
      }
    });

    this.benchSub = this.cityService.getBenches().subscribe(items => {
      this.currentBenchData = items;
      this.syncBenches(items);
    });
    this.benchColorSub = this.cityService.getBenchColor().subscribe(settings => {
      if (settings?.length > 0) {
        const colorSetting = settings.find(s => s.id === 'benchColor');
        if (colorSetting?.color) {
          this.currentBenchColor = this.getBenchColorHex(colorSetting.color);
          this.syncBenches(this.currentBenchData);
        }
      }
    });
  }

  ngOnDestroy() {
    [this.birdSub, this.colorSub, this.flowerSub, this.flowerColorSub, this.benchSub, this.benchColorSub]
      .forEach(sub => sub?.unsubscribe());
    this.renderer.dispose();
  }

  private getColorHex(color: string): number {
    const map: any = { 'beige': 0xF5F5DC, 'pink': 0xFFC0CB, 'black': 0x000000, 'white': 0xFFFFFF };
    return map[color.toLowerCase()] || 0xffffff;
  }
  private getFlowerColorHex(color: string): number {
    const map: any = { 'purple': 0x9b59b6, 'orange': 0xff8c00, 'pink': 0xff1493 };
    return map[color.toLowerCase()] || 0xff1493;
  }
  private getBenchColorHex(color: string): number {
    const map: any = { 'white': 0xecf0f1, 'black': 0x2c3e50, 'brown': 0x8b4513 };
    return map[color.toLowerCase()] || 0x8b4513;
  }

  private initScene() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.nativeElement.appendChild(this.renderer.domElement);
    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.fog = new THREE.Fog(0x87ceeb, 400, 2000);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(200, 500, 200);
    this.scene.add(light);
    this.camera.position.set(0, 50, 500);
  }

  private generateInfiniteCity() {
    const names = ["METRO", "MUSEUM", "LAB", "OFFICE", "SKY"];
    const stripeMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
    for (let x = -1200; x <= 1200; x += 200) {
      for (let z = -1200; z <= 1200; z += 200) {
        const roadMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
        const vRoad = new THREE.Mesh(new THREE.PlaneGeometry(60, 200), roadMat);
        vRoad.rotation.x = -Math.PI / 2; vRoad.position.set(x, 0, z);
        this.scene.add(vRoad);
        const hRoad = new THREE.Mesh(new THREE.PlaneGeometry(200, 60), roadMat);
        hRoad.rotation.x = -Math.PI / 2; hRoad.position.set(x, 0.05, z);
        this.scene.add(hRoad);
        for (let i = -80; i <= 80; i += 30) {
          const vs = new THREE.Mesh(new THREE.PlaneGeometry(3, 20), stripeMat);
          vs.rotation.x = -Math.PI / 2; vs.position.set(x, 0.1, z + i);
          this.scene.add(vs);
          const hs = new THREE.Mesh(new THREE.PlaneGeometry(20, 3), stripeMat);
          hs.rotation.x = -Math.PI / 2; hs.position.set(x + i, 0.1, z);
          this.scene.add(hs);
        }
        if (Math.random() > 0.3) {
          this.createBuilding(x + 100, z + 100, names[Math.floor(Math.random() * 5)]);
        } else {
          this.createPark(x + 100, z + 100);
        }
      }
    }
  }

  private createBuilding(x: number, z: number, name: string) {
    const group = new THREE.Group();
    const h = 120 + Math.random() * 180;
    const body = new THREE.Mesh(new THREE.BoxGeometry(90, h, 90), new THREE.MeshPhongMaterial({ color: new THREE.Color(Math.random(), Math.random(), Math.random()) }));
    body.position.y = h / 2; group.add(body);
    const door = new THREE.Mesh(new THREE.BoxGeometry(20, 35, 2), new THREE.MeshPhongMaterial({ color: 0x331100 }));
    door.position.set(0, 17.5, 46); group.add(door);
    const handle = new THREE.Mesh(new THREE.SphereGeometry(1.5), new THREE.MeshPhongMaterial({ color: 0xffcc00 }));
    handle.position.set(6, 17.5, 47.5); group.add(handle);
    for (let i = 0; i < 3; i++) {
      const win = new THREE.Group();
      win.add(new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff })));
      win.add(new THREE.Mesh(new THREE.PlaneGeometry(1, 16), new THREE.MeshBasicMaterial({ color: 0x000000 })));
      win.add(new THREE.Mesh(new THREE.PlaneGeometry(16, 1), new THREE.MeshBasicMaterial({ color: 0x000000 })));
      win.position.set(-25 + (i * 25), h * 0.7, 45.5); group.add(win);
    }
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(60, 20), new THREE.MeshBasicMaterial({ map: this.makeText(name) }));
    sign.position.set(0, h + 15, 46); group.add(sign);
    group.position.set(x, 0, z); this.scene.add(group);
  }

  private createPark(x: number, z: number) {
    const grass = new THREE.Mesh(new THREE.PlaneGeometry(130, 130), new THREE.MeshPhongMaterial({ color: 0x27ae60 }));
    grass.rotation.x = -Math.PI / 2; grass.position.set(x, 0.1, z);
    this.scene.add(grass);
    this.parkPositions.push({ x, z });
    for (let i = 0; i < 3; i++) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 15), new THREE.MeshPhongMaterial({ color: 0x5d4037 }));
      trunk.position.y = 7.5; tree.add(trunk);
      const leaves = new THREE.Mesh(new THREE.SphereGeometry(18), new THREE.MeshPhongMaterial({ color: 0x1a5e1a }));
      leaves.position.y = 25; tree.add(leaves);
      tree.position.set(x + (i * 40 - 40), 0, z + (i * 15 - 15));
      this.scene.add(tree);
    }
  }

  // --- NEW CAT CREATION ---
  private createCatMesh() {
    const cat = new THREE.Group();
    const catMat = new THREE.MeshPhongMaterial({ color: 0x333333 }); // Dark grey cat
    
    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 10), catMat);
    body.position.y = 2;
    cat.add(body);

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(4.5, 4, 4), catMat);
    head.position.set(0, 5, 4);
    cat.add(head);

    // Ears
    const earGeom = new THREE.ConeGeometry(1, 2, 4);
    const leftEar = new THREE.Mesh(earGeom, catMat);
    leftEar.position.set(-1.5, 7.5, 4);
    const rightEar = new THREE.Mesh(earGeom, catMat);
    rightEar.position.set(1.5, 7.5, 4);
    cat.add(leftEar, rightEar);

    // Tail (wagging part)
    const tail = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 6), catMat);
    tail.position.set(0, 3, -7);
    cat.add(tail);

    return cat;
  }

  private syncBirds(items: any[]) {
    this.spawnedBirds.forEach(b => this.scene.remove(b));
    this.spawnedBirds = items.map(d => {
      const b = new THREE.Group();
      const wingMat = new THREE.MeshPhongMaterial({ color: this.currentBirdColor });
      const w1 = new THREE.Mesh(new THREE.BoxGeometry(12, 1, 4), wingMat);
      const w2 = w1.clone(); w1.position.x = -6; w2.position.x = 6;
      b.add(w1, w2); b.position.set(d.x, 250, d.z);
      this.scene.add(b); return b;
    });
  }

  private syncFlowers(items: any[]) {
    this.spawnedFlowers.forEach(f => this.scene.remove(f));
    this.spawnedCats.forEach(c => this.scene.remove(c)); // Clear old cats
    this.spawnedFlowers = [];
    this.spawnedCats = [];

    if (this.parkPositions.length === 0) return;
    items.forEach((data, index) => {
      const park = this.parkPositions[index % this.parkPositions.length];
      const treeIdx = index % 3;
      
      // Flower logic
      const flower = new THREE.Group();
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 8), new THREE.MeshPhongMaterial({ color: 0x228b22 }));
      stem.position.y = 4; flower.add(stem);
      const pMat = new THREE.MeshPhongMaterial({ color: this.currentFlowerColor });
      for (let i = 0; i < 5; i++) {
        const p = new THREE.Mesh(new THREE.SphereGeometry(2, 8, 8), pMat);
        const angle = (i / 5) * Math.PI * 2;
        p.position.set(Math.cos(angle) * 2.5, 8, Math.sin(angle) * 2.5);
        p.scale.set(0.8, 0.5, 0.8); flower.add(p);
      }
      const center = new THREE.Mesh(new THREE.SphereGeometry(1.5), new THREE.MeshPhongMaterial({ color: 0xffd700 }));
      center.position.y = 8; flower.add(center);
      
      const fx = park.x + (treeIdx * 40 - 40) - 20;
      const fz = park.z + 30;
      flower.position.set(fx, 0.1, fz);
      this.scene.add(flower); 
      this.spawnedFlowers.push(flower);

      // CAT NEXT TO FLOWER
      const cat = this.createCatMesh();
      cat.position.set(fx + 12, 0.1, fz + 5);
      cat.rotation.y = Math.random() * Math.PI;
      this.scene.add(cat);
      this.spawnedCats.push(cat);
    });
  }

  private syncBenches(items: any[]) {
    this.spawnedBenches.forEach(b => this.scene.remove(b));
    this.spawnedBenches = [];
    if (this.parkPositions.length === 0) return;
    items.forEach((data, index) => {
      const park = this.parkPositions[index % this.parkPositions.length];
      const treeIdx = index % 3;
      const bench = new THREE.Group();
      const mat = new THREE.MeshPhongMaterial({ color: this.currentBenchColor });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(20, 2, 8), mat);
      seat.position.y = 8; bench.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(20, 10, 2), mat);
      back.position.set(0, 12, -3); bench.add(back);
      const legG = new THREE.BoxGeometry(2, 8, 2);
      const l1 = new THREE.Mesh(legG, mat); l1.position.set(-7, 4, 2);
      const l2 = new THREE.Mesh(legG, mat); l2.position.set(7, 4, 2);
      const blG = new THREE.BoxGeometry(2, 12, 2);
      const l3 = new THREE.Mesh(blG, mat); l3.position.set(-7, 6, -3);
      const l4 = new THREE.Mesh(blG, mat); l4.position.set(7, 6, -3);
      bench.add(l1, l2, l3, l4);
      bench.position.set(park.x + (treeIdx * 40 - 40), 0.1, park.z - 40);
      this.scene.add(bench); this.spawnedBenches.push(bench);
    });
  }

  private spawnSafeTraffic() {
    const lanes = [-18, 18];
    for (let i = 0; i < 60; i++) {
      const car = this.createCarMesh();
      const isV = i % 2 === 0; const dir = Math.random() > 0.5 ? 1 : -1;
      if (isV) {
        car.position.set((Math.floor(i / 6) * 200 - 1000) + lanes[i % 2], 0, Math.random() * 2400 - 1200);
        this.spawnedCars.push({ mesh: car, speed: 3 + Math.random() * 3, dir, axis: 'z' });
      } else {
        car.rotation.y = Math.PI / 2;
        car.position.set(Math.random() * 2400 - 1200, 0.2, (Math.floor(i / 6) * 200 - 1000) + lanes[i % 2]);
        this.spawnedCars.push({ mesh: car, speed: 3 + Math.random() * 3, dir, axis: 'x' });
      }
      this.scene.add(car);
    }
  }

  private createCarMesh() {
    const car = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(15, 10, 28), new THREE.MeshPhongMaterial({ color: new THREE.Color(Math.random(), Math.random(), Math.random()) }));
    body.position.y = 6; car.add(body);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(13, 6, 16), new THREE.MeshPhongMaterial({ color: 0xffffff }));
    roof.position.y = 12; car.add(roof);
    const wM = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
    const wG = new THREE.CylinderGeometry(3, 3, 2, 16);
    const wP = [[-8,3,10], [8,3,10], [-8,3,-10], [8,3,-10]];
    wP.forEach(p => { const w = new THREE.Mesh(wG, wM); w.rotation.z = Math.PI/2; w.position.set(p[0],p[1],p[2]); car.add(w); });
    return car;
  }

  private makeText(t: string) {
    const canv = document.createElement('canvas'); const ctx = canv.getContext('2d')!;
    canv.width = 256; canv.height = 64; ctx.fillStyle = 'black'; ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = 'white'; ctx.font = 'bold 40px Arial'; ctx.textAlign = 'center'; ctx.fillText(t, 128, 48);
    return new THREE.CanvasTexture(canv);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) { this.mouseX = (e.clientX / window.innerWidth) - 0.5; this.mouseY = (e.clientY / window.innerHeight) - 0.5; }

  @HostListener('window:dblclick')
  onDoubleClick() { this.isOverview = !this.isOverview; }

  private animate() {
    requestAnimationFrame(() => this.animate());
    if (this.isOverview) {
      this.camera.position.y += (1000 - this.camera.position.y) * 0.05;
      this.camera.rotation.x += (-Math.PI / 2 - this.camera.rotation.x) * 0.05;
    } else {
      this.camera.position.y += (50 - this.camera.position.y) * 0.05;
      this.camera.rotation.x += (0 - this.camera.rotation.x) * 0.05;
      this.camera.position.z += this.mouseY * 25; this.camera.position.x += this.mouseX * 25;
    }
    [this.camera.position].forEach(p => {
      if (p.z < -1200) p.z = 1200; if (p.z > 1200) p.z = -1200;
      if (p.x < -1200) p.x = 1200; if (p.x > 1200) p.x = -1200;
    });
    this.spawnedCars.forEach(c => {
      if (c.axis === 'z') { c.mesh.position.z += c.speed * c.dir; if (Math.abs(c.mesh.position.z) > 1300) c.mesh.position.z = -c.dir * 1300; }
      else { c.mesh.position.x += c.speed * c.dir; if (Math.abs(c.mesh.position.x) > 1300) c.mesh.position.x = -c.dir * 1300; }
    });
    
    const time = Date.now() * 0.008;
    this.spawnedBirds.forEach(b => {
      b.children[0].rotation.z = Math.sin(time) * 0.8; b.children[1].rotation.z = -Math.sin(time) * 0.8;
      b.position.z -= 3; if (b.position.z < -1300) b.position.z = 1300;
    });

    // CAT ANIMATION (Tail wagging)
    this.spawnedCats.forEach(c => {
        const tail = c.children[4]; // The tail is the 5th child added (index 4)
        tail.rotation.y = Math.sin(time) * 0.5;
    });

    this.renderer.render(this.scene, this.camera);
  }
}