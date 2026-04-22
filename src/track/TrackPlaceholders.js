import * as THREE from 'three';

/**
 * TrackPlaceholders - Generates simple placeholder track geometry
 * Used when GLTF models are not available during development
 */
export class TrackPlaceholders {
  /**
   * Create a simple placeholder track mesh
   * @param {string} trackId - Track identifier
   * @param {string} theme - Track theme (city, desert, forest)
   * @returns {THREE.Group}
   */
  static createPlaceholderTrack(trackId, theme) {
    const group = new THREE.Group();
    group.name = `placeholder-${trackId}`;

    // Create ground plane
    const ground = TrackPlaceholders._createGround(theme);
    group.add(ground);

    // Create track surface
    const trackSurface = TrackPlaceholders._createTrackSurface(theme);
    group.add(trackSurface);

    // Create boundary walls
    const walls = TrackPlaceholders._createBoundaryWalls(theme);
    group.add(walls);

    // Add theme-specific decorations
    const decorations = TrackPlaceholders._createThemeDecorations(theme);
    group.add(decorations);

    console.log(`Created placeholder track for ${trackId} (${theme} theme)`);
    return group;
  }

  /**
   * Create ground plane
   * @private
   */
  static _createGround(theme) {
    const geometry = new THREE.PlaneGeometry(300, 300);
    const material = new THREE.MeshStandardMaterial({
      color: TrackPlaceholders._getGroundColor(theme),
      roughness: 0.8,
      metalness: 0.2
    });

    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    ground.name = 'ground';

    return ground;
  }

  /**
   * Create track surface (the racing path)
   * @private
   */
  static _createTrackSurface(theme) {
    const group = new THREE.Group();
    group.name = 'track-surface';

    // Create main track loop using boxes
    const segments = [
      // Forward straight
      { pos: [0, 0, 30], size: [15, 0.2, 60] },
      // Right turn
      { pos: [45, 0, 60], size: [60, 0.2, 15] },
      // Right straight
      { pos: [60, 0, 0], size: [15, 0.2, 105] },
      // Bottom turn
      { pos: [0, 0, -30], size: [105, 0.2, 15] },
      // Left straight
      { pos: [-60, 0, 0], size: [15, 0.2, 75] },
      // Left turn top
      { pos: [-30, 0, 30], size: [45, 0.2, 15] }
    ];

    const material = new THREE.MeshStandardMaterial({
      color: TrackPlaceholders._getTrackColor(theme),
      roughness: 0.6,
      metalness: 0.1
    });

    segments.forEach(seg => {
      const geometry = new THREE.BoxGeometry(...seg.size);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...seg.pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    });

    return group;
  }

  /**
   * Create boundary walls
   * @private
   */
  static _createBoundaryWalls(theme) {
    const group = new THREE.Group();
    group.name = 'walls';

    const wallHeight = 3;
    const wallThickness = 2;
    const material = new THREE.MeshStandardMaterial({
      color: TrackPlaceholders._getWallColor(theme),
      roughness: 0.7,
      metalness: 0.3
    });

    // Create walls around track bounds (simple box perimeter)
    const walls = [
      { pos: [0, wallHeight/2, 100], size: [150, wallHeight, wallThickness] },  // North
      { pos: [0, wallHeight/2, -100], size: [150, wallHeight, wallThickness] }, // South
      { pos: [100, wallHeight/2, 0], size: [wallThickness, wallHeight, 200] },  // East
      { pos: [-100, wallHeight/2, 0], size: [wallThickness, wallHeight, 200] }  // West
    ];

    walls.forEach(wall => {
      const geometry = new THREE.BoxGeometry(...wall.size);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...wall.pos);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    });

    return group;
  }

  /**
   * Create theme-specific decorations
   * @private
   */
  static _createThemeDecorations(theme) {
    const group = new THREE.Group();
    group.name = 'decorations';

    switch (theme) {
      case 'city':
        // Add blocky buildings
        for (let i = 0; i < 8; i++) {
          const building = TrackPlaceholders._createBuilding();
          const angle = (i / 8) * Math.PI * 2;
          const radius = 120;
          building.position.x = Math.cos(angle) * radius;
          building.position.z = Math.sin(angle) * radius;
          group.add(building);
        }
        break;

      case 'desert':
        // Add rocks/dunes
        for (let i = 0; i < 12; i++) {
          const rock = TrackPlaceholders._createRock();
          const angle = (i / 12) * Math.PI * 2;
          const radius = 130 + Math.random() * 20;
          rock.position.x = Math.cos(angle) * radius;
          rock.position.z = Math.sin(angle) * radius;
          group.add(rock);
        }
        break;

      case 'forest':
        // Add trees
        for (let i = 0; i < 15; i++) {
          const tree = TrackPlaceholders._createTree();
          const angle = (i / 15) * Math.PI * 2;
          const radius = 110 + Math.random() * 30;
          tree.position.x = Math.cos(angle) * radius;
          tree.position.z = Math.sin(angle) * radius;
          group.add(tree);
        }
        break;
    }

    return group;
  }

  /**
   * Create a blocky building (city theme)
   * @private
   */
  static _createBuilding() {
    const height = 15 + Math.random() * 20;
    const width = 8 + Math.random() * 5;
    const depth = 8 + Math.random() * 5;

    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.6, 0.1, 0.5 + Math.random() * 0.2),
      roughness: 0.8,
      metalness: 0.2
    });

    const building = new THREE.Mesh(geometry, material);
    building.position.y = height / 2;
    building.castShadow = true;
    building.receiveShadow = true;

    return building;
  }

  /**
   * Create a blocky rock (desert theme)
   * @private
   */
  static _createRock() {
    const size = 3 + Math.random() * 4;
    const geometry = new THREE.BoxGeometry(size, size * 0.8, size);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(0.1, 0.3, 0.4 + Math.random() * 0.2),
      roughness: 0.9,
      metalness: 0.1
    });

    const rock = new THREE.Mesh(geometry, material);
    rock.position.y = size * 0.4;
    rock.rotation.y = Math.random() * Math.PI;
    rock.castShadow = true;
    rock.receiveShadow = true;

    return rock;
  }

  /**
   * Create a blocky tree (forest theme)
   * @private
   */
  static _createTree() {
    const group = new THREE.Group();

    // Trunk
    const trunkGeometry = new THREE.BoxGeometry(1.5, 8, 1.5);
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a3728,
      roughness: 0.9
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 4;
    trunk.castShadow = true;
    group.add(trunk);

    // Foliage (blocky crown)
    const foliageGeometry = new THREE.BoxGeometry(6, 6, 6);
    const foliageMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d5a2d,
      roughness: 0.8
    });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = 10;
    foliage.castShadow = true;
    group.add(foliage);

    return group;
  }

  /**
   * Get ground color by theme
   * @private
   */
  static _getGroundColor(theme) {
    const colors = {
      city: 0x555555,    // Gray concrete
      desert: 0xd4a76a,  // Sandy beige
      forest: 0x3a5f3a   // Forest green
    };
    return colors[theme] || 0x808080;
  }

  /**
   * Get track surface color by theme
   * @private
   */
  static _getTrackColor(theme) {
    const colors = {
      city: 0x2a2a2a,    // Dark asphalt
      desert: 0x8b7355,  // Sandy road
      forest: 0x4a3520   // Dirt path
    };
    return colors[theme] || 0x404040;
  }

  /**
   * Get wall color by theme
   * @private
   */
  static _getWallColor(theme) {
    const colors = {
      city: 0xcccccc,    // Concrete barriers
      desert: 0xa67c52,  // Sandy barriers
      forest: 0x654321   // Wooden barriers
    };
    return colors[theme] || 0x666666;
  }
}
