const canvasWidth = 700; 
const canvasHeight = 500; // Set the width and height of canvas;

const gameBoard = { 
    draw() { // draw canvas
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]); 
        this.interval = setInterval(updateGameBoard, 2); // update the elements and functions on canvas
    },
    clear() { // clear game parts off canvas each time the game updates
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    canvas : document.createElement("canvas")
}

let ctx; // create a variable to store the context of gameBoard

class rectangle{ // create a class that will draw rectangles onto the canvas based on addressed properties
    constructor (width, height, color, x, y, state){
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;    
        this.state = state; // the 'state' property will indicate the individual direction of each game part
        this.gameProperties = () => { // apply properties to game parts
            ctx = gameBoard.context;
            ctx.fillStyle = color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

let snake; let apple; let filler; // create variables to store game part arrays

const gameParts = () => { 
    snake = [new rectangle(30, 30, "#1c4924", getRandomNum(0, 450), getRandomNum(0, 240))];
    apple = new rectangle(30, 30, "#8b1f1f", getRandomNum(0, 450), getRandomNum(0, 240));
    filler = [new rectangle(0, 0, "white", 0, 0)]; // the placeholder for the filler array (so the browser doesn't throw an error before it's replaced with the actual filler rectangles)
    gameBoard.draw();
}

let speed = 2; // speed of snake
let arrow; // the variable that indicates which arrow key is pressed 
let onOff = true; // the variable which indicates whether or not to listen to the key event
let newArr = arrow; // the variable that indicates whether another key was pressed

const control = event => { // identify which key was pressed and assign the direction to "arrow" variable 
    if (event.keyCode == 39) {
        arrow = 'right';
    } else if (event.keyCode == 40) {
        arrow = 'down';
    } else if (event.keyCode == 38) {
        arrow = 'up';
    } else if (event.keyCode == 37) {
        arrow = 'left';
    } 

    if (newArr != arrow){  
        onOff = false;
    }
}

document.addEventListener("keydown", control); // event listener

const getRandomNum = (min, max) => { // randomizer function (to spawn the apple and the snake)
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min)
};

let connect = false; // indicates whether or not a collision has occured
let record = 0; // stores the score of game

const collision = (firstRectX, firstRectY, secondRectX, secondRectY) => { // collision detection
    for (let i = 26; i < 28; i++){ // i made this loop because otherwise the computer can't detect collision on speeds higher than 1, 
                                   //so this way if it misses a pixel then it catches the second one and so on
        let meetPoint;
        if (firstRectY - secondRectY < 28        // if collision was identified meetPoint equals true
            && firstRectY - secondRectY > -28
            && firstRectX - secondRectX < 28
            && firstRectX - secondRectX > -28
            )
            {
               meetPoint = true;
            } else {
                meetPoint = false;
            }
            
        if(meetPoint == true && firstRectX - secondRectX == -i){             // detect from which side the collision has occured
            return 'left';
        } else if (meetPoint == true && firstRectX - secondRectX == i){
            return 'right'
        } else if (meetPoint == true && firstRectY - secondRectY == -i){
            return 'down'
        } else if (meetPoint == true && firstRectY - secondRectY == i){
            return 'up'
        } else if (meetPoint == false){
            return false;
        }
    }

}

const collide = () => {

    const headVsApple = collision(snake[snake.length - 1].x, snake[snake.length - 1].y, apple.x, apple.y); // detect collision between the head of the snake and the apple
      
    if (headVsApple !== false){ // if collision has occured - then connect equals true, and the score gets +50 points
        connect = true;
        record += 50;
    } else {
        connect = false
    }
    
    document.getElementById("score").innerHTML = `Score: ${record}`; // extract the heading from html by id and display the score number near it from the 'record' variable
    
    if (headVsApple == 'left'){ // adds new snake parts depending from which side the collision between the snake and apple has occured
        snake.push(new rectangle(30, 30, "#1c4924", snake[snake.length - 1].x + 30, snake[snake.length - 1].y))
    } else if (headVsApple == 'down'){
        snake.push(new rectangle(30, 30, "#1c4924", snake[snake.length - 1].x, snake[snake.length - 1].y + 30))
    } else if (headVsApple == 'right'){
        snake.push(new rectangle(30, 30, "#1c4924", snake[snake.length - 1].x - 30, snake[snake.length - 1].y))
    } else if (headVsApple == 'up'){
        snake.push(new rectangle(30, 30, "#1c4924", snake[snake.length - 1].x, snake[snake.length - 1].y - 30))
    }

    for (let i = 0; i < snake.length; i++){ // if snake eats apple or apple collides with the snake respawn the apple
        if (connect == true || collision(snake[i].x, snake[i].y, apple.x, apple.y)){
            apple.x = getRandomNum(0, 450);
            apple.y = getRandomNum(0, 240);
        }
    }

    for (let i = 0; i < snake.length; i++){  // if snake goes off the wall, snake x and y equal to the x and y of the opposite side of the wall
        if (snake[i].x > canvasWidth + 10){
            snake[i].x = -30;
        } else if (snake[i].x < -40){
            snake[i].x = canvasWidth + 10;
        } else if (snake[i].y < -40) {
            snake[i].y = canvasHeight;
        } else if (snake[i].y > canvasHeight + 10){
            snake[i].y = -30;
        }
    }
}

let gameOver = false; // identifies if snake collided with its own tail

const movement = (move, snakeHead, snakeBody, previousTail) => {

    if (snakeHead.state == 'right' && move == 'left' && snake.length > 1      // if snake goes one direction and the player presses the opposite direction key, 
                                                                              //then the snake doesn't change its direction
        || snakeHead.state == 'left' && move == 'right' && snake.length > 1
        || snakeHead.state == 'up' && move == 'down' && snake.length > 1
        || snakeHead.state == 'down' && move == 'up' && snake.length > 1
    )
    {
        move = snakeHead.state;
    }

    for (let i = 0; i < snake.length - 3; i++){
        if (snake.length > 2 && collision(snakeHead.x, snakeHead.y, snake[i].x, snake[i].y) !== false){ // if the snake collided with its own tail, gameOver = true
            gameOver = true;
            document.getElementById("end").style.display = "block"; // display the "game over!" heading
        }
    }
    
    if (onOff == true){ // if onOff = true then listen to the key event, otherwise move in the same direction
        snakeHead.state = move;
    } else {
        snakeHead.state = snakeHead.state;
    }

    if(previousTail == undefined){ // this is just so the browser doesn't throw an error before the snake parts get looped through
        previousTail = 0;
    } else {
        previousTail = previousTail;
    }

    if (snakeBody.state == 'right' && snakeBody.x == previousTail.x || snakeBody.state == 'left' && snakeBody.x == previousTail.x){   // creates the movement of snake
        snakeBody.state = previousTail.state;
    } else if (snakeBody.state == 'up' && snakeBody.y == previousTail.y || snakeBody.state == 'down' && snakeBody.y == previousTail.y){
        snakeBody.state = previousTail.state;     // if the current snake part moves left but the previous one moves up and their x position is equal, 
                                                  //then the current part will go up as well, likewise if the current part moves down but the previous one moves right,
                                                  // and their y position is equal then the current one will go right too and so on...
    } 

    if(snake.length == 1){ // if snake has only one rectangle onOff is always true
        onOff = true;
    } else if (snakeHead.state == snake[snake.length - 2].state){ // if the head of the snake moves in the same direction as the previous part,
                                                                  //then listen to the key event, otherwise don't. I made this if statement because 
                                                                  //if you switch directions and the x or y of the head and previous part aren't the same
                                                                  //then the moving pattern logic crashes and all parts move in the same direction
        onOff = true;
        filler.push(new rectangle(30, 30, "#1c4924", snakeHead.x, snakeHead.y)); // fill the gaps in the corners of the snake pattern
    }
   
    for (let i = 0; i < filler.length; i++){ // when the tail of snake collides with the filler rectange, remove it from array
        if (snake[0].x == filler[i].x && snake[0].y == filler[i].y){
            filler.splice(filler[i], 1)
        }
    }

    if (snakeBody.state == 'right' && gameOver == false){         // move the snake part according to its state
        snakeBody.x += speed;
    } else if (snakeBody.state == 'left' && gameOver == false){
        snakeBody.x -= speed;
    } else if (snakeBody.state == 'up' && gameOver == false){
        snakeBody.y -= speed;
    } else if (snakeBody.state == 'down' && gameOver == false){
        snakeBody.y += speed;
    }
}

const updateGameBoard = () => {  // store elements and functions that need to be updated
    gameBoard.clear();
    let snakeParts = [];
    let corners = [];
    for (let i = 0; i < snake.length; i++){
        movement(arrow, snake[snake.length - 1], snake[i], snake[i + 1]);
    }
    for (let i = 0; i < snake.length; i++){
        snakeParts.push(snake[i].gameProperties())
    }
    for (let i = 0; i < filler.length; i++){
        corners.push(filler[i].gameProperties())
    }
    apple.gameProperties();
    collide();
}
