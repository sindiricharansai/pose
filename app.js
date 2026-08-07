const URL = "./my_model/";

let model, webcam, ctx, canvas;
let labelContainer;
let maxPredictions;

async function init() {

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const width = window.innerWidth;
    const height = window.innerHeight;

    webcam = new tmPose.Webcam(
        width,
        height,
        true
    );

    await webcam.setup({
        facingMode: "user"
    });

    await webcam.play();

    window.requestAnimationFrame(loop);

    canvas = document.getElementById("canvas");
    canvas.width = width;
    canvas.height = height;

    ctx = canvas.getContext("2d");

    labelContainer = document.getElementById("label-container");
}

async function loop() {

    webcam.update();

    await predict();

    window.requestAnimationFrame(loop);

}

async function predict() {

    const { pose, posenetOutput } =
        await model.estimatePose(webcam.canvas);

    const prediction =
        await model.predict(posenetOutput);

    let highest = prediction[0];

    prediction.forEach(p => {
        if (p.probability > highest.probability)
            highest = p;
    });

    labelContainer.innerHTML =
        `<h2>${highest.className}</h2>
         <h3>${(highest.probability * 100).toFixed(1)}%</h3>`;

    drawPose(pose);

}

function drawPose(pose) {

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.drawImage(
        webcam.canvas,
        0,
        0,
        canvas.width,
        canvas.height
    );

    if (pose) {

        tmPose.drawKeypoints(
            pose.keypoints,
            0.5,
            ctx
        );

        tmPose.drawSkeleton(
            pose.keypoints,
            0.5,
            ctx
        );

    }

}

window.onload = init;