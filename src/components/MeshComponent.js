import { Component } from '../core/Component.js';

/**
 * MeshComponent - Holds reference to a Three.js mesh for rendering
 * The RenderSystem uses this to sync entity transforms with Three.js objects
 */
export class MeshComponent extends Component {
  constructor(mesh = null) {
    super();

    // Three.js Mesh object
    this.mesh = mesh;

    // Whether this mesh should be rendered
    this.visible = true;

    // Rendering layer (for selective rendering)
    this.layer = 0;
  }

  /**
   * Set the Three.js mesh
   * @param {THREE.Mesh} mesh - Three.js mesh object
   */
  setMesh(mesh) {
    this.mesh = mesh;
  }

  /**
   * Show the mesh
   */
  show() {
    this.visible = true;
    if (this.mesh) {
      this.mesh.visible = true;
    }
  }

  /**
   * Hide the mesh
   */
  hide() {
    this.visible = false;
    if (this.mesh) {
      this.mesh.visible = false;
    }
  }

  /**
   * Dispose of Three.js resources
   */
  dispose() {
    if (this.mesh) {
      if (this.mesh.geometry) {
        this.mesh.geometry.dispose();
      }
      if (this.mesh.material) {
        if (Array.isArray(this.mesh.material)) {
          this.mesh.material.forEach(mat => mat.dispose());
        } else {
          this.mesh.material.dispose();
        }
      }
    }
  }
}
