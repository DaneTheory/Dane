// Initialize first
const CANVAS_NODE = document.createElement('canvas')
CANVAS_NODE.id = 'scene'
CANVAS_NODE.classList.add('autumn')
document.body.prepend(CANVAS_NODE)

const W_WIDTH = window.innerWidth
const W_HEIGHT = window.innerHeight

const CANVAS_DOM = document.getElementById('scene')



// CONSTANTS
let C_WIDTH = CANVAS_DOM.width = W_WIDTH
let C_HEIGHT = CANVAS_DOM.height = W_HEIGHT

const C_CONTEXT = CANVAS_DOM.getContext('2d', { alpha: false })
// C_CONTEXT.globalAlpha = 1                                   // ALT: 0.0 => 1
C_CONTEXT.globalCompositeOperation = 'source-over'          // ALT: 'destination-over'
C_CONTEXT.imageSmoothingEnabled = true                      // ALT: false
C_CONTEXT.imageSmoothingQuality = 'high'                    // ALT: 'low', 'medium'
C_CONTEXT.shadowBlur = 4
C_CONTEXT.shadowColor = 'rgba(30, 30, 30, 0.4)'
C_CONTEXT.shadowOffsetX = 1
C_CONTEXT.shadowOffsetY = 2

let timeStartOffset = 0
let timeDilationOffset = 0.002
let islandConfig = {
  iDunno:               0,
  iHeight:              C_HEIGHT - 118,
  iZed:                 0,
  iOffsetRLen:          -150,
  iOffsetZedBackRLen:   0,
  iOffsetZedFrontLen:   0,
  iOffsetTip:           -10,
  iOffsetLLen:          150,
  iOffsetZedBackLLen:   0,
  iRed:                 0,
  iGreen:               0,
  iBlue:                0
}
let customText = '▲'
let angleDisplacement = 1
let yAxisOffset = 99
let radiusOffset = 10
let depthOffset = 1
let spacingOffset = 0.05
let globalTreeOffsetX = 340

const TIME_START = timeStartOffset
const TIME_DILATION = timeDilationOffset
const SCENE_LEAVES = [
  [...Object.values(islandConfig)]
]
const SCENE_BRANCHES = []
const SCENE_TEXT = customText
const TREE_ANGLE_DISPLACEMENT = angleDisplacement
const TREE_Y_AXIS_PLACEMENT = C_HEIGHT - yAxisOffset
const TREE_RADIUS_DISPLACEMENT = radiusOffset
const TREE_DEPTH_DISPLACEMENT = depthOffset
const TREE_SPACING_DISPLACEMENT = spacingOffset
const GLOBAL_TREE_OFFSET_X = globalTreeOffsetX

const CONSTANTS = {
  cWidth:      C_WIDTH,
  cHeight:     C_HEIGHT,
  cContext:    C_CONTEXT,
  tStart:      TIME_START,
  tDilation:   TIME_DILATION,
  sLeaves:     SCENE_LEAVES,
  sBranches:   SCENE_BRANCHES,
  sText:       SCENE_TEXT,
  treeA:       TREE_ANGLE_DISPLACEMENT,
  treeY:       TREE_Y_AXIS_PLACEMENT,
  treeR:       TREE_RADIUS_DISPLACEMENT,
  treeD:       TREE_DEPTH_DISPLACEMENT,
  treeS:       TREE_SPACING_DISPLACEMENT,
  gTreeSetX:   GLOBAL_TREE_OFFSET_X
}

// ELEMENTS FOR RENDER

// Sky
const RenderSky = (width, height, context, timer) => {
  let x0,y0,r0,x1,y1,r1
  timer = timer/1.5
  x0 = timer * 400 + 250
  y0 = -timer * 360 + 950
  r0 = timer / 1.05 + 80
  x1 = timer * 5 + 800
  y1 = 600 - timer * 100
  r1 = 800 + timer * 600
  context.fillStyle = context.createRadialGradient(x0, y0, r0, x1, y1, r1)
  context.fillStyle.addColorStop(0.07, '#fda')
  context.fillStyle.addColorStop(0.1, '#fc4')
  context.fillStyle.addColorStop(0.4, '#e65')
  context.fillStyle.addColorStop(1, '#326')
  context.fillRect(0, 0, width, height)
}

// Leaves - (back)
const RenderLeavesBack = (context, timer, leaves, globalXOffset) => {
  let offsetX
  let sheddingSpeed

  for(space = 703; space--;) {
    Math.sin(leaves[space][0] + timer) < 0 && (  //depth test
        // Original position
        angle = leaves[space][1],
        offsetX = Math.cos(leaves[space][0] + timer) * leaves[space][2] + globalXOffset,  //offsetx

        // Leaf shedding (xspeed, difference/wait)
        // if we get to choose numbers, 99 is better than 100
        sheddingSpeed = (timer * 9 - space % 320) * 105,

        // Leaf rotation
        offsetX += sheddingSpeed *= (sheddingSpeed > 0) * !!space,
        angle += sheddingSpeed * Math.sin(sheddingSpeed / 105) / 9,

        context.save(),
        context.fillStyle = `rgba(${+~~leaves[space][9]},${+~~leaves[space][10]},${+~~leaves[space][11]}, 0.75)`,
        context.beginPath(),
        context.moveTo(leaves[space][3] + offsetX, leaves[space][4] * Math.cos(sheddingSpeed/=14) + angle),
        context.lineTo(leaves[space][5] + offsetX, leaves[space][6] * Math.cos(sheddingSpeed/=14) + angle),
        context.lineTo(leaves[space][7] + offsetX, leaves[space][8] * Math.cos(sheddingSpeed/=14) + angle),
        context.closePath(),
        context.fill(),
        context.restore()
    )
  }
}

// Leaves - (front)
const RenderLeavesFront = (context, timer, leaves, globalXOffset) => {
  let offsetX
  let sheddingSpeed

  for(space = 703; space--;) {

    Math.sin(leaves[space][0] + timer) > 0 && (  //depth test
        // Original position
        angle = leaves[space][1],
        offsetX = Math.cos(leaves[space][0] + timer) * leaves[space][2] + globalXOffset,  //offsetx

        // Leaf shedding (xspeed, difference/wait)
        // if we get to choose numbers, 99 is better than 100
        sheddingSpeed = (timer * 6 - space % 280) * 80,

        // Leaf rotation
        offsetX += sheddingSpeed *= (sheddingSpeed > 0) * !!space,
        angle += sheddingSpeed * Math.sin(sheddingSpeed / 80) / 6,

        context.save(),
        context.fillStyle = `rgba(${+~~leaves[space][9]},${+~~leaves[space][10]},${+~~leaves[space][11]}, 0.65)`,
        context.beginPath(),
        context.moveTo(leaves[space][3] + offsetX, leaves[space][4] * Math.cos(sheddingSpeed/=14) + angle),
        context.lineTo(leaves[space][5] + offsetX, leaves[space][6] * Math.cos(sheddingSpeed/=14) + angle),
        context.lineTo(leaves[space][7] + offsetX, leaves[space][8] * Math.cos(sheddingSpeed/=14) + angle),
        context.closePath(),
        context.fill(),
        context.restore()
    )
  }

}

// Tree
const RenderTree = (context, timer, branches, globalXOffset) => {
  for(space = 242; space--;) {
    if(space % 2) {
      context.lineWidth = branches[context.beginPath(), space][
        context.moveTo(Math.cos(branches[space][0] + timer) * branches[space][2] + globalXOffset,
        branches[space][1]),
        3
      ]
    }
    else {
      context.save()
      context.lineTo(Math.cos(branches[space][0] + timer) * branches[space][2] + globalXOffset, branches[space][1])
      context.stroke()
      context.restore()
    }
  }
}

// Icon
const RenderIcon = (height, context, text) => {
  context.save()
  context.fillStyle = 'rgba(0,0,0,0.9)'
  context.font='320px x'
  context.fillText(text, 603, height - 140)
  context.restore()
}

// Text
const RenderText = (height, context, text) => {
  context.save()
  context.fillStyle = 'rgba(235,235,235,1)'
  context.font='56px x'
  context.fillText(text, 400, height - 200)
  context.restore()
}

// Water - (with reflection)
const RenderWater = (width, height, context, timer) => {
  for(variableHeight = 120; variableHeight--;) {
    // getImageData
    // => 340 = elementheight - waterheight 900 = element.width
    context.save()
    context.putImageData(
      context.getImageData(0, height - 120 - variableHeight + ~~(Math.sin(timer * 9 + variableHeight / 8) * variableHeight / 5), width, 1 ),
      ~~(Math.sin(timer * 9 + variableHeight / 4) * variableHeight / 9), height - 120 + variableHeight
    )
    context.restore()
  }
  context.save()
  context.fillStyle = 'rgba(0,0,99,0.3)'
  context.fillRect(0, height - 120, width, 120)  // magic numbers : element.height * 0.75, element.width, element.height * 0.25
  context.restore()
}




const createInitialLeaves = (angle, height, radius, leaves) => {
  let intialLeaves = [
    angle + Math.random() / 9,
    height + Math.random() * 30 - 15,
    radius + Math.random() * 30 - 15,
    Math.random() * 40 - 20, Math.random() * 40 - 20,
    Math.random() * 40 - 20, Math.random() * 40 - 20,
    Math.random() * 40 - 20, Math.random() * 40 - 20,
    Math.random() * 40 * 5 + 40, Math.random() * 40,
    20
  ]
  leaves.push(intialLeaves)
}

const DefineInitialSceneScope = (angle, height, radius, depth, space, leaves, branches) => {
  let counter = 2
  let leavesDepth = depth > 3
  let branchesDepth = depth < 6

  while(counter * leavesDepth) {
    createInitialLeaves(angle, height, radius, leaves)
    counter--
  }

  if(depth < 6) {
    let initialBranch = [angle, height, radius]
    let newBranch = [
      angle += Math.random() * 2 - 1 + (depth == 2) * space,
      height -=  Math.random() * 40 + 20 - radius / 10,
      radius +=  Math.random() * 20 * space - 5,
      8 - depth * 1.1
    ]
    for(branches.push(initialBranch, newBranch), space = 3; space--;) DefineInitialSceneScope(angle, height, radius, depth + 1, space * 2, leaves, branches)
  }
}

const RenderScene = (width, height, context, timer, leaves, branches, text, globalXOffset) => {
  context.save()
  RenderSky(width, height, context, timer)    // Render sky
  RenderIcon(height, context, text)           // Render text
  RenderTree(context, timer, branches, globalXOffset)        // Render tree
  RenderLeavesBack(context, timer, leaves, globalXOffset)    // Rendering leaves behind the tree
  RenderText(height, context, 'BRANDEN DANE')
  RenderLeavesFront(context, timer, leaves, globalXOffset)   // Rendering leaves in front of the tree
  RenderWater(width, height, context, timer)  // Render water with reflection
  context.restore()
}


let startTime
const SceneTimer = timeDilation => {
  startTime += timeDilation
  return startTime
}

const InitScene = (canvasWidth, canvasHeight, canvasContext, timeStart, timeDilation, leaves, branches, sceneText, treeAngleDisplacement, treeYAxisPlacement, treeRadiusDisplacement, treeDepthDisplacement, treeSpacingDisplacement, globalTreeOffsetX) =>  {
  canvasContext.clearRect(0, 0, canvasWidth, canvasHeight)
  let lastTimestamp = 0
  let maxFPS = 60
  let timestep = 1000/maxFPS
  // Sets initial scene render settings for use during scene animation
  DefineInitialSceneScope(treeAngleDisplacement, treeYAxisPlacement, treeRadiusDisplacement, treeDepthDisplacement, treeSpacingDisplacement, leaves, branches)
  startTime = timeStart
  const AnimateScene = (timestamp) => {
    requestAnimationFrame(AnimateScene)
    if(timestamp - lastTimestamp < timestep) return
    lastTimestamp = timestamp
    let timer = SceneTimer(timeDilation)
    RenderScene(canvasWidth, canvasHeight, canvasContext, timer, leaves, branches, sceneText, globalTreeOffsetX)
  }
  requestAnimationFrame(AnimateScene)
}


const {
  cWidth,
  cHeight,
  cContext,
  tStart,
  tDilation,
  sLeaves,
  sBranches,
  sText,
  treeA,
  treeY,
  treeR,
  treeD,
  treeS,
  gTreeSetX
} = CONSTANTS

InitScene(cWidth, cHeight, cContext, tStart, tDilation, sLeaves, sBranches, sText, treeA, treeY, treeR, treeD, treeS, gTreeSetX)  // Initialize and run scene
