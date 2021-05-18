const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const canvasBounding = canvas.getBoundingClientRect();
const offsetX = canvasBounding.left;
const offsetY = canvasBounding.top;
const WIDTH = canvasBounding.width;
const HEIGHT = canvasBounding.height;

let startX;
let startY;

const tools = {
  select: {
    selected: true,
  },
  rectangle: {
    selected: false,
  },
  circle: {
    selected: false,
  },
};

const shapes = [
  {
    x: 10,
    y: 80,
    width: 80,
    height: 40,
    fill: "green",
    type: "rectangle",
    isMoving: false,
    isSelected: false,
  },
  {
    x: 100,
    y: 80,
    width: 60,
    height: 40,
    fill: "red",
    type: "rectangle",
    isMoving: false,
    isSelected: false,
  },
  {
    x: 180,
    y: 80,
    width: 60,
    height: 40,
    fill: "orange",
    type: "rectangle",
    isMoving: false,
    isSelected: false,
  },
  {
    x: 260,
    y: 80,
    width: 60,
    height: 40,
    fill: "red",
    type: "rectangle",
    isMoving: false,
    isSelected: false,
  },
];

draw();
let mouseIsDown = false;
canvas.onmousemove = mouseMove;
canvas.onmousedown = mouseDown;
canvas.onmouseup = mouseUp;
canvas.oncontextmenu = showContextMenu;

document.addEventListener("keyup", (e) => {
  console.log(e);
  if (e.code === "Space") {
    for (const s in shapes) {
      if (shapes[s].isSelected) {
        shapes[s].fill = shapes[s].fill !== "blue" ? "red" : "blue";
      }
    }
    draw();
  }
});

function showContextMenu(e) {
  e.preventDefault();
  console.log(e);
}
function mouseDown(e) {
  e.preventDefault();
  const mx = parseInt(e.clientX - offsetX);
  const my = parseInt(e.clientY - offsetY);
  mouseIsDown = true;

  for (let x in shapes) {
    const shape = shapes[x];
    if (
      mx > shape.x &&
      mx < shape.x + shape.width &&
      my > shape.y &&
      my < shape.y + shape.height
    ) {
      shape.isMoving = true;
      shape.isSelected = true;
    } else {
      shape.isSelected = false;
    }
  }
}

function mouseUp(e) {
  e.preventDefault();
  e.stopPropagation();
  mouseIsDown = false;
  for (const x in shapes) {
    shapes[x].isMoving = false;
  }
}

function mouseMove(e) {
  e.preventDefault();
  e.stopPropagation();

  const mx = parseInt(e.clientX - offsetX);
  const my = parseInt(e.clientY - offsetY);
  const dx = e.movementX;
  const dy = e.movementY;
  if (mouseIsDown) {
    for (let x in shapes) {
      const shape = shapes[x];
      if (shape.isMoving) {
        shape.x += dx;
        shape.y += dy;
      }
    }
  }
  draw();
}

function clear() {
  context.clearRect(0, 0, WIDTH, HEIGHT);
}

function draw() {
  clear();
  for (const x in shapes) {
    const shape = shapes[x];
    context.fillStyle = shape.fill;
    context.fillRect(shape.x, shape.y, shape.width, shape.height);
    context.font = "10px Arial";
    context.fillText(shape.isSelected, shape.x + shape.width, shape.y);
  }
}
