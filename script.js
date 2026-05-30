const {
    Engine,
    Render,
    Runner,
    World,
    Bodies,
    Events,
    Composite
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
        background: "#ffffff"
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
    Bodies.rectangle(width / 2, height + 25, width, 50, {
        isStatic: true
    }),

    Bodies.rectangle(-25, height / 2, 50, height, {
        isStatic: true
    }),

    Bodies.rectangle(width + 25, height / 2, 50, height, {
        isStatic: true
    })
]);

//
// 핀 생성
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
                    fillStyle: "#000000"
                }
            }
        );

        pegs.push(peg);
    }
}

World.add(world, pegs);

//
// 점수칸
//
const slotValues = [
    500,
    200,
    100,
    50,
    100,
    200,
    500
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
// 칸막이
//
for (let i = 0; i < slotValues.length; i++) {

    const x = i * slotWidth;

    const divider = Bodies.rectangle(
        x,
        height - 50,
        4,
        80,
        {
            isStatic: true,
            render: {
                fillStyle: dividerColors[i]
            }
        }
    );

    World.add(world, divider);
}

//
// 마지막 벽
//
World.add(
    world,
    Bodies.rectangle(
        width,
        height - 50,
        4,
        80,
        {
            isStatic: true,
            render: {
                fillStyle: dividerColors[7]
            }
        }
    )
);

//
// 걸림 방지 경사판
//
for (let i = 0; i <= slotValues.length; i++) {

    const x = i * slotWidth;

    const leftRamp = Bodies.rectangle(
        x - 8,
        height - 95,
        20,
        4,
        {
            isStatic: true,
            angle: Math.PI / 4,
            render: {
                fillStyle: "#666"
            }
        }
    );

    const rightRamp = Bodies.rectangle(
        x + 8,
        height - 95,
        20,
        4,
        {
            isStatic: true,
            angle: -Math.PI / 4,
            render: {
                fillStyle: "#666"
            }
        }
    );

    World.add(world, [leftRamp, rightRamp]);
}

//
// 구슬 발사
//
document
    .getElementById("dropBall")
    .addEventListener("click", () => {

        const ball = Bodies.circle(
            width / 2 + (Math.random() * 100 - 50),
            40,
            10,
            {
                restitution: 0.8,
                friction: 0,
                frictionAir: 0.001,
                render: {
                    fillStyle: "#000"
                }
            }
        );

        ball.label = "ball";

        World.add(world, ball);
    });

//
// 점수 계산
//
Events.on(engine, "afterUpdate", () => {

    const bodies = Composite.allBodies(world);

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

//
// 점수 표시
//
Events.on(render, "afterRender", () => {

    const ctx = render.context;

    ctx.save();

    ctx.fillStyle = "#000";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";

    for (let i = 0; i < slotValues.length; i++) {

        const x =
            i * slotWidth +
            slotWidth / 2;

        ctx.fillText(
            slotValues[i],
            x,
            height - 15
        );
    }

    ctx.restore();
});
