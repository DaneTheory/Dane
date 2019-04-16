/*
 * List of 1-letter variables
 *
 * a context
 * b body
 * c element
 * h canvas height
 * l function parameter
 * p   "
 * r   "
 * s local temporary variable
 * t time/counter
 * u local temporary variable
 * w canvas width
 * y function parameter
 *
 * B branches array
 * G generate branch (1st) / render loop (2nd)
 * L leaves array
 */


const cnvs = document.getElementById('c')
const ctx = cnvs.getContext('2d')
const W_WIDTH = cnvs.width = window.innerWidth
const W_HEIGHT = cnvs.height = window.innerHeight


// const initialTreeRenderConfig = {
//   angle: 9,
//   height: W_HEIGHT - 80,
//   radius: 0,
//   depth: 1,
//   spacing: 0,
// }

/*
 * Leaves array [703], with the inital value of an island. This data takes up
 * more space than I want, but it's integral to the illusion.
 */
const LEAVES = [
  [
    1,
    W_HEIGHT - 115,
    1,       //X, Y, Z
    -150,
    0,     //vertex1 X, vertex1 Y
    0,
    -15,      //vertex1 X, vertex1 Y
    150,
    0,      //vertex1 X, vertex1 Y
    60, 9, 0
  ]
]; // R, G, B


let TIME = 0  // wait a moment before shedding leaves
let BRANCHES = []  // branches [242]

let offsetX
let sheddingSpeed

const RenderSky = (context, time, width, height) => {
  context.fillStyle = context.createRadialGradient(720, time * 40 - 99, 1, 460, 460, 900)
  context.fillStyle.addColorStop(0.06, '#fda')
  context.fillStyle.addColorStop(0.07, '#fc4')
  context.fillStyle.addColorStop(0.2, '#e65')
  context.fillStyle.addColorStop(1, '#326')
  context.fillRect(0, 0, width, height)
}

const RenderLeavesBack = (space, leavesArr, time, currAngle) => {
  for(space = 703; space--;) {
    Math.sin(leavesArr[space][0] + time) < 0 && (  //depth test
        // Original position
        currAngle = leavesArr[space][1],
        offsetX = Math.cos(leavesArr[space][0] + time) * leavesArr[space][2] + 275,  //offsetx

        // Leaf shedding (xspeed, difference/wait)
        // if we get to choose numbers, 99 is better than 100
        sheddingSpeed = (time * 9 - space % 300) * 99,

        // Leaf rotation
        offsetX += sheddingSpeed *= (sheddingSpeed > 0) * !!space,
        currAngle += sheddingSpeed * Math.sin(sheddingSpeed / 99) / 9,

        ctx.fillStyle = 'rgba('+~~leavesArr[space][9]+','+~~leavesArr[space][10]+','+~~leavesArr[space][11]+',0.8)',
        ctx.beginPath(),
        ctx.moveTo(leavesArr[space][3] + offsetX, leavesArr[space][4] * Math.cos(sheddingSpeed/=14) + currAngle),
        ctx.lineTo(leavesArr[space][5] + offsetX, leavesArr[space][6] * Math.cos(sheddingSpeed/=14) + currAngle),
        ctx.lineTo(leavesArr[space][7] + offsetX, leavesArr[space][8] * Math.cos(sheddingSpeed/=14) + currAngle),
        ctx.closePath(),
        ctx.fill()
    )
  }
}

const RenderLeavesFront = (space, leavesArr, time, currAngle) => {
  for(space = 703; space--;) {
    Math.sin(leavesArr[space][0] + time) > 0 && (  //depth test
        // Original position
        currAngle = leavesArr[space][1],
        offsetX = Math.cos(leavesArr[space][0] + time) * leavesArr[space][2] + 275,  //offsetx

        // Leaf shedding (xspeed, difference/wait)
        // if we get to choose numbers, 99 is better than 100
        sheddingSpeed = (time * 9 - space % 300) * 99,

        // Leaf rotation
        offsetX += sheddingSpeed *= (sheddingSpeed > 0) * !!space,
        currAngle += sheddingSpeed * Math.sin(sheddingSpeed / 99) / 9,

        ctx.fillStyle = 'rgba('+~~leavesArr[space][9]+','+~~leavesArr[space][10]+','+~~leavesArr[space][11]+',0.8)',
        ctx.beginPath(),
        ctx.moveTo(leavesArr[space][3] + offsetX, leavesArr[space][4] * Math.cos(sheddingSpeed/=14) + currAngle),
        ctx.lineTo(leavesArr[space][5] + offsetX, leavesArr[space][6] * Math.cos(sheddingSpeed/=14) + currAngle),
        ctx.lineTo(leavesArr[space][7] + offsetX, leavesArr[space][8] * Math.cos(sheddingSpeed/=14) + currAngle),
        ctx.closePath(),
        ctx.fill()
    )
  }
}

const RenderTree = (space, context, branchesArr, time) => {
  for(space = 242; space--;) {
    if(space % 2) {
      context.lineWidth = branchesArr[context.beginPath(), space][
        context.moveTo(Math.cos(branchesArr[space][0] + time) * branchesArr[space][2] + 275,
        branchesArr[space][1]),
        3
      ]
    }
    else {
      context.lineTo(Math.cos(branchesArr[space][0] + time) * branchesArr[space][2] + 275, branchesArr[space][1])
      context.stroke()
    }
  }
}

const RenderText = (context, txt, hght) => {
  context.fillStyle = '#e65'
  context.font='120px x'
  context.fillText(txt, 640, hght - 150)
}

const RenderWater = (variableHeight, windowHeight, windowWidth, time) => {
  for(variableHeight = 120; variableHeight--;) {
    // getImageData
    // => 340 = elementheight - waterheight 900 = element.width
    ctx.putImageData(
      ctx.getImageData(0, windowHeight - 120 - variableHeight + ~~(Math.sin(time * 9 + variableHeight / 8) * variableHeight / 5), windowWidth, 1 ),
      // putImageData
      ~~(Math.sin(time * 9 + variableHeight / 4) * variableHeight / 9), windowHeight - 120 + variableHeight
    )
  }
  ctx.fillStyle = 'rgba(0,0,99,0.1)'
  ctx.fillRect(0, windowHeight - 120, windowWidth, 120)  // magic numbers : element.height * 0.75, element.width, element.height * 0.25
}


/*
 * Create Tree (saving everything as angle/height/radius instead of X/Y/Z allows
 * us to save a trig operator every time we calculate the projection).
 */

// class BaseTree {
//   constructor(angle, height, radius, depth, spacing) {
//     this.angle = angle
//     this.height = height
//     this.radius = radius
//     this.depth = depth
//     this.spacing = spacing
//
//     this.counter = 2
//     this.leavesDepth = 3
//     this.branchesDepth = 6
//
//     this.leavesCondition = this.counter * (depth > this.leavesDepth)
//     this.branchesCondition = depth > this.branchesDepth
//
//     this.depthModifier = depth + 1
//     this.spacingModifier = spacing * 2
//   }
// }
//
// class Tree extends BaseTree {
//   constructor() {
//     super(angle, height, radius, depth, spacing)
//
//     // let {
//     //   // angle,
//     //   // height,
//     //   // radius,
//     //   depth,
//     //   spacing
//     // } = props
//
//     // this.state = {...props}
//
//     // console.log(props);
//
//     // this.angle = angle
//     // this.height = height
//     // this.radius = radius
//     // this.depth = depth
//     // this.spacing = spacing
//
//     // this.counter = 2
//     // this.leavesDepth = 3
//     // this.branchesDepth = 6
//     //
//     // this.leavesCondition = this.counter * (depth > this.leavesDepth)
//     // this.branchesCondition = depth > this.branchesDepth
//     //
//     // this.depthModifier = depth + 1
//     // this.spacingModifier = spacing * 2
//
//     // console.log(this)
//
//     // this.hello = 'hello world'
//   }
//
//   _createLeaves() {
//     while(this.leavesCondition) {
//       LEAVES.push([
//         this.angle + Math.random() / 9,
//         this.height + Math.random() * 30 - 15,
//         this.radius + Math.random() * 30 - 15,
//         Math.random() * 40 - 20, Math.random() * 40 - 20,
//         Math.random() * 40 - 20, Math.random() * 40 - 20,
//         Math.random() * 40 - 20, Math.random() * 40 - 20,
//         Math.random() * 40 * 5 + 40, Math.random() * 40,
//         20
//       ])
//       this.counter--
//     }
//   }
//
//   _createBranches() {
//     if(this.branchesCondition) {
//       for(BRANCHES.push([
//         this.angle,
//         this.height,
//         this.radius
//       ], [
//         this.angle += Math.random() * 2 - 1 + (this.depth == 2) * this.spacing,
//         this.height -=  Math.random() * 60 + 20 - this.radius / 5,
//         this.radius +=  Math.random() * 25 * this.spacing - 5, 12 - this.depth * 2
//       ]),
//       this.spacing = 3; this.spacing--;) {
//         // let depthModifier = this.depth + 1
//         // let spacingModifier = this.spacing * 2
//         // GenerateTree(this.angle, this.height, this.radius, depthModifier, spacingModifier)
//         this.create()
//       }
//     }
//   }
//
//   create() {
//     this._createLeaves()
//     this._createBranches()
//   }
// }

// const tree = new Tree({...initialTreeRenderConfig})

// let {
//   angle,
//   height,
//   radius,
//   depth,
//   spacing
// } = initialTreeRenderConfig

// const tree = new Tree(angle, height, radius, depth, spacing)
//
// console.log(tree);

const GenerateTree = (angle, height, radius, depth, spacing) => {
  let counter = 2
  let leavesDepth = depth > 3
  let branchesDepth = depth < 6
  let depthModifier = depth + 1

  while(counter * leavesDepth) {
    LEAVES.push([
      angle + Math.random() / 9,
      height + Math.random() * 30 - 15,
      radius + Math.random() * 30 - 15,
      Math.random() * 40 - 20, Math.random() * 40 - 20,
      Math.random() * 40 - 20, Math.random() * 40 - 20,
      Math.random() * 40 - 20, Math.random() * 40 - 20,
      Math.random() * 40 * 5 + 40, Math.random() * 40,
      20
    ])
    counter--
  }

  if(branchesDepth) {
    for(BRANCHES.push([
      angle,
      height,
      radius
    ], [
      angle += Math.random() * 2 - 1 + (depth == 2) * spacing,
      height -=  Math.random() * 60 + 20 - radius / 5,
      radius +=  Math.random() * 25 * spacing - 5, 12 - depth * 2
    ]),
    spacing = 3; spacing--;) {
      GenerateTree(angle, height, radius, depth + 1, spacing * 2)
    }
  }

}

GenerateTree(9, W_HEIGHT - 80, 0, 1, 0)

setInterval((angle, height, radius, depth, spacing) => {
  // Time dilation
  TIME += 0.003
  // Render sky
  RenderSky(ctx, TIME, W_WIDTH, W_HEIGHT)
  // Rendering leaves behind the tree
  RenderLeavesBack(spacing, LEAVES, TIME, angle)
  // Render tree
  RenderTree(spacing, ctx, BRANCHES, TIME)
  // Rendering leaves in front of the tree
  RenderLeavesFront(spacing, LEAVES, TIME, angle)
  // Render text
  RenderText(ctx, '❦', W_HEIGHT)
  //Render water with reflection
  RenderWater(height, W_HEIGHT, W_WIDTH, TIME)
}, 50)
