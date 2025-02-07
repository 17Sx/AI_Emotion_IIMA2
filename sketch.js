let faceMesh;
let video;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };
let emotion = "Neutral";

function preload() {
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  createCanvas(640, 480);
  
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  faceMesh.detectStart(video, gotFaces);
}

function draw() {
  image(video, 0, 0, width, height);

  drawLips(); 
  drawEyebrows();
  detectEmotion();

  fill(255, 0, 0);
  textSize(24);
  textAlign(CENTER, CENTER);
  text(emotion, width / 2, 50);
}

function drawLips() {
  if (faces.length > 0 && faces[0].lips) {
    fill(0, 255, 0);
    for (let i = 0; i < faces[0].lips.keypoints.length; i++) {
      let lip = faces[0].lips.keypoints[i];
      circle(lip.x, lip.y, 5);
    }
  }
}

function drawEyebrows() {
  if (faces.length > 0 && faces[0].keypoints) {
    fill(0, 0, 255);
    let leftEyebrow = faces[0].keypoints.slice(46, 66);
    let rightEyebrow = faces[0].keypoints.slice(276, 296);
    for (let pt of leftEyebrow) circle(pt.x, pt.y, 5);
    for (let pt of rightEyebrow) circle(pt.x, pt.y, 5);
  }
}

function detectEmotion() {
  if (faces.length > 0 && faces[0].keypoints) {
    let keypoints = faces[0].keypoints;

    // Points des sourcils
    let leftEyebrowInner = keypoints[46]; // Point intérieur du sourcil gauche
    let leftEyebrowOuter = keypoints[55]; // Point extérieur du sourcil gauche
    let rightEyebrowInner = keypoints[276]; // Point intérieur du sourcil droit
    let rightEyebrowOuter = keypoints[285]; // Point extérieur du sourcil droit

    // Points des yeux
    let leftEyeTop = keypoints[159];
    let leftEyeBottom = keypoints[145];
    let rightEyeTop = keypoints[386];
    let rightEyeBottom = keypoints[374];

    // Points de la bouche
    let mouthTop = keypoints[13];
    let mouthBottom = keypoints[14];
    let mouthLeft = keypoints[61];
    let mouthRight = keypoints[291];

    let mouthOpen = dist(mouthTop.x, mouthTop.y, mouthBottom.x, mouthBottom.y);
    let mouthWidth = dist(mouthLeft.x, mouthLeft.y, mouthRight.x, mouthRight.y);
    let eyeOpenL = dist(leftEyeTop.x, leftEyeTop.y, leftEyeBottom.x, leftEyeBottom.y);
    let eyeOpenR = dist(rightEyeTop.x, rightEyeTop.y, rightEyeBottom.x, rightEyeBottom.y);

    // Distance verticale entre sourcils et yeux
    let leftEyebrowEyeDistance = leftEyebrowInner.y - leftEyeTop.y;
    let rightEyebrowEyeDistance = rightEyebrowInner.y - rightEyeTop.y;

    // Angle des sourcils (pour détecter s'ils sont froncés)
    let leftEyebrowAngle = (leftEyebrowOuter.y - leftEyebrowInner.y);
    let rightEyebrowAngle = (rightEyebrowOuter.y - rightEyebrowInner.y);

    console.log("Distance sourcil-œil gauche:", leftEyebrowEyeDistance);
    console.log("Angle sourcil gauche:", leftEyebrowAngle);

    // Détection des émotions
    if (mouthOpen > 15 && (eyeOpenL > 5 || eyeOpenR > 5)) {
      emotion = "Surprise 😲";
    } else if (mouthTop.y > mouthLeft.y && mouthTop.y > mouthRight.y) {
      emotion = "Sourir 😊";
    } else if (leftEyebrowAngle < -5 && rightEyebrowAngle < -5 && 
               leftEyebrowEyeDistance < 20 && rightEyebrowEyeDistance < 20) {  //Ne fonctionne pas
      emotion = "Colère 😠";
    } else {
      emotion = "Pas de sourir 😐";
    }
  }
}


function gotFaces(results) {
  faces = results;
}
