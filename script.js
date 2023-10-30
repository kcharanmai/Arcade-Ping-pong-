const canva = document.getElementById("canvas");
const ctx = canva.getContext('2d');
// sounds
let collide= new Audio();
let userScored= new Audio();
let compScored = new Audio();

collide.src = "collide.mp3";
compScored.src = "compScore.mp3";
userScored.src = "userScore.mp3";

// Ball object
const ball = {
    x : canva.width/2,
    y : canva.height/2,
    radius : 5,
    velocityX : 5,
    velocityY : 5,
    speed : 4,
    color : "BEIGE"
}

// User Paddle
const user = {
    x : 0, // left side of canvas
    y : (canva.height - 20)/2, // -20 the height of paddle
    width : 5,
    height : 40,
    score : 0,
    color : "BEIGE"
}

// COM Paddle
const com = {
    x : canva.width - 5, // - width of paddle
    y : (canva.height - 20)/2, // -20 the height of paddle
    width : 5,
    height : 40,
    score : 0,
    color : "BEIGE"
}

// NET
const net = {
    x : (canva.width - 2)/2,
    y : 0,
    height : 5,
    width : 1,
    color : "WHITE"
}

// draw a rectangle, will be used to draw paddles
function drawRect(x, y, w, h, color){
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// draw circle, will be used to draw the ball
function drawArc(x, y, r, color){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2,true);
    ctx.closePath();
    ctx.fill();
}
// listening to the mouse
canva.addEventListener("mousemove", getMousePos);
canva.addEventListener("touchstart", touchStart);
canva.addEventListener("touchmove", touchMove);
let touchY; // Store the Y coordinate of the touch

function touchStart(e) {
    e.preventDefault();
    touchY = e.touches[0].clientY;
}

function touchMove(e) {
    e.preventDefault();
    const newY = e.touches[0].clientY;
    const deltaY = newY - touchY;
    user.y += deltaY; // Adjust the paddle's Y position
    touchY = newY;
}

function getMousePos(evt){
    let rect = canva.getBoundingClientRect();
    let mouseY = evt.clientY - rect.top - user.height / 2; // Calculate the desired y-coordinate
    
        // Ensure the paddle stays within the canvas boundaries
        if (mouseY < 0) {
            user.y = 0;
        } else if (mouseY + user.height > canva.height) {
            user.y = canva.height - user.height;
        } else {
            user.y = mouseY;
        }
    }

// when COM or USER scores, we reset the ball
function resetBall(){
    ball.x = canva.width/2;
    ball.y = canva.height/2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 4;
}

// draw the net
function drawNet(){
    for(let i = 0; i <= canva.height; i+=15){
        drawRect(net.x, net.y + i, net.width, net.height, net.color);
    }
}

// draw text
function drawText(text,x,y){
    ctx.fillStyle = "#f5f5dc";
    ctx.font='50px "Arcade classic 2",fantasy';
    ctx.fillText(text, x, y);
}

// collision detection
function collision(b,p){
    p.top = p.y;
    p.bottom = p.y + p.height;
    p.left = p.x;
    p.right = p.x + p.width;
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;
    
    return p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top;
}
let isPaused = false;

// Function to pause the game.
function pauseGame() {
    isPaused = true;
    // Optionally, stop the game loop or perform any other actions when paused.
    clearInterval(loop);
}

// Function to resume the game.
function resumeGame() {
    isPaused = false;
    // Restart the game loop or resume any paused actions.
    loop = setInterval(game, 1000 / framePerSecond);
}
// Event listener for the pause button.
document.getElementById("pauseButton").addEventListener("click", function () {
    if (isPaused) {
        // If the game is currently paused, resume it.
        resumeGame();
        this.textContent = "Pause"; // Update the button text.
    } else {
        // If the game is currently running, pause it.
        pauseGame();
        this.textContent = "Resume"; // Update the button text.
    }
});
// Event listener for the reset button.
document.getElementById("resetButton").addEventListener("click", function () {
    resetGame();
    document.getElementById("pauseButton").textContent = "Pause"; // Reset the pause button text.
});

// Function to reset the game.
function resetGame() {
    isPaused = false;
    clearInterval(loop);

    // Reset game elements, scores, and any other game-specific variables.
    user.score = 0;
    com.score = 0;
    // Reset ball, paddles, and any other game-related variables.
    // Example: ball.x = canvas.width / 2; ball.y = canvas.height / 2; ...
    resetBall()
    // Clear the canvas.
    ctx.clearRect(0, 0, canva.width, canva.height);
    
    // Redraw the initial state of the game.
    drawing();

    // Optionally, restart the game loop or perform any other necessary setup.
    loop = setInterval(game, 1000 / framePerSecond);
}
document.getElementById("resetButton").addEventListener("click", function () {
    resetGame();
    document.getElementById("pauseButton").textContent = "Pause"; // Reset the pause button text.
});

// update function, the function that does all calculations
function update(){
    // change the score of players, if the ball goes to the left "ball.x<0" computer win, else if "ball.x > canvas.width" the user win
    if( ball.x - ball.radius < 0 ){
        com.score++;
        compScored.play();
        resetBall();
    }else if( ball.x + ball.radius > canva.width){
        user.score++;
        userScored.play();
        resetBall();
    }
    
    // the ball has a velocity
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    
    // computer plays for itself, and we must be able to beat it
    com.y += ((ball.y - (com.y + com.height/2)))*0.1;
    
    // when the ball collides with bottom and top walls we inverse the y velocity.
    if(ball.y - ball.radius < 0 || ball.y + ball.radius > canva.height){
        ball.velocityY = -ball.velocityY;
    }
    
    // we check if the paddle hit the user or the com paddle
    let player = (ball.x + ball.radius < canva.width/2) ? user : com;
    
    // if the ball hits a paddle
    if(collision(ball,player)){
        // play sound
        collide.play();
        // we check where the ball hits the paddle
        let collidePoint = (ball.y - (player.y + player.height/2));
        // normalize the value of collidePoint, we need to get numbers between -1 and 1.
        // -player.height/2 < collide Point < player.height/2
        collidePoint = collidePoint / (player.height/2);
        
        // when the ball hits the top of a paddle we want the ball, to take a -45degees angle
        // when the ball hits the center of the paddle we want the ball to take a 0degrees angle
        // when the ball hits the bottom of the paddle we want the ball to take a 45degrees
        // Math.PI/4 = 45degrees
        let angleRad = (Math.PI/4) * collidePoint;
        
        // change the X and Y velocity direction
        let direction = (ball.x + ball.radius < canva.width/2) ? 1 : -1;
        ball.velocityX = direction * ball.speed * Math.cos(angleRad); 
        ball.velocityY = ball.speed * Math.sin(angleRad);
        
        // speed up the ball everytime a paddle hits it.
        ball.speed += 0.1;
    }
}

// function for the drawing
function drawing(){
    
    // clear the canvas
    drawRect(0, 0, canva.width, canva.height, "#000");
    
    //user score to the left
    drawText(user.score,canva.width/4,canva.height/5);
    
    //Computer score to the right
    drawText(com.score,3*canva.width/4,canva.height/5);
    
    // draw the net
    drawNet();
    
    // user's paddle
    drawRect(user.x, user.y, user.width, user.height, user.color);
    
    // Computer's paddle
    drawRect(com.x, com.y, com.width, com.height, com.color);
    
    // draw the ball
    drawArc(ball.x, ball.y, ball.radius, ball.color);
}
function game(){
    update();
    drawing();
}
// number of frames per second
let framePerSecond = 50;

//call the game function 50 times every 1 Sec
let loop = setInterval(game,1000/framePerSecond);
