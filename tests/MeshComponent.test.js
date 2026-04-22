import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MeshComponent } from '../src/components/MeshComponent.js';
import * as THREE from 'three';

describe('MeshComponent', () => {
  let meshComp;
  let mockMesh;

  beforeEach(() => {
    // Create mock Three.js mesh
    mockMesh = {
      geometry: { dispose: vi.fn() },
      material: { dispose: vi.fn() },
      visible: true
    };

    meshComp = new MeshComponent();
  });

  it('should create with default values', () => {
    expect(meshComp.mesh).toBeNull();
    expect(meshComp.visible).toBe(true);
    expect(meshComp.layer).toBe(0);
  });

  it('should create with mesh', () => {
    meshComp = new MeshComponent(mockMesh);
    expect(meshComp.mesh).toBe(mockMesh);
  });

  it('should set mesh', () => {
    meshComp.setMesh(mockMesh);
    expect(meshComp.mesh).toBe(mockMesh);
  });

  it('should show mesh', () => {
    meshComp.setMesh(mockMesh);
    meshComp.visible = false;
    mockMesh.visible = false;

    meshComp.show();

    expect(meshComp.visible).toBe(true);
    expect(mockMesh.visible).toBe(true);
  });

  it('should hide mesh', () => {
    meshComp.setMesh(mockMesh);

    meshComp.hide();

    expect(meshComp.visible).toBe(false);
    expect(mockMesh.visible).toBe(false);
  });

  it('should handle show without mesh', () => {
    expect(() => {
      meshComp.show();
    }).not.toThrow();

    expect(meshComp.visible).toBe(true);
  });

  it('should handle hide without mesh', () => {
    expect(() => {
      meshComp.hide();
    }).not.toThrow();

    expect(meshComp.visible).toBe(false);
  });

  it('should dispose mesh resources', () => {
    meshComp.setMesh(mockMesh);

    meshComp.dispose();

    expect(mockMesh.geometry.dispose).toHaveBeenCalled();
    expect(mockMesh.material.dispose).toHaveBeenCalled();
  });

  it('should dispose mesh with array material', () => {
    const material1 = { dispose: vi.fn() };
    const material2 = { dispose: vi.fn() };
    mockMesh.material = [material1, material2];

    meshComp.setMesh(mockMesh);
    meshComp.dispose();

    expect(mockMesh.geometry.dispose).toHaveBeenCalled();
    expect(material1.dispose).toHaveBeenCalled();
    expect(material2.dispose).toHaveBeenCalled();
  });

  it('should handle dispose without mesh', () => {
    expect(() => {
      meshComp.dispose();
    }).not.toThrow();
  });

  it('should handle dispose with partial resources', () => {
    meshComp.setMesh({
      geometry: { dispose: vi.fn() }
      // No material
    });

    expect(() => {
      meshComp.dispose();
    }).not.toThrow();
  });
});
