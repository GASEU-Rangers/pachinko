const {
    Engine,
    Render,
    Runner,
    World,
    Bodies,
    Events
} = Matter;

const canvas = document.getElementById("game");

const width = 800;
const height = 700;

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
        background: "#1d1d1d"
    }
});

Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);

let score = 0;
const scoreElement = document.getElementById("score");

// 벽
const walls = [
    Bodies.rectangle(width / 2, height + 25, width, 50, { isStatic: true }),
    Bodies.rectangle(-25, height / 2, 50, height, { isStatic: true }),
    Bodies.rectangle(width + 25, height / 2, 50, height, { isStatic: true })
];

World.add(world, walls);

// 핀 생성
const pegs = [];

for (let row = 0; row < 10; row++) {
    const cols = 10;

    for (let col = 0; col < cols; col++) {
        const x =
            100 +
            col * 60 +
            (row % 2 ? 30 : 0);

        const y = 120 + row * 50;

        const peg = Bodies.circle(x, y, 6, {
            isStatic: true,
            render: {
                fillStyle: "#ffffff"
            }
        });

        pegs.push(peg);
    }
}

World.add(world, pegs);

// 점수 칸
const slots = [];
const slotValues = [100, 50, 20, 10, 20, 50, 100];

const slotWidth = width / slotValues.length;

for (let i = 0; i < slotValues.length; i++) {

    const divider = Bodies.rectangle(
        i * slotWidth,
        height - 80,
        8,
        160,
        {
            isStatic: true,
            render: {
                fillStyle: "#00ff99"
            }
        }
    );

    slots.push({
        x: i * slotWidth,
        value: slotValues[i]
    });

    World.add(world, divider);
}

// 마지막 칸 벽
World.add(
    world,
    Bodies.rectangle(
        width,
        height - 80,
        8,
        160,
        {
            isStatic: true
        }
    )
);

// 구슬 발사
document.getElementById("dropBall").addEventListener("click", () => {

    const ball = Bodies.circle(
        width / 2 + (Math.random() * 100 - 50),
        40,
        10,
        {
            restitution: 0.6,
            friction: 0.001,
            render: {
                fillStyle: "#ffd700"
            }
        }
    );

    ball.label = "ball";

    World.add(world, ball);
});

// 점수 판정
Events.on(engine, "afterUpdate", () => {

    const bodies = Matter.Composite.allBodies(world);

    bodies.forEach(body => {

        if (
            body.label === "ball" &&
            body.position.y > height - 100
        ) {

            const slotIndex = Math.min(
                slotValues.length - 1,
                Math.floor(body.position.x / slotWidth)
            );

            score += slotValues[slotIndex];
            scoreElement.textContent = score;

            World.remove(world, body);
        }
    });
});
