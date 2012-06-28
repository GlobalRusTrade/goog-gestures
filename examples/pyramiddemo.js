// A pyramid represents a single source of tiles. Some information is cached to make the rest
// of the code cleaner, such as the level sizes. Each pyramid can provide tiles - one could
// have different implementations of this that return imagery/videos/etc.
var ImagePyramid = function(width, height, tileSize, tileOverlap, border) {
  this.id = 'p' + (ImagePyramid.nextId_++);
  this.width = width;
  this.height = height;
  this.tileSize = tileSize || 256;
  this.tileOverlap = tileOverlap || 0;
  this.border = border || 0;

  // Min and max level ranges - currently the first level that fits on a single tile and the max level
  // If rendering from a collection minLevel would be the minLevel of that collection
  var levelCount = Math.ceil(Math.log(Math.max(width, height)) / Math.LN2) + 1;
  this.minLevel = Math.floor(Math.log(tileSize) / Math.LN2);
  this.maxLevel = Math.max(0, levelCount - 1);

  this.levels = new Array(levelCount);
  for (var n = 0; n < levelCount; n++) {
    var pow2 = Math.pow(2, levelCount - n - 1);
    var pixelWidth = Math.max(1, Math.ceil(width / pow2));
    var pixelHeight = Math.max(1, Math.ceil(height / pow2));
    this.levels[n] = {
      // Size, in pixels, of the level imagery
      pixelWidth: pixelWidth,
      pixelHeight: pixelHeight,
      // Size, in tiles, of the level imagery
      tileWidth: Math.ceil(pixelWidth / tileSize),
      tileHeight: Math.ceil(pixelHeight / tileSize)
    };
  }
};
ImagePyramid.nextId_ = 0;
// Computes a tiles dimensions taking into account tile overlap and border
ImagePyramid.prototype.computeTileDimensions = function(level, x, y) {
  var levelInfo = this.levels[level];
  var tileWidth = this.tileSize;
  if (x == 0) {
    tileWidth += this.border;
  } else {
    tileWidth += this.tileOverlap;
  }
  if (x == levelInfo.tileWidth - 1) {
    tileWidth += this.border;
  } else {
    tileWidth += this.tileOverlap;
  }
  var tileHeight = this.tileSize;
  if (y == 0) {
    tileHeight += this.border;
  } else {
    tileHeight += this.tileOverlap;
  }
  if (y == levelInfo.tileHeight - 1) {
    tileHeight += this.border;
  } else {
    tileHeight += this.tileOverlap;
  }
  return {
    width: tileWidth,
    height: tileHeight
  };
};
ImagePyramid.levelColors_ = [
  'rgb(255,0,0)',
  'rgb(255,255,0)',
  'rgb(255,0,255)',
  'rgb(0,255,0)',
  'rgb(0,255,255)',
  'rgb(0,0,255)'
];
// Gets a tile with alternating color per level with the LOD stamped on it
ImagePyramid.prototype.getTile = function(level, x, y) {
  var tileDimensions = this.computeTileDimensions(level, x, y);
  var canvas = document.createElement('canvas');
  canvas.width = tileDimensions.width;
  canvas.height = tileDimensions.height;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = ImagePyramid.levelColors_[level % ImagePyramid.levelColors_.length];
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgb(255,255,255)';
  ctx.fillText(level + '@' + x + ',' + y, this.tileOverlap, this.tileOverlap + 8);
  return canvas;
};

// Simple LERP for temporal blending
var OpacityTween = function() {
  this.value = 0;
  this.target = 1;
  this.startTimestamp = 0;
};
OpacityTween.duration = 0.250;
OpacityTween.prototype.update = function(timestamp) {
  if (!this.startTimestamp) {
    this.startTimestamp = timestamp;
    return true;
  }
  var t = (timestamp - this.startTimestamp) / 1000;
  t = Math.min(OpacityTween.duration, t) / OpacityTween.duration;
  this.value = Math.max(0, Math.min(1, t));
  return Math.abs(this.target - this.value) > 0.01;
};

// A single tile entry in the tile cache
var Tile = function(content) {
  this.width = content.width;
  this.height = content.height;
  this.content = content;

  this.opacity = new OpacityTween();
};

// A very simple tile cache that discards all tiles not used in the last frame
// Also manages requesting new tiles each frame by picking the highest priority one
var TileCache = function() {
  this.tiles = {};
  this.usedTiles = {};
  this.animatingTiles = [];
  this.requests = [];
};
TileCache.maxPerFrame = 2;
TileCache.prototype.beginFrame = function(timestamp) {
  // Update all opacity tweens, removing them from the animating list if they have completed
  for (var n = 0; n < this.animatingTiles.length; n++) {
    var tile = this.animatingTiles[n];
    if (!tile.opacity.update(timestamp)) {
      tile.opacity.value = 1;
      this.animatingTiles.splice(n, 1);
      n--;
    }
  }
  return this.animatingTiles.length > 0;
};
TileCache.prototype.endFrame = function() {
  // Swap the maps - effectively drops all unused tiles
  this.tiles = this.usedTiles;
  this.usedTiles = {};

  // Sort and pick the highest priority tile to fetch
  var anyRequested = false;
  if (this.requests.length) {
    this.requests.sort(function(a, b) {
      return a.priority - b.priority;
    });
    var request = this.requests[0];
    var tile = new Tile(request.pyramid.getTile(
        request.level, request.x, request.y));
    this.tiles[request.key] = tile;
    this.animatingTiles.push(tile);
    anyRequested = true;
  }
  this.requests.length = 0;
  return anyRequested;
};
// Attempt to retrieve a tile from the cache; if not present, queue it
TileCache.prototype.getTile = function(pyramid, level, x, y, priority) {
  var key = pyramid.id + '-' + level + '@' + x + ',' + y;
  var tile = this.tiles[key];
  if (tile) {
    this.usedTiles[key] = tile;
    return tile;
  }
  this.requests.push({
    pyramid: pyramid,
    level: level,
    x: x,
    y: y,
    key: key,
    priority: priority
  });
  return null;
};

var CanvasRenderer = function(canvas) {
  this.canvas = canvas;
  this.ctx = canvas.getContext('2d');
};
CanvasRenderer.prototype.clear = function() {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};
// Draw a single quad with the given content and opacity at the given bounds with the given source texture coordinates
CanvasRenderer.prototype.drawQuad = function(bounds, content, opacity, texCoords) {
  this.ctx.globalAlpha = opacity;
  this.ctx.drawImage(
      content,
      texCoords.x1, texCoords.y1,
      texCoords.x2 - texCoords.x1, texCoords.y2 - texCoords.y1,
      bounds.x, bounds.y,
      bounds.w, bounds.h);
};

// Magical tile layer stack for emitting vertical slices of the pyramid
var TileStack = function(pyramid, renderer) {
  this.pyramid = pyramid;
  this.renderer = renderer;
  this.layers = new Array(pyramid.levels.length);
  for (var n = 0; n < this.layers.length; n++) {
    this.layers[n] = {
      x: 0,
      y: 0,
      tile: null,
      // Blending opacity (tile opacity and spatial blending)
      opacity: 0,
      // The size of a tile on the screen
      scaledTileSize: 1
    };
  }
  // The current index into the layer stack
  this.index = -1;
  // The first level of detail that has a solid tile
  this.firstLevel = 0;
};
// Pushes a new tile onto the stack
TileStack.prototype.push = function(level, x, y, tile, blendWeight, scaledTileSize) {
  this.index = level;
  var layer = this.layers[level];
  layer.x = x;
  layer.y = y;
  layer.tile = tile;
  layer.opacity = blendWeight * (tile ? tile.opacity.value : 0);
  layer.scaledTileSize = scaledTileSize;

  if (layer.opacity == 1) {
    this.firstLevel = this.index;
  }
};
// Pops the last tile from the stack
TileStack.prototype.pop = function() {
  if (this.firstLevel == this.index) {
    this.firstLevel--;
  }
  this.index--;
};
// Emits a vertical slice of the pyramid
TileStack.prototype.emit = function(screenBounds) {
  var tileSize = this.pyramid.tileSize;
  var tileOverlap = this.pyramid.tileOverlap;
  var border = this.pyramid.border;
  var texCoords = { x1: 0, y1: 0, x2: 0, y2: 0 };

  // Compute the slice region in image space ([0,0]-[1,1])
  var topLevel = this.pyramid.levels[this.index];
  var topLayer = this.layers[this.index];
  var sx = topLayer.x * tileSize / topLevel.pixelWidth;
  var sy = topLayer.y * tileSize / topLevel.pixelHeight;
  var sw = topLayer.x < topLevel.tileWidth - 1 ? tileSize : topLevel.pixelWidth - (topLayer.x * tileSize);
  sw /= topLevel.pixelWidth;
  var sh = topLayer.y < topLevel.tileHeight - 1 ? tileSize : topLevel.pixelHeight - (topLayer.y * tileSize);
  sh /= topLevel.pixelHeight;

  // Compute the slice's position on the screen
  var bounds = {
    x: screenBounds.x + topLayer.x * topLayer.scaledTileSize,
    y: screenBounds.y + topLayer.y * topLayer.scaledTileSize,
    w: Math.min(topLayer.scaledTileSize, screenBounds.w - topLayer.x * topLayer.scaledTileSize),
    h: Math.min(topLayer.scaledTileSize, screenBounds.h - topLayer.y * topLayer.scaledTileSize)
  };

  // Run from the first opaque layer to the current layer
  for (var n = this.firstLevel; n <= this.index; n++) {
    var levelInfo = this.pyramid.levels[n];
    var layer = this.layers[n];
    if (!layer.tile) {
      continue;
    }

    // Slice region in level space [0,0]-[level width, level height]
    var lx = sx * levelInfo.pixelWidth;
    var ly = sy * levelInfo.pixelHeight;
    var lw = sw * levelInfo.pixelWidth;
    var lh = sh * levelInfo.pixelHeight;

    // Texture coordinates in the tile
    texCoords.x1 = lx - (layer.x * tileSize);
    if (layer.x) {
      texCoords.x1 += tileOverlap;
    } else {
      texCoords.x1 += border;
    }
    texCoords.y1 = ly - (layer.y * tileSize);
    if (layer.y) {
      texCoords.y1 += tileOverlap;
    } else {
      texCoords.y1 += border;
    }
    texCoords.x2 = texCoords.x1 + lw;
    texCoords.y2 = texCoords.y1 + lh;

    // Draw the quad!
    this.renderer.drawQuad(bounds, layer.tile.content, layer.opacity, texCoords);
  }
};

// An individual item in the scene that references a pyramid
var Item = function(pyramid) {
  this.pyramid = pyramid;
  // http://blogs.msdn.com/b/lutzg/archive/2009/10/05/exact-map-rendering.aspx
  this.blurFactor = 1;
  // Position in scene space
  this.bounds = {
    x: 0,
    y: 0,
    w: pyramid.width,
    h: pyramid.height
  };
};
// Setup the item for rendering
Item.prototype.prepare = function(tileCache, renderer) {
  this.tileCache = tileCache;
  this.renderer = renderer;
  this.tileStack = new TileStack(this.pyramid, renderer);

  // The viewport screen center x,y and scale
  this.viewportCenterX;
  this.viewportCenterY;
  this.viewportScale;
  // The desired level of detail
  this.desiredLevel;
  // The next level of detail (may == desiredLevel) for spatial blending
  this.nextLevel;
  // [0-1] blend weight between desiredLevel and nextLevel
  this.blendFactor;
  // The visible tile regions in each level of detail
  this.visibleRegions = new Array(this.pyramid.levels.length);
  for (var n = 0; n < this.visibleRegions.length; n++) {
    this.visibleRegions[n] = {
      l: 0,
      t: 0,
      r: 0,
      b: 0
    };
  }
};
// Draw an item to the screen
Item.prototype.draw = function(screenSize, viewport, viewportBounds) {
  // Get the scene and screen bounds of the item
  var sceneBounds = this.bounds;
  var screenBounds = {
    x: (sceneBounds.x * viewport.scale) - viewport.x,
    y: (sceneBounds.y * viewport.scale) - viewport.y,
    w: sceneBounds.w * viewport.scale,
    h: sceneBounds.h * viewport.scale
  };

  // See if the item is off the screen
  var offScreen =
    screenBounds.x > screenSize.w ||
    screenBounds.x + screenBounds.w < 0
    screenBounds.y > screenSize.h ||
    screenBounds.y + screenBounds.h < 0;
  if (offScreen) {
    return false;
  }

  this.viewportCenterX = screenSize.w / 2;
  this.viewportCenterY = screenSize.h / 2;
  this.viewportScale = viewport.scale;

  // Compute the level of detail and associated values
  var minLevel = this.pyramid.minLevel;
  var maxLevel = this.pyramid.maxLevel;
  var contentArea = this.pyramid.width * this.pyramid.height;
  var screenArea = screenBounds.w * screenBounds.h;
  screenArea /= (this.blurFactor * this.blurFactor);
  var lod = maxLevel - Math.log(contentArea / screenArea) / Math.log(4);
  this.desiredLevel = Math.max(minLevel, Math.min(maxLevel, Math.floor(lod)));
  this.nextLevel = Math.max(minLevel, Math.min(maxLevel, Math.ceil(lod)));
  this.blendFactor = this.nextLevel > this.desiredLevel ? lod - this.desiredLevel : 1;

  // Visible region in image space [0,0]-[1,1]
  var clipL = Math.max(0, Math.min(1, (viewportBounds.x - sceneBounds.x) / sceneBounds.w));
  var clipT = Math.max(0, Math.min(1, (viewportBounds.y - sceneBounds.y) / sceneBounds.h));
  var clipR = Math.max(clipL, Math.min(1, (viewportBounds.x + viewportBounds.w - sceneBounds.x) / sceneBounds.w));
  var clipB = Math.max(clipT, Math.min(1, (viewportBounds.y + viewportBounds.h - sceneBounds.y) / sceneBounds.h));

  // Compute the visible region, in tiles, for each level of detail
  var tileSize = this.pyramid.tileSize;
  for (var n = minLevel; n <= maxLevel; n++) {
    var levelInfo = this.pyramid.levels[n];
    var visibleRegion = this.visibleRegions[n];
    visibleRegion.l = Math.max(0, Math.min(levelInfo.tileWidth - 1,
        Math.floor(clipL * levelInfo.pixelWidth / tileSize)));
    visibleRegion.t = Math.max(0, Math.min(levelInfo.tileHeight - 1,
        Math.floor(clipT * levelInfo.pixelHeight / tileSize)));
    visibleRegion.r = Math.max(0, Math.min(levelInfo.tileWidth - 1,
        Math.floor(clipR * levelInfo.pixelWidth / tileSize)));
    visibleRegion.b = Math.max(0, Math.min(levelInfo.tileHeight - 1,
        Math.floor(clipB * levelInfo.pixelHeight / tileSize)));
  }

  // Recurse down the pyramid
  this.recurse(screenBounds, minLevel, 0, 0);
};
// Process a single tile in the pyramid and either continue walking down or draw it
Item.prototype.recurse = function(screenBounds, level, x, y) {
  // Compute the tile priority for foveating - basically level + distance from center
  // A lower priority value is a tile that should be fetched earlier
  var levelInfo = this.pyramid.levels[level];
  var scaledTileSize = Math.min(Math.max(levelInfo.pixelWidth, levelInfo.pixelHeight), this.pyramid.tileSize) *
      this.viewportScale * Math.pow(2, this.pyramid.maxLevel - level);
  var tileX = screenBounds.x + x * scaledTileSize + scaledTileSize / 2;
  var tileY = screenBounds.y + y * scaledTileSize + scaledTileSize / 2;
  var distanceToCenter = Math.floor(Math.sqrt(
      (tileX - this.viewportCenterX) * (tileX - this.viewportCenterX) +
      (tileY - this.viewportCenterY) * (tileY - this.viewportCenterY)));
  var priority = level * 4294967296 + Math.min(distanceToCenter, 4294967296);

  // Get the tile from the cache (or request it)
  var tile = this.tileCache.getTile(this.pyramid, level, x, y, priority);

  // Push the tile (if found) onto the tile stack
  var blendWeight = (level == this.nextLevel) ? this.blendFactor : 0.99;
  this.tileStack.push(level, x, y, tile, blendWeight, scaledTileSize);

  // If the tile is present, fully temporally blended, and we aren't at the bottom of the pyramid, keep walking
  if (tile && tile.opacity.value == 1 && level < this.nextLevel) {
    var nextLevelInfo = this.pyramid.levels[level + 1];
    if (nextLevelInfo.tileWidth == 1 && nextLevelInfo.tileHeight == 1) {
      // Easy case - single tile level
      this.recurse(screenBounds, level + 1, x, y);
    } else {
      // Recurse down into the 4 child tiles, but only if they are within the visible region
      // This is what culls the pyramid as we descend
      var visibleRegion = this.visibleRegions[level + 1];
      var cx = x * 2;
      var cy = y * 2;
      if (cx >= visibleRegion.l && cy >= visibleRegion.t &&
          cx <= visibleRegion.r && cy <= visibleRegion.b) {
        this.recurse(screenBounds, level + 1, cx, cy);
      }
      if (cx + 1 >= visibleRegion.l && cy >= visibleRegion.t &&
          cx + 1 <= visibleRegion.r && cy <= visibleRegion.b) {
        this.recurse(screenBounds, level + 1, cx + 1, cy);
      }
      if (cx >= visibleRegion.l && cy + 1 >= visibleRegion.t &&
          cx <= visibleRegion.r && cy + 1 <= visibleRegion.b) {
        this.recurse(screenBounds, level + 1, cx, cy + 1);
      }
      if (cx + 1 >= visibleRegion.l && cy + 1 >= visibleRegion.t &&
          cx + 1 <= visibleRegion.r && cy + 1 <= visibleRegion.b) {
        this.recurse(screenBounds, level + 1, cx + 1, cy + 1);
      }
    }
  } else {
    // No coverage in the pyramid? Draw the current stack!
    this.tileStack.emit(screenBounds);
  }
  this.tileStack.pop();
};

var DemoApp = function() {
  var self = this;
  this.tileCache = new TileCache();
  this.canvas = document.getElementById('displayCanvas');
  this.renderer = new CanvasRenderer(this.canvas);
  this.items = [];
  this.viewport = {
    x: 0,
    y: 0,
    scale: 1
  };

  this.dirty = true;
  this.requestId = null;
  this.boundUpdate = function(timestamp) {
    self.requestId = null;
    self.update(timestamp || Date.now());
  };

  var mouseDown = false;
  var lastMouseX = 0;
  var lastMouseY = 0;
  var startingScale = 1;
  function addMultiEventListeners(target, names, callback) {
    for (var n = 0; n < names.length; n++) {
      target.addEventListener(names[n], callback, false);
    }
  }
  addMultiEventListeners(this.canvas, ['mousedown'], function(e) {
    mouseDown = true;
    lastMouseX = e.pageX;
    lastMouseY = e.pageY;
    startingScale = self.viewport.scale;
    self.canvas.style.cursor = 'pointer';
    e.preventDefault();
  });
  addMultiEventListeners(this.canvas, ['mouseup', 'mouseout'], function(e) {
    mouseDown = false;
    self.canvas.style.cursor = '';
    e.preventDefault();
  });
  addMultiEventListeners(this.canvas, ['mousemove'], function(e) {
    if (mouseDown) {
      var dx = e.pageX - lastMouseX;
      var dy = e.pageY - lastMouseY;
      lastMouseX = e.pageX;
      lastMouseY = e.pageY;
      if (e.touches && e.touches.length > 1) {
        var newScale = e.scale * startingScale;
        self.zoomAroundPoint(e.pageX, e.pageY, newScale);
      } else {
        self.viewport.x -= dx;
        self.viewport.y -= dy;
      }
      self.requestAnimationFrame(true);
    }
    e.preventDefault();
  });
  addMultiEventListeners(this.canvas, ['mousewheel', 'DOMMouseScroll'], function(e) {
    var z = 0;
    if (e.wheelDelta !== undefined) {
      z = e.wheelDelta / 120;
    } else if (e.detail !== undefined) {
      z = -e.detail / 3;
    }
    var newScale = self.viewport.scale;
    if (z > 0) {
      newScale *= 1.5;
    } else {
      newScale /= 1.5;
    }
    self.zoomAroundPoint(e.pageX, e.pageY, newScale);
    e.preventDefault();
  });
  var panGesture = goog.events.gestures.attachPanGesture(this.canvas,
      function(gesture) {
        switch (gesture.getState()) {
          case goog.events.gestures.State.CHANGED:
            self.viewport.x -= gesture.getTranslationDeltaX();
            self.viewport.y -= gesture.getTranslationDeltaY();
            self.requestAnimationFrame();
            break;
        }
      });
  var pinchGesture = goog.events.gestures.attachPinchGesture(this.canvas,
      function(gesture) {
        switch (gesture.getState()) {
          case goog.events.gestures.State.BEGAN:
            startingScale = self.viewport.scale;
            break;
          case goog.events.gestures.State.CHANGED:
            self.zoomAroundPoint(
                gesture.getPageX(), gesture.getPageY(),
                startingScale * gesture.getScaling());
            break;
        }
      });
  goog.events.gestures.allowSimultaneousRecognition(panGesture, pinchGesture);

  function resize() {
    self.canvas.width = window.innerWidth;
    self.canvas.height = window.innerHeight;
    self.requestAnimationFrame(true);
  };
  resize();
  window.addEventListener('resize', resize, false);
  window.addEventListener('orientationchange', resize, false);
};
DemoApp.prototype.addItem = function(item) {
  item.prepare(this.tileCache, this.renderer);
  this.items.push(item);
};
DemoApp.prototype.update = function(timestamp) {
  var updating = this.dirty;
  this.dirty = false;
  this.renderer.clear();

  updating = this.tileCache.beginFrame(timestamp) || updating;

  var screenSize = {
    w: this.canvas.width,
    h: this.canvas.height
  };
  var viewportBounds = {
    x: this.viewport.x / this.viewport.scale,
    y: this.viewport.y / this.viewport.scale,
    w: screenSize.w / this.viewport.scale,
    h: screenSize.h / this.viewport.scale
  };
  for (var n = 0; n < this.items.length; n++) {
    var item = this.items[n];
    updating = item.draw(screenSize, this.viewport, viewportBounds) || updating;
  }

  updating = this.tileCache.endFrame() || updating;

  if (updating) {
    this.requestAnimationFrame();
  }
};
DemoApp.prototype.requestAnimationFrame = function(dirty) {
  if (dirty) {
    this.dirty = true;
  }
  if (this.requestId !== null) {
    return;
  }
  if (window.webkitRequestAnimationFrame) {
    this.requestId = window.webkitRequestAnimationFrame(this.boundUpdate, this.canvas);
  } else if (window.mozRequestAnimationFrame) {
    this.requestId = window.mozRequestAnimationFrame(this.boundUpdate);
  } else {
    this.requestId = window.setTimeout(this.boundUpdate, 16);
  }
};
DemoApp.prototype.zoomAroundPoint = function(x, y, scale) {
  var ox = (this.viewport.x + x) / this.viewport.scale;
  var oy = (this.viewport.y + y) / this.viewport.scale;
  var nx = (this.viewport.x + x) / scale;
  var ny = (this.viewport.y + y) / scale;
  this.viewport.x -= (nx - ox) * scale;
  this.viewport.y -= (ny - oy) * scale;
  this.viewport.scale = scale;
  this.requestAnimationFrame(true);
};

var demo;
function initDemo() {
  demo = new DemoApp();

  //var pyramid = new ImagePyramid(128 * 1024 * 1024, 128 * 1024 * 1024, 254, 1, 0);
  //var pyramid = new ImagePyramid(16 * 1024, 16 * 1024, 510, 1, 0);
  var pyramid = new ImagePyramid(2147483648, 2147483648, 256, 0, 0);
  //var pyramid = new ImagePyramid(16 * 1024, 16 * 1024, 256, 0, 0);
  var item = new Item(pyramid);
  demo.addItem(item);

  demo.viewport.scale = demo.canvas.width < demo.canvas.height ?
      demo.canvas.width / item.bounds.w :
      demo.canvas.height / item.bounds.h;

  demo.requestAnimationFrame(true);
}

function bias(value) {
  for (var n = 0; n < demo.items.length; n++) {
    demo.items[n].blurFactor = value;
  }
  demo.requestAnimationFrame(true);
}
