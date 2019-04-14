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

const WIDTH = cnvs.width = window.innerWidth
const W_HEIGHT = cnvs.height = window.innerHeight

/*
 * Leaves array [703], with the inital value of an island. This data takes up
 * more space than I want, but it's integral to the illusion.
 */
const LEAVES = [
  [
    // Island
    1,        // X
    W_HEIGHT - 115,  // Y
    1,        // Z
    -150,     // Vertex1 X
    0,        // Vertex1 Y
    0,        // Vertex1 X
    -15,      // Vertex1 Y
    150,      // Vertex1 X
    0,        // Vertex1 Y
    60, 9, 0
  ]
] // R, G, B


let TIME = 0  // wait a moment before shedding leaves
let BRANCHES = []  // branches [242]

let offsetX
let sheddingSpeed

/*
 * Create Tree (saving everything as angle/height/radius instead of X/Y/Z allows
 * us to save a trig operator every time we calculate the projection).
 */
const GenerateTree = function(angle, height, radius, depth, spacing) { // angle, y, radius, depth, spacing
    // create some leaves
    for(i = 2 * (depth > 3); i--;) {
      LEAVES.push(
        [
          angle + Math.random() / 9,
          height + Math.random() * 30 - 15,
          radius + Math.random() * 30 - 15,
          Math.random() * 40 - 20, Math.random() * 40 - 20,
          Math.random() * 40 - 20, Math.random() * 40 - 20,
          Math.random() * 40 - 20, Math.random() * 40 - 20,
          Math.random() * 40 * 5 + 40, Math.random() * 40,
          20
        ]
      ) // color
    }

    if(depth < 6)
        // child branches
        for(
            // Note that generating the offset here only happens once because
            // it's not part of the for-loop.
            BRANCHES.push(
              [
                angle,
                height,
                radius
              ],
              [
                angle += Math.random() * 2 - 1 + (depth == 2) * spacing,
                height -=  Math.random() * 60 + 20 - radius / 5,
                radius +=  Math.random() * 25 * spacing - 5,
                12 - depth * 2
              ]
            ),
            // but this stuff happens 3 times
            spacing = 3; spacing--;) {
              GenerateTree(angle, height, radius, depth + 1, spacing * 2)
            }
}

GenerateTree(9, W_HEIGHT - 80, 0, 1, 0)


/*
 * The rendering function is pretty straight forward, just long.
 * Compression works best when functions have the same declaration, so we just
 * copy the longest declaration and run with it. Additionally, math calls
 * (Math.sin, cos, random) get replaced more efficiently than re-mapping them.
 */
setInterval(
  function(angle, height, radius, depth, spacing) { // counter, unused
    /*
     * Time updates for controlling the wind, the sun, the rotation, etc
     */
    TIME += 0.01

    /*
     * Render Sky
     */
    ctx.fillStyle = ctx.createRadialGradient(720, TIME * 40 - 99, 1, 460, 460, 900)
    ctx.fillStyle.addColorStop(0.06, '#fda')
    ctx.fillStyle.addColorStop(0.07, '#fc4')
    ctx.fillStyle.addColorStop(0.2, '#e65')
    ctx.fillStyle.addColorStop(1, '#326')
    ctx.fillRect(0, 0, WIDTH, W_HEIGHT)

    /*
     * Render leaves behind the tree. Wild abuse of the comma operator abounds -
     * see tree rendering for details.
     *
     * To maintain the 3d illusion the leaves are drawn in two batches, one in
     * front, and one behind the tree. Depth sorting the leaves took too much
     * space, and repeating this code twice doesn't increase the file size
     * overly because it's identical and therefore highly compressable.
     */

    //703 = leaves array size
    for(spacing = 703; spacing--;) {
      Math.sin(LEAVES[spacing][0] + TIME) < 0 && (  //depth test
          // Original position
          angle = LEAVES[spacing][1],
          offsetX = Math.cos(LEAVES[spacing][0] + TIME) * LEAVES[spacing][2] + 275,  //offsetx

          // Leaf shedding (xspeed, difference/wait)
          // if we get to choose numbers, 99 is better than 100
          sheddingSpeed = (TIME * 2 - spacing % 300) * 115,

          // Leaf rotation
          offsetX += sheddingSpeed *= (sheddingSpeed > 0) * !!spacing,
          angle += sheddingSpeed * Math.sin(sheddingSpeed / 99) / 9,

          ctx.fillStyle = 'rgba('+~~LEAVES[spacing][9]+','+~~LEAVES[spacing][10]+','+~~LEAVES[spacing][11]+',0.8)',
          ctx.beginPath(),
          ctx.moveTo(LEAVES[spacing][3] + offsetX, LEAVES[spacing][4] * Math.cos(sheddingSpeed/=14) + angle),
          ctx.lineTo(LEAVES[spacing][5] + offsetX, LEAVES[spacing][6] * Math.cos(sheddingSpeed/=14) + angle),
          ctx.lineTo(LEAVES[spacing][7] + offsetX, LEAVES[spacing][8] * Math.cos(sheddingSpeed/=14) + angle),
          ctx.closePath(),
          ctx.fill()
      )
    }

    /*
     * Render Tree. Here we abuse the comma and ternary operators to replace an
     * if/else statement. As a bonus, we save several braces and semicolons
     * by nesting function calls in array access and other places that already have
     * brackets, so that we don't need to create our own pair.
     */
    for(spacing = 242; spacing--;) {
      if(spacing % 2) {
        ctx.lineWidth = BRANCHES[ctx.beginPath(), spacing][ctx.moveTo(Math.cos(BRANCHES[spacing][0] + TIME) * BRANCHES[spacing][2] + 275, BRANCHES[spacing][1]), 3]
      }
      else {
        ctx.lineTo(Math.cos(BRANCHES[spacing][0] + TIME) * BRANCHES[spacing][2] + 275, BRANCHES[spacing][1])
        ctx.stroke()
      }
      // s%2 ?
      //   a.lineWidth = B[a.beginPath(), s][a.moveTo(Math.cos(B[s][0]+t)*B[s][2]+275, B[s][1]), 3] :
      //   a.stroke(a.lineTo(Math.cos(B[s][0]+t)*B[s][2]+275, B[s][1]))
    }

    /*
     * Rendering leaves in front of the tree
     */

    //703 = leaves array size
    for(spacing = 703; spacing--;) {
      Math.sin(LEAVES[spacing][0] + TIME) > 0 && (  //depth test
          // Original position
          angle = LEAVES[spacing][1],
          offsetX = Math.cos(LEAVES[spacing][0] + TIME) * LEAVES[spacing][2] + 275,  //offsetx

          // Leaf shedding (xspeed, difference/wait)
          // if we get to choose numbers, 99 is better than 100
          sheddingSpeed = (TIME * 2 - spacing % 300) * 115,

          // Leaf rotation
          offsetX += sheddingSpeed *= (sheddingSpeed > 0) * !!spacing,
          angle += sheddingSpeed * Math.sin(sheddingSpeed / 99) / 9,

          ctx.fillStyle = 'rgba('+~~LEAVES[spacing][9]+','+~~LEAVES[spacing][10]+','+~~LEAVES[spacing][11]+',0.8)',
          ctx.beginPath(),
          ctx.moveTo(LEAVES[spacing][3] + offsetX, LEAVES[spacing][4] * Math.cos(sheddingSpeed/=14) + angle),
          ctx.lineTo(LEAVES[spacing][5] + offsetX, LEAVES[spacing][6] * Math.cos(sheddingSpeed/=14) + angle),
          ctx.lineTo(LEAVES[spacing][7] + offsetX, LEAVES[spacing][8] * Math.cos(sheddingSpeed/=14) + angle),
          ctx.closePath(),
          ctx.fill()
      )
    }

    /*
     * Render Text. We use the same colour as the background to increase
     * compresability, plus it makes the heart look as though it fades in.
     *
     * We have to specify a font family to set the size, but it doesn't
     * need to be valid ...
     *
     */
    ctx.fillStyle = '#e65'
    ctx.font='120px x'
    ctx.fillText('❦', 640, W_HEIGHT - 150)


    /*
     * Render Reflection
     */

    // 100 = water height
    for(height=120; height--;) {
      // getImageData
      // => 340 = elementheight - waterheight 900 = element.width
      ctx.putImageData(
        ctx.getImageData(0, W_HEIGHT - 120 - height + ~~(Math.sin(TIME * 9 + height / 8) * height / 5), WIDTH, 1 ),
        // putImageData
        ~~(Math.sin(TIME * 9 + height / 4) * height / 9), W_HEIGHT - 120 + height
      )
    }

    ctx.fillStyle = 'rgba(0,0,99,0.1)'
    ctx.fillRect(0, W_HEIGHT - 120, WIDTH, 120)  // magic numbers : element.height * 0.75, element.width, element.height * 0.25

  }, 50)
