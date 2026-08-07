const URL="./my_model/";

let model;
let webcam;
let ctx;
let canvas;
let labelContainer;
let maxPredictions;

async function init(){

    const modelURL=URL+"model.json";
    const metadataURL=URL+"metadata.json";

    model=await tmPose.load(modelURL,metadataURL);

    maxPredictions=model.getTotalClasses();

    const size=Math.min(window.innerWidth,450);

    webcam=new tmPose.Webcam(size,size,true);

    await webcam.setup({
        facingMode:"environment"      // rear camera
    });

    await webcam.play();

    window.requestAnimationFrame(loop);

    canvas=document.getElementById("canvas");
    canvas.width=size;
    canvas.height=size;

    ctx=canvas.getContext("2d");

    labelContainer=document.getElementById("label-container");

    labelContainer.innerHTML="";

    for(let i=0;i<maxPredictions;i++){
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop(){

    webcam.update();

    await predict();

    window.requestAnimationFrame(loop);

}

async function predict(){

    const {pose,posenetOutput}=await model.estimatePose(webcam.canvas);

    const prediction=await model.predict(posenetOutput);

    for(let i=0;i<maxPredictions;i++){

        labelContainer.childNodes[i].innerHTML=
        prediction[i].className+
        " : "+
        (prediction[i].probability*100).toFixed(1)+"%";

    }

    drawPose(pose);

}

function drawPose(pose){

    if(webcam.canvas){

        ctx.drawImage(webcam.canvas,0,0);

        if(pose){

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

}