const {
    Engine,
    Render,
    Runner,
    World,
    Bodies,
    Events,
    Composite
} = Matter;

const width = 800;
const height = 700;

const canvas = document.getElementById("game");
canvas.width = width;
canvas.height = height;

const engine = Engine.create();
const world = engine.world;

const render = Render.create({
    canvas,
    engine,
    options: {
        width,
        height,
        wireframes: false,
        background: "#f0f0f0"
    }
});

Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);

let score = 0;
const scoreElement = document.getElementById("score");

//
// 벽
//
World.add(world, [
    Bodies.rectangle(width / 2, height + 25, width, 50, { isStatic: true }),
    Bodies.rectangle(-25, height / 2, 50, height, { isStatic: true }),
    Bodies.rectangle(width + 25, height / 2, 50, height, { isStatic: true })
]);

//

const pegs = [];

for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {

        const peg = Bodies.circle(
            100 + col * 60 + (row % 2 ? 30 : 0),
            120 + row * 50,
            6,
            {
                isStatic: true,
                render: {
                    fillStyle: "#222222",
                    strokeStyle: "#222222"
                }
            }
        );

        pegs.push(peg);
    }
}

World.add(world, pegs);

//

const slotValues = [
    100,
    50,
    20,
    10,
    20,
    50,
    100
];

const dividerColors = [
    "#ff0000",
    "#ff7f00",
    "#ffff00",
    "#00aa00",
    "#0066ff",
    "#000080",
    "#8000ff",
    "#ff69b4"
];

const slotWidth = width / slotValues.length;

//

const pegSpacing = 50;

for (let i = 0; i <= slotValues.length; i++) {

    const x = i * slotWidth;

    const divider = Bodies.rectangle(
        x,
        height - 70 + pegSpacing,   // ↓ 아래로 이동
        4,
        120,
        {
            isStatic: true,
            render: {
                fillStyle: dividerColors[
                    Math.min(i, dividerColors.length - 1)
                ]
            }
        }
    );

    World.add(world, divider);

    const cap = Bodies.circle(
        x,
        height - 130 + pegSpacing,   // ↓ 아래로 이동
        7,
        {
            isStatic: true,
            render: {
                fillStyle: dividerColors[
                    Math.min(i, dividerColors.length - 1)
                ]
            }
        }
    );

    World.add(world, cap);
}

//

function createStarBall() {

    const x = width / 2 + (Math.random() * 100 - 50);

    const starVertices = [
        { x: 0, y: -12 },
        { x: 3, y: -4 },
        { x: 12, y: -4 },
        { x: 5, y: 2 },
        { x: 8, y: 11 },
        { x: 0, y: 6 },
        { x: -8, y: 11 },
        { x: -5, y: 2 },
        { x: -12, y: -4 },
        { x: -3, y: -4 }
    ];

    const star = Bodies.fromVertices(
        x,
        40,
        [starVertices],
        {
            restitution: 0.8,
            friction: 0,
            frictionAir: 0.01,
            render: {
                fillStyle: "#FFD700",
                strokeStyle: "#D4AF37",
                lineWidth: 1
            }
        },
        true
    );

    star.label = "ball";

    World.add(world, star);
}

//

document
    .getElementById("dropBall")
    .addEventListener("click", createStarBall);

//

Events.on(engine, "afterUpdate", () => {

    const bodies = Composite.allBodies(world);

    bodies.forEach(body => {

        if (
            body.label === "ball" &&
            body.position.y > height - 90
        ) {

            const slotIndex = Math.max(
                0,
                Math.min(
                    slotValues.length - 1,
                    Math.floor(body.position.x / slotWidth)
                )
            );

            score += slotValues[slotIndex];
            scoreElement.textContent = score;

            World.remove(world, body);
        }
    });
});

//

Events.on(render, "afterRender", () => {

    const ctx = render.context;

    ctx.save();
    ctx.fillStyle = "#000";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";

    for (let i = 0; i < slotValues.length; i++) {

        const x = i * slotWidth + slotWidth / 2;
        ctx.fillText(slotValues[i], x, height - 20);
    }

    ctx.restore();
});
