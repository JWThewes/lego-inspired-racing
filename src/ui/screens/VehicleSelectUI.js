import { BaseScreen } from '../BaseScreen.js';
import * as THREE from 'three';

/**
 * VehicleSelectUI - Vehicle selection screen with 3D previews
 */
export class VehicleSelectUI extends BaseScreen {
  constructor(onVehicleSelected) {
    super('vehicle-select-screen');
    this.onVehicleSelected = onVehicleSelected;
    this.selectedVehicleId = null;
    this.vehicles = [
      { id: 'racer-1', name: 'Speed Racer', color: 0xff0000, description: 'Fast and agile' },
      { id: 'racer-2', name: 'Power Truck', color: 0x0000ff, description: 'Strong and stable' },
      { id: 'racer-3', name: 'Nimble Buggy', color: 0x00ff00, description: 'Quick turns' },
      { id: 'racer-4', name: 'Turbo Coupe', color: 0xffff00, description: 'Balanced speed' }
    ];
    this.previewScenes = new Map();
    this.animationFrameId = null;
  }

  create() {
    const container = document.createElement('div');
    container.className = 'screen vehicle-select-screen';

    // Title
    const title = document.createElement('h2');
    title.className = 'screen-title';
    title.textContent = 'CHOOSE YOUR VEHICLE';
    title.setAttribute('data-testid', 'vehicle-select-title');

    // Vehicle cards container
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'vehicle-cards-container';
    cardsContainer.setAttribute('data-testid', 'vehicle-cards-container');

    // Create a card for each vehicle
    this.vehicles.forEach(vehicle => {
      const card = this.createVehicleCard(vehicle);
      cardsContainer.appendChild(card);
    });

    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = 'btn btn-primary btn-large';
    nextButton.textContent = 'NEXT';
    nextButton.setAttribute('data-testid', 'next-button');
    nextButton.disabled = true;
    nextButton.addEventListener('click', () => {
      if (this.selectedVehicleId && this.onVehicleSelected) {
        this.onVehicleSelected(this.selectedVehicleId);
      }
    });
    this.nextButton = nextButton;

    container.appendChild(title);
    container.appendChild(cardsContainer);
    container.appendChild(nextButton);

    return container;
  }

  createVehicleCard(vehicle) {
    const card = document.createElement('div');
    card.className = 'vehicle-card';
    card.setAttribute('data-testid', `vehicle-card-${vehicle.id}`);

    // 3D preview container
    const previewContainer = document.createElement('div');
    previewContainer.className = 'vehicle-preview';
    previewContainer.setAttribute('data-testid', `vehicle-preview-${vehicle.id}`);

    // Create Three.js scene for 3D preview
    const { scene, camera, renderer } = this.create3DPreview(vehicle, previewContainer);
    this.previewScenes.set(vehicle.id, { scene, camera, renderer, container: previewContainer });

    // Vehicle info
    const info = document.createElement('div');
    info.className = 'vehicle-info';

    const name = document.createElement('h3');
    name.className = 'vehicle-name';
    name.textContent = vehicle.name;

    const description = document.createElement('p');
    description.className = 'vehicle-description';
    description.textContent = vehicle.description;

    info.appendChild(name);
    info.appendChild(description);

    // Select button
    const selectButton = document.createElement('button');
    selectButton.className = 'btn btn-secondary';
    selectButton.textContent = 'SELECT';
    selectButton.setAttribute('data-testid', `select-vehicle-${vehicle.id}`);
    selectButton.addEventListener('click', () => this.selectVehicle(vehicle.id));

    card.appendChild(previewContainer);
    card.appendChild(info);
    card.appendChild(selectButton);

    return card;
  }

  create3DPreview(vehicle, container) {
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    // Create camera
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(3, 2, 3);
    camera.lookAt(0, 0, 0);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(200, 200);
    container.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Create simple vehicle mesh (box for now, can be replaced with models)
    const geometry = new THREE.BoxGeometry(1.5, 0.8, 0.8);
    const material = new THREE.MeshStandardMaterial({ color: vehicle.color });
    const vehicleMesh = new THREE.Mesh(geometry, material);
    scene.add(vehicleMesh);

    // Add wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

    const wheelPositions = [
      [-0.5, -0.4, 0.5],
      [0.5, -0.4, 0.5],
      [-0.5, -0.4, -0.5],
      [0.5, -0.4, -0.5]
    ];

    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      scene.add(wheel);
    });

    return { scene, camera, renderer };
  }

  selectVehicle(vehicleId) {
    this.selectedVehicleId = vehicleId;

    // Update card styles
    const cards = this.container.querySelectorAll('.vehicle-card');
    cards.forEach(card => {
      const cardId = card.getAttribute('data-testid').replace('vehicle-card-', '');
      if (cardId === vehicleId) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    // Enable next button
    if (this.nextButton) {
      this.nextButton.disabled = false;
    }
  }

  onShow() {
    console.log('Vehicle select shown');
    this.selectedVehicleId = null;
    if (this.nextButton) {
      this.nextButton.disabled = true;
    }

    // Start animation loop for 3D previews
    this.startPreviewAnimation();
  }

  onHide() {
    console.log('Vehicle select hidden');
    this.stopPreviewAnimation();
  }

  onDestroy() {
    this.stopPreviewAnimation();

    // Clean up Three.js resources
    this.previewScenes.forEach(({ scene, renderer }) => {
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(mat => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    });
    this.previewScenes.clear();
  }

  startPreviewAnimation() {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);

      // Rotate vehicle meshes
      this.previewScenes.forEach(({ scene, camera, renderer }) => {
        scene.children.forEach(child => {
          if (child.geometry && child.geometry.type === 'BoxGeometry') {
            child.rotation.y += 0.01;
          }
        });
        renderer.render(scene, camera);
      });
    };

    animate();
  }

  stopPreviewAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  update(deltaTime) {
    // Preview animation is handled separately
  }
}
