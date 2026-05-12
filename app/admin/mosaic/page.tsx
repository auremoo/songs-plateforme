"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { downloadBackup } from "@/lib/backup";

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TileData {
  key: string;
  src: string;
  color: string;
  title: string;
  ratio: string;
  objectPosition?: string;
  crop?: CropRect;
}

/** Height relative to width=1 — must match ArchivesSection */
const RATIO_HEIGHT: Record<string, number> = {
  portrait: 4 / 3,
  tall: 3 / 2,
  landscape: 3 / 4,
  wide: 9 / 16,
  square: 1,
};

const RATIO_ASPECT: Record<string, string> = {
  portrait: "3/4",
  tall: "2/3",
  landscape: "4/3",
  wide: "16/9",
  square: "1/1",
};

/** Auto-distribute tiles into balanced columns (shortest-column-first) */
function autoDistribute(tiles: TileData[], cols: number): TileData[][] {
  const result: TileData[][] = Array.from({ length: cols }, () => []);
  const heights: number[] = new Array(cols).fill(0);

  for (const tile of tiles) {
    const minIdx = heights.indexOf(Math.min(...heights));
    result[minIdx].push(tile);
    heights[minIdx] += RATIO_HEIGHT[tile.ratio] ?? RATIO_HEIGHT.landscape;
  }

  return result;
}

export default function MosaicAdminPage() {
  // grid = the columns, each containing tiles in order
  const [grid, setGrid] = useState<TileData[][]>([]);
  const [colCount, setColCount] = useState(5);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [alignBottom, setAlignBottom] = useState(false);

  // All tiles flat (for reference)
  const allTiles = useMemo(() => grid.flat(), [grid]);

  useEffect(() => {
    Promise.all([
      fetch("/api/releases").then((r) => r.json()),
      fetch("/api/design").then((r) => r.json()),
    ]).then(([projects, design]) => {
      const cols = design.gridColumns ?? 5;
      setColCount(cols);
      setAlignBottom(design.mosaicAlignBottom ?? false);

      // Build all tiles
      const tiles: TileData[] = [];
      for (const p of projects) {
        tiles.push({
          key: p.slug,
          src: p.cover || "",
          color: p.color || "#ccc",
          title: p.title?.fr || p.slug,
          ratio: p.coverRatio || "square",
          objectPosition: undefined,
          crop: p.coverCrop,
        });
        if (p.gallery) {
          p.gallery
            .filter((g: { showOnMosaic?: boolean; src?: string }) => g.showOnMosaic && g.src)
            .forEach((g: { src: string; mosaicRatio?: string; objectPosition?: string; mosaicCrop?: CropRect }, i: number) => {
              tiles.push({
                key: `${p.slug}-mosaic-${i}`,
                src: g.src,
                color: p.color || "#ccc",
                title: `${p.title?.fr} (${i + 1})`,
                ratio: g.mosaicRatio || "landscape",
                objectPosition: g.objectPosition,
                crop: g.mosaicCrop,
              });
            });
        }
      }

      const tileMap = new Map(tiles.map((t) => [t.key, t]));

      // If we have a saved grid, use it
      if (design.mosaicGrid && design.mosaicGrid.length === cols) {
        const restored: TileData[][] = design.mosaicGrid.map((colKeys: string[]) =>
          colKeys.map((key: string) => tileMap.get(key)).filter((t: TileData | undefined): t is TileData => !!t)
        );
        // Add unplaced tiles (new projects)
        const placedKeys = new Set((design.mosaicGrid as string[][]).flat());
        const unplaced = tiles.filter((t) => !placedKeys.has(t.key));
        if (unplaced.length > 0) {
          const heights = restored.map((col) =>
            col.reduce((h, t) => h + (RATIO_HEIGHT[t.ratio] ?? RATIO_HEIGHT.landscape), 0)
          );
          for (const tile of unplaced) {
            const minIdx = heights.indexOf(Math.min(...heights));
            restored[minIdx].push(tile);
            heights[minIdx] += RATIO_HEIGHT[tile.ratio] ?? RATIO_HEIGHT.landscape;
          }
        }
        setGrid(restored);
      } else {
        // Fallback: sort by mosaicOrder then auto-distribute
        if (design.mosaicOrder && design.mosaicOrder.length > 0) {
          const orderMap = new Map<string, number>(
            design.mosaicOrder.map((key: string, i: number) => [key, i])
          );
          tiles.sort((a, b) => (orderMap.get(a.key) ?? 9999) - (orderMap.get(b.key) ?? 9999));
        }
        setGrid(autoDistribute(tiles, cols));
      }
    });
  }, []);

  // Find selected tile position in the grid
  function findSelected(): { col: number; row: number } | null {
    if (!selectedKey) return null;
    for (let c = 0; c < grid.length; c++) {
      const r = grid[c].findIndex((t) => t.key === selectedKey);
      if (r !== -1) return { col: c, row: r };
    }
    return null;
  }
  const selectedPos = findSelected();

  // Move tile within column (up/down)
  const moveInColumn = useCallback((col: number, fromRow: number, toRow: number) => {
    if (toRow < 0) return;
    setGrid((prev) => {
      const next = prev.map((c) => [...c]);
      if (toRow >= next[col].length) return prev;
      const [item] = next[col].splice(fromRow, 1);
      next[col].splice(toRow, 0, item);
      return next;
    });
    setSaved(false);
  }, []);

  // Move tile to another column
  const moveToColumn = useCallback((fromCol: number, fromRow: number, toCol: number, toRow?: number) => {
    if (toCol < 0) return;
    setGrid((prev) => {
      if (toCol >= prev.length) return prev;
      const next = prev.map((c) => [...c]);
      const [item] = next[fromCol].splice(fromRow, 1);
      const insertRow = toRow ?? Math.min(fromRow, next[toCol].length);
      next[toCol].splice(insertRow, 0, item);
      return next;
    });
    setSaved(false);
  }, []);

  // Visual movement handler
  const moveVisual = useCallback((direction: "up" | "down" | "left" | "right") => {
    if (!selectedPos) return;
    const { col, row } = selectedPos;

    switch (direction) {
      case "up":
        moveInColumn(col, row, row - 1);
        break;
      case "down":
        moveInColumn(col, row, row + 1);
        break;
      case "left":
        if (col > 0) moveToColumn(col, row, col - 1);
        break;
      case "right":
        if (col < grid.length - 1) moveToColumn(col, row, col + 1);
        break;
    }
  }, [selectedPos, grid.length, moveInColumn, moveToColumn]);

  // Auto-redistribute evenly
  const redistribute = useCallback(() => {
    setGrid((prev) => autoDistribute(prev.flat(), prev.length));
    setSaved(false);
  }, []);

  // Keyboard support
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!selectedKey) return;
      if (e.key === "ArrowUp") { e.preventDefault(); moveVisual("up"); }
      else if (e.key === "ArrowDown") { e.preventDefault(); moveVisual("down"); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); moveVisual("left"); }
      else if (e.key === "ArrowRight") { e.preventDefault(); moveVisual("right"); }
      else if (e.key === "Escape") { setSelectedKey(null); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedKey, moveVisual]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    const designRes = await fetch("/api/design");
    const design = await designRes.json();
    // Save explicit grid (array of columns, each column = array of keys)
    design.mosaicGrid = grid.map((col) => col.map((t) => t.key));
    // Also update flat order for backwards compatibility
    design.mosaicOrder = grid.flat().map((t) => t.key);
    design.mosaicAlignBottom = alignBottom;
    await fetch("/api/design", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(design),
    });
    setSaving(false);
    setSaved(true);
    downloadBackup();
  }, [grid, alignBottom]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Grille mosaïque</h1>
          <p className="text-sm text-gray-500 mt-1">
            Cliquez sur une tuile puis déplacez-la avec les boutons ou les touches fléchées.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selectedKey && selectedPos && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => moveVisual("up")}
                disabled={selectedPos.row === 0}
                className="px-2.5 py-1.5 text-xs border border-gray-300 hover:border-noir disabled:opacity-30"
                title="Monter"
              >
                ↑
              </button>
              <button
                onClick={() => moveVisual("down")}
                disabled={selectedPos.row === grid[selectedPos.col].length - 1}
                className="px-2.5 py-1.5 text-xs border border-gray-300 hover:border-noir disabled:opacity-30"
                title="Descendre"
              >
                ↓
              </button>
              <button
                onClick={() => moveVisual("left")}
                disabled={selectedPos.col === 0}
                className="px-2.5 py-1.5 text-xs border border-gray-300 hover:border-noir disabled:opacity-30"
                title="Colonne gauche"
              >
                ←
              </button>
              <button
                onClick={() => moveVisual("right")}
                disabled={selectedPos.col === grid.length - 1}
                className="px-2.5 py-1.5 text-xs border border-gray-300 hover:border-noir disabled:opacity-30"
                title="Colonne droite"
              >
                →
              </button>
              <button
                onClick={() => setSelectedKey(null)}
                className="px-2.5 py-1.5 text-xs border border-gray-300 hover:border-noir ml-1"
              >
                ✕
              </button>
            </div>
          )}
          <button
            onClick={redistribute}
            className="px-4 py-2 text-xs border border-gray-300 hover:border-noir transition-colors"
            title="Redistribuer automatiquement"
          >
            Redistribuer
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-noir text-white text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {saving ? "Sauvegarde..." : saved ? "Sauvegardé !" : "Sauvegarder"}
          </button>
        </div>
      </div>

      {/* Grid preview — direct column rendering, WYSIWYG */}
      <div className="flex" style={{ gap: "10px", alignItems: "flex-start" }}>
        {grid.map((column, colIdx) => (
          <div
            key={`col-${colIdx}`}
            className="flex flex-col flex-1 min-w-0"
            style={{ gap: "10px" }}
          >
            <div className="text-[10px] text-gray-400 text-center mb-1">
              Col {colIdx + 1} ({column.length})
            </div>
            {column.map((tile, rowIdx) => {
              const aspect = RATIO_ASPECT[tile.ratio] ?? RATIO_ASPECT.landscape;
              const isSelected = tile.key === selectedKey;
              const isLast = rowIdx === column.length - 1;

              return (
                <div
                  key={tile.key}
                  onClick={() => setSelectedKey(tile.key === selectedKey ? null : tile.key)}
                  className={`cursor-pointer relative overflow-hidden transition-all ${
                    isSelected
                      ? "ring-3 ring-blue-500 scale-[1.02] z-10"
                      : "hover:ring-2 hover:ring-gray-300"
                  } ${isLast && alignBottom ? "ring-1 ring-orange-300" : ""}`}
                  style={{ backgroundColor: tile.color, aspectRatio: aspect }}
                >
                  {tile.src && (
                    <Image
                      src={tile.src}
                      alt={tile.title}
                      fill
                      className="object-cover pointer-events-none"
                      style={
                        tile.crop
                          ? { objectPosition: `${tile.crop.x + tile.crop.width / 2}% ${tile.crop.y + tile.crop.height / 2}%` }
                          : tile.objectPosition
                            ? { objectPosition: tile.objectPosition }
                            : undefined
                      }
                      unoptimized
                      sizes="20vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-end p-1.5">
                    <span className="text-white text-[9px] font-medium opacity-0 hover:opacity-100 transition-opacity leading-tight drop-shadow-md">
                      {tile.title}
                    </span>
                  </div>
                  {/* Position in column */}
                  <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded">
                    {colIdx + 1}.{rowIdx + 1}
                  </div>
                  {isLast && alignBottom && (
                    <div className="absolute top-1 right-1 bg-orange-500/80 text-white text-[8px] px-1 rounded">
                      etirée
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Options */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {allTiles.length} tuiles · {colCount} colonnes
        </p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={alignBottom}
            onChange={(e) => { setAlignBottom(e.target.checked); setSaved(false); }}
            className="accent-noir"
          />
          <span className="text-sm text-gray-600">
            Aligner le bas des colonnes (étire la dernière image)
          </span>
        </label>
      </div>
    </div>
  );
}
