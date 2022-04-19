/**
 * The code that renders the canvas, its life cycle is managed by Chart.js
 */

define([
    'stores/GameSettingsStore',
    'game-logic/clib',
    'game-logic/stateLib',
    'lodash',
    'game-logic/engine'
], function(
    GameSettingsStore,
    Clib,
    StateLib,
    _,
    Engine
){

    function Graph() {
        this.rendering = false;
        this.animRequest = null;
        this.getParentNodeFunc = null;

        this.onWindowResizeBinded = this.onWindowResize.bind(this);
        this.onChangeBinded = this.onChange.bind(this);
    }

    Graph.prototype.startRendering = function(canvasNode, getParentNodeFunc) {
        //console.log('startrender')
        this.rendering = true;
        this.getParentNodeFunc = getParentNodeFunc;

        if (!canvasNode.getContext)
            return console.error('No canvas');

        this.ctx = canvasNode.getContext('2d');
        this.ctx2 = canvasNode.getContext('2d');

        var parentNode = this.getParentNodeFunc();
        this.canvasWidth = 300;
        this.canvasHeight = 300;
        // this.canvasWidth = 280;
        // this.canvasHeight = 280;
        this.canvas = canvasNode;
        this.canvas2 = canvasNode;       
            

        this.ballRadius = 20;
        this.x = this.canvasWidth/2;
        this.y = this.canvasHeight-20;
        this.dx = 2;
        this.dy = -2; 

        this.ballRadius2 = 20;
        this.x2 = this.canvasWidth2/2;
        this.y2 = this.canvasHeight2-30;
        this.dx2 = 2;
        this.dy2 = -2; 

        //FROM PDF
        this.speed = 10;
        //this.p1 = {x:80,y:200};
        this.angle = 35;
        this.radians = 0;
        this.xunits = 0;
        this.yunits = 0;
        //this.ball = '';

        //For multiple balls
        this.tempBall;
        this.tempX;
        this.tempY;
        this.tempSpeed;
        this.tempAngle;
        this.tempRadius;
        this.tempRadians;
        this.tempXunits;
        this.tempYunits;
//         this.tempBall = {x:this.tempX,y:this.tempY,radius:this.tempRadius, speed:this.tempSpeed,
// angle:this.tempAngle, xunits:this.tempXunits, yunits:this.tempYunits}


        
        this.numBalls = 10;
        // this.maxSize = 8;
        // this.minSize = 5;
        this.maxSpeed = 10;
        this.balls = new Array(); 
        this.normX = 0;
        this.normY = 0; 

        for (var i = 0; i < this.numBalls; i++) {
            this.tempRadius = 20;

            if(i===0){
                this.xVal = this.canvasWidth / 2;
                this.yVal = this.canvasHeight - 30;
                this.dxVal = 2;
                this.dyVal = -2;
            }

            else if(i===1){
                this.xVal = this.canvasWidth / 3;
                this.yVal = this.canvasHeight - 50;
                this.dxVal = 3;
                this.dyVal = -3;
            }
            else if(i===2){
                this.xVal = this.canvasWidth / 4;
                this.yVal = this.canvasHeight - 60;
                this.dxVal = -3;
                this.dyVal = 4;
            }
            else if(i===3){
                this.xVal = this.canvasWidth / 2;
                this.yVal = this.canvasHeight / 5;
                this.dxVal = -1.5;
                this.dyVal = 3;
            }
            else if(i===4){
                this.xVal = this.canvasWidth / 2;
                this.yVal = this.canvasHeight - 35;
                this.dxVal = -2;
                this.dyVal = 4;
            }
            else if(i===5){
                this.xVal = this.canvasWidth / 1.5;
                this.yVal = this.canvasHeight - 25;
                this.dxVal = -2;
                this.dyVal = -6;
            }
            else if(i===6){
                this.xVal = this.canvasWidth / 2;
                this.yVal = this.canvasHeight - 35;
                this.dxVal = -1.5;
                this.dyVal = 3;
            }
            else if(i===7){
                this.xVal = this.canvasWidth / 3;
                this.yVal = this.canvasHeight - 60;
                this.dxVal = 3;
                this.dyVal = 3;
            }
            else if(i===8){
                this.xVal = this.canvasWidth / 4;
                this.yVal = this.canvasHeight / 5;
                this.dxVal = -6;
                this.dyVal = -4;
            }
            else if(i===9){
                this.xVal = this.canvasWidth / 5;
                this.yVal = this.canvasHeight - 75;
                this.dxVal = -2;
                this.dyVal = -5;
            }
             else{}
           
            
            this.tempX = this.tempRadius*2 + (Math.floor(Math.random()*this.CanvasWidth) -this.tempRadius*2);
            this.tempY = this.tempRadius*2 + (Math.floor(Math.random()*this.CanvasHeight) -this.tempRadius*2);     
            this.tempSpeed = this.maxSpeed-this.tempRadius;
            this.tempAngle = Math.floor(Math.random()*360);
            this.tempRadians = this.tempAngle * Math.PI/ 180;
            this.tempXunits = Math.cos(this.tempRadians) * this.tempSpeed;
            this.tempYunits = Math.sin(this.tempRadians) * this.tempSpeed;
            
            this.tempBall = {x:this.xVal,lastX:this.xVal,y:this.yVal, lastX:this.yVal, dx:this.dxVal,
            dy:this.dyVal, r:this.rVal, normX: this.normX, normY: this.normY} ;
            // this.tempBall = {x:this.tempX,y:this.tempY,radius:this.tempRadius, speed:this.tempSpeed, angle:this.tempAngle,
            // xunits:this.tempXunits, yunits:this.tempYunits} ;
            
            this.balls.push(this.tempBall);
            }
            
        // this.tempBall;
        // this.tempX;
        // this.tempY;
        // this.tempSpeed;
        // this.tempAngle;
        // this.tempRadius;
        // this.tempRadians;
        // this.tempXunits;
        // this.tempYunits;

        // this.balls = [
        //         this.getBall(this.canvasWidth/2, this.canvasHeight-20, this.dx, this.dy, 20),
        //         this.getBall(this.canvasWidth/1, this.canvasHeight-25, this.dx, this.dy, 20),
        //         this.getBall(this.canvasWidth/1.5, this.canvasHeight-30, this.dx, this.dy, 20),
                
        //     ]; 

        //console.log(this.balls);        

        this.animRequest = window.requestAnimationFrame(this.render.bind(this));
    
        
    };

    

    Graph.prototype.gameLoop = function() {
        //setTimeout(this.gameLoop(), 20);
        setTimeout(this.drawScreen(), 10);
    };
       

    Graph.prototype.drawScreen = function() {
            this.ctx.fillStyle = '#EEEEEE';
            //console.log(this.balls)
            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
           
            for (var i = 0; i <this.balls.length; i++) {

                if(i===0)
                { var color = '#bf4824'; } else if(i===1){ var color = '#d7f067'; } else if(i===2) { var color = '#249db5'; } 
                else if(i===3){ color = '#d7f067'; } else if(i===4){ color = '#d7f067'; } else if(i===5){ color = '#bf4824'; }
                else if(i===6){ color = '#249db5'; } else if(i===7){ color = '#249db5'; } else if(i===8){ color = '#249db5'; } 
                else if(i===9){ color = '#249db5'; } else { color = '#249db5'; }    
                
                this.ball = this.balls[i];        
                // this.ball.x += this.ball.xunits;
                // this.ball.y += this.ball.yunits;
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.arc(this.ball.x,this.ball.y,20,0,Math.PI*2,true);
                this.ctx.closePath();
                this.ctx.fill();

                this.ball.lastX = this.ball.x;
                this.ball.lastY = this.ball.y;
                this.ball.x += this.ball.dx;
                this.ball.y += this.ball.dy;
                var dx = this.ball.x - 150;
                var dy = this.ball.y - 150;
                if (Math.sqrt(dx * dx + dy * dy) >= 150 - 20) {
                  // current speed
                  var v = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
                  // Angle from center of large circle to center of small circle,
                  // which is the same as angle from center of large cercle
                  // to the collision point
                  var angleToCollisionPoint = Math.atan2(-dy, dx);
                  // Angle of the current movement
                  var oldAngle = Math.atan2(-this.ball.dy, this.ball.dx);
                  // New angle
                  var newAngle = 2 * angleToCollisionPoint - oldAngle;
                  // new x/y speeds, using current speed and new angle
                  this.ball.dx = -v * Math.cos(newAngle);
                  this.ball.dy = v * Math.sin(newAngle);
                }


                // if (this.ball.x > this.canvasWidth || this.ball.x < 0 ) {
                // this.ball.angle = 180 - this.ball.angle;
                // this.updateBall(this.ball);
                // } else if (this.ball.y > this.canvasHeight || this.ball.y < 0) {
                // this.ball.angle = 360 - this.ball.angle;
                // this.updateBall(this.ball);
                // }        

         }   

            //Box
            //this.ctx.strokeStyle = '#000000';
            //this.ctx.strokeRect(1, 1, this.canvasWidth-2, this.canvasHeight-2);
        //     for (var i = 0; i <this.balls.length; i++) {
        //         this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        //         this.ball = this.balls[i];
        //         this.ball.x += this.ball.dx;
        //         this.ball.y += this.ball.dy;
        //         this.ctx.fillStyle = "pink";
        //         this.ctx.beginPath();
        //         this.ctx.arc(this.ball.x,this.ball.y,15,0,Math.PI*2,true);
        //         this.ctx.closePath();
        //         this.ctx.fill();

        //         if (this.ball.x > this.canvasWidth || this.ball.x < 0 ) {
        //         this.angle = 180 - this.angle;
        //         this.updateBall();
        //         } else if (this.ball.y > this.canvasHeight || this.ball.y < 0) {
        //         this.angle = 360 - this.angle;
        //         this.updateBall();
        //         }

        //     if(this.ball.x + this.dx > this.canvasWidth-this.ballRadius || this.ball.x + this.ball.dx < this.ballRadius) {
        //     this.ball.dx = -this.ball.dx;
        //     }
        //     if(this.ball.y + this.dy > this.canvasHeight-this.ballRadius || this.ball.y + this.ball.dy < this.ballRadius) {
        //         this.ball.dy = -this.dy;
        //     }
            
        //     this.ball.x += this.ball.dx;
        //     this.ball.y += this.ball.dy;
        // }   
 };

    Graph.prototype.updateBall = function(ball) {
        ball.radians = ball.angle * Math.PI/ 180;
        ball.xunits = Math.cos(ball.radians) * ball.speed;
        ball.yunits = Math.sin(ball.radians) * ball.speed;
        };

    // Graph.prototype.getBall = function(xVal, yVal, dxVal, dyVal, rVal) {
    //             var ball = {                   
    //                 x: xVal,                    
    //                 y: yVal,                    
    //                 dx: dxVal,
    //                 dy: dyVal,
    //                 r: rVal                
    //             };

    //             return ball;
    // };

    

    Graph.prototype.draw = function(){
       
        // var ball;

        for(var i=1; i<5; i++){
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI*2);
        this.ctx.fillStyle = 'yellow';
        this.ctx.fill();        
        this.ctx.closePath();
        
        if(this.x + this.dx > this.canvasWidth-this.ballRadius || this.x + this.dx < this.ballRadius) {
            this.dx = -this.dx;
        }
        if(this.y + this.dy > this.canvasHeight-this.ballRadius || this.y + this.dy < this.ballRadius) {
            this.dy = -this.dy;
        }
        
        this.x += this.dx;
        this.y += this.dy;
       } 

        // for (var i = 0; i < this.numBalls; i++) {
        //     this.tempRadius = Math.floor(Math.random()*this.maxSize)+this.minSize;
        //     this.tempX = this.tempRadius*2 + (Math.floor(Math.random()*this.canvasWidth)-this.tempRadius*2);
        //     this.tempY = this.tempRadius*2 + (Math.floor(Math.random()*this.canvasHeight)-this.tempRadius*2);
        //     this.tempSpeed = this.maxSpeed-this.tempRadius;
        //     this.tempAngle = Math.floor(Math.random()*260);
        //     this.tempRadians = this.tempAngle * Math.PI/ 180;
        //     this.tempXunits = Math.cos(this.tempRadians) * this.tempSpeed;
        //     this.tempYunits = Math.sin(this.tempRadians) * this.tempSpeed;
        //     this.tempBall = {x:this.tempX,y:this.tempY,radius:this.tempRadius, speed:this.tempSpeed, angle:this.tempAngle,
        //     xunits:this.tempXunits, yunits:this.tempYunits}
        //     this.balls.push(this.tempBall);

                
        //     }

        // for(var j=1; j<5; j++){
            
         

        //         this.curBall = ball;
                
        //         this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        //         this.ctx.beginPath();
        //         this.ctx.arc(this.curBall.x, this.curBall.y, this.ballRadius, 0, Math.PI * 2);
        //         this.ctx.fillStyle = 'purple';
        //         this.ctx.fill();        
        //         this.ctx.closePath();
                
        //         if(this.curBall.x + this.curBall.dx > this.canvasWidth-this.ballRadius || this.curBall.x + this.curBall.dx < this.ballRadius) {
        //             this.curBall.dx = -this.curBall.dx;
        //         }
        //         if(this.curBall.y + this.curBall.dy > this.canvasHeight-this.ballRadius || this.curBall.y + this.curBall.dy < this.ballRadius) {
        //             this.curBall.dy = -this.curBall.dy;
        //         }                
                                
        //         this.curBall.x += this.curBall.dx;
        //         this.curBall.y += this.curBall.dy; 
           
                
        //  }
        
     
        // for(var i=1; i<5; i++){
            
        //         this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        //         this.ctx.beginPath();
        //         this.ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI*2);
        //         this.ctx.fillStyle = "#0095DD";
        //         this.ctx.fill();        
        //         this.ctx.closePath();
                
        //         if(this.x + this.dx > this.canvasWidth-this.ballRadius || this.x + this.dx < this.ballRadius) {
        //             this.dx = -this.dx;
        //         }
        //         if(this.y + this.dy > this.canvasHeight-this.ballRadius || this.y + this.dy < this.ballRadius) {
        //             this.dy = -this.dy;
        //         }                
                                
        //         this.x += this.dx;
        //         this.y += this.dy; 
        //     }
            
    }; 

   
    Graph.prototype.stopRendering = function() {
        //console.log('stoprender')
        //this.rendering = false;

        //GameSettingsStore.off('all', this.onChangeBinded);
        //window.removeEventListener('resize', this.onWindowResizeBinded);
    };

    Graph.prototype.onChange = function() {
        //this.theme = GameSettingsStore.getCurrentTheme();
        //this.configPlotSettings();
    };

    Graph.prototype.render = function() {
        if(!this.rendering)
            return;
        
         //setTimeout(this.draw(),10);  
        setTimeout(this.drawScreen(),100);  
        
       

        this.animRequest = window.requestAnimationFrame(this.render.bind(this));

        // this.calcGameData();
        // this.calculatePlotValues();
        // this.clean();
        //this.drawGraph();
        // this.drawAxes();
        // this.drawGameData();
        // this.animRequest = window.requestAnimationFrame(this.render.bind(this));
    };

    /** On windows resize adjust the canvas size to the canvas parent size */
    Graph.prototype.onWindowResize = function() {
        var parentNode = this.getParentNodeFunc();
        this.canvasWidth = parentNode.clientWidth;
        this.canvasHeight = parentNode.clientHeight;
        this.configPlotSettings();
    };

    Graph.prototype.configPlotSettings = function() {
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.themeWhite = (this.theme === 'black');
        this.plotWidth = this.canvasWidth - 30;
        this.plotHeight = this.canvasHeight - 20; //280
        this.xStart = this.canvasWidth - this.plotWidth;
        this.yStart = this.canvasHeight - this.plotHeight;
        this.XAxisPlotMinValue = 10000;    //10 Seconds
        this.YAxisSizeMultiplier = 2;    //YAxis is x times
        this.YAxisInitialPlotValue = "zero"; //"zero", "betSize" //TODO: ???
    };

    Graph.prototype.calcGameData = function() { //TODO: Use getGamePayout from engine.
        this.currentTime = Clib.getElapsedTimeWithLag(Engine);
        this.currentGamePayout = Clib.calcGamePayout(this.currentTime);
    };

    Graph.prototype.calculatePlotValues = function() {

        // //Plot variables
        // this.YAxisPlotMinValue = this.YAxisSizeMultiplier;
        // this.YAxisPlotValue = this.YAxisPlotMinValue;

        // this.XAxisPlotValue = this.XAxisPlotMinValue;

        // //Adjust X Plot's Axis
        // if(this.currentTime > this.XAxisPlotMinValue)
        //     this.XAxisPlotValue = this.currentTime;

        // //Adjust Y Plot's Axis
        // if(this.currentGamePayout > this.YAxisPlotMinValue)
        //     this.YAxisPlotValue = this.currentGamePayout;

        // //We start counting from cero to plot
        // this.YAxisPlotValue-=1;

        // //Graph values
        // this.widthIncrement = this.plotWidth / this.XAxisPlotValue;
        // this.heightIncrement = this.plotHeight / (this.YAxisPlotValue);
        // this.currentX = this.currentTime * this.widthIncrement;
    };

    Graph.prototype.clean = function() {
        //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };

    Graph.prototype.drawGraph = function() {

        //this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
        this.ctx.fillStyle = '#000000'
        this.ctx.beginPath()
        //this.ctx.arc(50, 100, 20*Math.sin(frameCount*0.05)**2, 0, 2*Math.PI)
        this.ctx.fill();
    };

    Graph.prototype.drawAxes = function() {

        //Function to calculate the plotting values of the Axes
        function stepValues(x) {
            console.assert(_.isFinite(x));
            var c = .4;
            var r = .1;
            while (true) {

                if (x <  c) return r;

                c *= 5;
                r *= 2;

                if (x <  c) return r;
                c *= 2;
                r *= 5;
            }
        }

        //Calculate Y Axis
        this.YAxisPlotMaxValue = this.YAxisPlotMinValue;
        this.payoutSeparation = stepValues(!this.currentGamePayout ? 1 : this.currentGamePayout);

        this.ctx.lineWidth=1;
        this.ctx.strokeStyle = (this.themeWhite? "Black" : "#b0b3c1");
        this.ctx.font="10px Verdana";
        this.ctx.fillStyle = (this.themeWhite? 'black' : "#b0b3c1");
        this.ctx.textAlign="center";

        //Draw Y Axis Values
        var heightIncrement =  this.plotHeight/(this.YAxisPlotValue);
        for(var payout = this.payoutSeparation, i = 0; payout < this.YAxisPlotValue; payout+= this.payoutSeparation, i++) {
            var y = this.plotHeight - (payout*heightIncrement);
            this.ctx.fillText((payout+1)+'x', 10, y);

            this.ctx.beginPath();
            this.ctx.moveTo(this.xStart, y);
            this.ctx.lineTo(this.xStart+5, y);
            this.ctx.stroke();

            if(i > 100) { console.log("For 3 too long"); break; }
        }

        //Calculate X Axis
        this.milisecondsSeparation = stepValues(this.XAxisPlotValue);
        this.XAxisValuesSeparation = this.plotWidth / (this.XAxisPlotValue/this.milisecondsSeparation);

        //Draw X Axis Values
        for(var miliseconds = 0, counter = 0, i = 0; miliseconds < this.XAxisPlotValue; miliseconds+=this.milisecondsSeparation, counter++, i++) {
            var seconds = miliseconds/1000;
            var textWidth = this.ctx.measureText(seconds).width;
            var x = (counter*this.XAxisValuesSeparation) + this.xStart;
            this.ctx.fillText(seconds, x - textWidth/2, this.plotHeight + 11);

            if(i > 100) { console.log("For 4 too long"); break; }
        }

        //Draw background Axis
        this.ctx.lineWidth=1;
        this.ctx.beginPath();
        this.ctx.moveTo(this.xStart, 0);
        this.ctx.lineTo(this.xStart, this.canvasHeight - this.yStart);
        this.ctx.lineTo(this.canvasWidth, this.canvasHeight - this.yStart);
        this.ctx.stroke();
    };


    Graph.prototype.drawGameData = function() {

        //One percent of canvas width
        // var onePercent = this.canvasWidth/100;
        // //Multiply it x times
        // function fontSizeNum(times) {
        //     return onePercent * times;
        // }
        // //Return the font size in pixels of one percent of the width canvas by x times
        // function fontSizePx(times) {
        //     var fontSize = fontSizeNum(times);
        //     return fontSize.toFixed(2) + 'px';
        // }

        // this.ctx.textAlign="center";
        // this.ctx.textBaseline = 'middle';

        // if(Engine.gameState === 'IN_PROGRESS') {

        //     if (StateLib.currentlyPlaying(Engine))
        //         this.ctx.fillStyle = '#7cba00';
        //     else
        //         this.ctx.fillStyle = (this.themeWhite? "black" : "#b0b3c1");

        //     this.ctx.font = fontSizePx(20) + " Verdana";
        //     this.ctx.fillText(parseFloat(this.currentGamePayout).toFixed(2) + 'x', this.canvasWidth/2, this.canvasHeight/2);
        // }

        // //If the engine enters in the room @ ENDED it doesn't have the crash value, so we don't display it
        // console.log('gamestate', Engine.gameState)
        // if(Engine.gameState === 'ENDED') {
        //     this.ctx.font = fontSizePx(15) + " Verdana";
        //     this.ctx.fillStyle = "red";
        //     this.ctx.fillText('Busted', this.canvasWidth/2, this.canvasHeight/2 - fontSizeNum(15)/2);
        //     this.ctx.fillText('@ ' + Clib.formatDecimals(Engine.tableHistory[0].game_crash/100, 2) + 'x', this.canvasWidth/2, this.canvasHeight/2 + fontSizeNum(15)/2);
        // }

        // if(Engine.gameState === 'STARTING') {
        //     const minutes = 3;
        //     const seconds = 0;
        //     this.ctx.font = fontSizePx(5) + " Verdana";
        //     this.ctx.fillStyle = "grey";
            

        //     var timeLeft = ((Engine.startTime - Date.now())/2000).toFixed(1);
            

        //     //this.ctx.fillText('Next round in '+timeLeft+'s', this.canvasWidth/2, this.canvasHeight/2);

        //     this.ctx.fillText('Timer '+timeLeft+'s', this.canvasWidth/2, this.canvasHeight/2);
        // }

        //if(this.lag) {
        //    this.ctx.fillStyle = "black";
        //    this.ctx.font="20px Verdana";
        //    this.ctx.fillText('Network Lag', 250, 250);
        //}

    };

    return Graph;
});