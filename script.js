// Programmer : Alireza Sheikholmolouki -> nerdy.pro
// Find me in facebook : facebook.com/Alireza29675
// Find me in Twitter : twitter.com/alireza29675
// Find me in G+ : https://plus.google.com/100014742747535925842
// Find me in IM : ali29675@yahoo.com
// Powered by : jCanvas Framework -> http://calebevans.me/projects/jcanvas/
// built in June 2013

/*
	AFTER THIS LINE I'LL EXPLAIN WHAT HAPPENS ON COMMENTS LIKE BELOW LINE:
	here we define some variables:
		( you can understand every variable's task by it's name and everything is clear )
*/
var bgColor = "#631201";
var lightColor = "#d54116";
var lightColorShadowed = "#c43c14";
var darkColor = "#510b01";
var centerRadius = 40;
var partsLength = 1000;
var darkPartsAngels = [
    [-60, -120],
    [-60, 0],
    [0, 60],
    [60, 120],
    [120, 180],
    [180, -120]
];
var canvasW = 800,
    canvasH = 600;
var blockLength = 30;
var groupNumber = 0;
var blockDistance = new Array(),
    interval = new Array(),
    animate = new Array();
var gameIsOver = false;
var keyPressed = false;
var patternSelected = false,
    thisPattern;
var timePassed = 0;
var framesPassed = 0;
var patternReadingCounter = 0;
var theTimerInterval;

/*
	and these are the Game Objects:
		( for example timer object, GameSpeed and arrow )
*/
// "timer" object include some methods which can start, stop and reset the game timer
var timer = {
    start: function() {
        theTimerInterval = setInterval(function() {
            timePassed++;
            timer.optimize();
        }, 10);
    },
    stop: function() {
        clearInterval(theTimerInterval);
    },
    reset: function() {
        timePassed = 0;
    },
    optimize: function() {
        var centiseconds = timePassed % 100;
        var seconds = (timePassed - centiseconds) / 100;
        var forbiddens = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        if (forbiddens.indexOf(centiseconds) != -1) centiseconds = "0" + centiseconds;
        //if( forbiddens.indexOf( seconds )!=-1 ) seconds="0"+seconds;
        $("#seconds").html(seconds);
        $("#centiseconds").html(centiseconds);
    }
};

// "GameSpeed" object can change speed of Blocks, gameRotation and FPS dynamically
// it specify in every frames how many pixels the elements should move so if the number be bigger the speed will be faster!
var GameSpeed = {
    blocks: 5,
    gameRotate: 0.6,
    gameRotationAccelaration: 0.005,
    maxGameRotatingSpeed: 40,
    FPS: 60
};

// Arrow Object with all properties
// *NOTE: arrow is the little triangle in the center of game which you can rotate it around the main hexagon
var arrow = {
    position: 0,
    angel: 0,
    rotatingDirection: "right",
    speed: 9,
    distanceFromCenter: 13,
    x: canvasW / 2,
    y: canvasH / 2 - (centerRadius + 13)
}

/*
	Patterns Array:
		-Patterns are some block group which run after each other!
		-each Block has a number from 0 to 5
	to make some new patterns at the first add a new empty array like example in line 139
	,[] then add an array and import your block group into it like this:
	,[[0,3,5],[2,3,4]] in this example we have two block group which run after each other
	*NOTE: when "Random Selection" option be selected the app proccess a random array and run it
*/
var patterns = [
    "RandomSelection", [
        [0, 2, 4],
        [1, 3, 5],
        [0, 2, 4],
        [1, 3, 5]
    ],
    [
        [1, 2, 3, 4, 5],
        [0, 1, 2, 4, 5],
        [0, 1, 3, 4],
        [5, 0, 2, 3]
    ],
    [
        [1, 2, 3, 4, 5],
        [2, 3, 4, 5, 0],
        [3, 4, 5, 0, 1],
        [0, 2, 4],
        [4, 5, 0, 1, 2],
        [5, 0, 1, 2, 3],
        [1, 3, 5],
        [0, 1, 2, 3, 4]
    ],
    [
        [0, 3],
        [1, 4],
        [2, 5],
        [1, 2, 3, 5, 0]
    ],
    [
        [4, 1],
        [4, 1],
        [4, 1],
        [0, 1, 2, 3, 5]
    ]
    // new arrays here :  ,[]
];

// evaluateXY calculates a point's XY which have a distance from center of game like "Length argument" and which have a Angel like "Alpha argument"
var evaluateXY = function(Alpha, length) {
    var x0 = canvasW / 2;
    var y0 = canvasH / 2;
    Alpha = Alpha * (Math.PI / 180);
    var Answer = {
        newX: Math.cos(Alpha) * length + x0,
        newY: Math.sin(Alpha) * length + y0
    };
    return Answer;
};

// drawTheGame is The Base Function : Start Drawing The Game
var drawTheGame = function() {
    //Here Background will add..
    $("canvas").drawRect({
        fillStyle: bgColor,
        layer: true,
        name: "BG",
        x: canvasW / 2,
        y: canvasH / 2,
        width: canvasW,
        height: canvasH
    });
    //Here Dark Part will add..(*NOTE: Parts are the big triangles which placed on background and are rotating)
    for (i = 0; i <= 5; i++) {
        var type = "light";
        var color = bgColor;
        if (i % 2 == 0) {
            type = "dark";
            color = darkColor;
        }
        drawDarkParts(i, color, type);
    }
    //Here we draw the central Hexagon..(check drawCenteralHexagon Function on line 241)
    drawCenteralHexagon();
    //Here we draw the Arrow..
    $("canvas").drawPolygon({
        layer: true,
        name: "Arrow",
        fillStyle: lightColor,
        x: canvasW / 2,
        y: canvasH / 2 - (centerRadius + arrow.distanceFromCenter),
        radius: 8,
        sides: 3,
        shadowColor: "rgba( 0,0,0,0.4 )",
        shadowX: 0,
        shadowY: 2,
        rotate: 0
    });
    //Optimize timer for starting the Game
    timer.reset();
    timer.start();
    //start animating the Game!
    animateGame();
};

/*
	( Right Key/Top Key/touching right of page )
		for clockwise movement
	And ( Left Key/Down Key/touching left of page )
		for anti-clockwise movement
	defines here..
*/
$(window).keydown(function(event) {
    var keyCode = event.keyCode;
    if (keyCode == 39 || keyCode == 38) {
        arrow.rotatingDirection = "right";
    } else if (keyCode == 37 || keyCode == 40) {
        arrow.rotatingDirection = "left";
    }
    keyPressed = true;
}).keyup(function(event) {
    keyPressed = false;
}).bind('touchstart', function(event) {
    if (event.offsetX > 400) {
        arrow.rotatingDirection = "right";
    }
    if (event.offsetX <= 400) {
        arrow.rotatingDirection = "left";
    }
    keyPressed = true;
}).bind('touchend', function() {
    keyPressed = false;
});

//Paul Irish requestAnimationFrame Function to use "requestAnimationFrame" of your browser to make softer animations in our Canvas
window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback, element) {
            window.setTimeout(callback, 1000 / 60);
    };
})();

// this function made to keep the central hexagon alway on top
var drawCenteralHexagon = function() {
    $("canvas").drawPolygon({
        layer: true,
        name: "center",
        strokeStyle: lightColor,
        strokeWidth: 4,
        fillStyle: darkColor,
        x: canvasW / 2,
        y: canvasH / 2,
        radius: centerRadius,
        sides: 6
    });
};

// a Drawing function which draw 3 dark parts of 6 main parts of page
var drawDarkParts = function(i, color, type) {
    $("canvas").drawLine({
        layer: true,
        name: type + i,
        group: type + "Group",
        x1: evaluateXY(darkPartsAngels[i][0], centerRadius).newX,
        y1: evaluateXY(darkPartsAngels[i][0], centerRadius).newY,
        x2: evaluateXY(darkPartsAngels[i][1], centerRadius).newX,
        y2: evaluateXY(darkPartsAngels[i][1], centerRadius).newY,
        x3: evaluateXY(darkPartsAngels[i][1], partsLength).newX,
        y3: evaluateXY(darkPartsAngels[i][1], partsLength).newY,
        x4: evaluateXY(darkPartsAngels[i][0], partsLength).newX,
        y4: evaluateXY(darkPartsAngels[i][0], partsLength).newY,
        closed: true,
        fillStyle: color
    });
};

// drawBlock gives number of block distane from center and the blockGroup Number and draw a new Block
var drawBlock = function(i, distance, blockGroup) {
    blockColor = lightColor;
    if (i % 2 == 1) blockColor = lightColorShadowed;
    $("canvas").drawLine({
        layer: true,
        group: "blockGroup" + blockGroup,
        x1: evaluateXY(darkPartsAngels[i][0], distance).newX,
        y1: evaluateXY(darkPartsAngels[i][0], distance).newY,
        x2: evaluateXY(darkPartsAngels[i][1], distance).newX,
        y2: evaluateXY(darkPartsAngels[i][1], distance).newY,
        x3: evaluateXY(darkPartsAngels[i][1], blockLength + distance).newX,
        y3: evaluateXY(darkPartsAngels[i][1], blockLength + distance).newY,
        x4: evaluateXY(darkPartsAngels[i][0], blockLength + distance).newX,
        y4: evaluateXY(darkPartsAngels[i][0], blockLength + distance).newY,
        closed: true,
        fillStyle: blockColor
    });
};

// draws a block Array by giving blockArray as Array, the distance from center and blockGroup Number
var drawArray = function(blockArray, distance, group) {
    for (i = 0; i <= blockArray.length - 1; i++) {
        drawBlock(blockArray[i], distance, group);
    }
    if (distance <= 65 && distance > 40) {
        checkIfGameIsOver(blockArray)
    }
    $("canvas").removeLayer("center");
    drawCenteralHexagon();
}

// draws a new BlockGroup
var drawNewBlockGroup = function(blockArray, group) {
    blockDistance[group] = 600;
    animate[group] = function() {
        $("canvas").removeLayerGroup("blockGroup" + group).drawLayers();
        drawArray(blockArray, blockDistance[group], group);
        blockDistance[group] -= GameSpeed.blocks;
        if (blockDistance[group] < 0) {
            $("canvas").removeLayerGroup("blockGroup" + group).drawLayers();
            delete animate[group];
        }
    }
    animate[group]();
}

// this function help us to rotate arrow in a certain distance from center
var rotateArrow = function() {
    if (arrow.rotatingDirection == "right") arrow.angel += arrow.speed;
    else if (arrow.rotatingDirection == "left") arrow.angel -= arrow.speed;
    if (arrow.angel < 0) arrow.angel += 360;
    else if (arrow.angel > 360) arrow.angel -= 360;
    Alpha = arrow.angel * (Math.PI / 180);
    arrow.x = canvasW / 2 + Math.sin(Alpha) * (centerRadius + arrow.distanceFromCenter);
    arrow.y = canvasH / 2 - Math.cos(Alpha) * (centerRadius + arrow.distanceFromCenter);
    $("canvas").setLayer("Arrow", {
        rotate: arrow.angel,
        x: arrow.x,
        y: arrow.y
    }).drawLayers();
    // Arrow is in which part now?
    if (arrow.angel >= 0 && arrow.angel < 30) {
        arrow.position = 0
    } else if (arrow.angel >= 30 && arrow.angel < 90) {
        arrow.position = 1
    } else if (arrow.angel >= 90 && arrow.angel < 150) {
        arrow.position = 2
    } else if (arrow.angel >= 150 && arrow.angel < 210) {
        arrow.position = 3
    } else if (arrow.angel >= 210 && arrow.angel < 270) {
        arrow.position = 4
    } else if (arrow.angel >= 270 && arrow.angel < 330) {
        arrow.position = 5
    } else if (arrow.angel >= 330 && arrow.angel < 360) {
        arrow.position = 0
    }
};

// Rotating the Game
var rotateTheGame = function() {
    $("canvas").rotateCanvas({
        rotate: GameSpeed.gameRotate,
        x: 400,
        y: 300
    }).drawLayers();
};

/*
	Start animating the game using requestAnimFrame function
	( it means that this function calls when each frame passed )
*/
var animateGame = function() {
    if (GameSpeed.gameRotate > GameSpeed.maxGameRotatingSpeed | GameSpeed.gameRotate < GameSpeed.maxGameRotatingSpeed * -1) {
        GameSpeed.gameRoate = GameSpeed.maxGameRotatingSpeed;
    }
    framesPassed++;
    if (!gameIsOver) {
        var key;
        for (key in animate) {
            if (String(Number(key)) === key && animate.hasOwnProperty(key)) {
                if (animate[key] != undefined) {
                    animate[key]();
                }
            }
        }
    }
    if (!gameIsOver && framesPassed % GameSpeed.FPS == 0) {
        groupNumber++;
        // run a new pattern from "patterns" Array in line 87
        handlePatterns(groupNumber);
    }
    rotateTheGame();
    if (keyPressed) {
        rotateArrow();
    }
    requestAnimFrame(animateGame);
};

// Handling choosing Patterns from "patterns" Array in line 87
var randomtemp = Math.floor(Math.random() * patterns.length);
var randomtemp = randomtemp == 0 ? 1 : randomtemp;
thisPattern = patterns[randomtemp];
var handlePatterns = function(groupNumber) {
    if (patternReadingCounter < thisPattern.length) {
        drawNewBlockGroup(thisPattern[patternReadingCounter], groupNumber);
    } else {
        var randomNumber = Math.floor(Math.random() * patterns.length);
        if (patterns[randomNumber] == "RandomSelection") {
            thisPattern = giveRandomPattern();
        } else {
            thisPattern = patterns[randomNumber];
        }
        patternReadingCounter = 0;
        drawNewBlockGroup(thisPattern[patternReadingCounter], groupNumber);
    }
    patternReadingCounter++;
};

// this function give an array with some blockArrays in it
var giveRandomPattern = function() {
    var temp = [];
    for (i = 1; i <= Math.floor(Math.random() * 5); i++) {
        temp.push(giveRandomArray());
    }
    return temp;
}

// this function give a random block array each time it called For example [1,3,5] or [0,1,3,4]
var giveRandomArray = function() {
    var sampleArray = [0, 1, 2, 3, 4, 5];
    var deletekey = function(array, keynum) {
        delete array[keynum];
        var temp = [];
        for (i = 0; i < array.length; i++) {
            if (array[i] !== undefined) {
                temp.push(array[i]);
            }
        }
        return temp;
    }
    // delete some keys of [0,1,2,3,4,5] to give a random block array!
    sampleArray = deletekey(sampleArray, 2);
    for (i = 1; i <= Math.floor(Math.random() * 4); i++) {
        sampleArray = deletekey(sampleArray, Math.floor(Math.random() * sampleArray.length));
    }
    return sampleArray;
}

// EveryFrame this function called to check the game is over or not!
var checkIfGameIsOver = function(blockArray) {
    for (i = 0; i <= blockArray.length - 1; i++) {
        if (blockArray[i] == arrow.position) {
            gameIsOver = true;
        }
    }
    if (gameIsOver) {
        GameOver();
    }
};

// If the Game was over this function will be called
var GameOver = function() {
    // Stopping Everything
    timer.stop();
    GameSpeed.blocks = 0;
    arrow.speed = 0;
    var record = timePassed / 100;
    var highsource = false;
    if (localStorage['record']) {
        if (localStorage['record'] > record) {} else {
            highsource = true;
        }
    } else {
        highsource = true;
    }
    if (highsource) {
        localStorage['record'] = record;
        $("#notybox").addClass('showed');
        setTimeout(function() {
            $("#notybox").removeClass('showed');
        }, 5000);
    }
    // This Triangle adds around the arrow and give it some stroke-glow!
    $("canvas").drawPolygon({
        layer: true,
        name: "ArrowHighlight",
        strokeStyle: lightColor,
        strokeWidth: 3,
        x: arrow.x,
        y: arrow.y,
        radius: 8,
        sides: 3,
        rotate: arrow.angel
    })
    // Adding an animation to make some stroke-glow for arrow after gameover..
    .animateLayer("ArrowHighlight", {
            radius: 22,
            strokeWidth: 4
        }, 200,
        function() {
            $("canvas").animateLayer("ArrowHighlight", {
                    radius: 14
                }, 50,
                function() {
                    $("canvas").animateLayer("ArrowHighlight", {
                            radius: 22,
                            strokeWidth: 5
                        }, 200,
                        function() {
                            $("canvas").animateLayer("ArrowHighlight", {
                                    radius: 14
                                }, 50,
                                function() {
                                    $("canvas").animateLayer("ArrowHighlight", {
                                            radius: 22,
                                            strokeWidth: 3
                                        }, 200,
                                        function() {
                                            $("canvas").animateLayer("ArrowHighlight", {
                                                radius: 13,
                                                strokeWidth: 2
                                            }, 50);
                                        });
                                });
                        });
                });
        });
};

//Timing Functions.. ( to change speed, to change accelaration, FPS and everyother thing in the game )
setInterval(function() {
    GameSpeed.blocks += 0.03;
    GameSpeed.gameRotate += GameSpeed.gameRotationAccelaration;
}, 1000);
setInterval(function() {
    GameSpeed.FPS -= 1;
}, 5000);
setTimeout(function() {
    GameSpeed.gameRotate *= -1;
}, 10000);
setTimeout(function() {
    GameSpeed.gameRotate *= -2;
}, 15000);
setTimeout(function() {
    GameSpeed.gameRotate *= -1;
    GameSpeed.gameRotationAccelaration *= -2;
}, 25000);
setTimeout(function() {
    GameSpeed.gameRotate *= -1;
    GameSpeed.gameRotationAccelaration *= -1;
}, 30000);
setTimeout(function() {
    GameSpeed.gameRotate *= -0.5;
    GameSpeed.gameRotationAccelaration *= 1 / 3;
}, 50000);
setTimeout(function() {
    GameSpeed.gameRotationAccelaration *= -1 / 3;
}, 60000);
setTimeout(function() {
    GameSpeed.gameRotate *= -0.7;
    GameSpeed.gameRotationAccelaration *= 1.5;
}, 70000);
setTimeout(function() {
    GameSpeed.gameRotationAccelaration *= 2;
}, 90000);
setTimeout(function() {
    GameSpeed.gameRotationAccelaration = 0.005;
}, 100000);
setTimeout(function() {
    GameSpeed.gameRotate *= -0.5;
    GameSpeed.gameRotationAccelaration = -0.005;
}, 110000);
setTimeout(function() {
    GameSpeed.gameRotationAccelaration = 0.005;
}, 130000);
setTimeout(function() {
    GameSpeed.gameRotationAccelaration = 0.03;
    GameSpeed.gameRotate *= -3;
}, 140000);
setTimeout(function() {
    GameSpeed.gameRotationAccelaration = 0;
    GameSpeed.gameRotate *= -1;
}, 150000);

// When document Fully loaded call drawTheGame to start the Game!
$(document).ready(function() {
    drawTheGame();
});